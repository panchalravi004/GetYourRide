const fs = require('fs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../config');

function logRequest(filename) {
    return (req, res, next) =>{
        fs.appendFile(
            filename,
            `${Date.now()}:${req.ip} ${req.method}: ${req.path}\n`,
            (err,data)=>{
                next()
            }
        )
    }
}

function verifyToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ status: 'Error', message: 'Invalid token' });
    try {
        jwt.verify(token, JWT_SECRET_KEY, (error, decoded)=>{
            if (error) {
                return res.status(401).json({ status: 'TokenExpired', message: 'Invalid token' });           
            }
            req.userId = decoded.userId;
            next();
        });
    } catch (error) {
        return res.status(401).json({ status: 'Error', message: 'Invalid token' });
    }
 };

module.exports = {
    logRequest,
    verifyToken
}