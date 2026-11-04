import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeploymentsTable } from './DeploymentsTable';
import { DeploymentRecord } from '../api';

describe('DeploymentsTable', () => {
  const mockDeployments: DeploymentRecord[] = [
    {
      id: 'dep-1',
      version: '1.0.0',
      environment: 'production',
      status: 'success',
      deployed_at: '2026-11-04T08:00:00Z',
      duration_seconds: 70,
    },
    {
      id: 'dep-2',
      version: '0.9.0',
      environment: 'staging',
      status: 'failed',
      deployed_at: '2026-11-03T08:00:00Z',
      duration_seconds: 40,
    },
  ];

  it('renders deployment records and column headers', () => {
    render(
      <DeploymentsTable
        deployments={mockDeployments}
        activeFilter="all"
        onFilterChange={vi.fn()}
        onRecordDeployment={vi.fn()}
        isLoading={false}
        isSubmitting={false}
        isDemo={false}
      />
    );

    expect(screen.getByText('dep-1')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('dep-2')).toBeInTheDocument();
    expect(screen.getByText('v0.9.0')).toBeInTheDocument();
  });

  it('handles filter selection', () => {
    const handleFilterChange = vi.fn();
    render(
      <DeploymentsTable
        deployments={mockDeployments}
        activeFilter="all"
        onFilterChange={handleFilterChange}
        onRecordDeployment={vi.fn()}
        isLoading={false}
        isSubmitting={false}
        isDemo={false}
      />
    );

    const successFilterBtn = screen.getByText('Success');
    fireEvent.click(successFilterBtn);
    expect(handleFilterChange).toHaveBeenCalledWith('success');
  });

  it('shows validation error when submitting invalid semantic version', async () => {
    const handleRecord = vi.fn();
    render(
      <DeploymentsTable
        deployments={mockDeployments}
        activeFilter="all"
        onFilterChange={vi.fn()}
        onRecordDeployment={handleRecord}
        isLoading={false}
        isSubmitting={false}
        isDemo={false}
      />
    );

    // Open form
    const openFormBtn = screen.getByText('Record Deployment');
    fireEvent.click(openFormBtn);

    // Submit invalid version
    const input = screen.getByPlaceholderText(/e.g. 1.1.0/);
    fireEvent.change(input, { target: { value: 'invalid-semver' } });

    const submitBtn = screen.getByText('Submit Deployment');
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Version must be a valid SemVer format/)
    ).toBeInTheDocument();
    expect(handleRecord).not.toHaveBeenCalled();
  });

  it('submits valid semantic version payload', async () => {
    const handleRecord = vi.fn().mockResolvedValue(undefined);
    render(
      <DeploymentsTable
        deployments={mockDeployments}
        activeFilter="all"
        onFilterChange={vi.fn()}
        onRecordDeployment={handleRecord}
        isLoading={false}
        isSubmitting={false}
        isDemo={false}
      />
    );

    const openFormBtn = screen.getByText('Record Deployment');
    fireEvent.click(openFormBtn);

    const input = screen.getByPlaceholderText(/e.g. 1.1.0/);
    fireEvent.change(input, { target: { value: '1.2.0' } });

    const submitBtn = screen.getByText('Submit Deployment');
    fireEvent.click(submitBtn);

    expect(handleRecord).toHaveBeenCalledWith({
      version: '1.2.0',
      environment: 'staging',
    });
  });
});
