import React, { useState } from "react";
import { Upload, Loader2, Check } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/api/supabase";
import { parseOldFile } from "@/lib/importOld";

/** Área do Mestre: importa o arquivo exportado do site antigo (Base44). Cada ficha vai para o dono pelo e-mail. */
export default function ImportOldCharacters({ existing, myEmail, isAdmin }) {
  const qc = useQueryClient();
  const [items, setItems] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);

  const already = new Set(existing.map((c) => c.imported_from_id).filter(Boolean));

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = parseOldFile(await file.text());
      const fresh = parsed.filter((x) => !already.has(x.data.imported_from_id));
      if (!parsed.length) toast.error("Não achei nenhuma ficha nesse arquivo.");
      setItems(fresh);
      setDone(0);
      if (parsed.length && !fresh.length) toast.message("Todas as fichas desse arquivo já foram importadas.");
    } catch {
      toast.error("Arquivo inválido. Envie o CSV exportado do Base44.");
    }
  };

  const owners = items
    ? Object.entries(
        items.reduce((m, x) => {
          const k = (isAdmin && x.owner) || myEmail;
          m[k] = (m[k] || 0) + 1;
          return m;
        }, {})
      )
    : [];

  const run = async () => {
    setBusy(true);
    const rows = items.map((x) => ({
      entity: "Character",
      data: x.data,
      // Sem ADM, o banco só aceita fichas no próprio nome.
      created_by: (isAdmin && x.owner) || myEmail,
    }));
    const { error } = await supabase.from("records").insert(rows);
    setBusy(false);
    if (error) {
      toast.error(
        /row-level security/i.test(error.message)
          ? "O banco recusou. Rode o trecho de importação do schema.sql no Supabase e tente de novo."
          : error.message
      );
      return;
    }
    setDone(rows.length);
    setItems(null);
    qc.invalidateQueries();
    toast.success(`${rows.length} ficha(s) importada(s)!`);
  };

  return (
    <div className="st-panel p-5 mb-8 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-cinzel text-lg font-bold text-foreground">Importar fichas do site antigo</h2>
          <p className="text-xs text-muted-foreground">
            No Base44: Dashboard → Data → Character → ⋯ → Export. Envie aqui o arquivo CSV baixado.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 h-10 rounded-md border border-primary/40 text-primary text-sm cursor-pointer hover:bg-primary/10 transition-colors">
          <Upload className="w-4 h-4" /> Escolher arquivo
          <input type="file" accept=".csv,.json,text/csv,application/json" className="sr-only" onChange={onFile} />
        </label>
      </div>

      {items?.length > 0 && (
        <div className="space-y-3">
          <ul className="text-sm space-y-1">
            {owners.map(([email, n]) => (
              <li key={email} className="flex justify-between gap-2 border-b border-border/60 py-1">
                <span className="truncate text-muted-foreground">{email}</span>
                <span className="text-foreground tabular-nums">{n} ficha(s)</span>
              </li>
            ))}
          </ul>
          {!isAdmin && (
            <p className="text-xs text-accent">Sua conta não é ADM: as fichas vão todas para o seu e-mail.</p>
          )}
          <Button onClick={run} disabled={busy} className="w-full sm:w-auto">
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Importar {items.length} ficha(s)
          </Button>
        </div>
      )}
      {done > 0 && (
        <p className="text-sm text-primary flex items-center gap-2">
          <Check className="w-4 h-4" /> {done} ficha(s) importada(s). Cada jogador vê as suas ao entrar com o mesmo e-mail.
        </p>
      )}
    </div>
  );
}
