const express = require ('express');
const { contactRouter } = require('./routes');

require('dotenv').config();

const app = express();

app.use(express.json()); //POST,PUT
app.use(express.urlencoded({ extended: true }));



app.use('/api/contact', contactRouter);

const port = process.env.PORT || 8000;
app.listen (port, ()=>{
    console.log(`Server is at http://localhost:${port}`);
});