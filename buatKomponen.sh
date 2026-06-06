cd ~/Desktop/project/pemiluPPIT2026

# Buat file components yang diperlukan
cat > public/css/components/buttons.css << 'EOF'
/* Button styles */
.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #2563eb;
    color: white;
}

.btn-primary:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
}

.btn-primary:disabled {
    background: #93c5fd;
    cursor: not-allowed;
    transform: none;
}

.btn-danger {
    background: #ef4444;
    color: white;
}

.btn-danger:hover {
    background: #dc2626;
    transform: translateY(-1px);
}

.pill_btn_agree,
.pill_btn_notagree {
    width: 40%;
    text-align: center;
    padding: 8px 18px;
    font-size: 12px;
    letter-spacing: 1px;
    color: black;
    background: #f5f2e7;
    border-radius: 20px;
    box-shadow: 0 4px 15px rgba(199, 126, 104, 0.4);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    z-index: 1;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: none;
    font-family: 'Orbitron', sans-serif;
}

.pill_btn_agree::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, #2e7d32, #66bb6a, #81c784);
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: -1;
    border-radius: 20px;
}

.pill_btn_agree:hover::before {
    width: 100%;
}

.pill_btn_agree:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 6px 20px rgba(46, 125, 50, 0.4);
}

.pill_btn_notagree::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, #b71c1c, #f44336, #ef9a9a);
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: -1;
    border-radius: 20px;
}

.pill_btn_notagree:hover::before {
    width: 100%;
}

.pill_btn_notagree:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 6px 20px rgba(183, 28, 28, 0.4);
}
EOF

cat > public/css/components/cards.css << 'EOF'
/* Card styles */
.info-card {
    background: #fff;
    padding: 20px;
    border-radius: 16px;
    min-width: 260px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
}

.info-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.info-card h3 {
    font-size: 1.8rem;
    font-weight: 700;
}

.info-card h3 span {
    font-size: 0.9rem;
    font-weight: normal;
    color: #666;
}

.info-card small {
    color: #6b7280;
    font-size: 0.8rem;
}

.icon {
    font-size: 2rem;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f4ff;
    border-radius: 50%;
}

.blue {
    color: #2563eb;
}

.green {
    color: #16a34a;
}

.candidate-card {
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s, box-shadow 0.2s;
}

.candidate-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.candidate-card h2 {
    padding: 20px 20px 10px 20px;
    color: #2563eb;
    font-size: 1.2rem;
    letter-spacing: 1px;
}

.candidate-card h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 8px 15px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #e5e7eb;
}

.candidate-card img {
    width: 140px;
    height: 140px;
    object-fit: cover;
    border-radius: 50%;
    background: #f8fafc;
    margin: 0 auto;
    display: block;
    border: 3px solid #e2e8f0;
    transition: transform 0.3s;
}

.candidate-card:hover img {
    transform: scale(1.02);
    border-color: #2563eb;
}

.vote-count {
    padding: 15px 20px 25px;
}

.vote-count h1 {
    color: #2563eb;
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 5px;
}

.vote-count p {
    color: #6b7280;
    font-size: 0.9rem;
}

.stats_card {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    gap: clamp(10px, 2vw, 20px);
    padding: 30px clamp(15px, 5vw, 40px);
    background: #f5f2e7;
    color: #6f4d46;
    margin: 30px 0 0 0;
}

.image_card {
    height: 170px;
    padding-top: 5px;
    position: relative;
}

.image_card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: rotateX(70px);
}

.image_overlay_text {
    position: absolute;
    bottom: 10px;
    right: 20px;
    font-size: 12px;
    letter-spacing: 1.5px;
    color: rgba(255, 255, 255, 0.9);
    font-family: 'Orbitron', sans-serif;
}
EOF

cat > public/css/components/forms.css << 'EOF'
/* Form styles */
.inputBox input {
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    outline: none;
    border: 2px solid rgba(255, 255, 255, .2);
    border-radius: 40px;
    color: white;
    padding: 20px 45px 20px 20px;
}

.inputBox input::placeholder {
    color: white;
}

.inputBox .iconInLogIn {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 20px;
}

.wrapper .button {
    width: 100%;
    height: 50px;
    background: white;
    border: none;
    outline: none;
    border-radius: 40px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .1);
    cursor: pointer;
    font-size: 16px;
    color: #333;
    font-weight: 600;
    transition: transform 0.3s ease;
}

.wrapper .button:hover {
    transform: scale(1.02);
    background: #f0f0f0;
}

.wrapper .inputBox:hover {
    transform: scale(1.02);
}
EOF

cat > public/css/components/navigation.css << 'EOF'
/* Navigation styles */
.navbar {
    width: 60%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: clamp(15px, 3vw, 30px);
    opacity: 0.7;
    transition: transform 0.3s ease, opacity 0.3s ease;
    cursor: pointer;
}

.navbar:hover {
    transform: scale(1.1);
    opacity: 1;
}

.tag {
    font-style: italic;
    width: 70%;
    background: rgba(217, 175, 150, 0.9);
    color: white;
    padding: 6px 18px;
    border-radius: 20px;
    font-size: 12px;
    letter-spacing: 1px;
    font-family: 'Orbitron', sans-serif;
    text-align: center;
}

.top_panel {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 20px 30px;
}

.tag_panel {
    padding: 6px 16px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 20px;
    font-size: 12px;
    color: white;
    letter-spacing: 1px;
    font-family: 'Orbitron', sans-serif;
    background: rgba(255, 255, 255, 0.2);
}
EOF

cat > public/css/components/notifications.css << 'EOF'
/* Notification styles */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4caf50;
    color: white;
    padding: 15px;
    border-radius: 5px;
    display: none;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.error-message {
    color: #ff6b6b;
    text-align: center;
    margin-top: 10px;
    display: none;
    font-size: 14px;
    padding: 10px;
    background: rgba(255, 0, 0, 0.1);
    border-radius: 10px;
}

.loading-message {
    color: white;
    text-align: center;
    margin-top: 10px;
    display: none;
    font-size: 14px;
}

.spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #2563eb;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

#loadingScreen {
    text-align: center;
    padding: 50px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#loadingScreen p {
    margin-top: 15px;
    color: #666;
    font-size: 14px;
}

.live-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #10b981;
    margin-right: 6px;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
    }
    70% {
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
}
EOF

cat > public/css/layouts/login-layout.css << 'EOF'
/* Login page layout styles */
body {
    background: url("../assets/images/backgrounds/anko_index_wallpaper.png") no-repeat;
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.wrapper {
    width: 420px;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, .5);
    color: white;
    border-radius: 10px;
    padding: 30px 40px;
    backdrop-filter: blur(10px);
    margin: 0 5%;
}

.wrapper h1 {
    font-size: 36px;
    text-align: center;
    margin-bottom: 30px;
}

.wrapper .inputBox {
    position: relative;
    width: 100%;
    height: 50px;
    margin: 30px 0;
}

.btnForgot {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
}

.item {
    width: 100%;
    text-align: center;
}

.wrapper .forgot {
    text-align: center;
}

.wrapper .forgot a {
    font-size: 14.5px;
    color: white;
    text-decoration: none;
    display: inline-block;
}

.forgot a:hover {
    text-decoration: underline;
}
EOF

cat > public/css/layouts/vote-layout.css << 'EOF'
/* Vote page layout styles */
body {
    background: linear-gradient(90deg, #6f4d46, #b98977);
}

.candidate {
    min-height: calc(100vh - 80px);
    position: relative;
}

.white-space {
    width: 60%;
    min-height: 100vh;
    background: #f5f2e7;
    clip-path: polygon(0 0, 100% 0, 70% 100%, 0 100%);
    animation: slideInFromLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.right_panel {
    position: absolute;
    top: -50px;
    right: 0;
    width: clamp(300px, 50%, 100%);
    height: 105vh;
    background: linear-gradient(90deg, #d9af96, #a37668);
    clip-path: polygon(35% 0, 100% 0, 100% 100%, 0 100%);
    animation: slideInFromRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.candidate-text {
    padding-left: clamp(20px, 5vw, 60px);
    padding-top: clamp(20px, 4vw, 30px);
}

.main-title {
    font-size: clamp(36px, 6vw, 80px);
    font-weight: 800;
    line-height: 0.9;
    letter-spacing: 1.2px;
    font-family: 'Montserrat', sans-serif;
    margin: 0 0 10px 0;
    background: linear-gradient(90deg, #6f4d46, #b98977);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.sub-title {
    display: inline-block;
    width: 100%;
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 1px;
    padding: 6px 16px;
    margin-bottom: 30px;
    font-family: 'Orbitron', sans-serif;
    background: linear-gradient(90deg, #6f4d46, #c77e68);
    color: white;
}

.about_title {
    font-family: 'Orbitron', sans-serif;
    font-size: 24px;
    letter-spacing: 2px;
    color: #6f4d46;
    margin-bottom: 12px;
}

.about_text {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(20px, 1.2vw, 14px);
    color: #87655c;
    max-width: 55%;
}

.candidate_img {
    position: absolute;
    bottom: 0px;
    left: 46%;
    width: clamp(200px, 50vw, 600px);
    animation: slideInFromBottom 0.9s cubic-bezier(0.34, 1.2, 0.64, 1) forwards, floatScale 4s ease-in-out infinite 0.9s;
    z-index: 12;
    pointer-events: none;
    opacity: 0;
}

.stats_content {
    padding-left: 30%;
}

.stats_top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dots {
    font-size: 18px;
    letter-spacing: 3px;
}

.mission_container {
    font-family: 'Orbitron', sans-serif;
    color: #87655c;
    font-size: 16px;
    gap: 10px 50px;
    margin-bottom: 15px;
}

.button_card {
    display: flex;
    justify-content: center;
    align-items: center;
}

.bottom_actions {
    margin-left: 20%;
    width: 90%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin-top: 30px;
}
EOF

cat > public/css/layouts/dashboard-layout.css << 'EOF'
/* Dashboard page layout styles */
.container {
    max-width: 1400px;
    margin: auto;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.dashboard-header h1 {
    font-size: 2rem;
    font-weight: 800;
}

.dashboard-header h1 span {
    color: #dc2626;
}

.dashboard-header p {
    margin-top: 10px;
    color: #666;
    font-size: 0.9rem;
}

.header-cards {
    display: flex;
    gap: 15px;
}

.button-group {
    display: flex;
    gap: 10px;
}

.chart-section {
    background: #fff;
    border-radius: 20px;
    padding: 30px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

.chart-box {
    width: 100%;
    max-width: 500px;
    margin: auto;
}

.chart-box canvas {
    max-height: 300px;
    width: 100%;
}

.summary-box {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 10px;
}

.summary-box h2 {
    margin-bottom: 10px;
    font-size: 1.3rem;
}

.summary-box p {
    color: #777;
    margin-bottom: 20px;
    font-size: 0.85rem;
}

.result-section {
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
}

.info-footer {
    margin-top: 30px;
    background: #fff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    border-left: 4px solid #2563eb;
}

.info-footer strong {
    display: block;
    margin-bottom: 8px;
    color: #1f2937;
}

.info-footer p {
    color: #4b5563;
    font-size: 0.85rem;
    line-height: 1.4;
}
EOF

cat > public/css/pages/page-index.css << 'EOF'
/* Import hanya untuk login */
@import '../base/reset.css';
@import '../base/variables.css';
@import '../base/typography.css';
@import '../components/forms.css';
@import '../components/buttons.css';
@import '../components/notifications.css';
@import '../layouts/login-layout.css';
@import 'login.css';
@import '../responsive/mobile.css';
@import '../responsive/tablet.css';
EOF

cat > public/css/pages/page-vote.css << 'EOF'
/* Import hanya untuk halaman vote */
@import '../base/reset.css';
@import '../base/variables.css';
@import '../base/typography.css';
@import '../components/buttons.css';
@import '../components/cards.css';
@import '../components/navigation.css';
@import '../components/notifications.css';
@import '../layouts/vote-layout.css';
@import 'vote.css';
@import '../responsive/mobile.css';
@import '../responsive/tablet.css';
@import '../responsive/desktop.css';
EOF

cat > public/css/pages/page-dashboard.css << 'EOF'
/* Import hanya untuk halaman dashboard */
@import '../base/reset.css';
@import '../base/variables.css';
@import '../base/typography.css';
@import '../components/buttons.css';
@import '../components/cards.css';
@import '../components/notifications.css';
@import '../layouts/dashboard-layout.css';
@import 'dashboard.css';
@import '../responsive/mobile.css';
@import '../responsive/tablet.css';
EOF