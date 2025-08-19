const express = require('express');
const { contactRouter } = require('./routes/contactRouter');
const { authRouter } = require('./routes/authRouter');
const cors = require('cors');
const { userRouter } = require('./routes/userRouter');


require('dotenv').config();

const app = express();
app.use(cors())
app.use(express.json()); //POST,PUT
app.use(express.urlencoded({ extended: true }));



app.use("/api/user", userRouter);

app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);


app.use((req, res, next) => {
  res.status(404).json({ error: "API not found" });
});

const port = process.env.PORT || 8000;
app.listen (port, ()=>{
    console.log(`Server is at http://localhost:${port}`);
});