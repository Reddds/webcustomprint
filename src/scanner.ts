import usbDetect from 'usb-detection';
import SerialPort from "serialport";
import { printedModel, PrintRaw, PrintText, page33 } from "./printerutils";
import { BarcodeDb } from "./barcodedb";
import { exec } from "child_process";
import * as PrintByQr from "./printbyqr";
import { ChesZnak } from "./chestznak";

// SerialPort.parsers = {
//     ByteLength: require('@serialport/parser-byte-length'),
//     CCTalk: require('@serialport/parser-cctalk'),
//     Delimiter: require('@serialport/parser-delimiter'),
//     Readline: require('@serialport/parser-readline'),
//     Ready: require('@serialport/parser-ready'),
//     Regex: require('@serialport/parser-regex'),
// };

module.exports = class Scanner {

    private port: SerialPort;
    private barcodeDb: BarcodeDb;

    private printByQrSettings: PrintByQr.PrintByQrItem[];

    // /**
    //  *
    //  */
    // constructor() {

    // }

    private WrapText(str: string, lineLen: number): string {
        let res = "";
        while (str.length > lineLen) {
            res += str.substring(0, lineLen) + "\n";
            str = str.substring(lineLen);
        }
        res += str;
        return res;
    }

    private InitSerialPort(): void {
        const parser = new SerialPort.parsers.Readline({ delimiter: "\r", encoding: "utf8" });
        this.port = new SerialPort('/dev/ttyACM0', {
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
        parser.on('data', async (data: string) => {
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
                PrintText(this.WrapText(qrFound.Text, 33), page33);
                return;
            }

            // =================================================================
            // Пробуем через честный знак
            try {
                const prodInfo = await ChesZnak.GetData(data);
                if (prodInfo) {
                    console.log("prodInfo", prodInfo);
                    await this.Say(prodInfo.Name);

                    if (prodInfo.ExpireDate) {
                        const now = Date.now();
                        const expDate = new Date(prodInfo.ExpireDate);
                        const diff = prodInfo.ExpireDate - now;
                        if (diff <= 0) {
                            console.log("now", now);
                            console.log("prodInfo.ExpireDate", prodInfo.ExpireDate);
                            await this.Say("Просрочено!");
                        } else {
                            // const dateStr = expDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'numeric', day: 'numeric' });
                            const dateStr = `${expDate.getDate()} ${expDate.getMonth() + 1} ${expDate.getFullYear()}`;
                            await this.Say("Годен до");
                            await this.Say(dateStr);
                        }
                    }

                    return;
                }
            } catch (error) {
                console.log(error);
            }



            const barcodeData = await this.barcodeDb.GetBarcodeData(data);
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
        });
    }

    private OpenPort() {
        console.log("Openting port", this.port.path);
        this.port.open((err) => {
            if (err) {
                return console.log('Error opening port: ', err.message);
            }
        });
    }

    private ClosePort() {
        console.log("Closing port", this.port.path);
        this.port.close((err) => {
            if (err) {
                return console.log('Error closing port: ', err.message);
            }
        });
    }

    private async Say(str: string) {
        str = str.replace("%", "процентов");
        return await new Promise<void>((resolve, reject) => {
            exec(`spd-say --wait -o rhvoice -l ru  -t female1 -r -30 "${str}"`, (error, stdout, stderr) => {
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
    }

    public async Init() {
        this.barcodeDb = new BarcodeDb();

        await this.barcodeDb.OpenDb();

        // Стартовые тесты
        // const barcodeData = await this.barcodeDb.GetBarcodeData("7622201771027");
        // console.log(barcodeData);



        console.log("Init scanner monitoring...");
        //  Detect scanner 05f9:4204
        usbDetect.startMonitoring();

        usbDetect.on('add:1529:16900', (device) => {
            console.log('adding');
            console.log('add', device);

            this.OpenPort();

            usbDetect.find(0x05f9, 0x4204, (err, devices) => {
                console.log('find', devices, err);
            });

        });

        usbDetect.on('remove:1529:16900', (device) => {
            console.log('removing');
            console.log('remove', device);
            this.ClosePort();
        });

        usbDetect.find(0x05f9, 0x4204, (err, devices) => {
            console.log('find', devices, err);
            this.OpenPort();
        });

        this.InitSerialPort();

        // this.Say("Программа запущена");

        this.printByQrSettings = PrintByQr.LoadQrSettings();
        PrintByQr.SetOnReloadEvent((setts) => {
            this.printByQrSettings = setts;
        });
    }

    public ScannerGoodBell(): void {
        if (!this.port.isOpen) {
            return;
        }
        this.port.write([0x42]);
    }

    public ScannerBadBell(): void {
        if (!this.port.isOpen) {
            return;
        }
        this.port.write([0x46]);
        this.port.write([0x45]);
    }

    public ReloadPrintByQrSettings() {
        this.printByQrSettings = PrintByQr.LoadQrSettings();
    }

}

