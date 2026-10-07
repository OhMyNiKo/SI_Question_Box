import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, setLogLevel } from 'firebase/firestore';

try {
  setLogLevel('error');
} catch {
  // ignore
}

let firestoreInstance: Firestore | null = null;

export function getDb(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('[Server Firebase] firebase-applet-config.json not found on disk');
      return null;
    }

    const raw = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(raw);

    const app: FirebaseApp = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    firestoreInstance = getFirestore(app, config.firestoreDatabaseId);
    console.log(
      `[Server Firebase] Initialized Firestore successfully with database ID: ${config.firestoreDatabaseId}`
    );
    return firestoreInstance;
  } catch (err) {
    console.error('[Server Firebase] Failed to initialize Firestore:', err);
    return null;
  }
}
