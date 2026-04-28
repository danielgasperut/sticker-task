import { useState } from 'react';
import type { Role, Child } from '../types';
import { getChildren } from '../store';

const PARENT_PASSWORD = '4321';

interface Props {
  role: Role;
  activeChild: Child | null;
  onSwitch: (role: Role, childId?: string) => void;
}

export function RoleSwitcher({ role, activeChild, onSwitch }: Props) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showChildPicker, setShowChildPicker] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const children = getChildren();

  const handleParentClick = () => {
    if (role === 'parent') return;
    setShowPrompt(true);
    setPin('');
    setError(false);
  };

  const handleChildClick = () => {
    if (children.length === 0) {
      onSwitch('child');
    } else if (children.length === 1) {
      onSwitch('child', children[0].id);
    } else {
      setShowChildPicker(true);
    }
  };

  const handlePickChild = (childId: string) => {
    setShowChildPicker(false);
    onSwitch('child', childId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === PARENT_PASSWORD) {
      setShowPrompt(false);
      setPin('');
      setError(false);
      onSwitch('parent');
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleCancel = () => {
    setShowPrompt(false);
    setPin('');
    setError(false);
  };

  return (
    <>
      <div className="flex bg-gray-100 rounded-full p-1 gap-1">
        <button
          onClick={handleParentClick}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            role === 'parent'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          👨‍👩‍👧 Parent
        </button>
        <button
          onClick={handleChildClick}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            role === 'child'
              ? 'bg-pink text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {activeChild ? `${activeChild.avatar} ${activeChild.name}` : '🧒 Child'}
        </button>
      </div>

      {showChildPicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-72 space-y-4">
            <div className="text-center">
              <div className="text-3xl mb-1">🧒</div>
              <div className="font-semibold text-gray-800">Who's playing?</div>
            </div>
            <div className="space-y-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handlePickChild(child.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${
                    activeChild?.id === child.id
                      ? 'bg-pink/10 border-2 border-pink'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl">{child.avatar}</span>
                  <span className="font-medium text-gray-800">{child.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowChildPicker(false)}
              className="w-full py-2 rounded-xl text-gray-500 bg-gray-100 hover:bg-gray-200 transition text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 shadow-xl w-72 space-y-4"
          >
            <div className="text-center">
              <div className="text-3xl mb-1">🔒</div>
              <div className="font-semibold text-gray-800">Parent Mode</div>
              <div className="text-sm text-gray-500">Enter PIN to continue</div>
            </div>

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setError(false);
              }}
              autoFocus
              placeholder="••••"
              className={`w-full text-center text-2xl tracking-[0.5em] border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${
                error
                  ? 'border-danger focus:ring-danger/30 animate-[shake_0.3s]'
                  : 'border-gray-200 focus:ring-primary/30 focus:border-primary'
              }`}
            />

            {error && (
              <div className="text-danger text-sm text-center">Wrong PIN, try again</div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 rounded-xl text-gray-500 bg-gray-100 hover:bg-gray-200 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-white bg-primary hover:bg-primary-dark transition text-sm font-medium"
              >
                Unlock
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
