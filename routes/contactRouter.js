const express = require ('express');
const { fetchAll,fetchById, createContact, updateById, deleteById, uploadUsers,exportAll } = require('../controller/appController');
const router = express.Router();
const { upload } = require('../middlewares/uploadmiddleware');
const authMiddleware = require('../middlewares/authMiddleware');




//get all contacts
router.get('/', authMiddleware, fetchAll);

//get contacts by id
router.get('/single/:id',authMiddleware, fetchById);

//post (create new contacts)
router.post('/',authMiddleware, createContact);

//put  (update existing contact via id)
router.put('/:id',authMiddleware, updateById);

//delete  (delete contact via id)
router.delete('/:id',authMiddleware, deleteById);

router.post('/upload',authMiddleware, upload.single('file'), uploadUsers);

router.get('/export',authMiddleware, exportAll);


router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}, this is protected data 🔐` });
});


module.exports = {contactRouter:router};