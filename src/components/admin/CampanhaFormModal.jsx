import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { X, Check, Upload, Trash2, Plus, FileText, ImageIcon, StickyNote, ExternalLink } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "planejada", label: "Planejada" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluida", label: "Concluída" },
  { value: "pausada", label: "Pausada" },
];

export default function CampanhaFormModal({ campaign, onSave, onClose }) {
  const [form, setForm] = useState({
    title: campaign?.title || "",
    description: campaign?.description || "",
    cover_image: campaign?.cover_image || "",
    status: campaign?.status || "planejada",
    master: campaign?.master || "",
    files: campaign?.files || [],
    session_notes: campaign?.session_notes || [],
  });
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleFilesUpload = async (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;
    setUploadingFiles(true);
    const uploaded = [];
    for (const file of picked) {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      uploaded.push({ name: file.name, file_uri });
    }
    setForm((f) => ({ ...f, files: [...f.files, ...uploaded] }));
    setUploadingFiles(false);
    toast.success("Arquivo(s) enviado(s)!");
  };

  const openFile = async (file_uri) => {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
    window.open(signed_url, "_blank");
  };

  const addNote = () => set("session_notes", [...form.session_notes, { date: "", title: "", content: "" }]);
  const updateNote = (i, key, value) =>
    set("session_notes", form.session_notes.map((n, idx) => (idx === i ? { ...n, [key]: value } : n)));
  const removeNote = (i) => set("session_notes", form.session_notes.filter((_, idx) => idx !== i));
  const removeFile = (i) => set("files", form.files.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-cinzel font-semibold text-lg">
            {campaign ? "Editar Campanha" : "Nova Campanha"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-20 rounded-xl bg-muted border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
              {form.cover_image ? (
                <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Capa (URL da imagem)</Label>
              <Input
                value={form.cover_image}
                onChange={(e) => set("cover_image", e.target.value)}
                placeholder="https://..."
                className="bg-background text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Título *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Nome da campanha" className="bg-background" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Mestre / Narrador</Label>
              <Input value={form.master} onChange={(e) => set("master", e.target.value)} placeholder="Quem narra" className="bg-background" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => set("status", s.value)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      form.status === s.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Sinopse</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Resumo da campanha..." rows={3} className="bg-background" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs flex items-center gap-1"><FileText className="w-3 h-3" /> PDFs / Documentos</Label>
            {form.files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
                <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                <button type="button" onClick={() => openFile(f.file_uri)} className="text-xs text-foreground truncate flex-1 text-left hover:text-primary">
                  {f.name}
                </button>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <label className="cursor-pointer block">
              <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" multiple onChange={handleFilesUpload} className="hidden" />
              <div className="border-2 border-dashed border-border rounded-xl py-3 text-center hover:border-primary/40 transition-colors">
                {uploadingFiles ? (
                  <p className="text-xs text-muted-foreground">Enviando...</p>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Clique para enviar PDFs ou imagens</p>
                  </>
                )}
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs flex items-center gap-1"><StickyNote className="w-3 h-3" /> Notas de Sessão</Label>
              <Button type="button" size="sm" variant="outline" onClick={addNote} className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Adicionar
              </Button>
            </div>
            {form.session_notes.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhuma nota ainda.</p>
            )}
            <div className="space-y-2">
              {form.session_notes.map((note, i) => (
                <div key={i} className="bg-background border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={note.date || ""}
                      onChange={(e) => updateNote(i, "date", e.target.value)}
                      className="bg-card text-xs h-8 w-40"
                    />
                    <Input
                      value={note.title || ""}
                      onChange={(e) => updateNote(i, "title", e.target.value)}
                      placeholder="Título da sessão"
                      className="bg-card text-xs h-8 flex-1"
                    />
                    <button type="button" onClick={() => removeNote(i)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Textarea
                    value={note.content || ""}
                    onChange={(e) => updateNote(i, "content", e.target.value)}
                    placeholder="Resumo da sessão..."
                    rows={2}
                    className="bg-card text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={() => onSave(form)} disabled={!form.title} className="flex-1 bg-primary text-primary-foreground">
            <Check className="w-4 h-4 mr-1" /> {campaign ? "Salvar" : "Criar"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}