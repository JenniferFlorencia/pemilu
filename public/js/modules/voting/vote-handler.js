// /public/js/modules/voting/vote-handler.js
import { db } from '../../config/firebase.js';
import { 
    doc, 
    getDoc, 
    updateDoc, 
    increment 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { showNotification, showLoading } from '../utils/helpers.js';

export async function submitVote(candidate, voterData, onSuccess) {
    console.log('Candidate:', candidate);
    console.log('VoterData:', voterData);
    
    // PERBAIKAN: Jika candidate adalah null (tidak setuju), pilih kotak kosong
    const isVotingForEmptyBox = !candidate;
    
    if (!voterData) {
        showNotification('Silakan login kembali', 'error');
        window.location.href = '/index.html';
        return false;
    }
    
    if (voterData.hasVoted) {
        showNotification('Anda sudah melakukan vote sebelumnya!', 'warning');
        return false;
    }
    
    if (voterData.isDashboardUser === true) {
        showNotification('Admin tidak dapat melakukan voting!', 'error');
        return false;
    }
    
    // Konfirmasi berdasarkan pilihan
    let confirmMessage = '';
    if (isVotingForEmptyBox) {
        confirmMessage = 'Anda yakin memilih KOTAK KOSONG/TIDAK SETUJU dengan semua kandidat?';
    } else {
        confirmMessage = `Anda yakin ingin memilih ${candidate.name}?`;
    }
    
    const confirmVote = confirm(confirmMessage);
    if (!confirmVote) return false;
    
    showLoading(true);
    
    try {
        let candidateDocId = '';
        let candidateName = '';
        
        if (isVotingForEmptyBox) {
            // Pilih kotak kosong
            candidateDocId = 'kotakKosong';
            candidateName = 'Kotak Kosong';
        } else {
            // Pilih kandidat yang ditampilkan
            candidateName = candidate.name;
            if (candidate.name === 'Vincentius Alvin Rumantir' || candidate.name.includes('Vincentius')) {
                candidateDocId = 'VincentiusAlvinRumantir';
            } else if (candidate.name.toLowerCase().includes('kotak') || candidate.name.toLowerCase().includes('kosong')) {
                candidateDocId = 'kotakKosong';
            } else {
                candidateDocId = candidate.name.replace(/\s/g, '');
            }
        }
        
        console.log('Voting for:', candidateName, 'Doc ID:', candidateDocId);
        
        // 1. Increment vote untuk kandidat/kotak kosong yang dipilih
        const candidateVoteRef = doc(db, 'votes', candidateDocId);
        const candidateVoteDoc = await getDoc(candidateVoteRef);
        
        if (!candidateVoteDoc.exists()) {
            await updateDoc(candidateVoteRef, { jumlahVote: increment(1) });
        } else {
            await updateDoc(candidateVoteRef, {
                jumlahVote: increment(1)
            });
        }
        
        console.log(`Vote added to ${candidateDocId}`);
        
        // 2. Decrement notVoting (karena voter sudah memilih)
        const notVotingRef = doc(db, 'votes', 'notVoting');
        const notVotingDoc = await getDoc(notVotingRef);
        
        if (notVotingDoc.exists()) {
            const currentNotVoting = notVotingDoc.data().jumlahVote || 0;
            if (currentNotVoting > 0) {
                await updateDoc(notVotingRef, {
                    jumlahVote: increment(-1)
                });
                console.log('Decremented notVoting');
            }
        } else {
            await updateDoc(notVotingRef, { jumlahVote: 3 });
        }
        
        // 3. Update status voter
        const voterId = voterData.voterId || voterData.username;
        const voterRef = doc(db, 'voters', voterId);
        
        await updateDoc(voterRef, { 
            hasVoted: true, 
            votedAt: new Date().toISOString(),
            votedFor: candidateName
        });
        
        console.log('Voter updated successfully');
        
        let successMessage = isVotingForEmptyBox 
            ? 'Terima kasih telah memberikan suara (Kotak Kosong/Tidak Setuju)!'
            : `Terima kasih telah memilih ${candidateName}!`;
        showNotification(successMessage, 'success');
        
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