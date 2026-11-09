import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, LogOut, ScrollText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { canAccess, isMaster, memberOf, campaignOfCharacter } from "@/lib/campaigns";
import CampaignHeader from "@/components/campaigns/CampaignHeader";
import CampaignPlayers from "@/components/campaigns/CampaignPlayers";
import AddCharacterModal from "@/components/campaigns/AddCharacterModal";
import CampaignFormModal from "@/components/campaigns/CampaignFormModal";

export default function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => base44.entities.Campanha.get(id),
    enabled: !!id && !!user?.email,
  });

  const { data: allCampaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => base44.entities.Campanha.list("-created_date", 200),
    enabled: !!user?.email,
  });

  const { data: myCharacters = [] } = useQuery({
    queryKey: ["characters", user?.email],
    queryFn: () => base44.entities.Character.filter({ created_by: user.email }, "-updated_date"),
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Campanha.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setEditing(false);
      toast.success("Campanha atualizada!");
    },
    onError: () => toast.error("Não foi possível salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Campanha.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campanha apagada. Nenhuma ficha foi excluída.");
      navigate("/campaigns", { replace: true });
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-4 lg:p-8 max-w-2xl mx-auto text-center py-20">
        <ScrollText className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
        <h1 className="font-cinzel text-xl font-bold mb-2">Campanha não encontrada</h1>
        <Button variant="outline" onClick={() => navigate("/campaigns")} className="mt-2">
          Ver minhas campanhas
        </Button>
      </div>
    );
  }

  if (!canAccess(campaign, user)) {
    return (
      <div className="p-4 lg:p-8 max-w-2xl mx-auto text-center py-20">
        <Lock className="w-14 h-14 text-primary/30 mx-auto mb-4" />
        <h1 className="font-cinzel text-xl font-bold mb-2">Acesso restrito</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Esta campanha é privada. Peça o código de entrada ao mestre.
        </p>
        <Button variant="outline" onClick={() => navigate("/campaigns")}>
          Voltar para campanhas
        </Button>
      </div>
    );
  }

  const master = isMaster(campaign, user);
  const me = memberOf(campaign, user);
  const members = campaign.members || [];
  const myCharacter = myCharacters.find((c) => c.id === me?.character_id);

  const updateMembers = (nextMembers, message) => {
    base44.entities.Campanha.update(id, { members: nextMembers }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      if (message) toast.success(message);
    });
  };

  const addMyCharacter = (character) => {
    const other = campaignOfCharacter(allCampaigns, character.id);
    if (other && other.id !== id) {
      toast.error(`Esta ficha já está na campanha "${other.title}". Remova-a de lá primeiro.`);
      return;
    }
    const isParticipant = members.some((m) => m.user_email === user.email);
    const next = isParticipant
      ? members.map((m) =>
          m.user_email === user.email
            ? { ...m, character_id: character.id, character_name: character.name }
            : m
        )
      : [
          ...members,
          {
            user_email: user.email,
            user_name: user.full_name || user.email,
            character_id: character.id,
            character_name: character.name,
            joined_date: new Date().toISOString(),
          },
        ];
    setShowAdd(false);
    updateMembers(next, "Ficha adicionada à campanha!");
  };

  const removeMyCharacter = () => {
    const next = members.map((m) =>
      m.user_email === user.email ? { ...m, character_id: "", character_name: "" } : m
    );
    updateMembers(next, "Ficha removida da campanha.");
  };

  const removePlayer = (member) => {
    updateMembers(
      members.filter((m) => m.user_email !== member.user_email),
      "Jogador removido. A ficha voltou a ficar livre."
    );
  };

  const leaveCampaign = () => {
    updateMembers(
      members.filter((m) => m.user_email !== user.email),
      "Você saiu da campanha."
    );
    navigate("/campaigns", { replace: true });
  };

  const filteredMembers = members.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${m.user_name} ${m.user_email} ${m.character_name}`.toLowerCase().includes(q);
  });

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <CampaignHeader
        campaign={campaign}
        master={master}
        onEdit={() => setEditing(true)}
        onDelete={() => setConfirmDelete(true)}
      />

      {/* Minha ficha */}
      <div className="bg-card border border-border rounded-xl p-4 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground tracking-wider">
              MINHA FICHA NA CAMPANHA
            </p>
            {me?.character_id ? (
              <Link
                to={`/character/${me.character_id}`}
                className="font-cinzel text-base font-semibold text-primary truncate block hover:underline"
              >
                {me.character_name || "Ficha"}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma ficha adicionada ainda.</p>
            )}
            {myCharacter && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {[myCharacter.race, myCharacter.char_class].filter(Boolean).join(" · ")} · Nível{" "}
                {myCharacter.level || 1}
              </p>
            )}
          </div>

          <div className="flex-shrink-0">
            {me?.character_id ? (
              <Button size="sm" variant="outline" onClick={removeMyCharacter}>
                Remover
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowAdd(true)}
                className="bg-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            )}
          </div>
        </div>

        {!master && (
          <Button
            size="sm"
            variant="ghost"
            onClick={leaveCampaign}
            className="mt-3 text-destructive hover:text-destructive w-full sm:w-auto"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" /> Sair da campanha
          </Button>
        )}
      </div>

      {/* Jogadores */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="font-cinzel text-base font-semibold">Jogadores e fichas</h2>
        <div className="relative w-44">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar jogador..."
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>
      </div>

      <CampaignPlayers
        members={filteredMembers}
        master={master}
        currentUserEmail={user.email}
        onRemove={removePlayer}
      />

      {editing && (
        <CampaignFormModal
          campaign={campaign}
          saving={saveMutation.isPending}
          onSave={(data) => saveMutation.mutate(data)}
          onClose={() => setEditing(false)}
        />
      )}

      {showAdd && (
        <AddCharacterModal
          characters={myCharacters}
          campaigns={allCampaigns}
          campaignId={id}
          onPick={addMyCharacter}
          onClose={() => setShowAdd(false)}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar a campanha?</AlertDialogTitle>
            <AlertDialogDescription>
              A campanha será removida e as fichas dos jogadores voltam a ficar livres. Nenhuma ficha
              é apagada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground"
            >
              Apagar campanha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}