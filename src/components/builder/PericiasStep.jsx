import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { DEFAULT_SKILLS } from "@/lib/gameConstants";
import { ATTRIBUTE_NAMES } from "@/lib/builderData";
import { BASE_PERICIAS, TRAINED_VALUE } from "@/lib/autoBuild";
import { cn } from "@/lib/utils";

/** Quantas perícias a ficha pode treinar: 6 + INT ou SAB (livro). */
export function periciaLimit(attributes, basis) {
  return BASE_PERICIAS + Math.max(0, Number(attributes?.[basis || "INT"] || 0));
}

export default function PericiasStep({ character, attributes, bonusBySkill = {}, onChange }) {
  const basis = character.pericia_attr || "INT";
  const chosen = character.trainedSkills || [];
  const limit = periciaLimit(attributes, basis);

  const setBasis = (b) => {
    const newLimit = periciaLimit(attributes, b);
    onChange({ ...character, pericia_attr: b, trainedSkills: chosen.slice(0, newLimit) });
  };
  const toggle = (name) => {
    if (chosen.includes(name)) onChange({ ...character, trainedSkills: chosen.filter((n) => n !== name) });
    else if (chosen.length < limit) onChange({ ...character, trainedSkills: [...chosen, name] });
  };

  const groups = {};
  DEFAULT_SKILLS.forEach((s) => (groups[s.attribute] = groups[s.attribute] || []).push(s));

  return (
    <div className="space-y-5">
      <div className="st-panel p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Perícias treinadas</div>
          <div className="font-cinzel text-2xl font-bold text-foreground">
            {chosen.length} <span className="text-muted-foreground text-base">/ {limit}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            6 + {ATTRIBUTE_NAMES[basis]} ({attributes?.[basis] || 0}) · cada uma com treino +{TRAINED_VALUE}
          </div>
        </div>
        <div className="flex rounded-lg border border-border p-1 bg-background/60">
          {["INT", "SAB"].map((b) => (
            <button
              key={b}
              onClick={() => setBasis(b)}
              className={cn("relative px-3 py-1.5 rounded-md text-xs transition-colors", basis === b ? "text-primary-foreground" : "text-muted-foreground")}
            >
              {basis === b && <span className="absolute inset-0 rounded-md bg-primary" />}
              <span className="relative">Usar {ATTRIBUTE_NAMES[b]}</span>
            </button>
          ))}
        </div>
      </div>

      {Object.entries(groups).map(([attr, list]) => (
        <div key={attr}>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {ATTRIBUTE_NAMES[attr]} · {attributes?.[attr] || 0}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {list.map((s) => {
              const on = chosen.includes(s.name);
              const full = !on && chosen.length >= limit;
              const bonus = bonusBySkill[s.name] || 0;
              return (
                <motion.button
                  key={s.name}
                  whileTap={{ scale: 0.96 }}
                  disabled={full}
                  onClick={() => toggle(s.name)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm text-left transition-colors",
                    on ? "border-primary bg-primary/15 text-foreground" : full ? "border-border opacity-40" : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <span className="truncate">{s.name}</span>
                  <span className="flex items-center gap-1 text-[10px] shrink-0">
                    {bonus > 0 && <span className="text-accent">+{bonus}</span>}
                    {on && <Check className="w-3.5 h-3.5 text-primary" />}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-[11px] text-muted-foreground">Os números em dourado são bônus que já vêm do Passado e da C.A.S.A.</p>
    </div>
  );
}
