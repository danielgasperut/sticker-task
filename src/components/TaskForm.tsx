import { useState } from 'react';
import type { Task } from '../types';
import { saveTask, getCategories, getChildren } from '../store';

interface Props {
  task: Task | null;
  onSave: () => void;
  onBack: () => void;
}

export function TaskForm({ task, onSave, onBack }: Props) {
  const categories = getCategories();
  const children = getChildren();
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [category, setCategory] = useState(task?.category ?? categories[0]?.name ?? 'Other');
  const [cost, setCost] = useState(task?.cost ?? 3);
  const [childId, setChildId] = useState(task?.childId ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    saveTask({
      id: task?.id ?? crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      category,
      cost,
      createdAt: task?.createdAt ?? Date.now(),
      ...(childId ? { childId } : {}),
    });
    onSave();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-lg">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {task ? 'Edit Task' : 'New Task'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Clean my room"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What to do</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the work..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setCategory(cat.name)}
                className={`p-2 rounded-xl text-center text-sm transition ${
                  category === cat.name
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="text-lg">{cat.icon}</div>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sticker Cost: <span className="text-primary font-bold">{cost}</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={10}
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="flex-1 accent-primary"
            />
            <div className="flex gap-0.5">
              {Array.from({ length: cost }).map((_, i) => (
                <span key={i} className="text-lg">⭐</span>
              ))}
            </div>
          </div>
        </div>

        {children.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Child</label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setChildId('')}
                className={`px-3 py-2 rounded-xl text-sm transition ${
                  !childId ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Everyone
              </button>
              {children.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChildId(c.id)}
                  className={`px-3 py-2 rounded-xl text-sm transition ${
                    childId === c.id ? 'bg-primary text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {c.avatar} {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition shadow-sm"
        >
          {task ? 'Save Changes' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}
