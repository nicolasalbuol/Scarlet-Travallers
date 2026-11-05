import React from "react";
import { Link } from "react-router-dom";
import { ScrollText, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CampaignPlayers({ members, master, currentUserEmail, onRemove }) {
  if (members.length === 0) {
    return (
      <div className="border-2 border-dashed border-border rounded-2xl py-12 text-center">
        <ScrollText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Nenhum jogador encontrado.</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Compartilhe o código de entrada para os jogadores participarem.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {members.map((m) => (
        <div key={m.user_email} className="bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {m.user_name || m.user_email}
              </p>
              {m.user_email === currentUserEmail && (
                <p className="text-[10px] text-primary font-medium">Você</p>
              )}
            </div>
            {master && m.user_email !== currentUserEmail && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                title="Remover jogador"
                onClick={() => onRemove(m)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {m.character_id ? (
            <Link
              to={`/character/${m.character_id}`}
              className="mt-2 flex items-center gap-2 bg-background border border-border rounded-lg px-2.5 py-2 hover:border-primary/40 transition-colors"
            >
              <ScrollText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-xs font-medium text-foreground truncate flex-1">
                {m.character_name || "Ficha"}
              </span>
              <span className="text-[10px] text-muted-foreground">abrir</span>
            </Link>
          ) : (
            <p className="mt-2 text-[11px] text-muted-foreground italic">Ainda sem ficha na campanha.</p>
          )}
        </div>
      ))}
    </div>
  );
}