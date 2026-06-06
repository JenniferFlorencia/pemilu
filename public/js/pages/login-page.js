// /public/js/pages/login-page.js
import { loginUser } from '../modules/auth/auth-service.js';
import { showNotification } from '../modules/utils/helpers.js';

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showNotification('Username dan password harus diisi!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password minimal 6 karakter!', 'error');
        return;
    }
    
    // Disable button while processing
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Loading...';
    
    try {
        const success = await loginUser(username, password);
        
        // Jika login berhasil, fungsi loginUser sudah melakukan redirect
        // Tidak perlu preload lagi karena redirect akan terjadi
        if (success) {
            // Small delay to show success message
            setTimeout(() => {
                // Redirect sudah ditangani di loginUser
            }, 500);
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Terjadi kesalahan saat login', 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
    }
});