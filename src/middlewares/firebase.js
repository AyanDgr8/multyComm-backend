// src/firebase.js

import admin from 'firebase-admin';
import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";



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
// admin.initializeApp(firebaseConfig);
// admin.getAuth(app)


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// const sendPasswordReset = async (email) => {
//       try {
//         await admin.sendPasswordResetEmail(email);
//         console.log(`Password reset link sent to ${email}`);
//         return true;
//       } catch (error) {
//         console.error('Error sending reset link:', error);
//         return false;
//       }
// };

const sendPasswordReset = async(email) => {
  try {
      await sendPasswordResetEmail(auth,email)
      console.log(`Password reset link sent to ${email}`);
      return true;
  } catch(error){
    console.error('Error sending reset link:', error);
    return false;
  }
}

export { sendPasswordReset };
