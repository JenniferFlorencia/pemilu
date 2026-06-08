// /public/js/pages/dashboard-page.js
import { getDashboardStats, getCandidateDetails, getVotesPerCandidate } from '../modules/dashboard/dashboard-service.js';

let voteChart = null;
let refreshInterval = null;
let isLoading = false;

// Fungsi untuk mengubah nama kandidat
function formatCandidateName(originalName) {
    if (!originalName) return originalName;
    
    if (originalName === 'Vincentius Alvin Rumantir' || originalName.includes('Vincentius')) {
        return 'Setuju';
    }
    if (originalName === 'Kotak Kosong' || originalName.toLowerCase().includes('kotak')) {
        return 'Tidak Setuju';
    }
    return originalName;
}

// EXPORT fungsi loadDashboard agar bisa dipanggil dari HTML
export async function loadDashboard() {
    if (isLoading) {
        console.log('Dashboard already loading, skipping...');
        return;
    }
    
    isLoading = true;
    
    try {
        console.log('Loading dashboard...');
        
        const now = new Date();
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) lastUpdateEl.textContent = now.toLocaleTimeString('id-ID');
        
        const stats = await getDashboardStats();
        if (!stats || stats.error) {
            console.error('Failed to load stats:', stats?.error);
            const infoFooter = document.getElementById('infoFooter');
            if (infoFooter) infoFooter.innerHTML = 'Gagal memuat data. Periksa koneksi database.';
            return;
        }
        
        console.log('Stats loaded:', stats);
        
        const totalVotersEl = document.getElementById('totalVoters');
        const totalVotesCastEl = document.getElementById('totalVotesCast');
        
        if (totalVotersEl) totalVotersEl.textContent = stats.totalVoters.toLocaleString('id-ID');
        
        const votePercentage = stats.totalVoters > 0 ? ((stats.totalVotesCast / stats.totalVoters) * 100).toFixed(2) : 0;
        if (totalVotesCastEl) {
            totalVotesCastEl.innerHTML = `${stats.totalVotesCast.toLocaleString('id-ID')} <span id="votePercent">(${votePercentage}%)</span>`;
        }
        
        // Sort voteCounts berdasarkan nama asli untuk konsistensi
        const sortedVoteEntries = Object.entries(stats.voteCounts)
            .sort((a, b) => a[0].localeCompare(b[0]));
        
        // Definisikan warna
        const getColorForName = (originalName, index) => {
            const specificColors = {
                'Vincentius Alvin Rumantir': '#2563eb',
                'Kotak Kosong': '#10b981'
            };
            
            if (specificColors[originalName]) return specificColors[originalName];
            
            const defaultColors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec489a', '#06b6d4', '#f97316', '#a855f7'];
            return defaultColors[index % defaultColors.length];
        };
        
        // Siapkan data chart dengan nama yang sudah diformat
        const chartLabels = [
            ...sortedVoteEntries.map(([originalName]) => formatCandidateName(originalName)), 
            'Belum Memilih'
        ];
        const chartData = [
            ...sortedVoteEntries.map(([, data]) => parseFloat(((data.count / stats.totalVoters) * 100).toFixed(2))),
            parseFloat(stats.notVotedPercentage)
        ];
        
        const chartColors = [
            ...sortedVoteEntries.map(([originalName], idx) => getColorForName(originalName, idx)),
            '#ef4444'
        ];
        
        // Update or create chart
        const ctx = document.getElementById('voteChart');
        if (ctx) {
            if (voteChart) {
                voteChart.data.datasets[0].data = chartData;
                voteChart.data.labels = chartLabels;
                voteChart.data.datasets[0].backgroundColor = chartColors;
                voteChart.update();
            } else {
                voteChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            data: chartData,
                            backgroundColor: chartColors,
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: { 
                                position: 'bottom',
                                labels: { 
                                    font: { size: 11 },
                                    boxWidth: 12,
                                    padding: 10
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.raw || 0;
                                        return `${label}: ${value}%`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
        
        // Update summary items dengan nama yang sudah diformat
        const summaryContainer = document.getElementById('summaryItems');
        if (summaryContainer) {
            summaryContainer.innerHTML = '';
            
            if (sortedVoteEntries.length === 0) {
                summaryContainer.innerHTML = '<p style="text-align: center; color: #999;">Belum ada suara masuk</p>';
            } else {
                sortedVoteEntries.forEach(([originalName, voteData], idx) => {
                    const displayName = formatCandidateName(originalName);
                    const percentage = stats.percentages[originalName];
                    const color = chartColors[idx];
                    
                    summaryContainer.innerHTML += `
                        <div class="summary-item">
                            <div class="left">
                                <span class="dot" style="background-color: ${color}"></span>
                                <div>
                                    <h4>${escapeHtml(displayName)}</h4>
                                    <small>${voteData.count.toLocaleString('id-ID')} suara</small>
                                </div>
                            </div>
                            <h3 style="color: ${color}">${percentage}%</h3>
                        </div>
                    `;
                });
            }
            
            summaryContainer.innerHTML += `
                <div class="summary-item">
                    <div class="left">
                        <span class="dot" style="background-color: #ef4444"></span>
                        <div>
                            <h4>Belum / Tidak Memilih</h4>
                            <small>${stats.notVoted.toLocaleString('id-ID')} pemilih</small>
                        </div>
                    </div>
                    <h3 style="color: #ef4444">${stats.notVotedPercentage}%</h3>
                </div>
            `;
        }
        
        // Update candidate cards dengan nama yang sudah diformat
        const candidates = await getCandidateDetails();
        const votesPerCandidate = await getVotesPerCandidate();
        const resultSection = document.getElementById('resultSection');
        
        if (resultSection) {
            resultSection.innerHTML = '';
            
            if (candidates.length === 0) {
                resultSection.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1;">Belum ada data kandidat</p>';
            } else {
                for (const candidate of candidates) {
                    const voteCount = votesPerCandidate.get(String(candidate.id)) || 
                                     votesPerCandidate.get(String(candidate.candidateNumber)) || 0;
                    const percentage = stats.totalVoters > 0 ? ((voteCount / stats.totalVoters) * 100).toFixed(2) : 0;
                    
                    // Format display name
                    let displayName = formatCandidateName(candidate.name);
                    
                    let photoUrl = candidate.photoURL || './assets/images/backgrounds/default-avatar.png';
                    if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('./') && !photoUrl.startsWith('/')) {
                        photoUrl = './assets/images/backgrounds/' + photoUrl;
                    }
                    if (!photoUrl) {
                        photoUrl = './assets/images/backgrounds/default-avatar.png';
                    }
                    
                    resultSection.innerHTML += `
                        <div class="candidate-card">
                            <h2>${displayName === 'Setuju' ? 'SETUJU' : (displayName === 'Tidak Setuju' ? 'TIDAK SETUJU' : `KANDIDAT ${candidate.candidateNumber}`)}</h2>
                            <img src="${photoUrl}" 
                                 alt="${escapeHtml(displayName)}"
                                 onerror="this.src='./assets/images/backgrounds/default-avatar.png'">
                            <h3>${escapeHtml(displayName)}</h3>
                            <div class="vote-count">
                                <h1>${voteCount.toLocaleString('id-ID')}</h1>
                                <p>suara (${percentage}%)</p>
                            </div>
                        </div>
                    `;
                }
            }
        }
        
        const infoFooter = document.getElementById('infoFooter');
        if (infoFooter) {
            const tpsEstimate = Math.ceil(stats.totalVoters / 200);
            const participationRate = stats.totalVoters > 0 ? ((stats.totalVotesCast / stats.totalVoters) * 100).toFixed(2) : 0;
            
            infoFooter.innerHTML = `
                <strong>ℹ Informasi Real-time</strong><br>
                📊 Partisipasi: ${participationRate}% (${stats.totalVotesCast.toLocaleString('id-ID')} dari ${stats.totalVoters.toLocaleString('id-ID')} pemilih)<br>
                📍 Perkiraan ${tpsEstimate.toLocaleString('id-ID')} TPS (asumsi 200 pemilih/TPS)<br>
                🔄 Data diperbarui otomatis setiap 30 detik
            `;
        }
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        const infoFooter = document.getElementById('infoFooter');
        if (infoFooter) {
            infoFooter.innerHTML = '❌ Gagal memuat data: ' + error.message + '. Periksa koneksi internet dan refresh halaman.';
        }
    } finally {
        isLoading = false;
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function startAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    refreshInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            loadDashboard();
        }
    }, 30000);
    console.log('Auto-refresh started (every 30 seconds)');
}

export function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log('Auto-refresh stopped');
    }
}

export async function manualRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        const originalText = refreshBtn.textContent;
        refreshBtn.disabled = true;
        refreshBtn.textContent = '🔄 Memuat...';
        
        try {
            await loadDashboard();
            stopAutoRefresh();
            startAutoRefresh();
        } finally {
            refreshBtn.disabled = false;
            refreshBtn.textContent = originalText;
        }
    } else {
        await loadDashboard();
    }
}

function initRefreshButton() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        const newRefreshBtn = refreshBtn.cloneNode(true);
        refreshBtn.parentNode.replaceChild(newRefreshBtn, refreshBtn);
        
        newRefreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            manualRefresh();
        });
    }
}

async function initDashboard() {
    console.log('Initializing dashboard...');
    initRefreshButton();
    await loadDashboard();
    startAutoRefresh();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        console.log('Page hidden, auto-refresh paused');
    } else {
        console.log('Page visible, refreshing data...');
        loadDashboard();
    }
});