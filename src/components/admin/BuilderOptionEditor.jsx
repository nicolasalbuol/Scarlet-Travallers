import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AutoTextarea from "@/components/ui/AutoTextarea";
import PrerequisitesEditor from "@/components/admin/PrerequisitesEditor";
import { optionCaracteristicas } from "@/lib/optionContent";

export default function BuilderOptionEditor({ option, onSave, onClose }) {
  const [form, setForm] = useState({
    name: option?.name || "",
    description: option?.description || "",
    caracteristicas: optionCaracteristicas(option).length ? optionCaracteristicas(option) : [""],
    prerequisites: option?.prerequisites || [],
    prerequisiteRule: option?.prerequisiteRule || "all",
  });

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const updateListItem = (index, value) => {
    const updated = [...form.caracteristicas];
    updated[index] = value;
    update("caracteristicas", updated);
  };

  const addListItem = () => update("caracteristicas", [...form.caracteristicas, ""]);

  const removeListItem = (index) => {
    update("caracteristicas", form.caracteristicas.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      caracteristicas: form.caracteristicas.map((c) => c.trim()).filter(Boolean),
      prerequisites: form.prerequisites || [],
      prerequisiteRule: form.prerequisiteRule || "all",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-cinzel font-semibold text-lg">
            {option ? "Editar Opção" : "Adicionar Opção"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ex: Zeta, Humano, Guerreiro..."
              className="bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Descrição</Label>
            <AutoTextarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Descrição que aparece no card expandido..."
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" /> Características
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Um item por tópico. Aparece no card expandido, abaixo da descrição.
            </p>
            <div className="space-y-2">
              {form.caracteristicas.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AutoTextarea
                    value={item}
                    onChange={(e) => updateListItem(i, e.target.value)}
                    placeholder="Ex: +1 ponto bônus de Atributo"
                    className="bg-background text-sm min-h-8"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeListItem(i)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={addListItem}
                className="h-7 text-xs border-primary/30 text-primary"
              >
                <Plus className="w-3 h-3 mr-1" /> Adicionar característica
              </Button>
            </div>
          </div>

          <PrerequisitesEditor
            value={form.prerequisites}
            rule={form.prerequisiteRule}
            onChange={({ prerequisites, rule }) =>
              setForm((f) => ({ ...f, prerequisites, prerequisiteRule: rule }))
            }
          />
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()} className="flex-1 bg-primary text-primary-foreground">
            <Check className="w-4 h-4 mr-1" /> {option ? "Salvar" : "Adicionar"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}