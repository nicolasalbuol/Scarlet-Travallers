import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  BookOpen, Plus, Trash2, Pencil, GripVertical,
  Link as LinkIcon, Upload, Check, X, ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function BookFormModal({ book, onSave, onClose }) {
  const [form, setForm] = useState({
    title: book?.title || "",
    description: book?.description || "",
    url: book?.url || "",
    cover_image: book?.cover_image || "",
    category: book?.category || "Geral",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, url: file_url }));
    setUploading(false);
    toast.success("Arquivo enviado!");
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, cover_image: file_url }));
    setUploadingCover(false);
    toast.success("Capa enviada!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-cinzel font-semibold text-lg">
            {book ? "Editar Livro" : "Adicionar Livro"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Cover preview */}
          <div className="flex gap-4 items-start">
            <div className="w-16 h-20 rounded-xl bg-muted border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
              {form.cover_image ? (
                <img src={form.cover_image} alt="" className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-6 h-6 text-muted-foreground/40" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-xs">Capa do livro</Label>
              <div className="flex gap-2">
                <Input
                  value={form.cover_image}
                  onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
                  placeholder="URL da imagem"
                  className="bg-background text-xs h-8"
                />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  <div className="h-8 w-8 rounded-md border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors">
                    {uploadingCover ? (
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Título *</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Nome do livro" className="bg-background" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Categoria</Label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Ex: Regras, Lore..." className="bg-background" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Descrição curta</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Subtítulo opcional" className="bg-background" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><LinkIcon className="w-3 h-3" /> URL do documento</Label>
            <Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." className="bg-background" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1"><Upload className="w-3 h-3" /> Ou enviar arquivo</Label>
            <label className="cursor-pointer block">
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
              <div className="border-2 border-dashed border-border rounded-xl py-3 text-center hover:border-primary/40 transition-colors">
                {uploading ? (
                  <p className="text-xs text-muted-foreground">Enviando...</p>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Clique para enviar PDF ou DOC</p>
                    {form.url && <p className="text-xs text-primary mt-1">✓ Arquivo carregado</p>}
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={() => onSave(form)} disabled={!form.title} className="flex-1 bg-primary text-primary-foreground">
            <Check className="w-4 h-4 mr-1" /> {book ? "Salvar" : "Adicionar"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function BookAdminPanel({ books, onBooksChange }) {
  const queryClient = useQueryClient();
  const [editingBook, setEditingBook] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) return base44.entities.Book.update(id, data);
      return base44.entities.Book.create({ ...data, order: books.length });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Livro salvo!");
      setEditingBook(null);
      setAddingNew(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Book.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Livro removido.");
    },
  });

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(books);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    // Update order on all affected books
    const updates = reordered.map((b, i) => base44.entities.Book.update(b.id, { order: i }));
    await Promise.all(updates);
    queryClient.invalidateQueries({ queryKey: ["books"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-cinzel text-lg font-semibold">Biblioteca de Livros</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{books.length}</span>
        </div>
        <Button size="sm" onClick={() => setAddingNew(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>

      {books.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl py-16 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum livro adicionado.</p>
          <Button size="sm" variant="outline" onClick={() => setAddingNew(true)} className="mt-3">
            <Plus className="w-4 h-4 mr-1" /> Adicionar primeiro livro
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="books">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {books.map((book, index) => (
                  <Draggable key={book.id} draggableId={book.id} index={index}>
                    {(prov, snapshot) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className={`flex items-center gap-3 bg-card border rounded-xl p-3 transition-all ${
                          snapshot.isDragging ? "border-primary/60 shadow-lg scale-[1.01]" : "border-border hover:border-primary/30"
                        }`}
                      >
                        <div {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {book.cover_image ? (
                          <img src={book.cover_image} alt="" className="w-10 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{book.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {book.category && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                {book.category}
                              </span>
                            )}
                            {book.description && (
                              <span className="text-xs text-muted-foreground truncate">{book.description}</span>
                            )}
                          </div>
                          {book.url && (
                            <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">{book.url.slice(0, 40)}...</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button size="icon" variant="ghost" onClick={() => setEditingBook(book)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(book.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <AnimatePresence>
        {(addingNew || editingBook) && (
          <BookFormModal
            book={editingBook}
            onSave={(form) => saveMutation.mutate({ id: editingBook?.id, data: form })}
            onClose={() => { setEditingBook(null); setAddingNew(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}