import React from 'react';

// ── Types ────────────────────────────────────────────────────────────────────
export type MatchStatus =
  | 'live' | 'scheduled' | 'completed' | 'postponed' | 'cancelled'
  | 'Live' | 'Scheduled' | 'Completed' | 'Postponed' | 'Cancelled';

export type TournamentStatus = 'Draft' | 'Upcoming' | 'In Progress' | 'Completed';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'cyan' | 'purple';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  /** @deprecated - dots removed for cleaner minimal look */
  dot?: boolean;
  /** @deprecated - dots removed for cleaner minimal look */
  pulse?: boolean;
}

// Clean pill badges — no bullet dots, no pulse, just text + subtle border
const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  success: { background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' },
  warning: { background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.25)' },
  error:   { background: 'rgba(239,68,68,0.12)',  color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)'  },
  info:    { background: 'rgba(0,200,248,0.10)',  color: '#00C8F8', border: '1px solid rgba(0,200,248,0.25)'  },
  cyan:    { background: 'rgba(0,200,248,0.10)',  color: '#00C8F8', border: '1px solid rgba(0,200,248,0.25)'  },
  purple:  { background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' },
  default: { background: 'rgba(30,58,92,0.60)',   color: '#94A3B8', border: '1px solid #2A4E7A'               },
};

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: { padding: '2px 8px',  fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' },
  md: { padding: '4px 10px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em' },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => (
  <span
    className={className}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: '6px',        // pill → slight rect — cleaner look
      fontFamily: 'inherit',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      ...variantStyles[variant],
      ...sizeStyles[size],
    }}
  >
    {children}
  </span>
);

// ── Tournament Status Badge ───────────────────────────────────────────────────
const TOURNAMENT_CFG: Record<string, BadgeVariant> = {
  'Draft':       'default',
  'Upcoming':    'info',
  'In Progress': 'success',
  'Completed':   'purple',
};

export const TournamentStatusBadge: React.FC<{ status: TournamentStatus | string }> = ({ status }) => (
  <Badge variant={TOURNAMENT_CFG[status] ?? 'default'}>{status}</Badge>
);

// ── Match Status Badge ────────────────────────────────────────────────────────
const MATCH_CFG: Record<string, { variant: BadgeVariant; label: string }> = {
  'scheduled': { variant: 'info',    label: 'Scheduled' },
  'live':      { variant: 'success', label: 'Live'      },
  'completed': { variant: 'cyan',    label: 'Completed' },
  'postponed': { variant: 'warning', label: 'Postponed' },
  'cancelled': { variant: 'error',   label: 'Cancelled' },
};

export const MatchStatusBadge: React.FC<{ status: MatchStatus | string }> = ({ status }) => {
  const key = (status ?? '').toLowerCase();
  const cfg = MATCH_CFG[key] ?? { variant: 'default' as BadgeVariant, label: status ?? 'Unknown' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};
