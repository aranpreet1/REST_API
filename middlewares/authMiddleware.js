const jwt = require("jsonwebtoken");
const SECRET_KEY = "mysecretkey";

function authMiddleware(req, res, next){
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 
if (!token) return res.status(401).json({ message: "Access Denied" });
 jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });

    req.user = user;
    next();
  });
}


module.exports = authMiddleware;