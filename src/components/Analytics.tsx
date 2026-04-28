import type { Task, AwardedSticker } from '../types';
import { isTaskComplete, getChildren } from '../store';
import { getStickerById } from '../stickers';

interface Props {
  tasks: Task[];
  stickers: AwardedSticker[];
  onBack: () => void;
}

export function Analytics({ tasks, stickers, onBack }: Props) {
  const children = getChildren();
  const completedTasks = tasks.filter((t) => isTaskComplete(t));

  const totalTasks = tasks.length;
  const totalCompleted = completedTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const totalStickers = stickers.length;

  const stickerCounts = new Map<string, number>();
  stickers.forEach((s) => {
    stickerCounts.set(s.stickerId, (stickerCounts.get(s.stickerId) || 0) + 1);
  });
  const topStickers = [...stickerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ sticker: getStickerById(id), count }))
    .filter((s) => s.sticker);

  const categoryCounts = new Map<string, { total: number; completed: number }>();
  tasks.forEach((t) => {
    const entry = categoryCounts.get(t.category) || { total: 0, completed: 0 };
    entry.total++;
    if (isTaskComplete(t)) entry.completed++;
    categoryCounts.set(t.category, entry);
  });

  const childStats = children.map((child) => {
    const childTasks = tasks.filter((t) => t.childId === child.id);
    const childCompleted = childTasks.filter((t) => isTaskComplete(t));
    const childStickers = stickers.filter((s) =>
      childTasks.some((t) => t.id === s.taskId)
    );

    const childStickerCounts = new Map<string, number>();
    childStickers.forEach((s) => {
      childStickerCounts.set(s.stickerId, (childStickerCounts.get(s.stickerId) || 0) + 1);
    });
    const favSticker = [...childStickerCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const favStickerDef = favSticker ? getStickerById(favSticker[0]) : null;

    return {
      child,
      totalTasks: childTasks.length,
      completed: childCompleted.length,
      stickers: childStickers.length,
      rate: childTasks.length > 0 ? Math.round((childCompleted.length / childTasks.length) * 100) : 0,
      favSticker: favStickerDef,
      favCount: favSticker?.[1] ?? 0,
    };
  });

  const unassignedTasks = tasks.filter((t) => !t.childId);
  const unassignedCompleted = unassignedTasks.filter((t) => isTaskComplete(t));
  const unassignedStickers = stickers.filter((s) =>
    unassignedTasks.some((t) => t.id === s.taskId)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-lg">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800 flex-1">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Tasks" value={totalTasks} color="text-primary" />
        <StatCard label="Completed" value={totalCompleted} color="text-success" />
        <StatCard label="Completion Rate" value={`${completionRate}%`} color="text-secondary" />
        <StatCard label="Stickers Given" value={totalStickers} color="text-pink" />
      </div>

      {topStickers.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Most Popular Stickers</h2>
          <div className="space-y-2">
            {topStickers.map(({ sticker, count }) => (
              <div key={sticker!.id} className="flex items-center gap-3">
                <span className="text-2xl">{sticker!.emoji}</span>
                <span className="flex-1 text-sm text-gray-700">{sticker!.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, (count / topStickers[0].count) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {[...categoryCounts.entries()].length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">By Category</h2>
          <div className="space-y-2">
            {[...categoryCounts.entries()].map(([cat, data]) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 w-24 truncate">{cat}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{ width: data.total > 0 ? `${(data.completed / data.total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{data.completed}/{data.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {children.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700 text-lg">Per Child</h2>
          {childStats.map(({ child, totalTasks: ct, completed, stickers: cs, rate, favSticker, favCount }) => (
            <div key={child.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{child.avatar}</span>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{child.name}</div>
                  <div className="text-xs text-gray-500">{ct} tasks · {cs} stickers</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{rate}%</div>
                  <div className="text-xs text-gray-400">completion</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-success font-medium">{completed}</span>
                  <span className="text-gray-400">done</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-secondary font-medium">{ct - completed}</span>
                  <span className="text-gray-400">active</span>
                </div>
                {favSticker && (
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-gray-400">fav:</span>
                    <span className="text-lg">{favSticker.emoji}</span>
                    <span className="text-gray-500">{favSticker.name}</span>
                    <span className="text-xs text-gray-400">×{favCount}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {unassignedTasks.length > 0 && children.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-4">
          <h2 className="font-semibold text-gray-600 mb-2">Unassigned Tasks</h2>
          <div className="text-sm text-gray-500">
            {unassignedTasks.length} tasks · {unassignedStickers.length} stickers · {unassignedCompleted.length} completed
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-400">No data yet — create tasks and award stickers to see analytics</div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
