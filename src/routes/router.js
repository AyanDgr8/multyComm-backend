// src/routes/router.js

import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authMiddleware } from '../middlewares/auth.js';
import { Users } from '../models/users.js';
// import { sendPasswordReset } from '../middlewares/firebase.js';
import nodemailer from 'nodemailer';
import moment from 'moment-timezone';


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



/// Function to update user's password in the database
const updateUserPassword = async (email, newPassword) => {
  try {
    // Hash the new password before saving it to the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Get the current time in IST
    const passwordUpdatedAt = moment().tz('Asia/Kolkata').toDate();

    // Find the user by email and update the password and passwordUpdatedAt
    const updatedUser = await Users.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword, passwordUpdatedAt } },
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
        message = 'Username already exists';
      } 
      else if (existingUser.email === email) {
        message = 'Email already exists';
      } 
      else  {
        message = 'Phone number already exists';
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
      return res.status(401).json({ message: 'Invalid username or email. Please check your credentials and try again.' });
    }

    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
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

    // Convert passwordUpdatedAt to IST
    const passwordUpdatedAtIST = user.passwordUpdatedAt ? moment(user.passwordUpdatedAt).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss.SSSZ') : null;

    // If user found, return the user data
    res.status(200).json({ ...user.toObject(), passwordUpdatedAt: passwordUpdatedAtIST });
  } catch (error) {
    // Handle errors
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// ******************************

// ******************************

router.post('/create-user', async (req, res) => {
  try {
    const { username, password, firstName, lastName, phone, email, dob, gender } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      email,
      dob,
      gender,
      passwordUpdatedAt: null 
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});


// ***************************


router.get('/user/:id', async (req, res) => {
  try {
    const user = await Users.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const createdAtIST = moment(user.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    const updatedAtIST = moment(user.updatedAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
    const passwordUpdatedAtIST = user.passwordUpdatedAt ? moment(user.passwordUpdatedAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') : null;

    res.json({
      ...user.toObject(),
      createdAt: createdAtIST,
      updatedAt: updatedAtIST,
      passwordUpdatedAt: passwordUpdatedAtIST
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

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
      text: `Click on the following link to reset your password: https://multycomm.netlify.app/reset-password/${ user._id }/${ token }`
    };

    // Send mail
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending email' });
      } else {
        return res.status(200).json({ message: 'Reset link sent successfully' });
      }
    });

    // // Send an email:
    // const client = new postmark.ServerClient("b9c1e925-1d9b-4be0-a3e7-78fd021e1ef0");

    // client.sendEmail({
    //   "From": process.env.EMAIL_USER,
    //   "To": email,
    //   "Subject": "Reset Link",
    //   "HtmlBody": "<strong>Hello</strong> user.",
    //   "TextBody": `Click on the following link to reset your password: https://multycomm.netlify.app/${user._id}/${token}`,
    //   "MessageStream": "outbound"
    // });

  } catch (error) {
    console.error('Error sending link:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ******************


// Endpoint for resetting password through Firebase
router.post('/reset-password/:id/:token', (req, res) => {
  const { id, token } = req.params;
  const { newPassword } = req.body;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.json({ Status: "Error with token" });
    } else {
      bcrypt.hash(newPassword, 10)
        .then(hash => {
          const passwordUpdatedAt = moment().tz('Asia/Kolkata').toDate();
          Users.findByIdAndUpdate(id, { password: hash, passwordUpdatedAt })
            .then(() => res.json({ Status: 'Success' }))
            .catch(err => res.json({ Status: err.message }));
        })
        .catch(err => res.json({ Status: err.message }));
    }
  });
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
