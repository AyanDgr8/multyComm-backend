// src/models/paidUser.js

import mongoose from 'mongoose';

const paidSchema = new mongoose.Schema(

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
            dob: Date,
        },

        gender: {
            type: String,
        },

        address: {
            street: String,
            city: String,
            state: String,
            zip: Number,
        },

        createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        }

    },
    {
        timestamps: true,
    }
);

const PaidUsers = mongoose.model('PaidUsers', paidSchema);

export { PaidUsers };
