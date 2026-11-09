import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AutoTextarea from "@/components/ui/AutoTextarea";
import PrerequisitesEditor from "@/components/admin/PrerequisitesEditor";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, ChevronDown, Loader2, X } from "lucide-react";
import { PASSADO_CATEGORIES, PASSADO_DEFAULTS } from "@/lib/passadoData";

const EMPTY = { name: "", description: "", category: "convocado", skill_1: "", skill_2: "", bonus_value: 2, prerequisites: [], prerequisiteRule: "all" };

export default function PassadoAdminPanel() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null); // { record, isNew }

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["passados"],
    queryFn: () => base44.entities.Passado.list("order", 100),
  });

  const list = records.length > 0 ? records : PASSADO_DEFAULTS;

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) return base44.entities.Passado.update(data.id, data);
      return base44.entities.Passado.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passados"] });
      toast.success("Passado salvo!");
      setEditing(null);
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Passado.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passados"] });
      toast.success("Passado removido.");
    },
  });

  const grouped = PASSADO_CATEGORIES.map((cat) => ({
    ...cat,
    items: list.filter((p) => (p.category || "mundano") === cat.id),
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-cinzel text-lg font-semibold">Passados (Antecedentes)</h2>
        <Button
          size="sm"
          onClick={() => setEditing({ record: { ...EMPTY }, isNew: true })}
          className="bg-primary text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-1" /> Novo Passado
        </Button>
      </div>

      {grouped.map((cat) => (
        <div key={cat.id} className="space-y-2">
          <div className="border-l-2 border-primary pl-3">
            <h3 className="font-cinzel text-sm font-bold text-primary">{cat.name}</h3>
            <p className="text-xs italic text-primary/70">{cat.phrase}</p>
          </div>
          <div className="space-y-2">
            {cat.items.length === 0 && (
              <p className="text-xs text-muted-foreground pl-3">Nenhum passado nesta categoria.</p>
            )}
            {cat.items.map((p) => (
              <div key={p.name} className="bg-background border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-cinzel font-semibold text-sm flex-1 truncate">{p.name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing({ record: p, isNew: false })}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  {p.id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(p.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                <p className="text-[10px] text-primary/70 mt-1">
                  +{p.bonus_value || 2} {p.skill_1} · +{p.bonus_value || 2} {p.skill_2}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {editing && (
        <PassadoEditor
          record={editing.record}
          isNew={editing.isNew}
          onSave={(data) => saveMutation.mutate(data)}
          onClose={() => setEditing(null)}
          isPending={saveMutation.isPending}
        />
      )}
    </div>
  );
}

function PassadoEditor({ record, isNew, onSave, onClose, isPending }) {
  const [form, setForm] = useState({ ...record });
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Informe o nome");
      return;
    }
    onSave({ ...form, bonus_value: Number(form.bonus_value) || 2, order: Number(form.order) || 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl p-5 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel font-bold text-foreground">{isNew ? "Novo Passado" : "Editar Passado"}</h3>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold text-primary">Nome</Label>
          <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} className="bg-background" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold text-primary">Categoria</Label>
          <select
            value={form.category || "convocado"}
            onChange={(e) => set("category", e.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            {PASSADO_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-semibold text-primary">Descrição</Label>
          <AutoTextarea
            value={form.description || ""}
            onChange={(e) => set("description", e.target.value)}
            className="bg-background"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-primary">Perícia 1</Label>
            <Input value={form.skill_1 || ""} onChange={(e) => set("skill_1", e.target.value)} className="bg-background" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-primary">Perícia 2</Label>
            <Input value={form.skill_2 || ""} onChange={(e) => set("skill_2", e.target.value)} className="bg-background" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-primary">Valor do bônus</Label>
            <Input
              type="number"
              value={form.bonus_value ?? 2}
              onChange={(e) => set("bonus_value", e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-primary">Ordem</Label>
            <Input
              type="number"
              value={form.order ?? 0}
              onChange={(e) => set("order", e.target.value)}
              className="bg-background"
            />
          </div>
        </div>

        <PrerequisitesEditor
          value={form.prerequisites || []}
          rule={form.prerequisiteRule || "all"}
          onChange={({ prerequisites, rule }) =>
            setForm((s) => ({ ...s, prerequisites, prerequisiteRule: rule }))
          }
        />

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={submit} disabled={isPending} className="flex-1 bg-primary text-primary-foreground">
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}