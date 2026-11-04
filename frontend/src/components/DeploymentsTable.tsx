import React, { useState } from 'react';
import {
  Rocket,
  Filter,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DeploymentRecord, DeploymentPayload } from '../api';
import { StatusBadge } from './StatusBadge';

interface DeploymentsTableProps {
  deployments: DeploymentRecord[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onRecordDeployment: (payload: DeploymentPayload) => Promise<void>;
  isLoading: boolean;
  isSubmitting: boolean;
  isDemo: boolean;
}

const SEMVER_REGEX = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export const DeploymentsTable: React.FC<DeploymentsTableProps> = ({
  deployments,
  activeFilter,
  onFilterChange,
  onRecordDeployment,
  isLoading,
  isSubmitting,
  isDemo,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [version, setVersion] = useState('');
  const [environment, setEnvironment] = useState<'staging' | 'production'>('staging');
  const [formError, setFormError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const filterOptions = [
    { id: 'all', label: 'All Deployments' },
    { id: 'success', label: 'Success' },
    { id: 'failed', label: 'Failed' },
    { id: 'in_progress', label: 'In Progress' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessNotice(null);

    const trimmedVersion = version.trim();
    if (!trimmedVersion) {
      setFormError('Semantic version is required.');
      return;
    }

    if (!SEMVER_REGEX.test(trimmedVersion)) {
      setFormError('Version must be a valid SemVer format (e.g. 1.2.0 or 2.0.0-rc.1).');
      return;
    }

    try {
      await onRecordDeployment({
        version: trimmedVersion,
        environment,
      });
      setSuccessNotice(`Deployment ${trimmedVersion} recorded for ${environment}.`);
      setVersion('');
      setShowForm(false);
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to record deployment.');
    }
  };

  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? isoString : d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-[#111A2E] border border-[#1F2A44] rounded-lg p-5 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2A44] pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#E6EDF7] tracking-tight">
              Deployment History
            </h2>
            <span className="text-xs font-mono text-[#8FA3C0] tabular-nums">
              ({deployments.length} records)
            </span>
          </div>
          <p className="text-xs text-[#8FA3C0] mt-0.5">
            Audit log of pipeline releases across environments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segmented Filter */}
          <div className="flex items-center p-0.5 bg-[#0B1220] border border-[#1F2A44] rounded">
            <Filter className="w-3.5 h-3.5 text-[#8FA3C0] ml-2 mr-1 shrink-0" aria-hidden="true" />
            {filterOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onFilterChange(opt.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  activeFilter === opt.id
                    ? 'bg-[#1F2A44] text-[#22D3EE] shadow-sm'
                    : 'text-[#8FA3C0] hover:text-[#E6EDF7]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Trigger Deployment Action */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0B1220] bg-[#22D3EE] hover:bg-[#06B6D4] rounded transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Deployment</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="mb-4 p-3 bg-[#34D399]/10 border border-[#34D399]/30 rounded text-xs text-[#34D399] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-[#34D399] hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Record Deployment Form Modal / Inline Box */}
      {showForm && (
        <div className="mb-5 p-4 bg-[#0B1220] border border-[#22D3EE]/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-[#22D3EE]" />
              <h3 className="text-sm font-semibold text-[#E6EDF7]">
                Record New Pipeline Deployment
              </h3>
            </div>
            {isDemo && (
              <span className="text-[11px] text-[#FBBF24] bg-[#FBBF24]/10 border border-[#FBBF24]/20 px-2 py-0.5 rounded">
                Simulated in Demo Mode
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#8FA3C0] mb-1">
                  Semantic Version <span className="text-[#F87171]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1.1.0 or 2.0.0-rc.1"
                  value={version}
                  onChange={(e) => {
                    setVersion(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-[#111A2E] border border-[#1F2A44] rounded text-[#E6EDF7] placeholder-[#8FA3C0]/50 focus:outline-none focus:border-[#22D3EE] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8FA3C0] mb-1">
                  Target Environment <span className="text-[#F87171]">*</span>
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as 'staging' | 'production')}
                  className="w-full px-3 py-1.5 text-xs bg-[#111A2E] border border-[#1F2A44] rounded text-[#E6EDF7] focus:outline-none focus:border-[#22D3EE]"
                >
                  <option value="staging">staging</option>
                  <option value="production">production</option>
                </select>
              </div>
            </div>

            {formError && (
              <div className="p-2 bg-[#F87171]/10 border border-[#F87171]/30 rounded text-xs text-[#F87171] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormError(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-[#8FA3C0] hover:text-[#E6EDF7] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-[#0B1220] bg-[#22D3EE] hover:bg-[#06B6D4] disabled:opacity-50 rounded transition-colors font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Submit Deployment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1F2A44] text-[#8FA3C0]">
              <th className="py-2.5 px-3 font-medium">Deployment ID</th>
              <th className="py-2.5 px-3 font-medium">Version</th>
              <th className="py-2.5 px-3 font-medium">Environment</th>
              <th className="py-2.5 px-3 font-medium">Status</th>
              <th className="py-2.5 px-3 font-medium">Deployed At</th>
              <th className="py-2.5 px-3 font-medium text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F2A44]/60">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#8FA3C0]">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#22D3EE]" />
                  <span>Loading deployment records...</span>
                </td>
              </tr>
            ) : deployments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#8FA3C0]">
                  <HelpCircle className="w-5 h-5 mx-auto mb-2 text-[#8FA3C0]" />
                  <p className="font-medium text-[#E6EDF7]">No deployments match the filter</p>
                  <p className="text-[11px] mt-0.5">
                    Try selecting &quot;All Deployments&quot; or recording a new deployment.
                  </p>
                </td>
              </tr>
            ) : (
              deployments.map((dep) => (
                <tr
                  key={dep.id}
                  className="hover:bg-[#16223B]/50 transition-colors group"
                >
                  <td className="py-3 px-3 font-mono font-medium text-[#22D3EE] whitespace-nowrap">
                    {dep.id}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#E6EDF7] font-semibold whitespace-nowrap">
                    v{dep.version}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wider ${
                        dep.environment === 'production'
                          ? 'bg-purple-900/30 text-purple-300 border border-purple-800/40'
                          : 'bg-blue-900/30 text-blue-300 border border-blue-800/40'
                      }`}
                    >
                      {dep.environment}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={dep.status} />
                  </td>
                  <td className="py-3 px-3 text-[#8FA3C0] font-mono tabular-nums whitespace-nowrap">
                    {formatDate(dep.deployed_at)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#8FA3C0] whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#8FA3C0]" />
                      <span>{dep.duration_seconds}s</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
