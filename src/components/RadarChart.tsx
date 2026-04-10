'use client';

import { useState, useEffect } from 'react';
import { dimensionOrder, dimensionMeta } from '@/data/dimensions';
import type { Level } from '@/data/scoring';

interface RadarChartProps {
  levels: Record<string, Level>;
  size?: number;
  className?: string;
}

const levelValue = (l: Level): number => ({ L: 1, M: 2, H: 3 }[l]);

export default function RadarChart({ levels, size = 300, className = '' }: RadarChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={`w-full max-w-[300px] aspect-square ${className}`}
      />
    );
  }

  const dims = [...dimensionOrder];
  const n = dims.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  function polarToCart(i: number, r: number): [number, number] {
    const angle = startAngle + i * angleStep;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  // Grid rings
  const rings = [1, 2, 3];
  const ringPaths = rings.map((ring) => {
    const r = (ring / 3) * maxR;
    const points = dims.map((_, i) => polarToCart(i, r));
    return points.map((p) => `${p[0]},${p[1]}`).join(' ');
  });

  // Axis lines
  const axes = dims.map((_, i) => {
    const [x, y] = polarToCart(i, maxR);
    return { x1: cx, y1: cy, x2: x, y2: y };
  });

  // Data polygon
  const dataPoints = dims.map((dim, i) => {
    const val = levelValue(levels[dim] || 'M');
    const r = (val / 3) * maxR;
    return polarToCart(i, r);
  });
  const dataPath = dataPoints.map((p) => `${p[0]},${p[1]}`).join(' ');

  // Labels
  const labels = dims.map((dim, i) => {
    const [x, y] = polarToCart(i, maxR + 18);
    const meta = dimensionMeta[dim];
    const shortName = meta.name.replace(/^[A-Za-z0-9]+ /, '');
    return { x, y, text: shortName, dim };
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={`w-full max-w-[300px] ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid rings */}
      {ringPaths.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="rgba(76, 29, 149, 0.3)"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {axes.map((axis, i) => (
        <line
          key={i}
          x1={axis.x1}
          y1={axis.y1}
          x2={axis.x2}
          y2={axis.y2}
          stroke="rgba(76, 29, 149, 0.2)"
          strokeWidth="1"
        />
      ))}

      {/* Data area — accent green */}
      <polygon
        points={dataPath}
        fill="rgba(16, 185, 129, 0.2)"
        stroke="rgb(16, 185, 129)"
        strokeWidth="2"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="rgb(16, 185, 129)" />
      ))}

      {/* Labels */}
      {labels.map((label, i) => (
        <text
          key={i}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[8px]"
          fill="#94A3B8"
        >
          {label.text}
        </text>
      ))}
    </svg>
  );
}
