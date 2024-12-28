"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BarcodeDb = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
class BarcodeDb {
    /**
     *
     */
    constructor() {
        this.dbPath = path_1.default.resolve(__dirname, '../db/barcodes.db');
        this.dbSrsPath = path_1.default.resolve(__dirname, '../db_src/uhtt_barcode_ref_all.csv');
        sqlite3_1.default.verbose();
        if (!fs_1.default.existsSync(this.dbPath)) {
            console.log("File not found", this.dbPath);
        }
        // open({
        //     filename: this.dbPath,
        //     driver: sqlite3.cached.Database
        // }).then((db) => {
        //     this.db = db;
        //     console.log("Database opened");
        //     // if (fs.existsSync(this.dbSrsPath)) {
        //     //     this.InitDbFromFile();
        //     // }
        // }).catch(err => {
        //     console.log(err);
        // });
        // (async () => {
        //     try {
        //         this.db = await open({
        //             filename: this.dbPath,
        //             driver: sqlite3.cached.Database
        //         });
        //         console.log("Database opened");
        //         if (fs.existsSync(this.dbSrsPath)) {
        //             this.InitDbFromFile();
        //         }
        //     } catch (error) {
        //         console.log(error);
        //     }
        // })();
    }
    async OpenDb() {
        try {
            this.db = await (0, sqlite_1.open)({
                filename: this.dbPath,
                driver: sqlite3_1.default.cached.Database
            });
            console.log("Database opened");
            // if (fs.existsSync(this.dbSrsPath)) {
            //     this.InitDbFromFile();
            // }
        }
        catch (error) {
            console.log(error);
        }
    }
    async GetBarcodeData(code) {
        const result = await this.db.all('SELECT * FROM barcodes WHERE UPCEAN = ?', code);
        // console.log(result);
        return result;
    }
}
exports.BarcodeDb = BarcodeDb;
/*
CREATE TABLE barcodes (
    Id INTEGER PRIMARY KEY,
    UPCEAN TEXT NOT NULL,
    Name TEXT NOT NULL,
    CategoryID TEXT,
    CategoryName TEXT,
    BrandID TEXT,
    BrandName TEXT
);
*/ 
//# sourceMappingURL=barcodedb.js.map