// src/firebase.js

import admin from 'firebase-admin';

// Replace placeholders with your actual Firebase project configuration details
const firebaseConfig = {
    apiKey: "AIzaSyCxBaGWCjE1F7zRUheeXzoHfCLUUYDj6hg",
    authDomain: "multycomm-e1901.firebaseapp.com",
    projectId: "multycomm-e1901",
    storageBucket: "multycomm-e1901.appspot.com",
    messagingSenderId: "141466163369",
    appId: "1:141466163369:web:b437073326f52f2c4cf1b8",
    measurementId: "G-847866NMZQ"
};


// Initialize Firebase
admin.initializeApp(firebaseConfig);

const sendPasswordResetEmail = async (email) => {
      try {
        await admin.auth().sendPasswordResetEmail(email);
        console.log(`Password reset link sent to ${email}`);
        return true;
      } catch (error) {
        console.error('Error sending reset link:', error);
        return false;
      }
};

export { sendPasswordResetEmail };