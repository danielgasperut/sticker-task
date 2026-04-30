import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from './firebase';
import type { Task, AwardedSticker, CategoryDef, Child } from './types';
import { DEFAULT_CATEGORIES } from './types';

let _uid: string | null = null;
let _unsubscribe: Unsubscribe | null = null;
let _onUpdate: (() => void) | null = null;

interface FamilyData {
  tasks: Task[];
  stickers: AwardedSticker[];
  categories: CategoryDef[];
  children: Child[];
  slots: Record<string, boolean[]>;
}

const _cache: FamilyData = {
  tasks: [],
  stickers: [],
  categories: [...DEFAULT_CATEGORIES],
  children: [],
  slots: {},
};

function familyDoc() {
  if (!_uid) throw new Error('Not logged in');
  return doc(db, 'families', _uid, 'data', 'all');
}

function persist() {
  if (!_uid) return;
  const data: FamilyData = {
    tasks: _cache.tasks,
    stickers: _cache.stickers,
    categories: _cache.categories,
    children: _cache.children,
    slots: _cache.slots,
  };
  setDoc(familyDoc(), data, { merge: true });
}

export function setStoreAccount(uid: string | null) {
  if (_unsubscribe) {
    _unsubscribe();
    _unsubscribe = null;
  }
  _uid = uid;

  _cache.tasks = [];
  _cache.stickers = [];
  _cache.categories = [...DEFAULT_CATEGORIES];
  _cache.children = [];
  _cache.slots = {};

  if (uid) {
    _unsubscribe = onSnapshot(doc(db, 'families', uid, 'data', 'all'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as FamilyData;
        _cache.tasks = data.tasks ?? [];
        _cache.stickers = data.stickers ?? [];
        _cache.categories = data.categories?.length ? data.categories : [...DEFAULT_CATEGORIES];
        _cache.children = data.children ?? [];
        _cache.slots = data.slots ?? {};
        _onUpdate?.();
      }
    });
  }
}

export async function loadInitialData(): Promise<void> {
  if (!_uid) return;
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore load timeout')), 8000),
  );
  const snap = await Promise.race([getDoc(familyDoc()), timeout]);
  if (snap.exists()) {
    const data = snap.data() as FamilyData;
    _cache.tasks = data.tasks ?? [];
    _cache.stickers = data.stickers ?? [];
    _cache.categories = data.categories?.length ? data.categories : [...DEFAULT_CATEGORIES];
    _cache.children = data.children ?? [];
    _cache.slots = data.slots ?? {};
  }
}

export function setOnUpdate(fn: (() => void) | null) {
  _onUpdate = fn;
}

// --- Tasks ---

export function getTasks(): Task[] {
  return _cache.tasks;
}

export function saveTask(task: Task) {
  const idx = _cache.tasks.findIndex((t) => t.id === task.id);
  if (idx >= 0) _cache.tasks[idx] = task;
  else _cache.tasks.push(task);
  persist();
}

export function deleteTask(taskId: string) {
  _cache.tasks = _cache.tasks.filter((t) => t.id !== taskId);
  _cache.stickers = _cache.stickers.filter((s) => s.taskId !== taskId);
  persist();
}

// --- Stickers ---

export function getAwardedStickers(): AwardedSticker[] {
  return _cache.stickers;
}

export function awardSticker(sticker: AwardedSticker) {
  _cache.stickers.push(sticker);
  persist();
}

export function removeAwardedSticker(awardedStickerId: string) {
  _cache.stickers = _cache.stickers.filter((s) => s.id !== awardedStickerId);
  persist();
}

export function getStickersForTask(taskId: string): AwardedSticker[] {
  return _cache.stickers.filter((s) => s.taskId === taskId);
}

export function getStickerAtSlot(taskId: string, slotIndex: number): AwardedSticker | undefined {
  const stickers = getStickersForTask(taskId);
  return stickers.find((s) => s.slotIndex === slotIndex)
    ?? (stickers.filter((s) => s.slotIndex === undefined || s.slotIndex === null)[slotIndex] || undefined);
}

export function isTaskComplete(task: Task): boolean {
  return getStickersForTask(task.id).length >= task.cost;
}

export function nextEmptySlot(taskId: string, cost: number, enabledOnly?: boolean): number | null {
  const enabledSlots = getEnabledSlots(taskId);
  for (let i = 0; i < cost; i++) {
    if (getStickerAtSlot(taskId, i)) continue;
    if (enabledOnly && !(enabledSlots[i] ?? false)) continue;
    return i;
  }
  return null;
}

// --- Categories ---

export function getCategories(): CategoryDef[] {
  return _cache.categories;
}

export function saveCategories(categories: CategoryDef[]) {
  _cache.categories = categories;
  persist();
}

export function addCategory(cat: CategoryDef) {
  if (_cache.categories.some((c) => c.name.toLowerCase() === cat.name.toLowerCase())) return;
  _cache.categories.push(cat);
  persist();
}

export function removeCategory(name: string) {
  _cache.categories = _cache.categories.filter((c) => c.name !== name);
  persist();
}

export function getCategoryIcon(name: string): string {
  return _cache.categories.find((c) => c.name === name)?.icon ?? '📌';
}

// --- Slots ---

export function getEnabledSlots(taskId: string): boolean[] {
  return _cache.slots[taskId] ?? [];
}

export function setEnabledSlots(taskId: string, slots: boolean[]) {
  _cache.slots[taskId] = slots;
  persist();
}

export function resetTask(taskId: string) {
  _cache.stickers = _cache.stickers.filter((s) => s.taskId !== taskId);
  delete _cache.slots[taskId];
  persist();
}

// --- Children ---

export function getChildren(): Child[] {
  return _cache.children;
}

export function saveChild(child: Child) {
  const idx = _cache.children.findIndex((c) => c.id === child.id);
  if (idx >= 0) _cache.children[idx] = child;
  else _cache.children.push(child);
  persist();
}

export function deleteChild(childId: string) {
  _cache.children = _cache.children.filter((c) => c.id !== childId);
  persist();
}

export function getChildById(childId: string): Child | undefined {
  return _cache.children.find((c) => c.id === childId);
}

export function clearAllData() {
  _cache.tasks = [];
  _cache.stickers = [];
  _cache.categories = [...DEFAULT_CATEGORIES];
  _cache.children = [];
  _cache.slots = {};
  persist();
}
