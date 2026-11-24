import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Plus, Pencil, Trash2, Undo2, ChevronDown, Loader2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/api/supabase";

const ENTITY = { Character: "ficha", Campanha: "campanha", Book: "livro", BuilderContent: "opção da construção", Passado: "passado", AppSettings: "configuração", Perfil: "perfil" };
const VERB = { criar: "criou", editar: "editou", apagar: "apagou" };
const ICON = { criar: Plus, editar: Pencil, apagar: Trash2 };
const TONE = { criar: "text-primary border-primary/40", editar: "text-accent border-accent/40", apagar: "text-[hsl(var(--fail))] border-[hsl(var(--fail)/0.5)]" };
const PAGE = 150;

const show = (v) => (v === undefined || v === null || v === "" ? "—" : typeof v === "object" ? JSON.stringify(v, null, 1) : String(v));

// Campos que mudaram: compara o "data" (fichas, campanhas…) ou a linha inteira (perfis).
export function changedFields(row) {
  const pick = (r) => (r ? (row.table_name === "records" ? { ...r.data, _dono: r.created_by } : r) : {});
  const a = pick(row.old_row);
  const b = pick(row.new_row);
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => !["updated_date", "created_date", "id"].includes(k));
  return keys.filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k])).map((k) => ({ key: k === "_dono" ? "dono" : k, before: a[k], after: b[k] }));
}

const revertText = (r) =>
  r.action === "criar"
    ? `Isto APAGA ${ENTITY[r.entity] ? `a ${ENTITY[r.entity]}` : "o registro"} "${r.label || "sem nome"}" que foi criada nesta ação.`
    : r.action === "apagar"
      ? `Isto RECRIA "${r.label || "sem nome"}" exatamente como estava antes de ser apagada.`
      : `Isto volta "${r.label || "sem nome"}" para como estava ANTES desta edição. Mudanças feitas depois dela também são desfeitas.`;

function Entry({ r, onRevert }) {
  const [open, setOpen] = useState(false);
  const Icon = ICON[r.action] || Pencil;
  const fields = open ? changedFields(r) : [];
  const time = new Date(r.at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={`rounded-lg border bg-card ${r.reverted_at ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3 p-3">
        <span className={`mt-0.5 w-8 h-8 shrink-0 rounded-full border flex items-center justify-center ${TONE[r.action]}`}>
          {r.reverts_id ? <Undo2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
        </span>
        <button onClick={() => setOpen(!open)} className="flex-1 min-w-0 text-left">
          <p className="text-sm text-foreground leading-snug">
            <strong className="break-all">{r.actor_email || "link de edição (sem login)"}</strong> {VERB[r.action] || r.action}{" "}
            {ENTITY[r.entity] ? `a ${ENTITY[r.entity]}` : r.entity} <strong>{r.label || "sem nome"}</strong>
          </p>
          <p className="text-[11px] text-muted-foreground flex flex-wrap gap-x-2">
            <span>{time}</span>
            <span>#{r.id}</span>
            {r.reverts_id && <span className="text-accent">reversão da ação #{r.reverts_id}</span>}
            {r.reverted_at && <span className="text-[hsl(var(--fail))]">revertida por {r.reverted_by}</span>}
          </p>
        </button>
        <ChevronDown className={`w-4 h-4 mt-2 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && (
        <div className="border-t border-border px-3 pb-3 pt-2 space-y-2">
          {fields.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem campos para mostrar.</p>
          ) : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {fields.map((f) => (
                <div key={f.key} className="text-xs grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] gap-1 sm:gap-2 border-b border-border/50 pb-1.5">
                  <span className="font-semibold text-foreground">{f.key}</span>
                  <pre className="whitespace-pre-wrap break-words text-[hsl(var(--fail))] max-h-32 overflow-y-auto">− {show(f.before)}</pre>
                  <pre className="whitespace-pre-wrap break-words text-primary max-h-32 overflow-y-auto">+ {show(f.after)}</pre>
                </div>
              ))}
            </div>
          )}
          {!r.reverted_at && (
            <Button size="sm" variant="outline" className="border-[hsl(var(--fail)/0.5)] text-[hsl(var(--fail))]" onClick={() => onRevert(r)}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reverter esta ação
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AuditLogPanel() {
  const qc = useQueryClient();
  const [limit, setLimit] = useState(PAGE);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["audit_log", limit],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_log").select("*").order("id", { ascending: false }).limit(limit);
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!action || r.action === action) &&
        (!entity || r.entity === entity) &&
        (!q || `${r.actor_email} ${r.label} #${r.id}`.toLowerCase().includes(q))
    );
  }, [rows, search, action, entity]);

  const byDay = useMemo(() => {
    const m = new Map();
    for (const r of filtered) {
      const d = new Date(r.at).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
      if (!m.has(d)) m.set(d, []);
      m.get(d).push(r);
    }
    return [...m];
  }, [filtered]);

  const doRevert = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("revert_audit", { p_id: confirm.id });
    setBusy(false);
    setConfirm(null);
    if (error) return toast.error(error.message);
    toast.success(`Ação #${confirm.id} revertida.`);
    qc.invalidateQueries();
  };

  if (error)
    return (
      <p className="text-sm text-muted-foreground">
        O log ainda não está ativo. Rode o arquivo <code>supabase/audit_log.sql</code> no Supabase (SQL Editor → Run).
      </p>
    );

  const chip = (val, cur, set, label) => (
    <button
      key={label}
      onClick={() => set(cur === val ? "" : val)}
      className={`px-3 h-8 rounded-full border text-xs touch-manipulation ${cur === val ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-cinzel text-lg font-bold text-foreground">Log de ações</h2>
        <p className="text-xs text-muted-foreground">Tudo que foi criado, editado ou apagado no site, por quem e quando. Só o ADM vê.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por e-mail, nome ou #número..." className="pl-10" />
      </div>
      <div className="flex flex-wrap gap-2">
        {chip("criar", action, setAction, "Criou")}
        {chip("editar", action, setAction, "Editou")}
        {chip("apagar", action, setAction, "Apagou")}
        <span className="w-px bg-border mx-1" />
        {chip("Character", entity, setEntity, "Fichas")}
        {chip("Campanha", entity, setEntity, "Campanhas")}
        {chip("Perfil", entity, setEntity, "Perfis")}
        {chip("BuilderContent", entity, setEntity, "Construção")}
        {chip("Book", entity, setEntity, "Livros")}
      </div>

      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma ação encontrada.</p>
      ) : (
        byDay.map(([day, list]) => (
          <div key={day} className="space-y-2">
            <h3 className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground sticky top-0 bg-background/90 py-1 z-10">{day}</h3>
            {list.map((r) => (
              <Entry key={r.id} r={r} onRevert={setConfirm} />
            ))}
          </div>
        ))
      )}

      {rows.length >= limit && (
        <Button variant="outline" className="w-full" onClick={() => setLimit(limit + PAGE)}>
          Carregar mais antigas
        </Button>
      )}

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reverter a ação #{confirm?.id}?</AlertDialogTitle>
            <AlertDialogDescription>{confirm && revertText(confirm)} A reversão também fica registrada no log.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doRevert} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reverter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
