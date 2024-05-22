// src/models/users.js



import mongoose from 'mongoose';


const userSchema = new mongoose.Schema(
    {
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

        dob: {
            type: Date,
        },

        gender: {
            type: String,
        },
        passwordUpdatedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps:true
    }
);

const Users = mongoose.model('Users', userSchema);

export { Users };
