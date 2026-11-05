import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ORIGINS } from "@/lib/gameConstants";
import ScrambleText from "@/components/fx/ScrambleText";

function Chip({ children, tone = "default" }) {
  const tones = {
    default: "border-border text-muted-foreground",
    primary: "border-primary/40 text-primary bg-primary/10",
    gold: "border-accent/40 text-accent bg-accent/5",
  };
  return (
    <span className={`text-[10px] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full border ${tones[tone]}`}>
      {children}
    </span>
  );
}

export default function CharacterHeader({ character, editMode, updateField }) {
  const initials = (character.name || "?").trim().slice(0, 2).toUpperCase();

  if (!editMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="st-panel st-live-border overflow-hidden mb-5"
      >
        <div className="absolute inset-0 st-scanlines opacity-40 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row gap-5 p-5">
          <div className="relative mx-auto sm:mx-0 w-28 h-36 sm:w-32 sm:h-40 shrink-0 rounded-xl overflow-hidden border border-primary/40 bg-muted">
            {character.lore_image ? (
              <motion.img
                src={character.lore_image}
                alt={character.name}
                className="w-full h-full object-cover"
                initial={{ clipPath: "inset(0 0 100% 0)" }}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                transition={{ duration: 1, ease: [0.7, 0, 0.2, 1], delay: 0.2 }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-cinzel text-4xl font-bold text-primary/70 bg-gradient-to-b from-primary/20 to-transparent">
                {initials}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/80 to-transparent" />
            <span className="absolute bottom-2 left-0 right-0 text-center font-mono text-[10px] tracking-widest text-accent">
              NV {character.level || 1}
            </span>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="text-[10px] uppercase tracking-[0.28em] text-primary/80">
              {character.rank ? `Patente · ${character.rank}` : "Agente"}
            </div>
            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-foreground mt-1 break-words">
              <ScrambleText text={character.name || "Sem nome"} duration={800} hover />
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-3">
              {character.race && <Chip tone="primary">{character.race}</Chip>}
              {character.char_class && <Chip tone="gold">{character.char_class}</Chip>}
              {character.origin && <Chip>{character.origin}</Chip>}
              {character.passado && <Chip>{character.passado}</Chip>}
              {character.age && <Chip>{character.age} anos</Chip>}
              {character.deslocamento && <Chip>Desloc. {character.deslocamento}</Chip>}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 max-w-md mx-auto sm:mx-0">
              <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">EXP</div>
                <div className="font-mono text-lg text-foreground">{character.exp || 0}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Inspiração</div>
                <div className="font-mono text-lg text-accent flex items-center gap-1 justify-center sm:justify-start">
                  <Sparkles className="w-3.5 h-3.5" /> {character.inspiration_points || 0}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background/40 px-3 py-2">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Nível</div>
                <div className="font-mono text-lg text-foreground">{character.level || 1}</div>
              </div>
            </div>

            {(character.power_technique || character.elemental_bond) && (
              <div className="flex flex-col sm:flex-row gap-x-5 gap-y-1 mt-3 text-xs text-muted-foreground">
                {character.power_technique && (
                  <span><span className="text-primary/80">Poder/Técnica:</span> {character.power_technique}</span>
                )}
                {character.elemental_bond && (
                  <span><span className="text-primary/80">Vínculo:</span> {character.elemental_bond}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="st-panel border-primary/40 p-4 mb-5 space-y-3">
      <Input
        value={character.name || ""}
        onChange={(e) => updateField("name", e.target.value)}
        placeholder="Nome do Personagem"
        className="font-cinzel text-lg font-bold bg-background"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Input value={character.race || ""} onChange={(e) => updateField("race", e.target.value)} placeholder="Raça" className="bg-background text-sm" />
        <Input value={character.char_class || ""} onChange={(e) => updateField("char_class", e.target.value)} placeholder="Classe" className="bg-background text-sm" />
        <Select value={character.origin || ""} onValueChange={(v) => updateField("origin", v)}>
          <SelectTrigger className="bg-background text-sm"><SelectValue placeholder="Origem" /></SelectTrigger>
          <SelectContent>{ORIGINS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="number" value={character.level || 1} onChange={(e) => updateField("level", Number(e.target.value))} placeholder="Nível" className="bg-background text-sm" min={1} />
        <Input type="number" value={character.exp || 0} onChange={(e) => updateField("exp", Number(e.target.value))} placeholder="EXP" className="bg-background text-sm" min={0} />
        <Input type="number" value={character.inspiration_points || 0} onChange={(e) => updateField("inspiration_points", Number(e.target.value))} placeholder="Inspiração" className="bg-background text-sm" min={0} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input value={character.power_technique || ""} onChange={(e) => updateField("power_technique", e.target.value)} placeholder="Poder / Técnica" className="bg-background text-sm" />
        <Input value={character.elemental_bond || ""} onChange={(e) => updateField("elemental_bond", e.target.value)} placeholder="Vínculo Elemental" className="bg-background text-sm" />
      </div>
    </div>
  );
}
