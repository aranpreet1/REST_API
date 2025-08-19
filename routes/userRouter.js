const express = require("express");
const { signUpController } = require("../controller/authController");

const router = express.Router();

// POST /api/user/signup
router.post("/signup", signUpController);

module.exports = {userRouter:router};
