"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promise_1 = __importDefault(require("mysql2/promise"));
const sanitizer_1 = require("sanitizer");
const router = express_1.default.Router();
let dbPool;
function InitMysql() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Get mysql connection for login '${process.env.DB_LOGIN}' ...`);
            // this.dbCon = await mysql.createConnection({
            //     database: 'prods',
            //     host: "localhost",
            //     // socketPath: '/run/mysqld/mysqld.sock',
            //     user: process.env.DB_LOGIN,
            //     password: process.env.DB_PASSWORD
            // });
            dbPool = yield promise_1.default.createPool({
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
        }
        catch (error) {
            console.error(error);
        }
    });
}
// router.use((req, res, next) => {
//     console.log('ShoppingEdit Time: ', Date.now());
//     next();
// });
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield InitMysql();
    }
    const [groups, groupsFieldsExist] = yield dbPool.query(`SELECT * FROM shopping_prods_group order by Name`);
    const [prods, prodsFieldsExist] = yield dbPool.query(`SELECT * FROM shopping_prods_prod order by Name`);
    const [prodsByGroups, prodsByGroupsFieldsExist] = yield dbPool.query(`SELECT * FROM shopping_prods_by_groups`);
    const groupsView = [];
    groups.forEach(gr => {
        const prodsId = prodsByGroups.filter(g => g.GroupId === gr.Id).map(pg => pg.ProdId);
        const groupProds = prods.filter(p => prodsId.includes(p.Id)).map(p => ({
            id: p.Id,
            name: p.Name,
            image: p.Image
        }));
        if (groupProds && groupProds.length > 0) {
            const existGrView = {
                groupId: gr.Id,
                groupName: gr.Name,
                prods: groupProds
            };
            groupsView.push(existGrView);
        }
    });
    res.render('shopptinglist', { title: 'Список покупок', groupsView });
}));
router.get('/edit', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!dbPool) {
        yield InitMysql();
    }
    const [groups, groupsFieldsExist] = yield dbPool.query(`SELECT * FROM shopping_prods_group order by Name`);
    const [prods, prodsFieldsExist] = yield dbPool.query(`SELECT * FROM shopping_prods_prod order by Name`);
    const [prodsByGroups, prodsByGroupsFieldsExist] = yield dbPool.query(`SELECT * FROM shopping_prods_by_groups`);
    const groupsView = [];
    const allGroupedProdId = [];
    groups.forEach(gr => {
        const prodsId = prodsByGroups.filter(g => g.GroupId === gr.Id).map(pg => pg.ProdId);
        allGroupedProdId.push(...prodsId);
        const groupProds = prods.filter(p => prodsId.includes(p.Id)).map(p => ({
            id: p.Id,
            name: p.Name,
            image: p.Image
        }));
        const existGrView = {
            groupId: gr.Id,
            groupName: gr.Name,
            prods: groupProds
        };
        groupsView.push(existGrView);
    });
    const ungroupedProds = prods.filter(p => !allGroupedProdId.includes(p.Id)).map(p => ({
        id: p.Id,
        name: p.Name,
        image: p.Image
    }));
    const ungrouped = {
        groupId: 0,
        groupName: "Несгруппированные",
        prods: ungroupedProds
    };
    groupsView.push(ungrouped);
    res.render('editshoppinglist', { groupsView }); //{ groups, prods, prodsByGroups }
}));
function GetProdsInGroup(groupId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!dbPool) {
            yield InitMysql();
        }
        let prods;
        if (groupId > 0) {
            const [ps, prodsFieldsExist] = yield dbPool.execute(`SELECT p.Id as prodId, p.Name as prodName, p.Image as prodImage
            FROM shopping_prods_prod p
            LEFT JOIN shopping_prods_by_groups gp ON gp.ProdId = p.Id
            WHERE gp.GroupId = :groupId
            ORDER BY Name`, { groupId });
            prods = ps;
        }
        else {
            const [ps, prodsFieldsExist] = yield dbPool.execute(`SELECT p.Id as prodId, p.Name as prodName, p.Image as prodImage
            FROM shopping_prods_prod p
            LEFT JOIN shopping_prods_by_groups gp ON gp.ProdId = p.Id
            WHERE gp.GroupId IS NULL
            ORDER BY Name`);
            prods = ps;
        }
        const groupProds = prods.map(p => ({
            id: p.prodId,
            name: p.prodName,
            image: p.prodImage
        }));
        return groupProds;
    });
}
router.post('/addedit', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!dbPool) {
        yield InitMysql();
    }
    const prodId = req.body.id ? parseInt(req.body.id) : undefined;
    const groupId = req.body.groupId ? parseInt(req.body.groupId) : undefined;
    const prodName = sanitizer_1.sanitize(req.body.name);
    const imageBase64 = !!req.body.image ? sanitizer_1.sanitize(req.body.image) : null;
    let message = "";
    if (!prodName) {
        res.send({ success: false, message: `Название товара должно быть не пустым\n  ${JSON.stringify(req.body)}` });
        return;
    }
    if (prodId > 0) {
        const [prods, prodsFieldsExist] = yield dbPool.query(`SELECT * FROM shopping_prods_prod WHERE Id = ${prodId}`);
        if (!prods || prods.length == 0) {
            message = `Не найден товар с Id=${prodId}`;
            res.send({ success: false, message: `Не найден товар с Id=${prodId}` });
            return;
        }
        yield dbPool.execute(`UPDATE shopping_prods_prod SET Name=:prodName, Image=:imageBase64 WHERE Id = ${prodId}`, { prodName, imageBase64 });
        message = `Обновлён товар Id= '${prodId}' из группы Id = '${groupId}'`;
    }
    else {
        yield dbPool.execute(`INSERT INTO shopping_prods_prod (Name, Image) VALUES(:prodName, :imageBase64)`, { prodName, imageBase64 });
        if (groupId > 0) {
            yield dbPool.query(`INSERT INTO shopping_prods_by_groups (GroupId, ProdId) VALUES(${groupId}, LAST_INSERT_ID())`);
        }
        message = `Добавлен товар '${prodName}' в группу Id = '${groupId}'`;
    }
    const group = {
        groupId: groupId,
        groupName: "",
        prods: yield GetProdsInGroup(groupId),
        message
    };
    //res.send({ success: true });
    res.render('editshoplistgroup', { group });
}));
router.post('/addtogroup', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!dbPool) {
        yield InitMysql();
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
    const [prodAlreadyInGroup, prodsByGroupsFieldsExist] = yield dbPool.execute(`SELECT * FROM shopping_prods_by_groups WHERE ProdId=:prodId AND GroupId=:groupId`, { prodId, groupId });
    if (prodAlreadyInGroup && prodAlreadyInGroup.length > 0) {
        res.send({ success: false, message: `Товар (${prodId}) уже в группе (${groupId})` });
        return;
    }
    yield dbPool.query(`INSERT INTO shopping_prods_by_groups (GroupId, ProdId) VALUES(${groupId}, ${prodId})`);
    res.send({ success: true });
}));
router.post('/delete', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!dbPool) {
        yield InitMysql();
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
        yield dbPool.execute(`DELETE IGNORE FROM shopping_prods_by_groups WHERE ProdId=:prodId AND GroupId=:groupId`, { prodId, groupId });
        message = `Удалён товар Id= '${prodId}' из группы Id = '${groupId}'`;
    }
    else {
        yield dbPool.execute(`DELETE IGNORE FROM shopping_prods_prod WHERE Id=:prodId`, { prodId });
        message = `Окончательно удалён неприкаянный товар Id= '${prodId}'`;
    }
    const group = {
        groupId: groupId,
        groupName: "",
        prods: yield GetProdsInGroup(groupId),
        message
    };
    res.render('editshoplistgroup', { group });
    //res.send({ success: true });
}));
exports.default = router;
//# sourceMappingURL=shoppinglist.js.map