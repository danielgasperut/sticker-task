import { useState } from 'react';
import type { Task, AwardedSticker, Screen } from '../types';
import { isTaskComplete, getStickersForTask, getCategoryIcon, getChildById, clearAllData } from '../store';

interface Props {
  tasks: Task[];
  stickers: AwardedSticker[];
  onNavigate: (screen: Screen, taskId?: string) => void;
}

export function ParentHome({ tasks, stickers, onNavigate, onRefresh }: Props & { onRefresh: () => void }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const activeTasks = tasks.filter((t) => !isTaskComplete(t));
  const completedCount = tasks.filter((t) => isTaskComplete(t)).length;

  const handleClearAll = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    clearAllData();
    setConfirmReset(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Parent Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage tasks and award stickers</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-primary">{tasks.length}</div>
          <div className="text-xs text-gray-500 mt-1">Total Tasks</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-secondary">{stickers.length}</div>
          <div className="text-xs text-gray-500 mt-1">Stickers Given</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-3xl font-bold text-success">{completedCount}</div>
          <div className="text-xs text-gray-500 mt-1">Completed</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onNavigate('manage-tasks')}
          className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm"
        >
          📋 Manage Tasks
        </button>
        <button
          onClick={() => onNavigate('create-task')}
          className="flex-1 bg-success hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm"
        >
          ➕ New Task
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onNavigate('manage-categories')}
          className="flex-1 bg-purple hover:bg-purple/80 text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm"
        >
          🏷️ Categories
        </button>
        <button
          onClick={() => onNavigate('manage-children')}
          className="flex-1 bg-pink hover:bg-pink/80 text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm"
        >
          👧 Children
        </button>
      </div>

      <button
        onClick={() => onNavigate('analytics')}
        className="w-full bg-sky hover:bg-sky/80 text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm"
      >
        📊 Analytics
      </button>

      {activeTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Active Tasks</h2>
          <div className="space-y-2">
            {activeTasks.map((task) => {
              const earned = getStickersForTask(task.id).length;
              return (
                <button
                  key={task.id}
                  onClick={() => onNavigate('award-sticker', task.id)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition text-left flex items-center gap-3"
                >
                  <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">{task.title}</div>
                    <div className="text-sm text-gray-500">
                      {task.category}
                      {task.childId && (() => { const c = getChildById(task.childId); return c ? ` · ${c.avatar} ${c.name}` : ''; })()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary">
                      {earned}/{task.cost} ⭐
                    </div>
                    <div className="w-16 h-2 bg-gray-100 rounded-full mt-1">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, (earned / task.cost) * 100)}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleClearAll}
          className={`w-full py-2 rounded-xl text-sm font-medium transition ${
            confirmReset
              ? 'bg-danger text-white hover:bg-red-600'
              : 'text-gray-400 hover:text-danger hover:bg-red-50'
          }`}
        >
          {confirmReset ? '⚠️ Tap again to permanently delete ALL data' : '🗑️ Reset All Data'}
        </button>
      </div>
    </div>
  );
}
