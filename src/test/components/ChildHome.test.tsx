import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChildHome } from '../../components/ChildHome';
import type { Task, AwardedSticker } from '../../types';
import { saveTask, awardSticker, setEnabledSlots } from '../../store';

function setup(tasks: Task[] = [], stickers: AwardedSticker[] = []) {
  const onNavigate = vi.fn();
  tasks.forEach((t) => saveTask(t));
  stickers.forEach((s) => awardSticker(s));
  render(<ChildHome tasks={tasks} stickers={stickers} activeChild={null} onNavigate={onNavigate} />);
  return { onNavigate };
}

describe('ChildHome', () => {
  it('renders child heading', () => {
    setup();
    expect(screen.getByText('My Stickers!')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    setup();
    expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
  });

  it('shows active tasks', () => {
    const task: Task = {
      id: 't1', title: 'Do Homework', description: 'Math worksheet', category: 'Homework', cost: 3, createdAt: 0,
    };
    setup([task]);
    expect(screen.getByText('Do Homework')).toBeInTheDocument();
    expect(screen.getByText('Math worksheet')).toBeInTheDocument();
    expect(screen.getByText(/3 more sticker/)).toBeInTheDocument();
  });

  it('shows "ask parent" when no slots unlocked', () => {
    const task: Task = {
      id: 't1', title: 'Task', description: '', category: 'Other', cost: 2, createdAt: 0,
    };
    setup([task]);
    expect(screen.getByText(/Ask parent to unlock/)).toBeInTheDocument();
  });

  it('shows "Pick a Sticker" button when slots are unlocked', () => {
    const task: Task = {
      id: 't1', title: 'Task', description: '', category: 'Other', cost: 2, createdAt: 0,
    };
    setEnabledSlots('t1', [true, false]);
    setup([task]);
    expect(screen.getByText(/Pick a Sticker/)).toBeInTheDocument();
  });

  it('shows trophy room button when tasks are complete', () => {
    const task: Task = {
      id: 't1', title: 'Done Task', description: '', category: 'Other', cost: 1, createdAt: 0,
    };
    const sticker: AwardedSticker = {
      id: 's1', stickerId: 's-star', taskId: 't1', slotIndex: 0, awardedAt: 0, awardedBy: 'parent',
    };
    setup([task], [sticker]);
    expect(screen.getByText(/Trophy Room/)).toBeInTheDocument();
  });

  it('navigates to trophy room', async () => {
    const task: Task = {
      id: 't1', title: 'Done', description: '', category: 'Other', cost: 1, createdAt: 0,
    };
    const sticker: AwardedSticker = {
      id: 's1', stickerId: 's-star', taskId: 't1', slotIndex: 0, awardedAt: 0, awardedBy: 'parent',
    };
    const { onNavigate } = setup([task], [sticker]);
    await userEvent.click(screen.getByText(/Trophy Room/));
    expect(onNavigate).toHaveBeenCalledWith('trophy-room');
  });
});
