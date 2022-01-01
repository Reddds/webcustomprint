"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const usb_detection_1 = __importDefault(require("usb-detection"));
const serialport_1 = __importDefault(require("serialport"));
const printerutils_1 = require("./printerutils");
const barcodedb_1 = require("./barcodedb");
const child_process_1 = require("child_process");
const PrintByQr = __importStar(require("./printbyqr"));
const chestznak_1 = require("./chestznak");
// SerialPort.parsers = {
//     ByteLength: require('@serialport/parser-byte-length'),
//     CCTalk: require('@serialport/parser-cctalk'),
//     Delimiter: require('@serialport/parser-delimiter'),
//     Readline: require('@serialport/parser-readline'),
//     Ready: require('@serialport/parser-ready'),
//     Regex: require('@serialport/parser-regex'),
// };
module.exports = class Scanner {
    // /**
    //  *
    //  */
    // constructor() {
    // }
    WrapText(str, lineLen) {
        let res = "";
        while (str.length > lineLen) {
            res += str.substring(0, lineLen) + "\n";
            str = str.substring(lineLen);
        }
        res += str;
        return res;
    }
    InitSerialPort() {
        const parser = new serialport_1.default.parsers.Readline({ delimiter: "\r", encoding: "utf8" });
        this.port = new serialport_1.default('/dev/ttyACM0', {
            baudRate: 9600,
            autoOpen: false
        });
        this.port.on('error', (err) => {
            console.log('Error: ', err.message);
        });
        // Switches the port into "flowing mode"
        // this.port.on('data', (data) => {
        //     console.log('Data:', data);
        // })
        this.port.pipe(parser);
        parser.on('data', (data) => __awaiter(this, void 0, void 0, function* () {
            console.log("Scanned", data);
            // =================================================================
            // Если ШК начинается с домашенго префикса
            if (data.startsWith(PrintByQr.HomeQrPrefix)) {
                const code = data.substring(PrintByQr.HomeQrPrefix.length);
                const qrFound = this.printByQrSettings.find(qs => qs.Code === code);
                if (!qrFound) {
                    // this.ScannerBadBell();
                    this.Say("Ничего не найдено");
                    return;
                }
                printerutils_1.PrintText(this.WrapText(qrFound.Text, 33), printerutils_1.page33);
                return;
            }
            // =================================================================
            // Пробуем через честный знак
            try {
                const prodInfo = yield chestznak_1.ChesZnak.GetData(data);
                if (prodInfo) {
                    console.log("prodInfo", prodInfo);
                    yield this.Say(prodInfo.Name);
                    if (prodInfo.ExpireDate) {
                        const now = Date.now();
                        const expDate = new Date(prodInfo.ExpireDate);
                        const diff = prodInfo.ExpireDate - now;
                        if (diff <= 0) {
                            console.log("now", now);
                            console.log("prodInfo.ExpireDate", prodInfo.ExpireDate);
                            yield this.Say("Просрочено!");
                        }
                        else {
                            // const dateStr = expDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'numeric', day: 'numeric' });
                            const dateStr = `${expDate.getDate()} ${expDate.getMonth() + 1} ${expDate.getFullYear()}`;
                            yield this.Say("Годен до");
                            yield this.Say(dateStr);
                        }
                    }
                    return;
                }
            }
            catch (error) {
                console.log(error);
            }
            const barcodeData = yield this.barcodeDb.GetBarcodeData(data);
            if (!barcodeData || barcodeData.length === 0) {
                // this.ScannerBadBell();
                this.Say("Ничего не найдено");
                // PrintText(`Отсканировано:\n${data}`, page33);
            }
            else {
                barcodeData.forEach(barData => {
                    this.Say(barData.Name); //"Найдено! " + 
                    const textForPring = `${this.WrapText(barData.Name, 33)}\n\n${this.WrapText(barData.CategoryName, 33)}\n\n${this.WrapText(barData.BrandName, 33)}`;
                    console.log("barData.Name", barData.Name);
                    // console.log(textForPring);
                    // PrintText(textForPring, page33);
                });
            }
        }));
    }
    OpenPort() {
        console.log("Openting port", this.port.path);
        this.port.open((err) => {
            if (err) {
                return console.log('Error opening port: ', err.message);
            }
        });
    }
    ClosePort() {
        console.log("Closing port", this.port.path);
        this.port.close((err) => {
            if (err) {
                return console.log('Error closing port: ', err.message);
            }
        });
    }
    Say(str) {
        return __awaiter(this, void 0, void 0, function* () {
            str = str.replace("%", "процентов");
            return yield new Promise((resolve, reject) => {
                child_process_1.exec(`spd-say --wait -o rhvoice -l ru  -t female1 -r -30 "${str}"`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    resolve();
                });
            });
        });
    }
    Init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.barcodeDb = new barcodedb_1.BarcodeDb();
            yield this.barcodeDb.OpenDb();
            // Стартовые тесты
            // const barcodeData = await this.barcodeDb.GetBarcodeData("7622201771027");
            // console.log(barcodeData);
            console.log("Init scanner monitoring...");
            //  Detect scanner 05f9:4204
            usb_detection_1.default.startMonitoring();
            usb_detection_1.default.on('add:1529:16900', (device) => {
                console.log('adding');
                console.log('add', device);
                this.OpenPort();
                usb_detection_1.default.find(0x05f9, 0x4204, (err, devices) => {
                    console.log('find', devices, err);
                });
            });
            usb_detection_1.default.on('remove:1529:16900', (device) => {
                console.log('removing');
                console.log('remove', device);
                this.ClosePort();
            });
            usb_detection_1.default.find(0x05f9, 0x4204, (err, devices) => {
                console.log('find', devices, err);
                this.OpenPort();
            });
            this.InitSerialPort();
            // this.Say("Программа запущена");
            this.printByQrSettings = PrintByQr.LoadQrSettings();
            PrintByQr.SetOnReloadEvent((setts) => {
                this.printByQrSettings = setts;
            });
        });
    }
    ScannerGoodBell() {
        if (!this.port.isOpen) {
            return;
        }
        this.port.write([0x42]);
    }
    ScannerBadBell() {
        if (!this.port.isOpen) {
            return;
        }
        this.port.write([0x46]);
        this.port.write([0x45]);
    }
    ReloadPrintByQrSettings() {
        this.printByQrSettings = PrintByQr.LoadQrSettings();
    }
};
//# sourceMappingURL=scanner.js.map