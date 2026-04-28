import { useState, useRef } from 'react';
import type { Task, AwardedSticker } from '../types';
import {
  awardSticker,
  isTaskComplete,
  getEnabledSlots,
  getStickerAtSlot,
  nextEmptySlot,
} from '../store';
import { STICKER_LIBRARY, STICKER_CATEGORIES, getStickerById } from '../stickers';

interface Props {
  task: Task;
  stickers: AwardedSticker[];
  onBack: () => void;
  onPicked: () => void;
}

export function PickSticker({ task, onBack, onPicked }: Props) {
  const [selectedCategory, setSelectedCategory] = useState(STICKER_CATEGORIES[0]);
  const [justPicked, setJustPicked] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const complete = isTaskComplete(task);
  const enabledSlots = getEnabledSlots(task.id);

  const getSlotEnabled = (i: number) => enabledSlots[i] ?? false;

  const childCanPick = nextEmptySlot(task.id, task.cost, true) !== null;

  const handleAdd = (stickerId: string) => {
    if (complete || !childCanPick) return;
    const slot = nextEmptySlot(task.id, task.cost, true);
    if (slot === null) return;

    awardSticker({
      id: crypto.randomUUID(),
      stickerId,
      taskId: task.id,
      slotIndex: slot,
      awardedAt: Date.now(),
      awardedBy: 'child',
    });
    setJustPicked(stickerId);
    setTimeout(() => setJustPicked(null), 600);
    onPicked();
  };

  const handleDragStart = (e: React.DragEvent, stickerId: string) => {
    e.dataTransfer.setData('text/plain', stickerId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!childCanPick) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const stickerId = e.dataTransfer.getData('text/plain');
    if (stickerId) handleAdd(stickerId);
  };

  const enabledRemaining = Array.from({ length: task.cost }).filter(
    (_, i) => !getStickerAtSlot(task.id, i) && getSlotEnabled(i)
  ).length;
  const lockedRemaining = Array.from({ length: task.cost }).filter(
    (_, i) => !getStickerAtSlot(task.id, i) && !getSlotEnabled(i)
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 text-lg">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Pick a Sticker!</h1>
      </div>

      <div
        ref={dropRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white rounded-2xl p-4 shadow-sm transition-all ${
          dragOver ? 'ring-4 ring-pink/50 bg-pink-50 scale-[1.02]' : ''
        }`}
      >
        <div className="font-semibold text-gray-800 text-lg">{task.title}</div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {Array.from({ length: task.cost }).map((_, i) => {
            const stickerAtSlot = getStickerAtSlot(task.id, i);
            const sd = stickerAtSlot ? getStickerById(stickerAtSlot.stickerId) : null;
            const enabled = getSlotEnabled(i);
            return (
              <div
                key={i}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                  sd
                    ? 'bg-yellow-50 border-2 border-yellow-300'
                    : enabled
                      ? dragOver
                        ? 'bg-pink-50 border-2 border-dashed border-pink animate-pulse'
                        : 'bg-green-50 border-2 border-dashed border-green-300'
                      : 'bg-gray-100 border-2 border-gray-200'
                }`}
                title={sd ? sd.name : enabled ? 'Your pick!' : 'Locked - ask parent'}
              >
                {sd ? sd.emoji : enabled ? '✨' : '🔒'}
              </div>
            );
          })}
        </div>

        {dragOver && childCanPick && (
          <div className="mt-2 text-sm text-pink font-medium text-center animate-bounce">
            Drop it here!
          </div>
        )}

        {complete ? (
          <div className="mt-3 text-center py-4 bg-gradient-to-r from-yellow-50 to-green-50 rounded-xl">
            <div className="text-4xl mb-1">🎉🏆🎉</div>
            <div className="font-bold text-success text-lg">Amazing! Task Complete!</div>
            <button
              onClick={onBack}
              className="mt-2 bg-success text-white px-6 py-2 rounded-lg font-medium"
            >
              Back to Tasks
            </button>
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-500 space-y-1">
            {enabledRemaining > 0 && (
              <div className="text-green-600">
                Pick {enabledRemaining} sticker{enabledRemaining !== 1 ? 's' : ''} for your unlocked slots!
              </div>
            )}
            {lockedRemaining > 0 && (
              <div className="text-gray-400">
                {lockedRemaining} slot{lockedRemaining !== 1 ? 's' : ''} locked - ask your parent to unlock
              </div>
            )}
            {enabledRemaining === 0 && lockedRemaining > 0 && (
              <div className="text-amber-500 font-medium mt-1">
                No slots unlocked yet - ask your parent!
              </div>
            )}
          </div>
        )}
      </div>

      {!complete && childCanPick && (
        <div>
          <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
            {STICKER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-pink text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {STICKER_LIBRARY.filter((s) => s.category === selectedCategory).map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => handleAdd(sticker.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, sticker.id)}
                className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing ${
                  justPicked === sticker.id ? 'scale-125 ring-2 ring-pink' : 'hover:scale-105'
                }`}
              >
                <span className="text-4xl">{sticker.emoji}</span>
                <span className="text-xs text-gray-500 font-medium">{sticker.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
