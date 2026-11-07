import React from 'react';

// Every empty list says what is missing, why, and the one next step.
export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-10 px-4 border border-dashed border-border rounded-lg bg-surface">
      {Icon && (
        <span className="w-10 h-10 rounded-lg bg-accent-tint flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent-text" aria-hidden="true" />
        </span>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {text && <p className="text-sm text-muted max-w-sm">{text}</p>}
      {action}
    </div>
  );
}
