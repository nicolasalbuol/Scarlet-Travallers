import React, { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { ImagePlus, Loader2 } from "lucide-react";

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