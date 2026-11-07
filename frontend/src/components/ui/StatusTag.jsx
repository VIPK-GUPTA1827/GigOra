import React from 'react';

// Text AND colour, so the state is readable without colour (accessibility).
const MAP = {
  open: { label: 'Open', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  active: { label: 'Active', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  in_progress: { label: 'In progress', cls: 'bg-accent-tint text-accent-text border-accent-soft' },
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  paused: { label: 'Paused', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  closed: { label: 'Closed', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  accepted: { label: 'Accepted', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  rejected: { label: 'Rejected', cls: 'bg-rose-50 text-rose-800 border-rose-200' },
  withdrawn: { label: 'Withdrawn', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export default function StatusTag({ status, label }) {
  const key = String(status || '').toLowerCase();
  const item = MAP[key] || { label: status || 'Unknown', cls: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-xs font-medium ${item.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {label || item.label}
    </span>
  );
}
