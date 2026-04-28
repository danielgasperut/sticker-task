import { useState } from 'react';
import type { Task, AwardedSticker } from '../types';
import {
  awardSticker,
  removeAwardedSticker,
  isTaskComplete,
  getEnabledSlots,
  setEnabledSlots,
  getStickerAtSlot,
  nextEmptySlot,
} from '../store';
import { STICKER_LIBRARY, STICKER_CATEGORIES, getStickerById } from '../stickers';

interface Props {
  task: Task;
  stickers: AwardedSticker[];
  onBack: () => void;
  onAwarded: () => void;
}

export function AwardSticker({ task, onBack, onAwarded }: Props) {
  const [selectedCategory, setSelectedCategory] = useState(STICKER_CATEGORIES[0]);
  const complete = isTaskComplete(task);

  const enabledSlots = getEnabledSlots(task.id);
  const getSlotEnabled = (i: number) => enabledSlots[i] ?? false;

  const toggleSlot = (i: number) => {
    const slots = [...enabledSlots];
    while (slots.length <= i) slots.push(false);
    slots[i] = !slots[i];
    setEnabledSlots(task.id, slots);
    onAwarded();
  };

  const handleSlotClick = (i: number) => {
    const stickerAtSlot = getStickerAtSlot(task.id, i);
    if (stickerAtSlot) {
      removeAwardedSticker(stickerAtSlot.id);
      onAwarded();
      return;
    }
    toggleSlot(i);
  };

  const filledCount = Array.from({ length: task.cost }).filter(
    (_, i) => getStickerAtSlot(task.id, i)
  ).length;
  const remaining = task.cost - filledCount;
  const enabledCount = Array.from({ length: task.cost }).filter(
    (_, i) => !getStickerAtSlot(task.id, i) && getSlotEnabled(i)
  ).length;

  const handleAward = (stickerId: string) => {
    if (complete) return;
    const targetSlot = nextEmptySlot(task.id, task.cost);
    if (targetSlot === null) return;

    awardSticker({
      id: crypto.randomUUID(),
      stickerId,
      taskId: task.id,
      slotIndex: targetSlot,
      awardedAt: Date.now(),
      awardedBy: 'parent',
    });
    onAwarded();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-lg">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Award Sticker</h1>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="font-semibold text-gray-800 text-lg">{task.title}</div>
        <div className="text-sm text-gray-500 mt-1">{task.description}</div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {Array.from({ length: task.cost }).map((_, i) => {
            const stickerAtSlot = getStickerAtSlot(task.id, i);
            const sd = stickerAtSlot ? getStickerById(stickerAtSlot.stickerId) : null;
            const enabled = getSlotEnabled(i);
            return (
              <button
                key={i}
                onClick={() => handleSlotClick(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const stickerId = e.dataTransfer.getData('stickerId');
                  if (!stickerId || sd) return;
                  awardSticker({
                    id: crypto.randomUUID(),
                    stickerId,
                    taskId: task.id,
                    slotIndex: i,
                    awardedAt: Date.now(),
                    awardedBy: 'parent',
                  });
                  onAwarded();
                }}
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all relative ${
                  sd
                    ? 'bg-yellow-50 border-2 border-yellow-300 hover:bg-red-50 hover:border-red-300'
                    : enabled
                      ? 'bg-pink/5 border-2 border-pink/40 hover:border-pink hover:bg-pink/10'
                      : 'bg-gray-50 border-2 border-dashed border-gray-200 hover:border-gray-400'
                }`}
              >
                {sd ? (
                  sd.emoji
                ) : enabled ? (
                  <span className="text-lg">🧒</span>
                ) : (
                  <span className="text-lg text-gray-300">🔒</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          {remaining > 0 && <span>{remaining} sticker{remaining !== 1 ? 's' : ''} needed</span>}
          {enabledCount > 0 && <span className="text-pink">🧒 {enabledCount} slot{enabledCount !== 1 ? 's' : ''} for child</span>}
          {!complete && <span className="text-gray-400">Tap empty slot to toggle 🧒/🔒 · Tap sticker to remove</span>}
        </div>

        {complete && (
          <div className="mt-3 text-success font-semibold text-center py-2 bg-green-50 rounded-lg">
            🎉 Task Complete!
          </div>
        )}
      </div>

      {!complete && (
        <div>
          <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
            {STICKER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-secondary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {STICKER_LIBRARY.filter((s) => s.category === selectedCategory).map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleAward(sticker.id)}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('stickerId', sticker.id)}
                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md hover:scale-110 transition-all flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
              >
                <span className="text-3xl">{sticker.emoji}</span>
                <span className="text-xs text-gray-500">{sticker.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
