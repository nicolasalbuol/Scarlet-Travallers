import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SelectionCard from "./SelectionCard";
import RaceModeModal from "./RaceModeModal";

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Deixa o texto do livro legível: cada habilidade em um parágrafo e as "Opções" em lista.
export function formatRaceText(text = "", names = []) {
  const [main, opts] = text.split(/\n*Opções:\s*/);
  let out = main.trim();
  for (const name of names) {
    if (!name || out.startsWith(name)) continue;
    out = out.replace(new RegExp(`\\s+(${escapeRe(name)})(?=[.:])`), "\n\n$1");
  }
  if (opts) out += "\n\nOpções:\n" + opts.split(/\s*\|\s*/).filter(Boolean).map((o) => `• ${o.trim()}`).join("\n");
  return out;
}

const traitNames = (opt, kind) =>
  (opt.caracteristicas || []).filter((c) => c.startsWith(kind + ":")).map((c) => c.slice(kind.length + 1).trim());

export function raceSections(opt) {
  return [
    opt.vantagem && { title: "Vantagem (buff)", tone: "buff", text: formatRaceText(opt.vantagem, traitNames(opt, "Vantagem")) },
    opt.desvantagem && { title: "Desvantagem (debuff)", tone: "debuff", text: formatRaceText(opt.desvantagem, traitNames(opt, "Desvantagem")) },
  ].filter(Boolean);
}

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
                sections={raceSections(opt)}
                onSelect={isUnica ? onSelectRace : onToggleRace}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}