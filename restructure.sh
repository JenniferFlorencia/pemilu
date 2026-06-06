#!/bin/bash

# Masuk ke direktori proyek (sesuaikan dengan path Anda)
# cd ~/Desktop/project/pemiluPPIT2026

echo "🚀 Memulai restrukturisasi proyek..."

# 1. Buat struktur folder baru
echo "📁 Membuat struktur folder..."
mkdir -p public/css/{base,components,layouts,pages,responsive}
mkdir -p public/js/{core,modules,pages,config}
mkdir -p public/js/modules/{auth,voting,dashboard,utils}
mkdir -p public/assets/images/{candidates,icons,backgrounds,ui}
mkdir -p public/assets/{fonts,videos}
mkdir -p public/libs
mkdir -p scripts
mkdir -p firebase
mkdir -p config
mkdir -p tests/{unit,integration,e2e}

# 2. Pindahkan file assets yang sudah ada
echo "🖼️  Memindahkan assets..."
if [ -d "public/assets/images" ]; then
    mv public/assets/images/* public/assets/images/backgrounds/ 2>/dev/null || true
fi

# 3. Pindahkan file CSS ke struktur baru
echo "🎨 Memindahkan file CSS..."
mv public/css/main.css public/css/main.css.bak 2>/dev/null || true
mv public/css/dashboard.css public/css/pages/dashboard.css 2>/dev/null || true
mv public/css/login.css public/css/pages/login.css 2>/dev/null || true
mv public/css/vote.css public/css/pages/vote.css 2>/dev/null || true

# 4. Pindahkan file JS ke struktur baru
echo "📜 Memindahkan file JS..."

# Pindahkan config
if [ -d "public/js/config" ]; then
    mv public/js/config public/js/config.bak 2>/dev/null || true
    mkdir -p public/js/config
    mv public/js/config.bak/* public/js/config/ 2>/dev/null || true
    rm -rf public/js/config.bak 2>/dev/null || true
fi

# Pindahkan modules ke struktur baru
mv public/js/modules/auth.js public/js/modules/auth/auth-service.js 2>/dev/null || true
mv public/js/modules/candidates.js public/js/modules/voting/candidate-service.js 2>/dev/null || true
mv public/js/modules/voteHandler.js public/js/modules/voting/vote-handler.js 2>/dev/null || true
mv public/js/modules/dashboardData.js public/js/modules/dashboard/dashboard-service.js 2>/dev/null || true
mv public/js/modules/utils.js public/js/modules/utils/helpers.js 2>/dev/null || true

# Pindahkan file utama pages
mv public/js/login.js public/js/pages/login-page.js 2>/dev/null || true
mv public/js/vote.js public/js/pages/vote-page.js 2>/dev/null || true
mv public/js/dashboard-main.js public/js/pages/dashboard-page.js 2>/dev/null || true

# 5. Pindahkan script ke folder scripts
echo "🔧 Memindahkan scripts..."
mv scripts/import-users.js scripts/import-users.js.bak 2>/dev/null || true
mv src/scripts/* scripts/ 2>/dev/null || true

# 6. Pindahkan file firebase config
echo "🔥 Memindahkan konfigurasi Firebase..."
mv firebase.json firebase/ 2>/dev/null || true
mv firestore.rules firebase/ 2>/dev/null || true
mv firestore.indexes.json firebase/ 2>/dev/null || true
mv src/rules/storage.rules firebase/ 2>/dev/null || true

# 7. Pindahkan service account
echo "🔑 Memindahkan service account..."
mv serviceAccountKey.json config/ 2>/dev/null || true

# 8. Hapus folder yang sudah kosong
echo "🧹 Membersihkan folder lama..."
rm -rf src 2>/dev/null || true
rm -rf backup_old_files 2>/dev/null || true
rm -rf assets 2>/dev/null || true

echo "✅ Restrukturisasi selesai!"