import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManageCategories } from '../../components/ManageCategories';
import { getCategories } from '../../store';

describe('ManageCategories', () => {
  it('renders heading', () => {
    render(<ManageCategories onBack={() => {}} onRefresh={() => {}} />);
    expect(screen.getByText('Manage Categories')).toBeInTheDocument();
  });

  it('shows default categories', () => {
    render(<ManageCategories onBack={() => {}} onRefresh={() => {}} />);
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Homework')).toBeInTheDocument();
  });

  it('adds a new category', async () => {
    const onRefresh = vi.fn();
    render(<ManageCategories onBack={() => {}} onRefresh={onRefresh} />);
    await userEvent.type(screen.getByPlaceholderText('Category name...'), 'Swimming');
    await userEvent.click(screen.getByText('Add'));
    expect(onRefresh).toHaveBeenCalled();
    expect(getCategories().find((c) => c.name === 'Swimming')).toBeDefined();
  });

  it('deletes a category with confirmation', async () => {
    const onRefresh = vi.fn();
    render(<ManageCategories onBack={() => {}} onRefresh={onRefresh} />);
    const deleteBtns = screen.getAllByText('🗑️');
    await userEvent.click(deleteBtns[0]);
    expect(screen.getByText('Confirm?')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Confirm?'));
    expect(onRefresh).toHaveBeenCalled();
  });

  it('back button works', async () => {
    const onBack = vi.fn();
    render(<ManageCategories onBack={onBack} onRefresh={() => {}} />);
    await userEvent.click(screen.getByText('← Back'));
    expect(onBack).toHaveBeenCalled();
  });
});
