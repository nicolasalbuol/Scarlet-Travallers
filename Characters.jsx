import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Copy, Trash2, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { DEFAULT_SKILLS } from "@/lib/gameConstants";
import CharacterCard from "@/components/characters/CharacterCard";
import NewCharacterModal from "@/components/characters/NewCharacterModal";
import { useAuth } from "@/lib/AuthContext";
import ScrambleText from "@/components/fx/ScrambleText";

export default function Characters() {
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check URL for ?new=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "true") {
      navigate("/character/new");
      window.history.replaceState({}, "", "/characters");
    }
  }, [navigate]);

  const { data: characters, isLoading } = useQuery({
    queryKey: ["characters", user?.email],
    queryFn: () => base44.entities.Character.filter({ created_by: user.email }, "-updated_date"),
    initialData: [],
    enabled: !!user?.email,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Character.create(data),
    onSuccess: (newChar) => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      setShowNew(false);
      toast.success("Ficha criada!");
      navigate(`/character/${newChar.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Character.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      setDeleteId(null);
      toast.success("Ficha excluída");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (char) => {
      const { id, created_date, updated_date, created_by, ...data } = char;
      return base44.entities.Character.create({ ...data, name: `${data.name} (cópia)` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      toast.success("Ficha duplicada!");
    },
  });

  const handleCreate = (data) => {
    createMutation.mutate({
      ...data,
      skills: DEFAULT_SKILLS,
      attributes: { FOR: 1, DES: 1, CON: 1, INT: 1, SAB: 1, CAR: 1 },
      pv: { total: 10, current: 10, temp: 0 },
      pe: { total: 10, current: 10, temp: 0 },
      ps: { total: 10, current: 10, temp: 0 },
    });
  };

  return (
    <div className="px-4 lg:px-10 py-8 lg:py-12 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-primary/80">Registro pessoal · só você vê</div>
          <h1 className="font-cinzel text-3xl lg:text-4xl font-bold text-foreground flex items-center gap-3 mt-1">
            <ScrollText className="w-7 h-7 text-primary" />
            <ScrambleText text="Minhas Fichas" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {characters.length} {characters.length === 1 ? "agente registrado" : "agentes registrados"}
          </p>
        </div>
        <Button onClick={() => navigate("/character/new")} className="h-11 px-5 rounded-full font-cinzel tracking-wider bg-primary hover:bg-primary/90 shadow-[0_0_30px_-6px_hsl(161_38%_50%/0.8)]">
          <Plus className="w-4 h-4 mr-2" />
          Nova Ficha
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : characters.length === 0 ? (
        <div className="st-panel text-center py-20 text-muted-foreground">
          <ScrollText className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Nenhuma ficha criada ainda.</p>
          <Button onClick={() => navigate("/character/new")} variant="outline" className="mt-4 border-primary text-primary">
            <Plus className="w-4 h-4 mr-2" />
            Criar sua primeira ficha
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char, i) => (
            <div key={char.id} className="relative group">
              <CharacterCard character={char} index={i} />
              <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 bg-card/80"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); duplicateMutation.mutate(char); }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 bg-card/80 text-destructive"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteId(char.id); }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewCharacterModal open={showNew} onClose={() => setShowNew(false)} onCreate={handleCreate} isLoading={createMutation.isPending} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ficha?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}