import type { Task, AwardedSticker, Screen, Child } from '../types';
import { isTaskComplete, getStickersForTask, getCategoryIcon, getStickerAtSlot, getEnabledSlots } from '../store';
import { getStickerById } from '../stickers';

interface Props {
  tasks: Task[];
  stickers: AwardedSticker[];
  activeChild: Child | null;
  onNavigate: (screen: Screen, taskId?: string) => void;
}

export function ChildHome({ tasks, activeChild, onNavigate }: Props) {
  const activeTasks = tasks.filter((t) => !isTaskComplete(t));
  const completedTasks = tasks.filter((t) => isTaskComplete(t));

  return (
    <div className="space-y-6">
      <div className="text-center">
        {activeChild ? (
          <>
            <div className="text-4xl mb-1">{activeChild.avatar}</div>
            <h1 className="text-3xl font-bold text-gray-800">{activeChild.name}'s Stickers!</h1>
          </>
        ) : (
          <h1 className="text-3xl font-bold text-gray-800">My Stickers!</h1>
        )}
        <p className="text-gray-500 mt-1">Complete tasks to earn stickers</p>
      </div>

      {completedTasks.length > 0 && (
        <button
          onClick={() => onNavigate('trophy-room')}
          className="w-full bg-gradient-to-r from-secondary to-yellow-400 text-white font-bold py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition text-lg"
        >
          🏆 Trophy Room ({completedTasks.length} completed!)
        </button>
      )}

      {activeTasks.length === 0 && completedTasks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
          <div className="text-5xl mb-3">📭</div>
          <div className="text-gray-500">No tasks yet! Ask your parent to create some.</div>
        </div>
      )}

      {activeTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">My Tasks</h2>
          <div className="space-y-3">
            {activeTasks.map((task) => {
              const awarded = getStickersForTask(task.id);
              const remaining = task.cost - awarded.length;
              const enabledSlots = getEnabledSlots(task.id);
              const hasUnlocked = Array.from({ length: task.cost }).some(
                (_, i) => !getStickerAtSlot(task.id, i) && (enabledSlots[i] ?? false)
              );
              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getCategoryIcon(task.category)}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{task.title}</div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {Array.from({ length: task.cost }).map((_, i) => {
                      const stickerAtSlot = getStickerAtSlot(task.id, i);
                      const stickerDef = stickerAtSlot
                        ? getStickerById(stickerAtSlot.stickerId)
                        : null;
                      const enabled = enabledSlots[i] ?? false;
                      return (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                            stickerDef
                              ? 'bg-yellow-50 border-2 border-yellow-300'
                              : enabled
                                ? 'bg-green-50 border-2 border-dashed border-green-300'
                                : 'bg-gray-50 border-2 border-dashed border-gray-200'
                          }`}
                        >
                          {stickerDef ? stickerDef.emoji : enabled ? '✨' : '🔒'}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {remaining} more sticker{remaining !== 1 ? 's' : ''} needed
                    </span>
                    {hasUnlocked ? (
                      <button
                        onClick={() => onNavigate('pick-sticker', task.id)}
                        className="bg-pink hover:bg-pink/80 text-white font-medium py-2 px-4 rounded-lg text-sm transition"
                      >
                        Pick a Sticker ✨
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Ask parent to unlock slots</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
