const db = require("../database");
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isPhone = (v) => /^[0-9+\-()\s]{7,20}$/.test(v);
const multer = require("multer");
const XLSX = require("xlsx");


 const fetchByIdService = async(id)=>{
        const conn = await db.getConnection();
        const query = `SELECT * FROM CONTACT where id=${id}`;
        const [rows]= await conn.execute(query);
        return rows;
};

const fetchAllService = async (phonenumber, id, email, page = 1, limit = 10 , search) => {
    const conn = await db.getConnection();

    let query = `SELECT * FROM CONTACT WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) AS total FROM CONTACT WHERE 1=1 and  `;
    const params = [];
    const countParams = [];
    if(search){
      query += `( email like '%${search}%' or username like '%${search}%' or phonenumber like '%${search}% )`
    }
    let search = `SELECT * FROM contact_info.contact where email like '%${search}%' or username like '%${search}%' or phonenumber like '%${search}%';`
    // Filters
    if (phonenumber !== undefined) {
        query += ` AND phonenumber = ?`;
        countQuery += ` AND phonenumber = ?`;
        params.push(phonenumber);
        countParams.push(phonenumber);
    }
    if (email !== undefined) {
        query += ` AND email = ?`;
        countQuery += ` AND email = ?`;
        params.push(email);
        countParams.push(email);
    }
    if (id !== undefined) {
        query += ` AND id = ?`;
        countQuery += ` AND id = ?`;
        params.push(id);
        countParams.push(id);
    }

    // Pagination (safe integer injection)
    const safeLimit = Math.max(1, parseInt(limit) || 10);
    const safeOffset = Math.max(0, (parseInt(page) - 1) * safeLimit);

    query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;

    // Execute
    const [data] = await conn.execute(query, params);
    const [countRows] = await conn.execute(countQuery, countParams);

    conn.release();

    const totalItems = countRows[0]?.total || 0;
    const totalPages = Math.ceil(totalItems / safeLimit);

    return {
        data,
        pagination: {
            totalItems,
            totalPages,
            currentPage: parseInt(page) || 1,
            pageSize: safeLimit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
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
    await conn.beginTransaction();

    const sql = 'INSERT INTO CONTACT (USERNAME, EMAIL, PHONENUMBER) VALUES (?, ?, ?)';
    let inserted = 0;
    const errors = [];

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
        errors.push({ row: u._row, error: 'Username is required' });
        continue;
      }
      if (!usernameRegex.test(username)) {
        errors.push({ row: u._row, error: 'Username must contain only letters and spaces' });
        continue;
      }

      // Email validation
      if (!email) {
        errors.push({ row: u._row, error: 'Email is required' });
        continue;
      }
      if (!emailRegex.test(email)) {
        errors.push({ row: u._row, error: 'Invalid email format' });
        continue;
      }

      // Phone validation
      if (!phone) {
        errors.push({ row: u._row, error: 'Phone number is required' });
        continue;
      }
      if (!phoneRegex.test(phone)) {
        errors.push({ row: u._row, error: 'Phone must be exactly 10 digits' });
        continue;
      }

      // Insert into DB
      try {
        await conn.execute(sql, [username, email, phone]);
        inserted += 1;
      } catch (e) {
        errors.push({ row: u._row, error: e.code || e.message });
      }
    }

    await conn.commit();
    return { inserted, failed: errors.length, errors };

  } catch (e) {
    await conn.rollback();
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
