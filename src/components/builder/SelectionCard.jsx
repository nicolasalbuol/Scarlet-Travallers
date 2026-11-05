import React, { useState } from "react";
import { ChevronDown, Check, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { optionCaracteristicas } from "@/lib/optionContent";

export default function SelectionCard({ option, isSelected, onSelect, locked = false, missing = [] }) {
  const [expanded, setExpanded] = useState(false);
  const caracteristicas = optionCaracteristicas(option);

  return (
    <div
      className={`rounded-lg border transition-all duration-200 overflow-hidden ${
        locked
          ? "border-border bg-card opacity-60"
          : isSelected
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border bg-card hover:border-primary/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 flex-1 text-left min-w-0"
        >
          <ChevronDown
            className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
              locked ? "text-muted-foreground" : "text-primary"
            } ${expanded ? "rotate-180" : ""}`}
          />
          <div className="min-w-0 flex-1">
            <span
              className={`font-cinzel font-semibold truncate block ${
                isSelected ? "text-primary" : locked ? "text-muted-foreground" : "text-foreground"
              }`}
            >
              {option.name}
            </span>
            {locked && (
              <span className="text-[11px] text-destructive/80 flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3" /> Requer: {missing.join(", ")}
              </span>
            )}
          </div>
        </button>

        {locked ? (
          <span className="flex-shrink-0 h-8 px-3 text-xs rounded-md bg-muted text-muted-foreground flex items-center gap-1">
            <Lock className="w-3 h-3" /> Bloqueado
          </span>
        ) : (
          <Button
            size="sm"
            onClick={() => onSelect(option.name)}
            className={`flex-shrink-0 h-8 px-4 text-xs ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
            }`}
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

      {/* Expanded content: Nome → Descrição → Características */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          <p className="text-sm text-foreground/80 leading-relaxed">{option.description}</p>

          {caracteristicas.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Características:
              </p>
              <ul className="space-y-1">
                {caracteristicas.map((item, i) => (
                  <li key={i} className="text-sm text-foreground/70 pl-4 leading-relaxed">
                    ▪︎ {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}