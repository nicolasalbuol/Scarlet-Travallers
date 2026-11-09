import React from "react";

// Vértices do hexagrama (mesmas posições dos círculos de atributo)
const VERTICES = [
  [50, 12],
  [82.9, 31],
  [82.9, 69],
  [50, 88],
  [17.1, 69],
  [17.1, 31],
];

// Estrelas decorativas entre os vértices
const STARS = [-60, 0, 60, 120, 180, 240].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return { x: 50 + 45 * Math.cos(rad), y: 50 + 45 * Math.sin(rad) };
});

const STAR_PATH =
  "M0,-1 L0.22,-0.22 L1,0 L0.22,0.22 L0,1 L-0.22,0.22 L-1,0 L-0.22,-0.22 Z";

export default function MagicCircleBackdrop() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    >
      {/* anéis externos claros */}
      <g className="text-foreground" fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="49" strokeWidth="0.3" opacity="0.18" />
        <circle cx="50" cy="50" r="46.5" strokeWidth="0.25" opacity="0.14" strokeDasharray="0.4 2.2" />
        <circle cx="50" cy="50" r="43" strokeWidth="0.25" opacity="0.15" />
      </g>

      {/* círculo mágico + hexagrama */}
      <g className="text-primary" fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="38" strokeWidth="0.4" opacity="0.55" />
        <circle cx="50" cy="50" r="41" strokeWidth="0.25" opacity="0.35" strokeDasharray="0.6 1.6" />
        <polygon points="50,12 82.9,69 17.1,69" strokeWidth="0.45" opacity="0.5" />
        <polygon points="50,88 82.9,31 17.1,31" strokeWidth="0.45" opacity="0.5" />
        {VERTICES.map(([x, y]) => (
          <line key={`spoke-${x}-${y}`} x1="50" y1="50" x2={x} y2={y} strokeWidth="0.25" opacity="0.3" />
        ))}
        {VERTICES.map(([x, y]) => (
          <circle
            key={`halo-${x}-${y}`}
            cx={x}
            cy={y}
            r="12.5"
            strokeWidth="0.25"
            opacity="0.3"
            strokeDasharray="0.5 1.4"
          />
        ))}
        <circle cx="50" cy="50" r="19.5" strokeWidth="0.3" opacity="0.3" strokeDasharray="0.6 1.8" />
      </g>

      {/* estrelas decorativas */}
      <g className="text-primary" fill="currentColor" opacity="0.4">
        {STARS.map(({ x, y }) => (
          <path key={`star-${x}-${y}`} d={STAR_PATH} transform={`translate(${x} ${y}) scale(1.4)`} />
        ))}
      </g>
    </svg>
  );
}