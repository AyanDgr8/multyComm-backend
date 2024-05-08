// src/models/users.js



import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
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

const Users = mongoose.model('Users', userSchema);

export { Users };
