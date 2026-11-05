import React from "react";

export const LOGO_URL =
  "https://media.base44.com/images/public/user_69fca651120099459e840753/01436fc46_WhatsAppImage2026-05-05at183524.jpeg";

const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";

/**
 * Selo escarlate: anéis que giram em sentidos opostos, um anel de runas,
 * um heptagrama que se desenha e o logo no centro.
 */
export default function Sigil({ size = 220, showLogo = true, draw = true, className = "" }) {
  const runes = [...RUNES.repeat(2)].slice(0, 36);
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id="st-sigil-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(352 85% 50%)" stopOpacity="0.45" />
            <stop offset="70%" stopColor="hsl(352 85% 40%)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="hsl(352 85% 40%)" stopOpacity="0" />
          </radialGradient>
          <path id="st-rune-path" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
        </defs>
        <circle cx="100" cy="100" r="98" fill="url(#st-sigil-glow)" />

        <g style={{ transformOrigin: "100px 100px", animation: "st-spin 40s linear infinite" }}>
          <circle cx="100" cy="100" r="94" fill="none" stroke="hsl(40 58% 58%)" strokeOpacity="0.35" strokeWidth="0.6" strokeDasharray="1 4" />
          <text fill="hsl(352 80% 60%)" fillOpacity="0.75" fontSize="8.5" letterSpacing="3.2">
            <textPath href="#st-rune-path">{runes.join(" ")}</textPath>
          </text>
        </g>

        <g style={{ transformOrigin: "100px 100px", animation: "st-spin-rev 28s linear infinite" }}>
          <circle cx="100" cy="100" r="72" fill="none" stroke="hsl(352 80% 55%)" strokeOpacity="0.6" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="68" fill="none" stroke="hsl(40 58% 58%)" strokeOpacity="0.4" strokeWidth="0.5" strokeDasharray="6 3 1 3" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={100 + 72 * Math.cos(a)} cy={100 + 72 * Math.sin(a)} r="1.6" fill="hsl(40 70% 65%)" />;
          })}
        </g>

        {/* Heptagrama {7/3} que se desenha */}
        <polygon
          points={Array.from({ length: 7 })
            .map((_, k) => {
              const i = (k * 3) % 7;
              const a = -Math.PI / 2 + (i / 7) * Math.PI * 2;
              return `${100 + 64 * Math.cos(a)},${100 + 64 * Math.sin(a)}`;
            })
            .join(" ")}
          fill="none"
          stroke="hsl(352 85% 58%)"
          strokeWidth="1"
          strokeLinejoin="round"
          style={draw ? { strokeDasharray: 1200, strokeDashoffset: 1200, animation: "st-draw 2.4s cubic-bezier(.6,.05,.3,1) forwards" } : undefined}
        />
      </svg>

      {showLogo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ width: size * 0.4, height: size * 0.4 }}>
            <span className="absolute inset-0 rounded-full border border-primary/60" style={{ animation: "st-pulse-ring 2.6s ease-out infinite" }} />
            <img src={LOGO_URL} alt="Scarlet Travellers" className="relative w-full h-full rounded-full object-cover ring-2 ring-primary/50 shadow-[0_0_40px_hsl(352_85%_45%/0.55)]" />
          </div>
        </div>
      )}
      <style>{`@keyframes st-draw { to { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
}
