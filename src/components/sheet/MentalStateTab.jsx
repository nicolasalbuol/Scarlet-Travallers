import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ALIGNMENT_GRID } from "@/lib/gameConstants";

export default function MentalStateTab({ character, editMode, updateField, updateNested }) {
  const alignment = character.alignment || "Neutro Neutro";
  const despairHope = character.despair_hope || { despair: 0, hope: 0 };
  const exhaustion = character.exhaustion || 0;

  return (
    <div className="space-y-6 mt-4">
      {/* Alignment */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">ALINHAMENTO</h3>
        <div className="grid grid-cols-3 gap-1">
          {ALIGNMENT_GRID.rows.map((row) =>
            ALIGNMENT_GRID.cols.map((col) => {
              const val = `${row} ${col}`;
              const isActive = alignment === val;
              return (
                <button
                  key={val}
                  onClick={() => updateField("alignment", val)}
                  className={`p-2 rounded-lg text-[10px] font-medium transition-all border ${
                    isActive
                      ? "bg-primary/15 border-primary text-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {row}
                  <br />
                  {col}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Despair / Hope */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">DESESPERO / ESPERANÇA</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <span className="text-[10px] text-destructive font-medium">Desespero</span>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => updateNested("despair_hope.despair", despairHope.despair === i ? i - 1 : i)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    i <= despairHope.despair
                      ? "bg-destructive border-destructive"
                      : "border-destructive/30 hover:border-destructive/60"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-primary font-medium">Esperança</span>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => updateNested("despair_hope.hope", despairHope.hope === i ? i - 1 : i)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    i <= despairHope.hope
                      ? "bg-primary border-primary"
                      : "border-primary/30 hover:border-primary/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exhaustion */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">EXAUSTÃO</h3>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <button
              key={i}
              onClick={() => updateField("exhaustion", exhaustion === i ? i - 1 : i)}
              className={`w-8 h-8 rounded-full border-2 transition-all text-[10px] font-bold ${
                i <= exhaustion
                  ? "bg-yellow-500/20 border-yellow-500 text-yellow-500"
                  : "border-muted-foreground/20 text-muted-foreground/30 hover:border-muted-foreground/40"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Mental state text */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2">ESTADO MENTAL</h3>
        <Textarea
          value={character.mental_state || ""}
          onChange={(e) => updateField("mental_state", e.target.value)}
          placeholder="Descreva o estado mental atual..."
          className="bg-background min-h-[80px]"
        />
      </div>
    </div>
  );
}