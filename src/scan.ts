import express from 'express';
import fs, { fdatasync, PathLike } from "fs";
// import { ScannerInstance } from "./scanner";
import { Singleton, GetInstance } from "./prodUtils";
// import scanerSingleton = require('../dist/prodUtils');
// const Scanner = require("./scanner");

const router = express.Router();
const scannerInstance = Singleton.getInstance();


// const settingsFile = `${__dirname}/printSrc/printbyqr.json`;

// export const HomeQrPrefix = "[HOMEPR]";

router.get('/', (req, res, next) => {

    res.render('scan', {});
});



router.post('/', (req, res, next) => {
    const scannedCode: string = req.body.scannedCode;
    const scannedCodeFormat: string = req.body.scannedCodeFormat;

    try {
        // const scannerInstance = new ScannerSingleton();
        scannerInstance.OnSacnned(scannedCode, scannedCodeFormat);
        // GetInstance().OnSacnned(scannedCode, scannedCodeFormat);
    } catch (error) {
        console.error(error);
    }

    res.json({ scannedCode, scannedCodeFormat });
});

export default router;