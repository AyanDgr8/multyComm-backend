// src/middlewares/auth.js


import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
    try {
        // Extract the JWT token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new Error('Authorization header is missing');
        }

        const accessToken = authHeader.split(' ')[1];
        
        // Verify the access token using the JWT_SECRET
        const userInfo = jwt.verify(accessToken, process.env.JWT_SECRET);
        
        // Attach user ID and username to the request object for further processing
        req.userId = userInfo.userId;
        req.userName = userInfo.username;
        
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

export { authMiddleware };
