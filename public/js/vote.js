import { db, auth } from './config/firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { loadCandidates, displayCandidate } from './modules/candidates.js';
import { submitVote } from './modules/vote.js';
import { showNotification } from './modules/utils.js';

let currentCandidate = null;
let candidatesList = [];
let currentIndex = 0;

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/index.html';
    }
});

async function init() {
    console.log('Initializing vote page...');
    
    candidatesList = await loadCandidates();
    console.log('Candidates loaded:', candidatesList);
    
    if (candidatesList.length > 0) {
        currentCandidate = candidatesList[0];
        displayCandidate(currentCandidate, 0, candidatesList.length);
    } else {
        console.warn('No candidates found!');
        document.getElementById('candidateName').textContent = 'No Candidates';
        document.getElementById('candidateBio').textContent = 'Belum ada data kandidat. Hubungi administrator.';
    }
    
    const currentVoter = JSON.parse(localStorage.getItem('currentVoter'));
    console.log('Current voter:', currentVoter);
    
    if (currentVoter) {
        document.getElementById('voterName').innerHTML = `Welcome, ${currentVoter.name || currentVoter.username}<br>`;
        if (currentVoter.hasVoted) {
            document.getElementById('voterStatus').textContent = 'You have already voted!';
            document.querySelectorAll('.pill_btn').forEach(btn => {
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.5';
            });
        }
    }
}

async function handleVote() {
    const currentVoter = JSON.parse(localStorage.getItem('currentVoter'));
    
    if (!currentVoter) {
        showNotification('Silakan login kembali', 'error');
        window.location.href = '/index.html';
        return;
    }
    
    const success = await submitVote(currentCandidate, currentVoter, () => {
        currentVoter.hasVoted = true;
        localStorage.setItem('currentVoter', JSON.stringify(currentVoter));
        document.getElementById('voterStatus').textContent = 'You have already voted!';
        document.querySelectorAll('.pill_btn').forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
        });
    });
}

// Tunggu DOM siap
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    const agreeBtn = document.getElementById('agreeBtn');
    const disagreeBtn = document.getElementById('disagreeBtn');
    
    if (agreeBtn) agreeBtn.addEventListener('click', handleVote);
    if (disagreeBtn) disagreeBtn.addEventListener('click', handleVote);
});