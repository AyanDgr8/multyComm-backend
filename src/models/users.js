// src/models/users.js


import mongoose from 'mongoose';
import moment from 'moment-timezone';

// Function to convert dates to IST
const convertToIST = (date) => moment(date).tz('Asia/Kolkata').toDate();

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

// Pre-save middleware to convert date fields to IST before saving
userSchema.pre('save', function(next) {
    
    if (this.isModified('passwordUpdatedAt')) {
        this.passwordUpdatedAt = convertToIST(this.passwordUpdatedAt);
    }
    this.createdAt = convertToIST(this.createdAt);
    this.updatedAt = convertToIST(this.updatedAt);
    next();
});

// Pre-update middleware to convert date fields to IST before updating
userSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();

    if (update.passwordUpdatedAt) {
        update.passwordUpdatedAt = convertToIST(update.passwordUpdatedAt);
    }
    if (update.updatedAt) {
        update.updatedAt = convertToIST(update.updatedAt);
    }
    next();
});

const Users = mongoose.model('Users', userSchema);

export { Users };
