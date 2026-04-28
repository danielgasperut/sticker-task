import { describe, it, expect } from 'vitest';
import { register, login, getSession, setSession, clearSession, getAccountById } from '../auth';

describe('Auth', () => {
  describe('registration', () => {
    it('creates account with hashed password', async () => {
      const result = await register('Smith Family', 'smiths', 'pass1234', '4321');
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.account.familyName).toBe('Smith Family');
      expect(result.account.username).toBe('smiths');
      expect(result.account.parentPin).toBe('4321');
      expect(result.account.hash).not.toBe('pass1234');
      expect(result.account.hash.length).toBe(64);
      expect(result.account.salt.length).toBe(32);
    });

    it('rejects duplicate username (case-insensitive)', async () => {
      await register('Family A', 'testuser', 'pass1234', '1111');
      const result = await register('Family B', 'TestUser', 'otherpass', '2222');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/already taken/i);
    });

    it('rejects short password', async () => {
      const result = await register('Family', 'user1', 'abc', '4321');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/at least 4/);
    });

    it('rejects non-numeric PIN', async () => {
      const result = await register('Family', 'user2', 'pass1234', 'abcd');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/digits/);
    });

    it('rejects short PIN', async () => {
      const result = await register('Family', 'user3', 'pass1234', '12');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/at least 4/);
    });
  });

  describe('login', () => {
    it('authenticates with correct password', async () => {
      await register('Login Test', 'loginuser', 'mypassword', '9999');
      const result = await login('loginuser', 'mypassword');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.account.familyName).toBe('Login Test');
    });

    it('rejects wrong password', async () => {
      await register('Family', 'wrongpw', 'correct', '1234');
      const result = await login('wrongpw', 'incorrect');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/wrong password/i);
    });

    it('rejects unknown username', async () => {
      const result = await login('nonexistent', 'anything');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/not found/i);
    });

    it('login is case-insensitive on username', async () => {
      await register('Case Test', 'CaseUser', 'pass1234', '5555');
      const result = await login('caseuser', 'pass1234');
      expect(result.ok).toBe(true);
    });
  });

  describe('session', () => {
    it('session persists and retrieves', async () => {
      const reg = await register('Session Test', 'sessuser', 'pass1234', '7777');
      if (!reg.ok) throw new Error('setup failed');
      setSession(reg.account.id);
      expect(getSession()).toBe(reg.account.id);
    });

    it('clearSession removes session', () => {
      setSession('some-id');
      clearSession();
      expect(getSession()).toBeNull();
    });

    it('getAccountById returns correct account', async () => {
      const reg = await register('Find Me', 'findme', 'pass1234', '8888');
      if (!reg.ok) throw new Error('setup failed');
      const found = getAccountById(reg.account.id);
      expect(found).toBeDefined();
      expect(found!.familyName).toBe('Find Me');
    });

    it('getAccountById returns undefined for unknown id', () => {
      expect(getAccountById('nonexistent-id')).toBeUndefined();
    });
  });

  describe('password security', () => {
    it('same password produces different hashes (different salt)', async () => {
      const r1 = await register('Family 1', 'hashtest1', 'samepass', '1111');
      const r2 = await register('Family 2', 'hashtest2', 'samepass', '2222');
      expect(r1.ok && r2.ok).toBe(true);
      if (r1.ok && r2.ok) {
        expect(r1.account.hash).not.toBe(r2.account.hash);
        expect(r1.account.salt).not.toBe(r2.account.salt);
      }
    });

    it('password is not stored in plaintext anywhere in account', async () => {
      const result = await register('Plaintext Check', 'ptcheck', 'secretpass', '4444');
      if (!result.ok) throw new Error('setup failed');
      const json = JSON.stringify(result.account);
      expect(json).not.toContain('secretpass');
    });
  });
});
