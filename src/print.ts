import express from 'express';
import fs from "fs";
import cp866buffer from "node-cp866buffer";
import { exec } from "child_process";

export type printedModel = {
    title: string,
    // 0x1B 0x21
    printMode: number,
    // 0x1B 0x33
    lineSpacing: number,
    // 0x1B 0x4D
    charFont: number,
    // 0x1B 0xC1
    cpiMode: number,

    content: string
}

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
    res.send('Результат печати');
    // res.render('print', { title: 'Печать' });
});

router.post('/', (req, res, next) => {
    // console.log(req);
    // console.log(req.params);
    const savedFile = `${__dirname}/prints/print_${Date.now()}`;// "/dev/usb/lp0";
    const printerFile = "/dev/usb/lp0";
    const textForPrint = req.body.textForPrint;

    const cutAndEject = new Uint8Array([0x0a, 0x1b, 0x69, 0x1d, 0x65, 0x05]);

    const forPrint: printedModel = {
        title: new Date().toISOString(),
        printMode: 0x01,
        lineSpacing: 0,
        charFont: 0x01,
        cpiMode: 0x01,
        content: textForPrint
    }

    try {
        fs.writeFileSync(savedFile, JSON.stringify(forPrint));

        const setupBuf = new Uint8Array([
            0x1b, 0x21, forPrint.printMode,
            0x1b, 0x33, forPrint.lineSpacing,
            0x1b, 0x4d, forPrint.charFont,
            0x1b, 0xc1, forPrint.cpiMode]);

        // const encoder = new TextEncoder();
        // encoder.encoding= "CP866";
        const textBytes = cp866buffer.encode(textForPrint);
        // const textBytes = encoder.encode(textForPrint);
        const fullBuf = new Uint8Array([...setupBuf, ...textBytes]);

        const bufWithCut = new Uint8Array([...fullBuf, ...cutAndEject]);
        fs.writeFileSync(printerFile, bufWithCut);

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