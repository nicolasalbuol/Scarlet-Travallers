import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Flag, Plus, Search, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { canAccess, generateInviteCode } from "@/lib/campaigns";
import CampaignCard from "@/components/campaigns/CampaignCard";
import CampaignFormModal from "@/components/campaigns/CampaignFormModal";

export default function Campaigns() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [joinCode, setJoinCode] = useState(searchParams.get("join") || "");
  const [showForm, setShowForm] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => base44.entities.Campanha.list("-created_date", 200),
    enabled: !!user?.email,
  });

  const mine = useMemo(() => campaigns.filter((c) => canAccess(c, user)), [campaigns, user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mine;
    return mine.filter((c) => {
      const players = (c.members || [])
        .map((m) => `${m.user_name} ${m.character_name}`)
        .join(" ");
      return `${c.title} ${c.master} ${c.master_email} ${players}`.toLowerCase().includes(q);
    });
  }, [mine, search]);

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.Campanha.create({
        ...data,
        master: user.full_name || user.email,
        master_email: user.email,
        invite_code: generateInviteCode(),
        members: [],
        status: "planejada",
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setShowForm(false);
      toast.success("Campanha criada! Você é o mestre.");
      navigate(`/campaigns/${created.id}`);
    },
    onError: () => toast.error("Não foi possível criar a campanha"),
  });

  const joinMutation = useMutation({
    mutationFn: async (code) => {
      const clean = (code || "").trim().toUpperCase();
      if (!clean) throw new Error("Digite o código de entrada");
      const found = campaigns.find((c) => (c.invite_code || "").toUpperCase() === clean);
      if (!found) throw new Error("Código inválido");
      if (canAccess(found, user)) throw new Error("Você já participa desta campanha");
      const members = [
        ...(found.members || []),
        {
          user_email: user.email,
          user_name: user.full_name || user.email,
          character_id: "",
          character_name: "",
          joined_date: new Date().toISOString(),
        },
      ];
      return base44.entities.Campanha.update(found.id, { members });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Você entrou na campanha!");
      navigate(`/campaigns/${updated.id}`);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-cinzel text-2xl font-bold text-foreground flex items-center gap-2">
          <Flag className="w-6 h-6 text-primary" />
          Campanhas
        </h1>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova campanha
        </Button>
      </div>

      {/* Entrar por código */}
      <div className="bg-card border border-border rounded-xl p-3 mb-4 flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground sm:mr-auto">
          <LogIn className="w-4 h-4 text-primary" />
          Tem um convite? Entre com o código.
        </div>
        <div className="flex gap-2">
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="CÓDIGO"
            className="bg-background font-mono tracking-widest w-36"
          />
          <Button
            variant="outline"
            onClick={() => joinMutation.mutate(joinCode)}
            disabled={joinMutation.isPending || !joinCode.trim()}
            className="border-primary/30 text-primary"
          >
            Entrar
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por campanha, jogador ou ficha..."
          className="pl-10 bg-background"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Flag className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-sm">
            {mine.length === 0
              ? "Você ainda não participa de nenhuma campanha."
              : "Nenhuma campanha encontrada para essa busca."}
          </p>
          {mine.length === 0 && (
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="mt-4 border-primary text-primary"
            >
              <Plus className="w-4 h-4 mr-2" /> Criar minha primeira campanha
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              isMasterUser={campaign.master_email === user?.email}
            />
          ))}
        </div>
      )}

      {showForm && (
        <CampaignFormModal
          saving={createMutation.isPending}
          onSave={(data) => createMutation.mutate(data)}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}