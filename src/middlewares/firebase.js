// src/firebase.js

import admin from 'firebase-admin';


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCxBaGWCjE1F7zRUheeXzoHfCLUUYDj6hg",
    authDomain: "multycomm-e1901.firebaseapp.com",
    projectId: "multycomm-e1901",
    storageBucket: "multycomm-e1901.appspot.com",
    messagingSenderId: "141466163369",
    appId: "1:141466163369:web:6c0f27bb28ab34514cf1b8",
    measurementId: "G-SQKXH5GFWM"
  };

// Initialize Firebase
admin.initializeApp(firebaseConfig);

const sendPasswordResetEmail = async (email) => {
    try {
        await admin.auth().sendPasswordResetEmail(email);
        console.log(`Password reset link sent to ${email}`);
        return true;
    } catch (error) {
        console.log('Error sending reset link:', error);
        return false;
    }
}

export { sendPasswordResetEmail };
