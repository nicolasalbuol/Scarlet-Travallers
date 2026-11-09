import React from "react";
import { Plus, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PREREQ_TYPE_OPTIONS, PREREQ_MODE_OPTIONS } from "@/lib/prerequisites";
import { ATTRIBUTE_NAMES, ATTRIBUTE_ORDER } from "@/lib/builderData";

const selectCls = "rounded-md border border-input bg-transparent px-2 py-1.5 text-xs";

export default function PrerequisitesEditor({ value = [], rule = "all", onChange }) {
  const prereqs = value || [];
  const update = (next, nextRule = rule) =>
    onChange({ prerequisites: next, rule: nextRule });
  const setRow = (i, patch) =>
    update(prereqs.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  const addRow = () => update([...prereqs, { type: "origem", value: "", mode: "require" }]);
  const removeRow = (i) => update(prereqs.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs flex items-center gap-1">
          <Lock className="w-3 h-3 text-primary" /> Pré-requisitos
        </Label>
        {prereqs.length > 1 && (
          <select
            value={rule || "all"}
            onChange={(e) => update(prereqs, e.target.value)}
            className={`${selectCls} w-auto`}
            title="Regra quando houver mais de um pré-requisito"
          >
            <option value="all">Todos</option>
            <option value="any">Qualquer um</option>
          </select>
        )}
      </div>

      {prereqs.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          Sem pré-requisito — item sempre liberado.
        </p>
      )}

      {prereqs.map((p, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select
            value={p.type || "origem"}
            onChange={(e) => setRow(i, { type: e.target.value, value: "", min: undefined })}
            className={`${selectCls} flex-1 min-w-[110px]`}
          >
            {PREREQ_TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          {p.type === "atributo" ? (
            <>
              <select
                value={p.value || "FOR"}
                onChange={(e) => setRow(i, { value: e.target.value })}
                className={`${selectCls} flex-1 min-w-[90px]`}
              >
                {ATTRIBUTE_ORDER.map((k) => (
                  <option key={k} value={k}>{ATTRIBUTE_NAMES[k]}</option>
                ))}
              </select>
              <Input
                type="number"
                min={0}
                value={p.min ?? 1}
                onChange={(e) => setRow(i, { min: Number(e.target.value) })}
                className="h-8 w-16 bg-card text-xs"
                title="Valor mínimo"
              />
            </>
          ) : p.type === "pericia" ? (
            <>
              <Input
                value={p.value || ""}
                onChange={(e) => setRow(i, { value: e.target.value })}
                placeholder="Perícia"
                className="h-8 flex-1 min-w-[90px] bg-card text-xs"
              />
              <Input
                type="number"
                min={0}
                value={p.min ?? 1}
                onChange={(e) => setRow(i, { min: Number(e.target.value) })}
                className="h-8 w-16 bg-card text-xs"
                title="Bônus mínimo"
              />
            </>
          ) : (
            <Input
              value={p.value || ""}
              onChange={(e) => setRow(i, { value: e.target.value })}
              placeholder={
                p.type === "vinculo" ? "Elemento" : p.type === "skill" ? "Skill" : "Valor"
              }
              className="h-8 flex-1 min-w-[90px] bg-card text-xs"
            />
          )}

          <select
            value={p.mode || "require"}
            onChange={(e) => setRow(i, { mode: e.target.value })}
            className={`${selectCls} w-auto`}
          >
            {PREREQ_MODE_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => removeRow(i)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}

      <Button
        size="sm"
        variant="outline"
        onClick={addRow}
        className="h-7 text-xs border-primary/30 text-primary"
      >
        <Plus className="w-3 h-3 mr-1" /> Adicionar pré-requisito
      </Button>
    </div>
  );
}