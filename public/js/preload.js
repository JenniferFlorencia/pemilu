// /public/js/preload.js

// Daftar asset yang perlu di-preload
const ASSETS_TO_PRELOAD = [
    // CSS Files
    '/css/main.css',
    '/css/vote.css',
    
    // JS Modules (yang dibutuhkan vote.html)
    '/js/config/env.js',
    '/js/config/firebase.js',
    '/js/modules/candidates.js',
    '/js/modules/voteHandler.js',
    '/js/modules/utils.js',
    
    // Images
    '/assets/images/anko_sideview.png',
    '/assets/images/anko_index_wallpaper.png'
];

// Cache untuk menyimpan status loading
const preloadCache = new Map();
let preloadStartTime = null;
let preloadTimeout = null;
let isRedirecting = false;

/**
 * Preload single asset
 */
function preloadAsset(url) {
    return new Promise((resolve, reject) => {
        // Cek cache
        if (preloadCache.has(url)) {
            resolve(preloadCache.get(url));
            return;
        }
        
        const extension = url.split('.').pop().toLowerCase();
        
        if (extension === 'css') {
            // Preload CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = () => {
                preloadCache.set(url, true);
                resolve(true);
            };
            link.onerror = () => {
                preloadCache.set(url, false);
                reject(new Error(`Failed to load CSS: ${url}`));
            };
            document.head.appendChild(link);
        } 
        else if (extension === 'js') {
            // Preload JS modules (tanpa execute)
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = url;
            link.onload = () => {
                preloadCache.set(url, true);
                resolve(true);
            };
            link.onerror = () => {
                preloadCache.set(url, false);
                reject(new Error(`Failed to preload JS: ${url}`));
            };
            document.head.appendChild(link);
        }
        else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
            // Preload images
            const img = new Image();
            img.onload = () => {
                preloadCache.set(url, true);
                resolve(true);
            };
            img.onerror = () => {
                preloadCache.set(url, false);
                reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
        }
        else {
            // Unknown asset type, resolve immediately
            preloadCache.set(url, true);
            resolve(true);
        }
    });
}

/**
 * Preload all assets in parallel
 */
async function preloadAllAssets() {
    console.log('[Preload] Starting preload of', ASSETS_TO_PRELOAD.length, 'assets...');
    
    const promises = ASSETS_TO_PRELOAD.map(url => 
        preloadAsset(url).catch(err => {
            console.warn(`[Preload] Warning: ${err.message}`);
            return false; // Tidak gagalkan semua assets jika satu gagal
        })
    );
    
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r === true).length;
    const failCount = results.filter(r => r === false).length;
    
    console.log(`[Preload] Completed: ${successCount} succeeded, ${failCount} failed`);
    return { successCount, failCount };
}

/**
 * Cek apakah user sudah login
 */
function isUserLoggedIn() {
    const currentVoter = localStorage.getItem('currentVoter');
    return currentVoter !== null;
}

/**
 * Navigate ke vote.html dengan preloading
 */
export async function navigateToVoteWithPreload() {
    if (isRedirecting) return;
    isRedirecting = true;
    
    console.log('[Preload] Navigating to vote.html...');
    
    // Clear timeout jika ada
    if (preloadTimeout) {
        clearTimeout(preloadTimeout);
        preloadTimeout = null;
    }
    
    // Redirect ke vote.html
    window.location.href = '/vote.html';
}

/**
 * Main preload function - dipanggil dari index.html
 */
export async function preloadVoteAssets() {
    // Hanya jalankan preload jika user sudah login
    if (!isUserLoggedIn()) {
        console.log('[Preload] User not logged in, skipping preload');
        return;
    }
    
    // Cegah multiple calls
    if (preloadStartTime !== null) {
        console.log('[Preload] Already running, skipping...');
        return;
    }
    
    preloadStartTime = Date.now();
    console.log('[Preload] Starting vote assets preload at', new Date(preloadStartTime).toLocaleTimeString());
    
    // Set timeout 5 detik
    preloadTimeout = setTimeout(() => {
        console.log('[Preload] Timeout reached (5 seconds), redirecting immediately...');
        navigateToVoteWithPreload();
    }, 5000);
    
    try {
        // Preload all assets
        await preloadAllAssets();
        
        const elapsed = Date.now() - preloadStartTime;
        console.log(`[Preload] All assets loaded in ${elapsed}ms`);
        
        // Jika masih dalam batas waktu dan user masih login, redirect
        if (isUserLoggedIn() && !isRedirecting) {
            navigateToVoteWithPreload();
        }
    } catch (error) {
        console.error('[Preload] Error during preload:', error);
        // Jika error dan masih dalam batas waktu, tetap redirect
        if (isUserLoggedIn() && !isRedirecting) {
            navigateToVoteWithPreload();
        }
    }
}

/**
 * Optional: Preload specific candidate data from Firestore
 * (dapat dipanggil setelah login berhasil)
 */
export async function preloadCandidateData() {
    if (!isUserLoggedIn()) return;
    
    console.log('[Preload] Preloading candidate data...');
    
    try {
        // Dynamically import Firebase modules
        const { db } = await import('./config/firebase.js');
        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js");
        
        // Preload candidates data (tanpa blocking)
        const candidatesRef = collection(db, 'candidates');
        getDocs(candidatesRef).then(snapshot => {
            console.log('[Preload] Candidate data preloaded:', snapshot.size, 'candidates');
        }).catch(err => {
            console.warn('[Preload] Failed to preload candidate data:', err);
        });
    } catch (error) {
        console.warn('[Preload] Could not preload candidate data:', error);
    }
}

/**
 * Reset preload state (untuk testing)
 */
export function resetPreloadState() {
    if (preloadTimeout) {
        clearTimeout(preloadTimeout);
        preloadTimeout = null;
    }
    preloadStartTime = null;
    isRedirecting = false;
    preloadCache.clear();
}

// Export all functions at the end (optional, already exported above)
export { 
    preloadVoteAssets, 
    navigateToVoteWithPreload, 
    preloadCandidateData, 
    resetPreloadState 
};