import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ATTRIBUTE_NAMES } from "@/lib/gameConstants";
import { motion } from "framer-motion";
import { Dices } from "lucide-react";

const ATTR_ORDER = ["FOR", "DES", "CON", "INT", "SAB", "CAR"];

/** Hexagrama de atributos: o polígono escarlate se molda aos valores. */
function AttributeRadar({ attrs, onRoll, editMode }) {
  const max = Math.max(5, ...ATTR_ORDER.map((k) => Number(attrs[k]) || 0));
  const pts = useMemo(
    () =>
      ATTR_ORDER.map((k, i) => {
        const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
        const v = Math.max(0.15, (Number(attrs[k]) || 0) / max);
        return { k, a, x: 100 + 72 * v * Math.cos(a), y: 100 + 72 * v * Math.sin(a), lx: 100 + 90 * Math.cos(a), ly: 100 + 90 * Math.sin(a) };
      }),
    [attrs, max]
  );
  const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[260px] mx-auto overflow-visible" role="img" aria-label="Gráfico dos atributos">
      {[1, 0.66, 0.33].map((r) => (
        <polygon
          key={r}
          points={ATTR_ORDER.map((_, i) => {
            const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
            return `${100 + 72 * r * Math.cos(a)},${100 + 72 * r * Math.sin(a)}`;
          }).join(" ")}
          fill="none"
          stroke="hsl(350 32% 22%)"
          strokeWidth="0.8"
        />
      ))}
      {pts.map((p) => (
        <line key={p.k} x1="100" y1="100" x2={100 + 72 * Math.cos(p.a)} y2={100 + 72 * Math.sin(p.a)} stroke="hsl(350 32% 18%)" strokeWidth="0.6" />
      ))}
      <motion.polygon
        points={poly}
        initial={false}
        animate={{ points: poly }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        fill="hsl(352 85% 50% / 0.22)"
        stroke="hsl(352 85% 58%)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px hsl(352 90% 50% / 0.6))" }}
      />
      {pts.map((p) => (
        <g
          key={`v-${p.k}`}
          className={editMode ? "" : "cursor-pointer"}
          onClick={() => !editMode && onRoll(`${ATTRIBUTE_NAMES[p.k]} (${p.k})`, Number(attrs[p.k]) || 0)}
        >
          <motion.circle initial={false} animate={{ cx: p.x, cy: p.y }} transition={{ type: "spring", stiffness: 120, damping: 14 }} r="3" fill="hsl(40 70% 65%)" />
          <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" letterSpacing="1.5" fill="hsl(20 10% 70%)" fontFamily="Cinzel, serif">
            {p.k}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function AttributesPanel({ attributes, editMode, onUpdate, onRoll }) {
  const attrs = attributes || {};

  return (
    <div className="st-panel p-4 sm:p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-cinzel text-xs font-semibold tracking-[0.25em] text-muted-foreground">ATRIBUTOS</h2>
        {!editMode && <span className="text-[10px] text-muted-foreground/70">Toque para rolar</span>}
      </div>
      <div className="grid md:grid-cols-[260px_1fr] gap-5 items-center">
        <AttributeRadar attrs={attrs} onRoll={onRoll} editMode={editMode} />
        <div className="grid grid-cols-3 gap-2">
          {ATTR_ORDER.map((key, i) => {
            const val = attrs[key] || 0;
            return (
              <motion.button
                type="button"
                key={key}
                initial={{ opacity: 0, rotateX: -70 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.5 }}
                whileHover={!editMode ? { y: -3 } : {}}
                whileTap={!editMode ? { scale: 0.94 } : {}}
                onClick={() => !editMode && onRoll(ATTRIBUTE_NAMES[key] + ` (${key})`, val)}
                className={`group relative overflow-hidden rounded-xl p-3 text-center border transition-colors ${
                  editMode ? "border-primary/30 bg-background/50 cursor-default" : "border-border bg-background/40 hover:border-primary/60"
                }`}
              >
                <span className="absolute inset-0 bg-gradient-to-t from-primary/25 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative text-[10px] font-semibold text-muted-foreground tracking-[0.2em]">{key}</div>
                <div className="relative text-[9px] text-muted-foreground/60 truncate">{ATTRIBUTE_NAMES[key]}</div>
                {editMode ? (
                  <Input
                    type="number"
                    value={val}
                    onChange={(e) => onUpdate(key, Number(e.target.value))}
                    className="relative h-9 text-center text-lg font-bold bg-background mt-1 px-1"
                    min={0}
                  />
                ) : (
                  <motion.div
                    key={val}
                    initial={{ y: -14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative text-3xl font-cinzel font-bold text-foreground mt-1"
                  >
                    {val}
                  </motion.div>
                )}
                {!editMode && (
                  <div className="relative text-[9px] text-primary mt-1 flex items-center justify-center gap-1">
                    <Dices className="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform duration-500" />
                    {val >= 1 ? `${val}d20 ↑` : "2d20 ↓"}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
