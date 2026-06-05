// /public/js/dashboard-main.js
import { getDashboardStats, getCandidateDetails, getVotesPerCandidate } from './modules/dashboardData.js';

let voteChart = null;
let refreshInterval = null;
let isLoading = false; // Tambahan: flag untuk mencegah multiple load bersamaan

// EXPORT fungsi loadDashboard agar bisa dipanggil dari HTML
export async function loadDashboard() {
    // Cegah multiple loading bersamaan
    if (isLoading) {
        console.log('Dashboard already loading, skipping...');
        return;
    }
    
    isLoading = true;
    
    try {
        console.log('Loading dashboard...');
        
        // Update timestamp
        const now = new Date();
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) lastUpdateEl.textContent = now.toLocaleTimeString('id-ID');
        
        // Get stats
        const stats = await getDashboardStats();
        if (!stats || stats.error) {
            console.error('Failed to load stats:', stats?.error);
            const infoFooter = document.getElementById('infoFooter');
            if (infoFooter) infoFooter.innerHTML = 'Gagal memuat data. Periksa koneksi database.';
            return;
        }
        
        console.log('Stats loaded:', stats);
        
        // Update header cards
        const totalVotersEl = document.getElementById('totalVoters');
        const totalVotesCastEl = document.getElementById('totalVotesCast');
        
        if (totalVotersEl) totalVotersEl.textContent = stats.totalVoters.toLocaleString('id-ID');
        
        const votePercentage = stats.totalVoters > 0 ? ((stats.totalVotesCast / stats.totalVoters) * 100).toFixed(2) : 0;
        if (totalVotesCastEl) {
            totalVotesCastEl.innerHTML = `${stats.totalVotesCast.toLocaleString('id-ID')} <span id="votePercent">(${votePercentage}%)</span>`;
        }
        
        // Prepare chart data
        const chartLabels = [...Object.keys(stats.voteCounts), 'Belum Memilih'];
        const chartData = [
            ...Object.values(stats.voteCounts).map(v => parseFloat(((v.count / stats.totalVoters) * 100).toFixed(2))),
            parseFloat(stats.notVotedPercentage)
        ];
        const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec489a', '#06b6d4', '#f97316', '#a855f7'];
        
        // Update or create chart
        const ctx = document.getElementById('voteChart');
        if (ctx) {
            if (voteChart) {
                voteChart.data.datasets[0].data = chartData;
                voteChart.data.labels = chartLabels;
                voteChart.update();
            } else {
                voteChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            data: chartData,
                            backgroundColor: chartColors.slice(0, chartLabels.length),
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
        
        // Update summary items
        const summaryContainer = document.getElementById('summaryItems');
        if (summaryContainer) {
            summaryContainer.innerHTML = '';
            
            if (Object.keys(stats.voteCounts).length === 0) {
                summaryContainer.innerHTML = '<p style="text-align: center; color: #999;">Belum ada suara masuk</p>';
            } else {
                let colorIndex = 0;
                for (const [name, voteData] of Object.entries(stats.voteCounts)) {
                    const percentage = stats.percentages[name];
                    const color = chartColors[colorIndex % chartColors.length];
                    
                    summaryContainer.innerHTML += `
                        <div class="summary-item">
                            <div class="left">
                                <span class="dot" style="background-color: ${color}"></span>
                                <div>
                                    <h4>${escapeHtml(name)}</h4>
                                    <small>${voteData.count.toLocaleString('id-ID')} suara</small>
                                </div>
                            </div>
                            <h3 style="color: ${color}">${percentage}%</h3>
                        </div>
                    `;
                    colorIndex++;
                }
            }
            
            // Add "Belum Memilih" to summary
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
        
        // Update candidate cards
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
                    
                    // Handle photo URL - PERBAIKAN: path yang benar
                    let photoUrl = candidate.photoURL || './assets/images/default-avatar.png';
                    if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('./') && !photoUrl.startsWith('/')) {
                        photoUrl = './assets/images/' + photoUrl;
                    }
                    // Jika photoUrl kosong atau null
                    if (!photoUrl) {
                        photoUrl = './assets/images/default-avatar.png';
                    }
                    
                    resultSection.innerHTML += `
                        <div class="candidate-card">
                            <h2>KANDIDAT ${candidate.candidateNumber}</h2>
                            <img src="${photoUrl}" 
                                 alt="${escapeHtml(candidate.name)}"
                                 onerror="this.src='./assets/images/default-avatar.png'">
                            <h3>${escapeHtml(candidate.name)}</h3>
                            <div class="vote-count">
                                <h1>${voteCount.toLocaleString('id-ID')}</h1>
                                <p>suara (${percentage}%)</p>
                            </div>
                        </div>
                    `;
                }
            }
        }
        
        // Update footer info
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

// Auto-refresh every 30 seconds
export function startAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    // Mulai interval baru
    refreshInterval = setInterval(() => {
        // Hanya refresh jika halaman visible (menghemat resource)
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

// Manual refresh function dengan feedback
export async function manualRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        const originalText = refreshBtn.textContent;
        refreshBtn.disabled = true;
        refreshBtn.textContent = '🔄 Memuat...';
        
        try {
            await loadDashboard();
            // Reset interval setelah manual refresh
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

// Refresh button handler - PERBAIKAN: tunggu DOM siap
function initRefreshButton() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        // Hapus event listener lama jika ada (untuk mencegah duplicate)
        const newRefreshBtn = refreshBtn.cloneNode(true);
        refreshBtn.parentNode.replaceChild(newRefreshBtn, refreshBtn);
        
        newRefreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            manualRefresh();
        });
    }
}

// Initialize dashboard - PERBAIKAN: load selesai baru start auto-refresh
async function initDashboard() {
    console.log('Initializing dashboard...');
    
    // Setup refresh button
    initRefreshButton();
    
    // Load data pertama kali
    await loadDashboard();
    
    // Setelah load selesai, mulai auto-refresh
    startAutoRefresh();
}

// Event listener dengan pengecekan DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    // DOM sudah siap, langsung inisialisasi
    initDashboard();
}

// Cleanup interval on page unload
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

// Optional: Hentikan auto-refresh saat halaman tidak visible (hemat resource)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // Halaman tidak terlihat, refresh tetap berjalan tapi tidak akan mengeksekusi
        // karena sudah ada pengecekan di interval
        console.log('Page hidden, auto-refresh paused');
    } else {
        // Halaman kembali terlihat, refresh sekali untuk update
        console.log('Page visible, refreshing data...');
        loadDashboard();
    }
});