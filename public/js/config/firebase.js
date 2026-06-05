// /public/js/config/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

// Konfigurasi Firebase - nilai akan diambil dari window.env (dari inline script di HTML)
const firebaseConfig = {
    apiKey: window.ENV?.FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
    authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN_HERE",
    projectId: window.ENV?.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID_HERE",
    storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID_HERE",
    appId: window.ENV?.FIREBASE_APP_ID || "YOUR_APP_ID_HERE"
};

console.log("Firebase Config Loaded - Project:", firebaseConfig.projectId);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };