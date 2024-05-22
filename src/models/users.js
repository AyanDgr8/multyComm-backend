// src/models/users.js


import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
        },
        password: {
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
        timestamps: true
    }
);

// Middleware to set timestamps in IST
userSchema.pre('save', function(next) {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    this.updatedAt = now;
    this.createdAt = now;
    
    next();
});


// Middleware to update timestamps in IST on updates
userSchema.pre('findOneAndUpdate', function(next) {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    this._update.updatedAt = now;
    this._update.createdAt = now;
    next();
});


const Users = mongoose.model('Users', userSchema);

export { Users };
