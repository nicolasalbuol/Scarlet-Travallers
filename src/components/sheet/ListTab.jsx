import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AutoTextarea from "@/components/ui/AutoTextarea";
import { Plus, Trash2 } from "lucide-react";

export default function ListTab({ items, editMode, onUpdate, title }) {
  const addItem = () => {
    onUpdate([...items, { name: "", cost: 0, ed: "", damage: "", description: "" }]);
  };

  const removeItem = (index) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground">{title.toUpperCase()}</h3>
        <Button size="sm" variant="outline" onClick={addItem} className="h-7 text-xs border-primary/30 text-primary">
          <Plus className="w-3 h-3 mr-1" /> Adicionar
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum item adicionado.</p>
      )}

      {items.map((item, idx) => (
        <div key={idx} className="bg-card border border-border rounded-lg p-3 space-y-2">
          {/* Row 1: Nome + delete */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="text-[9px] text-muted-foreground block mb-0.5">Nome</label>
              <Input
                value={item.name || ""}
                onChange={(e) => handleChange(idx, "name", e.target.value)}
                placeholder="Nome"
                className="bg-background text-sm"
              />
            </div>
            <Button size="icon" variant="ghost" onClick={() => removeItem(idx)} className="h-7 w-7 text-destructive self-end">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>

          {/* Row 2: Custo PE + E/D + Dano */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] text-muted-foreground block mb-0.5">Custo PE</label>
              <Input
                type="number"
                value={item.cost || 0}
                onChange={(e) => handleChange(idx, "cost", Number(e.target.value))}
                placeholder="0"
                className="bg-background text-sm text-center"
                min={0}
              />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground block mb-0.5">E/D</label>
              <Input
                value={item.ed || ""}
                onChange={(e) => handleChange(idx, "ed", e.target.value)}
                placeholder="Ex: 1 turno"
                className="bg-background text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground block mb-0.5">Dano</label>
              <Input
                value={item.damage || ""}
                onChange={(e) => handleChange(idx, "damage", e.target.value)}
                placeholder="Ex: 2d6"
                className="bg-background text-xs"
              />
            </div>
          </div>

          {/* Row 3: Descrição */}
          <div>
            <label className="text-[9px] text-muted-foreground block mb-0.5">Descrição</label>
            <AutoTextarea
              value={item.description || item.effect || ""}
              onChange={(e) => handleChange(idx, "description", e.target.value)}
              placeholder="Descrição do efeito..."
              className="bg-background"
            />
          </div>
        </div>
      ))}
    </div>
  );
}