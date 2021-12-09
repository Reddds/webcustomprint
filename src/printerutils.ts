import fs from "fs";
import cp866buffer from "node-cp866buffer";

const printerFile = "/dev/usb/lp0";
const cutAndEject = new Uint8Array([0x0a, 0x1b, 0x69, 0x1d, 0x65, 0x05]);



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

export const page33: printedModel = {
    title: "33",
    printMode: 0,
    lineSpacing: 10,
    charFont: 0,
    cpiMode: 0,
    content: ""
};

export const page42: printedModel = {
    title: "42",
    printMode: 0,
    lineSpacing: 10,
    charFont: 1,
    cpiMode: 0,
    content: ""
};

export const page56: printedModel = {
    title: "56",
    printMode: 1,
    lineSpacing: 10,
    charFont: 1,
    cpiMode: 1,
    content: ""
};

export function PrintRaw(raw: string) {
    console.log("printing raw...");
    const fullBuf = new Uint8Array(Buffer.from(raw, 'base64'));
    const bufWithCut = new Uint8Array([...fullBuf, ...cutAndEject]);
    fs.writeFileSync(printerFile, bufWithCut);
}

export function PrintText(textForPrint: string, forPrint: printedModel)
{
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
}