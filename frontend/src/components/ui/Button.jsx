import React from 'react';

const VARIANTS = {
  primary: 'bg-accent-text text-white hover:bg-accent-deep', // #0F766E: passes AA contrast
  secondary: 'bg-white text-ink border border-border hover:bg-slate-50',
  ghost: 'bg-transparent text-accent-text hover:bg-accent-tint',
  danger: 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50',
};

// 44px minimum tap target (min-h-11). One accent colour, rounded-lg only.
export default function Button({
  variant = 'primary',
  icon: Icon,
  children,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
      {children}
    </button>
  );
}
