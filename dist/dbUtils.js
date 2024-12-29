"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitMysql = InitMysql;
const promise_1 = __importDefault(require("mysql2/promise"));
let dbPool;
async function InitMysql() {
    try {
        console.log(`Get mysql connection for login '${process.env.DB_LOGIN}' ...`);
        // this.dbCon = await mysql.createConnection({
        //     database: 'prods',
        //     host: "localhost",
        //     // socketPath: '/run/mysqld/mysqld.sock',
        //     user: process.env.DB_LOGIN,
        //     password: process.env.DB_PASSWORD
        // });
        dbPool = await promise_1.default.createPool({
            connectionLimit: 20,
            database: 'prods',
            host: "localhost",
            user: process.env.DB_LOGIN,
            password: process.env.DB_PASSWORD,
            namedPlaceholders: true
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
}
//# sourceMappingURL=dbUtils.js.map