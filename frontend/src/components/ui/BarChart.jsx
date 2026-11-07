import React from 'react';

// Hand-made SVG bars. No chart library. values: number[], labels: string[]
export default function BarChart({
  values = [],
  labels = [],
  height = 120,
  label = 'Chart'
}) {
  const max = Math.max(1, ...values);
  const w = 100;
  const gap = 4;
  const bw = (w - gap * (values.length - 1)) / Math.max(1, values.length);

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${w} ${height}`}
        role="img"
        aria-label={label}
        className="w-full block"
        style={{ height }}
        preserveAspectRatio="none"
      >
        {values.map((v, i) => {
          const h = Math.round((v / max) * (height - 16));
          return (
            <rect
              key={i}
              x={i * (bw + gap)}
              y={height - h - 2}
              width={bw}
              height={Math.max(h, 1)}
              rx="1"
              className="fill-accent"
            />
          );
        })}
      </svg>
      {labels.length > 0 && (
        <figcaption className="mt-1 flex justify-between text-[10px] text-muted">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
