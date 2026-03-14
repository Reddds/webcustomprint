"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const { version } = require('./package.json');
const express_1 = __importDefault(require("express"));
// import mysql from "mysql2/promise";
const sanitizer_1 = require("sanitizer");
// import * as sharp from "sharp";
const sharp_1 = __importDefault(require("sharp"));
// import { text } from 'node:stream/consumers';
const GROCY_URL = process.env.GROCY_URL;
const GROCY_API_KEY = process.env.GROCY_API_KEY;
const router = express_1.default.Router();
async function streamToString(stream) {
    const chunks = [];
    const reader = stream.getReader();
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            chunks.push(value);
        }
    }
    finally {
        reader.releaseLock();
    }
    // Вариант А — самый надёжный
    return Buffer.concat(chunks).toString('utf-8');
    // Вариант Б — если не хотите Buffer
    // const decoder = new TextDecoder('utf-8', { fatal: true });
    // return chunks.map(chunk => decoder.decode(chunk, { stream: true })).join('') +
    //        decoder.decode(); // финальный вызов без аргументов
}
// router.use((req, res, next) => {
//     console.log('ShoppingEdit Time: ', Date.now());
//     next();
// });
async function getProdGroups() {
    try {
        const response = await fetch(`${GROCY_URL}/api/objects/product_groups`, {
            method: "GET",
            headers: { "GROCY-API-KEY": GROCY_API_KEY }
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
/** Получение последнего по дате списка покупок */
async function getLastShoppingList() {
    try {
        const params = new URLSearchParams({
            "order": `row_created_timestamp:desc`,
            "limit": `1`,
        });
        const response = await fetch(`${GROCY_URL}/api/objects/shopping_lists?${params}`, {
            method: "GET",
            headers: { "GROCY-API-KEY": GROCY_API_KEY }
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        const lastShopList = (await response.json())?.[0];
        return lastShopList;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
async function getShoppingListProds(idShopList) {
    try {
        const params = new URLSearchParams({
            "query[]": `shopping_list_id=${idShopList}`,
        });
        const response = await fetch(`${GROCY_URL}/api/objects/shopping_list?${params}`, {
            method: "GET",
            headers: { "GROCY-API-KEY": GROCY_API_KEY }
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        const lastShopListProds = await response.json();
        return lastShopListProds;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
async function getShoppingListProd(idProdInList) {
    try {
        const response = await fetch(`${GROCY_URL}/api/objects/shopping_list/${idProdInList}`, {
            method: "GET",
            headers: { "GROCY-API-KEY": GROCY_API_KEY }
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        const shopListProd = await response.json();
        return shopListProd;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
async function deleteShoppingListProd(idProdInList) {
    try {
        const response = await fetch(`${GROCY_URL}/api/objects/shopping_list/${idProdInList}`, {
            method: "DELETE",
            headers: { "GROCY-API-KEY": GROCY_API_KEY }
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        return true;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
/** Добавление товара в список */
async function addShoppingListProd(shopListId, prodId, amount, quId) {
    try {
        const response = await fetch(`${GROCY_URL}/api/objects/shopping_list`, {
            method: "POST",
            headers: {
                "GROCY-API-KEY": GROCY_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: prodId,
                amount: amount,
                shopping_list_id: shopListId,
                qu_id: quId
            })
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        const shopListProdRes = await response.json();
        return shopListProdRes.created_object_id;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
async function getProds() {
    try {
        const response = await fetch(`${GROCY_URL}/api/objects/products`, {
            method: "GET",
            headers: { "GROCY-API-KEY": GROCY_API_KEY }
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
async function getProd(prodId) {
    try {
        const response = await fetch(`${GROCY_URL}/api/objects/products/${prodId}`, {
            method: "GET",
            headers: { "GROCY-API-KEY": GROCY_API_KEY }
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
/** Получить список единиц измерения */
async function getQUs() {
    try {
        const params = new URLSearchParams({
            "query[]": `active=1`,
        });
        const response = await fetch(`${GROCY_URL}/api/objects/quantity_units?${params}`, {
            method: "GET",
            headers: { "GROCY-API-KEY": GROCY_API_KEY }
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
async function getQU(id) {
    try {
        const response = await fetch(`${GROCY_URL}/api/objects/quantity_units/${id}`, {
            method: "GET",
            headers: { "GROCY-API-KEY": GROCY_API_KEY }
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
async function getProdsInGroup(groupId) {
    try {
        const params = new URLSearchParams({
            "query[]": `product_group_id=${groupId}`,
        });
        const response = await fetch(`${GROCY_URL}/api/objects/products?${params}`, {
            method: "GET",
            headers: { "GROCY-API-KEY": GROCY_API_KEY }
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
async function editProd(id, prodNewData) {
    try {
        const response = await fetch(`${GROCY_URL}/api/objects/products/${id}`, {
            method: "PUT",
            headers: {
                "GROCY-API-KEY": GROCY_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(prodNewData)
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        return true;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
async function addProd(prodNewData) {
    try {
        const response = await fetch(`${GROCY_URL}/api/objects/products`, {
            method: "POST",
            headers: {
                "GROCY-API-KEY": GROCY_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(prodNewData)
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText} ${JSON.stringify(await response.json())}`);
        }
        const addProdRes = await response.json();
        return addProdRes.created_object_id;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
async function editProdInList(id, prodInListNewData) {
    try {
        const response = await fetch(`${GROCY_URL}/api/objects/shopping_list/${id}`, {
            method: "PUT",
            headers: {
                "GROCY-API-KEY": GROCY_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(prodInListNewData)
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        return true;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
function getTimestampFilename(prefix, extension = 'txt') {
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/T/, '_') // 2026-03-11T18:35:42.123Z → 2026-03-11_18:35:42.123Z
        .replace(/\..+/, '') // убираем миллисекунды и Z
        .replace(/:/g, '-'); // 2026-03-11_18-35-42
    return `${prefix}_${timestamp}.${extension}`;
}
function toFilenameSafe(str) {
    if (!str)
        return '';
    const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
        // верхний регистр
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
        'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
        'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
    };
    let result = '';
    for (let char of str) {
        result += translitMap[char] ?? char;
    }
    // Заменяем всё опасное и лишнее
    return result
        .replace(/[^a-zA-Z0-9-_ ]/g, '') // оставляем только буквы, цифры, дефис, подчёркивание, пробел
        .replace(/\s+/g, '-') // пробелы → дефис
        .replace(/-+/g, '-') // несколько дефисов подряд → один
        .replace(/^-+|-+$/g, '') // убираем дефисы в начале и конце
        .toLowerCase();
}
function getMimeType(dataUrl) {
    const match = dataUrl.match(/^data:([^;]+);base64,/);
    return match ? match[1] : null;
}
async function uploadBase64Manual(base64String, filename, fileGroup) {
    //data:image/png;base64
    const base64Data = base64String.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filenameBase64 = Buffer.from(filename).toString("base64");
    const response = await fetch(`${GROCY_URL}/api/files/${fileGroup}/${filenameBase64}`, {
        method: 'PUT',
        headers: {
            "GROCY-API-KEY": GROCY_API_KEY,
            'accept': '*/*',
            'Content-Type': 'application/octet-stream',
            'Content-Length': buffer.length.toString()
        },
        body: buffer // buffer.toString('binary'),
        // duplex: 'half'   // обязательно в Node.js 18+
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка ${response.status}: ${errorText}`);
    }
    return true;
}
function amountToHuman(amount, name, pluralForms) {
    const n = amount;
    const needForm = (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 1 : n % 10 == 0 || (n % 10 >= 5 && n % 10 <= 9) || (n % 100 >= 11 && n % 100 <= 14) ? 2 : 3);
    let quStr = name;
    const pluFormsSpl = pluralForms.split('\n');
    switch (needForm) {
        case 0:
            quStr = name;
            break;
        case 1:
            if (pluFormsSpl?.length >= 1) {
                quStr = pluFormsSpl[0];
            }
            break;
        case 2:
            if (pluFormsSpl?.length >= 2) {
                quStr = pluFormsSpl[1];
            }
            break;
        case 3:
            if (pluFormsSpl?.length >= 3) {
                quStr = pluFormsSpl[2];
            }
            break;
    }
    return `${amount} ${quStr}`;
}
async function editProdUserFields(id, prodUserFieldsNewData) {
    try {
        const response = await fetch(`${GROCY_URL}/api/userfields/products/${id}`, {
            method: "PUT",
            headers: {
                "GROCY-API-KEY": GROCY_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(prodUserFieldsNewData)
        });
        // Проверяем, успешен ли HTTP-статус (200–299)
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
        }
        return true;
    }
    catch (err) {
        console.error("Не удалось получить данные:", err.message);
        throw err; // или return null / обработать по-своему
    }
}
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
    // if (!dbPool) {
    //     await InitMysql();
    // }
    const groups = await getProdGroups();
    const qus = await getQUs();
    const prods = await getProds(); // dbPool.query<IShopProd[]>(`SELECT Id, Name, ThumbImage, AddCountType FROM shopping_prods_prod order by Name`);
    const lastShopList = await getLastShoppingList();
    const shoppingListProds = lastShopList ? await getShoppingListProds(lastShopList.id) : null;
    const prodsByGroups = //await dbPool.query<IShopProdByGroup[]>(`SELECT * FROM shopping_prods_by_groups`);
     prods.map((p, i) => ({ Id: i, GroupId: p.product_group_id, ProdId: p.id }));
    const groupsView = [];
    groups.forEach(gr => {
        // const prodsId = prodsByGroups.filter(g => g.GroupId === gr.id).map(pg => pg.ProdId);
        const groupProds = prods
            .filter(p => p.product_group_id === gr.id) //prodsId.includes(p.id)
            .map(p => {
            // // В списке покупок может быть несколько позиций с одинаковым товаром
            // // Это не норма, но может быть для разных магазов. 
            // // TODO: Потом сделать какой-нить фильтр
            // // Пока берём первое вхождение
            // const prodInShopList = shoppingListProds?.find(pl => pl.product_id === p.id);
            // const qu = qus.find(q => q.id == (prodInShopList?.qu_id ?? p.qu_id_purchase));
            return fillProdModel(shoppingListProds, qus, p);
            // return <prodModel>{
            //     id: p.id,
            //     idInShopList: prodInShopList?.id,
            //     name: p.name,
            //     groupId: p.product_group_id,
            //     image: p.userfields.thumb_image,// p.Image,
            //     addCountTypeId: qu.id,
            //     addCountType: qu.name,
            //     addCountPluralForms: qu.plural_forms,
            //     addCountPart: p.userfields.add_part ? parseFloat(p.userfields.add_part) : null,
            //     amount: prodInShopList?.amount ? amountToHuman(prodInShopList.amount, qu.name, qu.plural_forms) : ""
            // }
        });
        // if (groupProds && groupProds.length > 0) {
        const existGrView = {
            groupId: gr.id,
            groupName: gr.name,
            prods: groupProds
        };
        groupsView.push(existGrView);
        // }
    });
    const version = "2.0";
    res.render('shopptinglistgrocy', { title: `Список покупок (${version})`, groupsView, groups, qus });
});
const decodeBase64Img = (base64String) => {
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    //   obj: ImgObj = {};
    if (matches.length !== 3) {
        throw new Error('Invalid input string');
    }
    const [, extension, base64] = matches;
    const obj = {
        type: extension,
        buffer: Buffer.from(base64, 'base64')
    };
    return obj;
    // Based on: https://stackoverflow.com/Questions/20267939/Nodejs-Write-Base64-Image-File
};
/**
 * Преобразование картинки в уменьшенную версию
 * @param imageData Картинка в виде base64 Image src
 */
async function convertToThumb(imageData) {
    const targetFormat = "webp";
    const imageBuf = decodeBase64Img(imageData);
    const buf = await (0, sharp_1.default)(imageBuf.buffer)
        .resize(64, 64, { fit: 'inside' })
        .toFormat(targetFormat)
        .toBuffer();
    return buferToBase64ImageSrc(buf, targetFormat);
}
function buferToBase64ImageSrc(buf, format) {
    return base64ToImageSrc(buf.toString('base64'), format);
}
function base64ToImageSrc(data, format) {
    return `data:${format};base64,` + data;
}
/**
 * http://192.168.88.95:3000/shoppinglist/preparedb
 */
// router.get('/preparedb', async (req, res, next) => {
//     if (!dbPool) {
//         await InitMysql();
//     }
//     const [prods, prodsFieldsExist] = await dbPool.query<IShopProd[]>(`SELECT * FROM shopping_prods_prod WHERE Image IS NOT NULL`); // AND ThumbImage IS NULL
//     // const curProd = prods[0];
//     // res.send(imageBuf.buffer);
//     // return;
//     // const targetFormat: keyof FormatEnum = "webp";
//     let convertedCount = 0;
//     // prods.forEach(curProd => {
//     for (const curProd of prods) {
//         const thumb = await convertToThumb(curProd.Image);
//         // const imageBuf = decodeBase64Img(curProd.Image);
//         // const buf = await sharp(imageBuf.buffer)
//         //     .resize(64, 64, { fit: 'inside' })
//         //     .toFormat(targetFormat)
//         //     .toBuffer();
//         // await dbPool.execute<IShopProd[]>(`UPDATE shopping_prods_prod SET ThumbImage=:thumbImage WHERE Id = ${curProd.Id}`,
//         //     { thumbImage: buferToBase64ImageSrc(buf, targetFormat) });
//         await dbPool.execute<IShopProd[]>(`UPDATE shopping_prods_prod SET ThumbImage=:thumbImage WHERE Id = ${curProd.Id}`,
//             { thumbImage: thumb });
//         convertedCount++;
//     };
//     res.send(`preparing DB. converted: ${convertedCount}`);
//     // sharp(imageBuf.buffer)
//     //     .resize(64, 64, { fit: 'inside' })
//     //     .toFormat(targetFormat)
//     //     .toBuffer()
//     //     .then(data => {
//     //         dbPool.execute<IShopProd[]>(`UPDATE shopping_prods_prod SET ThumbImage=:thumbImage WHERE Id = ${curProd.Id}`,
//     //             { thumbImage: buferToBase64ImageSrc(data, targetFormat) });
//     //         // res.send(data);
//     //         res.send(`preparing DB. Without thumb image ${curProd.Id} ${curProd.Name}: ${prods.length}`);
//     //     })
//     //     .catch(err => {
//     //         res.send(`error preparing ${curProd.Name}: ${err}`);
//     //     });
//     // return "preparing DB";
// });
router.get('/edit', async (req, res, next) => {
    // if (!dbPool) {
    //     await InitMysql();
    // }
    const groups = await getProdGroups();
    const qu = await getQUs();
    const prods = await getProds(); // dbPool.query<IShopProd[]>(`SELECT Id, Name, ThumbImage, AddCountType FROM shopping_prods_prod order by Name`);
    const lastShopList = await getLastShoppingList();
    const shoppingListProds = lastShopList ? await getShoppingListProds(lastShopList.id) : null;
    const prodsByGroups = //await dbPool.query<IShopProdByGroup[]>(`SELECT * FROM shopping_prods_by_groups`);
     prods.map((p, i) => ({ Id: i, GroupId: p.product_group_id, ProdId: p.id }));
    const groupsView = [];
    const allGroupedProdId = [];
    groups.forEach(gr => {
        const prodsId = prodsByGroups.filter(g => g.GroupId === gr.id).map(pg => pg.ProdId);
        allGroupedProdId.push(...prodsId);
        const groupProds = prods.filter(p => prodsId.includes(p.id)).map(p => {
            const prodsInShopList = shoppingListProds?.find(pl => pl.product_id === p.id);
            return {
                id: p.id,
                name: p.name,
                image: p.image,
                addCountType: qu.find(q => q.id == p.qu_id_purchase).name,
                addCountPart: p.userfields.add_part ? parseFloat(p.userfields.add_part) : null,
                // amount: prodsInShopList?.amount ?? 0
            };
        });
        const existGrView = {
            groupId: gr.id,
            groupName: gr.name,
            prods: groupProds
        };
        groupsView.push(existGrView);
    });
    const ungroupedProds = prods.filter(p => !allGroupedProdId.includes(p.id))
        .map(p => {
        const prodsInShopList = shoppingListProds?.find(pl => pl.product_id === p.id);
        return {
            id: p.id,
            name: p.name,
            image: p.image,
            addCountType: qu.find(q => q.id == p.qu_id_purchase).name,
            addCountPart: p.userfields.add_part ? parseFloat(p.userfields.add_part) : null,
            // amount: prodsInShopList?.amount ?? 0
        };
    });
    const ungrouped = {
        groupId: 0,
        groupName: "Несгруппированные",
        prods: ungroupedProds
    };
    groupsView.push(ungrouped);
    res.render('editshoppinglist', { groupsView }); //{ groups, prods, prodsByGroups }
});
function fillProdModel(shoppingListProds, qus, p) {
    // В списке покупок может быть несколько позиций с одинаковым товаром
    // Это не норма, но может быть для разных магазов. 
    // TODO: Потом сделать какой-нить фильтр
    // Пока берём первое вхождение
    const prodInShopList = shoppingListProds?.find(pl => pl.product_id === p.id);
    const qu = qus.find(q => q.id == (prodInShopList?.qu_id ?? p.qu_id_purchase));
    return {
        id: p.id,
        idInShopList: prodInShopList?.id,
        name: p.name,
        groupId: p.product_group_id,
        image: p.userfields.thumb_image,
        addCountTypeId: qu.id,
        addCountType: qu.name,
        addCountPluralForms: qu.plural_forms,
        addCountPart: p.userfields.add_part ? parseFloat(p.userfields.add_part) : null,
        amount: prodInShopList?.amount ? amountToHuman(prodInShopList.amount, qu.name, qu.plural_forms) : ""
    };
}
async function GetProdsInGroup(groupId) {
    const prods = await getProdsInGroup(groupId);
    const qus = await getQUs();
    const lastShopList = await getLastShoppingList();
    const shoppingListProds = lastShopList ? await getShoppingListProds(lastShopList.id) : null;
    const groupProds = prods.map(p => {
        return fillProdModel(shoppingListProds, qus, p);
        // return <prodModel>{
        //     id: p.id,
        //     name: p.name,
        //     image: p.userfields.thumb_image,
        //     addCountType: qu.find(q => q.id == p.qu_id_purchase).name,
        //     addCountPart: p.userfields.add_part ? parseFloat(p.userfields.add_part) : null,
        //     // amount: prodsInShopList?.amount ?? 0
        // }
    });
    return groupProds;
}
// === Загрузка кртинки из URL. А то из браузера CORS мучает ===
router.post('/loadimagefromurl', async (req, res, next) => {
    const [major, minor, patch] = process.versions.node.split('.').map(Number);
    try {
        //process.versions
        //res.send(JSON.stringify(req.body));
        // return;
        const url = (0, sanitizer_1.sanitize)(req.body.url);
        if (!fetch) {
            res.send({ success: false, nodeVer: `${major}.${minor}`, msg: "fetch not exists!" });
            return;
        }
        const fimg = await fetch(url);
        if (!fimg.ok) {
            res.send({ success: false, nodeVer: `${major}.${minor}`, url: url, error: `Ошибка HTTP: ${fimg.status} ${fimg.statusText} ${await fimg.text()}` });
            return;
        }
        //res.send({ nodeVer: `${major}.${minor}`, "fimg": JSON.stringify(fimg)});
        //return;
        // const imageBase64 = Buffer.from(await fimg.arrayBuffer()).toString('base64');
        res.send({ success: true, url, headers: JSON.stringify(fimg.headers.get("content-type")), "imageBase64": buferToBase64ImageSrc(Buffer.from(await fimg.arrayBuffer()), fimg.headers.get("content-type")) }); //`data:${fimg.headers.get("content-type")};base64,` + imageBase64 
    }
    catch (error) {
        res.send({ success: false, nodeVer: `${major}.${minor}`, errorStr: JSON.stringify(error) });
    }
});
/** Добавление одной единицы товара */
router.post('/addone', async (req, res, next) => {
    // res.send(`${req.body.id} : ${req.body.idInShopList} = ${req.body}`);
    // return;
    const prodId = req.body.id ? parseInt(req.body.id) : undefined;
    let idInShopList = req.body.idInShopList ? parseInt(req.body.idInShopList) : undefined;
    const prod = await getProd(prodId);
    const prodInList = idInShopList ? await getShoppingListProd(idInShopList) : null;
    const qu = await getQU(prodInList?.qu_id ?? prod.qu_id_purchase);
    let addPart = 1;
    if (prod.userfields.add_part) {
        addPart = parseFloat(prod.userfields.add_part);
    }
    const newAmount = (prodInList?.amount ?? 0) + addPart;
    // Если не добавлено ещё в список покупок
    if (!prodInList) {
        const lastShopList = await getLastShoppingList();
        idInShopList = await addShoppingListProd(lastShopList.id, prodId, newAmount, prod.qu_id_purchase);
    }
    else {
        const editData = {
            amount: newAmount
        };
        await editProdInList(idInShopList, editData);
    }
    res.send({
        amount: amountToHuman(newAmount, qu.name, qu.plural_forms),
        prodInListId: idInShopList
    });
});
/** Удаление товара из списка покупок */
router.post('/removefromlist', async (req, res, next) => {
    // res.send(`${req.body.id} : ${req.body.idInShopList} = ${req.body}`);
    // return;
    const prodId = req.body.id ? parseInt(req.body.id) : undefined;
    let idInShopList = req.body.idInShopList ? parseInt(req.body.idInShopList) : undefined;
    if (!idInShopList) {
        res.status(404).send("idInShopList не задан");
        return;
    }
    const deleteRes = await deleteShoppingListProd(idInShopList);
    res.send(deleteRes);
});
router.post('/addedit', async (req, res, next) => {
    // if (!dbPool) {
    //     await InitMysql();
    // }
    let logs = "__ ";
    try {
        let prodId = req.body.id ? parseInt(req.body.id) : undefined;
        const groupId = req.body.groupId ? parseInt(req.body.groupId) : undefined;
        const prodGroupId = req.body.prodGroupId ? parseInt(req.body.prodGroupId) : undefined;
        const prodName = (0, sanitizer_1.sanitize)(req.body.name);
        const imageBase64 = !!req.body.image ? (0, sanitizer_1.sanitize)(req.body.image) : null;
        const addCountType = (0, sanitizer_1.sanitize)(req.body.addCountType);
        const addCountPart = (0, sanitizer_1.sanitize)(req.body.addCountPart);
        const templateName = (0, sanitizer_1.sanitize)(req.body.templateName); //'editshoplistgroup'
        const elId = (0, sanitizer_1.sanitize)(req.body.elId);
        let thumb = undefined;
        if (imageBase64) {
            logs += "imageBase64 present ";
            thumb = await convertToThumb(imageBase64);
        }
        let message = "";
        logs += "1 ";
        if (!prodName) {
            logs += "2 ";
            res.send({ success: false, message: `Название товара должно быть не пустым\n  ${JSON.stringify(req.body)}` });
            return;
        }
        logs += "3_3 ";
        const editData = {
            name: prodName
        };
        if (addCountType) {
            editData.qu_id_purchase = parseInt(addCountType);
            editData.qu_id_stock = editData.qu_id_purchase;
        }
        logs += "3_4 ";
        if (imageBase64) {
            logs += "3_5 ";
            const mime = getMimeType(imageBase64);
            const ext = mime?.split('/').at(-1) ?? "png";
            const fileName = getTimestampFilename(toFilenameSafe(prodName), ext);
            logs += "3_6 " + fileName;
            await uploadBase64Manual(imageBase64, fileName, "productpictures");
            logs += "3_7 ";
            editData.picture_file_name = fileName;
        }
        if (prodId > 0) {
            logs += "3 ";
            // const [prods, prodsFieldsExist] = await dbPool.query<IShopProd[]>(`SELECT * FROM shopping_prods_prod WHERE Id = ${prodId}`);
            const prods = await getProds(); // dbPool.query<IShopProd[]>(`SELECT Id, Name, ThumbImage, AddCountType FROM shopping_prods_prod order by Name`);
            logs += "3_1 ";
            if (!prods || prods.length == 0) {
                logs += "3_2 ";
                message = `Не найден товар с Id=${prodId}`;
                res.send({ success: false, message: `Не найден товар с Id=${prodId}` });
                return;
            }
            // logs += "3_3 ";
            // const editData: IEditProd = {
            //     name: prodName
            // };
            await editProd(prodId, editData);
            // if (imageBase64) {
            //     await dbPool.execute<IShopProd[]>(`UPDATE shopping_prods_prod SET Name=:prodName, Image=:imageBase64, ThumbImage=:thumb, AddCountType=:addCountType WHERE Id = ${prodId}`,
            //         { prodName, imageBase64, thumb, addCountType });
            // } else {
            //     await dbPool.execute<IShopProd[]>(`UPDATE shopping_prods_prod SET Name=:prodName, AddCountType=:addCountType WHERE Id = ${prodId}`,
            //         { prodName, addCountType });
            // }
            // // Если изменилась группа
            // if (prodGroupId != groupId) {
            //     await dbPool.execute<IShopProd[]>(`UPDATE shopping_prods_by_groups SET GroupId=:prodGroupId WHERE ProdId = ${prodId}`,
            //         { prodGroupId });
            // }
            message = `Обновлён товар Id= '${prodId}' из группы Id = '${groupId}'`;
        }
        else {
            logs += "4 ";
            editData.product_group_id = prodGroupId;
            editData.location_id = 3; //!!! Захарткожена кухня!
            logs += `prodGroupId=${prodGroupId} editData=${JSON.stringify(editData)} `;
            prodId = await addProd(editData);
            // if (imageBase64) {
            //     await dbPool.execute<IShopProd[]>(`INSERT INTO shopping_prods_prod (Name, Image, ThumbImage, AddCountType) VALUES(:prodName, :imageBase64, :thumb, :addCountType)`,
            //         { prodName, imageBase64, thumb, addCountType });
            // } else {
            //     await dbPool.execute<IShopProd[]>(`INSERT INTO shopping_prods_prod (Name, AddCountType) VALUES(:prodName, :addCountType)`,
            //         { prodName, addCountType });
            // }
            // if (groupId > 0) {
            //     await dbPool.query<IShopProd[]>(`INSERT INTO shopping_prods_by_groups (GroupId, ProdId) VALUES(${groupId}, LAST_INSERT_ID())`);
            // }
            message = `Добавлен товар '${prodName}' (${prodId}) в группу Id = '${groupId}'`;
        }
        logs += "5 ";
        const userFields = {};
        let needUserFieldsUpdate = false;
        if (thumb) {
            userFields.thumb_image = thumb;
            needUserFieldsUpdate = true;
        }
        if (addCountPart) {
            const addPart = parseFloat(addCountPart);
            if (addPart > 0) {
                userFields.add_part = addPart;
                needUserFieldsUpdate = true;
            }
        }
        logs += "6 ";
        if (needUserFieldsUpdate) {
            await editProdUserFields(prodId, userFields);
        }
        logs += "7 ";
        // const group: groupViewModel = {
        //     groupId,
        //     groupName: "",
        //     prods: await GetProdsInGroup(groupId),
        //     message
        // }
        // //res.send({ success: true });
        // res.render(templateName, { tabId: elId, group });
        SendGroupRender(res, elId, templateName, groupId, message);
    }
    catch (error) {
        res.send({ success: false, message: `Error=${error.message} ${JSON.stringify(error)} (${logs})` });
        return;
    }
});
async function SendGroupRender(res, elId, templateName, groupId, message) {
    const group = {
        groupId,
        groupName: "",
        prods: await GetProdsInGroup(groupId),
        message
    };
    //res.send({ success: true });
    res.render(templateName, { tabId: elId, group });
}
// /shoppinglist/groupview/group-content-2/shoplistgroup/2
router.get('/groupview/:elId/:templateName/:groupId', async (req, res, next) => {
    SendGroupRender(res, req.params.elId, req.params.templateName, parseInt(req.params.groupId), "");
});
async function getTextFromUrl(url) {
    const resReq = await fetch(url);
    if (!resReq.ok)
        throw new Error(`HTTP ${resReq.status}`);
    return await resReq.text(); // text(resReq.body);
}
router.get('/searchimages/:searchquery', async (req, res, next) => {
    try {
        // const allText = await getTextFromUrl(`https://duckduckgo.com/?ia=images&origin=funnel_home_website&t=h_&q=${req.params.searchquery}&chip-select=search&iax=images`);
        // const re = new RegExp(/vqd=(?<vqd>[0-9-]+)/, "g");
        // const m = re.exec(allText);
        // const vqd = m[1];
        // const txtImg = await getTextFromUrl(`https://duckduckgo.com/i.js?o=json&q=mashrooms&l=wt-wt&vqd=${vqd}&p=1&ct=RU`);
        // const txtImg = await getTextFromUrl(`https://cse.google.com/cse/element/v1?rsz=20&num=20&hl=en&source=gcsc&cselibv=61bbf1f9762e96cd&cx=partner-pub-5956360965567042%3A9380749580&q=${req.params.searchquery}&safe=off&cse_tok=AEXjvhIDkSNIQ8L5Pdoh2R2yoNr8%3A1773493833113&sort=&exp=cc&fexp=121574863%2C121574862%2C73152292%2C73152290&callback=google.search.cse.api12332&rurl=https%3A%2F%2Fgibiru.com%2Fresults.html%3Fq%3D%25D0%25BC%25D0%25B0%25D0%25BA%25D0%25B0%25D1%2580%25D0%25BE%25D0%25BD%25D1%258B%26rt%3Dimage%26cx%3Dpartner-pub-5956360965567042%253A8627692578%26cof%3DFORID%253A11%26ie%3DUTF-8`);
        const txtImg = await getTextFromUrl(`https://cse.google.com/cse/element/v1?rsz=20&num=20&hl=en&source=gcsc&cselibv=61bbf1f9762e96cd&searchtype=image&cx=partner-pub-5956360965567042%3A9380749580&q=${req.params.searchquery}&safe=off&cse_tok=AEXjvhIaMzOrSo1jrAbE6mKaz9zb%3A1773497797141&exp=cc&fexp=121574863%2C121574862%2C73152292%2C73152290&callback=google.search.cse.api13409&rurl=https%3A%2F%2Fgibiru.com%2Fresults.html%3Fq%3D%25D0%25BC%25D0%25B0%25D0%25BA%25D0%25B0%25D1%2580%25D0%25BE%25D0%25BD%25D1%258B%2Bsite%253Aozon.ru%26rt%3D%26cx%3Dpartner-pub-5956360965567042%253A8627692578%26cof%3DFORID%253A11%26ie%3DUTF-8`);
        // res.send(txtImg);
        const re = new RegExp(/^\/\*O_o\*\/\s*google\.search\.cse\.api\d+\((?<jsonText>.+)\s*\);$/, "sg");
        const m = re.exec(txtImg);
        const jsonResStr = m[1];
        const jsonData = JSON.parse(jsonResStr);
        // const imgUrlArray = jsonData.results.map(r => r.richSnippet?.cseImage?.src);
        // const imgUrlArray = jsonData.results.map(r => r.richSnippet?.cseImage?.src ?? r.richSnippet?.metatags?.ogImage);
        res.send(jsonData);
    }
    catch (error) {
        res.send(error.message);
    }
});
/*
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
});*/
exports.default = router;
//# sourceMappingURL=shoppinglistgrocy.js.map