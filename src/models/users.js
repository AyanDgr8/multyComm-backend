// src/models/users.js


import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
        },
        
        password:{
            type: String,
            required: true,
            minlength: 6,
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
            unique: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid email");
                }
            },
        },

        dob: {
            type: Date,
        },

        gender: {
            type: String,
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        verifytoken: {
            type: String,
        },
    },
    {
        timestamps:true
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (this.isModified("password") || this.isNew) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

// Generate auth token
userSchema.methods.generateAccessToken = async function () {
    try {
        const token = jwt.sign({ _id: this._id, email: this.email }, JWT_SECRET, {
            expiresIn: "10m",
        });
        this.tokens = this.tokens.concat({ token });
        await this.save();
        return token;
    } catch (error) {
        throw new Error(error);
    }
};

// Generate refresh token
userSchema.methods.generateRefreshToken = async function () {
    try {
        const refreshToken = jwt.sign({ _id: this._id }, JWT_SECRET, {
            expiresIn: "24h",
        });
        this.refreshToken = refreshToken;
        await this.save();
        return refreshToken;
    } catch (error) {
        throw new Error(error);
    }
};

const Users = mongoose.model('Users', userSchema);

export { Users };
