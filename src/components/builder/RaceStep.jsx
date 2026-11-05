import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SelectionCard from "./SelectionCard";
import RaceModeModal from "./RaceModeModal";

export default function RaceStep({
  options,
  mode,
  race,
  race2,
  onChooseMode,
  onBack,
  onSelectRace,
  onToggleRace,
}) {
  const [search, setSearch] = useState("");

  // Pop-up inicial obrigatório antes de qualquer seleção.
  if (!mode) {
    return <RaceModeModal onChoose={onChooseMode} onBack={onBack} />;
  }

  const selectedValues = [race, race2].filter(Boolean);
  const isUnica = mode === "unica";

  const filtered = options.filter((opt) => {
    const q = search.toLowerCase();
    return (
      opt.name.toLowerCase().includes(q) ||
      opt.description?.toLowerCase().includes(q) ||
      opt.vantagem?.toLowerCase().includes(q) ||
      opt.desvantagem?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3">
      {!isUnica && (
        <div className="text-xs text-primary bg-primary/5 border border-primary/20 rounded-lg p-2">
          Modo Híbrido: selecione 2 raças ({selectedValues.length}/2).
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="pl-10 bg-card"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma opção encontrada.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((opt) => {
            const isSelected = isUnica
              ? race === opt.name
              : selectedValues.includes(opt.name);
            return (
              <SelectionCard
                key={opt.name}
                option={opt}
                isSelected={isSelected}
                onSelect={isUnica ? onSelectRace : onToggleRace}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}