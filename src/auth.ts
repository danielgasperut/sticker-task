import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface FamilyProfile {
  familyName: string;
  parentPin: string;
  createdAt: number;
}

export async function register(
  familyName: string,
  email: string,
  password: string,
  parentPin: string,
): Promise<{ ok: true; user: User; profile: FamilyProfile } | { ok: false; error: string }> {
  if (!familyName.trim()) return { ok: false, error: 'Family name is required' };
  if (!email.trim() || !email.includes('@')) return { ok: false, error: 'Valid email is required' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters' };
  if (!/^\d{4,}$/.test(parentPin)) return { ok: false, error: 'Parent PIN must be at least 4 digits' };

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const profile: FamilyProfile = { familyName: familyName.trim(), parentPin, createdAt: Date.now() };
    await setDoc(doc(db, 'families', cred.user.uid), profile);
    return { ok: true, user: cred.user, profile };
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/email-already-in-use') return { ok: false, error: 'Email already in use' };
    if (code === 'auth/invalid-email') return { ok: false, error: 'Invalid email address' };
    if (code === 'auth/weak-password') return { ok: false, error: 'Password too weak (6+ characters)' };
    return { ok: false, error: (e as Error).message || 'Registration failed' };
  }
}

export async function login(
  email: string,
  password: string,
): Promise<{ ok: true; user: User; profile: FamilyProfile } | { ok: false; error: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const profile = await getFamilyProfile(cred.user.uid);
    if (!profile) return { ok: false, error: 'Family profile not found' };
    return { ok: true, user: cred.user, profile };
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') return { ok: false, error: 'Invalid email or password' };
    if (code === 'auth/wrong-password') return { ok: false, error: 'Wrong password' };
    return { ok: false, error: (e as Error).message || 'Login failed' };
  }
}

export async function resetPassword(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    return { ok: true };
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/user-not-found') return { ok: false, error: 'No account with that email' };
    if (code === 'auth/invalid-email') return { ok: false, error: 'Invalid email address' };
    return { ok: false, error: (e as Error).message || 'Reset failed' };
  }
}

export async function logout() {
  await signOut(auth);
}

export async function getFamilyProfile(uid: string): Promise<FamilyProfile | null> {
  const snap = await getDoc(doc(db, 'families', uid));
  return snap.exists() ? (snap.data() as FamilyProfile) : null;
}

export async function updateFamilyProfile(uid: string, updates: Partial<FamilyProfile>) {
  await setDoc(doc(db, 'families', uid), updates, { merge: true });
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
