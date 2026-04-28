import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PickSticker } from '../../components/PickSticker';
import type { Task } from '../../types';
import { saveTask, setEnabledSlots, getStickerAtSlot } from '../../store';

const task: Task = {
  id: 't1', title: 'Homework', description: '', category: 'Homework', cost: 3, createdAt: 0,
};

function setup(enabled: boolean[] = []) {
  saveTask(task);
  if (enabled.length > 0) setEnabledSlots('t1', enabled);
  const onBack = vi.fn();
  const onPicked = vi.fn();
  render(<PickSticker task={task} stickers={[]} onBack={onBack} onPicked={onPicked} />);
  return { onBack, onPicked };
}

describe('PickSticker', () => {
  it('renders task title', () => {
    setup([true, false, false]);
    expect(screen.getByText('Homework')).toBeInTheDocument();
  });

  it('shows sticker library when slots are unlocked', () => {
    setup([true, false, false]);
    expect(screen.getByText('Animals')).toBeInTheDocument();
    expect(screen.getByText('Stars')).toBeInTheDocument();
  });

  it('hides sticker library when no slots are unlocked', () => {
    setup([false, false, false]);
    expect(screen.queryByText('Animals')).not.toBeInTheDocument();
    expect(screen.getByText(/No slots unlocked/)).toBeInTheDocument();
  });

  it('hides sticker library when all slots locked (default)', () => {
    setup();
    expect(screen.queryByText('Animals')).not.toBeInTheDocument();
  });

  it('adds sticker only to unlocked slot', async () => {
    const { onPicked } = setup([false, true, false]);
    const puppy = screen.getByText('Puppy');
    await userEvent.click(puppy);
    expect(onPicked).toHaveBeenCalled();
    expect(getStickerAtSlot('t1', 1)).toBeDefined();
    expect(getStickerAtSlot('t1', 0)).toBeUndefined();
    expect(getStickerAtSlot('t1', 2)).toBeUndefined();
  });

  it('fills unlocked slots in order', async () => {
    const { onPicked } = setup([true, true, false]);
    const puppies = screen.getAllByText('Puppy');
    await userEvent.click(puppies[0]);
    expect(onPicked).toHaveBeenCalledTimes(1);
    expect(getStickerAtSlot('t1', 0)).toBeDefined();
  });

  it('shows lock icons for locked slots', () => {
    setup([true, false, false]);
    const locks = screen.getAllByText('🔒');
    expect(locks.length).toBe(2);
  });

  it('shows sparkle for unlocked empty slots', () => {
    setup([true, false, false]);
    const sparkles = screen.getAllByText('✨');
    expect(sparkles.length).toBe(1);
  });

  it('back button works', async () => {
    const { onBack } = setup([true]);
    await userEvent.click(screen.getByText('← Back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('shows remaining counts', () => {
    setup([true, true, false]);
    expect(screen.getByText(/Pick 2 stickers/)).toBeInTheDocument();
    expect(screen.getByText(/1 slot.* locked/)).toBeInTheDocument();
  });
});
