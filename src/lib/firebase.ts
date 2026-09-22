import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyBkB29DWCvLthsekVDUv_B2Bogp7zzBKAw",
  authDomain: "student-inclusion.firebaseapp.com",
  projectId: "student-inclusion",
  storageBucket: "student-inclusion.firebasestorage.app",
  messagingSenderId: "900785171305",
  appId: "1:900785171305:web:f756b06b66a4a89ce7abf8",
};

let dbInstance: Firestore | null = null;

try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  dbInstance = getFirestore(app);
} catch (err) {
  console.warn('Firebase initialization note:', err);
}

export const db = dbInstance;
