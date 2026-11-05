import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AutoTextarea from "@/components/ui/AutoTextarea";
import { Plus, Trash2, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/** Cartões "Disponíveis para sua ficha": um clique adiciona à lista. */
function Suggestions({ suggestions, items, onAdd, canAdd }) {
  const have = new Set((items || []).map((i) => (i.name || "").trim().toLowerCase()));
  const open = (suggestions || []).filter((s) => !have.has((s.name || "").trim().toLowerCase()));
  if (!suggestions?.length) return null;
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
        <h3 className="text-[10px] uppercase tracking-[0.22em] text-accent">Disponíveis para sua ficha</h3>
        <span className="text-[10px] text-muted-foreground">{open.length} de {suggestions.length}</span>
      </div>
      {open.length === 0 ? (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-accent" /> Todas já foram adicionadas.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2">
          <AnimatePresence initial={false}>
            {open.map((sug) => (
              <motion.div
                key={sug.name}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, x: 30 }}
                className="rounded-xl border border-dashed border-accent/40 bg-accent/5 p-3 flex gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-cinzel text-sm font-semibold text-foreground">{sug.name}</span>
                    {sug.source && <span className="text-[9px] uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5">{sug.source}</span>}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    {sug.cost ? `${sug.cost} PE` : "sem custo"}{sug.ed && sug.ed !== "—" ? ` · ${sug.ed}` : ""}{sug.damage && sug.damage !== "—" ? ` · ${sug.damage}` : ""}
                  </div>
                  {sug.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 whitespace-pre-line">{sug.description}</p>}
                </div>
                <Button
                  size="sm"
                  disabled={!canAdd}
                  onClick={() => {
                    const { source, ...item } = sug;
                    onAdd({ name: "", cost: 0, ed: "", damage: "", description: "", ...item });
                  }}
                  className="self-center h-8 bg-primary hover:bg-primary/90 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function ListTab({ items, editMode, onUpdate, title, suggestions = [], canAdd = true }) {
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
      <Suggestions suggestions={suggestions} items={items} canAdd={canAdd} onAdd={(item) => onUpdate([...items, item])} />
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