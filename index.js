const express = require('express');
const { contactRouter } = require('./routes/contactRouter');
const { authRouter } = require('./routes/authRouter');
const cors = require('cors');
const bcrypt  =  require("bcryptjs")
require('dotenv').config();

const app = express();
app.use(cors())
app.use(express.json()); //POST,PUT
app.use(express.urlencoded({ extended: true }));



// const plainText = "admin";

// // generate salt + hash
// const hashPassword = async () => {
//   const hashed = await bcrypt.hash(plainText, 10); // 10 = salt rounds
//   console.log("Hashed password:", hashed);
// };

// hashPassword();

app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: "API not found" });
});

const port = process.env.PORT || 8000;
app.listen (port, ()=>{
    console.log(`Server is at http://localhost:${port}`);
});