import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Heart, Zap, Brain } from "lucide-react";

const VITAL_CONFIG = [
  { key: "pv", label: "PV", name: "Vida", icon: Heart, hue: 352 },
  { key: "pe", label: "PE", name: "Energia", icon: Zap, hue: 212 },
  { key: "ps", label: "PS", name: "Sanidade", icon: Brain, hue: 275 },
];

/**
 * Barra "líquida": o preenchimento ondula, e quando o valor cai fica um
 * rastro claro que escorre atrás (como em jogos de luta), com tremor.
 * Ao curar, a borda acende em dourado.
 */
function VitalBar({ config, data, onUpdate }) {
  const { label, name, icon: Icon, hue } = config;
  const current = data.current ?? 0;
  const total = data.total ?? 0;
  const isOverflow = current > total;
  const fill = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  const [ghost, setGhost] = useState(fill);
  const [fx, setFx] = useState("");
  const prev = useRef(current);
  const ghostTimer = useRef(0);

  useEffect(() => {
    const before = prev.current;
    prev.current = current;
    clearTimeout(ghostTimer.current);
    if (current < before) {
      setFx("hit");
      ghostTimer.current = setTimeout(() => setGhost(fill), 550);
    } else {
      if (current > before) setFx("heal");
      setGhost(fill);
    }
    const t = setTimeout(() => setFx(""), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, total]);

  const adjust = (delta) => onUpdate("current", Math.max(0, current + delta));
  const low = total > 0 && current / total <= 0.25;

  const btn =
    "h-9 w-9 rounded-lg border bg-background/50 hover:bg-background/80 active:scale-90 transition-all flex items-center justify-center text-sm font-bold select-none";
  const tone = { borderColor: `hsl(${hue} 70% 50% / 0.45)`, color: `hsl(${hue} 85% 72%)` };

  return (
    <div
      className={`relative rounded-2xl border overflow-hidden bg-card/80 ${fx === "hit" ? "animate-st-shake" : ""} ${fx === "heal" ? "animate-st-heal" : ""}`}
      style={{ borderColor: `hsl(${hue} 70% 50% / 0.4)`, minHeight: 74 }}
    >
      {/* rastro do dano */}
      <div
        className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
        style={{ width: `${ghost}%`, background: `hsl(${hue} 90% 85% / 0.22)` }}
      />
      {/* líquido */}
      <div
        className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-out overflow-hidden"
        style={{ width: `${fill}%`, background: `linear-gradient(90deg, hsl(${hue} 80% 30% / 0.55), hsl(${hue} 85% 48% / 0.55))` }}
      >
        <svg className="absolute -right-6 top-0 h-full w-12" viewBox="0 0 20 100" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M10,0 C16,12 4,25 10,37 C16,50 4,62 10,75 C16,87 4,100 10,112 L0,112 L0,0 Z"
            fill={`hsl(${hue} 85% 55% / 0.5)`}
            style={{ animation: "st-wave 2.4s ease-in-out infinite" }}
          />
        </svg>
        <div className="absolute inset-0 opacity-40" style={{ background: "repeating-linear-gradient(115deg, transparent 0 14px, hsl(0 0% 100% / 0.05) 14px 16px)", animation: "st-flow 3s linear infinite" }} />
      </div>
      {isOverflow && (
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 30px hsl(${hue} 90% 60% / 0.5)` }} />
      )}
      {low && <div className="absolute inset-0 pointer-events-none animate-pulse" style={{ boxShadow: `inset 0 0 24px hsl(${hue} 90% 50% / 0.35)` }} />}

      <div className="relative z-10 flex items-center justify-between px-2 py-3 gap-1">
        <div className="flex flex-col items-center w-10 shrink-0">
          <Icon className="w-4 h-4" style={{ color: `hsl(${hue} 85% 68%)` }} />
          <span className="text-[10px] font-bold leading-none mt-1" style={{ color: `hsl(${hue} 85% 75%)` }}>{label}</span>
          <span className="text-[8px] text-muted-foreground uppercase tracking-wider">{name}</span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => adjust(-5)} className={btn} style={tone} aria-label={`-5 ${label}`}>«</button>
          <button onClick={() => adjust(-1)} className={btn} style={tone} aria-label={`-1 ${label}`}>‹</button>
        </div>

        <div className="flex-1 text-center">
          <span className="font-cinzel text-2xl font-bold text-foreground leading-none tabular-nums" style={isOverflow ? { color: `hsl(${hue} 90% 78%)`, textShadow: `0 0 12px hsl(${hue} 90% 60%)` } : undefined}>
            {current}
          </span>
          <span className="text-muted-foreground text-sm font-medium">/{total}</span>
          {isOverflow && (
            <div className="text-[9px] font-semibold leading-none mt-0.5 animate-pulse" style={{ color: `hsl(${hue} 85% 75%)` }}>
              +{current - total} temp
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => adjust(1)} className={btn} style={tone} aria-label={`+1 ${label}`}>›</button>
          <button onClick={() => adjust(5)} className={btn} style={tone} aria-label={`+5 ${label}`}>»</button>
        </div>
      </div>
      <style>{`
        @keyframes st-wave { 0%,100% { transform: translateY(-12%); } 50% { transform: translateY(0%); } }
        @keyframes st-flow { to { background-position: 64px 0; } }
      `}</style>
    </div>
  );
}

function VitalEdit({ config, data, onUpdate }) {
  const { label, icon: Icon, hue } = config;
  return (
    <div className="rounded-2xl border bg-card/80 p-3" style={{ borderColor: `hsl(${hue} 70% 50% / 0.4)` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: `hsl(${hue} 85% 68%)` }} />
        <span className="text-xs font-semibold" style={{ color: `hsl(${hue} 85% 75%)` }}>{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {[["total", "Total"], ["current", "Atual"], ["temp", "Temp"]].map(([f, l]) => (
          <div key={f}>
            <label className="text-[9px] text-muted-foreground">{l}</label>
            <Input type="number" value={data[f] ?? 0} onChange={(e) => onUpdate(f, Number(e.target.value))} className="h-8 text-xs bg-background" min={0} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VitalPoints({ character, editMode, updateNested }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
      {VITAL_CONFIG.map((config) => {
        const data = character[config.key] || { total: 0, current: 0, temp: 0 };
        const handleUpdate = (field, value) => updateNested(`${config.key}.${field}`, value);
        return editMode ? (
          <VitalEdit key={config.key} config={config} data={data} onUpdate={handleUpdate} />
        ) : (
          <VitalBar key={config.key} config={config} data={data} onUpdate={handleUpdate} />
        );
      })}
    </div>
  );
}
