const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function testAuth() {
  console.log('🔄 Testing Firebase Auth connection...');
  console.log('⏱️  If stuck > 10 seconds, there is a network issue\n');
  
  try {
    // Set timeout 10 detik
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout after 10 seconds')), 10000);
    });
    
    const createPromise = auth.createUser({
      email: `test-${Date.now()}@test.com`,
      password: 'Test123456!',
      displayName: 'Test User'
    });
    
    const userRecord = await Promise.race([createPromise, timeoutPromise]);
    console.log('✅ Success! User created:', userRecord.uid);
    
    // Langsung hapus user test
    await auth.deleteUser(userRecord.uid);
    console.log('✅ Test user deleted');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Timeout')) {
      console.log('\n💡 Kemungkinan masalah:');
      console.log('1. Koneksi internet terputus/blokir');
      console.log('2. Firewall/proxy blocking Firebase');
      console.log('3. VPN diperlukan (karena Firebase mungkin diblokir)');
    }
  }
}

testAuth();
