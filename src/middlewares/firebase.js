// src/firebase.js


// import admin from 'firebase-admin';
import { initializeApp } from "firebase/app";
import { getAuth as getFirebaseAuth, sendPasswordResetEmail as sendFirebasePasswordResetEmail } from "firebase/auth";
// import { getAuth as getAdminAuth, sendPasswordResetEmail as sendAdminPasswordResetEmail } from "firebase-admin/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCxBaGWCjE1F7zRUheeXzoHfCLUUYDj6hg",
  authDomain: "multycomm-e1901.firebaseapp.com",
  projectId: "multycomm-e1901",
  storageBucket: "multycomm-e1901.appspot.com",
  messagingSenderId: "141466163369",
  appId: "1:141466163369:web:6c0f27bb28ab34514cf1b8",
  measurementId: "G-SQKXH5GFWM"
};

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
const firebaseAuth = getFirebaseAuth(app);

// Initialize Firebase Admin SDK
// admin.initializeApp(firebaseConfig);
// const adminAuth = getAdminAuth();

const sendPasswordReset = async (email) => {
    try {
        // Send password reset email using Firebase SDK for JavaScript
        await sendFirebasePasswordResetEmail(firebaseAuth, email);
        console.log(`Password reset link sent to ${email} using Firebase SDK for JavaScript`);
        return true;
    } catch (error) {
        console.error('Error sending reset link:', error);
        return false;
    }
};

export { sendPasswordReset };
