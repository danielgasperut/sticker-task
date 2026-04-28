import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../../components/TaskForm';
import { getTasks } from '../../store';

describe('TaskForm - Create Mode', () => {
  it('renders create form with empty fields', () => {
    render(<TaskForm task={null} onSave={() => {}} onBack={() => {}} />);
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Clean my room')).toHaveValue('');
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('creates a task on submit', async () => {
    const onSave = vi.fn();
    render(<TaskForm task={null} onSave={onSave} onBack={() => {}} />);
    await userEvent.type(screen.getByPlaceholderText('e.g. Clean my room'), 'Test Task');
    await userEvent.click(screen.getByText('Create Task'));
    expect(onSave).toHaveBeenCalled();
    expect(getTasks()).toHaveLength(1);
    expect(getTasks()[0].title).toBe('Test Task');
  });

  it('does not submit with empty title', async () => {
    const onSave = vi.fn();
    render(<TaskForm task={null} onSave={onSave} onBack={() => {}} />);
    await userEvent.click(screen.getByText('Create Task'));
    expect(onSave).not.toHaveBeenCalled();
    expect(getTasks()).toHaveLength(0);
  });

  it('calls onBack when back is clicked', async () => {
    const onBack = vi.fn();
    render(<TaskForm task={null} onSave={() => {}} onBack={onBack} />);
    await userEvent.click(screen.getByText('← Back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('renders category buttons', () => {
    render(<TaskForm task={null} onSave={() => {}} onBack={() => {}} />);
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Homework')).toBeInTheDocument();
  });

  it('has a sticker cost slider defaulting to 3', () => {
    render(<TaskForm task={null} onSave={() => {}} onBack={() => {}} />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('3');
  });
});

describe('TaskForm - Edit Mode', () => {
  const existingTask = {
    id: 'edit-1',
    title: 'Existing Task',
    description: 'Do something',
    category: 'Homework',
    cost: 5,
    createdAt: 1000,
  };

  it('renders edit form with pre-filled fields', () => {
    render(<TaskForm task={existingTask} onSave={() => {}} onBack={() => {}} />);
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Do something')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('preserves task id and createdAt on save', async () => {
    const onSave = vi.fn();
    render(<TaskForm task={existingTask} onSave={onSave} onBack={() => {}} />);
    await userEvent.click(screen.getByText('Save Changes'));
    const saved = getTasks().find((t) => t.id === 'edit-1');
    expect(saved).toBeDefined();
    expect(saved!.createdAt).toBe(1000);
  });
});
