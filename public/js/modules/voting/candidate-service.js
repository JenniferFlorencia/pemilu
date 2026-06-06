// /public/js/modules/candidates.js
import { db } from '../../config/firebase.js';
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

export async function loadCandidates() {
    try {
        // Gunakan query yang lebih efisien
        const candidatesRef = collection(db, 'candidates');
        
        // Hanya ambil field yang diperlukan, exclude field besar
        const querySnapshot = await getDocs(candidatesRef);

        const candidatesList = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            candidatesList.push({
                id: doc.id,
                name: data.name,
                candidateNumber: data.candidateNumber || parseInt(doc.id) || 0,
                photoURL: data.photoURL, // URL saja, tidak perlu download image
                vision: data.vision || [],
                mission: data.mission || [],
                bio: data.bio || ''
                // Jangan ambil field yang tidak perlu
            });
        });

        candidatesList.sort((a, b) => (a.candidateNumber || 0) - (b.candidateNumber || 0));
        console.log('Loaded candidates:', candidatesList);
        return candidatesList;

    } catch (error) {
        console.error("Error loading candidates:", error);
        return [];
    }
}

export function displayCandidate(candidate, index, total) {
    if (!candidate) return;

    console.log('Displaying candidate:', candidate);

    const nameElement = document.getElementById('candidateName');
    const subtitleElement = document.getElementById('candidateSubtitle');
    const bioElement = document.getElementById('candidateBio');
    const tagElement = document.getElementById('candidateTag');
    const photoElement = document.getElementById('candidatePhoto');

    if (nameElement) {
        nameElement.innerHTML = (candidate.name || 'Unknown').replace(' ', '<br>');
    }

    if (subtitleElement) {
        subtitleElement.textContent = `Candidate ${candidate.candidateNumber || index + 1}`;
    }

    if (bioElement) {
        bioElement.textContent = candidate.bio || 'No bio available';
    }

    if (tagElement) {
        tagElement.textContent = `KANDIDAT ${candidate.candidateNumber || index + 1}`;
    }

    // ⭐ OPTIMASI GAMBAR DARI DATABASE
    if (photoElement && candidate.photoURL) {
        // Set image dengan priority tinggi
        const img = new Image();
        
        img.onload = () => {
            photoElement.src = candidate.photoURL;
            photoElement.style.opacity = '1';
        };
        
        // Tambahkan parameter Firebase Storage untuk optimasi ukuran
        let optimizedUrl = candidate.photoURL;
        
        // Jika menggunakan Firebase Storage, tambahkan parameter
        if (optimizedUrl.includes('firebasestorage.googleapis.com')) {
            // Minta ukuran yang lebih kecil (500px width)
            const separator = optimizedUrl.includes('?') ? '&' : '?';
            optimizedUrl = `${optimizedUrl}${separator}alt=media&width=500`;
        }
        
        // Coba preload gambar sebelum ditampilkan
        img.src = optimizedUrl;
        
        // Set fetchpriority high
        photoElement.fetchPriority = 'high';
        photoElement.loading = 'eager';
        photoElement.decoding = 'async';
    }

    // VISI & MISI (existing code)
    const visionContainer = document.getElementById('candidateVision');
    if (visionContainer) {
        if (candidate.vision && candidate.vision.length > 0) {
            visionContainer.innerHTML = candidate.vision.map(v => `<li class="mission_container">${v}</li>`).join('');
        } else {
            visionContainer.innerHTML = '<li class="mission_container">Visi belum tersedia</li>';
        }
    }

    const missionContainer = document.getElementById('candidateMission');
    if (missionContainer) {
        if (candidate.mission && candidate.mission.length > 0) {
            missionContainer.innerHTML = candidate.mission.map(m => `<li class="mission_container">${m}</li>`).join('');
        } else {
            missionContainer.innerHTML = '<li class="mission_container">Misi belum tersedia</li>';
        }
    }
}