// src/firebase.js


import admin from 'firebase-admin';
import { initializeApp } from "firebase/app";
import { getAuth as getFirebaseAuth, sendPasswordResetEmail as sendFirebasePasswordResetEmail } from "firebase/auth";
// import { getAuth as getAdminAuth, sendPasswordResetEmail as sendAdminPasswordResetEmail } from "firebase-admin/auth";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
const firebaseAuth = getFirebaseAuth(app);

// Initialize Firebase Admin SDK
admin.initializeApp(firebaseConfig);
// const adminAuth = getAdminAuth();

const sendPasswordReset = async (email) => {
    try {
        // Send password reset email using Firebase SDK for JavaScript
        await sendFirebasePasswordResetEmail(firebaseAuth, email);
        console.log(`Password reset link sent to ${email} using Firebase SDK for JavaScript`);

        // // Send password reset email using Firebase Admin SDK
        // await sendAdminPasswordResetEmail(adminAuth, email);
        // console.log(`Password reset link sent to ${email} using Firebase Admin SDK`);

        return true;
    } catch (error) {
        console.error('Error sending reset link:', error);
        return false;
    }
};

export { sendPasswordReset };
