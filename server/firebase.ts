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

const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyBkB29DWCvLthsekVDUv_B2Bogp7zzBKAw",
  authDomain: "student-inclusion.firebaseapp.com",
  projectId: "student-inclusion",
  storageBucket: "student-inclusion.firebasestorage.app",
  messagingSenderId: "900785171305",
  appId: "1:900785171305:web:f756b06b66a4a89ce7abf8",
};

export function getFirebaseConfig(): FirebaseConfig | null {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    DEFAULT_FIREBASE_CONFIG.projectId;

  const apiKey =
    process.env.FIREBASE_API_KEY ||
    process.env.VITE_FIREBASE_API_KEY ||
    DEFAULT_FIREBASE_CONFIG.apiKey;

  if (!projectId || !apiKey) {
    return null;
  }

  return {
    apiKey,
    authDomain:
      process.env.FIREBASE_AUTH_DOMAIN ||
      process.env.VITE_FIREBASE_AUTH_DOMAIN ||
      DEFAULT_FIREBASE_CONFIG.authDomain ||
      `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.VITE_FIREBASE_STORAGE_BUCKET ||
      DEFAULT_FIREBASE_CONFIG.storageBucket ||
      `${projectId}.appspot.com`,
    messagingSenderId:
      process.env.FIREBASE_MESSAGING_SENDER_ID ||
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      DEFAULT_FIREBASE_CONFIG.messagingSenderId ||
      '',
    appId:
      process.env.FIREBASE_APP_ID ||
      process.env.VITE_FIREBASE_APP_ID ||
      DEFAULT_FIREBASE_CONFIG.appId ||
      '',
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
