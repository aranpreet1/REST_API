const db = require("../database");

 const fetchByIdService = async(id)=>{
        const conn = await db.getConnection();
        const query = `SELECT * FROM CONTACT where id=${id}`;
        const [rows]= await conn.execute(query);
        return rows;
}

const fetchAllService = async(conn, { username, email, phonenumber})=>{
        const query = `SELECT * FROM CONTACT`;
        const [result]= await conn.execute(query);
        return result;
}

const fetchByMailService = async (email, phonenumber, excludeID) => {
    const conn = await db.getConnection();
    const query = `SELECT * FROM CONTACT WHERE (EMAIL = ? OR PHONENUMBER = ?) AND ID != ?`;
    const [rows] = await conn.execute(query, [email, phonenumber, excludeID]);
    conn.release();
    return rows;
};

const updateByIdService = async (conn, { username, email, phonenumber, id})=>{
            const query =`UPDATE CONTACT SET USERNAME = ?, EMAIL = ?, PHONENUMBER = ? WHERE ID = ?`;
            const [result] = await conn.execute(query, [username , email, phonenumber, id]);
            return result;

}


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
        fetchAllService,
        fetchByMailService,
        fetchByIdService,
        createContactService,
        updateByIdService
}
