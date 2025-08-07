const express = require ('express');
const { contactRouter } = require('./routes');
const app = express();

app.use(express.json()); //POST,PUT


app.use('/api/contact', contactRouter);

app.listen (8000, ()=>{
    console.log("server is running on port :8000")
});