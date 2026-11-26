import React, { useMemo, useState } from "react";
import { Search, ChevronDown, Sparkles, ExternalLink, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MAGIAS, ELEMENTOS_ASTRAIS, CORROMPIDOS_DRIVE } from "@/lib/magiasData";
import { VINCULOS_PLANOS } from "@/lib/vinculosData";

const ELEMENTOS = Object.keys(ELEMENTOS_ASTRAIS);
const NIVEIS = [1, 2, 3, 4, "Especial"];
// Filtro por tipo: procura a palavra dentro de "Tipo/Mecânica".
const TIPOS = ["Dano", "Buff", "Debuff", "Controle", "Cura", "Simples", "Invocação"];
const ASTRAL = VINCULOS_PLANOS.flatMap((p) => p.circulos).find((c) => c.id === "astral");

const nivelLabel = (n) => (n === "Especial" ? "Especiais" : `${n}º Nível`);
const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Chip({ active, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "shrink-0 px-3 h-9 rounded-full border text-xs transition-colors touch-manipulation",
        active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function SpellCard({ m, showElement }) {
  const [open, setOpen] = useState(false);
  const extra = m.fields.filter(([k]) => k !== "Custo" && k !== "Tipo/Mecânica");
  return (
    <div className={cn("rounded-lg border bg-card transition-colors", open ? "border-primary/50" : "border-border hover:border-primary/30")}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3 text-left" aria-expanded={open}>
        <ChevronDown className={cn("w-4 h-4 shrink-0 text-primary transition-transform", open && "rotate-180")} />
        <div className="min-w-0 flex-1">
          <div className="font-cinzel font-semibold text-foreground truncate">{m.name}</div>
          <div className="text-[11px] text-muted-foreground truncate">
            {showElement && `${ELEMENTOS_ASTRAIS[m.element].nome} · `}
            {m.type}
          </div>
        </div>
        <span className="shrink-0 text-xs font-mono px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/25">
          {m.costPE ?? "?"} PE
        </span>
      </button>
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-2">
          <div className="flex flex-wrap gap-1.5 text-[10px] uppercase tracking-wider">
            <span className="px-2 py-0.5 rounded border border-border text-muted-foreground">{ELEMENTOS_ASTRAIS[m.element].nome}</span>
            <span className="px-2 py-0.5 rounded border border-border text-muted-foreground">
              {nivelLabel(m.level)}{m.runas ? ` · ${m.runas}` : ""}
            </span>
          </div>
          {extra.map(([k, v], i) => (
            <p key={i} className="text-sm leading-relaxed">
              <span className={cn("font-semibold", k === "Descrição" ? "text-muted-foreground" : "text-accent")}>{k}: </span>
              <span className={k === "Descrição" ? "text-foreground/80" : "text-foreground"}>{v}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Magias() {
  const [busca, setBusca] = useState("");
  const [elemento, setElemento] = useState("");
  const [nivel, setNivel] = useState("");
  const [tipo, setTipo] = useState("");

  const lista = useMemo(() => {
    const q = norm(busca.trim());
    return MAGIAS.filter(
      (m) =>
        (!elemento || m.element === elemento) &&
        (nivel === "" || m.level === nivel) &&
        (!tipo || norm(m.type).includes(norm(tipo))) &&
        (!q || norm(`${m.name} ${m.type} ${m.fields.map((f) => f[1]).join(" ")}`).includes(q))
    );
  }, [busca, elemento, nivel, tipo]);

  // Agrupa: elemento → nível, na ordem do livro.
  const grupos = useMemo(() => {
    const out = [];
    for (const el of ELEMENTOS) {
      const doEl = lista.filter((m) => m.element === el);
      if (!doEl.length) continue;
      out.push({ el, niveis: NIVEIS.map((n) => [n, doEl.filter((m) => m.level === n)]).filter(([, l]) => l.length) });
    }
    return out;
  }, [lista]);

  const info = elemento && ELEMENTOS_ASTRAIS[elemento];
  const filtrando = busca || elemento || nivel !== "" || tipo;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <header className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-accent flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Plano Imaginário · Elementos Astrais
        </p>
        <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-foreground">Catálogo de Magias</h1>
        {ASTRAL && <p className="text-sm text-muted-foreground leading-relaxed">{ASTRAL.description}</p>}
      </header>

      <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-background/95 space-y-3 border-b border-border/60">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar magia, efeito, dano..."
            className="pl-10 pr-9 bg-card"
            aria-label="Buscar magia"
          />
          {busca && (
            <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground" aria-label="Limpar busca">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-1 px-1">
          <Chip active={!elemento} onClick={() => setElemento("")}>Todos</Chip>
          {ELEMENTOS.map((el) => (
            <Chip key={el} active={elemento === el} onClick={() => setElemento(elemento === el ? "" : el)} title={ELEMENTOS_ASTRAIS[el].signo}>
              {ELEMENTOS_ASTRAIS[el].nome}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] -mx-1 px-1">
          {NIVEIS.map((n) => (
            <Chip key={n} active={nivel === n} onClick={() => setNivel(nivel === n ? "" : n)}>{nivelLabel(n)}</Chip>
          ))}
          <span className="w-px shrink-0 bg-border mx-1" />
          {TIPOS.map((t) => (
            <Chip key={t} active={tipo === t} onClick={() => setTipo(tipo === t ? "" : t)}>{t}</Chip>
          ))}
        </div>
      </div>

      {info && (
        <div className="st-panel st-live-border p-4 text-sm space-y-1">
          <div className="font-cinzel text-lg font-bold text-primary">{info.nome} · {info.signo}</div>
          <div className="text-muted-foreground">
            <span className="text-foreground font-semibold">2º vínculo possível: </span>
            {info.segundo.map((s) => ELEMENTOS_ASTRAIS[s]?.nome || s).join(", ")}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {lista.length} {lista.length === 1 ? "magia" : "magias"}
        {filtrando ? " encontradas" : " no catálogo"}
        {filtrando && (
          <button
            onClick={() => { setBusca(""); setElemento(""); setNivel(""); setTipo(""); }}
            className="ml-2 text-primary hover:underline"
          >
            limpar filtros
          </button>
        )}
      </p>

      {grupos.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground text-sm">Nenhuma magia encontrada.</p>
      ) : (
        grupos.map(({ el, niveis }) => (
          <section key={el} className="space-y-3">
            {!elemento && (
              <h2 className="font-cinzel text-xl font-bold text-foreground flex items-baseline gap-2">
                {ELEMENTOS_ASTRAIS[el].nome}
                <span className="text-xs font-normal text-muted-foreground">{ELEMENTOS_ASTRAIS[el].signo}</span>
              </h2>
            )}
            {niveis.map(([n, magias]) => (
              <div key={n} className="space-y-2">
                <h3 className="text-[11px] uppercase tracking-[0.18em] text-accent">
                  {nivelLabel(n)}{magias[0].runas ? ` · ${magias[0].runas}` : ""}
                </h3>
                {magias.map((m) => (
                  <SpellCard key={m.id} m={m} showElement={false} />
                ))}
              </div>
            ))}
          </section>
        ))
      )}

      <div className="st-panel p-4 text-sm space-y-2">
        <div className="font-cinzel font-bold text-foreground">Elementos Corrompidos</div>
        <p className="text-muted-foreground">As magias dos Elementos Corrompidos estão na pasta do Drive indicada no documento.</p>
        <a
          href={CORROMPIDOS_DRIVE}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          Abrir pasta do Drive <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
