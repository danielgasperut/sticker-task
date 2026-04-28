import { useState } from 'react';
import { getCategories, addCategory, removeCategory } from '../store';

const ICON_OPTIONS = [
  '📌', '🧹', '📚', '⭐', '🤝', '🏃', '🎮', '🎨', '🧺', '📖',
  '🎵', '💝', '🧘', '🏠', '🐾', '🌱', '🔧', '💻', '🎯', '🧪',
  '🎭', '🏆', '💡', '🎓', '🧠', '🙏', '🌍', '🎪', '🏕️', '🧑‍🍳',
  '✈️', '🎸', '📝', '🔬', '🧩', '🤖', '🦸', '🌈', '💪', '🎂',
];

interface Props {
  onBack: () => void;
  onRefresh: () => void;
}

export function ManageCategories({ onBack, onRefresh }: Props) {
  const [categories, setCategories] = useState(getCategories());
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('📌');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addCategory({ name: newName.trim(), icon: newIcon });
    setCategories(getCategories());
    setNewName('');
    setNewIcon('📌');
    onRefresh();
  };

  const handleRemove = (name: string) => {
    if (confirmDelete === name) {
      removeCategory(name);
      setCategories(getCategories());
      setConfirmDelete(null);
      onRefresh();
    } else {
      setConfirmDelete(name);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-lg">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Manage Categories</h1>
      </div>

      <form onSubmit={handleAdd} className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-2">Add New Category</div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-12 h-12 bg-gray-50 rounded-xl text-2xl flex items-center justify-center hover:bg-gray-100 transition border border-gray-200"
            >
              {newIcon}
            </button>
            {showIconPicker && (
              <div className="absolute top-14 left-0 z-10 bg-white rounded-xl shadow-lg border border-gray-100 p-2 grid grid-cols-8 gap-1 w-72">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => { setNewIcon(icon); setShowIconPicker(false); }}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-lg transition"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button
            type="submit"
            className="bg-success hover:bg-green-600 text-white font-medium py-2 px-4 rounded-xl transition"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.name} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
            <span className="text-2xl w-10 text-center">{cat.icon}</span>
            <span className="flex-1 font-medium text-gray-800">{cat.name}</span>
            <button
              onClick={() => handleRemove(cat.name)}
              className={`py-1.5 px-3 rounded-lg text-sm transition ${
                confirmDelete === cat.name
                  ? 'bg-danger text-white'
                  : 'bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-danger'
              }`}
            >
              {confirmDelete === cat.name ? 'Confirm?' : '🗑️'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
