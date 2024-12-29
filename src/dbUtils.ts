import mysql from "mysql2/promise";

let dbPool: mysql.Pool;


export async function InitMysql() {
    try {
        console.log(`Get mysql connection for login '${process.env.DB_LOGIN}' ...`);
        // this.dbCon = await mysql.createConnection({
        //     database: 'prods',
        //     host: "localhost",
        //     // socketPath: '/run/mysqld/mysqld.sock',
        //     user: process.env.DB_LOGIN,
        //     password: process.env.DB_PASSWORD
        // });

        dbPool = await mysql.createPool({
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
    } catch (error) {
        console.error(error);
    }
}