import express from 'express';
import fs from "fs";
import { printedModel, PrintRaw, PrintText } from "./printerutils";



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


const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('print', { title: 'Печать' });
});



router.post('/', (req, res, next) => {
    // console.log(req);
    // console.log(req.params);
    const action = req.body.action;
    console.log("action", action);
    const dir = action === "saveAward" ? "printSrc" : "prints";
    const savedFile = `${__dirname}/${dir}/print_${Date.now()}`;// "/dev/usb/lp0";
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

    const forPrint: printedModel = {
        title: title ?? new Date().toISOString(),
        printMode: printModeVal,// 0x01,
        lineSpacing: lineSpacingVal, // 0
        charFont: charFontVal, // 0x01,
        cpiMode: cpiModeVal, // 0x01,
        content: textForPrint
    }

    try {

        if (raw) {
            PrintRaw(raw);
            // console.log("printing raw...");
            // const fullBuf = new Uint8Array(Buffer.from(raw, 'base64'));
            // const bufWithCut = new Uint8Array([...fullBuf, ...cutAndEject]);
            // fs.writeFileSync(printerFile, bufWithCut);
        } else {

            fs.writeFileSync(savedFile, JSON.stringify(forPrint));

            if (action === "print") {
                PrintText(textForPrint, forPrint);
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

    } catch (err) {
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

export default router;