// /public/js/pages/vote-page.js
import { db, auth } from '../config/firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { loadCandidates, displayCandidate } from '../modules/voting/candidate-service.js';
import { submitVote } from '../modules/voting/vote-handler.js';
import { showNotification } from '../modules/utils/helpers.js';

let currentCandidate = null;
let candidatesList = [];
let currentIndex = 0;

// ========== PRELOAD DATA KANDIDAT ==========
let candidatesCache = null;
let preloadStarted = false;

/**
 * Preload data kandidat dari cache atau Firestore
 */
async function preloadCandidatesData() {
    if (preloadStarted) return;
    preloadStarted = true;
    
    console.log('[Preload] Starting candidates data preload...');
    
    const cached = localStorage.getItem('candidatesCache');
    const cacheTime = localStorage.getItem('candidatesCacheTime');
    
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime) < 3600000)) {
        try {
            candidatesCache = JSON.parse(cached);
            console.log('[Preload] Using cached candidates data, count:', candidatesCache.length);
            return;
        } catch (e) {
            console.warn('[Preload] Failed to parse cache:', e);
        }
    }
    
    try {
        console.log('[Preload] Fetching fresh candidates data...');
        candidatesCache = await loadCandidates();
        localStorage.setItem('candidatesCache', JSON.stringify(candidatesCache));
        localStorage.setItem('candidatesCacheTime', Date.now().toString());
        console.log('[Preload] Candidates cached successfully, count:', candidatesCache.length);
    } catch (error) {
        console.error('[Preload] Failed to preload candidates:', error);
    }
}

// Jalankan preload
preloadCandidatesData();

// ========== PROTEKSI DASHBOARD USER ==========
const checkDashboardUser = () => {
    const currentVoter = JSON.parse(localStorage.getItem('currentVoter'));
    if (currentVoter && currentVoter.isDashboardUser === true) {
        showNotification('Dashboard user tidak dapat mengakses halaman voting!', 'error');
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
        return true;
    }
    return false;
};

if (checkDashboardUser()) {
    throw new Error('Unauthorized: Dashboard user cannot access voting page');
}

// ========== FUNGSI LOGOUT ==========
async function handleLogout() {
    const confirmed = confirm('Apakah Anda yakin ingin keluar?');
    if (!confirmed) return;
    
    try {
        await signOut(auth);
        localStorage.removeItem('currentVoter');
        localStorage.removeItem('candidatesCache');
        localStorage.removeItem('candidatesCacheTime');
        showNotification('Anda telah logout', 'success');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 500);
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Gagal logout: ' + error.message, 'error');
    }
}

// ========== FUNGSI UNTUK MENGGANTI TOMBOL VOTE DENGAN LOGOUT ==========
function replaceButtonsWithLogout() {
    const bottomActions = document.querySelector('.bottom_actions');
    if (!bottomActions) return;
    
    // Sembunyikan tombol vote
    const agreeBtn = document.getElementById('agreeBtn');
    const disagreeBtn = document.getElementById('disagreeBtn');
    
    if (agreeBtn) agreeBtn.style.display = 'none';
    if (disagreeBtn) disagreeBtn.style.display = 'none';
    
    // Cek apakah tombol logout sudah ada
    let logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) {
        // Buat tombol logout baru dengan style yang sama
        logoutBtn = document.createElement('div');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'pill_btn_logout pill_btn';
        logoutBtn.textContent = 'LOGOUT';
        
        // Tambahkan event listener
        logoutBtn.addEventListener('click', handleLogout);
        
        // Tambahkan ke container
        bottomActions.appendChild(logoutBtn);
    } else {
        logoutBtn.style.display = 'block';
    }
}

// ========== FUNGSI UNTUK MENGEMBALIKAN TOMBOL VOTE (jika diperlukan) ==========
function restoreVoteButtons() {
    const agreeBtn = document.getElementById('agreeBtn');
    const disagreeBtn = document.getElementById('disagreeBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (agreeBtn) agreeBtn.style.display = 'block';
    if (disagreeBtn) disagreeBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/index.html';
    }
    checkDashboardUser();
});

async function init() {
    console.log('Initializing vote page...');
    
    if (checkDashboardUser()) return;
    
    if (candidatesCache && candidatesCache.length > 0) {
        console.log('[Init] Using preloaded candidates from cache');
        candidatesList = candidatesCache;
    } else {
        console.log('[Init] No cache available, loading from Firestore...');
        candidatesList = await loadCandidates();
        if (candidatesList.length > 0) {
            candidatesCache = candidatesList;
            localStorage.setItem('candidatesCache', JSON.stringify(candidatesList));
            localStorage.setItem('candidatesCacheTime', Date.now().toString());
        }
    }
    
    console.log('Candidates loaded:', candidatesList);
    
    if (candidatesList.length > 0) {
        currentCandidate = candidatesList[0];
        displayCandidate(currentCandidate, 0, candidatesList.length);
    } else {
        console.warn('No candidates found!');
        const nameEl = document.getElementById('candidateName');
        const bioEl = document.getElementById('candidateBio');
        if (nameEl) nameEl.textContent = 'No Candidates';
        if (bioEl) bioEl.textContent = 'Belum ada data kandidat. Hubungi administrator.';
    }
    
    const currentVoter = JSON.parse(localStorage.getItem('currentVoter'));
    console.log('Current voter:', currentVoter);
    
    if (currentVoter) {
        const voterNameEl = document.getElementById('voterName');
        if (voterNameEl) {
            voterNameEl.innerHTML = `Welcome, ${currentVoter.name || currentVoter.username}<br>`;
        }
        
        // Jika sudah vote, ganti tombol dengan logout
        if (currentVoter.hasVoted) {
            const voterStatusEl = document.getElementById('voterStatus');
            if (voterStatusEl) voterStatusEl.textContent = 'Terima kasih telah memberikan suara!';
            
            // Ganti tombol vote dengan tombol logout
            replaceButtonsWithLogout();
        }
    }
}

async function handleVote(choice) {
    const currentVoter = JSON.parse(localStorage.getItem('currentVoter'));
    
    if (currentVoter && currentVoter.isDashboardUser === true) {
        showNotification('Dashboard user tidak dapat melakukan voting!', 'error');
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
        return;
    }
    
    if (!currentVoter) {
        showNotification('Silakan login kembali', 'error');
        window.location.href = '/index.html';
        return;
    }
    
    const selectedCandidate = choice === 'agree' ? currentCandidate : null;
    
    const success = await submitVote(selectedCandidate, currentVoter, () => {
        currentVoter.hasVoted = true;
        localStorage.setItem('currentVoter', JSON.stringify(currentVoter));
        
        const voterStatusEl = document.getElementById('voterStatus');
        if (voterStatusEl) voterStatusEl.textContent = 'Terima kasih telah memberikan suara!';
        
        // Ganti tombol vote dengan tombol logout setelah vote berhasil
        replaceButtonsWithLogout();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkDashboardUser()) return;
    
    init();
    
    const agreeBtn = document.getElementById('agreeBtn');
    const disagreeBtn = document.getElementById('disagreeBtn');
    
    if (agreeBtn) agreeBtn.addEventListener('click', () => handleVote('agree'));
    if (disagreeBtn) disagreeBtn.addEventListener('click', () => handleVote('disagree'));
});

/**
 * Sync height antara white-space dan right panel
 */
function syncWhiteSpaceWithRightPanel() {
    if (window.innerWidth <= 768) {
        const whiteSpace = document.querySelector('.white-space');
        if (whiteSpace) {
            whiteSpace.style.height = '';
            whiteSpace.style.minHeight = '';
        }
        return;
    }
    
    const rightPanel = document.querySelector('.right_panel');
    const whiteSpace = document.querySelector('.white-space');
    
    if (!rightPanel || !whiteSpace) return;
    
    const rightPanelHeight = rightPanel.offsetHeight;
    
    if (rightPanelHeight > 0) {
        const adjustedHeight = rightPanelHeight - 50;
        whiteSpace.style.height = `${adjustedHeight}px`;
        whiteSpace.style.minHeight = `${adjustedHeight}px`;
        console.log(`✅ Synced: Right panel height = ${rightPanelHeight}px, Adjusted height = ${adjustedHeight}px`);
    } else {
        setTimeout(syncWhiteSpaceWithRightPanel, 100);
    }
}

function initHeightSync() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(syncWhiteSpaceWithRightPanel, 50);
        });
    } else {
        setTimeout(syncWhiteSpaceWithRightPanel, 50);
    }
    
    window.addEventListener('load', syncWhiteSpaceWithRightPanel);
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(syncWhiteSpaceWithRightPanel, 150);
    });
    
    const observer = new MutationObserver(() => {
        syncWhiteSpaceWithRightPanel();
    });
    
    const rightPanel = document.querySelector('.right_panel');
    if (rightPanel) {
        observer.observe(rightPanel, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
}

initHeightSync();