// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYlxZ7-l43oqFxk-4ylGpU-_uVHNGonfk",
  authDomain: "ludus-landing.firebaseapp.com",
  databaseURL: "https://ludus-landing-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ludus-landing",
  storageBucket: "ludus-landing.firebasestorage.app",
  messagingSenderId: "126334556952",
  appId: "1:126334556952:web:fcbed3f08a156819199c6d",
  measurementId: "G-863YRB8LHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);