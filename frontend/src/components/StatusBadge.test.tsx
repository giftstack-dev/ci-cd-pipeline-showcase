import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders healthy status with check icon and label', () => {
    render(<StatusBadge status="healthy" />);
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('renders unreachable status with danger styling', () => {
    render(<StatusBadge status="unreachable" />);
    expect(screen.getByText('Unreachable')).toBeInTheDocument();
  });

  it('renders custom label when provided', () => {
    render(<StatusBadge status="success" label="Passed All Checks" />);
    expect(screen.getByText('Passed All Checks')).toBeInTheDocument();
  });
});
