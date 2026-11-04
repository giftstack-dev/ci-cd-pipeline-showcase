import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PipelineSteps } from './PipelineSteps';

describe('PipelineSteps', () => {
  it('renders all 7 automated pipeline stages', () => {
    render(<PipelineSteps />);

    expect(screen.getByText('Lint & Format')).toBeInTheDocument();
    expect(screen.getByText('Test & Coverage')).toBeInTheDocument();
    expect(screen.getByText('Security Audit')).toBeInTheDocument();
    expect(screen.getByText('Build Container')).toBeInTheDocument();
    expect(screen.getByText('Deploy Staging')).toBeInTheDocument();
    expect(screen.getByText('Production Gate')).toBeInTheDocument();
    expect(screen.getByText('Deploy Production')).toBeInTheDocument();
  });
});
