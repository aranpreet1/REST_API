const mysql = require ('mysql2/promise');

class Database{
    constructor(){
        if(!Database.instance){
            this.pool=mysql.createPool({
                host: 'localhost',
                user: 'root',
                password:'admin',
                database:'contact_info',
                waitForConnections: true,
                connectionLimit: 10,
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
