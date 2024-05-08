// src/routes/router.js

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authMiddleware } from '../middlewares/auth.js';
import { UserRegisterDetailsForm } from '../models/register.js';
import { UserLoginDetailsForm } from '../models/login.js';

const router = Router();

// Endpoint for registration 
router.post('/user-register-details-bookform', async (req, res) => {
  try {
    const { username, password, firstName, lastName, phone, email } = req.body;

    // Check if the user already exists
    const existingUser = await UserRegisterDetailsForm.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserRegisterDetailsForm({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      email,
    });

    await newUser.save();

    // Create a JWT token for the registered user
    const token = jwt.sign(
      { 
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone
      },
      process.env.JWT_SECRET
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      userId: newUser._id,
    });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ message: 'Email address already in use' });
    }

    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});




// *****************

// Endpoint for login
router.post('/user-login-details-bookform', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await UserLoginDetailsForm.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Create a JWT token for the authenticated user with expiration time
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


//  JWT authorization
router.get('/protected-route', authMiddleware, async (req, res) => {
  try {

    const userData = await UserDataModel.findById(req.userId);
    if (userData) {
      res.json({ message: 'User data retrieved successfully', data: userData });
    } else {
      res.status(404).json({ message: 'User data not found' });
    }
  } catch (error) {
    console.error('Error retrieving user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;


