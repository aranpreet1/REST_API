const express = require ('express');
const { fetchAll,fetchById, createContact, updateById, deleteById } = require('../controller/appController');
const router = express.Router();

//get all contacts
router.get('/', fetchAll);

//get contacts by id
router.get('/:id', fetchById);

//post (create new contacts)
router.post('/', createContact);

//put  (update existing contact via id)
router.put('/:id', updateById);

//delete  (delete contact via id)
router.delete('/:id', deleteById);


module.exports = router;