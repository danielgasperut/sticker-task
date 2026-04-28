import type { Task, AwardedSticker, Screen } from '../types';
import { getStickersForTask, isTaskComplete, deleteTask, resetTask, getCategories, getCategoryIcon } from '../store';
import { useState } from 'react';

interface Props {
  tasks: Task[];
  stickers: AwardedSticker[];
  onNavigate: (screen: Screen, taskId?: string) => void;
  onBack: () => void;
  onRefresh: () => void;
}

export function ManageTasks({ tasks, onNavigate, onBack, onRefresh }: Props) {
  const categories = getCategories();
  const [filter, setFilter] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<string | null>(null);

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.category === filter);

  const handleDelete = (taskId: string) => {
    if (confirmDelete === taskId) {
      deleteTask(taskId);
      setConfirmDelete(null);
      onRefresh();
    } else {
      setConfirmDelete(taskId);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-lg">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex-1">Manage Tasks</h1>
        <button
          onClick={() => onNavigate('create-task')}
          className="bg-success hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition"
        >
          ➕ New
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setFilter(cat.name)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
              filter === cat.name
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 bg-white rounded-2xl shadow-sm">
          <div className="text-4xl mb-2">📭</div>
          <div className="text-gray-500">No tasks yet</div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((task) => {
          const earned = getStickersForTask(task.id).length;
          const complete = isTaskComplete(task);
          return (
            <div
              key={task.id}
              className={`bg-white rounded-xl p-4 shadow-sm ${complete ? 'ring-2 ring-success' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">
                    {task.title}
                    {complete && <span className="ml-2 text-success text-sm">✅ Complete</span>}
                  </div>
                  <div className="text-sm text-gray-500">
                    {earned}/{task.cost} stickers · {task.category}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {!complete && (
                    <button
                      onClick={() => onNavigate('award-sticker', task.id)}
                      className="bg-secondary hover:bg-secondary-dark text-white py-1.5 px-3 rounded-lg text-sm font-medium transition"
                    >
                      ⭐ Award
                    </button>
                  )}
                  {complete && (
                    <button
                      onClick={() => {
                        if (confirmReset === task.id) {
                          resetTask(task.id);
                          setConfirmReset(null);
                          onRefresh();
                        } else {
                          setConfirmReset(task.id);
                        }
                      }}
                      className={`py-1.5 px-3 rounded-lg text-sm font-medium transition ${
                        confirmReset === task.id
                          ? 'bg-secondary text-white'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-600'
                      }`}
                    >
                      {confirmReset === task.id ? 'Confirm?' : '🔄 Reset'}
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('edit-task', task.id)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-1.5 px-3 rounded-lg text-sm transition"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className={`py-1.5 px-3 rounded-lg text-sm transition ${
                      confirmDelete === task.id
                        ? 'bg-danger text-white'
                        : 'bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-danger'
                    }`}
                  >
                    {confirmDelete === task.id ? 'Confirm?' : '🗑️'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
