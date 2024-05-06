// src/models/bodyPart.js

import mongoose from 'mongoose';

// const mongoose = require('mongoose');

const bookformSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: [true, "Please enter your First Name"] 
    },

    lastName: { 
        type: String, 
        required: [true, "Please enter your Last Name"] 
    },

    phone: { 
        type: String, 
        required: [true, "Phone number is required"], 
        match: /^\d{10}$/ 
    },

    email: { 
        type: String, 
        required: [true, "Mention your Email address"], 
        match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
    },

    gender:{
        type: String,
        required: [true, "Select your Gender"]
    },

    address: { 
        type: String,
        required: [true, "Address is required"]
    },

    state: { 
        type: String,
        required: [true, "State is required"]
    },

    zip: { 
        type: String, 
        required: [true, "Zip code is required"], 
        match: /^\d{6}$/ 
    },
    
});


const UserDetailsBookform  = mongoose.model("UserDetailsBookform", bookformSchema);

export  { UserDetailsBookform };


