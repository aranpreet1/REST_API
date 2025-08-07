const db = require("../database");

 const fetchService = async(id)=>{
        conn = await db.getConnection();
        const query = `SELECT * FROM CONTACT where id=${id}`;
        const [rows]= await conn.execute(query);
        return rows;
}

const fetchByMailService = async (email, phonenumber, excludeID) => {
    const conn = await db.getConnection();
    const query = `SELECT * FROM CONTACT WHERE (EMAIL = ? OR PHONENUMBER = ?) AND ID != ?`;
    const [rows] = await conn.execute(query, [email, phonenumber, excludeID]);
    conn.release();
    return rows;
};


async function createContactService(conn, { username, email, phonenumber }) {
    const query = "INSERT INTO CONTACT (USERNAME, EMAIL, PHONENUMBER) VALUES (?, ?, ?)";
    const [result] = await conn.execute(query, [username, email, phonenumber]);

    return {
        id: result.insertId,
        username,
        email,
        phonenumber
    };
}


module.exports = {
        fetchByMailService,
        fetchService,
        createContactService
}
