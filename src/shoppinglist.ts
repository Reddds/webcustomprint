import express from 'express';
import fs, { fdatasync, PathLike } from "fs";
import mysql from "mysql2/promise";
import { sanitize } from "sanitizer";

const router = express.Router();

let dbPool: mysql.Pool;


async function InitMysql() {
    try {
        console.log(`Get mysql connection for login '${process.env.DB_LOGIN}' ...`);
        // this.dbCon = await mysql.createConnection({
        //     database: 'prods',
        //     host: "localhost",
        //     // socketPath: '/run/mysqld/mysqld.sock',
        //     user: process.env.DB_LOGIN,
        //     password: process.env.DB_PASSWORD
        // });

        dbPool = await mysql.createPool({
            connectionLimit: 20,
            database: 'prods',
            host: "localhost",
            user: process.env.DB_LOGIN,
            password: process.env.DB_PASSWORD,
            namedPlaceholders: true
        });

        // this.dbCon.connect((err) => {
        //     if (err)
        //         throw err;
        //     console.log("Connected!");
        // });
    } catch (error) {
        console.error(error);
    }


}

type prodModel = {
    id: number,
    groupId: number,
    name: string,
    image?: string,
    /** 
     * Тип добавление количества 
     * undefined | 0 - поштучно
     * 1 - Прибавление по 100 гр
     * 2 - Прибавление по 500 гр
     * */
    addCountType?: number
}

// type prodViewModel = {

//     id: number,
//     groupId: number,
//     groupName: string,
//     name: string
// }

type groupModel = {
    id: number,
    name: string
}

type groupViewModel = {
    groupId: number,
    groupName: string,
    prods: prodModel[],
    message?: string
}

type prodsDumpModel = {
    groups: groupModel[],
    prods: prodModel[]
}

// router.use((req, res, next) => {
//     console.log('ShoppingEdit Time: ', Date.now());
//     next();
// });

router.get('/', async (req, res, next) => {

    /*const jsonStr = fs.readFileSync(`${__dirname}/prods.json`, "utf-8");
    const prodsDump: prodsDumpModel = JSON.parse(jsonStr);
    const groups = prodsDump.groups;
    const prods = prodsDump.prods;


    function getGroupById(groupId: number) {
        return groups.find(g => g.id === groupId);
    }


    const groupsView: groupViewModel[] = [];
    prods.forEach(prod => {
        const group = getGroupById(prod.groupId);
        let existGrView = groupsView.find(g => g.groupId === prod.groupId);
        if (existGrView == null) {
            existGrView = {
                groupId: prod.groupId,
                groupName: group.name,
                prods: []
            }
            groupsView.push(existGrView);
        }
        existGrView.prods.push(prod);
    });

*/
    if (!dbPool) {
        await InitMysql();
    }
    const [groups, groupsFieldsExist] = await dbPool.query<IShopCategory[]>(`SELECT * FROM shopping_prods_group order by Name`);
    const [prods, prodsFieldsExist] = await dbPool.query<IShopProd[]>(`SELECT * FROM shopping_prods_prod order by Name`);
    const [prodsByGroups, prodsByGroupsFieldsExist] = await dbPool.query<IShopProdByGroup[]>(`SELECT * FROM shopping_prods_by_groups`);

    const groupsView: groupViewModel[] = [];
    groups.forEach(gr => {
        const prodsId = prodsByGroups.filter(g => g.GroupId === gr.Id).map(pg => pg.ProdId);
        const groupProds = prods.filter(p => prodsId.includes(p.Id)).map(p => <prodModel>{
            id: p.Id,
            name: p.Name,
            image: p.Image,
            addCountType: p.AddCountType
        });

        if (groupProds && groupProds.length > 0) {
            const existGrView: groupViewModel = {
                groupId: gr.Id,
                groupName: gr.Name,
                prods: groupProds
            }
            groupsView.push(existGrView);
        }
    });



    res.render('shopptinglist', { title: 'Список покупок', groupsView });
});

interface IShopCategory extends mysql.RowDataPacket {
    Id: number;
    Name: string;
    Image: string;
}

interface IShopProd extends mysql.RowDataPacket {
    Id: number;
    Name: string;
    Image: string;
    AddCountType: number | undefined;
}

interface IShopProdByGroup extends mysql.RowDataPacket {
    Id: number;
    GroupId: number;
    ProdId: number;
}



router.get('/edit', async (req, res, next) => {
    if (!dbPool) {
        await InitMysql();
    }

    const [groups, groupsFieldsExist] = await dbPool.query<IShopCategory[]>(`SELECT * FROM shopping_prods_group order by Name`);
    const [prods, prodsFieldsExist] = await dbPool.query<IShopProd[]>(`SELECT * FROM shopping_prods_prod order by Name`);
    const [prodsByGroups, prodsByGroupsFieldsExist] = await dbPool.query<IShopProdByGroup[]>(`SELECT * FROM shopping_prods_by_groups`);

    const groupsView: groupViewModel[] = [];
    const allGroupedProdId: number[] = [];
    groups.forEach(gr => {
        const prodsId = prodsByGroups.filter(g => g.GroupId === gr.Id).map(pg => pg.ProdId);
        allGroupedProdId.push(...prodsId);
        const groupProds = prods.filter(p => prodsId.includes(p.Id)).map(p => <prodModel>{
            id: p.Id,
            name: p.Name,
            image: p.Image,
            addCountType: p.AddCountType
        });

        const existGrView: groupViewModel = {
            groupId: gr.Id,
            groupName: gr.Name,
            prods: groupProds
        }
        groupsView.push(existGrView);

    });

    const ungroupedProds = prods.filter(p => !allGroupedProdId.includes(p.Id)).map(p => <prodModel>{
        id: p.Id,
        name: p.Name,
        image: p.Image,
        addCountType: p.AddCountType
    });
    const ungrouped: groupViewModel = {
        groupId: 0,
        groupName: "Несгруппированные",
        prods: ungroupedProds
    }
    groupsView.push(ungrouped);

    res.render('editshoppinglist', { groupsView }); //{ groups, prods, prodsByGroups }
});

async function GetProdsInGroup(groupId: number): Promise<prodModel[]> {
    if (!dbPool) {
        await InitMysql();
    }

    let prods: IShopProd[];
    if (groupId > 0) {
        const [ps, prodsFieldsExist] = await dbPool.execute<IShopProd[]>(
            `SELECT p.Id as prodId, p.Name as prodName, p.Image as prodImage, p.AddCountType as prodAddCountType
            FROM shopping_prods_prod p
            LEFT JOIN shopping_prods_by_groups gp ON gp.ProdId = p.Id
            WHERE gp.GroupId = :groupId
            ORDER BY Name`,
            { groupId }
        );
        prods = ps;
    } else {
        const [ps, prodsFieldsExist] = await dbPool.execute<IShopProd[]>(
            `SELECT p.Id as prodId, p.Name as prodName, p.Image as prodImage, p.AddCountType as prodAddCountType
            FROM shopping_prods_prod p
            LEFT JOIN shopping_prods_by_groups gp ON gp.ProdId = p.Id
            WHERE gp.GroupId IS NULL
            ORDER BY Name`
        );
        prods = ps;
    }

    const groupProds = prods.map(p => <prodModel>{
        id: p.prodId,
        name: p.prodName,
        image: p.prodImage,
        addCountType: p.prodAddCountType ?? 0
    });

    return groupProds;
}

/** Загрузка кртинки из URL. А то из браузера CORS мучает */
router.post('/loadimagefromurl', async (req, res, next) => {
    try {
        const url = sanitize(req.body.url);
        let fimg = await fetch(url);
        const imageBase64 = Buffer.from(await fimg.arrayBuffer()).toString('base64');
        res.send(imageBase64);     
    } catch (error) {
        res.send(error);
    }
});

router.post('/addedit', async (req, res, next) => {
    if (!dbPool) {
        await InitMysql();
    }

    const prodId = req.body.id ? parseInt(req.body.id) : undefined;
    const groupId = req.body.groupId ? parseInt(req.body.groupId) : undefined;
    const prodName = sanitize(req.body.name);
    const imageBase64 = !!req.body.image ? sanitize(req.body.image) : null;
    const addCountType = sanitize(req.body.addCountType);
    const templateName = sanitize(req.body.templateName); //'editshoplistgroup'

    let message = "";

    if (!prodName) {
        res.send({ success: false, message: `Название товара должно быть не пустым\n  ${JSON.stringify(req.body)}` });
        return;
    }

    if (prodId > 0) {
        const [prods, prodsFieldsExist] = await dbPool.query<IShopProd[]>(`SELECT * FROM shopping_prods_prod WHERE Id = ${prodId}`);

        if (!prods || prods.length == 0) {
            message = `Не найден товар с Id=${prodId}`;
            res.send({ success: false, message: `Не найден товар с Id=${prodId}` });
            return;
        }

        await dbPool.execute<IShopProd[]>(`UPDATE shopping_prods_prod SET Name=:prodName, Image=:imageBase64, AddCountType=:addCountType WHERE Id = ${prodId}`,
            { prodName, imageBase64, addCountType });
        message = `Обновлён товар Id= '${prodId}' из группы Id = '${groupId}'`;
    } else {
        await dbPool.execute<IShopProd[]>(`INSERT INTO shopping_prods_prod (Name, Image, AddCountType) VALUES(:prodName, :imageBase64, :addCountType)`,
            { prodName, imageBase64, addCountType });
        if (groupId > 0) {
            await dbPool.query<IShopProd[]>(`INSERT INTO shopping_prods_by_groups (GroupId, ProdId) VALUES(${groupId}, LAST_INSERT_ID())`);
        }
        message = `Добавлен товар '${prodName}' в группу Id = '${groupId}'`;
    }

    const group: groupViewModel = {
        groupId: groupId,
        groupName: "",
        prods: await GetProdsInGroup(groupId),
        message
    }

    //res.send({ success: true });

    res.render(templateName, { group });
});

router.post('/addtogroup', async (req, res, next) => {
    if (!dbPool) {
        await InitMysql();
    }

    const prodId = req.body.id ? parseInt(req.body.id) : undefined;
    const groupId = req.body.groupId ? parseInt(req.body.groupId) : undefined;

    if (!prodId) {
        res.send({ success: false, message: `Не указан Id товара` });
        return;
    }

    if (!groupId) {
        res.send({ success: false, message: `Не указан Id группы` });
        return;
    }

    const [prodAlreadyInGroup, prodsByGroupsFieldsExist] = await dbPool.execute<IShopProdByGroup[]>(
        `SELECT * FROM shopping_prods_by_groups WHERE ProdId=:prodId AND GroupId=:groupId`,
        { prodId, groupId });

    if (prodAlreadyInGroup && prodAlreadyInGroup.length > 0) {
        res.send({ success: false, message: `Товар (${prodId}) уже в группе (${groupId})` });
        return;
    }

    await dbPool.query<IShopProd[]>(`INSERT INTO shopping_prods_by_groups (GroupId, ProdId) VALUES(${groupId}, ${prodId})`);

    res.send({ success: true });

});

router.post('/delete', async (req, res, next) => {
    if (!dbPool) {
        await InitMysql();
    }

    const prodId = req.body.id ? parseInt(req.body.id) : undefined;
    const groupId = req.body.groupId ? parseInt(req.body.groupId) : undefined;

    if (!prodId) {
        res.send({ success: false, message: `Не указан Id товара!` });
        return;
    }

    let message = "";

    // Удаляем из текущей группы.
    // Товар остаётся неприкаянным
    // Если товар уже без групп, то удаляется полностью
    if (groupId > 0) {
        await dbPool.execute<IShopProd[]>(`DELETE IGNORE FROM shopping_prods_by_groups WHERE ProdId=:prodId AND GroupId=:groupId`,
            { prodId, groupId });
        message = `Удалён товар Id= '${prodId}' из группы Id = '${groupId}'`;
    } else {
        await dbPool.execute<IShopProd[]>(`DELETE IGNORE FROM shopping_prods_prod WHERE Id=:prodId`,
            { prodId });

        message = `Окончательно удалён неприкаянный товар Id= '${prodId}'`;
    }

    const group: groupViewModel = {
        groupId: groupId,
        groupName: "",
        prods: await GetProdsInGroup(groupId),
        message
    }


    res.render('editshoplistgroup', { group });

    //res.send({ success: true });
});

export default router;