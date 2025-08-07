const express = require ('express');
const ping = require('../controller/pingController');
const router = express.Router();
//ping router
router.get('/', ping);

module.exports = router;