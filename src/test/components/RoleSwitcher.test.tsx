import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoleSwitcher } from '../../components/RoleSwitcher';

describe('RoleSwitcher', () => {
  it('renders parent and child buttons', () => {
    render(<RoleSwitcher role="parent" activeChild={null} parentPin="4321" onSwitch={() => {}} onLogout={() => {}} />);
    expect(screen.getByText(/Parent/)).toBeInTheDocument();
    expect(screen.getByText(/Child/)).toBeInTheDocument();
  });

  it('switches to child without password', async () => {
    const onSwitch = vi.fn();
    render(<RoleSwitcher role="parent" activeChild={null} parentPin="4321" onSwitch={onSwitch} onLogout={() => {}} />);
    await userEvent.click(screen.getByText(/Child/));
    expect(onSwitch).toHaveBeenCalledWith('child');
  });

  it('shows PIN prompt when switching to parent', async () => {
    render(<RoleSwitcher role="child" activeChild={null} parentPin="4321" onSwitch={() => {}} onLogout={() => {}} />);
    await userEvent.click(screen.getByText(/Parent/));
    expect(screen.getByText('Parent Mode')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••')).toBeInTheDocument();
  });

  it('rejects wrong PIN', async () => {
    render(<RoleSwitcher role="child" activeChild={null} parentPin="4321" onSwitch={() => {}} onLogout={() => {}} />);
    await userEvent.click(screen.getByText(/Parent/));
    await userEvent.type(screen.getByPlaceholderText('••••'), '0000');
    await userEvent.click(screen.getByText('Unlock'));
    expect(screen.getByText('Wrong PIN, try again')).toBeInTheDocument();
  });

  it('accepts correct PIN 4321', async () => {
    const onSwitch = vi.fn();
    render(<RoleSwitcher role="child" activeChild={null} parentPin="4321" onSwitch={onSwitch} onLogout={() => {}} />);
    await userEvent.click(screen.getByText(/Parent/));
    await userEvent.type(screen.getByPlaceholderText('••••'), '4321');
    await userEvent.click(screen.getByText('Unlock'));
    expect(onSwitch).toHaveBeenCalledWith('parent');
  });

  it('cancel dismisses the PIN prompt', async () => {
    render(<RoleSwitcher role="child" activeChild={null} parentPin="4321" onSwitch={() => {}} onLogout={() => {}} />);
    await userEvent.click(screen.getByText(/Parent/));
    expect(screen.getByText('Parent Mode')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Parent Mode')).not.toBeInTheDocument();
  });

  it('does not show prompt when already in parent mode', async () => {
    render(<RoleSwitcher role="parent" activeChild={null} parentPin="4321" onSwitch={() => {}} onLogout={() => {}} />);
    await userEvent.click(screen.getByText(/Parent/));
    expect(screen.queryByText('Parent Mode')).not.toBeInTheDocument();
  });

  it('only allows numeric input in PIN field', async () => {
    render(<RoleSwitcher role="child" activeChild={null} parentPin="4321" onSwitch={() => {}} onLogout={() => {}} />);
    await userEvent.click(screen.getByText(/Parent/));
    const input = screen.getByPlaceholderText('••••');
    await userEvent.type(input, 'abcd');
    expect(input).toHaveValue('');
    await userEvent.type(input, '12ab34');
    expect(input).toHaveValue('1234');
  });
});
