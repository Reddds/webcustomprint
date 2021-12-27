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
// Печать ШК
// HRI [GS][\x48][\x0]
// [GS][\x6B][\x8]tessst[\x0]
// 1d 48 18 66 1d 68 1d 77
// [GS][\x6B]I6tessst
/*
Barcode justification is set by the $1B $61 (Select Justification) command.
• Barcode height is set by the $1D $68 (Set 1D Barcode Height) command.
• Barcode width is set by the $1D $77 (Set 1D Barcode Width Multiplier) command.

# Encode the text "CODE 39" as a Code 39 barcode
write("\x1d\x6b\x04\x43\x4f\x44\x45\x20\x33\x39\x00")
# Encode the text "Code 128" as a Code 128 barcode,
# using form 1 of the command, and mode B
write("\x1d\x6b\x08\x7b\x42\x43\x6f\x64\x65\x20\x31\x32\x38\x00")
[\x1d][\x6b][\x08][\x7b][\x42][\x43][\x6f][\x64][\x65][\x20][\x31][\x32][\x38][\x00]

# Encode the text "pi = 3.14159265" as a Code 128 barcode,
# using form 2 of the command, and modes B and C
# Command header (includes code system and string length)
write("\x1d\x6b\x49\x0f")
# Mode B select, and the string "pi = 3."
write("\x7b\x42\x70\x69\x20\x3a\x20\x33\x2e")
# Mode C select, and the string "14159265"
write("\x7b\x43\x0e\x0f\x5c\x41")

128A — символы в формате ASCII от 00 до 95 (цифры от «0» до «9» и буквы от «A» до «Z»), специальные символы и символы FNC 1-4;
128B — символы в формате ASCII от 32 до 127 (цифры от «0» до «9», буквы от «A» до «Z» и от «a» до «z»), специальные символы и символы FNC 1-4;
128C — числа от 00 до 99 (двузначное число кодируется одним символом) и символ FNC 1.


Select Justification - $1B $61
 $1B $61 n
 
 When n=0 or 48, left justification is enabled
• When n=1 or 49, center justification is enabled
• When n=2 or 50, right justification is enabled

{CODE128:[HOMEPR]1}
*/
/**
 * Замена спецсимволов
 * символы [GS] заменяются на 0x1D
 * символы [\x**] заменяются на HEX значения
 * {CODE128:text} заменяется на \x1d\x6b\x08\x7b\x42 + text + \0
 * @param text исходный текст
 * @returns сконвертированнный текст
 */
function ReplaceSpecialChars(text) {
    text = text.replace(/\[GS\]/g, "\x1D");
    // шестнадцатиричные значения
    text = text.replace(/\[\\x([0-9a-fA-F]+)\]/g, (match, hex, offset, str) => {
        const hexVal = parseInt(hex, 16);
        return String.fromCharCode(hexVal);
    });
    // штрихкоды
    text = text.replace(/\{CODE128:([^}]+)\}/g, (match, barcodeText, offset, str) => {
        const centerJust = "\x1d\x61\x01";
        return `${centerJust}\x1d\x6b\x08\x7b\x42${barcodeText}\x00`;
    });
    // const hexMatch = text.match(/\[\\x([1-9a-fA-F]+)\]/);
    // if(hexMatch) {
    //     const hexVal = parseInt(hexMatch.groups[1], 16);
    //     text.replace()
    // }
    return text;
}
function PrintText(textForPrint, forPrint) {
    const setupBuf = new Uint8Array([
        0x1b, 0x21, forPrint.printMode,
        0x1b, 0x33, forPrint.lineSpacing,
        0x1b, 0x4d, forPrint.charFont,
        0x1b, 0xc1, forPrint.cpiMode
    ]);
    // const encoder = new TextEncoder();
    // encoder.encoding= "CP866";
    const textBytes = node_cp866buffer_1.default.encode(ReplaceSpecialChars(textForPrint));
    // const textBytes = encoder.encode(textForPrint);
    const fullBuf = new Uint8Array([...setupBuf, ...textBytes]);
    const bufWithCut = new Uint8Array([...fullBuf, ...cutAndEject]);
    fs_1.default.writeFileSync(printerFile, bufWithCut);
}
exports.PrintText = PrintText;
//# sourceMappingURL=printerutils.js.map