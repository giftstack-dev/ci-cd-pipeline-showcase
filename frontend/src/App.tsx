import React, { useState, useEffect, useCallback } from 'react';
import {
  GitPullRequest,
  ExternalLink,
  ShieldAlert,
  Terminal,
  Activity,
  Layers,
  CheckCircle,
} from 'lucide-react';
import {
  fetchVersion,
  checkBackendHealth,
  fetchDeployments,
  createDeployment,
  VersionData,
  DeploymentRecord,
  DeploymentPayload,
  API_BASE_URL,
} from './api';
import { VersionCard } from './components/VersionCard';
import { DeploymentsTable } from './components/DeploymentsTable';
import { PipelineSteps } from './components/PipelineSteps';

export default function App() {
  const [version, setVersion] = useState<VersionData | null>(null);
  const [isHealthy, setIsHealthy] = useState<boolean>(false);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Frontend build provenance injected via Vite environment variables
  const frontendVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
  const frontendSha = (import.meta.env.VITE_COMMIT_SHA || 'dev-local').substring(0, 7);
  const rawBuildTime = import.meta.env.VITE_BUILD_TIME;
  const frontendBuildDate = rawBuildTime
    ? new Date(rawBuildTime).toISOString().split('T')[0]
    : '2026-11-04';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const healthy = await checkBackendHealth();
      setIsHealthy(healthy);

      const [versionResult, deploymentsResult] = await Promise.all([
        fetchVersion(),
        fetchDeployments(filter),
      ]);

      setVersion(versionResult.data);
      setDeployments(deploymentsResult.data);
      setIsDemo(versionResult.isDemo || deploymentsResult.isDemo);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // Initial load and 15-second polling interval
  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleRecordDeployment = async (payload: DeploymentPayload) => {
    setIsSubmitting(true);
    try {
      const res = await createDeployment(payload);
      // Prepend the new deployment to current list
      setDeployments((prev) => [res.data, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#E6EDF7] flex flex-col font-sans selection:bg-[#22D3EE]/30 selection:text-white">
      {/* Top Fixed Header */}
      <header className="sticky top-0 z-40 bg-[#0B1220]/90 backdrop-blur border-b border-[#1F2A44] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-[#22D3EE] to-blue-600 flex items-center justify-center text-[#0B1220] font-bold text-sm shadow">
            CI
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base text-[#E6EDF7] tracking-tight whitespace-nowrap">
              Pipeline Dashboard
            </span>
            <span className="text-[#8FA3C0] text-xs hidden sm:inline">·</span>
            <span className="text-xs text-[#8FA3C0] hidden sm:inline font-mono">
              ci-cd-pipeline-showcase
            </span>
          </div>
        </div>

        {/* Navigation & Repository Links */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-5 text-xs font-medium text-[#8FA3C0]">
            <a
              href="#provenance"
              className="hover:text-[#E6EDF7] transition-colors whitespace-nowrap"
            >
              Provenance
            </a>
            <a
              href="#pipeline"
              className="hover:text-[#E6EDF7] transition-colors whitespace-nowrap"
            >
              Stages
            </a>
            <a
              href="#deployments"
              className="hover:text-[#E6EDF7] transition-colors whitespace-nowrap"
            >
              Deployments
            </a>
          </div>

          <a
            href="https://github.com/giftstack-dev/ci-cd-pipeline-showcase"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-[#111A2E] hover:bg-[#16223B] text-[#E6EDF7] border border-[#1F2A44] transition-colors whitespace-nowrap"
          >
            <GitPullRequest className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3 text-[#8FA3C0]" />
          </a>
        </div>
      </header>

      {/* Demo Mode Notice Banner if backend is not reached */}
      {isDemo && (
        <div className="bg-[#111A2E] border-b border-[#FBBF24]/20 px-4 py-2 text-xs text-[#FBBF24] flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-[#FBBF24]" />
              <span>
                <strong>Demo mode: backend not connected.</strong> Showing verified mock pipeline provenance and in-memory deployment records. Target API:{' '}
                <code className="font-mono bg-[#0B1220] px-1 py-0.5 rounded text-[#22D3EE]">
                  {API_BASE_URL}
                </code>
              </span>
            </div>
            <span className="hidden md:inline text-[11px] text-[#8FA3C0]">
              Automated fallback active
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Intro Hero / Architecture Badge */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#111A2E] border border-[#1F2A44] rounded-lg">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#22D3EE] mb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>PRODUCTION-READY GITHUB ACTIONS WORKFLOWS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#E6EDF7] tracking-tight">
              Automated CI/CD Delivery Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-[#8FA3C0] mt-1 max-w-2xl">
              End-to-end continuous delivery pipeline showcasing multi-runtime validation,
              container scanning with Trivy, GHCR publishing, and verified multi-environment promotion.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3 py-2 bg-[#0B1220] border border-[#1F2A44] rounded text-left">
              <div className="text-[10px] text-[#8FA3C0]">Branch Protection</div>
              <div className="text-xs font-semibold text-[#34D399] flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3 h-3" />
                <span>ci-success required</span>
              </div>
            </div>
            <div className="px-3 py-2 bg-[#0B1220] border border-[#1F2A44] rounded text-left">
              <div className="text-[10px] text-[#8FA3C0]">Promotion Gate</div>
              <div className="text-xs font-semibold text-[#22D3EE] flex items-center gap-1 mt-0.5">
                <Layers className="w-3 h-3" />
                <span>Production Approval</span>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Pipeline Stages */}
        <section id="pipeline" aria-label="Pipeline Stages">
          <PipelineSteps />
        </section>

        {/* Backend Provenance & Health Card */}
        <section id="provenance" aria-label="Backend Provenance">
          <VersionCard
            version={version}
            isHealthy={isHealthy}
            isDemo={isDemo}
            lastUpdated={lastUpdated}
            isLoading={isLoading}
            onRefresh={loadData}
          />
        </section>

        {/* Deployment History Audit Table */}
        <section id="deployments" aria-label="Deployment Audit">
          <DeploymentsTable
            deployments={deployments}
            activeFilter={filter}
            onFilterChange={(newFilter) => setFilter(newFilter)}
            onRecordDeployment={handleRecordDeployment}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            isDemo={isDemo}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1F2A44] bg-[#0B1220] py-6 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-[#8FA3C0]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#22D3EE]" />
            <span>
              Frontend v{frontendVersion} · <span className="font-mono text-[#E6EDF7]">{frontendSha}</span> · built {frontendBuildDate}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>MIT License © 2026 Eseoghene Gift-Asisisi</span>
            <span>·</span>
            <a
              href="https://github.com/giftstack-dev/ci-cd-pipeline-showcase"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#22D3EE] hover:underline inline-flex items-center gap-1"
            >
              <span>View Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
