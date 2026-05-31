import { db } from '../config/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

export async function loadCandidates() {
    try {
        const candidatesRef = collection(db, 'candidates');
        const querySnapshot = await getDocs(candidatesRef);
        
        const candidatesList = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            candidatesList.push({ 
                id: doc.id, 
                ...data,
                // Pastikan candidateNumber ada
                candidateNumber: data.candidateNumber || parseInt(doc.id) || 0
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
    
    if (photoElement && candidate.photoURL) {
        photoElement.src = candidate.photoURL;
    }
}