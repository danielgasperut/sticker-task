const ACCOUNTS_KEY = 'sticker-task:accounts';
const SESSION_KEY = 'sticker-task:session';

export interface Account {
  id: string;
  familyName: string;
  username: string;
  salt: string;
  hash: string;
  parentPin: string;
  createdAt: number;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(bits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function register(
  familyName: string,
  username: string,
  password: string,
  parentPin: string,
): Promise<{ ok: true; account: Account } | { ok: false; error: string }> {
  const accounts = getAccounts();
  if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, error: 'Username already taken' };
  }
  if (password.length < 4) {
    return { ok: false, error: 'Password must be at least 4 characters' };
  }
  if (!/^\d{4,}$/.test(parentPin)) {
    return { ok: false, error: 'Parent PIN must be at least 4 digits' };
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveKey(password, salt);

  const account: Account = {
    id: crypto.randomUUID(),
    familyName,
    username,
    salt: bytesToHex(salt),
    hash,
    parentPin,
    createdAt: Date.now(),
  };

  accounts.push(account);
  saveAccounts(accounts);
  return { ok: true, account };
}

export async function login(
  username: string,
  password: string,
): Promise<{ ok: true; account: Account } | { ok: false; error: string }> {
  const accounts = getAccounts();
  const account = accounts.find(
    (a) => a.username.toLowerCase() === username.toLowerCase(),
  );
  if (!account) {
    return { ok: false, error: 'Account not found' };
  }

  const salt = hexToBytes(account.salt);
  const hash = await deriveKey(password, salt);
  if (hash !== account.hash) {
    return { ok: false, error: 'Wrong password' };
  }

  return { ok: true, account };
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setSession(accountId: string) {
  localStorage.setItem(SESSION_KEY, accountId);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAccountById(id: string): Account | undefined {
  return getAccounts().find((a) => a.id === id);
}

export function updateParentPin(accountId: string, newPin: string) {
  const accounts = getAccounts();
  const account = accounts.find((a) => a.id === accountId);
  if (account) {
    account.parentPin = newPin;
    saveAccounts(accounts);
  }
}

export function updateFamilyName(accountId: string, newName: string) {
  const accounts = getAccounts();
  const account = accounts.find((a) => a.id === accountId);
  if (account) {
    account.familyName = newName;
    saveAccounts(accounts);
  }
}
