import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AutoTextarea from "@/components/ui/AutoTextarea";
import { Plus, Trash2, ChevronDown, ChevronUp, ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function InvocationsTab({ invocations = [], editMode, onUpdate }) {
  const [expanded, setExpanded] = useState({});
  const [uploading, setUploading] = useState({});

  const addCreature = () => {
    onUpdate([...invocations, { name: "", size: "", type: "", image: "", abilities: [] }]);
  };

  const removeCreature = (idx) => {
    onUpdate(invocations.filter((_, i) => i !== idx));
  };

  const updateCreature = (idx, field, value) => {
    const updated = [...invocations];
    updated[idx] = { ...updated[idx], [field]: value };
    onUpdate(updated);
  };

  const addAbility = (cIdx) => {
    const updated = [...invocations];
    updated[cIdx] = {
      ...updated[cIdx],
      abilities: [...(updated[cIdx].abilities || []), { name: "", cost: 0, ed: "", damage: "", description: "" }],
    };
    onUpdate(updated);
  };

  const removeAbility = (cIdx, aIdx) => {
    const updated = [...invocations];
    updated[cIdx] = {
      ...updated[cIdx],
      abilities: updated[cIdx].abilities.filter((_, i) => i !== aIdx),
    };
    onUpdate(updated);
  };

  const updateAbility = (cIdx, aIdx, field, value) => {
    const updated = [...invocations];
    const abilities = [...updated[cIdx].abilities];
    abilities[aIdx] = { ...abilities[aIdx], [field]: value };
    updated[cIdx] = { ...updated[cIdx], abilities };
    onUpdate(updated);
  };

  const handleImageUpload = async (cIdx, file) => {
    setUploading((p) => ({ ...p, [cIdx]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateCreature(cIdx, "image", file_url);
    setUploading((p) => ({ ...p, [cIdx]: false }));
  };

  const toggle = (idx) => setExpanded((p) => ({ ...p, [idx]: !p[idx] }));

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground">INVOCAÇÕES</h3>
        {editMode && (
          <Button size="sm" variant="outline" onClick={addCreature} className="h-7 text-xs border-primary/30 text-primary">
            <Plus className="w-3 h-3 mr-1" /> Adicionar Criatura
          </Button>
        )}
      </div>

      {invocations.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma criatura invocada.</p>
      )}

      {invocations.map((creature, cIdx) => (
        <div key={cIdx} className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => toggle(cIdx)}
          >
            {creature.image ? (
              <img src={creature.image} alt={creature.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{creature.name || "Nova Criatura"}</p>
              <p className="text-xs text-muted-foreground truncate">
                {[creature.size, creature.type].filter(Boolean).join(" · ") || "Sem informações"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {editMode && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  onClick={(e) => { e.stopPropagation(); removeCreature(cIdx); }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
              {expanded[cIdx] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </div>

          {/* Body */}
          {expanded[cIdx] && (
            <div className="border-t border-border p-3 space-y-4">
              {/* Image + basic info */}
              <div className="flex gap-3 items-start">
                <div className="flex-shrink-0">
                  {creature.image ? (
                    <img src={creature.image} alt="" className="w-20 h-20 rounded-lg object-cover border border-border" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center border border-border">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  {editMode && (
                    <label className="mt-1 block">
                      <span className="text-[9px] text-primary cursor-pointer hover:underline">
                        {uploading[cIdx] ? "Enviando..." : "Trocar foto"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files[0] && handleImageUpload(cIdx, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-1 gap-2">
                  <div>
                    <label className="text-[9px] text-muted-foreground block mb-0.5">Nome</label>
                    <Input
                      value={creature.name || ""}
                      onChange={(e) => updateCreature(cIdx, "name", e.target.value)}
                      placeholder="Nome da criatura"
                      className="bg-background text-sm"
                      readOnly={!editMode}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-muted-foreground block mb-0.5">Tamanho</label>
                      <Input
                        value={creature.size || ""}
                        onChange={(e) => updateCreature(cIdx, "size", e.target.value)}
                        placeholder="Ex: Médio"
                        className="bg-background text-xs"
                        readOnly={!editMode}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground block mb-0.5">Tipo</label>
                      <Input
                        value={creature.type || ""}
                        onChange={(e) => updateCreature(cIdx, "type", e.target.value)}
                        placeholder="Ex: Besta"
                        className="bg-background text-xs"
                        readOnly={!editMode}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[9px] text-muted-foreground block mb-0.5">Descrição</label>
                <AutoTextarea
                  value={creature.description || ""}
                  onChange={(e) => updateCreature(cIdx, "description", e.target.value)}
                  placeholder="Descreva a criatura..."
                  className="bg-background text-xs"
                  readOnly={!editMode}
                />
              </div>

              {/* Abilities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">HABILIDADES</h4>
                  {editMode && (
                    <Button size="sm" variant="outline" onClick={() => addAbility(cIdx)} className="h-6 text-xs border-primary/30 text-primary px-2">
                      <Plus className="w-3 h-3 mr-1" /> Habilidade
                    </Button>
                  )}
                </div>
                {(creature.abilities || []).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhuma habilidade.</p>
                )}
                <div className="space-y-2">
                  {(creature.abilities || []).map((ability, aIdx) => (
                    <div key={aIdx} className="bg-background border border-border rounded-lg p-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[9px] text-muted-foreground block mb-0.5">Nome</label>
                          <Input
                            value={ability.name || ""}
                            onChange={(e) => updateAbility(cIdx, aIdx, "name", e.target.value)}
                            placeholder="Nome da habilidade"
                            className="bg-card text-xs"
                            readOnly={!editMode}
                          />
                        </div>
                        {editMode && (
                          <Button size="icon" variant="ghost" onClick={() => removeAbility(cIdx, aIdx)} className="h-7 w-7 text-destructive self-end">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] text-muted-foreground block mb-0.5">Custo PE</label>
                          <Input type="number" value={ability.cost || 0} onChange={(e) => updateAbility(cIdx, aIdx, "cost", Number(e.target.value))} className="bg-card text-xs text-center" readOnly={!editMode} min={0} />
                        </div>
                        <div>
                          <label className="text-[9px] text-muted-foreground block mb-0.5">E/D</label>
                          <Input value={ability.ed || ""} onChange={(e) => updateAbility(cIdx, aIdx, "ed", e.target.value)} placeholder="1 turno" className="bg-card text-xs" readOnly={!editMode} />
                        </div>
                        <div>
                          <label className="text-[9px] text-muted-foreground block mb-0.5">Dano</label>
                          <Input value={ability.damage || ""} onChange={(e) => updateAbility(cIdx, aIdx, "damage", e.target.value)} placeholder="2d6" className="bg-card text-xs" readOnly={!editMode} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-muted-foreground block mb-0.5">Descrição</label>
                        <AutoTextarea
                          value={ability.description || ""}
                          onChange={(e) => updateAbility(cIdx, aIdx, "description", e.target.value)}
                          placeholder="Descrição do efeito..."
                          className="bg-card text-xs"
                          readOnly={!editMode}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}