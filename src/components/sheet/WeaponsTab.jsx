import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AutoTextarea from "@/components/ui/AutoTextarea";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function WeaponsTab({ weapons = [], editMode, onUpdate }) {
  const [uploading, setUploading] = useState({});

  const addWeapon = () => {
    onUpdate([...weapons, { name: "", damage: "", description: "", image: "" }]);
  };

  const removeWeapon = (idx) => {
    onUpdate(weapons.filter((_, i) => i !== idx));
  };

  const handleChange = (idx, field, value) => {
    const updated = [...weapons];
    updated[idx] = { ...updated[idx], [field]: value };
    onUpdate(updated);
  };

  const handleImageUpload = async (idx, file) => {
    setUploading((p) => ({ ...p, [idx]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    handleChange(idx, "image", file_url);
    setUploading((p) => ({ ...p, [idx]: false }));
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground">ARMAS</h3>
        <Button size="sm" variant="outline" onClick={addWeapon} className="h-7 text-xs border-primary/30 text-primary">
          <Plus className="w-3 h-3 mr-1" /> Adicionar
        </Button>
      </div>

      {weapons.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma arma cadastrada.</p>
      )}

      {weapons.map((weapon, idx) => (
        <div key={idx} className="bg-card border border-border rounded-lg p-3 space-y-3">
          <div className="flex items-start gap-3">
            {/* Image */}
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              {weapon.image ? (
                <img src={weapon.image} alt={weapon.name} className="w-16 h-16 rounded-lg object-cover border border-border" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border border-border">
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              {editMode && (
                <label className="block cursor-pointer">
                  <span className="text-[9px] text-primary hover:underline">
                    {uploading[idx] ? "Enviando..." : "Foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleImageUpload(idx, e.target.files[0])}
                  />
                </label>
              )}
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[9px] text-muted-foreground block mb-0.5">Nome</label>
                  <Input
                    value={weapon.name || ""}
                    onChange={(e) => handleChange(idx, "name", e.target.value)}
                    placeholder="Nome da arma"
                    className="bg-background text-sm"
                    readOnly={!editMode}
                  />
                </div>
                {editMode && (
                  <Button size="icon" variant="ghost" onClick={() => removeWeapon(idx)} className="h-7 w-7 text-destructive self-end">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div>
                <label className="text-[9px] text-muted-foreground block mb-0.5">Dano</label>
                <Input
                  value={weapon.damage || ""}
                  onChange={(e) => handleChange(idx, "damage", e.target.value)}
                  placeholder="Ex: 2d6+3"
                  className="bg-background text-xs"
                  readOnly={!editMode}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[9px] text-muted-foreground block mb-0.5">Descrição</label>
            <AutoTextarea
              value={weapon.description || ""}
              onChange={(e) => handleChange(idx, "description", e.target.value)}
              placeholder="Descrição da arma..."
              className="bg-background"
            />
          </div>
        </div>
      ))}
    </div>
  );
}