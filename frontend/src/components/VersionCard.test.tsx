import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VersionCard } from './VersionCard';

describe('VersionCard', () => {
  const mockVersion = {
    version: '1.2.3',
    commit_sha: 'a1b2c3d4e5f6',
    build_time: '2026-11-04T10:00:00Z',
    environment: 'production',
    uptime_seconds: 120,
  };

  it('renders backend provenance data correctly', () => {
    render(
      <VersionCard
        version={mockVersion}
        isHealthy={true}
        isDemo={false}
        lastUpdated={new Date()}
        isLoading={false}
        onRefresh={vi.fn()}
      />
    );

    expect(screen.getByText('v1.2.3')).toBeInTheDocument();
    expect(screen.getByText('a1b2c3d')).toBeInTheDocument();
    expect(screen.getByText('production')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('renders unreachable status and triggers refresh button', () => {
    const handleRefresh = vi.fn();
    render(
      <VersionCard
        version={mockVersion}
        isHealthy={false}
        isDemo={true}
        lastUpdated={null}
        isLoading={false}
        onRefresh={handleRefresh}
      />
    );

    expect(screen.getByText('Unreachable')).toBeInTheDocument();
    const refreshBtn = screen.getByLabelText('Refresh backend status');
    fireEvent.click(refreshBtn);
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });
});
