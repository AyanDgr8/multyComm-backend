// src/middlewares/auth.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
    try {
        // Extract the JWT token from the Authorization header
        const token = req.headers.authorization.split(' ')[1];
        
        // Verify the JWT token using the secret key
        const userInfo = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user ID and username to the request object for further processing
        req.userId = userInfo.id;
        req.userName = userInfo.name;
        
        // Proceed to the next middleware or route handler
        next(); 
    } catch(err) {
        // Handle authentication failure
        res.status(401).json({
            errorDesc: "Authentication failed!",
            error: err.message // Send error message from JWT verification
        });
    }
};

export { authMiddleware } ;
