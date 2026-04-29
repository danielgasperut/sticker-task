import { describe, it, expect, vi } from 'vitest';
import { register, login, resetPassword } from '../auth';

const mockCreateUser = vi.fn();
const mockSignIn = vi.fn();
const mockResetPassword = vi.fn();

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUser(...args),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignIn(...args),
  sendPasswordResetEmail: (...args: unknown[]) => mockResetPassword(...args),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({ familyName: 'Test Family', parentPin: '4321', createdAt: 1000 }),
  })),
  setDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn(() => () => {}),
}));

describe('Auth', () => {
  describe('registration validation', () => {
    it('rejects empty family name', async () => {
      const result = await register('', 'user@test.com', 'password', '4321');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/family name/i);
    });

    it('rejects invalid email', async () => {
      const result = await register('Family', 'notanemail', 'password', '4321');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/email/i);
    });

    it('rejects short password', async () => {
      const result = await register('Family', 'user@test.com', 'abc', '4321');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/6 characters/);
    });

    it('rejects non-numeric PIN', async () => {
      const result = await register('Family', 'user@test.com', 'password', 'abcd');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/digits/);
    });

    it('rejects short PIN', async () => {
      const result = await register('Family', 'user@test.com', 'password', '12');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/at least 4/);
    });
  });

  describe('registration with Firebase', () => {
    it('creates account and stores profile', async () => {
      mockCreateUser.mockResolvedValueOnce({ user: { uid: 'uid-1' } });
      const result = await register('Smith Family', 'smiths@test.com', 'pass1234', '4321');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.user.uid).toBe('uid-1');
        expect(result.profile.familyName).toBe('Smith Family');
        expect(result.profile.parentPin).toBe('4321');
      }
    });

    it('handles duplicate email from Firebase', async () => {
      mockCreateUser.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
      const result = await register('Family', 'taken@test.com', 'pass1234', '4321');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/already in use/i);
    });

    it('handles weak password from Firebase', async () => {
      mockCreateUser.mockRejectedValueOnce({ code: 'auth/weak-password' });
      const result = await register('Family', 'user@test.com', 'pass1234', '4321');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/weak/i);
    });
  });

  describe('login with Firebase', () => {
    it('authenticates and returns profile', async () => {
      mockSignIn.mockResolvedValueOnce({ user: { uid: 'uid-2' } });
      const result = await login('test@example.com', 'password');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.user.uid).toBe('uid-2');
        expect(result.profile.familyName).toBe('Test Family');
      }
    });

    it('rejects invalid credentials', async () => {
      mockSignIn.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
      const result = await login('wrong@test.com', 'wrong');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/invalid/i);
    });

    it('lowercases and trims email', async () => {
      mockSignIn.mockResolvedValueOnce({ user: { uid: 'uid-3' } });
      await login('  MyUser@Test.COM  ', 'pass');
      expect(mockSignIn).toHaveBeenCalledWith(
        expect.anything(),
        'myuser@test.com',
        'pass',
      );
    });
  });

  describe('password reset', () => {
    it('sends reset email successfully', async () => {
      mockResetPassword.mockResolvedValueOnce(undefined);
      const result = await resetPassword('user@test.com');
      expect(result.ok).toBe(true);
    });

    it('handles user not found', async () => {
      mockResetPassword.mockRejectedValueOnce({ code: 'auth/user-not-found' });
      const result = await resetPassword('nobody@test.com');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/no account/i);
    });

    it('handles invalid email', async () => {
      mockResetPassword.mockRejectedValueOnce({ code: 'auth/invalid-email' });
      const result = await resetPassword('bad-email');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toMatch(/invalid email/i);
    });
  });
});
