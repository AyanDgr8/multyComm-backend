// // src/firebase.js


// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCxBaGWCjE1F7zRUheeXzoHfCLUUYDj6hg",
//   authDomain: "multycomm-e1901.firebaseapp.com",
//   projectId: "multycomm-e1901",
//   storageBucket: "multycomm-e1901.appspot.com",
//   messagingSenderId: "141466163369",
//   appId: "1:141466163369:web:b437073326f52f2c4cf1b8",
//   measurementId: "G-847866NMZQ"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// let analytics = null;

// // Check if analytics is supported before initializing
// if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
//   analytics = getAnalytics(app);
// } else {
//   console.warn('Firebase Analytics is not supported in this environment.');
// }

// export { app, analytics, firebaseConfig };