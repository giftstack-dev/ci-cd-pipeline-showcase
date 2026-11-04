import React from 'react';
import {
  FileCheck2,
  TestTube2,
  ShieldCheck,
  Container,
  Layers,
  UserCheck,
  Rocket,
  ArrowRight,
} from 'lucide-react';

interface Step {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  workflow: string;
}

const STEPS: Step[] = [
  {
    id: 'lint',
    name: 'Lint & Format',
    description: 'Ruff, ESLint & Actionlint',
    icon: FileCheck2,
    workflow: 'ci.yml',
  },
  {
    id: 'test',
    name: 'Test & Coverage',
    description: 'Pytest 3.11/3.12 + Vitest (≥85%)',
    icon: TestTube2,
    workflow: 'ci.yml',
  },
  {
    id: 'security',
    name: 'Security Audit',
    description: 'CodeQL, Gitleaks, Pip & Npm audit',
    icon: ShieldCheck,
    workflow: 'security.yml',
  },
  {
    id: 'build',
    name: 'Build Container',
    description: 'Docker Buildx, Trivy scan, GHCR',
    icon: Container,
    workflow: 'build-and-deploy.yml',
  },
  {
    id: 'staging',
    name: 'Deploy Staging',
    description: 'GitHub Pages + Render staging hook',
    icon: Layers,
    workflow: 'build-and-deploy.yml',
  },
  {
    id: 'approve',
    name: 'Production Gate',
    description: 'Environment review & sign-off',
    icon: UserCheck,
    workflow: 'release.yml',
  },
  {
    id: 'production',
    name: 'Deploy Production',
    description: 'Zero-downtime promote & verify',
    icon: Rocket,
    workflow: 'release.yml',
  },
];

export const PipelineSteps: React.FC = () => {
  return (
    <div className="bg-[#111A2E] border border-[#1F2A44] rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#E6EDF7] tracking-tight">
            Automated Pipeline Stages
          </h2>
          <p className="text-xs text-[#8FA3C0]">
            Deterministic progression from pull request to verified production release
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#8FA3C0] bg-[#16223B] px-2.5 py-1 rounded border border-[#1F2A44]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
          <span>7 Automated Gates</span>
        </div>
      </div>

      <div className="relative">
        {/* Horizontal scroll container for smaller screens */}
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex items-center justify-between min-w-[760px] gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === STEPS.length - 1;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex-1 min-w-[95px] bg-[#0B1220] border border-[#1F2A44] rounded p-2.5 hover:border-[#22D3EE]/50 transition-colors group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-7 h-7 rounded bg-[#16223B] text-[#22D3EE] group-hover:text-white group-hover:bg-[#22D3EE]/20 transition-colors flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-[#8FA3C0]">
                        0{index + 1}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-[#E6EDF7] truncate">
                      {step.name}
                    </div>
                    <div className="text-[10px] text-[#8FA3C0] mt-0.5 line-clamp-1" title={step.description}>
                      {step.description}
                    </div>
                  </div>

                  {!isLast && (
                    <div className="shrink-0 text-[#8FA3C0]/40 px-0.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
