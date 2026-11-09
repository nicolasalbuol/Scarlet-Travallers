import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, Users, Copy, Link2, Pencil, Trash2, Flag, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { inviteLink } from "@/lib/campaigns";

export default function CampaignHeader({ campaign, master, onEdit, onDelete }) {
  const navigate = useNavigate();
  const players = (campaign.members || []).length;
  const link = inviteLink(campaign.invite_code);

  const copy = (text, message) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mb-4">
      <div className="h-32 sm:h-40 bg-primary/10 relative">
        {campaign.cover_image ? (
          <img src={campaign.cover_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Flag className="w-10 h-10 text-primary/30" />
          </div>
        )}
      </div>

      <div className="p-4">
        <button
          onClick={() => navigate("/campaigns")}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Minhas campanhas
        </button>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-foreground truncate">
              {campaign.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-primary" />
                Mestre: {campaign.master || campaign.master_email}
                {master ? " (você)" : ""}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {players} jogador{players === 1 ? "" : "es"}
              </span>
            </div>
          </div>

          {master && (
            <div className="flex gap-1 flex-shrink-0">
              <Button size="icon" variant="ghost" onClick={onEdit} title="Editar campanha">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onDelete}
                title="Apagar campanha"
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {campaign.description && (
          <p className="text-sm text-muted-foreground mt-3">{campaign.description}</p>
        )}

        {master && campaign.invite_code && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => copy(campaign.invite_code, "Código copiado!")}
              className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-left hover:border-primary/40 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground">Código de entrada</p>
                <p className="font-mono text-sm font-bold tracking-widest text-primary">
                  {campaign.invite_code}
                </p>
              </div>
              <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>

            <button
              onClick={() => copy(link, "Link de convite copiado!")}
              className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-left hover:border-primary/40 transition-colors"
            >
              <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground">Link de convite</p>
                <p className="text-[11px] truncate text-foreground">{link}</p>
              </div>
              <Copy className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}