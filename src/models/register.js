// src/models/register.js


import mongoose from 'mongoose';


const registerSchema = new mongoose.Schema({
    
    
    username: {
        type: String,
    },
    

    password:{
        type: String,
    },

    firstName: { 
        type: String, 
    },

    lastName: { 
        type: String, 
    },

    phone: { 
        type: Number, 
    },

    email: { 
        type: String, 
    },
});

const UserRegisterDetailsForm = mongoose.model("UserRegisterDetailsForm", registerSchema);

export { UserRegisterDetailsForm };
