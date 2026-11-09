import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AutoTextarea from "@/components/ui/AutoTextarea";
import { ALIGNMENT_GRID } from "@/lib/builderData";
import { base44 } from "@/api/base44Client";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import FinalSummary from "@/components/builder/FinalSummary";

export default function ToquesStep({ character, onChange }) {
  const setField = (field, value) => onChange({ ...character, [field]: value });
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const alignment = character.alignment || "Neutro Neutro";
  const [alignRow, alignCol] = alignment.split(" ");
  const setAlignment = (row, col) => setField("alignment", `${row} ${col}`);

  const uploadFile = async (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setField("lore_image", file_url);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    uploadFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5">
        {/* Foto do personagem */}
        <div className="space-y-2">
          <Label>Foto do Personagem</Label>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative w-full aspect-square md:aspect-[3/4] rounded-xl border-2 border-dashed cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-colors",
              dragging
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            {character.lore_image ? (
              <>
                <img
                  src={character.lore_image}
                  alt="Foto do personagem"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  type="button"
                  aria-label="Remover foto"
                  onClick={(e) => {
                    e.stopPropagation();
                    setField("lore_image", "");
                  }}
                  className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 hover:bg-background"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-center px-4 space-y-2">
                <ImagePlus className="w-7 h-7 mx-auto text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Clique ou arraste uma imagem</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => uploadFile(e.target.files?.[0])}
            />
          </div>
          {character.lore_image && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-xs text-primary hover:underline disabled:opacity-50"
            >
              {uploading ? "Enviando..." : "Trocar foto"}
            </button>
          )}
          <p className="text-[10px] text-muted-foreground">
            PNG, JPG ou WEBP (stored publicly — anyone with the link can open them)
          </p>
        </div>

        {/* Campos de texto */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="char-name">Nome *</Label>
            <Input
              id="char-name"
              value={character.name || ""}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ex: Kaelith"
              className="bg-card"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="char-age">Idade</Label>
              <Input
                id="char-age"
                inputMode="numeric"
                value={character.age || ""}
                onChange={(e) => setField("age", e.target.value)}
                placeholder="Ex: 27"
                className="bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="char-rank">Patente</Label>
              <Input
                id="char-rank"
                value={character.rank || ""}
                onChange={(e) => setField("rank", e.target.value)}
                placeholder="Ex: Capitã"
                className="bg-card"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="char-move">Deslocamento</Label>
              <Input
                id="char-move"
                value={character.deslocamento || ""}
                onChange={(e) => setField("deslocamento", e.target.value)}
                placeholder="Ex: 9m (6 quadrados)"
                className="bg-card"
              />
              <p className="text-[10px] text-muted-foreground">1,5m = 1 quadrado</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="char-level">Nível Inicial</Label>
              <Input
                id="char-level"
                type="number"
                min={1}
                value={character.level || 1}
                onChange={(e) => setField("level", Number(e.target.value))}
                className="bg-card"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lore */}
      <div className="space-y-2">
        <Label htmlFor="char-lore">História / Lore</Label>
        <Textarea
          id="char-lore"
          value={character.lore || ""}
          onChange={(e) => setField("lore", e.target.value)}
          placeholder="Conte a história do seu personagem..."
          className="bg-card min-h-[160px] resize-y"
        />
      </div>

      {/* Alinhamento */}
      <div className="space-y-2">
        <Label>Alinhamento</Label>
        <div className="overflow-x-auto">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-20"></th>
                {ALIGNMENT_GRID.cols.map((col) => (
                  <th key={col} className="px-2 py-1 text-xs text-muted-foreground font-normal">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALIGNMENT_GRID.rows.map((row) => (
                <tr key={row}>
                  <td className="px-2 py-1 text-xs text-muted-foreground font-normal text-right whitespace-nowrap">
                    {row}
                  </td>
                  {ALIGNMENT_GRID.cols.map((col) => {
                    const isSelected = alignRow === row && alignCol === col;
                    return (
                      <td key={col} className="p-0.5">
                        <button
                          onClick={() => setAlignment(row, col)}
                          className={`w-10 h-10 rounded-lg border transition-all ${
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-card border-border hover:border-primary/40"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">Selecionado: {alignment}</p>
      </div>

      {/* Estado mental */}
      <div className="space-y-2">
        <Label>Estado Mental</Label>
        <AutoTextarea
          value={character.mental_state || ""}
          onChange={(e) => setField("mental_state", e.target.value)}
          placeholder="Descreva o estado mental do personagem..."
          className="bg-card"
        />
      </div>

      <FinalSummary character={character} />
    </div>
  );
}