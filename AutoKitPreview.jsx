import React from "react";
import { motion } from "framer-motion";
import { Heart, Zap, Brain, Dices, Coins, Backpack, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BASE_VITAL } from "@/lib/autoBuild";

const VITALS = [
  { key: "pv", label: "PV", icon: Heart, color: "hsl(352 85% 60%)" },
  { key: "pe", label: "PE", icon: Zap, color: "hsl(212 85% 62%)" },
  { key: "ps", label: "PS", icon: Brain, color: "hsl(275 70% 68%)" },
];

/**
 * Mostra, antes de criar, tudo o que entra sozinho na ficha:
 * vida/energia/sanidade da Origem (com rolagem), dinheiro, slots,
 * e as características da Origem, C.A.S.A. e habilidades de Classe.
 */
export default function AutoKitPreview({ kit, classAbilities = [], onRoll, rolled }) {
  if (!kit) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="st-panel st-live-border p-4 sm:p-5 mt-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-accent flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Aplicado automaticamente
          </div>
          <p className="text-xs text-muted-foreground mt-1">Isso já vai preenchido na sua ficha ao clicar em Criar.</p>
        </div>
        <Button size="sm" variant={rolled ? "outline" : "default"} onClick={onRoll} className={rolled ? "border-border" : "bg-primary"}>
          <Dices className="w-4 h-4 mr-1.5" /> {rolled ? "Rolar de novo" : "Rolar vida inicial"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {VITALS.map(({ key, label, icon: Icon, color }) => {
          const v = kit[key];
          return (
            <div key={key} className="rounded-xl border border-border bg-background/50 p-3 text-center">
              <Icon className="w-4 h-4 mx-auto" style={{ color }} />
              <div className="text-[10px] font-bold mt-1" style={{ color }}>{label}</div>
              <motion.div key={v.total} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-cinzel text-2xl font-bold text-foreground">
                {v.roll ? v.total : "?"}
              </motion.div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {BASE_VITAL} + {v.formula || "0"}
                {v.roll && v.roll.rolls.length > 0 && ` (${v.roll.rolls.join("+")})`}
              </div>
            </div>
          );
        })}
      </div>
      {!rolled && (
        <p className="text-[11px] text-muted-foreground mt-2">Se você não rolar, os dados são rolados sozinhos ao criar a ficha.</p>
      )}

      {(kit.pack.coins || kit.pack.slots > 0) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {kit.pack.coins && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 text-accent text-xs px-3 py-1">
              <Coins className="w-3.5 h-3.5" /> {kit.pack.coins}
            </span>
          )}
          {kit.pack.slots > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border text-muted-foreground text-xs px-3 py-1">
              <Backpack className="w-3.5 h-3.5" /> {kit.pack.slots} slots de inventário
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
