import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { evaluatePrerequisites } from "@/lib/prerequisites";
import { optionCaracteristicas } from "@/lib/optionContent";
import SelectionCard from "./SelectionCard";

export default function SelectionSection({ options, selectedValue, onSelect, state }) {
  const [search, setSearch] = useState("");

  const filtered = options.filter((opt) => {
    const q = search.toLowerCase();
    return (
      opt.name.toLowerCase().includes(q) ||
      opt.description?.toLowerCase().includes(q) ||
      optionCaracteristicas(opt).some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-3">
      {/* Search — encontra também os itens bloqueados */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="pl-10 bg-card"
        />
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma opção encontrada.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((opt) => {
            const lock = evaluatePrerequisites(opt, state || {});
            return (
              <SelectionCard
                key={opt.name}
                option={opt}
                isSelected={selectedValue === opt.name}
                onSelect={onSelect}
                locked={lock.locked}
                missing={lock.missing}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}