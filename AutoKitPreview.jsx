import React from "react";
import { motion } from "framer-motion";
import { Heart, Zap, Brain, Coins, Backpack, Sparkles, Check, Shield, ShieldHalf } from "lucide-react";
import CountUp from "@/components/fx/CountUp";

const VITALS = [
  { key: "pv", label: "PV", icon: Heart, color: "hsl(352 85% 60%)" },
  { key: "ps", label: "PS", icon: Brain, color: "hsl(275 70% 68%)" },
  { key: "pe", label: "PE", icon: Zap, color: "hsl(212 85% 62%)" },
];

/**
 * Mostra, antes de criar, tudo o que entra sozinho na ficha (regras do livro):
 * PV/PS/PE iniciais da Origem + atributo (+ passiva da C.A.S.A.), dinheiro,
 * slots, CA Física/Mágica e as características que vão para Habilidades.
 */
export default function AutoKitPreview({ kit, classAbilities = [] }) {
  if (!kit) return null;
  const formula = (v) =>
    [v.base, v.attr ? `${v.attr} (${v.attrVal})` : null, v.bonus ? `C.A.S.A. ${v.bonus}` : null].filter(Boolean).join(" + ");

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="st-panel st-live-border p-4 sm:p-5 mt-6">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-accent flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Aplicado automaticamente
        </div>
        <p className="text-xs text-muted-foreground mt-1">Calculado pelas regras do livro e preenchido na ficha ao clicar em Criar.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {VITALS.map(({ key, label, icon: Icon, color }) => {
          const v = kit[key];
          return (
            <div key={key} className="rounded-xl border border-border bg-background/50 p-3 text-center">
              <Icon className="w-4 h-4 mx-auto" style={{ color }} />
              <div className="text-[10px] font-bold mt-1" style={{ color }}>{label}</div>
              <div className="font-cinzel text-2xl font-bold text-foreground">
                {v.known ? <CountUp value={v.total} /> : "—"}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono leading-tight">{v.known ? formula(v) : "escolha a Origem"}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="rounded-xl border border-border bg-background/50 p-3 flex items-center gap-3">
          <Shield className="w-4 h-4 text-primary" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CA Física</div>
            <div className="font-cinzel text-xl font-bold text-foreground">{kit.ca.fisica}</div>
            <div className="text-[10px] text-muted-foreground font-mono">10 + CON + Fortitude</div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background/50 p-3 flex items-center gap-3">
          <ShieldHalf className="w-4 h-4 text-accent" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CA Mágica</div>
            <div className="font-cinzel text-xl font-bold text-foreground">{kit.ca.magica}</div>
            <div className="text-[10px] text-muted-foreground font-mono">10 + PE/5 + Feitiçaria</div>
          </div>
        </div>
      </div>

      {(kit.pack.coins || kit.slots.total > 0) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {kit.pack.coins && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 text-accent text-xs px-3 py-1">
              <Coins className="w-3.5 h-3.5" /> {kit.pack.coins}
            </span>
          )}
          {kit.slots.total > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border text-muted-foreground text-xs px-3 py-1">
              <Backpack className="w-3.5 h-3.5" /> {kit.slots.total} slots ({kit.slots.base}
              {kit.slots.attr ? ` + ${kit.slots.attr}` : ""}
              {kit.slots.bonus ? ` + ${kit.slots.bonus} da C.A.S.A.` : ""})
            </span>
          )}
        </div>
      )}

      {(kit.traits.length > 0 || classAbilities.length > 0) && (
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Vão para a aba Habilidades</div>
          <div className="flex flex-wrap gap-1.5">
            {[...kit.traits, ...classAbilities].map((t) => (
              <span key={t.name} className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 text-primary text-xs px-2 py-1">
                <Check className="w-3 h-3" /> {t.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
