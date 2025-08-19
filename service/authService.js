const db = require("../database");
const bcrypt = require("bcryptjs");
const authService = async (email) => {
  const conn = await db.getConnection();
  const [rows] = await conn.execute(
    "SELECT email, password FROM users WHERE email = ?",
    [email]
  );
  conn.release();

  return rows[0]; // return the first user or undefined if not found
};

async function createUserService(username, email, password) {
  const conn = await db.getConnection();
  try {
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = "INSERT INTO USERS (USERNAME, EMAIL, PASSWORD) VALUES (?, ?, ?)";
    const [result] = await conn.execute(query, [username, email, hashedPassword]);

    return {
      id: result.insertId,
      username,
      email
      // don't return password
    };
  } finally {
    conn.release();
  }
}
module.exports = { authService, createUserService};
