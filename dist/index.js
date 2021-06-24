"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
function ReadFiles(dir) {
    const printeds = [];
    fs_1.default.readdirSync(dir).forEach(file => {
        const fileName = `${dir}/${file}`;
        // const fileId = file.replace(".", "_");
        try {
            // const stats = fs.statSync(fileName);
            const printedTxt = fs_1.default.readFileSync(fileName, 'utf8');
            const printed = JSON.parse(printedTxt);
            printeds.push({ fileName: file, printed });
        }
        catch (error) {
            console.log(`Error opening file "${fileName}"`, error);
            // yet ignore
        }
    });
    return printeds;
}
/* GET home page. */
router.get('/', (req, res, next) => {
    const awards = ReadFiles(`${__dirname}/printSrc`);
    const printeds = ReadFiles(`${__dirname}/prints`);
    res.render('index', { title: 'Печать', awards, printeds });
});
router.delete('/', (req, res, next) => {
    // console.log(req.body);
    try {
        const fileName = req.body.fileName;
        if (!/\w+/.test(fileName)) {
            res.json({
                success: false,
                message: `File name error`
            });
            return;
        }
        const filePath = `${__dirname}/prints/${fileName}`;
        fs_1.default.unlinkSync(filePath);
        res.json({
            success: true,
            fileName
        });
    }
    catch (error) {
        res.json({
            success: false,
            message: error
        });
    }
});
exports.default = router;
//# sourceMappingURL=index.js.map