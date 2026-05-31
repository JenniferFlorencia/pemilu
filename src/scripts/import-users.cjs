// src/scripts/import-users.cjs
const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

// Inisialisasi Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

// ============================================
// DAFTAR USER - SESUAIKAN DENGAN DATA ANDA
// ============================================
const users = [
  { username: "ahmadfauzi", name: "Ahmad Fauzi", password: "Pemilu2026!" },
  { username: "sitinurul", name: "Siti Nurul", password: "Pemilu2026!" },
  { username: "budiwibowo", name: "Budi Wibowo", password: "Pemilu2026!" },
  // TAMBAHKAN USER LAIN DI SINI
];

async function importUsers() {
  console.log('🚀 Memulai import users...\n');
  console.log(`📋 Total user: ${users.length}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const user of users) {
    const email = `${user.username}@pemilu2026.internal`;
    console.log(`--- ${user.username} ---`);
    
    try {
      let uid;
      
      // Cek apakah user sudah ada di Firebase Auth
      try {
        const existingUser = await auth.getUserByEmail(email);
        uid = existingUser.uid;
        console.log(`⚠️  Sudah ada di Auth (UID: ${uid.substring(0, 8)}...)`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Buat user baru
          const userRecord = await auth.createUser({
            email: email,
            password: user.password,
            displayName: user.name,
          });
          uid = userRecord.uid;
          console.log(`✅ Berhasil dibuat di Auth`);
        } else {
          throw error;
        }
      }
      
      // Simpan ke Firestore (document ID = username)
      await db.collection('voters').doc(user.username).set({
        uid: uid,
        username: user.username,
        name: user.name,
        email: email,
        hasVoted: false,
        createdAt: new Date().toISOString()
      });
      console.log(`✅ Tersimpan di Firestore`);
      console.log(`🔑 Password: ${user.password}`);
      successCount++;
      
    } catch (error) {
      console.error(`❌ Gagal: ${error.message}`);
      failCount++;
    }
    
    console.log('');
  }
  
  console.log('='.repeat(40));
  console.log(`🎉 Selesai!`);
  console.log(`✅ Berhasil: ${successCount} user`);
  console.log(`❌ Gagal: ${failCount} user`);
  console.log('='.repeat(40));
}

// Jalankan fungsi
importUsers();