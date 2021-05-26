"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const node_cp866buffer_1 = __importDefault(require("node-cp866buffer"));
/*if (!Date.prototype.toISOString) {
    (() => {

        function pad(num) {
            if (num < 10) {
                return '0' + num;
            }
            return num;
        }

        Date.prototype.toISOString = function () {
            return this.getUTCFullYear() +
                '-' + pad(this.getUTCMonth() + 1) +
                '-' + pad(this.getUTCDate()) +
                'T' + pad(this.getUTCHours()) +
                ':' + pad(this.getUTCMinutes()) +
                ':' + pad(this.getUTCSeconds()) +
                '.' + (this.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
                'Z';
        };

    })();
}*/
const router = express_1.default.Router();
/* GET home page. */
router.get('/', (req, res, next) => {
    res.send('Результат печати');
    // res.render('print', { title: 'Печать' });
});
router.post('/', (req, res, next) => {
    // console.log(req);
    // console.log(req.params);
    const action = req.body.action;
    console.log("action", action);
    const dir = action === "saveAward" ? "printSrc" : "prints";
    const savedFile = `${__dirname}/${dir}/print_${Date.now()}`; // "/dev/usb/lp0";
    const printerFile = "/dev/usb/lp0";
    const textForPrint = req.body.textForPrint;
    const cutAndEject = new Uint8Array([0x0a, 0x1b, 0x69, 0x1d, 0x65, 0x05]);
    const printModeVal = parseInt(req.body.printMode, 10);
    const lineSpacingVal = parseInt(req.body.lineSpacing, 10);
    const charFontVal = parseInt(req.body.charFont, 10);
    const cpiModeVal = parseInt(req.body.cpiMode, 10);
    const title = req.body.title;
    console.log("printMode", req.body.printMode);
    console.log("lineSpacing", req.body.lineSpacing);
    console.log("charFont", req.body.charFont);
    console.log("cpiMode", req.body.cpiMode);
    const forPrint = {
        title: title !== null && title !== void 0 ? title : new Date().toISOString(),
        printMode: printModeVal,
        lineSpacing: lineSpacingVal,
        charFont: charFontVal,
        cpiMode: cpiModeVal,
        content: textForPrint
    };
    try {
        fs_1.default.writeFileSync(savedFile, JSON.stringify(forPrint));
        if (action === "print") {
            const setupBuf = new Uint8Array([
                0x1b, 0x21, forPrint.printMode,
                0x1b, 0x33, forPrint.lineSpacing,
                0x1b, 0x4d, forPrint.charFont,
                0x1b, 0xc1, forPrint.cpiMode
            ]);
            // const encoder = new TextEncoder();
            // encoder.encoding= "CP866";
            const textBytes = node_cp866buffer_1.default.encode(textForPrint);
            // const textBytes = encoder.encode(textForPrint);
            const fullBuf = new Uint8Array([...setupBuf, ...textBytes]);
            const bufWithCut = new Uint8Array([...fullBuf, ...cutAndEject]);
            fs_1.default.writeFileSync(printerFile, bufWithCut);
        }
    }
    catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: 'Ошибка ' + err.name + ":" + err.message + "\n" + err.stack
        });
        return;
    }
    res.json({
        success: true,
    });
    // res.render('print', { title: 'Печать' });
});
exports.default = router;
//# sourceMappingURL=print.js.map