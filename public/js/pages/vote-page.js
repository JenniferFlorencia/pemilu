// /public/js/pages/vote-page.js
import { db, auth } from '../config/firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { loadCandidates, displayCandidate } from '../modules/voting/candidate-service.js';
import { submitVote } from '../modules/voting/vote-handler.js';
import { showNotification } from '../modules/utils/helpers.js';

let currentCandidate = null;
let candidatesList = [];
let currentIndex = 0;

// ========== PRELOAD DATA KANDIDAT (TAMBAHKAN DI SINI) ==========
let candidatesCache = null;
let preloadStarted = false;

/**
 * Preload data kandidat dari cache atau Firestore
 * Ini akan jalan lebih awal sebelum DOM ready
 */
async function preloadCandidatesData() {
    if (preloadStarted) return;
    preloadStarted = true;
    
    console.log('[Preload] Starting candidates data preload...');
    
    // Cek cache di localStorage
    const cached = localStorage.getItem('candidatesCache');
    const cacheTime = localStorage.getItem('candidatesCacheTime');
    
    // Cache berlaku 1 jam (3600000 ms)
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime) < 3600000)) {
        try {
            candidatesCache = JSON.parse(cached);
            console.log('[Preload] Using cached candidates data, count:', candidatesCache.length);
            return;
        } catch (e) {
            console.warn('[Preload] Failed to parse cache:', e);
        }
    }
    
    // Jika tidak ada cache, preload dari Firestore
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

// ⚡ JALANKAN PRELOAD SEGERA (tanpa menunggu apapun)
// Ini akan jalan IMMEDIATELY saat file ini di-load
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
// ============================================

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/index.html';
    }
    checkDashboardUser();
});

async function init() {
    console.log('Initializing vote page...');
    
    if (checkDashboardUser()) return;
    
    // ⚡ GUNAKAN CACHE jika tersedia (LEBIH CEPAT)
    if (candidatesCache && candidatesCache.length > 0) {
        console.log('[Init] Using preloaded candidates from cache');
        candidatesList = candidatesCache;
    } else {
        console.log('[Init] No cache available, loading from Firestore...');
        candidatesList = await loadCandidates();
        // Simpan ke cache setelah load
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
        
        if (currentVoter.hasVoted) {
            const voterStatusEl = document.getElementById('voterStatus');
            if (voterStatusEl) voterStatusEl.textContent = 'You have already voted!';
            
            document.querySelectorAll('.pill_btn').forEach(btn => {
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.5';
            });
        }
    }
}

// PERBAIKAN: Fungsi handleVote sekarang menerima parameter pilihan
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
    
    // choice bisa 'agree' (setuju dengan currentCandidate) atau 'disagree' (kotak kosong)
    const selectedCandidate = choice === 'agree' ? currentCandidate : null;
    
    const success = await submitVote(selectedCandidate, currentVoter, () => {
        currentVoter.hasVoted = true;
        localStorage.setItem('currentVoter', JSON.stringify(currentVoter));
        
        const voterStatusEl = document.getElementById('voterStatus');
        if (voterStatusEl) voterStatusEl.textContent = 'You have already voted!';
        
        document.querySelectorAll('.pill_btn').forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkDashboardUser()) return;
    
    init();
    
    const agreeBtn = document.getElementById('agreeBtn');
    const disagreeBtn = document.getElementById('disagreeBtn');
    
    // PERBAIKAN: Kirim parameter yang berbeda untuk setiap tombol
    if (agreeBtn) agreeBtn.addEventListener('click', () => handleVote('agree'));
    if (disagreeBtn) disagreeBtn.addEventListener('click', () => handleVote('disagree'));
});

/**
 * Sync height antara white-space dan right panel
 * Dikurangi 50px untuk kompensasi top: -50px pada right panel
 */
function syncWhiteSpaceWithRightPanel() {
    // Desktop only
    if (window.innerWidth <= 768) {
        // Reset styling di mobile
        const whiteSpace = document.querySelector('.white-space');
        if (whiteSpace) {
            whiteSpace.style.height = '';
            whiteSpace.style.minHeight = '';
        }
        return;
    }
    
    const rightPanel = document.querySelector('.right_panel');
    const whiteSpace = document.querySelector('.white-space');
    
    if (!rightPanel || !whiteSpace) {
        console.warn('Elements not found');
        return;
    }
    
    // Ambil height actual dari right panel
    const rightPanelHeight = rightPanel.offsetHeight;
    
    if (rightPanelHeight > 0) {
        // Kurangi 50px untuk kompensasi top: -50px pada right panel
        const adjustedHeight = rightPanelHeight - 50;
        
        // Set white-space memiliki height yang sudah disesuaikan
        whiteSpace.style.height = `${adjustedHeight}px`;
        whiteSpace.style.minHeight = `${adjustedHeight}px`;
        
        // Debug info
        console.log(`✅ Synced: Right panel height = ${rightPanelHeight}px, Adjusted height = ${adjustedHeight}px`);
    } else {
        console.warn('Right panel height is 0, retrying...');
        // Retry setelah delay
        setTimeout(syncWhiteSpaceWithRightPanel, 100);
    }
}

// Inisialisasi dengan berbagai event
function initHeightSync() {
    // Tunggu DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(syncWhiteSpaceWithRightPanel, 50);
        });
    } else {
        setTimeout(syncWhiteSpaceWithRightPanel, 50);
    }
    
    // Tunggu semua gambar dan resource load
    window.addEventListener('load', syncWhiteSpaceWithRightPanel);
    
    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(syncWhiteSpaceWithRightPanel, 150);
    });
    
    // Observer untuk perubahan konten di right panel
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

// Jalankan
initHeightSync();

// Ekspos ke window untuk debugging
// window.syncHeight = syncWhiteSpaceWithRightPanel;

// ⚡ Ekspos fungsi untuk clear cache (opsional, untuk debugging)
// window.clearCandidatesCache = () => {
//     localStorage.removeItem('candidatesCache');
//     localStorage.removeItem('candidatesCacheTime');
//     candidatesCache = null;
//     console.log('Cache cleared');
// };