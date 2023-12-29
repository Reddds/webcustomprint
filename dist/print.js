"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const printerutils_1 = require("./printerutils");
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
    if (req.query.test) {
        if (req.query.test === "1") {
            testCitizenImage();
        }
    }
    res.render('print', { title: 'Печать' });
});
function testCitizenImage() {
    //! metric [02] m
    //! width [02][1B]w0800 - 80 mm
    //! [02] c 0400 - paper length for continuous 40 mm
    // font symbols [02]yS xx
    /*
    xx:
    US: ASCII
    DN: Danish
    IT: Italy
    GR: German
    FR: French
    E5: ISO 8859 Latin 5
    E2: ISO 8859 Latin 2
    E1: ISO 8859 Lain1
    DT: DeskTop
    LG: Legal
    R8: Roman-8
    PT:PC-8 TK 437T
    PM: Pc850
    WT: wINDOWS 3.1 Latin5
    W1: wINDOWS 3.1 Latin 1
    WE: wINDOWS 3.1 Latin 2
    WO: wINDOWS 3.0 Latin 1
    PE: Pc852
    PD: PC-8 D/N 437T
    PC: PC-8 437
    MC: Vacintosh
    SW: Swedish
    SP: Spanish
    UK: UK
    TS: PS Text
    PI: PI font
    */
    //! [02]KD@AB[0D]
    // "\x02KD@AB\x0D"
    // @ - 9600 8 bit no parity
    // A - thermal, no peelingsensor, no auto-cutter
    // B - continuous paper
    //! full config "\x02m\x02\1bw0800\x02c0400\x02KD@AB\x0D"
    //"\x02n\x0D\x02L\x0DD22\x0D190001001000050ABC\x0DE\x0D"
    /*
    [02] n - inches
    [02] L - start Label
    D22 set pixel size horiz and vert one dot - 0.127 mm
    190001001000050ABC - "ABC" with shmooth font 48pt
    |||||||||||||||
    |||||||||||++++- Column address 0000 - 0410 Unit 0.01 inch
    |||||||++++-row address 0000-9999 Unit 0.01 inch
    ||||+++- Size of font A06-A72 | ID 100-999 (only for font 9)
    |||+- vert expansion 1-9, A-O (10-24)
    ||+- horiz expansion 1-9, A-O (10-24)
    |+- font
    +- rotate (1,2,3,4)

    E - print
    */
    //"\x02m\x0D\x02L\x0DD22\x02ySDN\x0D190000100000000lkjвдодДЛОВАД\x0DE\x0D"
    let prn = "";
    // select command set DMI or DMW
    prn += "[02][1B]G0[0d][0a]";
    // to mm
    prn += "[02]m[0d][0a]";
    // max label length 10 cm !!!!!
    prn += "[02]M0100[0d][0a]";
    // set printing pos 30,5 mm
    prn += "[02]O0305[0d][0a]";
    // set mem switch contents (not care)
    prn += "[02]V0[0d][0a]";
    // set ejection 1 - on
    prn += "[02][1B]t1[0d][0a]";
    // peeling (cutting) position (inch | mm)
    prn += "[02]Kf0120[0d][0a]";
    // paper length for continuous
    prn += "[02]c0600[0d][0a]";
    /*graphic input
        C - currnt mem, D - onboard sd-ram
        _ - 8 bit (A - 7bit)
        P - 8bitPCX normal, B - 8bit BMP normal, i - 8bit image format normal
        gfx0 - name of file
    */
    prn += "[02]ICigfx0[0d][0a]";
    //--------------------------------------------
    prn += "[00][01][00][08][00][01][00][02][00][7f][00][7f][00][e0]";
    prn += "[00][08]"; // 8 lines
    // \x80 - start
    // \x06 - line len 
    prn += "[80][06][00][00][41][04][00][00]";
    prn += "[80][06][ff][ff][41][04][ff][ff]";
    prn += "[80][06][00][00][41][04][00][00]";
    prn += "[80][06][00][00][41][04][00][00]";
    prn += "[80][06][ff][ff][41][04][ff][ff]";
    prn += "[80][06][00][00][41][04][00][00]";
    prn += "[80][06][00][00][41][04][00][00]";
    prn += "[80][06][00][00][41][04][00][00]";
    // ending code
    prn += "[46][46][46][46]";
    // --------------------------------------------
    // printing contents setting start
    prn += "[02]L[0d][0a]";
    // pixel size
    prn += "D11[0d][0a]";
    // ?????
    prn += "A2[0d][0a]";
    prn += "1Y1100000500041gfx0[0d][0a]";
    // 1 copy
    prn += "Q0001[0d][0a]";
    // print!
    prn += "E[0d][0a]";
    // clear mem
    prn += "[02]xCGgfx0[0d][0a]";
    // ???
    prn += "[02]zC[0d][0a]";
    const prnData = (0, printerutils_1.strToNumArr)(prn);
    const dir = "prints";
    const savedFile = `${__dirname}/${dir}/print_${Date.now()}`; // "/dev/usb/lp0";
    fs_1.default.writeFileSync(savedFile, prnData);
    (0, printerutils_1.PrintRawBuf)(prnData);
}
router.post('/', (req, res, next) => {
    // console.log(req);
    // console.log(req.params);
    const action = req.body.action;
    console.log("action", action);
    const dir = action === "saveAward" ? "printSrc" : "prints";
    const savedFile = `${__dirname}/${dir}/print_${Date.now()}`; // "/dev/usb/lp0";
    const textForPrint = req.body.textForPrint;
    const printModeVal = parseInt(req.body.printMode, 10);
    const lineSpacingVal = parseInt(req.body.lineSpacing, 10);
    const charFontVal = parseInt(req.body.charFont, 10);
    const cpiModeVal = parseInt(req.body.cpiMode, 10);
    const title = req.body.title;
    console.log("printMode", req.body.printMode);
    console.log("lineSpacing", req.body.lineSpacing);
    console.log("charFont", req.body.charFont);
    console.log("cpiMode", req.body.cpiMode);
    // console.log("raw", req.body.raw);
    const raw = req.body.raw;
    const forPrint = {
        title: title !== null && title !== void 0 ? title : new Date().toISOString(),
        printMode: printModeVal, // 0x01,
        lineSpacing: lineSpacingVal, // 0
        charFont: charFontVal, // 0x01,
        cpiMode: cpiModeVal, // 0x01,
        content: textForPrint
    };
    try {
        if (raw) {
            (0, printerutils_1.PrintRaw)(raw);
            // console.log("printing raw...");
            // const fullBuf = new Uint8Array(Buffer.from(raw, 'base64'));
            // const bufWithCut = new Uint8Array([...fullBuf, ...cutAndEject]);
            // fs.writeFileSync(printerFile, bufWithCut);
        }
        else {
            fs_1.default.writeFileSync(savedFile, JSON.stringify(forPrint));
            if (action === "print") {
                (0, printerutils_1.PrintText)(textForPrint, forPrint);
                // const setupBuf = new Uint8Array([
                //     0x1b, 0x21, forPrint.printMode,
                //     0x1b, 0x33, forPrint.lineSpacing,
                //     0x1b, 0x4d, forPrint.charFont,
                //     0x1b, 0xc1, forPrint.cpiMode]);
                // // const encoder = new TextEncoder();
                // // encoder.encoding= "CP866";
                // const textBytes = cp866buffer.encode(textForPrint);
                // // const textBytes = encoder.encode(textForPrint);
                // const fullBuf = new Uint8Array([...setupBuf, ...textBytes]);
                // const bufWithCut = new Uint8Array([...fullBuf, ...cutAndEject]);
                // fs.writeFileSync(printerFile, bufWithCut);
            }
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