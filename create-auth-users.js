// create-auth-users.js
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

async function createAuthUsers() {
  const votersSnapshot = await db.collection('voters').get();
  
  for (const doc of votersSnapshot.docs) {
    const voter = doc.data();
    const email = voter.email;
    const password = voter.password; // Password dari Firestore
    
    try {
      // Cek apakah user sudah ada
      const userRecord = await auth.getUserByEmail(email);
      console.log(`User already exists: ${email}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Buat user baru
        const user = await auth.createUser({
          email: email,
          password: password,
          displayName: voter.name,
        });
        console.log(`Created user: ${email} with UID: ${user.uid}`);
        
        // Update Firestore document dengan UID yang benar
        await db.collection('voters').doc(doc.id).update({
          uid: user.uid,
          hasVoted: voter.hasVoted || false
        });
      }
    }
  }
}

createAuthUsers().then(() => console.log('Done!'));