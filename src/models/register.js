// src/models/register.js


import mongoose from 'mongoose';


const registerSchema = new mongoose.Schema({
    
    
    username: {
        type: String,
        required: [true, "Username is required"],
        minLength: [6, "Username must be at least 6 characters long"],
        match: [/^[a-zA-Z0-9!@#$%^&*()-_+=]{6,}$/, "Please enter a valid userId with at least 6 characters consisting of letters, numbers, and special characters (!@#$%^&*()-_+=)"],
    },
    

    password:{
        type: String,
        required: [true, "Password is required"],
    },

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
        match: [/^\d{10}$/, "Please enter a valid phone number"],
    },

    email: { 
        type: String, 
        required: [true, "Mention your Email address"], 
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, "Please enter a valid email address"],
    },
});

const UserRegisterDetailsForm = mongoose.model("UserRegisterDetailsForm", registerSchema);

export { UserRegisterDetailsForm };
