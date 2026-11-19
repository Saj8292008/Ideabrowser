// Firebase is loaded lazily (on first submit) to keep the page fast.
const firebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  (import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIRESTORE_EMULATOR)
);

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Store a lead in Firestore `leads`.
 * Shape: { email, createdAt (server timestamp), source, tier }
 * Returns { ok: true } or { ok: false, error }.
 * A filled honeypot is silently dropped but reported as success.
 */
export async function saveLead({ email, source, tier = null, honeypot = '' }) {
  if (honeypot) return { ok: true, dropped: true };

  const clean = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(clean) || clean.length > 254) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (!firebaseConfigured) {
    console.error('[PodSweep] Firebase is not configured — lead not stored.');
    return { ok: false, error: 'Signups are temporarily unavailable. Please try again shortly.' };
  }
  try {
    const [{ collection, addDoc, serverTimestamp }, { getDb }] = await Promise.all([
      import('firebase/firestore'),
      import('./firebase.js'),
    ]);
    await addDoc(collection(getDb(), 'leads'), {
      email: clean,
      createdAt: serverTimestamp(),
      source,
      tier: tier || null,
    });
    return { ok: true };
  } catch (err) {
    console.error('[PodSweep] Failed to store lead', err);
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}
