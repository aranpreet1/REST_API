const express = require ('express');
const {loginController} = require('../controller/authController')
const router = express.Router();

router.post('/login', loginController)


module.exports = {authRouter:router};