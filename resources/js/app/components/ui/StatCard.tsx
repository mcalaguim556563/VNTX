import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  accent?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  accent = '#00C8F8',
  className = '',
}) => {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-4
        bg-[#0A1628] border border-[#1E3A5C]
        hover:border-[#00C8F8]/40 transition-all duration-300
        group ${className}
      `}
    >
      {/* Subtle glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
        style={{ background: `radial-gradient(circle at 100% 0%, ${accent}10 0%, transparent 60%)` }}
      />

      <div className="relative flex items-center justify-between gap-3">
        {/* Icon */}
        <div
          className="p-2.5 rounded-xl shrink-0"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          {icon}
        </div>

        {/* Right: number + label + trend */}
        <div className="flex-1 text-right">
          <p className="text-3xl font-black text-white tabular-nums leading-none">{value}</p>
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mt-1">{title}</p>
          {trend && (
            <div className="flex items-center justify-end gap-1 text-xs mt-1">
              {trend.direction === 'up'      && <TrendingUp   size={11} className="text-emerald-400" />}
              {trend.direction === 'down'    && <TrendingDown size={11} className="text-red-400" />}
              {trend.direction === 'neutral' && <Minus        size={11} className="text-[#64748B]" />}
              <span className={
                trend.direction === 'up'   ? 'text-emerald-400' :
                trend.direction === 'down' ? 'text-red-400' :
                'text-[#64748B]'
              }>
                {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}{Math.abs(trend.value)}
              </span>
              <span className="text-[#64748B]">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
    <div className="p-4 rounded-2xl bg-[#0D1F3C] text-[#1E3A5C]">
      {icon}
    </div>
    <div className="space-y-1">
      <p className="text-base font-semibold text-[#94A3B8]">{title}</p>
      {description && <p className="text-sm text-[#64748B]">{description}</p>}
    </div>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <div className={`flex items-center justify-center ${className}`}>
    <svg
      className="animate-spin text-[#00C8F8]"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  </div>
);
