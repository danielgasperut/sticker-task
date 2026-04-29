import { describe, it, expect } from 'vitest';
import {
  setStoreAccount,
  getTasks,
  saveTask,
  getAwardedStickers,
  awardSticker,
  getChildren,
  saveChild,
  getCategories,
  addCategory,
  getEnabledSlots,
  setEnabledSlots,
  clearAllData,
} from '../store';
import type { Task, AwardedSticker, Child } from '../types';

const task1: Task = { id: 't1', title: 'Task A', description: '', category: 'Other', cost: 1, createdAt: 0 };
const task2: Task = { id: 't2', title: 'Task B', description: '', category: 'Other', cost: 1, createdAt: 0 };
const sticker1: AwardedSticker = { id: 's1', stickerId: 'x', taskId: 't1', slotIndex: 0, awardedAt: 0, awardedBy: 'parent' };
const child1: Child = { id: 'c1', name: 'Alice', avatar: '👧' };

describe('Data Isolation', () => {
  it('switching accounts resets cache', () => {
    setStoreAccount('family-a');
    saveTask(task1);
    expect(getTasks()).toHaveLength(1);

    setStoreAccount('family-b');
    expect(getTasks()).toHaveLength(0);
  });

  it('each account has independent tasks', () => {
    setStoreAccount('family-c');
    saveTask(task1);

    setStoreAccount('family-d');
    saveTask(task2);
    expect(getTasks()).toHaveLength(1);
    expect(getTasks()[0].title).toBe('Task B');
  });

  it('each account has independent stickers', () => {
    setStoreAccount('family-e');
    saveTask(task1);
    awardSticker(sticker1);
    expect(getAwardedStickers()).toHaveLength(1);

    setStoreAccount('family-f');
    expect(getAwardedStickers()).toHaveLength(0);
  });

  it('each account has independent children', () => {
    setStoreAccount('family-g');
    saveChild(child1);
    expect(getChildren()).toHaveLength(1);

    setStoreAccount('family-h');
    expect(getChildren()).toHaveLength(0);
  });

  it('each account has independent categories', () => {
    setStoreAccount('family-i');
    addCategory({ name: 'Swimming', icon: '🏊' });
    expect(getCategories().some((c) => c.name === 'Swimming')).toBe(true);

    setStoreAccount('family-j');
    expect(getCategories().some((c) => c.name === 'Swimming')).toBe(false);
  });

  it('each account has independent slot permissions', () => {
    setStoreAccount('family-k');
    setEnabledSlots('t1', [true, false, true]);
    expect(getEnabledSlots('t1')).toEqual([true, false, true]);

    setStoreAccount('family-l');
    expect(getEnabledSlots('t1')).toEqual([]);
  });

  it('clearAllData resets current account cache', () => {
    setStoreAccount('family-m');
    saveTask(task1);
    saveChild(child1);
    awardSticker(sticker1);
    addCategory({ name: 'Dance', icon: '💃' });

    clearAllData();

    expect(getTasks()).toHaveLength(0);
    expect(getChildren()).toHaveLength(0);
    expect(getAwardedStickers()).toHaveLength(0);
    expect(getCategories().some((c) => c.name === 'Dance')).toBe(false);
  });
});
