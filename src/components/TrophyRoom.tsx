import { useState, useEffect } from 'react';
import type { Task, AwardedSticker } from '../types';
import { getStickersForTask, isTaskComplete, getCategoryIcon } from '../store';
import { getStickerById, STICKER_LIBRARY } from '../stickers';

interface Props {
  tasks: Task[];
  stickers: AwardedSticker[];
  onBack: () => void;
}

function TrophyShelf({
  label,
  icon,
  tasks,
  onSelect,
}: {
  label: string;
  icon: string;
  tasks: Task[];
  onSelect: (task: Task) => void;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 px-3 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-semibold text-amber-800/70 uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-amber-300/40" />
      </div>

      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none z-10" />

        <div className="bg-gradient-to-b from-amber-50/80 to-amber-100/60 rounded-xl border border-amber-200/50 px-3 pt-3 pb-1 min-h-[100px]">
          <div className="flex flex-wrap gap-3">
            {tasks.map((task) => (
              <TrophyItem key={task.id} task={task} onSelect={onSelect} />
            ))}
          </div>

          <div className="mt-3 -mx-3 -mb-1 h-3 bg-gradient-to-b from-amber-600/30 via-amber-700/20 to-amber-800/10 rounded-b-xl border-t border-amber-300/50" />
        </div>

        <div className="h-2 mx-2 bg-gradient-to-b from-black/5 to-transparent rounded-b-xl" />
      </div>
    </div>
  );
}

function TrophyItem({ task, onSelect }: { task: Task; onSelect: (task: Task) => void }) {
  const awarded = getStickersForTask(task.id);

  return (
    <div className="group relative">
      <div className="flex flex-col items-center">
        <button
          onClick={() => onSelect(task)}
          className="relative bg-gradient-to-br from-yellow-50 via-white to-amber-50 rounded-xl p-2.5 shadow-md border border-yellow-200/80 hover:shadow-lg hover:scale-110 transition-all cursor-pointer min-w-[80px] active:scale-95"
        >
          <div className="absolute top-1 right-1.5 w-2 h-2 bg-white/80 rounded-full" />
          <div className="absolute top-2.5 right-1 w-1 h-1 bg-white/60 rounded-full" />

          <div className="text-center mb-1">
            <span className="text-2xl drop-shadow-sm">🏆</span>
          </div>

          <div className="flex flex-wrap justify-center gap-1">
            {awarded.map((as) => {
              const sd = getStickerById(as.stickerId);
              return sd ? (
                <div key={as.id} className="w-7 h-7 flex items-center justify-center text-base">
                  {sd.emoji}
                </div>
              ) : null;
            })}
          </div>

          <div className="mt-1.5 bg-gradient-to-b from-amber-600 to-amber-700 rounded px-1.5 py-0.5 text-center">
            <div className="text-[9px] font-bold text-amber-100 truncate max-w-[70px]">
              {task.title}
            </div>
          </div>
        </button>

        <div className="w-12 h-1.5 bg-gradient-to-b from-amber-300 to-amber-400 rounded-b-sm" />
        <div className="w-14 h-1 bg-gradient-to-b from-amber-400 to-amber-500 rounded-b-sm" />
      </div>
    </div>
  );
}

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  angle: number;
  distance: number;
  spin: number;
}

function StickerShower({ taskId }: { taskId: string }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const awarded = getStickersForTask(taskId);
    const emojis = awarded
      .map((a) => getStickerById(a.stickerId)?.emoji)
      .filter(Boolean) as string[];
    const extras = STICKER_LIBRARY.slice(0, 20).map((s) => s.emoji);
    const pool = [...emojis, ...emojis, ...emojis, ...extras, '🏆', '⭐', '🎉', '✨', '🌟', '💫'];

    const items: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      emoji: pool[Math.floor(Math.random() * pool.length)],
      x: 50 + (Math.random() - 0.5) * 10,
      y: 50 + (Math.random() - 0.5) * 10,
      size: 16 + Math.random() * 24,
      delay: Math.random() * 0.6,
      duration: 2 + Math.random() * 2,
      angle: Math.random() * 360,
      distance: 40 + Math.random() * 60,
      spin: (Math.random() - 0.5) * 720,
    }));
    setParticles(items);
  }, [taskId]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        return (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              animation: `stickerBurst ${p.duration}s ${p.delay}s ease-out forwards`,
              '--tx': `${tx}vw`,
              '--ty': `${ty}vh`,
              '--spin': `${p.spin}deg`,
              opacity: 0,
            } as React.CSSProperties}
          >
            {p.emoji}
          </div>
        );
      })}
    </div>
  );
}

function TrophyZoom({ task, onClose }: { task: Task; onClose: () => void }) {
  const awarded = getStickersForTask(task.id);
  const categoryIcon = getCategoryIcon(task.category);

  return (
    <>
    <StickerShower taskId={task.id} />
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm w-full animate-[zoomIn_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight glow behind trophy */}
        <div className="absolute -inset-8 bg-gradient-radial from-amber-200/40 via-amber-100/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 rounded-2xl p-1.5 shadow-2xl">
          <div className="bg-gradient-to-b from-amber-600 to-amber-700 rounded-xl p-1">
            <div className="bg-gradient-to-br from-amber-50 via-orange-50/80 to-yellow-50 rounded-lg p-5 relative overflow-hidden">
              {/* Glass reflections */}
              <div className="absolute top-0 left-4 right-[60%] h-full bg-gradient-to-r from-white/15 to-transparent pointer-events-none" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 z-20 w-8 h-8 bg-amber-800/80 hover:bg-amber-700 text-amber-100 rounded-full flex items-center justify-center text-sm font-bold transition"
              >
                ✕
              </button>

              {/* Big trophy */}
              <div className="text-center mb-4">
                <div className="text-6xl mb-2 drop-shadow-md animate-[float_3s_ease-in-out_infinite]">🏆</div>

                {/* Name plaque */}
                <div className="inline-block bg-gradient-to-b from-amber-600 to-amber-800 rounded-lg px-5 py-2 shadow-lg">
                  <div className="text-lg font-bold text-amber-100">{task.title}</div>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-sm">{categoryIcon}</span>
                    <span className="text-xs text-amber-300">{task.category}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {task.description && (
                <div className="text-center text-sm text-amber-700/70 mb-4 italic">
                  "{task.description}"
                </div>
              )}

              {/* Stickers display - velvet background */}
              <div className="bg-gradient-to-br from-red-900/10 via-red-800/5 to-amber-900/10 rounded-xl p-4 border border-amber-200/50">
                <div className="text-xs font-semibold text-amber-700/60 uppercase tracking-wider text-center mb-3">
                  Sticker Collection
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {awarded.map((as) => {
                    const sd = getStickerById(as.stickerId);
                    if (!sd) return null;
                    const date = new Date(as.awardedAt);
                    const dateStr = date.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    });
                    return (
                      <div
                        key={as.id}
                        className="flex flex-col items-center gap-1 bg-white/80 rounded-xl p-2.5 shadow-sm border border-amber-200/40 hover:scale-110 transition-transform"
                      >
                        <span className="text-4xl">{sd.emoji}</span>
                        <span className="text-[10px] font-semibold text-amber-800 max-w-[60px] truncate text-center">
                          {sd.name}
                        </span>
                        <span className="text-[9px] text-amber-500">
                          {as.awardedBy === 'parent' ? '👨‍👩‍👧' : '🧒'} {dateStr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completion date */}
              <div className="text-center mt-4 text-xs text-amber-600/50">
                Completed with {awarded.length} sticker{awarded.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Pedestal */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-2 bg-gradient-to-b from-amber-400 to-amber-500 rounded-b-sm" />
          <div className="w-36 h-1.5 bg-gradient-to-b from-amber-500 to-amber-600 rounded-b-sm" />
          <div className="w-40 h-1 bg-gradient-to-b from-amber-600 to-amber-700 rounded-b-md" />
        </div>
      </div>
    </div>
    </>
  );
}

export function TrophyRoom({ tasks, onBack }: Props) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const completedTasks = tasks.filter((t) => isTaskComplete(t));

  const groups = new Map<string, Task[]>();
  for (const task of completedTasks) {
    const key = task.category;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(task);
  }

  const totalStickers = completedTasks.reduce(
    (sum, t) => sum + getStickersForTask(t.id).length,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-lg">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Trophy Room</h1>
      </div>

      <div className="relative">
        <div className="bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 rounded-2xl p-1.5 shadow-xl">
          <div className="bg-gradient-to-b from-amber-600 to-amber-700 rounded-xl p-1">
            <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-yellow-50/80 rounded-lg p-4 min-h-[300px] relative overflow-hidden">
              <div className="absolute top-0 left-4 right-[60%] h-full bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 right-8 w-px h-full bg-white/10 pointer-events-none" />

              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-b from-amber-700 to-amber-800 rounded-lg px-5 py-2 shadow-md inline-flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-100">{completedTasks.length}</div>
                    <div className="text-[10px] uppercase tracking-wider text-amber-300">Trophies</div>
                  </div>
                  <div className="w-px h-8 bg-amber-600" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-100">{totalStickers}</div>
                    <div className="text-[10px] uppercase tracking-wider text-amber-300">Stickers</div>
                  </div>
                  <div className="w-px h-8 bg-amber-600" />
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-100">{groups.size}</div>
                    <div className="text-[10px] uppercase tracking-wider text-amber-300">Categories</div>
                  </div>
                </div>
              </div>

              {completedTasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4 opacity-30">🏆</div>
                  <div className="text-amber-800/40 font-medium text-lg">Your trophy case is empty</div>
                  <div className="text-amber-700/30 text-sm mt-1">Complete tasks to earn trophies!</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...groups.entries()].map(([category, categoryTasks]) => (
                    <TrophyShelf
                      key={category}
                      label={category}
                      icon={getCategoryIcon(category)}
                      tasks={categoryTasks}
                      onSelect={setSelectedTask}
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 -mx-4 -mb-4 h-2 bg-gradient-to-b from-amber-200/50 to-amber-300/30" />
            </div>
          </div>
        </div>

        <div className="flex justify-between px-6">
          <div className="w-4 h-3 bg-gradient-to-b from-amber-900 to-amber-950 rounded-b-md" />
          <div className="w-4 h-3 bg-gradient-to-b from-amber-900 to-amber-950 rounded-b-md" />
        </div>
      </div>

      {selectedTask && (
        <TrophyZoom task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
