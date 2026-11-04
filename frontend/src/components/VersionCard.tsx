import React from 'react';
import { Server, RefreshCw, GitCommit, Calendar, Activity, Globe } from 'lucide-react';
import { VersionData } from '../api';
import { StatusBadge } from './StatusBadge';

interface VersionCardProps {
  version: VersionData | null;
  isHealthy: boolean;
  isDemo: boolean;
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const VersionCard: React.FC<VersionCardProps> = ({
  version,
  isHealthy,
  isDemo,
  lastUpdated,
  isLoading,
  onRefresh,
}) => {
  const formatUptime = (seconds?: number): string => {
    if (seconds === undefined) return '0s';
    if (seconds < 60) return `${Math.floor(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const formatBuildTime = (isoString?: string): string => {
    if (!isoString || isoString === 'unknown') return 'Development build';
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? isoString : d.toUTCString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-[#111A2E] border border-[#1F2A44] rounded-lg p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2A44] pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#16223B] border border-[#1F2A44] rounded text-[#22D3EE]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#E6EDF7] tracking-tight">
              Backend Service Provenance
            </h2>
            <p className="text-xs text-[#8FA3C0]">
              Injected live during Docker container build & CI workflow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge
            status={isHealthy ? 'healthy' : 'unreachable'}
            label={isHealthy ? 'Healthy' : 'Unreachable'}
          />
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh backend status (auto-refreshes every 15s)"
            className="p-1.5 text-[#8FA3C0] hover:text-[#22D3EE] hover:bg-[#16223B] border border-[#1F2A44] rounded transition-colors disabled:opacity-50"
            aria-label="Refresh backend status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Version */}
        <div className="bg-[#0B1220] border border-[#1F2A44] rounded p-3">
          <div className="flex items-center gap-1.5 text-xs text-[#8FA3C0] mb-1">
            <Activity className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Semantic Version</span>
          </div>
          <div className="text-lg font-mono font-semibold text-[#E6EDF7] tabular-nums">
            {version ? `v${version.version}` : '—'}
          </div>
          <div className="text-[11px] text-[#8FA3C0] mt-0.5">
            Read from <code className="text-[#22D3EE]">/VERSION</code> file
          </div>
        </div>

        {/* Commit SHA */}
        <div className="bg-[#0B1220] border border-[#1F2A44] rounded p-3">
          <div className="flex items-center gap-1.5 text-xs text-[#8FA3C0] mb-1">
            <GitCommit className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Git Commit SHA</span>
          </div>
          <div className="text-lg font-mono font-semibold text-[#E6EDF7] tracking-wider">
            {version?.commit_sha ? (
              <span title={version.commit_sha}>
                {version.commit_sha.substring(0, 7)}
              </span>
            ) : (
              '—'
            )}
          </div>
          <div className="text-[11px] text-[#8FA3C0] mt-0.5">
            github.sha injected at build
          </div>
        </div>

        {/* Environment */}
        <div className="bg-[#0B1220] border border-[#1F2A44] rounded p-3">
          <div className="flex items-center gap-1.5 text-xs text-[#8FA3C0] mb-1">
            <Globe className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Target Environment</span>
          </div>
          <div className="text-lg font-semibold text-[#E6EDF7] capitalize">
            {version?.environment || '—'}
          </div>
          <div className="text-[11px] text-[#8FA3C0] mt-0.5">
            {isDemo ? 'Running in preview demo' : 'Live deployed instance'}
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-[#0B1220] border border-[#1F2A44] rounded p-3">
          <div className="flex items-center gap-1.5 text-xs text-[#8FA3C0] mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Service Uptime</span>
          </div>
          <div className="text-lg font-mono font-semibold text-[#34D399] tabular-nums">
            {formatUptime(version?.uptime_seconds)}
          </div>
          <div className="text-[11px] text-[#8FA3C0] mt-0.5">
            Elapsed process runtime
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#1F2A44] flex flex-wrap items-center justify-between gap-2 text-xs text-[#8FA3C0]">
        <div>
          <span>Build Timestamp: </span>
          <span className="font-mono text-[#E6EDF7]">
            {formatBuildTime(version?.build_time)}
          </span>
        </div>
        {lastUpdated && (
          <div>
            <span>Polled: </span>
            <span className="font-mono tabular-nums text-[#8FA3C0]">
              {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
