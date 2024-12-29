"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.page56 = exports.page42 = exports.page33 = void 0;
exports.strToNumArr = strToNumArr;
exports.PrintRaw = PrintRaw;
exports.PrintRawStr = PrintRawStr;
exports.PrintRawBuf = PrintRawBuf;
exports.PrintText = PrintText;
const fs_1 = __importDefault(require("fs"));
const node_cp866buffer_1 = __importDefault(require("node-cp866buffer"));
// let printerFileName = "";
// switch (process.env.USE_PRINTER) {
//     case "custom80":
//         printerFileName = "/dev/usb/lp0";
//         break;
//     case "citizenCLP-521":
//         printerFileName = "/dev/usb/lp0";
//         break;
// }
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
function PrintImageCuctom(buf) {
    const bufWithCut = new Uint8Array([...buf, ...cutAndEject]);
    fs_1.default.writeFileSync(printerFile, bufWithCut);
}
/**
 * Преобразование строки в массив
 * Спцсимволы:
 * [1b] - преобразуется в hex
 * @param str Строка со спецсимволами
 * @returns Массив
 */
function strToNumArr(str) {
    const retArr = [];
    for (let i = 0; i < str.length; i++) {
        const charcode = str.charCodeAt(i);
        // Перенос строки запишем
        if (charcode === 0x0D) {
            retArr.push(0x0D);
            continue;
        }
        // Пропускаем пробелы, табуляцию и прочую ерунду
        if (charcode === 0x20 || charcode == 0x09) {
            continue;
        }
        if (charcode >= 0x80 || charcode < 0x20) {
            console.error(`Присутствуют недопустимые знаки! '${str.charAt(i)}'`);
            return null;
        }
        if (str.charAt(i) === '[') {
            if (str.charAt(i + 3) !== ']') {
                console.error("Не найдена закрывающая квадратная скобка!");
                return null;
            }
            const val = (parseInt(str.charAt(i + 1), 16) << 4) | parseInt(str.charAt(i + 2), 16);
            retArr.push(val);
            i += 3;
            continue;
        }
        retArr.push(str.charCodeAt(i));
    }
    return new Uint8Array(retArr);
}
function PrintImageCitizen(buf) {
    // [mode] [width in bytes (2b)] [height in rows (2b)]
    const mode = buf[0];
    const widthInBytes = (buf[2] << 8) | buf[1];
    const height = (buf[4] << 8) | buf[3];
    console.log("widthInBytes", widthInBytes);
    console.log("height", height);
    if (widthInBytes * height + 5 !== buf.length) {
        console.error("Buffer len error!", `counted: ${widthInBytes * height + 5}, recived: ${buf.length}`);
        return;
    }
    // 203 dpi
    const dpi = 203;
    const heightMm = Math.ceil(height / dpi * 25.4);
    // header
    let startStr = "";
    // select command set DMI or DMW
    startStr += "[02][1B]G0[0d][0a]";
    // to mm
    startStr += "[02]m[0d][0a]";
    // max label length 10 cm !!!!!
    startStr += "[02]M0300[0d][0a]";
    // set printing pos min 30,5 mm
    startStr += "[02]O0500[0d][0a]";
    // set mem switch contents (not care)
    startStr += "[02]V0[0d][0a]";
    // set ejection 1 - on
    startStr += "[02][1B]t1[0d][0a]";
    // peeling (cutting) position (inch | mm)
    startStr += "[02]Kf0120[0d][0a]";
    // paper length for continuous
    let heightMmStr = String(heightMm + 20); // 20 mm field
    heightMmStr = heightMmStr.padStart(3, "0");
    startStr += `[02]c${heightMmStr}0[0d][0a]`;
    /*graphic input
        C - currnt mem, D - onboard sd-ram
        _ - 8 bit (A - 7bit)
        P - 8bitPCX normal, B - 8bit BMP normal, i - 8bit image format normal
        gfx0 - name of file
    */
    startStr += "[02]ICigfx0[0d][0a]";
    //--------------------------------------------
    startStr += "[00][01][00][08][00][01][00][02][00][7f][00][7f][00][e0]";
    const startPart = strToNumArr(startStr);
    // image data!
    const imageArr = [height >> 8, height & 0xFF];
    const startByte = 5;
    for (let y = 0; y < height; y++) {
        imageArr.push(0x80, widthInBytes);
        for (let x = 0; x < widthInBytes; x++) {
            imageArr.push(buf[startByte + y * widthInBytes + x]);
        }
    }
    // end
    let endStr = "";
    // ending code
    endStr += "[46][46][46][46]";
    // --------------------------------------------
    // printing contents setting start
    endStr += "[02]L[0d][0a]";
    // pixel size
    endStr += "D11[0d][0a]";
    // ?????
    endStr += "A2[0d][0a]";
    endStr += "1Y11000";
    // start row pos 000.0 mm
    endStr += "0000";
    // start col pos 000.0 mm
    endStr += "0000";
    // image name
    endStr += "gfx0[0d][0a]";
    // 1 copy
    endStr += "Q0001[0d][0a]";
    // print!
    endStr += "E[0d][0a]";
    // clear mem
    endStr += "[02]xCGgfx0[0d][0a]";
    // ???
    endStr += "[02]zC[0d][0a]";
    const endPart = strToNumArr(endStr);
    //
    const bufWithCut = new Uint8Array([...startPart, ...imageArr, ...endPart]);
    const dir = "prints";
    const savedFile = `${__dirname}/${dir}/print_${Date.now()}`; // "/dev/usb/lp0";
    fs_1.default.writeFileSync(savedFile, bufWithCut);
    fs_1.default.writeFileSync(printerFile, bufWithCut);
}
/**
 * print base 64 data
 * @param raw base 64
 */
function PrintRaw(raw) {
    console.log("printing raw...");
    const fullBuf = new Uint8Array(Buffer.from(raw, 'base64'));
    switch (process.env.USE_PRINTER) {
        case "custom80":
            PrintImageCuctom(fullBuf);
            break;
        case "citizenCLP-521":
            PrintImageCitizen(fullBuf);
            break;
    }
}
/**
 * print string
 * @param raw string data
 */
function PrintRawStr(raw) {
    console.log("printing raw string...");
    const fullBuf = new Uint8Array(Buffer.from(raw));
    const bufWithCut = fullBuf; // new Uint8Array([...fullBuf, ...cutAndEject]); // 
    console.log("bufWithCut", bufWithCut);
    fs_1.default.writeFileSync(printerFile, bufWithCut);
}
function PrintRawBuf(raw) {
    console.log("printing raw buffer...");
    //const fullBuf = new Uint8Array(Buffer.from(raw));
    //const bufWithCut = fullBuf;// new Uint8Array([...fullBuf, ...cutAndEject]); // 
    //console.log("bufWithCut", bufWithCut);
    fs_1.default.writeFileSync(printerFile, raw);
}
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
        const hriBelow = "\x1d\x48\x32";
        return `${centerJust}${hriBelow}\x1d\x6b\x08\x7b\x42${barcodeText}\x00`;
    });
    // const hexMatch = text.match(/\[\\x([1-9a-fA-F]+)\]/);
    // if(hexMatch) {
    //     const hexVal = parseInt(hexMatch.groups[1], 16);
    //     text.replace()
    // }
    return text;
}
/**
 *
 * printMode
 *
 *
 * @param textForPrint
 * @param forPrint
 */
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
//# sourceMappingURL=printerutils.js.map