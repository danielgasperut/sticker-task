import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ParentHome } from '../../components/ParentHome';
import type { Task, AwardedSticker } from '../../types';
import { saveTask, awardSticker } from '../../store';

function setup(tasks: Task[] = [], stickers: AwardedSticker[] = []) {
  const onNavigate = vi.fn();
  tasks.forEach((t) => saveTask(t));
  stickers.forEach((s) => awardSticker(s));
  render(<ParentHome tasks={tasks} stickers={stickers} onNavigate={onNavigate} />);
  return { onNavigate };
}

describe('ParentHome', () => {
  it('renders dashboard title', () => {
    setup();
    expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
  });

  it('shows stats cards with zeros when empty', () => {
    setup();
    const stats = screen.getAllByText('0');
    expect(stats.length).toBeGreaterThanOrEqual(3);
  });

  it('shows correct counts with data', () => {
    const task: Task = {
      id: 't1', title: 'T', description: '', category: 'Other', cost: 1, createdAt: 0,
    };
    const sticker: AwardedSticker = {
      id: 's1', stickerId: 's-star', taskId: 't1', slotIndex: 0, awardedAt: 0, awardedBy: 'parent',
    };
    setup([task], [sticker]);
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to manage tasks', async () => {
    const { onNavigate } = setup();
    await userEvent.click(screen.getByText(/Manage Tasks/));
    expect(onNavigate).toHaveBeenCalledWith('manage-tasks');
  });

  it('navigates to create task', async () => {
    const { onNavigate } = setup();
    await userEvent.click(screen.getByText(/New Task/));
    expect(onNavigate).toHaveBeenCalledWith('create-task');
  });

  it('navigates to manage categories', async () => {
    const { onNavigate } = setup();
    await userEvent.click(screen.getByText(/Categories/));
    expect(onNavigate).toHaveBeenCalledWith('manage-categories');
  });

  it('shows active tasks list', () => {
    const task: Task = {
      id: 't1', title: 'Active Task', description: '', category: 'Cleaning', cost: 3, createdAt: 0,
    };
    setup([task]);
    expect(screen.getByText('Active Task')).toBeInTheDocument();
    expect(screen.getByText('0/3 ⭐')).toBeInTheDocument();
  });
});
