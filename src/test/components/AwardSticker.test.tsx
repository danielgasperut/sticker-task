import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AwardSticker } from '../../components/AwardSticker';
import type { Task } from '../../types';
import { saveTask, awardSticker, getStickersForTask, getEnabledSlots, getStickerAtSlot } from '../../store';

const task: Task = {
  id: 't1', title: 'Clean Room', description: 'Make bed', category: 'Cleaning', cost: 3, createdAt: 0,
};

function setup() {
  saveTask(task);
  const onBack = vi.fn();
  const onAwarded = vi.fn();
  render(<AwardSticker task={task} stickers={[]} onBack={onBack} onAwarded={onAwarded} />);
  return { onBack, onAwarded };
}

describe('AwardSticker', () => {
  it('renders task title and description', () => {
    setup();
    expect(screen.getByText('Clean Room')).toBeInTheDocument();
    expect(screen.getByText('Make bed')).toBeInTheDocument();
  });

  it('shows sticker category tabs', () => {
    setup();
    expect(screen.getByText('Animals')).toBeInTheDocument();
    expect(screen.getByText('Stars')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('awards a sticker when clicking a sticker from library', async () => {
    const { onAwarded } = setup();
    const puppy = screen.getByText('Puppy');
    await userEvent.click(puppy);
    expect(onAwarded).toHaveBeenCalled();
    expect(getStickersForTask('t1')).toHaveLength(1);
    expect(getStickerAtSlot('t1', 0)).toBeDefined();
  });

  it('renders 3 slot buttons', () => {
    setup();
    const slotButtons = screen.getAllByRole('button').filter(
      (b) => b.className.includes('w-14')
    );
    expect(slotButtons).toHaveLength(3);
  });

  it('toggling slot sets enabled for child', async () => {
    const { onAwarded } = setup();
    const slotButtons = screen.getAllByRole('button').filter(
      (b) => b.className.includes('w-14')
    );
    await userEvent.click(slotButtons[0]);
    expect(onAwarded).toHaveBeenCalled();
    expect(getEnabledSlots('t1')[0]).toBe(true);
  });

  it('clicking a filled sticker removes it', async () => {
    const { onAwarded } = setup();
    awardSticker({ id: 'a1', stickerId: 's-star', taskId: 't1', slotIndex: 0, awardedAt: 0, awardedBy: 'parent' });
    onAwarded.mockClear();
    const { unmount } = render(<AwardSticker task={task} stickers={[]} onBack={() => {}} onAwarded={onAwarded} />);
    const slotButtons = screen.getAllByRole('button').filter((b) => b.className.includes('w-14'));
    await userEvent.click(slotButtons[0]);
    expect(onAwarded).toHaveBeenCalled();
    expect(getStickerAtSlot('t1', 0)).toBeUndefined();
    unmount();
  });

  it('back button works', async () => {
    const { onBack } = setup();
    await userEvent.click(screen.getByText('← Back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('shows remaining sticker count', () => {
    setup();
    expect(screen.getByText(/3 stickers needed/)).toBeInTheDocument();
  });
});
