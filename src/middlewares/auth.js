// src/middlewares/auth.js


import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = async (req, res, next) => {
    try {
        // Extract the JWT token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new Error('Authorization header is missing');
        }

        const token = authHeader.split(' ')[1];
        
        // Verify the access token using the JWT_SECRET
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user by ID
        const rootUser = await Users.findOne({ _id: verifyToken.id });
        if (!rootUser) {
            throw new Error('User not found');
        }

        // Attach token and user info to the request object
        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser._id;
        req.userName = rootUser.username;
        
        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        res.status(401).json({ status: 401, message: 'Unauthorized, no token provided', error: error.message });
    }
};

export { authMiddleware };
