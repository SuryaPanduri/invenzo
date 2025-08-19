require('dotenv').config();
// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_PASS:', process.env.DB_PASS);
const mysql = require('mysql2');


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT // optional if 3306
});

pool.getConnection((err,connection) => {
    if (err){
        console.error('MySQL connection failed..',err.message);
    }
    else{
        console.log('MySQL connection is successfull..');
        connection.release();
    }

});

module.exports = pool.promise();