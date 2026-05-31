// src/scripts/test-connection.js
const admin = require('firebase-admin');

// Coba load service account
try {
  const serviceAccount = require('../../serviceAccountKey.json');
  console.log('✅ Service account loaded successfully');
  console.log('Project ID:', serviceAccount.project_id);
} catch (err) {
  console.error('❌ Failed to load service account:', err.message);
  process.exit(1);
}

// Inisialisasi Firebase
try {
  const serviceAccount = require('../../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase initialized successfully');
} catch (err) {
  console.error('❌ Firebase init failed:', err.message);
  process.exit(1);
}

const db = admin.firestore();

async function testConnection() {
  console.log('🔄 Testing Firestore connection...');
  
  try {
    // Coba baca collection (akan return empty array jika belum ada)
    const snapshot = await db.collection('voters').limit(1).get();
    console.log('✅ Firestore connection successful!');
    console.log('📊 Current voters count:', snapshot.size);
    process.exit(0);
  } catch (error) {
    console.error('❌ Firestore connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();