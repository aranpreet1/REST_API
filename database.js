const mysql = require ('mysql2/promise');
require('dotenv').config(); // Load 

class Database{
    constructor(){
        if (!Database.instance) {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                queueLimit: 0
            });
            Database.instance = this;
        }
    }
    async getConnection(){
        try{
            return await this.pool.getConnection();
        }catch(err){
            console.log('error while getting a connection',err);
            throw err;
        }
    }
}

module.exports = new Database();
