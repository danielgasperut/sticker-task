import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrophyRoom } from '../../components/TrophyRoom';
import type { Task, AwardedSticker } from '../../types';
import { saveTask, awardSticker } from '../../store';

function setup(tasks: Task[] = [], stickers: AwardedSticker[] = []) {
  tasks.forEach((t) => saveTask(t));
  stickers.forEach((s) => awardSticker(s));
  render(<TrophyRoom tasks={tasks} stickers={stickers} onBack={() => {}} />);
}

describe('TrophyRoom', () => {
  it('renders heading', () => {
    setup();
    expect(screen.getByText('Trophy Room')).toBeInTheDocument();
  });

  it('shows empty state when no completed tasks', () => {
    const task: Task = { id: 't1', title: 'X', description: '', category: 'Other', cost: 3, createdAt: 0 };
    setup([task]);
    expect(screen.getByText('Your trophy case is empty')).toBeInTheDocument();
  });

  it('shows completed tasks grouped by category', () => {
    const task: Task = { id: 't1', title: 'Done Task', description: '', category: 'Cleaning', cost: 1, createdAt: 0 };
    const sticker: AwardedSticker = { id: 's1', stickerId: 's-star', taskId: 't1', slotIndex: 0, awardedAt: 0, awardedBy: 'parent' };
    setup([task], [sticker]);
    expect(screen.getByText('Done Task')).toBeInTheDocument();
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
  });

  it('shows stats plaque', () => {
    const task: Task = { id: 't1', title: 'X', description: '', category: 'Other', cost: 1, createdAt: 0 };
    const sticker: AwardedSticker = { id: 's1', stickerId: 's-star', taskId: 't1', slotIndex: 0, awardedAt: 0, awardedBy: 'parent' };
    setup([task], [sticker]);
    expect(screen.getByText('Trophies')).toBeInTheDocument();
    expect(screen.getByText('Stickers')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('opens zoom modal when clicking a trophy', async () => {
    const task: Task = { id: 't1', title: 'Zoomed Task', description: 'Great job', category: 'Other', cost: 1, createdAt: 0 };
    const sticker: AwardedSticker = { id: 's1', stickerId: 's-star', taskId: 't1', slotIndex: 0, awardedAt: 0, awardedBy: 'parent' };
    setup([task], [sticker]);

    const trophyButtons = screen.getAllByRole('button');
    const trophyBtn = trophyButtons.find((b) => b.textContent?.includes('Zoomed Task'));
    expect(trophyBtn).toBeDefined();
    await userEvent.click(trophyBtn!);

    expect(screen.getByText('Sticker Collection')).toBeInTheDocument();
    expect(screen.getByText('Gold Star')).toBeInTheDocument();
  });

  it('closes zoom modal with close button', async () => {
    const task: Task = { id: 't1', title: 'Trophy', description: '', category: 'Other', cost: 1, createdAt: 0 };
    const sticker: AwardedSticker = { id: 's1', stickerId: 's-star', taskId: 't1', slotIndex: 0, awardedAt: 0, awardedBy: 'parent' };
    setup([task], [sticker]);

    const trophyButtons = screen.getAllByRole('button');
    const trophyBtn = trophyButtons.find((b) => b.textContent?.includes('Trophy'));
    await userEvent.click(trophyBtn!);

    expect(screen.getByText('Sticker Collection')).toBeInTheDocument();
    await userEvent.click(screen.getByText('✕'));
    expect(screen.queryByText('Sticker Collection')).not.toBeInTheDocument();
  });

  it('groups multiple categories on separate shelves', () => {
    const task1: Task = { id: 't1', title: 'A', description: '', category: 'Cleaning', cost: 1, createdAt: 0 };
    const task2: Task = { id: 't2', title: 'B', description: '', category: 'Homework', cost: 1, createdAt: 0 };
    const s1: AwardedSticker = { id: 's1', stickerId: 's-star', taskId: 't1', slotIndex: 0, awardedAt: 0, awardedBy: 'parent' };
    const s2: AwardedSticker = { id: 's2', stickerId: 's-dog', taskId: 't2', slotIndex: 0, awardedAt: 0, awardedBy: 'child' };
    setup([task1, task2], [s1, s2]);
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Homework')).toBeInTheDocument();
  });
});
