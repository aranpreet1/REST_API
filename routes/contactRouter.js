const express = require ('express');
const { fetchAll,fetchById, createContact, updateById, deleteById, uploadUsers,exportAll } = require('../controller/appController');
const router = express.Router();
const { upload } = require('../middlewares/uploadmiddleware');


//get all contacts
router.get('/', fetchAll);

//get contacts by id
router.get('/single/:id', fetchById);

//post (create new contacts)
router.post('/', createContact);

//put  (update existing contact via id)
router.put('/:id', updateById);

//delete  (delete contact via id)
router.delete('/:id', deleteById);

router.post('/upload', upload.single('file'), uploadUsers);

router.get('/export', exportAll);


module.exports = router;