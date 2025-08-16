const db = require("../database");

const authService = async (email) => {
  const conn = await db.getConnection();
  const [rows] = await conn.execute(
    "SELECT email, password FROM users WHERE email = ?",
    [email]
  );
  conn.release();

  return rows[0]; // return the first user or undefined if not found
};

module.exports = { authService };
