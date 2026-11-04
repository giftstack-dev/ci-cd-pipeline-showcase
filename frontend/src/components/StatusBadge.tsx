import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'failed' | 'in_progress' | 'pending' | 'healthy' | 'unreachable';
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'success':
    case 'healthy':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-[#34D399]/30 bg-[#34D399]/10 text-[#34D399] ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label || (normalized === 'healthy' ? 'Healthy' : 'Success')}</span>
        </span>
      );

    case 'failed':
    case 'unreachable':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-[#F87171]/30 bg-[#F87171]/10 text-[#F87171] ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label || (normalized === 'unreachable' ? 'Unreachable' : 'Failed')}</span>
        </span>
      );

    case 'in_progress':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-[#22D3EE]/30 bg-[#22D3EE]/10 text-[#22D3EE] ${className}`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0 animate-spin" aria-hidden="true" />
          <span>{label || 'In Progress'}</span>
        </span>
      );

    case 'pending':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24] ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{label || 'Pending'}</span>
        </span>
      );
  }
};
