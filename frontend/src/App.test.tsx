import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as api from './api';

describe('App Dashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders top brand bar and GitHub repository link', async () => {
    vi.spyOn(api, 'checkBackendHealth').mockResolvedValue(true);
    vi.spyOn(api, 'fetchVersion').mockResolvedValue({
      data: {
        version: '1.0.0',
        commit_sha: '1234567890ab',
        build_time: '2026-11-04T00:00:00Z',
        environment: 'staging',
        uptime_seconds: 50,
      },
      isDemo: false,
    });
    vi.spyOn(api, 'fetchDeployments').mockResolvedValue({
      data: [],
      isDemo: false,
    });

    render(<App />);

    expect(screen.getByText('Pipeline Dashboard')).toBeInTheDocument();
    expect(screen.getByText('GitHub Repository')).toBeInTheDocument();
  });

  it('displays demo mode banner when backend is not connected', async () => {
    vi.spyOn(api, 'checkBackendHealth').mockResolvedValue(false);
    vi.spyOn(api, 'fetchVersion').mockResolvedValue({
      data: {
        version: '1.0.0',
        commit_sha: '7f9c2d1',
        build_time: '2026-11-04T08:30:00Z',
        environment: 'production',
        uptime_seconds: 3840,
      },
      isDemo: true,
    });
    vi.spyOn(api, 'fetchDeployments').mockResolvedValue({
      data: [],
      isDemo: true,
    });

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/Demo mode: backend not connected/)
      ).toBeInTheDocument();
    });
  });

  it('renders footer with frontend build provenance', async () => {
    render(<App />);
    expect(screen.getByText(/Frontend v/)).toBeInTheDocument();
  });
});
