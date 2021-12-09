"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrintText = exports.PrintRaw = exports.page56 = exports.page42 = exports.page33 = void 0;
const fs_1 = __importDefault(require("fs"));
const node_cp866buffer_1 = __importDefault(require("node-cp866buffer"));
const printerFile = "/dev/usb/lp0";
const cutAndEject = new Uint8Array([0x0a, 0x1b, 0x69, 0x1d, 0x65, 0x05]);
exports.page33 = {
    title: "33",
    printMode: 0,
    lineSpacing: 10,
    charFont: 0,
    cpiMode: 0,
    content: ""
};
exports.page42 = {
    title: "42",
    printMode: 0,
    lineSpacing: 10,
    charFont: 1,
    cpiMode: 0,
    content: ""
};
exports.page56 = {
    title: "56",
    printMode: 1,
    lineSpacing: 10,
    charFont: 1,
    cpiMode: 1,
    content: ""
};
function PrintRaw(raw) {
    console.log("printing raw...");
    const fullBuf = new Uint8Array(Buffer.from(raw, 'base64'));
    const bufWithCut = new Uint8Array([...fullBuf, ...cutAndEject]);
    fs_1.default.writeFileSync(printerFile, bufWithCut);
}
exports.PrintRaw = PrintRaw;
function PrintText(textForPrint, forPrint) {
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
exports.PrintText = PrintText;
//# sourceMappingURL=printerutils.js.map