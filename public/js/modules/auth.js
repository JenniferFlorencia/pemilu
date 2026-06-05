// /public/js/modules/auth.js
import { db, auth } from '../config/firebase.js';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    limit, 
    doc, 
    getDoc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { showNotification, showLoading } from './utils.js';

// Domain untuk email internal
const EMAIL_DOMAIN = '@pemilu2026.internal';

// Fungsi untuk mengkonversi username ke email
function usernameToEmail(username) {
    const cleanUsername = username.toLowerCase().trim().replace(/\s+/g, '');
    return `${cleanUsername}${EMAIL_DOMAIN}`;
}

export async function loginUser(username, password) {
    showLoading(true);
    
    try {
        // Konversi username ke email
        const email = usernameToEmail(username);
        console.log('Login dengan email:', email);
        
        // Langsung login ke Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Ambil data voter dari Firestore menggunakan UID
        const voterRef = doc(db, 'voters', userCredential.user.uid);
        const voterDoc = await getDoc(voterRef);
        
        if (!voterDoc.exists()) {
            throw new Error('Data voter tidak ditemukan! Silakan hubungi admin.');
        }
        
        const voterData = voterDoc.data();
        const isDashboardUser = voterData.isDashboardUser === true;
        
        // Simpan data ke localStorage
        localStorage.setItem('currentVoter', JSON.stringify({
            uid: userCredential.user.uid,
            username: voterData.username,
            email: voterData.email,
            name: voterData.name,
            hasVoted: voterData.hasVoted || false,
            voterId: userCredential.user.uid,
            isDashboardUser: isDashboardUser
        }));
        
        showNotification(`Login berhasil! Selamat datang, ${voterData.name}`, 'success');
        
        // Redirect berdasarkan role
        setTimeout(() => {
            if (isDashboardUser) {
                window.location.href = '/dashboard.html';
            } else {
                window.location.href = '/vote.html';
            }
        }, 1000);
        
        return true;
        
    } catch (error) {
        console.error("Login error:", error);
        let message = 'Login gagal! ';
        
        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
                message += 'Username atau password salah.';
                break;
            case 'auth/user-not-found':
                message += 'Username tidak terdaftar. Hubungi admin.';
                break;
            case 'auth/too-many-requests':
                message += 'Terlalu banyak percobaan login. Coba lagi nanti.';
                break;
            case 'auth/invalid-email':
                message += 'Format username tidak valid.';
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