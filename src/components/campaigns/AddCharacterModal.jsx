import React from "react";
import { motion } from "framer-motion";
import { X, ScrollText, Lock } from "lucide-react";
import { campaignOfCharacter } from "@/lib/campaigns";

export default function AddCharacterModal({ characters, campaigns, campaignId, onPick, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinzel font-semibold text-lg">Adicionar minha ficha</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {characters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Você ainda não tem fichas. Crie uma em "Construção de Ficha".
          </p>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {characters.map((ch) => {
              const other = campaignOfCharacter(campaigns, ch.id);
              const blocked = !!other && other.id !== campaignId;
              return (
                <button
                  key={ch.id}
                  disabled={blocked}
                  onClick={() => onPick(ch)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                    blocked
                      ? "border-border bg-muted/30 opacity-60 cursor-not-allowed"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  {ch.lore_image ? (
                    <img src={ch.lore_image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <ScrollText className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{ch.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {[ch.race, ch.char_class].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {blocked && (
                    <span className="flex items-center gap-1 text-[10px] text-destructive flex-shrink-0">
                      <Lock className="w-3 h-3" /> {other.title}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {characters.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-3">
            Cada ficha pode participar de apenas uma campanha por vez.
          </p>
        )}
      </motion.div>
    </div>
  );
}