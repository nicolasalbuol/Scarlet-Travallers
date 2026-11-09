import React from "react";
import { Link } from "react-router-dom";
import { Heart, Zap, Brain, User } from "lucide-react";
import { motion } from "framer-motion";
import TiltCard from "@/components/fx/TiltCard";

function MiniBar({ icon: Icon, data, color }) {
  const d = data || { total: 0, current: 0 };
  const pct = d.total > 0 ? Math.min(100, (d.current / d.total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3 h-3 shrink-0" style={{ color }} />
      <div className="relative h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: color, boxShadow: `0 0 10px ${color}` }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </div>
      <span className="font-mono text-[10px] text-muted-foreground w-12 text-right">
        {d.current ?? 0}/{d.total ?? 0}
      </span>
    </div>
  );
}

/**
 * Cartão de ficha: retrato com revelação em varredura, inclinação 3D
 * e as três barras vitais que se enchem quando entram na tela.
 * `showOwner` mostra o jogador dono (usado no Arquivo do Mestre).
 */
export default function CharacterCard({ character, index = 0, showOwner = false }) {
  const initials = (character.name || "?").trim().slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index, 8) * 0.06, duration: 0.5 }}
    >
      <Link to={`/character/${character.id}`} className="block">
        <TiltCard className="rounded-2xl border border-border bg-card/80 backdrop-blur overflow-hidden">
          <div className="flex gap-4 p-4">
            <div className="relative w-[72px] h-[88px] shrink-0 rounded-xl overflow-hidden border border-primary/30 bg-muted">
              {character.lore_image ? (
                <img
                  src={character.lore_image}
                  alt=""
                  className="w-full h-full object-cover grayscale-[40%] group-hover/tilt:grayscale-0 group-hover/tilt:scale-110 transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-cinzel text-2xl font-bold text-primary/70 bg-gradient-to-b from-primary/15 to-transparent">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 st-scanlines opacity-60" />
              <div className="absolute inset-x-0 h-6 -top-6 bg-gradient-to-b from-transparent via-primary/40 to-transparent group-hover/tilt:animate-[st-scan_1.4s_ease-in-out_infinite]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-cinzel font-semibold text-foreground truncate group-hover/tilt:text-primary transition-colors">
                  {character.name || "Sem nome"}
                </h3>
                {character.origin && (
                  <span className="shrink-0 text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border border-accent/40 text-accent">
                    {character.origin}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {[character.race, character.char_class].filter(Boolean).join(" · ") || "—"} · Nv. {character.level || 1}
              </p>
              {showOwner && character.created_by && (
                <p className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-1 truncate">
                  <User className="w-3 h-3" /> {character.created_by.split("@")[0]}
                </p>
              )}
              <div className="mt-3 space-y-1.5">
                <MiniBar icon={Heart} data={character.pv} color="hsl(352 85% 55%)" />
                <MiniBar icon={Zap} data={character.pe} color="hsl(210 85% 60%)" />
                <MiniBar icon={Brain} data={character.ps} color="hsl(275 70% 65%)" />
              </div>
            </div>
          </div>
        </TiltCard>
      </Link>
      <style>{`@keyframes st-scan { 0% { transform: translateY(0); } 100% { transform: translateY(130px); } }`}</style>
    </motion.div>
  );
}
