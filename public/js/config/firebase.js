import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAlu9hzWwTjIm9xasfPM45iVDvXa8FEz28",
    authDomain: "pemiluppit2026.firebaseapp.com",
    projectId: "pemiluppit2026",
    storageBucket: "pemiluppit2026.firebasestorage.app",
    messagingSenderId: "436958242133",
    appId: "1:436958242133:web:c3b5a3693037e4c58a3bdc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence disabled');
    }
});

setPersistence(auth, browserLocalPersistence);
