import React from 'react';

// White surface, thin border, no shadow. Use for every block on a dashboard.
export default function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`bg-surface border border-border rounded-lg p-5 ${className}`} {...props}>
      {children}
    </Tag>
  );
}
