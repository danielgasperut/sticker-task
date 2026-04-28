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
  it('different accounts have separate tasks', () => {
    setStoreAccount('family-a');
    saveTask(task1);
    expect(getTasks()).toHaveLength(1);

    setStoreAccount('family-b');
    expect(getTasks()).toHaveLength(0);
    saveTask(task2);
    expect(getTasks()).toHaveLength(1);
    expect(getTasks()[0].title).toBe('Task B');

    setStoreAccount('family-a');
    expect(getTasks()).toHaveLength(1);
    expect(getTasks()[0].title).toBe('Task A');
  });

  it('different accounts have separate stickers', () => {
    setStoreAccount('family-c');
    saveTask(task1);
    awardSticker(sticker1);
    expect(getAwardedStickers()).toHaveLength(1);

    setStoreAccount('family-d');
    expect(getAwardedStickers()).toHaveLength(0);
  });

  it('different accounts have separate children', () => {
    setStoreAccount('family-e');
    saveChild(child1);
    expect(getChildren()).toHaveLength(1);

    setStoreAccount('family-f');
    expect(getChildren()).toHaveLength(0);
  });

  it('different accounts have separate categories', () => {
    setStoreAccount('family-g');
    addCategory({ name: 'Swimming', icon: '🏊' });
    const catsG = getCategories();
    expect(catsG.some((c) => c.name === 'Swimming')).toBe(true);

    setStoreAccount('family-h');
    const catsH = getCategories();
    expect(catsH.some((c) => c.name === 'Swimming')).toBe(false);
  });

  it('different accounts have separate slot permissions', () => {
    setStoreAccount('family-i');
    setEnabledSlots('t1', [true, false, true]);
    expect(getEnabledSlots('t1')).toEqual([true, false, true]);

    setStoreAccount('family-j');
    expect(getEnabledSlots('t1')).toEqual([]);
  });

  it('clearAllData only clears active account', () => {
    setStoreAccount('family-keep');
    saveTask(task1);
    saveChild(child1);
    awardSticker(sticker1);

    setStoreAccount('family-wipe');
    saveTask(task2);
    saveChild({ id: 'c2', name: 'Bob', avatar: '👦' });
    clearAllData();

    expect(getTasks()).toHaveLength(0);
    expect(getChildren()).toHaveLength(0);
    expect(getAwardedStickers()).toHaveLength(0);

    setStoreAccount('family-keep');
    expect(getTasks()).toHaveLength(1);
    expect(getChildren()).toHaveLength(1);
    expect(getAwardedStickers()).toHaveLength(1);
  });

  it('null account falls back to unprefixed keys', () => {
    setStoreAccount(null);
    saveTask(task1);
    expect(getTasks()).toHaveLength(1);

    setStoreAccount('some-family');
    expect(getTasks()).toHaveLength(0);

    setStoreAccount(null);
    expect(getTasks()).toHaveLength(1);
  });
});
