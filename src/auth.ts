import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface FamilyProfile {
  familyName: string;
  parentPin: string;
  createdAt: number;
}

function emailFromUsername(username: string): string {
  return `${username.toLowerCase()}@stickertask.local`;
}

export async function register(
  familyName: string,
  username: string,
  password: string,
  parentPin: string,
): Promise<{ ok: true; user: User; profile: FamilyProfile } | { ok: false; error: string }> {
  if (!familyName.trim()) return { ok: false, error: 'Family name is required' };
  if (!username.trim()) return { ok: false, error: 'Username is required' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters' };
  if (!/^\d{4,}$/.test(parentPin)) return { ok: false, error: 'Parent PIN must be at least 4 digits' };

  try {
    const email = emailFromUsername(username);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profile: FamilyProfile = { familyName: familyName.trim(), parentPin, createdAt: Date.now() };
    await setDoc(doc(db, 'families', cred.user.uid), profile);
    return { ok: true, user: cred.user, profile };
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/email-already-in-use') return { ok: false, error: 'Username already taken' };
    if (code === 'auth/weak-password') return { ok: false, error: 'Password too weak (6+ characters)' };
    return { ok: false, error: (e as Error).message || 'Registration failed' };
  }
}

export async function login(
  username: string,
  password: string,
): Promise<{ ok: true; user: User; profile: FamilyProfile } | { ok: false; error: string }> {
  try {
    const email = emailFromUsername(username);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getFamilyProfile(cred.user.uid);
    if (!profile) return { ok: false, error: 'Family profile not found' };
    return { ok: true, user: cred.user, profile };
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') return { ok: false, error: 'Invalid username or password' };
    if (code === 'auth/wrong-password') return { ok: false, error: 'Wrong password' };
    return { ok: false, error: (e as Error).message || 'Login failed' };
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
