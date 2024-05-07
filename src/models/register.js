// src/models/register.js


import mongoose from 'mongoose';


const registerSchema = new mongoose.Schema({
    
    firstName: { 
        type: String, 
        required: [true, "Please enter your First Name"] 
    },

    lastName: { 
        type: String, 
        required: [true, "Please enter your Last Name"] 
    },

    userId: {
        type: String,
        required: [true, "User ID is required"],
        minLength: [6, "User ID must be at least 6 characters long"],
        match: [/^[a-zA-Z0-9!@#$%^&*()-_+=]{6,}$/, "Please enter a valid userId with at least 6 characters consisting of letters, numbers, and special characters (!@#$%^&*()-_+=)"]
    },

    phone: { 
        type: String, 
        required: [true, "Phone number is required"], 
        match: [/^\d{10}$/, "Please enter a valid phone number"]
    },

    email: { 
        type: String, 
        required: [true, "Mention your Email address"], 
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, "Please enter a valid email address"]
    },

    password:{
        type: String,
        required: [true, "Password is required"],
    },
    
    gender:{
        type: String,
        required: [true, "Select your Gender"]
    }
});

const UserBasicDetailsBookform = mongoose.model("UserBasicDetailsBookform", registerSchema);

export { UserBasicDetailsBookform };
