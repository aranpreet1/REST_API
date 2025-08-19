const db = require("../database");

const XLSX = require("xlsx");


 const fetchByIdService = async(id)=>{
        if (!id || isNaN(id)) {
          throw new Error("Invalid contact ID");
        }
        const conn = await db.getConnection();
        const query = `SELECT * FROM CONTACT where id=${id}`;
        const [rows]= await conn.execute(query);
        return rows;
};

const fetchAllService = async (phonenumber, id, email) => {
    const conn = await db.getConnection();

    let query = `SELECT * FROM CONTACT WHERE 1=1`;
    const params = [];

    if (phonenumber !== undefined) {
        query += ` AND phonenumber = ?`;
        params.push(phonenumber);
    }
    if (email !== undefined) {
        query += ` AND email = ?`;
        params.push(email);
    }
    if (id !== undefined) {
        query += ` AND id = ?`;
        params.push(id);
    }

    const [data] = await conn.execute(query, params);
    conn.release();

    return data; // return just the array of contacts
};




const fetchByMailService = async (email, phonenumber, excludeID) => {
    const conn = await db.getConnection();
    const query = `SELECT * FROM CONTACT WHERE (EMAIL = ? OR PHONENUMBER = ?) AND ID != ?`;
    const [rows] = await conn.execute(query, [email, phonenumber, excludeID]);
    conn.release();
    return rows;
};

const updateByIdService = async (username, email, phonenumber, id)=>{
            conn = await db.getConnection();
            const query =`UPDATE CONTACT SET USERNAME = ?, EMAIL = ?, PHONENUMBER = ? WHERE ID = ?`;
            const [result] = await conn.execute(query, [username , email, phonenumber, id]);
            return result;

};

const deleteByIdService = async (id)=>{
         conn = await db.getConnection();
        const query = `DELETE FROM CONTACT where id=${id}`;
        const [result]= await conn.execute(query, [id]);
        return result;
}


async function createContactService( username, email, phonenumber) {
    conn = await db.getConnection();
    const query = "INSERT INTO CONTACT (USERNAME, EMAIL, PHONENUMBER) VALUES (?, ?, ?)";
    const [result] = await conn.execute(query, [username, email, phonenumber]);

    return {
        id: result.insertId,
        username,
        email,
        phonenumber
    };
}

function parseExcelToUsers(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; 
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

 
  const users = rows.map((r, idx) => {
    const username = String(r.username ?? r.Username ?? r.USERNAME ?? '').trim();
    const email = String(r.email ?? r.Email ?? r.EMAIL ?? '').trim();
    const phone = String(r.phone ?? r.Phone ?? r.PHONE ?? '').trim();
    return { username, email, phone, _row: idx + 2 }; 
  });
 
  return users.filter(u => u.username || u.email || u.phone);
}

async function insertUsers(users) {
  if (!users.length) return { inserted: 0, failed: 0, errors: [] };

  const conn = await db.getConnection();
  try {

    const sql = 'INSERT INTO CONTACT (USERNAME, EMAIL, PHONENUMBER) VALUES (?, ?, ?)';
    let inserted = 0;
    const errors = [];
    

    let chkDup = `SELECT * FROM CONTACT WHERE `;



    // Validation regexes
    const usernameRegex = /^[A-Za-z\s]+$/; // only letters + spaces
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // basic email format
    const phoneRegex = /^\d{10}$/; // exactly 10 digits

    for (const u of users) {
      // Normalize fields
      const username = String(u.username || '').trim();
      const email = String(u.email || '').trim();
      const phone = String(u.phone || '').replace(/\D/g, '').trim(); // remove non-digits
     
      // Username validation
      if (!username) {
        errors.push({ row: u._row,...u, error: 'Username is required' });
        continue;
      }
      if (!usernameRegex.test(username)) {
        errors.push({ row: u._row,...u, error: 'Username must contain only letters and spaces' });
        continue;
      }

      // Email validation
      if (!email) {
        errors.push({ row: u._row,...u, error: 'Email is required' });
        continue;
      }
      if (!emailRegex.test(email)) {
        errors.push({ row: u._row,...u, error: 'Invalid email format' });
        continue;
      }

      // Phone validation
      if (!phone) {
        errors.push({ row: u._row,...u, error: 'Phone number is required' });
        continue;
      }
      if (!phoneRegex.test(phone)) {
        errors.push({ row: u._row,...u, error: 'Phone must be exactly 10 digits' });
        continue;
      }
      let duplicate = [];
      let checkEmail = chkDup + `Email = "${email}"`
      let [checkEmailres] = await conn.execute(checkEmail);
      if(checkEmailres.length > 0){
       duplicate.push("email")
      }
      let checkPhone = chkDup + `phonenumber = "${phone}"`
      let [checkPhoneres] = await conn.execute(checkPhone);
      if(checkPhoneres.length > 0){
        duplicate.push("phone")
      }
      let checkuser = chkDup + `username = "${username}"`
      let [checkuserres] = await conn.execute(checkuser);
      if(checkuserres.length > 0){
        duplicate.push("username")
      }
      if(duplicate.length){
        errors.push({ row: u._row,...u, error: 'Duplicate entry: ' + duplicate.join(' , ') });
        continue;
      }
      // Insert into DB
      try {
        await conn.execute(sql, [username, email, phone]);
        inserted += 1;
      } catch (e) {
        errors.push({ row: u._row,...u, error: e.message = 'ER_DUP_ENTRY'  ? "Duplicate entry" : e.message});
      }
    }
   
    return { inserted, failed: errors.length, errors };

  } catch (e) {
    console.log(e)
    throw e;
  } finally {
    conn.release();
  }
}




module.exports = {
        fetchAllService,
        fetchByMailService,
        fetchByIdService,
        createContactService,
        updateByIdService,
        deleteByIdService,
        parseExcelToUsers,
        insertUsers,
}
