"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const node_cp866buffer_1 = __importDefault(require("node-cp866buffer"));
const router = express_1.default.Router();
/* GET home page. */
router.get('/', (req, res, next) => {
    res.send('Результат печати');
    // res.render('print', { title: 'Печать' });
});
router.post('/', (req, res, next) => {
    // console.log(req);
    // console.log(req.params);
    const savedFile = `${__dirname}/prints/print_${Date.now()}`; // "/dev/usb/lp0";
    const printerFile = "/dev/usb/lp0";
    const textForPrint = req.body.textForPrint;
    const setupBuf = new Uint8Array([0x1b, 0x21, 0x01, 0x1b, 0x33, 0x00, 0x1b, 0x4d, 0x01, 0x1b, 0xc1, 0x01]);
    const cutAndEject = new Uint8Array([0x0a, 0x1b, 0x69, 0x1d, 0x65, 0x05]);
    try {
        const encoder = new TextEncoder();
        // encoder.encoding= "CP866";
        const textBytes = node_cp866buffer_1.default.encode(textForPrint);
        // const textBytes = encoder.encode(textForPrint);
        const fullBuf = new Uint8Array([...setupBuf, ...textBytes]);
        fs_1.default.writeFileSync(savedFile, fullBuf);
        const bufWithCut = new Uint8Array([...fullBuf, ...cutAndEject]);
        fs_1.default.writeFileSync(printerFile, bufWithCut);
        // fs.writeFileSync(printerFile, cutAndEject);
        /*const command = `${__dirname}/printFile ${printerFile} ${__dirname}/CutAndEject`;
        console.log("command", command);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });*/
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