import { db, auth } from '../config/firebase.js';
import { collection, query, where, getDocs, limit } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { showNotification, showLoading } from './utils.js';

export async function loginUser(username, password) {
    showLoading(true);
    
    try {
        // STEP 1: Cari user berdasarkan USERNAME di Firestore
        const votersRef = collection(db, 'voters');
        const q = query(votersRef, where('username', '==', username), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error('Username tidak ditemukan!');
        }
        
        const voterData = querySnapshot.docs[0].data();
        const email = voterData.email; // Dapatkan email dari Firestore
        
        // STEP 2: Login ke Firebase Auth menggunakan EMAIL
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // STEP 3: Simpan data ke localStorage
        localStorage.setItem('currentVoter', JSON.stringify({
            uid: userCredential.user.uid,
            username: voterData.username,
            email: voterData.email,
            name: voterData.name,
            hasVoted: voterData.hasVoted || false,
            voterId: querySnapshot.docs[0].id
        }));
        
        showNotification(`Login berhasil! Selamat datang, ${voterData.name}`, 'success');
        
        setTimeout(() => {
            window.location.href = '/vote.html';
        }, 1000);
        
        return true;
        
    } catch (error) {
        console.error("Login error:", error);
        let message = 'Login gagal! ';
        
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
                message += 'Password salah.';
                break;
            case 'auth/user-not-found':
                message += 'User tidak ditemukan di sistem autentikasi. Hubungi admin.';
                break;
            case 'auth/too-many-requests':
                message += 'Terlalu banyak percobaan login. Coba lagi nanti.';
                break;
            default:
                message += error.message;
        }
        
        showNotification(message, 'error');
        return false;
        
    } finally {
        showLoading(false);
    }
}