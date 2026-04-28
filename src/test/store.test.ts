import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTasks,
  saveTask,
  deleteTask,
  getAwardedStickers,
  awardSticker,
  removeAwardedSticker,
  getStickersForTask,
  getStickerAtSlot,
  isTaskComplete,
  nextEmptySlot,
  resetTask,
  getCategories,
  saveCategories,
  addCategory,
  removeCategory,
  getCategoryIcon,
  getEnabledSlots,
  setEnabledSlots,
} from '../store';
import type { Task, AwardedSticker } from '../types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Clean Room',
    description: 'Make bed and vacuum',
    category: 'Cleaning',
    cost: 3,
    createdAt: Date.now(),
    ...overrides,
  };
}

function makeSticker(overrides: Partial<AwardedSticker> = {}): AwardedSticker {
  return {
    id: 'sticker-1',
    stickerId: 's-star',
    taskId: 'task-1',
    slotIndex: 0,
    awardedAt: Date.now(),
    awardedBy: 'parent',
    ...overrides,
  };
}

describe('Task CRUD', () => {
  it('starts with empty tasks', () => {
    expect(getTasks()).toEqual([]);
  });

  it('saves a new task', () => {
    const task = makeTask();
    saveTask(task);
    expect(getTasks()).toHaveLength(1);
    expect(getTasks()[0].title).toBe('Clean Room');
  });

  it('updates an existing task by id', () => {
    const task = makeTask();
    saveTask(task);
    saveTask({ ...task, title: 'Clean Room v2' });
    expect(getTasks()).toHaveLength(1);
    expect(getTasks()[0].title).toBe('Clean Room v2');
  });

  it('saves multiple tasks', () => {
    saveTask(makeTask({ id: 'a' }));
    saveTask(makeTask({ id: 'b' }));
    saveTask(makeTask({ id: 'c' }));
    expect(getTasks()).toHaveLength(3);
  });

  it('deletes a task and its stickers', () => {
    saveTask(makeTask());
    awardSticker(makeSticker());
    expect(getStickersForTask('task-1')).toHaveLength(1);
    deleteTask('task-1');
    expect(getTasks()).toHaveLength(0);
    expect(getStickersForTask('task-1')).toHaveLength(0);
  });

  it('deleting non-existent task is a no-op', () => {
    saveTask(makeTask());
    deleteTask('nonexistent');
    expect(getTasks()).toHaveLength(1);
  });
});

describe('Sticker Awarding', () => {
  beforeEach(() => {
    saveTask(makeTask());
  });

  it('starts with no stickers', () => {
    expect(getAwardedStickers()).toEqual([]);
  });

  it('awards a sticker to a task', () => {
    awardSticker(makeSticker());
    expect(getStickersForTask('task-1')).toHaveLength(1);
  });

  it('awards multiple stickers to a task', () => {
    awardSticker(makeSticker({ id: 'a', slotIndex: 0 }));
    awardSticker(makeSticker({ id: 'b', slotIndex: 1 }));
    awardSticker(makeSticker({ id: 'c', slotIndex: 2 }));
    expect(getStickersForTask('task-1')).toHaveLength(3);
  });

  it('removes a sticker', () => {
    awardSticker(makeSticker({ id: 'a' }));
    awardSticker(makeSticker({ id: 'b', slotIndex: 1 }));
    removeAwardedSticker('a');
    expect(getAwardedStickers()).toHaveLength(1);
    expect(getAwardedStickers()[0].id).toBe('b');
  });

  it('removing non-existent sticker is a no-op', () => {
    awardSticker(makeSticker());
    removeAwardedSticker('nonexistent');
    expect(getAwardedStickers()).toHaveLength(1);
  });

  it('stickers are scoped to tasks', () => {
    saveTask(makeTask({ id: 'task-2' }));
    awardSticker(makeSticker({ id: 'a', taskId: 'task-1' }));
    awardSticker(makeSticker({ id: 'b', taskId: 'task-2' }));
    expect(getStickersForTask('task-1')).toHaveLength(1);
    expect(getStickersForTask('task-2')).toHaveLength(1);
  });
});

describe('Slot-Based Stickers', () => {
  beforeEach(() => {
    saveTask(makeTask({ cost: 4 }));
  });

  it('getStickerAtSlot returns sticker at correct slot', () => {
    awardSticker(makeSticker({ id: 'a', slotIndex: 0 }));
    awardSticker(makeSticker({ id: 'b', slotIndex: 2 }));
    expect(getStickerAtSlot('task-1', 0)?.id).toBe('a');
    expect(getStickerAtSlot('task-1', 1)).toBeUndefined();
    expect(getStickerAtSlot('task-1', 2)?.id).toBe('b');
    expect(getStickerAtSlot('task-1', 3)).toBeUndefined();
  });

  it('nextEmptySlot returns first empty slot', () => {
    awardSticker(makeSticker({ id: 'a', slotIndex: 0 }));
    awardSticker(makeSticker({ id: 'b', slotIndex: 1 }));
    expect(nextEmptySlot('task-1', 4)).toBe(2);
  });

  it('nextEmptySlot returns null when all filled', () => {
    for (let i = 0; i < 4; i++) {
      awardSticker(makeSticker({ id: `s-${i}`, slotIndex: i }));
    }
    expect(nextEmptySlot('task-1', 4)).toBeNull();
  });

  it('nextEmptySlot with enabledOnly respects locks', () => {
    setEnabledSlots('task-1', [false, true, false, true]);
    expect(nextEmptySlot('task-1', 4, true)).toBe(1);
    awardSticker(makeSticker({ id: 'a', slotIndex: 1 }));
    expect(nextEmptySlot('task-1', 4, true)).toBe(3);
  });

  it('nextEmptySlot enabledOnly returns null when no enabled slots', () => {
    setEnabledSlots('task-1', [false, false, false, false]);
    expect(nextEmptySlot('task-1', 4, true)).toBeNull();
  });

  it('nextEmptySlot enabledOnly returns null when enabled slots are filled', () => {
    setEnabledSlots('task-1', [false, true, false, false]);
    awardSticker(makeSticker({ id: 'a', slotIndex: 1 }));
    expect(nextEmptySlot('task-1', 4, true)).toBeNull();
  });
});

describe('Task Completion', () => {
  it('task is not complete with fewer stickers than cost', () => {
    const task = makeTask({ cost: 3 });
    saveTask(task);
    awardSticker(makeSticker({ id: 'a', slotIndex: 0 }));
    awardSticker(makeSticker({ id: 'b', slotIndex: 1 }));
    expect(isTaskComplete(task)).toBe(false);
  });

  it('task is complete when sticker count equals cost', () => {
    const task = makeTask({ cost: 2 });
    saveTask(task);
    awardSticker(makeSticker({ id: 'a', slotIndex: 0 }));
    awardSticker(makeSticker({ id: 'b', slotIndex: 1 }));
    expect(isTaskComplete(task)).toBe(true);
  });

  it('task is complete when sticker count exceeds cost', () => {
    const task = makeTask({ cost: 1 });
    saveTask(task);
    awardSticker(makeSticker({ id: 'a', slotIndex: 0 }));
    awardSticker(makeSticker({ id: 'b', slotIndex: 1 }));
    expect(isTaskComplete(task)).toBe(true);
  });

  it('task with cost 0 is immediately complete', () => {
    const task = makeTask({ cost: 0 });
    saveTask(task);
    expect(isTaskComplete(task)).toBe(true);
  });
});

describe('Task Reset', () => {
  it('clears all stickers for a task', () => {
    saveTask(makeTask());
    awardSticker(makeSticker({ id: 'a', slotIndex: 0 }));
    awardSticker(makeSticker({ id: 'b', slotIndex: 1 }));
    resetTask('task-1');
    expect(getStickersForTask('task-1')).toHaveLength(0);
  });

  it('clears slot permissions for a task', () => {
    saveTask(makeTask());
    setEnabledSlots('task-1', [true, false, true]);
    resetTask('task-1');
    expect(getEnabledSlots('task-1')).toEqual([]);
  });

  it('does not affect other tasks', () => {
    saveTask(makeTask({ id: 'task-1' }));
    saveTask(makeTask({ id: 'task-2' }));
    awardSticker(makeSticker({ id: 'a', taskId: 'task-1', slotIndex: 0 }));
    awardSticker(makeSticker({ id: 'b', taskId: 'task-2', slotIndex: 0 }));
    resetTask('task-1');
    expect(getStickersForTask('task-1')).toHaveLength(0);
    expect(getStickersForTask('task-2')).toHaveLength(1);
  });

  it('task still exists after reset', () => {
    saveTask(makeTask());
    awardSticker(makeSticker());
    resetTask('task-1');
    expect(getTasks()).toHaveLength(1);
    expect(getTasks()[0].id).toBe('task-1');
  });
});

describe('Slot Enable/Disable', () => {
  it('defaults to empty array (all locked)', () => {
    expect(getEnabledSlots('task-1')).toEqual([]);
  });

  it('sets and gets enabled slots', () => {
    setEnabledSlots('task-1', [true, false, true]);
    expect(getEnabledSlots('task-1')).toEqual([true, false, true]);
  });

  it('slots are per-task', () => {
    setEnabledSlots('task-1', [true, true]);
    setEnabledSlots('task-2', [false, false]);
    expect(getEnabledSlots('task-1')).toEqual([true, true]);
    expect(getEnabledSlots('task-2')).toEqual([false, false]);
  });

  it('overwriting slots replaces them', () => {
    setEnabledSlots('task-1', [true, true, true]);
    setEnabledSlots('task-1', [false]);
    expect(getEnabledSlots('task-1')).toEqual([false]);
  });
});

describe('Category Management', () => {
  it('returns default categories', () => {
    const cats = getCategories();
    expect(cats.length).toBeGreaterThan(0);
    expect(cats.find((c) => c.name === 'Cleaning')).toBeDefined();
    expect(cats.find((c) => c.name === 'Other')).toBeDefined();
  });

  it('adds a custom category', () => {
    addCategory({ name: 'Science', icon: '🔬' });
    const cats = getCategories();
    expect(cats.find((c) => c.name === 'Science')).toBeDefined();
  });

  it('prevents duplicate category names (case insensitive)', () => {
    const initialCount = getCategories().length;
    addCategory({ name: 'cleaning', icon: '🧽' });
    expect(getCategories().length).toBe(initialCount);
  });

  it('removes a category', () => {
    addCategory({ name: 'TestCat', icon: '🧪' });
    removeCategory('TestCat');
    expect(getCategories().find((c) => c.name === 'TestCat')).toBeUndefined();
  });

  it('removing non-existent category is safe', () => {
    const before = getCategories().length;
    removeCategory('Nonexistent');
    expect(getCategories().length).toBe(before);
  });

  it('saves and restores categories', () => {
    saveCategories([{ name: 'Only', icon: '1️⃣' }]);
    expect(getCategories()).toEqual([{ name: 'Only', icon: '1️⃣' }]);
  });

  it('getCategoryIcon returns icon for known category', () => {
    expect(getCategoryIcon('Cleaning')).toBe('🧹');
  });

  it('getCategoryIcon returns fallback for unknown category', () => {
    expect(getCategoryIcon('Unknown')).toBe('📌');
  });
});

describe('localStorage Resilience', () => {
  it('handles corrupted JSON gracefully', () => {
    localStorage.setItem('sticker-task:tasks', '{invalid json');
    expect(getTasks()).toEqual([]);
  });

  it('handles empty localStorage', () => {
    localStorage.clear();
    expect(getTasks()).toEqual([]);
    expect(getAwardedStickers()).toEqual([]);
    expect(getCategories().length).toBeGreaterThan(0);
  });
});
