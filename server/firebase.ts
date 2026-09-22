import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export function getFirebaseConfig(): FirebaseConfig | null {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;

  if (!projectId || !apiKey) {
    return null;
  }

  return {
    apiKey,
    authDomain:
      process.env.FIREBASE_AUTH_DOMAIN ||
      process.env.VITE_FIREBASE_AUTH_DOMAIN ||
      `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.VITE_FIREBASE_STORAGE_BUCKET ||
      `${projectId}.appspot.com`,
    messagingSenderId:
      process.env.FIREBASE_MESSAGING_SENDER_ID ||
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      '',
    appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || '',
  };
}

let firestoreInstance: Firestore | null = null;

export function getDb(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    firestoreInstance = getFirestore(app);
    return firestoreInstance;
  } catch (err) {
    console.error('Failed to initialize Firebase Firestore:', err);
    return null;
  }
}
