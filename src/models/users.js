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
        timestamps: false
    }
);

// Middleware to set timestamps in IST
userSchema.pre('save', function(next) {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    this.updatedAt = now;
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

// Middleware to update the timestamp in IST on updates
userSchema.pre('findOneAndUpdate', function(next) {
    this._update.updatedAt = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    next();
});

const Users = mongoose.model('Users', userSchema);

export { Users };
