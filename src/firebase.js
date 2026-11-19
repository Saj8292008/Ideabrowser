import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Web config comes from Vite env vars (see .env.example). These values are
// public identifiers, not secrets — access is enforced by firestore.rules.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const emulator = import.meta.env.VITE_FIRESTORE_EMULATOR; // e.g. "127.0.0.1:8080"

export const firebaseConfigured = Boolean(config.projectId && (config.apiKey || emulator));

let db = null;
export function getDb() {
  if (!firebaseConfigured) return null;
  if (!db) {
    const app = initializeApp(config);
    db = import.meta.env.VITE_FIRESTORE_DATABASE_ID
      ? getFirestore(app, import.meta.env.VITE_FIRESTORE_DATABASE_ID)
      : getFirestore(app);
    if (emulator) {
      const [host, port] = emulator.split(':');
      connectFirestoreEmulator(db, host, Number(port));
    }
  }
  return db;
}
