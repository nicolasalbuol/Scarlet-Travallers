import React from "react";
import AutoTextarea from "@/components/ui/AutoTextarea";

export default function RaceTab({ character, editMode, updateField }) {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2">VANTAGEM DE RAÇA</h3>
        <AutoTextarea
          value={character.race_advantage || ""}
          onChange={(e) => updateField("race_advantage", e.target.value)}
          placeholder="Descreva a vantagem da raça..."
          className="bg-background min-h-[60px]"
          readOnly={!editMode}
        />
      </div>
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2">DESVANTAGEM DE RAÇA</h3>
        <AutoTextarea
          value={character.race_disadvantage || ""}
          onChange={(e) => updateField("race_disadvantage", e.target.value)}
          placeholder="Descreva a desvantagem da raça..."
          className="bg-background min-h-[60px]"
          readOnly={!editMode}
        />
      </div>
    </div>
  );
}