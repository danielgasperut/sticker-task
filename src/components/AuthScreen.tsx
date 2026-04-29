import { useState } from 'react';
import type { User } from 'firebase/auth';
import type { FamilyProfile } from '../auth';
import { login, register, resetPassword } from '../auth';
import { setStoreAccount, loadInitialData } from '../store';

interface Props {
  onLogin: (user: User, profile: FamilyProfile) => void;
}

export function AuthScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [parentPin, setParentPin] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'reset') {
        const result = await resetPassword(email);
        if (result.ok) {
          setMessage('Password reset email sent! Check your inbox.');
        } else {
          setError(result.error);
        }
        return;
      }

      if (mode === 'login') {
        const result = await login(email, password);
        if (result.ok) {
          setStoreAccount(result.user.uid);
          await loadInitialData();
          onLogin(result.user, result.profile);
        } else {
          setError(result.error);
        }
      } else {
        const result = await register(familyName.trim(), email, password, parentPin);
        if (result.ok) {
          setStoreAccount(result.user.uid);
          await loadInitialData();
          onLogin(result.user, result.profile);
        } else {
          setError(result.error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-sky-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⭐</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink text-transparent bg-clip-text">
            StickerTask
          </h1>
          <p className="text-gray-500 mt-1">Family task tracker & reward system</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
          {mode !== 'reset' && (
            <div className="flex bg-gray-100 rounded-full p-1 gap-1 mb-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  mode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-gray-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  mode === 'register' ? 'bg-primary text-white shadow-sm' : 'text-gray-500'
                }`}
              >
                New Family
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="text-center mb-2">
              <div className="text-3xl mb-1">🔑</div>
              <div className="font-semibold text-gray-800">Reset Password</div>
              <div className="text-sm text-gray-500">We'll send a reset link to your email</div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. The Smiths"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (6+ characters)"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={parentPin}
                onChange={(e) => setParentPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4+ digit PIN for parent mode"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <p className="text-xs text-gray-400 mt-1">Children will need this PIN to access parent mode</p>
            </div>
          )}

          {error && (
            <div className="text-danger text-sm text-center bg-red-50 rounded-lg py-2">{error}</div>
          )}

          {message && (
            <div className="text-success text-sm text-center bg-green-50 rounded-lg py-2">{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                  ? 'Create Family Account'
                  : 'Send Reset Link'}
          </button>

          <div className="text-center">
            {mode === 'reset' ? (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="text-sm text-primary hover:text-primary-dark transition"
              >
                Back to Sign In
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
                className="text-sm text-gray-400 hover:text-gray-600 transition"
              >
                Forgot password?
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
