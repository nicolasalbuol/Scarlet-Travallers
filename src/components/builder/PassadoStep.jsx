import React, { useState, useMemo } from "react";
import { Search, ChevronDown, Check, Sparkles, Lock } from "lucide-react";
import { evaluatePrerequisites } from "@/lib/prerequisites";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PASSADO_CATEGORIES, PASSADO_DEFAULTS, PASSADO_INTRO } from "@/lib/passadoData";
import { cn } from "@/lib/utils";

export default function PassadoStep({ selected, onSelect, state }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

  const { data: records = [] } = useQuery({
    queryKey: ["passados"],
    queryFn: () => base44.entities.Passado.list("order", 100),
  });

  const passados = useMemo(() => {
    const list = records.length > 0 ? records : PASSADO_DEFAULTS;
    return list.map((p) => ({
      name: p.name,
      description: p.description || "",
      category: p.category || "mundano",
      skill_1: p.skill_1 || "",
      skill_2: p.skill_2 || "",
      bonus_value: p.bonus_value || 2,
      prerequisites: p.prerequisites || [],
      prerequisiteRule: p.prerequisiteRule || "all",
    }));
  }, [records]);

  const q = search.toLowerCase().trim();
  const filtered = q
    ? passados.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.skill_1.toLowerCase().includes(q) ||
          p.skill_2.toLowerCase().includes(q)
      )
    : passados;

  // Agrupa os resultados filtrados por categoria, preservando a ordem das categorias
  const grouped = PASSADO_CATEGORIES.map((cat) => ({
    ...cat,
    items: filtered.filter((p) => p.category === cat.id),
  })).filter((g) => g.items.length > 0);

  const hasResults = grouped.length > 0;

  return (
    <div className="space-y-4">
      {/* Introdução */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-foreground/80 leading-relaxed">{PASSADO_INTRO}</p>
      </div>

      {/* Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, descrição ou perícia..."
          className="pl-10 bg-card"
        />
      </div>

      {!hasResults ? (
        <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma opção encontrada.</p>
      ) : (
        <div className="space-y-6">
          {grouped.map((cat) => (
            <div key={cat.id} className="space-y-2">
              <div className="border-l-2 border-primary pl-3">
                <h3 className="font-cinzel text-base font-bold text-primary">{cat.name}</h3>
                <p className="text-xs italic text-primary/70">{cat.phrase}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cat.description}</p>
              </div>

              <div className="space-y-2">
                {cat.items.map((p) => {
                  const isSelected = selected === p.name;
                  const isOpen = !!expanded[p.name];
                  const lock = evaluatePrerequisites(p, state || {});
                  return (
                    <div
                      key={p.name}
                      className={cn(
                        "rounded-lg border transition-all duration-200 overflow-hidden",
                        lock.locked
                          ? "border-border bg-card opacity-60"
                          : isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border bg-card hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <button
                          onClick={() => setExpanded((s) => ({ ...s, [p.name]: !s[p.name] }))}
                          className="flex items-center gap-3 flex-1 text-left min-w-0"
                        >
                          <ChevronDown
                            className={cn(
                              "w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200",
                              isOpen && "rotate-180"
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "font-cinzel font-semibold truncate block",
                                isSelected ? "text-primary" : lock.locked ? "text-muted-foreground" : "text-foreground"
                              )}
                            >
                              {p.name}
                            </span>
                            {lock.locked && (
                              <span className="text-[11px] text-destructive/80 flex items-center gap-1 mt-0.5">
                                <Lock className="w-3 h-3" /> Requer: {lock.missing.join(", ")}
                              </span>
                            )}
                          </div>
                        </button>
                        {lock.locked ? (
                          <span className="flex-shrink-0 h-8 px-3 text-xs rounded-md bg-muted text-muted-foreground flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Bloqueado
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => onSelect(p.name)}
                            className={cn(
                              "flex-shrink-0 h-8 px-4 text-xs",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                            )}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3 h-3 mr-1" /> Selecionado
                              </>
                            ) : (
                              "Escolher"
                            )}
                          </Button>
                        )}
                      </div>

                      {isOpen && (
                        <div className="border-t border-border px-4 pb-4 pt-3 space-y-2">
                          <p className="text-sm text-foreground/80 leading-relaxed">{p.description}</p>
                          <div>
                            <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Características:
                            </p>
                            <p className="text-sm text-foreground/70 pl-4">
                              ▪︎ +{p.bonus_value} {p.skill_1}
                              <br />▪︎ +{p.bonus_value} {p.skill_2}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}