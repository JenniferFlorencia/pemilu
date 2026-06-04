// /public/js/modules/voteHandler.js
import { db } from '/js/config/firebase.js';
import { doc, collection, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { showNotification, showLoading } from '/js/modules/utils.js';

export async function submitVote(candidate, voterData, onSuccess) {
    console.log('Candidate:', candidate);
    console.log('VoterData:', voterData);
    
    if (!candidate) {
        showNotification('No candidate selected!', 'error');
        return false;
    }
    
    if (!voterData) {
        showNotification('Silakan login kembali', 'error');
        window.location.href = '/index.html';
        return false;
    }
    
    if (voterData.hasVoted) {
        showNotification('Anda sudah melakukan vote sebelumnya!', 'warning');
        return false;
    }
    
    const confirmVote = confirm(`Anda yakin ingin memilih ${candidate.name}?`);
    if (!confirmVote) return false;
    
    showLoading(true);
    
    try {
        // 1. Simpan vote ke collection votes
        const votesCollection = collection(db, 'votes');
        const voteData = {
            userName: voterData.name || voterData.username,
            candidateId: String(candidate.id || candidate.candidateNumber),
            candidateNumber: Number(candidate.candidateNumber),
            candidateName: candidate.name,
            votedAt: new Date().toISOString(),
            voterEmail: voterData.email || '',
            voterUid: voterData.uid || ''
        };
        
        console.log('Vote data to save:', voteData);
        
        const voteDoc = await addDoc(votesCollection, voteData);
        console.log('Vote saved with ID:', voteDoc.id);
        
        // 2. Update status voter
        const voterId = voterData.voterId || voterData.username;
        const voterRef = doc(db, 'voters', voterId);
        
        await updateDoc(voterRef, { 
            hasVoted: true, 
            votedAt: new Date().toISOString(),
            votedFor: candidate.name
        });
        
        console.log('Voter updated successfully');
        
        showNotification(`Terima kasih telah memilih ${candidate.name}!`, 'success');
        
        if (onSuccess) onSuccess();
        return true;
        
    } catch (error) {
        console.error("Error submitting vote:", error);
        showNotification('Gagal menyimpan vote: ' + error.message, 'error');
        return false;
        
    } finally {
        showLoading(false);
    }
}
