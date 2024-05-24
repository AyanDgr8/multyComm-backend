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
        gender: {
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
        passwordUpdatedAt: {
            type: Date,
            default: null,
        },
        isAdult: {
            type: Boolean,
            default: false, 
        },
        lastLogin: {
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
    
    // Calculate if user is an adult based on date of birth
    if (this.dob) {
        const dobDate = new Date(this.dob);
        const today = new Date();
        const age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            this.isAdult = age - 1 >= 18; // Subtract 1 year if birthday hasn't occurred yet this year
        } else {
            this.isAdult = age >= 18;
        }
    }

    next();
});


// Middleware to update timestamps in IST on updates
userSchema.pre('findOneAndUpdate', function(next) {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    this._update.updatedAt = now;
    this._update.createdAt = now;
    next();
});

// Middleware to update lastLogin timestamp on user login
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
};


const Users = mongoose.model('Users', userSchema);

export { Users };
