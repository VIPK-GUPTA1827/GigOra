import React, { useState } from 'react';

// Initials fallback. A broken image URL falls back to initials instead of a broken icon.
function initialsOf(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'G';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export default function Avatar({ src, name, size = 40, className = '' }) {
  const [broken, setBroken] = useState(false);
  const showImg = Boolean(src) && !broken;

  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-accent-soft text-accent-text font-semibold select-none ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.36) }}
      aria-label={name || 'User avatar'}
    >
      {showImg ? (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}
