import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    id,
    style,
    ...props
  },
  ref
) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-[#94A3B8] tracking-wide">
          {label}
          {props.required && <span className="text-[#EF4444] ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div
            className="absolute flex items-center justify-center text-[#64748B] pointer-events-none"
            style={{ left: '12px', width: '16px', height: '16px', top: '50%', transform: 'translateY(-50%)' }}
          >
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full rounded-lg border text-sm text-white
            placeholder:text-[#475569]
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? '' : ''}
            ${className}
          `}
          style={{
            paddingTop: '10px',
            paddingBottom: '10px',
            paddingLeft: leftIcon ? '38px' : '14px',
            paddingRight: rightIcon ? '38px' : '14px',
            background: '#0D1F3C',
            border: error ? '1px solid #EF4444' : '1px solid #1E3A5C',
            color: 'var(--text-1)',
            borderRadius: '8px',
            ...style,
          }}
          onFocus={e => {
            if (!error) {
              e.currentTarget.style.border = '1px solid #00C8F8';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,200,248,0.15)';
            }
          }}
          onBlur={e => {
            e.currentTarget.style.border = error ? '1px solid #EF4444' : '1px solid #1E3A5C';
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...props}
        />
        {rightIcon && (
          <div
            className="absolute flex items-center justify-center text-[#64748B] pointer-events-none"
            style={{ right: '12px', width: '16px', height: '16px', top: '50%', transform: 'translateY(-50%)' }}
          >
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-[#EF4444] mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-[#64748B] mt-0.5">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';

// Select component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  hint,
  options,
  placeholder,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-[#94A3B8] tracking-wide">
          {label}
          {props.required && <span className="text-[#EF4444] ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full rounded-lg border text-sm text-white
          focus:outline-none
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200 appearance-none
          ${error ? '' : ''}
          ${className}
        `}
        style={{
          paddingTop: '10px',
          paddingBottom: '10px',
          paddingLeft: '14px',
          paddingRight: '2.5rem',
          background: '#0D1F3C',
          border: error ? '1px solid #EF4444' : '1px solid #1E3A5C',
          color: 'var(--text-1)',
          borderRadius: '8px',
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748B' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.25em 1.25em',
        }}
        {...props}
      >
        {placeholder && <option value="" className="bg-[#0D1F3C]">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0D1F3C]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#EF4444] mt-0.5">{error}</p>}
      {hint && !error && <p className="text-xs text-[#64748B] mt-0.5">{hint}</p>}
    </div>
  );
};
