import React, { useMemo, useState } from "react";
import { Search, ChevronDown, Lock, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { VINCULOS_PLANOS } from "@/lib/vinculosData";
import {
  vinculoContext,
  vinculoLimit,
  predefinedSlots,
  circleLock,
  elementLock,
  elementById,
  toggleElement,
  choosePredefined,
} from "@/lib/vinculosRules";
import SelectionCard from "./SelectionCard";

const tribeSections = (e) =>
  e.historia ? [{ title: "História", text: e.historia }, { title: "Treino & Estilo de Vida", text: e.treino }] : undefined;

function ElementCard({ e, ctx, chosen, onChange }) {
  const id = `${e.circuloId}:${e.name}`;
  const pick = chosen.find((v) => v.id === id);
  const lock = pick ? "" : elementLock(ctx, chosen, id);
  return (
    <SelectionCard
      option={e}
      isSelected={!!pick}
      selectedLabel={pick?.casa ? "Vínculo da C.A.S.A." : "Selecionado"}
      locked={!!lock}
      lockText={lock}
      sections={tribeSections(e)}
      onSelect={() => !pick?.casa && onChange(toggleElement(ctx, chosen, id))}
    />
  );
}

function Collapsible({ title, subtitle, lock, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("rounded-xl border", lock ? "border-border opacity-55" : "border-primary/30 bg-primary/[0.03]")}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3 text-left">
        <ChevronDown className={cn("w-5 h-5 shrink-0 transition-transform", lock ? "text-muted-foreground" : "text-primary", open && "rotate-180")} />
        <div className="min-w-0 flex-1">
          <div className={cn("font-cinzel font-bold", lock ? "text-muted-foreground" : "text-foreground")}>{title}</div>
          {subtitle && <div className="text-[11px] text-muted-foreground">{subtitle}</div>}
          {lock && (
            <div className="text-[11px] text-destructive/80 flex items-center gap-1 mt-0.5">
              <Lock className="w-3 h-3" /> {lock}
            </div>
          )}
        </div>
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

function Circle({ plano, c, ctx, chosen, onChange }) {
  const lock = circleLock(ctx, chosen, c.id);
  const withMeta = (e, categoria = "") => ({ ...e, circuloId: c.id, circulo: c.name, plano, categoria });
  return (
    <Collapsible title={c.name} lock={lock} defaultOpen={!lock}>
      <p className="text-sm text-foreground/75 leading-relaxed pb-1">{c.description}</p>
      {c.categorias
        ? c.categorias.map((cat) => (
            <Collapsible key={cat.name} title={`❖ ${cat.name.toUpperCase()}`} subtitle={cat.hint} lock={lock} defaultOpen={false}>
              {cat.elementos.map((e) => (
                <ElementCard key={e.name} e={withMeta(e, cat.name)} ctx={ctx} chosen={chosen} onChange={onChange} />
              ))}
            </Collapsible>
          ))
        : c.elementos.map((e) => <ElementCard key={e.name} e={withMeta(e)} ctx={ctx} chosen={chosen} onChange={onChange} />)}
    </Collapsible>
  );
}

export default function VinculosStep({ character, onChange }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(VINCULOS_PLANOS[0].id);
  const chosen = character.vinculos || [];
  const ctx = useMemo(() => vinculoContext(character), [character]);
  const limit = vinculoLimit(ctx);
  const slots = predefinedSlots(ctx);

  const q = search.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return VINCULOS_PLANOS.flatMap((p) =>
      p.circulos
        .filter((c) => !circleLock(ctx, [], c.id))
        .flatMap((c) =>
          (c.categorias || [{ name: "", elementos: c.elementos }]).flatMap((cat) =>
            cat.elementos
              .filter((e) =>
                [e.name, e.description, e.historia, e.treino, cat.name].filter(Boolean).join(" ").toLowerCase().includes(q)
              )
              .map((e) => ({ ...e, circuloId: c.id, circulo: c.name, plano: p.name, categoria: cat.name }))
          )
        )
    );
  }, [q, ctx]);

  const plano = VINCULOS_PLANOS.find((p) => p.id === tab);

  return (
    <div className="space-y-4">
      {/* Contador */}
      <div className="flex items-center justify-between gap-3 st-panel px-4 py-3">
        <span className="text-sm text-muted-foreground">Vínculos escolhidos</span>
        <span className={cn("font-cinzel font-bold text-lg tabular-nums", chosen.length === limit && limit > 0 ? "text-primary" : "text-foreground")}>
          {chosen.length} / {limit}
        </span>
      </div>
      {ctx.origin === "Beta" && (
        <p className="text-xs text-accent">Origem Beta: só 1 elemento do Círculo Terreno Corrompido.</p>
      )}

      {/* Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar elemento..." className="pl-10 bg-card" />
      </div>

      {/* Vínculo predefinido da C.A.S.A. */}
      {slots.map((s) => (
        <div key={s.casa} className="st-panel st-live-border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="font-cinzel font-bold text-foreground">Vínculo da C.A.S.A. — {s.casa}</h3>
          </div>
          <p className="text-xs text-muted-foreground">Escolha 1 entre 2. Conta no total de vínculos e vem primeiro.</p>
          {s.options.map((name) => {
            const id = `terreno:${name}`;
            const e = elementById(id);
            const sel = chosen.some((v) => v.id === id && v.casa === s.casa);
            return (
              <SelectionCard
                key={name}
                option={e}
                isSelected={sel}
                onSelect={() => !sel && onChange(choosePredefined(chosen, s.casa, name))}
              />
            );
          })}
        </div>
      ))}

      {q ? (
        results.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma opção encontrada.</p>
        ) : (
          <div className="space-y-2">
            {results.map((e) => (
              <div key={`${e.circuloId}:${e.name}`}>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                  {e.plano} · {e.circulo}{e.categoria ? ` · ${e.categoria}` : ""}
                </div>
                <ElementCard e={e} ctx={ctx} chosen={chosen} onChange={onChange} />
              </div>
            ))}
          </div>
        )
      ) : (
        <>
          {/* Abas dos planos */}
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-1 px-1">
            {VINCULOS_PLANOS.map((p) => (
              <button
                key={p.id}
                onClick={() => setTab(p.id)}
                className={cn(
                  "shrink-0 px-4 h-10 rounded-full border text-sm font-cinzel transition-colors touch-manipulation",
                  tab === p.id ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-foreground/75 leading-relaxed">{plano.description}</p>
          <div className="space-y-3">
            {plano.circulos.map((c) => (
              <Circle key={`${tab}-${c.id}`} plano={plano.name} c={c} ctx={ctx} chosen={chosen} onChange={onChange} />
            ))}
          </div>
        </>
      )}

      {/* Resumo */}
      {chosen.length > 0 && (
        <div className="st-panel p-4 space-y-2">
          <h4 className="font-cinzel text-sm font-bold text-primary">Seus vínculos</h4>
          {chosen.map((v) => {
            const e = elementById(v.id);
            if (!e) return null;
            return (
              <div key={v.id} className="flex items-center gap-2 text-sm border-b border-border/60 py-1.5 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="text-foreground font-semibold truncate">{e.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {e.plano} · {e.circulo}{e.categoria ? ` · ${e.categoria}` : ""}{v.casa ? ` · C.A.S.A. ${v.casa}` : ""}
                  </div>
                </div>
                {!v.casa && (
                  <button onClick={() => onChange(chosen.filter((x) => x.id !== v.id))} className="p-2 text-muted-foreground hover:text-destructive" aria-label={`Remover ${e.name}`}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
