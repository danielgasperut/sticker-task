import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManageTasks } from '../../components/ManageTasks';
import type { Task } from '../../types';
import { saveTask, awardSticker, getTasks } from '../../store';

function setup(tasks: Task[] = []) {
  const onNavigate = vi.fn();
  const onBack = vi.fn();
  const onRefresh = vi.fn();
  tasks.forEach((t) => saveTask(t));
  render(
    <ManageTasks
      tasks={tasks}
      stickers={[]}
      onNavigate={onNavigate}
      onBack={onBack}
      onRefresh={onRefresh}
    />
  );
  return { onNavigate, onBack, onRefresh };
}

const sampleTask: Task = {
  id: 't1', title: 'Clean Room', description: '', category: 'Cleaning', cost: 3, createdAt: 0,
};

describe('ManageTasks', () => {
  it('renders heading and new button', () => {
    setup();
    expect(screen.getByText('Manage Tasks')).toBeInTheDocument();
    expect(screen.getByText(/New/)).toBeInTheDocument();
  });

  it('shows empty state', () => {
    setup();
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  it('shows tasks', () => {
    setup([sampleTask]);
    expect(screen.getByText('Clean Room')).toBeInTheDocument();
    expect(screen.getByText(/0\/3 stickers/)).toBeInTheDocument();
  });

  it('navigates to create task', async () => {
    const { onNavigate } = setup();
    await userEvent.click(screen.getByText(/New/));
    expect(onNavigate).toHaveBeenCalledWith('create-task');
  });

  it('navigates to award sticker', async () => {
    const { onNavigate } = setup([sampleTask]);
    await userEvent.click(screen.getByText(/Award/));
    expect(onNavigate).toHaveBeenCalledWith('award-sticker', 't1');
  });

  it('navigates to edit task', async () => {
    const { onNavigate } = setup([sampleTask]);
    await userEvent.click(screen.getByText('✏️'));
    expect(onNavigate).toHaveBeenCalledWith('edit-task', 't1');
  });

  it('deletes task with double click confirmation', async () => {
    const { onRefresh } = setup([sampleTask]);
    const deleteBtn = screen.getByText('🗑️');
    await userEvent.click(deleteBtn);
    expect(screen.getByText('Confirm?')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Confirm?'));
    expect(onRefresh).toHaveBeenCalled();
    expect(getTasks()).toHaveLength(0);
  });

  it('shows reset button for completed tasks', () => {
    const task: Task = { ...sampleTask, cost: 1 };
    saveTask(task);
    awardSticker({
      id: 's1', stickerId: 's-star', taskId: 't1', slotIndex: 0, awardedAt: 0, awardedBy: 'parent',
    });
    const onNavigate = vi.fn();
    render(
      <ManageTasks
        tasks={[task]}
        stickers={[]}
        onNavigate={onNavigate}
        onBack={() => {}}
        onRefresh={() => {}}
      />
    );
    expect(screen.getByText(/Reset/)).toBeInTheDocument();
  });

  it('filters by category', async () => {
    const task2: Task = { ...sampleTask, id: 't2', title: 'Read Book', category: 'Reading' };
    setup([sampleTask, task2]);
    expect(screen.getByText('Clean Room')).toBeInTheDocument();
    expect(screen.getByText('Read Book')).toBeInTheDocument();
    await userEvent.click(screen.getByText(/Cleaning/, { selector: 'button' }));
    expect(screen.getByText('Clean Room')).toBeInTheDocument();
    expect(screen.queryByText('Read Book')).not.toBeInTheDocument();
  });

  it('back button works', async () => {
    const { onBack } = setup();
    await userEvent.click(screen.getByText('← Back'));
    expect(onBack).toHaveBeenCalled();
  });
});
