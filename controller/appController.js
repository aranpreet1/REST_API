const db = require("../database");
const {createContactService,fetchByMailService,updateByIdService,fetchByIdService,fetchAllService} = require('../service/appContactService')

const createContact = async(req,resp)=>{
    let conn;
    try {
        conn = await db.getConnection();
        console.log("req  body", req.body); 
        const {username, email, phonenumber} = req.body;
        const result = await createContactService(conn, { username, email, phonenumber });
         resp.status(201).json({ data: result });
    }catch(err){
            console.log('failed to create contact', err.stack || err);
            resp.status(500).json({error: "failed to create task"});
    }finally{
        if (conn) conn.release();
    }
} 

const fetchAll = async(req,resp)=>{
        let conn;
    try {
        conn = await db.getConnection();
        console.log("req  body", req.body); 
        const {username, email, phonenumber} = req.query;
        const result = await fetchAllService(conn, { username, email, phonenumber });
        resp.status(200).json({data: result});
    }catch(err){
            console.log('failed to get contact', err.stack || err);
            resp.status(500).json({error: "failed to get task"});

    }finally{
        if (conn) conn.release();
    }
    }

const fetchById = async(req,resp)=>{
            let conn;
    try {
        const id = parseInt(req.params.id);
        const contacts = await fetchByIdService(id);
        resp.status(200).json({data: contacts});
    }catch(err){
            console.log('failed to get contact', err.stack || err);
            resp.status(500).json({error: "failed to get task"});

    }finally{
        //to realease db connection
        if (conn) conn.release();
    }

}

const updateById = async(req,resp)=>{
    let conn;
    try {
        conn = await db.getConnection();
        const id = parseInt(req.params.id);
        const { username, email, phonenumber } = req.body;
        const existingContacts = await fetchByMailService(email, phonenumber, id);

        if(Array.isArray(existingContacts) && existingContacts.length > 0){
            return resp.status(404).json({ message: "Another contact already exists with this email or phone number" });
        } 
            const result = await updateByIdService(conn, { username, email, phonenumber, id });
            console.log(" UPDATED RESULT->",result);
            if (result.affectedRows === 0) {
            return resp.status(404).json({ message: "No contact found with the given ID" });
        }
            resp.status(200).json({data:" contacts updated successfully"});
    }catch(err){
            console.log('failed to update contact', err.stack || err);
            resp.status(500).json({error: "failed to update task"});
    }finally{
        //to realease db connection
        if (conn) conn.release();
    }
}

const deleteById = async(req,resp)=>{
try {
        const id = parseInt(req.params.id);
        conn = await db.getConnection();
        const query = `DELETE FROM CONTACT where id=${id}`;
        const [result]= await conn.execute(query);
        console.log('delete contact', result);
        resp.status(200).json({data: 'contact deleted'});
    }catch(err){
            console.log('failed to delete contact', err.stack || err);
            resp.status(500).json({error: "failed to delete task"});

    }finally{
        //to realease db connection
        if (conn) conn.release();
    }
    
    
}

module.exports= {
    createContact,
    fetchAll,
    fetchById,
    updateById,
    deleteById
}