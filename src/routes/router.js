// src/routes/router.js

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authMiddleware } from '../middlewares/auth.js';
import { Users } from '../models/users.js';
import { sendPasswordReset } from '../middlewares/firebase.js';
import nodemailer from 'nodemailer';

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



// Function to update user's password in the database
const updateUserPassword = async (email, newPassword) => {
  try {
    // Hash the new password before saving it to the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Find the user by email and update the password
    const updatedUser = await Users.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword } },
      { new: true } // Return the updated user document
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  } catch (error) {
    throw new Error(`Error updating user password: ${error.message}`);
  }
};



// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();





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

// ******************************




// Endpoint for forgot password with improved error handling and validation

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists in your user database
    const user = await Users.findOne({ email });

    if (!user) {
      // Informative error message for not found email
      return res.status(400).json({ message: 'The email address you entered is not associated with an account.' });
    }

    // Use Firebase to send the password reset email
    await sendPasswordReset(email); 

    // Send success response
    console.log(`Password reset link sent to ${email}`);
    res.status(200).json({ exists: true, message: 'Reset link sent successfully' });
    } catch (error) {
    console.error('Error sending reset link:', error);
    res.status(500).json({ message: 'An error occurred while processing your request. Please try again later.' }); 
  }
});




// ***************************


// Endpoint for sending OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user exists by email
    const user = await Users.findOne({ email });

    if (!user) {
      // Informative error message for not found email
      return res.status(400).json({ message: 'The email address you entered is not associated with an account.' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password Link',
      text: `http://localhost:3000/reset-password/${user._id}/${token}`
    };

    // Send mail
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      } else {
        return res.status(200).json({ message: 'OTP sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ******************


// Endpoint for resetting password through Firebase

router.post('/reset-password/:id/:token', (req, res) => {
  const { id, token } = req.params
  const { newPassword } = req.body

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if(err) {
          return res.json({Status: "Error with token"})
      } else {
          bcrypt.hash(newPassword, 10)
          .then(hash => {
            Users.findByIdAndUpdate(id, {password: hash})
            .then(() => res.json({ Status: 'Success' }))
            .catch(err => res.json({ Status: err.message }));
          })
          .catch(err => res.json({ Status: err.message }));
      }
  })
})


// ***************************



// Endpoint for verifying OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Check if email exists
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the OTP
    user.password = hashedPassword;
    user.otp = '';
    await user.save();

    // Generate new tokens
    // const accessToken = generateAccessToken(user._id, user.email);
    // const refreshToken = generateRefreshToken();

    res.status(200).json({ accessToken, refreshToken, userId: user._id, message: 'Password reset successfully' });
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
