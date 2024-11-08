const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token){
        req.user = null;
        next();
    }   

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        req.user = user; // Gán thông tin người dùng vào req.user
        next();
    });
};

module.exports = authenticateToken;
