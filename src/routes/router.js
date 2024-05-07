// src/routes/router.js

import { Router } from 'express';

// import { UserDetailsBookform } from '../models/multyForm.js';
import { UserBasicDetailsBookform } from '../models/register.js';

const router = Router();

// Common function to handle saving user details
const saveUserDetails = async (req, res, UserDetailsModel) => {
  try {
    const user = new UserDetailsModel(req.body);
    const savedUser = await user.save();
    console.log('User details saved successfully:', savedUser);
    res.json(savedUser);
  } catch (error) {
    console.error('Error saving user details:', error);
    res.status(500).json({ error: error.message });
  }
};

// // Endpoint for user details from bookform
// router.post('/user-details-bookform', async (req, res) => {
//   await saveUserDetails(req, res, UserDetailsBookform);
// });

// Endpoint for user details from bookform
router.post('/user-basic-details-bookform', async (req, res) => {
await saveUserDetails(req, res, UserBasicDetailsBookform);
});


export default router;







