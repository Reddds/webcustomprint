import usbDetect from 'usb-detection';
import SerialPort from "serialport";
import mysql from "mysql2/promise";
import fs from "fs";
import AsyncLock from "async-lock";
import util from "util";

// import dotenv from "dotenv";

import { printedModel, PrintRaw, PrintText, page33 } from "./printerutils";
import { BarcodeDb } from "./barcodedb";
import { exec } from "child_process";
import * as PrintByQr from "./printbyqr";
import { ChesZnak, ProdInfo } from "./chestznak";
import { dayLetters } from "./utils";

// console.log("scanner pid", process.pid);

// SerialPort.parsers = {
//     ByteLength: require('@serialport/parser-byte-length'),
//     CCTalk: require('@serialport/parser-cctalk'),
//     Delimiter: require('@serialport/parser-delimiter'),
//     Readline: require('@serialport/parser-readline'),
//     Ready: require('@serialport/parser-ready'),
//     Regex: require('@serialport/parser-regex'),
// };

// export function GetInstance(): Scanner {
//     return Scanner.Instance;
// }

interface IExistProd {
    name: string;
    img: string;
    expDate: string | undefined;
    daysLeft: number | undefined;
    expPercent: number;
}

interface ICatCategory extends mysql.RowDataPacket {
    cat_id: number;
    name: string;
}


interface IProd extends mysql.RowDataPacket {
    id: number;
    product_name: string;
    code: string;
    image_url: string;
    exp_date: Date;
    ChesZnakDump: string;
}

interface ICodeData {
    cis: string;
    gtin: string;
    sgtin: string
}

export class Scanner {
    public static Instance: Scanner;
    private port: SerialPort;
    private barcodeDb: BarcodeDb;

    private printByQrSettings: PrintByQr.PrintByQrItem[];

    // private dbCon: mysql.Connection;
    private dbPool: mysql.Pool;

    // /**
    //  *
    //  */
    // constructor() {

    // }

    private static WrapText(str: string, lineLen: number): string {
        let res = "";
        while (str.length > lineLen) {
            res += str.substring(0, lineLen) + "\n";
            str = str.substring(lineLen);
        }
        res += str;
        return res;
    }

    private getDifferenceInDays(date1, date2) {
        const diffInMs = date2 - date1;
        return diffInMs / (1000 * 60 * 60 * 24);
    }

    private getDifferenceInHours(date1, date2) {
        const diffInMs = date2 - date1;
        return diffInMs / (1000 * 60 * 60);
    }

    private getDifferenceInMinutes(date1, date2) {
        const diffInMs = date2 - date1;
        return diffInMs / (1000 * 60);
    }

    private getDifferenceInSeconds(date1, date2) {
        const diffInMs = date2 - date1;
        return diffInMs / 1000;
    }

    private async AddToBase(scanned: string, prodInfo: ProdInfo) {
        if (this.dbPool) {

            const czId = prodInfo.Dump.id;
            const productName = prodInfo.Dump.productName;
            const category = prodInfo.Dump.category;
            const expDate = prodInfo.ExpireDate ? new Date(prodInfo.ExpireDate) : null;
            const isTrashed = false;
            const code = prodInfo.Dump.code;
            let producer = prodInfo.Dump.producerName;
            let cis = prodInfo.Dump.cis;
            let gtin = prodInfo.Dump.gtin;
            let sgtin = prodInfo.Dump.sgtin;


            let codeData: ICodeData;
            if (prodInfo.Dump.milkData && prodInfo.Dump.milkData.codeData) {
                codeData = prodInfo.Dump.milkData.codeData;
            }

            if (prodInfo.Dump.drugsData) {
                codeData = prodInfo.Dump.drugsData;
            }

            if (prodInfo.Dump.lpData) {
                codeData = prodInfo.Dump.lpData.codeData;
            }

            if (codeData) {
                if (!cis) {
                    cis = codeData.cis;
                }
                if (!gtin) {
                    gtin = codeData.gtin;
                }
                if (!sgtin) {
                    sgtin = codeData.sgtin;
                }
            }

            /** Индивидуальный код с серийным номером */
            const isIndividual: boolean = !!prodInfo.ExpireDate || !!sgtin;




            const newCats = [];

            const catalogDataArr: any[] = prodInfo.Dump.catalogData;
            let catalogDataObj: any;
            if (catalogDataArr && catalogDataArr.length > 0) {
                const catalogData = catalogDataArr[0];

                const imageUrl = catalogData.good_img;
                if (!producer)
                    producer = catalogData.producer_name;
                const catalogGoodId = catalogData.good_id;
                const catalogBrandId = catalogData.brand_id;

                if (!gtin && catalogData.identified_by) {
                    const idents: any[] = catalogData.identified_by;
                    const ident = idents.find(ide => ide.level === "trade-unit");
                    if (ident) {
                        gtin = ident.value;
                    }

                }


                catalogDataObj = {
                    image_url: imageUrl,
                    catalog_good_id: catalogGoodId,
                    catalog_brand_id: catalogBrandId
                }

                catalogData.categories.forEach(categoryItem => {
                    newCats.push({
                        cat_id: categoryItem.cat_id,
                        name: categoryItem.cat_name
                    });


                    // }

                });


            }


            const post = {
                cz_id: czId,
                product_name: productName,
                category,
                producer,
                exp_date: expDate,
                is_trashed: isTrashed,
                code,
                gtin,
                sgtin,
                cis,
                is_individual: isIndividual,
                ChesZnakDump: JSON.stringify(prodInfo.Dump),

                ...catalogDataObj
            }



            console.log("begin transaction...");
            const dbCon = await this.dbPool.getConnection();
            await dbCon.beginTransaction();

            let isExists = isIndividual;
            let existRow: IProd;

            if (isIndividual) {
                console.log("individual");
                const [rowsExist, fieldsExist] = await dbCon.execute<IProd[]>(`SELECT * FROM prods WHERE code='${post.code}'`);
                if (rowsExist && rowsExist.length !== 0) {
                    // console.log("exists rows", rowsExist);
                    isExists = true;
                    existRow = rowsExist[0];
                } else {
                    isExists = false;
                }
            }

            if (!isExists) {
                console.log("adding new prod", post.code);
                await dbCon.query('INSERT INTO prods SET ?', post);
                const [rows1, fields1] = await dbCon.query('SELECT LAST_INSERT_ID() as lastId');
                const prodId = rows1[0].lastId;
                // console.log("rows1", rows1);
                // console.log("last id", rows1[0].lastId);
                // console.log("fields1", fields1);

                newCats.forEach(async catNew => {
                    const [rows, fields] = await dbCon.execute<ICatCategory[]>(`SELECT * FROM catalog_categories WHERE cat_id=${catNew.cat_id}`);
                    // console.log("check exist cat", catNew);
                    // console.log("rows", rows);
                    // console.log("fields", fields);
                    if (!rows || rows.length === 0) {
                        console.log("inserting new cat");
                        await dbCon.query('INSERT INTO catalog_categories SET ?', catNew);
                    }

                    const prodToCat = {
                        prod: prodId,
                        category: catNew.cat_id
                    }

                    await dbCon.query('INSERT INTO prods_by_caterories SET ?', prodToCat);
                });
            } else {
                console.log(`prod already exists. code='${post.code}'`);
                if (existRow && !existRow.ChesZnakDump) {
                    console.log(`Update ChesZnakDump id=${existRow.id}`);
                    // await dbCon.execute(`UPDATE prods SET ChesZnakDump = '${JSON.stringify(prodInfo.Dump)}' WHERE id = ${existRow.id}`,
                    await dbCon.query(`UPDATE prods SET ? WHERE ?`,
                        [{ ChesZnakDump: JSON.stringify(prodInfo.Dump) }, { id: existRow.id }]);
                }
                Scanner.Say("Этот товар уже отсканирован");

            }
            console.log("committing transaction...");
            await dbCon.commit();
            if (dbCon)
                dbCon.release();
        }
    }



    public async OnSacnned(data: string, format?: string): Promise<void> {



        // =================================================================
        // Если ШК начинается с домашенго префикса
        if (data.startsWith(PrintByQr.HomeQrPrefix)) {
            if (!this.printByQrSettings) {
                console.error("this.printByQrSettings empty");
                return;
            }
            const code = data.substring(PrintByQr.HomeQrPrefix.length);
            const qrFound = this.printByQrSettings.find(qs => qs.Code === code);
            if (!qrFound) {
                // this.ScannerBadBell();
                Scanner.Say("Ничего не найдено");
                return;
            }
            PrintText(Scanner.WrapText(qrFound.Text, 33), page33);
            return;
        }

        // =================================================================
        // Пробуем через честный знак
        try {
            const prodInfo = await ChesZnak.GetData(data);
            if (prodInfo) {
                // console.log("prodInfo", prodInfo);
                console.log("ChesZnak success");

                // Записываем дамп
                const filePath = `${__dirname}/scans/scan_${Date.now()}.json`;
                try {
                    fs.writeFileSync(filePath, `Scanned: "${data}"\n\n${JSON.stringify(prodInfo.Dump)}`);
                } catch (error) {
                    console.error("Error write scan", error);
                }


                try {
                    this.AddToBase(data, prodInfo);
                } catch (error) {
                    console.error("Error save in Base", error);
                }


                await Scanner.Say(prodInfo.Name);

                if (prodInfo.ExpireDate) {
                    const now = Date.now();
                    const expDate = new Date(prodInfo.ExpireDate);
                    const diff = this.getDifferenceInDays(now, prodInfo.ExpireDate);
                    // console.log("diff", diff);
                    // console.log("Math.abs(diff)", Math.abs(diff));
                    const dayStr = dayLetters(Math.abs(Math.floor(diff)));
                    if (diff <= 0) {
                        console.log("now", now);
                        console.log("prodInfo.ExpireDate", prodInfo.ExpireDate);
                        await Scanner.Say(`Просрочено на ${dayStr}`);
                    } else {
                        // const dateStr = expDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'numeric', day: 'numeric' });
                        // const dateStr = `${expDate.getDate()} ${expDate.getMonth() + 1} ${expDate.getFullYear()}`;
                        await Scanner.Say(`Годен ещё ${dayStr}`);
                        // await Scanner.Say(dateStr);
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
            Scanner.Say("Ничего не найдено");
            // PrintText(`Отсканировано:\n${data}`, page33);
        }
        else {

            barcodeData.forEach(barData => {
                Scanner.Say(barData.Name);
                const textForPring = `${Scanner.WrapText(barData.Name, 33)}\n\n${Scanner.WrapText(barData.CategoryName, 33)}\n\n${Scanner.WrapText(barData.BrandName, 33)}`;
                console.log("barData.Name", barData.Name);
                // console.log(textForPring);
                // PrintText(textForPring, page33);
            });
        }
    }

    private datediff(first: number, second: number) {
        // Take the difference between the dates and divide by milliseconds per day.
        // Round to nearest whole number to deal with DST.
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }

    public async GetExistProds(): Promise<IExistProd[]> {
        try {
            const [rowsExist, fieldsExist] = await this.dbPool.execute<IProd[]>(`SELECT * FROM prods WHERE is_trashed=0 ORDER BY exp_date`);
            return rowsExist.map(prod => {

                // Проценты просрочки относительно недели
                let expPercent = 0;
                let daysLeft: number;
                if (!prod.exp_date) {
                    expPercent = 100;
                } else {
                    const fullDays = 30;
                    const dayDiff = this.datediff(Date.now(), prod.exp_date.getTime());
                    daysLeft = dayDiff;
                    // console.log("dayDiff", dayDiff);
                    // console.log("Date.now()", Date.now());
                    // console.log("prod.exp_date.getTime()", prod.exp_date.getTime());
                    if (dayDiff <= 0) {
                        expPercent = 0;
                    } else if (dayDiff >= fullDays) {
                        expPercent = 100;
                    } else {
                        expPercent = dayDiff / fullDays * 100;
                    }
                }



                return {
                    name: prod.product_name,
                    img: prod.image_url,
                    expDate: prod.exp_date ? prod.exp_date.toLocaleDateString() : undefined,
                    daysLeft,
                    expPercent
                }
            });
        } catch (error) {
            console.error(error);
            return undefined;
        }
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

            this.OnSacnned(data);
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
            console.log("Port closed", this.port.path);
        });
    }

    private static async Say(str: string) {
        if (process.env.SILENCE === "1") {
            return;
        }
        str = str.replace("%", "процентов");
        const replaceQuotes = new RegExp('\"', "g");
        str = str.replace(replaceQuotes, " ");
        return await new Promise<void>((resolve, reject) => {

            this.lock.acquire("say", (done) => {
                console.log("say enter", str);
                exec(`spd-say --wait -o rhvoice -l ru -t female1 -r -30 "${str}"`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(error.message);
                        done();
                        return;
                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        done();
                        return;
                    }
                    console.log(`stdout: ${stdout}`);

                    done();
                    resolve();
                });

            }, (err, ret) => {
                console.log("say release");
            }, { maxOccupationTime: 20000 });



        });
    }


    private async InitMysql() {
        try {
            console.log('Get mysql connection ...');
            // this.dbCon = await mysql.createConnection({
            //     database: 'prods',
            //     host: "localhost",
            //     // socketPath: '/run/mysqld/mysqld.sock',
            //     user: process.env.DB_LOGIN,
            //     password: process.env.DB_PASSWORD
            // });

            this.dbPool = await mysql.createPool({
                connectionLimit: 20,
                database: 'prods',
                host: "localhost",
                user: process.env.DB_LOGIN,
                password: process.env.DB_PASSWORD
            });

            // this.dbCon.connect((err) => {
            //     if (err)
            //         throw err;
            //     console.log("Connected!");
            // });
        } catch (error) {
            console.error(error);
        }


    }

    private static lock: AsyncLock;

    public async Init() {
        Scanner.Instance = this;

        Scanner.lock = new AsyncLock();

        // dotenv.config({ path: '../.env' });

        this.InitMysql();

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

    public Exit() {
        this.ClosePort();
        // this.dbCon.destroy();
        // this.dbPool.destroy();
    }
}



// const ScannerInstance: Scanner = new Scanner();
// ScannerInstance.Init();

// export { ScannerInstance };
// module.exports = ScannerInstance;