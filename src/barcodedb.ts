import fs from "fs";
import readline from 'readline';
import path from "path";
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

export type BarcodeData = {
    ID: number,
    UPCEAN: string,
    Name: string,
    CategoryID: string,
    CategoryName: string,
    BrandID: string,
    BrandName: string

}

export class BarcodeDb {
    private readonly dbPath = path.resolve(__dirname, '../db/barcodes.db');
    private readonly dbSrsPath = path.resolve(__dirname, '../db_src/uhtt_barcode_ref_all.csv');

    private db: Database<sqlite3.Database, sqlite3.Statement>;
    /**
     *
     */
    constructor() {

        sqlite3.verbose();

        if (!fs.existsSync(this.dbPath)) {
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

    public async OpenDb() {
        try {
            this.db = await open({
                filename: this.dbPath,
                driver: sqlite3.cached.Database
            });
            console.log("Database opened");

            // if (fs.existsSync(this.dbSrsPath)) {
            //     this.InitDbFromFile();
            // }
        } catch (error) {
            console.log(error);
        }
    }

    public async GetBarcodeData(code: string): Promise<BarcodeData[]> {
        const result = await this.db.all<BarcodeData[]>('SELECT * FROM barcodes WHERE UPCEAN = ?', code);
        // console.log(result);
        return result;
    }

    /*private async InitDbFromFile() {
        console.log("Load data to database...", this.dbSrsPath);

        // DELETE FROM table_name;
        await this.db.exec('DELETE FROM barcodes');

        const fileStream = fs.createReadStream(this.dbSrsPath);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in input.txt as a single line break.

        let counter: number = 0;
        for await (const line of rl) {
            // Each line in input.txt will be successively available here as `line`.
            // console.log(`Line: ${line}`);

            const spl = line.split("\t");
            if (spl.length !== 7 || isNaN(parseInt(spl[0], 10))) {
                console.log("Not valid data", line);
                continue;
            }

            await this.db.run('INSERT INTO barcodes(Id, UPCEAN, Name, CategoryID, CategoryName, BrandID, BrandName) VALUES (:Id, :UPCEAN, :Name, :CategoryID, :CategoryName, :BrandID, :BrandName)', {
                ':Id': spl[0],
                ':UPCEAN': spl[1],
                ':Name': spl[2],
                ':CategoryID': spl[3],
                ':CategoryName': spl[4],
                ':BrandID': spl[5],
                ':BrandName': spl[6],
            })

            counter++;
            // if(counter > 10) {
            //     break;
            // }

            if (counter % 1000 === 0) {
                console.log(counter);
            }
        }
        console.log("Added", counter);
    }*/
}

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