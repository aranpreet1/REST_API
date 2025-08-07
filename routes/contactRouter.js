const express = require ('express');
const { fetchAll,fetchById, createContact, updateById, deleteById } = require('../controller/appController');
const router = express.Router();

//get all task
router.get('/', fetchAll);

//get by id
router.get('/:id', fetchById);

//post 
router.post('/', createContact);

//put 
router.put('/:id', updateById);

//delete 
router.delete('/:id', deleteById);


module.exports = router;