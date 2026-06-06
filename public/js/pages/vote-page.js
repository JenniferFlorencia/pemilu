// /public/js/pages/vote-page.js
import { db, auth } from '../config/firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { loadCandidates, displayCandidate } from '../modules/voting/candidate-service.js';
import { submitVote } from '../modules/voting/vote-handler.js';
import { showNotification } from '../modules/utils/helpers.js';

let currentCandidate = null;
let candidatesList = [];
let currentIndex = 0;

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
    
    candidatesList = await loadCandidates();
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