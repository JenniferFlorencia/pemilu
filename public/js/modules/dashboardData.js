// /public/js/modules/dashboardData.js
import { db, auth } from '../config/firebase.js';
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

export async function getDashboardStats() {
    try {
        // Pastikan user sudah login
        if (!auth.currentUser) {
            console.log('No user logged in');
            return null;
        }
        
        console.log('Fetching dashboard stats for user:', auth.currentUser.uid);
        
        // Ambil semua voters
        const votersRef = collection(db, 'voters');
        const votersSnapshot = await getDocs(votersRef);
        
        let votersWhoCanVote = 0;
        let votersWhoHaveVoted = 0;
        
        votersSnapshot.forEach((voterDoc) => {
            const voter = voterDoc.data();
            // Abaikan dashboard user / admin
            if (voter.isDashboardUser !== true) {
                votersWhoCanVote++;
                if (voter.hasVoted === true) {
                    votersWhoHaveVoted++;
                }
            }
        });
        
        console.log('Voters count:', votersWhoCanVote);
        console.log('Votes cast:', votersWhoHaveVoted);
        
        // Baca data dari collection votes (counter system)
        const votesRef = collection(db, 'votes');
        const votesSnapshot = await getDocs(votesRef);
        
        const voteCounts = {};
        
        votesSnapshot.forEach((voteDoc) => {
            const data = voteDoc.data();
            const docId = voteDoc.id;
            const jumlahVote = data.jumlahVote || 0;
            
            if (docId === 'notVoting') return;
            
            let displayName = docId;
            if (docId === 'VincentiusAlvinRumantir') {
                displayName = 'Vincentius Alvin Rumantir';
            } else if (docId === 'kotakKosong') {
                displayName = 'Kotak Kosong';
            }
            
            if (jumlahVote > 0) {
                voteCounts[displayName] = {
                    name: displayName,
                    count: jumlahVote
                };
            }
        });
        
        const totalVotesCast = votersWhoHaveVoted;
        const notVoted = votersWhoCanVote - totalVotesCast;
        const notVotedPercentage = votersWhoCanVote > 0 ? ((notVoted / votersWhoCanVote) * 100).toFixed(2) : 0;
        
        const percentages = {};
        for (const [name, data] of Object.entries(voteCounts)) {
            percentages[name] = votersWhoCanVote > 0 ? ((data.count / votersWhoCanVote) * 100).toFixed(2) : 0;
        }
        
        // Prepare chart data
        const chartLabels = [...Object.keys(voteCounts), 'Belum Memilih'];
        const chartData = [
            ...Object.values(voteCounts).map(v => parseFloat(((v.count / votersWhoCanVote) * 100).toFixed(2))),
            parseFloat(notVotedPercentage)
        ];
        const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec489a', '#06b6d4'];
        
        return {
            totalVoters: votersWhoCanVote,
            totalVotesCast: totalVotesCast,
            notVoted: notVoted,
            voteCounts: voteCounts,
            percentages: percentages,
            notVotedPercentage: notVotedPercentage,
            chartLabels: chartLabels,
            chartData: chartData,
            chartColors: chartColors
        };
        
    } catch (error) {
        console.error("Error getting dashboard stats:", error);
        return null;
    }
}

export async function getCandidateDetails() {
    try {
        console.log('Fetching candidates...');
        
        const candidatesRef = collection(db, 'candidates');
        const candidatesSnapshot = await getDocs(candidatesRef);
        const candidates = [];
        
        // Perbaikan: gunakan forEach dengan parameter yang benar
        candidatesSnapshot.forEach((candidateDoc) => {
            const data = candidateDoc.data();
            console.log('Candidate data:', data);
            
            candidates.push({
                id: candidateDoc.id,
                name: data.name || 'Unknown',
                candidateNumber: data.candidateNumber || parseInt(candidateDoc.id) || 0,
                photoURL: data.photoURL || './assets/images/default-avatar.png',
                vision: data.vision || [],
                mission: data.mission || []
            });
        });
        
        // Ambil jumlah vote untuk setiap kandidat dari collection votes
        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            let voteDocId = '';
            
            if (candidate.name === 'Vincentius Alvin Rumantir' || candidate.name.includes('Vincentius')) {
                voteDocId = 'VincentiusAlvinRumantir';
            } else if (candidate.name.toLowerCase().includes('kotak') || candidate.name.toLowerCase().includes('kosong')) {
                voteDocId = 'kotakKosong';
            } else {
                voteDocId = candidate.name.replace(/\s/g, '');
            }
            
            const voteDocRef = doc(db, 'votes', voteDocId);
            const voteDoc = await getDoc(voteDocRef);
            const voteCount = voteDoc.exists() ? (voteDoc.data().jumlahVote || 0) : 0;
            
            candidates[i].voteCount = voteCount;
        }
        
        candidates.sort((a, b) => a.candidateNumber - b.candidateNumber);
        console.log('Candidates loaded:', candidates);
        return candidates;
        
    } catch (error) {
        console.error("Error getting candidates:", error);
        return [];
    }
}

export async function getVotesPerCandidate() {
    try {
        const voteMap = new Map();
        const votesRef = collection(db, 'votes');
        const votesSnapshot = await getDocs(votesRef);
        
        votesSnapshot.forEach((voteDoc) => {
            if (voteDoc.id === 'notVoting') return;
            
            const data = voteDoc.data();
            const jumlahVote = data.jumlahVote || 0;
            
            if (voteDoc.id === 'VincentiusAlvinRumantir') {
                voteMap.set('1', jumlahVote);
                voteMap.set('VincentiusAlvinRumantir', jumlahVote);
            } else if (voteDoc.id === 'kotakKosong') {
                voteMap.set('kotakKosong', jumlahVote);
            }
        });
        
        return voteMap;
    } catch (error) {
        console.error("Error getting votes per candidate:", error);
        return new Map();
    }
}