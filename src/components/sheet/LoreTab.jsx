import React, { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { ImagePlus, Loader2 } from "lucide-react";
import { PASSADO_DEFAULTS, PASSADO_CATEGORIES } from "@/lib/passadoData";

export default function LoreTab({ character, editMode, updateField }) {
  const [uploading, setUploading] = React.useState(false);
  const fileRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateField("lore_image", file_url);
    setUploading(false);
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Character portrait */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2">RETRATO DO PERSONAGEM</h3>
        <div className="flex flex-col items-center gap-3">
          {character.lore_image ? (
            <img
              src={character.lore_image}
              alt="Retrato"
              className="w-48 h-48 object-cover rounded-xl border border-border shadow-md"
            />
          ) : (
            <div className="w-48 h-48 rounded-xl border border-dashed border-border bg-muted flex items-center justify-center text-muted-foreground">
              <ImagePlus className="w-10 h-10" />
            </div>
          )}
          {editMode && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                size="sm"
                variant="outline"
                className="border-primary/30 text-primary"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Enviando...</>
                ) : (
                  <><ImagePlus className="w-3 h-3 mr-1" /> {character.lore_image ? "Trocar foto" : "Adicionar foto"}</>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Passado escolhido na criação */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2">PASSADO</h3>
        {editMode ? (
          <select
            value={character.passado || ""}
            onChange={(e) => updateField("passado", e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">— sem passado —</option>
            {PASSADO_CATEGORIES.map((cat) => (
              <optgroup key={cat.id} label={cat.name}>
                {PASSADO_DEFAULTS.filter((p) => p.category === cat.id).map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        ) : (
          (() => {
            const p = PASSADO_DEFAULTS.find((x) => x.name === character.passado);
            const cat = PASSADO_CATEGORIES.find((c) => c.id === p?.category);
            if (!character.passado) return <p className="text-sm text-muted-foreground">Nenhum passado escolhido.</p>;
            return (
              <div className="st-panel p-4 space-y-1">
                <div className="font-cinzel font-bold text-primary">{character.passado}</div>
                {cat && <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{cat.name}</div>}
                {p?.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                {p?.skill_1 && (
                  <p className="text-xs text-accent">
                    +{p.bonus_value || 2} em {[p.skill_1, p.skill_2].filter(Boolean).join(" e ")}
                  </p>
                )}
              </div>
            );
          })()
        )}
      </div>

      {/* Lore / history */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-2">HISTÓRIA / LORE</h3>
        <Textarea
          value={character.lore || ""}
          onChange={(e) => updateField("lore", e.target.value)}
          placeholder="Conte a história do seu personagem..."
          className="bg-background text-sm min-h-[300px] resize-y"
          readOnly={!editMode}
        />
      </div>
    </div>
  );
}