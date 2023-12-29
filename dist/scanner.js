"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.Scanner = void 0;
// import usbDetect from 'usb-detection';
const serialport_1 = require("serialport");
const promise_1 = __importDefault(require("mysql2/promise"));
const fs_1 = __importDefault(require("fs"));
const async_lock_1 = __importDefault(require("async-lock"));
// import dotenv from "dotenv";
const printerutils_1 = require("./printerutils");
const barcodedb_1 = require("./barcodedb");
const child_process_1 = require("child_process");
const PrintByQr = __importStar(require("./printbyqr"));
const chestznak_1 = require("./chestznak");
const utils_1 = require("./utils");
const usb_1 = require("usb");
class Scanner {
    // /**
    //  *
    //  */
    // constructor() {
    // }
    static WrapText(str, lineLen) {
        let res = "";
        while (str.length > lineLen) {
            res += str.substring(0, lineLen) + "\n";
            str = str.substring(lineLen);
        }
        res += str;
        return res;
    }
    getDifferenceInDays(date1, date2) {
        const diffInMs = date2 - date1;
        return diffInMs / (1000 * 60 * 60 * 24);
    }
    getDifferenceInHours(date1, date2) {
        const diffInMs = date2 - date1;
        return diffInMs / (1000 * 60 * 60);
    }
    getDifferenceInMinutes(date1, date2) {
        const diffInMs = date2 - date1;
        return diffInMs / (1000 * 60);
    }
    getDifferenceInSeconds(date1, date2) {
        const diffInMs = date2 - date1;
        return diffInMs / 1000;
    }
    CleanCode(str) {
        return str.replace(/\W/g, "_"); // "\u001d"
    }
    AddToBase(scanned, prodInfo) {
        return __awaiter(this, void 0, void 0, function* () {
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
                let codeData;
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
                const isIndividual = !!prodInfo.ExpireDate || !!sgtin;
                const newCats = [];
                const catalogDataArr = prodInfo.Dump.catalogData;
                let catalogDataObj;
                if (catalogDataArr && catalogDataArr.length > 0) {
                    const catalogData = catalogDataArr[0];
                    let imageUrl = catalogData.good_img;
                    if (!imageUrl && catalogData.good_images && catalogData.good_images.length > 0) {
                        imageUrl = catalogData.good_images[0].photo_url;
                    }
                    if (!producer)
                        producer = catalogData.producer_name;
                    const catalogGoodId = catalogData.good_id;
                    const catalogBrandId = catalogData.brand_id;
                    if (!gtin && catalogData.identified_by) {
                        const idents = catalogData.identified_by;
                        const ident = idents.find(ide => ide.level === "trade-unit");
                        if (ident) {
                            gtin = ident.value;
                        }
                    }
                    catalogDataObj = {
                        image_url: imageUrl,
                        catalog_good_id: catalogGoodId,
                        catalog_brand_id: catalogBrandId
                    };
                    catalogData.categories.forEach(categoryItem => {
                        newCats.push({
                            cat_id: categoryItem.cat_id,
                            name: categoryItem.cat_name
                        });
                        // }
                    });
                }
                const post = Object.assign({ cz_id: czId, product_name: productName, category,
                    producer, exp_date: expDate, is_trashed: isTrashed, code,
                    gtin,
                    sgtin,
                    cis, is_individual: isIndividual, ChesZnakDump: JSON.stringify(prodInfo.Dump) }, catalogDataObj);
                console.log("begin transaction...");
                const dbCon = yield this.dbPool.getConnection();
                yield dbCon.beginTransaction();
                let isExists = isIndividual;
                let existRow;
                if (isIndividual) {
                    console.log("individual");
                    const [rowsExist, fieldsExist] = yield dbCon.execute(`SELECT * FROM prods WHERE code='${post.code}'`);
                    if (rowsExist && rowsExist.length !== 0) {
                        // console.log("exists rows", rowsExist);
                        isExists = true;
                        existRow = rowsExist[0];
                    }
                    else {
                        isExists = false;
                    }
                }
                if (!isExists) {
                    console.log("adding new prod", post.code);
                    yield dbCon.query('INSERT INTO prods SET ?', post);
                    const [rows1, fields1] = yield dbCon.query('SELECT LAST_INSERT_ID() as lastId');
                    const prodId = rows1[0].lastId;
                    // console.log("rows1", rows1);
                    // console.log("last id", rows1[0].lastId);
                    // console.log("fields1", fields1);
                    newCats.forEach((catNew) => __awaiter(this, void 0, void 0, function* () {
                        const [rows, fields] = yield dbCon.execute(`SELECT * FROM catalog_categories WHERE cat_id=${catNew.cat_id}`);
                        // console.log("check exist cat", catNew);
                        // console.log("rows", rows);
                        // console.log("fields", fields);
                        if (!rows || rows.length === 0) {
                            console.log("inserting new cat");
                            yield dbCon.query('INSERT INTO catalog_categories SET ?', catNew);
                        }
                        const prodToCat = {
                            prod: prodId,
                            category: catNew.cat_id
                        };
                        yield dbCon.query('INSERT INTO prods_by_caterories SET ?', prodToCat);
                    }));
                }
                else {
                    // console.log("Prod exists!");
                    // const msg = `prod already exists. code=${String(post.code)}`;
                    console.log("Prod exists", `prod already exists. code=${this.CleanCode(post.code)}`);
                    // console.log("Prod exists", `prod already exists.`);
                    // console.log("post", post);
                    // console.log("code", post.code);
                    // console.log("code", post.code.toString());
                    // console.log("code", typeof post.code);
                    // console.log("Prod exists __ 1!");
                    if (existRow && !existRow.ChesZnakDump) {
                        console.log(`Update ChesZnakDump id=${existRow.id}`);
                        // await dbCon.execute(`UPDATE prods SET ChesZnakDump = '${JSON.stringify(prodInfo.Dump)}' WHERE id = ${existRow.id}`,
                        yield dbCon.query(`UPDATE prods SET ? WHERE ?`, [{ ChesZnakDump: JSON.stringify(prodInfo.Dump) }, { id: existRow.id }]);
                    }
                    Scanner.Say("Этот товар уже отсканирован");
                }
                console.log("committing transaction...");
                yield dbCon.commit();
                if (dbCon)
                    dbCon.release();
            }
        });
    }
    OnSacnned(data, format) {
        return __awaiter(this, void 0, void 0, function* () {
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
                (0, printerutils_1.PrintText)(Scanner.WrapText(qrFound.Text, 33), printerutils_1.page33);
                return;
            }
            // =================================================================
            // Пробуем через честный знак
            try {
                const prodInfo = yield chestznak_1.ChesZnak.GetData(data);
                if (prodInfo) {
                    // console.log("prodInfo", prodInfo);
                    console.log("ChesZnak success");
                    // Записываем дамп
                    const filePath = `${__dirname}/scans/scan_${Date.now()}.json`;
                    try {
                        fs_1.default.writeFileSync(filePath, `Scanned: "${data}"\n\n${JSON.stringify(prodInfo.Dump)}`);
                    }
                    catch (error) {
                        console.error("Error write scan", error);
                    }
                    try {
                        this.AddToBase(data, prodInfo);
                    }
                    catch (error) {
                        console.error("Error save in Base", error);
                    }
                    yield Scanner.Say(prodInfo.Name);
                    if (prodInfo.ExpireDate) {
                        const now = Date.now();
                        const expDate = new Date(prodInfo.ExpireDate);
                        const diff = this.getDifferenceInDays(now, prodInfo.ExpireDate);
                        // console.log("diff", diff);
                        // console.log("Math.abs(diff)", Math.abs(diff));
                        const dayStr = (0, utils_1.dayLetters)(Math.abs(Math.floor(diff)));
                        if (diff <= 0) {
                            console.log("now", now);
                            console.log("prodInfo.ExpireDate", prodInfo.ExpireDate);
                            yield Scanner.Say(`Просрочено на ${dayStr}`);
                        }
                        else {
                            // const dateStr = expDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'numeric', day: 'numeric' });
                            // const dateStr = `${expDate.getDate()} ${expDate.getMonth() + 1} ${expDate.getFullYear()}`;
                            yield Scanner.Say(`Годен ещё ${dayStr}`);
                            // await Scanner.Say(dateStr);
                        }
                    }
                    return;
                }
            }
            catch (error) {
                console.log("Error!", error);
            }
            const barcodeData = yield this.barcodeDb.GetBarcodeData(data);
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
        });
    }
    datediff(first, second) {
        // Take the difference between the dates and divide by milliseconds per day.
        // Round to nearest whole number to deal with DST.
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    }
    GetExistProds() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rowsExist, fieldsExist] = yield this.dbPool.execute(`SELECT * FROM prods WHERE is_trashed=0 ORDER BY exp_date IS NULL, exp_date`);
                return rowsExist.map(prod => {
                    // Проценты просрочки относительно недели
                    let expPercent = 0;
                    let daysLeft;
                    if (!prod.exp_date) {
                        expPercent = 100;
                    }
                    else {
                        const fullDays = 30;
                        const dayDiff = this.datediff(Date.now(), prod.exp_date.getTime());
                        daysLeft = dayDiff;
                        // console.log("dayDiff", dayDiff);
                        // console.log("Date.now()", Date.now());
                        // console.log("prod.exp_date.getTime()", prod.exp_date.getTime());
                        if (dayDiff <= 0) {
                            expPercent = 0;
                        }
                        else if (dayDiff >= fullDays) {
                            expPercent = 100;
                        }
                        else {
                            expPercent = dayDiff / fullDays * 100;
                        }
                    }
                    return {
                        name: prod.product_name,
                        img: prod.image_url,
                        expDate: prod.exp_date ? prod.exp_date.toLocaleDateString() : undefined,
                        daysLeft,
                        expPercent
                    };
                });
            }
            catch (error) {
                console.error(error);
                return undefined;
            }
        });
    }
    /*
     select command set DMI or DMW
    \x02\x1BG0\x0d\x0a
    to inches
    \x02n\x0d\x0a
    max label length 8 inches
    \x02M0821\x0d\x0a
    set printing pos (2,14 inch) (distance between paper sensor and print head)
    0120 - 0320 inch
    0305 - 0813 mm
    \x02O0214\x0d\x0a
    set mem switch contents (not care)
    \x02V0\x0d\x0a
    set ejection 1 - on
    \x02\x1Bt1\x0d\x0a
    peeling (cutting) position (inch | mm)
    \x02Kf0070\x0d\x0a
    paper length for continuous
    \x02c0329\x0d\x0a

    graphic input
    C - currnt mem, D - onboard sd-ram
    _ - 8 bit (A - 7bit)
    P - 8bitPCX normal, B - 8bit BMP normal, i - 8bit image format normal
    gfx0 - name of file
    \x02ICPgfx0\x0d\x0a

    *** - graphic data
    \x0d\x0a

    printing contents setting start
    \x02L\x0d\x0a
    pixel size
    D11\x0d\x0a
    ????
    A2\x0d\x0a

    1 - no rotate
    Y - fixed
    1 - horiz expansion 1
    1 - vert expansion 1
    000 - fixed
    row - 0050
    col - 0041
    gfx0 - name
    1Y1100000500041gfx0\x0d\x0a
    1 copy
    Q0001\x0d\x0a
    print!
    E\x0d\x0a

    C - memory module - current ?
    G - graphics data
    gfx0 - name
    \x02xCGgfx0\x0d\x0a

    ???
    \x02zC\x0d\x0a
    */
    /*
    "\x02m\x02\1bw0800\x02c0400\x02KD@AB\x0D" */
    InitSerialPort() {
        const parser = new serialport_1.ReadlineParser({ delimiter: "\r", encoding: "utf8" }); //new 
        this.port = new serialport_1.SerialPort({
            path: "/dev/ttyACM0",
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
            this.OnSacnned(data);
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
            console.log("Port closed", this.port.path);
        });
    }
    static SayCommand(str) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this._isplaying = true;
                // this.lock.acquire("say", (done) => {
                console.log("say enter", str);
                (0, child_process_1.exec)(`spd-say --wait -o rhvoice -l ru -t female1 -r -30 "${str}"`, (error, stdout, stderr) => {
                    // exec(`runuser -l basipuser -c 'spd-say --wait -o rhvoice -l ru -t female1 -r -30 "${str}"'`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(error.message);
                        // done();
                        this._isplaying = false;
                        reject();
                        return;
                    }
                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        // done();
                        this._isplaying = false;
                        reject();
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    this._isplaying = false;
                    // done();
                    resolve();
                });
                // }, (err, ret) => {
                //     console.log("say release");
                // }, { maxOccupationTime: 20000 });
            }).catch((error) => {
                console.error(`reject error: ${error}`);
            });
        });
    }
    static Say(str) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.SILENCE === "1") {
                return;
            }
            str = str.replace("%", "процентов");
            const replaceQuotes = new RegExp('\"', "g");
            str = str.replace(replaceQuotes, " ");
            this._sayArray.push(str);
            if (this._isplaying) {
                console.log("Already saying now");
                return;
            }
            while (this._sayArray.length > 0) {
                const strTosay = this._sayArray.splice(0, 1)[0];
                if (strTosay) {
                    console.log("Saying", strTosay);
                    yield this.SayCommand(strTosay);
                }
            }
            return;
        });
    }
    InitMysql() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Get mysql connection for login '${process.env.DB_LOGIN}' ...`);
                // this.dbCon = await mysql.createConnection({
                //     database: 'prods',
                //     host: "localhost",
                //     // socketPath: '/run/mysqld/mysqld.sock',
                //     user: process.env.DB_LOGIN,
                //     password: process.env.DB_PASSWORD
                // });
                this.dbPool = yield promise_1.default.createPool({
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
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    Init() {
        return __awaiter(this, void 0, void 0, function* () {
            Scanner.Instance = this;
            Scanner.lock = new async_lock_1.default();
            // dotenv.config({ path: '../.env' });
            this.InitMysql();
            this.barcodeDb = new barcodedb_1.BarcodeDb();
            yield this.barcodeDb.OpenDb();
            // Стартовые тесты
            // const barcodeData = await this.barcodeDb.GetBarcodeData("7622201771027");
            // console.log(barcodeData);
            console.log("Init scanner monitoring...");
            //  Detect scanner 05f9:4204
            //usbDetect.startMonitoring();
            /*
                usbDetect.startMonitoring() & usbDetect.stopMonitoring()
                There is no direct equivalent to these methods.
                This is handled automatically for you when you add and remove event listeners.
            */
            usb_1.usb.refHotplugEvents();
            usb_1.usb.on('attach', (device) => {
                console.log('adding');
                console.log('add', device);
                /*
                    There is no equivalent to filter based on the vid or pid, instead you should do a check inside the callback you provide.
                    The contents of the device object has also changed.
                */
                //!!!this.OpenPort();
                // usbDetect.find(0x05f9, 0x4204, (err, devices) => {
                //     console.log('find', devices, err);
                // });
                // const dev = usb.findByIds(0x05f9, 0x4204);
                // console.log('find', dev);
            });
            usb_1.usb.on("detach", (device) => {
                //TODO need filter!
                console.log('removing');
                console.log('remove', device);
                //!!!this.ClosePort();
            });
            /*!!!
            usbDetect.find(0x05f9, 0x4204, (err, devices) => {
                console.log('find', devices, err);
                this.OpenPort();
            });*/
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
    Exit() {
        this.ClosePort();
        // this.dbCon.destroy();
        // this.dbPool.destroy();
    }
}
exports.Scanner = Scanner;
Scanner._sayArray = [];
// const ScannerInstance: Scanner = new Scanner();
// ScannerInstance.Init();
// export { ScannerInstance };
// module.exports = ScannerInstance;
//# sourceMappingURL=scanner.js.map