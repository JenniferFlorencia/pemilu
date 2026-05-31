export function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.style.backgroundColor = type === 'success' ? '#4caf50' : '#ff9800';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

export function showLoading(show) {
    const loadingDiv = document.getElementById('loadingMessage');
    if (loadingDiv) {
        loadingDiv.style.display = show ? 'block' : 'none';
    }
}

export function validateInput(username, password) {
    if (!username || !password) {
        showNotification('Username dan password harus diisi!', 'error');
        return false;
    }
    if (password.length < 4) {
        showNotification('Password minimal 4 karakter!', 'error');
        return false;
    }
    return true;
}
