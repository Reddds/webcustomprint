"use strict";
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
    OpenDb() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.db = yield sqlite_1.open({
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
        });
    }
    GetBarcodeData(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db.all('SELECT * FROM barcodes WHERE UPCEAN = ?', code);
            // console.log(result);
            return result;
        });
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