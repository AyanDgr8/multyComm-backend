// src/routes/router.js

import { Router } from 'express';
import firebase from './firebase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authMiddleware } from '../middlewares/auth.js';
import { Users } from '../models/users.js';

const router = Router();

// Initialize Firebase authentication
const auth = firebase.auth();


// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

// Secret key for refresh token signing
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_token_secret';

// To generate access token
const generateAccessToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '15m' });
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


// Endpoint for login
router.post('/user-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in the user with email and password using Firebase authentication
    const userCredential = await auth.signInWithEmailAndPassword(email, password);

    // Get the Firebase user
    const firebaseUser = userCredential.user;

    // Check if the user exists in your database
    const user = await Users.findOne({ email: firebaseUser.email });

    if (!user) {
      // If the user doesn't exist, you can handle it accordingly
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate a JWT token for the user
    const accessToken = generateAccessToken(user._id, user.email);

    // Respond with the JWT token
    res.status(200).json({ accessToken, userId: user._id });
  } catch (error) {
    console.error('Firebase authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
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

// ***************************





// // Example Firebase authentication endpoint
// router.post('/firebase-auth', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Sign in the user with email and password
//     const userCredential = await auth.signInWithEmailAndPassword(email, password);
    
//     // Get the Firebase user
//     const firebaseUser = userCredential.user;

//     // Check if the user exists in your database
//     const user = await Users.findOne({ email: firebaseUser.email });

//     if (!user) {
//       // If the user doesn't exist, you can create a new user in your database
//       // Example:
//       // const newUser = new Users({ email: firebaseUser.email });
//       // await newUser.save();
//     }

//     // Generate a JWT token for the user
//     const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

//     // Respond with the JWT token
//     res.status(200).json({ accessToken, userId: user._id });
//   } catch (error) {
//     console.error('Firebase authentication error:', error);
//     res.status(401).json({ message: 'Authentication failed' });
//   }
// });

// // ********************************



// // Endpoint for forgot password
// router.post('/forgot-password', async (req, res) => {
//   try {
//     const { email, phone } = req.body;
//     // Check if either email or phone exists
//     const user = await Users.findOne({ $or: [{ email }, { phone }] });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // Generate and send OTP (implementation depends on your chosen OTP service provider)
//     // Once the OTP is sent, you can store it in the database against the user
//     const otp = generateOTP(); // Example function to generate OTP
//     user.otp = otp;
//     await user.save();
//     // Send OTP to user (implementation depends on your chosen OTP service provider)
//     sendOTP(user.email, user.phone, otp); // Example function to send OTP
//     res.status(200).json({ message: 'OTP sent successfully' });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // ***************************

// // Endpoint for verifying OTP
// router.post('/verify-otp', async (req, res) => {
//   try {
//     const { email, phone, otp } = req.body;
//     // Check if either email or phone exists
//     const user = await Users.findOne({ $or: [{ email }, { phone }] });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // Check if OTP matches
//     if (user.otp !== otp) {
//       return res.status(400).json({ message: 'Invalid OTP' });
//     }
//     // Clear OTP and generate new access and refresh tokens
//     user.otp = '';
//     await user.save();
//     const accessToken = generateAccessToken(user._id, user.email);
//     const refreshToken = generateRefreshToken();
//     res.status(200).json({ accessToken, refreshToken, userId: user._id });
//   } catch (error) {
//     console.error('Error verifying OTP:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // ***************************

// // JWT authorization
// router.get('/protected-route', authMiddleware, async (req, res) => {
//   try {
//     const userData = await Users.findById(req.userId);
//     if (userData) {
//       res.json({ message: 'User data retrieved successfully', data: userData });
//     } else {
//       res.status(404).json({ message: 'User data not found' });
//     }
//   } catch (error) {
//     // Handle errors
//     console.error('Error retrieving user data:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


export default router;
