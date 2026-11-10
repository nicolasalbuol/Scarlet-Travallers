import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CASA_OPTIONS } from "@/lib/bookData";

const fmtBonus = (opt) =>
  Object.entries(opt || {})
    .map(([k, v]) => `+${v} ${k}`)
    .join(", ");

function CasaCard({ name, entidade, secondary }) {
  const opt = CASA_OPTIONS.find((c) => c.name === name);
  return (
    <div className="st-panel st-live-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-cinzel text-lg font-bold text-primary">{name}</h3>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {secondary ? "Secundária" : "Principal"}
        </span>
      </div>
      {!opt && <p className="text-sm text-muted-foreground">Esta C.A.S.A. não está no livro.</p>}
      {opt?.description && <p className="text-sm text-muted-foreground leading-relaxed">{opt.description}</p>}
      {opt?.passiva && !secondary && (
        <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 text-sm">
          <span className="text-[10px] uppercase tracking-[0.2em] text-accent block mb-1">Passiva</span>
          {opt.passiva}
        </div>
      )}
      {opt?.entidades?.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Entidades</span>
          {opt.entidades.map((e) => {
            const chosen = e.name === entidade;
            return (
              <div
                key={e.name}
                className={`rounded-lg border p-3 text-sm ${chosen ? "border-primary bg-primary/10" : "border-border"}`}
              >
                <div className="font-semibold text-foreground">
                  {e.name} {chosen && <span className="text-primary text-xs">· escolhida</span>}
                </div>
                <div className="text-xs text-muted-foreground">{e.options.map(fmtBonus).join(" OU ")}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CasaTab({ casa, canEdit, onRecalc, bond }) {
  return (
    <div className="mt-4 space-y-4">
      {!casa.casa && <p className="text-sm text-muted-foreground">Esta ficha não tem C.A.S.A.</p>}
      {casa.casa && <CasaCard name={casa.casa} entidade={casa.entidade} />}
      {casa.casa2 && <CasaCard name={casa.casa2} secondary />}
      {bond && (
        <div className="st-panel p-4 text-sm">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-1">Vínculo</span>
          {bond}
        </div>
      )}
      {canEdit && (
        <div className="st-panel p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Sparkles className="w-5 h-5 text-accent shrink-0" />
          <p className="text-xs text-muted-foreground flex-1">
            Mudou atributos ou perícias? Recalcule PV, PS, PE e CA pelas regras do livro (Origem + atributos + passiva da C.A.S.A.).
          </p>
          <Button size="sm" variant="outline" className="border-primary/40 text-primary" onClick={onRecalc}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Recalcular pelo livro
          </Button>
        </div>
      )}
    </div>
  );
}
