import React from "react";
import { Link } from "react-router-dom";
import { Flag, Crown, Users } from "lucide-react";

export default function CampaignCard({ campaign, isMasterUser }) {
  const players = (campaign.members || []).length;

  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      className="block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors"
    >
      <div className="h-24 bg-primary/10 relative">
        {campaign.cover_image ? (
          <img src={campaign.cover_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Flag className="w-8 h-8 text-primary/30" />
          </div>
        )}
        {isMasterUser && (
          <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold bg-card/90 text-primary px-2 py-0.5 rounded-full">
            <Crown className="w-3 h-3" /> Mestre
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="font-cinzel font-semibold text-foreground truncate">{campaign.title}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {campaign.description || "Sem sinopse"}
        </p>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1 flex-shrink-0">
            <Users className="w-3 h-3" /> {players} jogador{players === 1 ? "" : "es"}
          </span>
          <span className="truncate">Mestre: {campaign.master || campaign.master_email}</span>
        </div>
      </div>
    </Link>
  );
}