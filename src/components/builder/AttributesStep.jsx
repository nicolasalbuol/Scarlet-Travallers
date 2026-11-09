import React from "react";
import { ATTRIBUTE_MAX, baseValue, attributeTotal } from "@/lib/attributeBonuses";
import { ATTRIBUTE_NAMES } from "@/lib/builderData";
import { cn } from "@/lib/utils";
import AttributeNode from "./AttributeNode";
import MagicCircleBackdrop from "./MagicCircleBackdrop";

// Sentido horário a partir do topo
const DIAGRAM_ORDER = ["FOR", "DES", "CON", "SAB", "INT", "CAR"];

const NODE_POSITIONS = {
  FOR: { left: "50%", top: "12%" },
  DES: { left: "82.9%", top: "31%" },
  CON: { left: "82.9%", top: "69%" },
  SAB: { left: "50%", top: "88%" },
  INT: { left: "17.1%", top: "69%" },
  CAR: { left: "17.1%", top: "31%" },
};

export default function AttributesStep({ points, casaBonus, availablePoints, onChange }) {
  const adjust = (key, delta) => {
    const current = points?.[key] || 0;
    const newVal = current + delta;
    if (delta > 0) {
      if (availablePoints <= 0) return;
      if (baseValue(points, key) >= ATTRIBUTE_MAX) return;
    }
    if (delta < 0 && newVal < 0) return;
    onChange({ ...points, [key]: newVal });
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-[520px] mx-auto aspect-square select-none">
        <MagicCircleBackdrop />

        {/* Centro: título + pontos disponíveis */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[34%] h-[34%] rounded-full border-2 border-primary/40 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center text-center gap-0.5 px-2">
          <span className="font-cinzel text-[9px] sm:text-xs tracking-[0.2em] text-primary">ATRIBUTOS</span>
          <span className="text-[9px] sm:text-[11px] text-muted-foreground leading-tight">
            Pontos disponíveis
          </span>
          <span
            className={cn(
              "font-cinzel text-lg sm:text-3xl font-bold leading-none",
              availablePoints > 0 ? "text-primary" : "text-muted-foreground"
            )}
          >
            {availablePoints}
          </span>
        </div>

        {/* Círculos dos atributos */}
        {DIAGRAM_ORDER.map((key) => {
          const casa = casaBonus?.[key] || 0;
          const user = points?.[key] || 0;
          const total = attributeTotal(casaBonus, points, key);
          const atMax = baseValue(points, key) >= ATTRIBUTE_MAX;

          return (
            <AttributeNode
              key={key}
              label={key}
              name={ATTRIBUTE_NAMES[key]}
              total={total}
              casa={casa}
              atMax={atMax}
              canAdd={availablePoints > 0 && !atMax}
              canRemove={user > 0}
              onAdd={() => adjust(key, 1)}
              onRemove={() => adjust(key, -1)}
              position={NODE_POSITIONS[key]}
            />
          );
        })}
      </div>

      {availablePoints > 0 && (
        <p className="text-xs text-amber-500 text-center">
          Você ainda tem {availablePoints} ponto(s) para distribuir.
        </p>
      )}
    </div>
  );
}