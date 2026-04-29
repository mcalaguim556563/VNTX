import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

// Consistent padding standards across the whole app:
//   sm  → px-3   py-2    (small actions, table rows)
//   md  → px-5   py-2.5  (default — forms, modals, toolbar)
//   lg  → px-7   py-3    (primary CTA, hero)
const sizeMap: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '7px 12px',  fontSize: '11px', gap: '6px'  },
  md: { padding: '9px 18px',  fontSize: '13px', gap: '7px'  },
  lg: { padding: '12px 28px', fontSize: '14px', gap: '8px'  },
};

const variantMap: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: '#00C8F8',
    color: '#050B1A',
    fontWeight: 600,
    border: 'none',
    boxShadow: '0 4px 16px rgba(0,200,248,0.25)',
  },
  secondary: {
    background: '#1E3A5C',
    color: '#fff',
    fontWeight: 500,
    border: '1px solid #2A4E7A',
  },
  danger: {
    background: '#EF4444',
    color: '#fff',
    fontWeight: 600,
    border: 'none',
    boxShadow: '0 4px 14px rgba(239,68,68,0.25)',
  },
  ghost: {
    background: 'transparent',
    color: '#94A3B8',
    fontWeight: 500,
    border: 'none',
  },
  outline: {
    background: 'transparent',
    color: '#94A3B8',
    fontWeight: 500,
    border: '1px solid #1E3A5C',
  },
};

const hoverMap: Record<ButtonVariant, Partial<React.CSSProperties>> = {
  primary:   { background: '#00B0D8', boxShadow: '0 6px 20px rgba(0,200,248,0.35)', transform: 'translateY(-1px)' },
  secondary: { background: '#2A4E7A', borderColor: '#00C8F8' },
  danger:    { background: '#DC2626' },
  ghost:     { background: '#0D1F3C', color: '#fff' },
  outline:   { borderColor: '#00C8F8', color: '#fff', background: 'rgba(0,200,248,0.06)' },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const base = variantMap[variant];
  const sz   = sizeMap[size];

  return (
    <button
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        padding: sz.padding,
        fontSize: sz.fontSize,
        fontFamily: 'inherit',
        fontWeight: base.fontWeight ?? 500,
        borderRadius: '8px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        width: fullWidth ? '100%' : undefined,
        outline: 'none',
        whiteSpace: 'nowrap',
        ...base,
        ...style,
      }}
      className={className}
      onMouseEnter={e => {
        if (!isDisabled) {
          const h = hoverMap[variant];
          Object.assign(e.currentTarget.style, h);
        }
      }}
      onMouseLeave={e => {
        if (!isDisabled) {
          Object.assign(e.currentTarget.style, base, {
            padding: sz.padding,
            transform: 'none',
          });
        }
      }}
      {...props}
    >
      {loading && (
        <svg
          style={{ width: '14px', height: '14px', flexShrink: 0, animation: 'spin 1s linear infinite' }}
          fill="none" viewBox="0 0 24 24"
        >
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left'  && <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>}
    </button>
  );
};
