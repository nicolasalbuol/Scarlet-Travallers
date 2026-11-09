import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { VINCULOS_PLANOS } from "@/lib/vinculosData";
import { optionCaracteristicas } from "@/lib/optionContent";
import { cn } from "@/lib/utils";

function OptionCard({ option, selected, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-colors",
        selected
          ? "border-primary bg-primary/10"
          : disabled
            ? "border-border opacity-40 cursor-not-allowed"
            : "border-border hover:bg-muted"
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("font-cinzel text-sm font-semibold", selected ? "text-primary" : "text-foreground")}>
          {option.name}
        </span>
        {selected && <Check className="w-4 h-4 text-primary" />}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
    </button>
  );
}

export default function VinculosStep({ plano, circulo, elemento, onChange }) {
  const planoData = VINCULOS_PLANOS.find((p) => p.name === plano);
  const circuloData = planoData?.circulos.find((c) => c.name === circulo);
  const elementoData = circuloData?.elementos.find((e) => e.name === elemento);

  const selectPlano = (name) => {
    // Trocar o Plano invalida Círculo e Elemento
    onChange({ plano: name, circulo: "", elemento: "" });
  };
  const selectCirculo = (name) => {
    onChange({ plano, circulo: name, elemento: "" });
  };
  const selectElemento = (name) => {
    onChange({ plano, circulo, elemento: name });
  };

  return (
    <div className="space-y-4">
      {/* Trilha da cascata */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <span className={cn("px-2 py-1 rounded-full border", plano ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground")}>
          {plano || "Plano"}
        </span>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className={cn("px-2 py-1 rounded-full border", circulo ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground")}>
          {circulo || "Círculo"}
        </span>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        <span className={cn("px-2 py-1 rounded-full border", elemento ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground")}>
          {elemento || "Elemento"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Coluna 1 — Planos */}
        <div className="space-y-2">
          <h3 className="font-cinzel text-xs font-bold text-muted-foreground uppercase tracking-wide">1. Plano</h3>
          {VINCULOS_PLANOS.map((p) => (
            <OptionCard key={p.name} option={p} selected={plano === p.name} onClick={() => selectPlano(p.name)} />
          ))}
        </div>

        {/* Coluna 2 — Círculos (filtrados pelo Plano) */}
        <div className="space-y-2">
          <h3 className="font-cinzel text-xs font-bold text-muted-foreground uppercase tracking-wide">2. Círculo</h3>
          {!planoData ? (
            <p className="text-xs text-muted-foreground italic p-3">Selecione um Plano primeiro.</p>
          ) : (
            planoData.circulos.map((c) => (
              <OptionCard key={c.name} option={c} selected={circulo === c.name} onClick={() => selectCirculo(c.name)} />
            ))
          )}
        </div>

        {/* Coluna 3 — Elementos (filtrados pelo Círculo) */}
        <div className="space-y-2">
          <h3 className="font-cinzel text-xs font-bold text-muted-foreground uppercase tracking-wide">3. Elemento</h3>
          {!circuloData ? (
            <p className="text-xs text-muted-foreground italic p-3">Selecione um Círculo primeiro.</p>
          ) : (
            circuloData.elementos.map((e) => (
              <OptionCard key={e.name} option={e} selected={elemento === e.name} onClick={() => selectElemento(e.name)} />
            ))
          )}
        </div>
      </div>

      {/* Resumo do Elemento escolhido */}
      {elementoData && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-2">
          <h4 className="font-cinzel text-sm font-bold text-primary">{elementoData.name}</h4>
          <p className="text-sm text-muted-foreground">{elementoData.description}</p>
          {optionCaracteristicas(elementoData).length > 0 && (
            <div className="pt-1">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">
                Características
              </p>
              <ul className="text-xs space-y-0.5">
                {optionCaracteristicas(elementoData).map((c) => (
                  <li key={c} className="text-foreground">• {c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}