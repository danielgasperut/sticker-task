import { useState } from 'react';
import type { Account } from '../auth';
import { login, register } from '../auth';

interface Props {
  onLogin: (account: Account) => void;
}

export function AuthScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [parentPin, setParentPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(username, password);
        if (result.ok) {
          onLogin(result.account);
        } else {
          setError(result.error);
        }
      } else {
        if (!familyName.trim()) {
          setError('Family name is required');
          setLoading(false);
          return;
        }
        const result = await register(familyName.trim(), username, password, parentPin);
        if (result.ok) {
          onLogin(result.account);
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
          <div className="flex bg-gray-100 rounded-full p-1 gap-1 mb-2">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                mode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                mode === 'register' ? 'bg-primary text-white shadow-sm' : 'text-gray-500'
              }`}
            >
              New Family
            </button>
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              autoComplete="username"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Family Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
