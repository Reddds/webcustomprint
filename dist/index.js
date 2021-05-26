"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
/* GET home page. */
router.get('/', (req, res, next) => {
    // Файлы наград лежат в printSrc
    // В первой строке заголовок
    const awards = [];
    fs_1.default.readdirSync(`${__dirname}/printSrc`).forEach(file => {
        const fileName = `${__dirname}/printSrc/${file}`;
        const fileId = file.replace(".", "_");
        try {
            const awardFrameTxt = fs_1.default.readFileSync(fileName, 'utf8');
            let lineBrakeLen = 2;
            let endOfFirstLine = awardFrameTxt.indexOf("\r\n");
            if (endOfFirstLine < 0) {
                endOfFirstLine = awardFrameTxt.indexOf("\n");
                lineBrakeLen = 1;
            }
            if (endOfFirstLine < 0) {
                endOfFirstLine = awardFrameTxt.indexOf("\r");
                lineBrakeLen = 1;
            }
            let titleStr = "Без названия";
            let contentStr = awardFrameTxt;
            if (endOfFirstLine > 0) {
                titleStr = awardFrameTxt.substring(0, endOfFirstLine);
                contentStr = awardFrameTxt.substring(endOfFirstLine + lineBrakeLen);
            }
            awards.push({
                filId: fileId,
                title: titleStr,
                content: contentStr
            });
        }
        catch (error) {
            console.log(`Error opening file "${fileName}"`, error);
            // yet ignore
        }
    });
    const printeds = [];
    fs_1.default.readdirSync(`${__dirname}/prints`).forEach(file => {
        const fileName = `${__dirname}/prints/${file}`;
        const fileId = file.replace(".", "_");
        try {
            const stats = fs_1.default.statSync(fileName);
            const printedTxt = fs_1.default.readFileSync(fileName, 'utf8');
            const printed = JSON.parse(printedTxt);
            // let lineBrakeLen = 2;
            // let endOfFirstLine = awardFrameTxt.indexOf("\r\n");
            // if (endOfFirstLine < 0) {
            //   endOfFirstLine = awardFrameTxt.indexOf("\n");
            //   lineBrakeLen = 1;
            // }
            // if (endOfFirstLine < 0) {
            //   endOfFirstLine = awardFrameTxt.indexOf("\r");
            //   lineBrakeLen = 1;
            // }
            const titleStr = printed.title;
            // let contentStr = awardFrameTxt;
            // if (endOfFirstLine > 0) {
            //   titleStr = awardFrameTxt.substring(0, endOfFirstLine);
            //   contentStr = awardFrameTxt.substring(endOfFirstLine + lineBrakeLen);
            // }
            printeds.push(printed);
            // printeds.push(
            //   {
            //     filId: fileId,
            //     title: titleStr,
            //     content: printedTxt
            //   }
            // )
        }
        catch (error) {
            console.log(`Error opening file "${fileName}"`, error);
            // yet ignore
        }
    });
    // console.log("awards", awards);
    res.render('index', { title: 'Печать', awards, printeds });
});
exports.default = router;
//# sourceMappingURL=index.js.map