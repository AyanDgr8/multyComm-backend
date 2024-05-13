// src/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.your_apiKey,
  authDomain: process.env.your_authDomain,
  projectId: process.env.your_projectId,
  storageBucket: process.env.your_storageBucket,
  messagingSenderId: process.env.your_messagingSenderId,
  appId: process.env.your_appId,
  measurementId: process.env.your_measurementId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);