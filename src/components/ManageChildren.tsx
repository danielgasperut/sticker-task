import { useState } from 'react';
import type { Child } from '../types';
import { getChildren, saveChild, deleteChild } from '../store';

const AVATARS = ['👦', '👧', '🧒', '👶', '🧒🏻', '👦🏽', '👧🏾', '👦🏿', '👧🏼', '🧒🏽', '🧑', '👩', '🐻', '🐰', '🦊', '🐱', '🐶', '🦄', '🐼', '🐸'];

interface Props {
  onBack: () => void;
  onRefresh: () => void;
}

export function ManageChildren({ onBack, onRefresh }: Props) {
  const [children, setChildren] = useState(getChildren);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const reload = () => setChildren(getChildren());

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editingId) {
      saveChild({ id: editingId, name: trimmed, avatar });
      setEditingId(null);
    } else {
      saveChild({ id: crypto.randomUUID(), name: trimmed, avatar });
    }
    setName('');
    setAvatar(AVATARS[0]);
    reload();
    onRefresh();
  };

  const handleEdit = (child: Child) => {
    setEditingId(child.id);
    setName(child.name);
    setAvatar(child.avatar);
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteChild(id);
      setConfirmDelete(null);
      reload();
      onRefresh();
    } else {
      setConfirmDelete(id);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-lg">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800 flex-1">Manage Children</h1>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Child's name..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg text-sm transition"
          >
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setName(''); setAvatar(AVATARS[0]); }}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => setAvatar(a)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition ${
                avatar === a ? 'bg-primary/10 ring-2 ring-primary scale-110' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No children added yet</div>
      ) : (
        <div className="space-y-2">
          {children.map((child) => (
            <div key={child.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
              <span className="text-3xl">{child.avatar}</span>
              <span className="flex-1 font-medium text-gray-800">{child.name}</span>
              <button
                onClick={() => handleEdit(child)}
                className="text-gray-400 hover:text-primary text-sm"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(child.id)}
                className="text-gray-400 hover:text-red-500 text-sm"
              >
                {confirmDelete === child.id ? 'Confirm?' : '🗑️'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
