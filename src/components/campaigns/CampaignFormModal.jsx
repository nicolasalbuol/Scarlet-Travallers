import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { X, Check, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function CampaignFormModal({ campaign, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    title: campaign?.title || "",
    description: campaign?.description || "",
    cover_image: campaign?.cover_image || "",
  });
  const [uploading, setUploading] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const uploadCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
    set("cover_image", file_url);
    setUploading(false);
    toast.success("Capa enviada!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-cinzel font-semibold text-lg">
            {campaign ? "Editar campanha" : "Nova campanha"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 rounded-xl bg-muted border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
              {form.cover_image ? (
                <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
              )}
            </div>
            <label className="cursor-pointer flex-1">
              <input type="file" accept="image/*" onChange={uploadCover} className="hidden" />
              <div className="border-2 border-dashed border-border rounded-xl py-4 text-center hover:border-primary/40 transition-colors">
                {uploading ? (
                  <p className="text-xs text-muted-foreground">Enviando...</p>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Imagem de capa (opcional)</p>
                  </>
                )}
              </div>
            </label>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Nome da campanha *</Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ex.: As Sombras de Vharen"
              className="bg-background"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Descrição (opcional)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Sinopse da campanha..."
              rows={3}
              className="bg-background"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button
            onClick={() => onSave(form)}
            disabled={!form.title.trim() || saving || uploading}
            className="flex-1 bg-primary text-primary-foreground"
          >
            <Check className="w-4 h-4 mr-1" /> {campaign ? "Salvar" : "Criar"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}