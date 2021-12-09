"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
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