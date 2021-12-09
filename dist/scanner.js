"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const usb_detection_1 = __importDefault(require("usb-detection"));
const serialport_1 = __importDefault(require("serialport"));
const printerutils_1 = require("./printerutils");
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
        parser.on('data', (data) => {
            printerutils_1.PrintText(`Отсканировано:\n${data}`, printerutils_1.page33);
        });
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
    Init() {
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
    }
};
//# sourceMappingURL=scanner.js.map