const { authService, createUserService} = require("../service/authService.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "mysecretkey";
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await authService(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ username: user.username }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.log("Error in loginController:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const signUpController = async (req,res) =>{
try {
    const { username, email, password } = req.body;
    console.log(req.body);
    // basic checks
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await createUserService(username, email, password);
    res.status(201).json({ message: "User created successfully", data: user });

  } catch (err) {
    console.error("Signup failed:", err.stack || err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Failed to create user" });
  }
};

module.exports = { loginController,signUpController };
