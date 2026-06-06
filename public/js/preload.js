// /public/js/preload.js

// Daftar asset yang perlu di-preload
const ASSETS_TO_PRELOAD = [
    // CSS Files
    '/css/pages/page-vote.css',
    
    // JS Modules (yang dibutuhkan vote.html)
    '/js/config/env.js',
    '/js/config/firebase.js',
    '/js/modules/voting/candidate-service.js',
    '/js/modules/voting/vote-handler.js',
    '/js/modules/utils/helpers.js',
    
    // Images
    '/assets/images/backgrounds/anko_sideview.png',
    '/assets/images/backgrounds/anko_index_wallpaper.png'
];

// Cache untuk menyimpan status loading
const preloadCache = new Map();
let preloadStartTime = null;
let preloadTimeout = null;
let isRedirecting = false;
let isPreloadActive = false;

/**
 * Stop preload and cleanup
 */
export function stopPreload() {
    if (preloadTimeout) {
        clearTimeout(preloadTimeout);
        preloadTimeout = null;
    }
    isPreloadActive = false;
    isRedirecting = true;
    console.log('[Preload] Stopped due to redirect');
}

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
        
        // Jika redirect sudah terjadi, hentikan preload
        if (isRedirecting) {
            reject(new Error('Redirect in progress'));
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
            return false;
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
 * Cek apakah user adalah dashboard user
 */
function isDashboardUser() {
    const currentVoter = JSON.parse(localStorage.getItem('currentVoter') || '{}');
    return currentVoter.isDashboardUser === true;
}

/**
 * Navigate ke vote.html dengan preloading
 */
async function navigateToVoteWithPreload() {
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
    // Hanya jalankan preload jika user sudah login DAN bukan dashboard user
    if (!isUserLoggedIn()) {
        console.log('[Preload] User not logged in, skipping preload');
        return;
    }
    
    // PERBAIKAN: Jangan preload untuk dashboard user
    if (isDashboardUser()) {
        console.log('[Preload] Dashboard user detected, skipping preload');
        return;
    }
    
    // Cegah multiple calls
    if (isPreloadActive) {
        console.log('[Preload] Already running, skipping...');
        return;
    }
    
    isPreloadActive = true;
    preloadStartTime = Date.now();
    console.log('[Preload] Starting vote assets preload at', new Date(preloadStartTime).toLocaleTimeString());
    
    // Set timeout 3 detik (lebih pendek)
    preloadTimeout = setTimeout(() => {
        console.log('[Preload] Timeout reached (3 seconds), redirecting immediately...');
        if (isUserLoggedIn() && !isDashboardUser()) {
            navigateToVoteWithPreload();
        }
    }, 3000);
    
    try {
        // Preload all assets
        await preloadAllAssets();
        
        const elapsed = Date.now() - preloadStartTime;
        console.log(`[Preload] All assets loaded in ${elapsed}ms`);
        
        // Jika masih dalam batas waktu dan user masih login dan bukan dashboard user
        if (isUserLoggedIn() && !isDashboardUser() && !isRedirecting) {
            navigateToVoteWithPreload();
        }
    } catch (error) {
        console.error('[Preload] Error during preload:', error);
        // Jika error dan masih dalam batas waktu, tetap redirect
        if (isUserLoggedIn() && !isDashboardUser() && !isRedirecting) {
            navigateToVoteWithPreload();
        }
    } finally {
        isPreloadActive = false;
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
    isPreloadActive = false;
    preloadCache.clear();
}

// Expose stopPreload ke window untuk dipanggil dari auth-service
window.stopPreload = stopPreload;