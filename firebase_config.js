// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAlu9hzWwTjIm9xasfPM45iVDvXa8FEz28",
    authDomain: "pemiluppit2026.firebaseapp.com",
    projectId: "pemiluppit2026",
    storageBucket: "pemiluppit2026.firebasestorage.app",
    messagingSenderId: "436958242133",
    appId: "1:436958242133:web:c3b5a3693037e4c58a3bdc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);