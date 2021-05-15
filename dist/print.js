"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
/* GET home page. */
router.get('/', (req, res, next) => {
    res.send('Результат печати');
    // res.render('print', { title: 'Печать' });
});
router.post('/', (req, res, next) => {
    // console.log(req);
    // console.log(req.params);
    res.json({
        name: `Результат печати POST\n${req.body.textForPrint}`,
        time: "12:00"
    });
    // res.render('print', { title: 'Печать' });
});
exports.default = router;
//# sourceMappingURL=print.js.map