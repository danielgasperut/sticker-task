import type { Task, AwardedSticker, CategoryDef, Child } from './types';
import { DEFAULT_CATEGORIES } from './types';

const TASKS_KEY = 'sticker-task:tasks';
const STICKERS_KEY = 'sticker-task:stickers';
const CATEGORIES_KEY = 'sticker-task:categories';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getTasks(): Task[] {
  return load<Task[]>(TASKS_KEY, []);
}

export function saveTask(task: Task) {
  const tasks = getTasks();
  const idx = tasks.findIndex((t) => t.id === task.id);
  if (idx >= 0) {
    tasks[idx] = task;
  } else {
    tasks.push(task);
  }
  save(TASKS_KEY, tasks);
}

export function deleteTask(taskId: string) {
  const tasks = getTasks().filter((t) => t.id !== taskId);
  save(TASKS_KEY, tasks);
  const stickers = getAwardedStickers().filter((s) => s.taskId !== taskId);
  save(STICKERS_KEY, stickers);
}

export function getAwardedStickers(): AwardedSticker[] {
  return load<AwardedSticker[]>(STICKERS_KEY, []);
}

export function awardSticker(sticker: AwardedSticker) {
  const stickers = getAwardedStickers();
  stickers.push(sticker);
  save(STICKERS_KEY, stickers);
}

export function removeAwardedSticker(awardedStickerId: string) {
  const stickers = getAwardedStickers().filter((s) => s.id !== awardedStickerId);
  save(STICKERS_KEY, stickers);
}

export function getStickersForTask(taskId: string): AwardedSticker[] {
  return getAwardedStickers().filter((s) => s.taskId === taskId);
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

export function getCategories(): CategoryDef[] {
  return load<CategoryDef[]>(CATEGORIES_KEY, DEFAULT_CATEGORIES);
}

export function saveCategories(categories: CategoryDef[]) {
  save(CATEGORIES_KEY, categories);
}

export function addCategory(cat: CategoryDef) {
  const cats = getCategories();
  if (cats.some((c) => c.name.toLowerCase() === cat.name.toLowerCase())) return;
  cats.push(cat);
  saveCategories(cats);
}

export function removeCategory(name: string) {
  const cats = getCategories().filter((c) => c.name !== name);
  saveCategories(cats);
}

export function getCategoryIcon(name: string): string {
  const cats = getCategories();
  return cats.find((c) => c.name === name)?.icon ?? '📌';
}

const SLOTS_KEY = 'sticker-task:slots';

export function getEnabledSlots(taskId: string): boolean[] {
  const all = load<Record<string, boolean[]>>(SLOTS_KEY, {});
  return all[taskId] ?? [];
}

export function setEnabledSlots(taskId: string, slots: boolean[]) {
  const all = load<Record<string, boolean[]>>(SLOTS_KEY, {});
  all[taskId] = slots;
  save(SLOTS_KEY, all);
}

export function resetTask(taskId: string) {
  const stickers = getAwardedStickers().filter((s) => s.taskId !== taskId);
  save(STICKERS_KEY, stickers);
  const all = load<Record<string, boolean[]>>(SLOTS_KEY, {});
  delete all[taskId];
  save(SLOTS_KEY, all);
}

const CHILDREN_KEY = 'sticker-task:children';

export function getChildren(): Child[] {
  return load<Child[]>(CHILDREN_KEY, []);
}

export function saveChild(child: Child) {
  const children = getChildren();
  const idx = children.findIndex((c) => c.id === child.id);
  if (idx >= 0) {
    children[idx] = child;
  } else {
    children.push(child);
  }
  save(CHILDREN_KEY, children);
}

export function deleteChild(childId: string) {
  const children = getChildren().filter((c) => c.id !== childId);
  save(CHILDREN_KEY, children);
}

export function getChildById(childId: string): Child | undefined {
  return getChildren().find((c) => c.id === childId);
}

export function clearAllData() {
  localStorage.removeItem(TASKS_KEY);
  localStorage.removeItem(STICKERS_KEY);
  localStorage.removeItem(CATEGORIES_KEY);
  localStorage.removeItem(SLOTS_KEY);
  localStorage.removeItem(CHILDREN_KEY);
}
