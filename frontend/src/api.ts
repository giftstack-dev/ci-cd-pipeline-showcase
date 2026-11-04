/**
 * API client with automatic Demo Mode fallback when backend is unavailable.
 */

export interface VersionData {
  version: string;
  commit_sha: string;
  build_time: string;
  environment: string;
  uptime_seconds: number;
}

export interface DeploymentRecord {
  id: string;
  version: string;
  environment: 'staging' | 'production';
  status: 'success' | 'failed' | 'in_progress' | 'pending';
  deployed_at: string;
  duration_seconds: number;
}

export interface DeploymentPayload {
  version: string;
  environment: 'staging' | 'production';
}

const RAW_API_URL = import.meta.env.VITE_API_URL;
export const API_BASE_URL = (RAW_API_URL !== undefined && RAW_API_URL.trim() !== '')
  ? RAW_API_URL.trim().replace(/\/+$/, '')
  : 'http://localhost:8000';

// In-memory demo state for when backend is unreachable (e.g., AI Studio preview, standalone GitHub Pages)
let demoDeployments: DeploymentRecord[] = [
  {
    id: 'dep-982a',
    version: '1.0.0',
    environment: 'production',
    status: 'success',
    deployed_at: '2026-11-04T08:30:00Z',
    duration_seconds: 78,
  },
  {
    id: 'dep-761c',
    version: '1.0.0-rc.2',
    environment: 'staging',
    status: 'success',
    deployed_at: '2026-11-04T07:15:00Z',
    duration_seconds: 64,
  },
  {
    id: 'dep-654d',
    version: '0.9.4',
    environment: 'production',
    status: 'success',
    deployed_at: '2026-11-02T14:22:00Z',
    duration_seconds: 82,
  },
  {
    id: 'dep-532e',
    version: '0.9.4-rc.1',
    environment: 'staging',
    status: 'failed',
    deployed_at: '2026-11-02T13:40:00Z',
    duration_seconds: 45,
  },
  {
    id: 'dep-411f',
    version: '0.9.3',
    environment: 'production',
    status: 'success',
    deployed_at: '2026-10-28T10:00:00Z',
    duration_seconds: 71,
  },
];

const demoVersion: VersionData = {
  version: '1.0.0',
  commit_sha: '7f9c2d1e8',
  build_time: '2026-11-04T08:30:00Z',
  environment: 'production',
  uptime_seconds: 3840,
};

/**
 * Check if the backend /health endpoint responds.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch version provenance from backend or fallback to demo data.
 */
export async function fetchVersion(): Promise<{ data: VersionData; isDemo: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE_URL}/version`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { data, isDemo: false };
  } catch {
    return { data: demoVersion, isDemo: true };
  }
}

/**
 * Fetch deployments with optional status filter.
 */
export async function fetchDeployments(
  statusFilter?: string
): Promise<{ data: DeploymentRecord[]; isDemo: boolean }> {
  const query = statusFilter && statusFilter !== 'all' ? `?status=${encodeURIComponent(statusFilter)}` : '';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE_URL}/deployments${query}`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return { data, isDemo: false };
  } catch {
    let filtered = [...demoDeployments];
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(
        (d) => d.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    return { data: filtered, isDemo: true };
  }
}

/**
 * Record a new deployment via backend POST or fallback in-memory creation.
 */
export async function createDeployment(
  payload: DeploymentPayload
): Promise<{ data: DeploymentRecord; isDemo: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_BASE_URL}/deployments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail?.[0]?.msg || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return { data, isDemo: false };
  } catch (err: unknown) {
    // If it was a network error / failed to fetch, simulate demo mode creation
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('HTTP 422') || message.includes('is not valid')) {
      throw err;
    }
    const mockRecord: DeploymentRecord = {
      id: `dep-${Math.random().toString(36).substring(2, 7)}`,
      version: payload.version,
      environment: payload.environment,
      status: 'success',
      deployed_at: new Date().toISOString(),
      duration_seconds: 52,
    };
    demoDeployments = [mockRecord, ...demoDeployments];
    return { data: mockRecord, isDemo: true };
  }
}
