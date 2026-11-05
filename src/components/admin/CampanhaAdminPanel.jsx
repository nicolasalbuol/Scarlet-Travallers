import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Flag, Plus, Pencil, Trash2, FileText, StickyNote } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import CampanhaFormModal from "@/components/admin/CampanhaFormModal";
import { useAuth } from "@/lib/AuthContext";
import { generateInviteCode } from "@/lib/campaigns";

const STATUS = {
  planejada: { label: "Planejada", cls: "bg-muted text-muted-foreground" },
  em_andamento: { label: "Em andamento", cls: "bg-primary/10 text-primary" },
  concluida: { label: "Concluída", cls: "bg-blue-500/10 text-blue-400" },
  pausada: { label: "Pausada", cls: "bg-amber-500/10 text-amber-400" },
};

export default function CampanhaAdminPanel({ campaigns }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editing, setEditing] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) return base44.entities.Campanha.update(id, data);
      return base44.entities.Campanha.create({
        ...data,
        master_email: user?.email || "",
        invite_code: generateInviteCode(),
        members: [],
        order: campaigns.length,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campanha salva!");
      setEditing(null);
      setAddingNew(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Campanha.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campanha removida.");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-primary" />
          <h2 className="font-cinzel text-lg font-semibold">Campanhas</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{campaigns.length}</span>
        </div>
        <Button size="sm" onClick={() => setAddingNew(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Nova
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl py-16 text-center">
          <Flag className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhuma campanha criada.</p>
          <Button size="sm" variant="outline" onClick={() => setAddingNew(true)} className="mt-3">
            <Plus className="w-4 h-4 mr-1" /> Criar primeira campanha
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c) => {
            const st = STATUS[c.status] || STATUS.planejada;
            return (
              <div key={c.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors">
                {c.cover_image ? (
                  <img src={c.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Flag className="w-5 h-5 text-primary" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground truncate">{c.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                  </div>
                  {c.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{c.description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    {c.master && <span>Mestre: {c.master}</span>}
                    {(c.files?.length || 0) > 0 && (
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{c.files.length}</span>
                    )}
                    {(c.session_notes?.length || 0) > 0 && (
                      <span className="flex items-center gap-1"><StickyNote className="w-3 h-3" />{c.session_notes.length}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(c)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(c.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {(addingNew || editing) && (
          <CampanhaFormModal
            campaign={editing}
            onSave={(data) => saveMutation.mutate({ id: editing?.id, data })}
            onClose={() => { setEditing(null); setAddingNew(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}