import React from 'react';

// Label, one big number, one plain hint. trend is optional: { value: '+3', up: true }
export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className = ''
}) {
  return (
    <div className={`bg-surface border border-border rounded-lg p-5 animate-fade-up ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        {Icon && <Icon className="w-4 h-4 text-accent-text" aria-hidden="true" />}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
        {trend && (
          <span className={trend.up ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
            {trend.up ? '▲' : '▼'} {trend.value}
          </span>
        )}
        {hint && <span>{hint}</span>}
      </div>
    </div>
  );
}
