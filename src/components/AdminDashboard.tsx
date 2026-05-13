import { useState, useEffect } from 'react';
import type { AdminFamilyData } from '../auth';
import { getAllFamilies } from '../auth';
import type { Task, AwardedSticker, Child } from '../types';

interface Props {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: Props) {
  const [families, setFamilies] = useState<AdminFamilyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedUid, setExpandedUid] = useState<string | null>(null);

  useEffect(() => {
    getAllFamilies()
      .then(setFamilies)
      .catch((e) => setError(e.message || 'Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl animate-bounce mb-3">🔧</div>
        <div className="text-gray-400">Loading all families...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-lg">← Back</button>
          <h1 className="text-2xl font-bold text-gray-800">Admin</h1>
        </div>
        <div className="text-danger text-center bg-red-50 rounded-xl p-4">{error}</div>
      </div>
    );
  }

  const totalFamilies = families.length;
  const totalTasks = families.reduce((sum, f) => sum + (f.data?.tasks as Task[] ?? []).length, 0);
  const totalStickers = families.reduce((sum, f) => sum + (f.data?.stickers as AwardedSticker[] ?? []).length, 0);
  const totalChildren = families.reduce((sum, f) => sum + (f.data?.children as Child[] ?? []).length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-lg">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800 flex-1">Admin Dashboard</h1>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {totalFamilies} families
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="Families" value={totalFamilies} color="text-primary" />
        <SummaryCard label="Total Tasks" value={totalTasks} color="text-secondary" />
        <SummaryCard label="Total Stickers" value={totalStickers} color="text-pink" />
        <SummaryCard label="Total Children" value={totalChildren} color="text-success" />
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700 text-lg">All Families</h2>
        {families.map((family) => {
          const tasks = (family.data?.tasks as Task[]) ?? [];
          const stickers = (family.data?.stickers as AwardedSticker[]) ?? [];
          const children = (family.data?.children as Child[]) ?? [];
          const completedTasks = tasks.filter((t) => {
            const taskStickers = stickers.filter((s) => s.taskId === t.id);
            return taskStickers.length >= t.cost;
          });
          const rate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
          const lastActivity = Math.max(
            ...tasks.map((t) => t.createdAt),
            ...stickers.map((s) => s.awardedAt),
            family.profile.createdAt,
          );
          const expanded = expandedUid === family.uid;

          return (
            <div key={family.uid} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedUid(expanded ? null : family.uid)}
                className="w-full p-4 text-left flex items-center gap-3 hover:bg-gray-50 transition"
              >
                <div className="text-2xl">👨‍👩‍👧‍👦</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 truncate">{family.profile.familyName}</div>
                  <div className="text-xs text-gray-400">
                    {tasks.length} tasks · {children.length} children · {stickers.length} stickers
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{rate}%</div>
                  <div className="text-xs text-gray-400">done</div>
                </div>
                <span className="text-gray-300">{expanded ? '▼' : '▶'}</span>
              </button>

              {expanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="font-bold text-primary">{tasks.length}</div>
                      <div className="text-xs text-gray-400">Tasks</div>
                    </div>
                    <div>
                      <div className="font-bold text-success">{completedTasks.length}</div>
                      <div className="text-xs text-gray-400">Completed</div>
                    </div>
                    <div>
                      <div className="font-bold text-pink">{stickers.length}</div>
                      <div className="text-xs text-gray-400">Stickers</div>
                    </div>
                  </div>

                  {children.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Children</div>
                      <div className="flex flex-wrap gap-2">
                        {children.map((child) => (
                          <span key={child.id} className="bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-700">
                            {child.avatar} {child.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {tasks.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Recent Tasks</div>
                      <div className="space-y-1">
                        {tasks
                          .sort((a, b) => b.createdAt - a.createdAt)
                          .slice(0, 5)
                          .map((task) => {
                            const taskStickers = stickers.filter((s) => s.taskId === task.id);
                            const complete = taskStickers.length >= task.cost;
                            return (
                              <div key={task.id} className="flex items-center gap-2 text-sm">
                                <span className={complete ? 'text-success' : 'text-gray-300'}>
                                  {complete ? '✓' : '○'}
                                </span>
                                <span className="text-gray-700 truncate flex-1">{task.title}</span>
                                <span className="text-xs text-gray-400">
                                  {taskStickers.length}/{task.cost}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 pt-1 border-t border-gray-50">
                    Created {new Date(family.profile.createdAt).toLocaleDateString()} · Last activity{' '}
                    {new Date(lastActivity).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
