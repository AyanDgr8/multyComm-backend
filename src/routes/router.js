// src/routes/router.js

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authMiddleware } from '../middlewares/auth.js';
import { Users } from '../models/users.js';
// import "firebase/firestore";

const router = Router();

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

// Secret key for refresh token signing
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_token_secret';

// To generate access token
const generateAccessToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '10m' });
};

// To generate refresh token
const generateRefreshToken = () => {
  return jwt.sign({}, REFRESH_TOKEN_SECRET, { expiresIn: '24h' }); // Refresh token expires in 24 hours
};



// ***************************

// Endpoint for registration
router.post('/user-register', async (req, res) => {
  try {
    const { username, password, firstName, lastName, email, phone, dob, gender } = req.body;

    // Check if the user already exists
    const existingUser = await Users.findOne({ $or: [{ email }, { phone }, { username }] });

    if (existingUser) {
      let message = '';
      if(existingUser.username === username){
        message = 'Username is already in use';
      } 
      else if (existingUser.email === email) {
        message = 'Email is already in use';
      } 
      else  {
        message = 'Phone number is already in use';
      } 
      return res.status(400).json({ message });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      phone,
      dob,
      gender,
    });

    await newUser.save();

    // Create a JWT token and refresh token for the registered user
    const accessToken = generateAccessToken(newUser._id, newUser.email);
    const refreshToken = generateRefreshToken();

    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken,
      userId: newUser._id,
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});




// ***************************




// Endpoint for login
router.post('/user-login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body; 

    // Check if the user exists by username or email
    const user = await Users.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] }); 

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Create a JWT token and refresh token for the authenticated user
    const accessToken = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken();

    res.status(200).json({ accessToken, refreshToken, userId: user._id });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});





// ***************************






// Define the route to fetch user data
router.get('/user-data', authMiddleware, async (req, res) => {
  try {


    // The user ID is already attached to the request object by the authMiddleware
    const userId = req.userId;

    // Find the user by ID in the database
    const user = await Users.findById(userId);

    // If user not found, return an error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user found, return the user data
    res.status(200).json(user);
  } catch (error) {
    // Handle errors
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});





// ******************************




// Endpoint for forgot password with improved error handling and validation
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Basic email validation (add more thorough validation if needed)
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Check if email exists
    const user = await Users.findOne({ email });

    if (!user) {
      // Informative error message for not found email
      return res.status(400).json({ message: 'The email address you entered is not associated with an account.' });
    }

    // If email exists, proceed with sending the password reset email
    // Generate a reset token
    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

    // Construct the reset link with Firebase (assuming you have it configured)
    const resetLink = `https://MultyComm.firebaseapp.com/reset-password?token=${resetToken}`;

    // Send reset link to user's email using Firebase
    await firebase.auth().sendPasswordResetEmail(email, resetLink);
    console.log(`Reset link sent to ${email}`);
    res.status(200).json({ exists: true, message: 'Reset link sent successfully' });
  } catch (error) {
    console.error('Error sending reset link:', error);
    res.status(500).json({ message: 'An error occurred while processing your request. Please try again later.' }); // Generic error message
  }
});





// ***************************




// Endpoint for verifying OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    // Check if email exists
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    // Clear OTP and generate new access and refresh tokens
    user.otp = '';
    await user.save();

    const accessToken = generateAccessToken(user._id, user.email);
    const refreshToken = generateRefreshToken();

    res.status(200).json({ accessToken, refreshToken, userId: user._id });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ***************************

// JWT authorization
router.get('/protected-route', authMiddleware, async (req, res) => {
  try {
    const userData = await Users.findById(req.userId);
    if (userData) {
      res.json({ message: 'User data retrieved successfully', data: userData });
    } else {
      res.status(404).json({ message: 'User data not found' });
    }
  } catch (error) {
    // Handle errors
    console.error('Error retrieving user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




export default router;
