export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { name: 'Cleaning', icon: '🧹' },
  { name: 'Homework', icon: '📚' },
  { name: 'Behavior', icon: '⭐' },
  { name: 'Friendship', icon: '🤝' },
  { name: 'Physical', icon: '🏃' },
  { name: 'Play', icon: '🎮' },
  { name: 'Creative', icon: '🎨' },
  { name: 'Chores', icon: '🧺' },
  { name: 'Reading', icon: '📖' },
  { name: 'Music', icon: '🎵' },
  { name: 'Kindness', icon: '💝' },
  { name: 'Self-Care', icon: '🧘' },
  { name: 'Other', icon: '📌' },
];

export interface CategoryDef {
  name: string;
  icon: string;
}

export interface StickerDef {
  id: string;
  emoji: string;
  name: string;
  category: string;
}

export interface AwardedSticker {
  id: string;
  stickerId: string;
  taskId: string;
  slotIndex: number;
  awardedAt: number;
  awardedBy: 'parent' | 'child';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  cost: number;
  createdAt: number;
  completedAt?: number;
  childId?: string;
}

export interface Child {
  id: string;
  name: string;
  avatar: string;
}

export type Role = 'parent' | 'child';

export type Screen =
  | 'home'
  | 'manage-tasks'
  | 'create-task'
  | 'edit-task'
  | 'award-sticker'
  | 'my-tasks'
  | 'pick-sticker'
  | 'trophy-room'
  | 'manage-categories'
  | 'manage-children'
  | 'analytics';
