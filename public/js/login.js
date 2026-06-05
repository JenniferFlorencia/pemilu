import { loginUser } from './modules/auth.js';
import { validateInput, showNotification } from './modules/utils.js';

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
    
    const success = await loginUser(username, password);
    
    // Jika login berhasil, mulai preload vote assets
    if (success) {
        try {
            // Dynamic import preload module
            const { preloadVoteAssets, preloadCandidateData } = await import('./preload.js');
            preloadVoteAssets();
            preloadCandidateData(); // Optional: preload data kandidat
        } catch (err) {
            console.warn('Preload module not available:', err);
        }
    }
});