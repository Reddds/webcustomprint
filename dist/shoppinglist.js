"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// const groups: groupModel[] = [
//     { id: 0, name: "МЯСО И РЫБА" },
//     { id: 1, name: "ФРУКТЫ И ОВОЩИ" },
//     { id: 2, name: "ХЛЕБОБУЛОЧНЫЕ" },
//     { id: 3, name: "СОУСЫ" },
//     { id: 4, name: "СПЕЦИИ" },
//     { id: 5, name: "БАКАЛЕЯ" },
//     { id: 6, name: "КОНСЕРВЫ" },
//     { id: 7, name: "ЗАМОРОЖЕННЫЕ ПРОДУКТЫ" },
//     { id: 8, name: "БЫТ" },
//     { id: 9, name: "КОСМЕТИКА" },
//     { id: 10, name: "ЖИВОТНЫМ" },
//     { id: 11, name: "КАНЦТОВАРЫ" },
// ];
// const prods: prodModel[] = [
//     { id: 0, groupId: 0, name: "Бедро куриное без кости" },
//     { id: 200, groupId: 2, name: "Батон", image: "baton" },
//     { id: 201, groupId: 2, name: "Чёрный", image: "hleb" },
// ];
router.get('/', (req, res, next) => {
    const jsonStr = fs_1.default.readFileSync(`${__dirname}/prods.json`, "utf-8");
    const prodsDump = JSON.parse(jsonStr);
    const groups = prodsDump.groups;
    const prods = prodsDump.prods;
    function getGroupById(groupId) {
        return groups.find(g => g.id === groupId);
    }
    const groupsView = [];
    prods.forEach(prod => {
        const group = getGroupById(prod.groupId);
        let existGrView = groupsView.find(g => g.groupId === prod.groupId);
        if (existGrView == null) {
            existGrView = {
                groupId: prod.groupId,
                groupName: group.name,
                prods: []
            };
            groupsView.push(existGrView);
        }
        existGrView.prods.push(prod);
    });
    res.render('shopptinglist', { title: 'Список покупок', groupsView });
});
exports.default = router;
//# sourceMappingURL=shoppinglist.js.map