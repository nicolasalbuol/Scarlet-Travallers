import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Shield, Star, ScrollText, Flag, BookOpen, Crown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { THEMATIC_PHRASES } from "@/lib/gameConstants";
import { motion } from "framer-motion";
import CharacterCard from "@/components/characters/CharacterCard";
import Sigil from "@/components/fx/Sigil";
import ScrambleText from "@/components/fx/ScrambleText";
import TiltCard from "@/components/fx/TiltCard";

const ACTIONS = [
  { to: "/characters?new=true", icon: Plus, title: "Criar ficha", sub: "Abrir um novo agente", primary: true },
  { to: "/characters", icon: Shield, title: "Minhas fichas", sub: "Seus viajantes" },
  { to: "/campaigns", icon: Flag, title: "Campanhas", sub: "Missões em curso" },
  { to: "/book", icon: BookOpen, title: "Livros", sub: "Regras e compêndios" },
];

function Typewriter({ text }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(text.length); return; }
    let i = 0;
    const id = setInterval(() => { i += 1; setN(i); if (i >= text.length) clearInterval(id); }, 38);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span>
      {text.slice(0, n)}
      <span className="inline-block w-[2px] h-[1em] align-[-0.12em] ml-0.5 bg-primary animate-pulse" />
    </span>
  );
}

export default function Home() {
  const [phrase, setPhrase] = useState(THEMATIC_PHRASES[0]);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    setPhrase(THEMATIC_PHRASES[Math.floor(Math.random() * THEMATIC_PHRASES.length)]);
    base44.auth.me().then((u) => setUserEmail(u?.email)).catch(() => {});
  }, []);

  const { data: characters, isLoading } = useQuery({
    queryKey: ["characters", userEmail],
    queryFn: () => base44.entities.Character.filter({ created_by: userEmail }, "-updated_date", 6),
    initialData: [],
    enabled: !!userEmail,
  });

  return (
    <div className="px-4 lg:px-10 max-w-6xl mx-auto">
      {/* Hero */}
      <section className="relative grid lg:grid-cols-[1.1fr_0.9fr] items-center gap-6 pt-10 lg:pt-16 pb-10">
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Sistema de RPG de mesa
          </motion.div>

          <h1 className="mt-5 leading-[0.9]">
            <ScrambleText
              text="SCARLET"
              as="span"
              className="block font-cinzel font-black tracking-[0.14em] text-5xl sm:text-6xl lg:text-7xl text-scarlet-gradient"
              duration={1100}
              hover
            />
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="block font-display italic text-5xl sm:text-6xl lg:text-7xl text-foreground/90 -mt-1"
            >
              Travellers
            </motion.span>
          </h1>

          <p className="mt-6 font-display text-xl lg:text-2xl text-muted-foreground max-w-md mx-auto lg:mx-0 min-h-[3.2em]">
            "<Typewriter text={phrase} />"
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-7 flex flex-wrap gap-3 justify-center lg:justify-start"
          >
            <Link to="/characters?new=true">
              <Button className="h-11 px-6 rounded-full font-cinzel tracking-wider bg-primary hover:bg-primary/90 shadow-[0_0_30px_-4px_hsl(161_38%_50%/0.7)]">
                <Plus className="w-4 h-4 mr-2" /> Nova ficha
              </Button>
            </Link>
            <Link to="/mestre">
              <Button variant="outline" className="h-11 px-6 rounded-full font-cinzel tracking-wider border-accent/40 text-accent hover:bg-accent/10 hover:text-accent">
                <Crown className="w-4 h-4 mr-2" /> Área do Mestre
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
          className="order-1 lg:order-2 flex justify-center"
        >
          <Sigil size={typeof window !== "undefined" && window.innerWidth < 640 ? 230 : 340} />
        </motion.div>
      </section>

      {/* Ações rápidas */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-14">
        {ACTIONS.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.08, duration: 0.5 }}
          >
            <Link to={a.to} className="block h-full">
              <TiltCard
                className={`h-full rounded-2xl p-4 lg:p-5 border overflow-hidden ${
                  a.primary
                    ? "border-primary/50 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent"
                    : "border-border bg-card/70 backdrop-blur"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.primary ? "bg-primary text-primary-foreground" : "bg-muted text-primary"}`}>
                    <a.icon className="w-5 h-5" />
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-hover/tilt:translate-x-0.5 group-hover/tilt:-translate-y-0.5 group-hover/tilt:text-primary" />
                </div>
                <div className="mt-5 font-cinzel font-semibold text-sm lg:text-base text-foreground">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.sub}</div>
              </TiltCard>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Fichas recentes */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-primary/80">Registro pessoal</div>
            <h2 className="font-cinzel text-xl lg:text-2xl font-semibold text-foreground flex items-center gap-2 mt-1">
              <Star className="w-5 h-5 text-accent" /> Fichas recentes
            </h2>
          </div>
          <Link to="/characters" className="text-sm text-primary hover:text-accent transition-colors">
            Ver todas →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : characters.length === 0 ? (
          <div className="st-panel text-center py-14 text-muted-foreground">
            <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma ficha ainda. A viagem começa agora.</p>
            <Link to="/characters?new=true">
              <Button variant="outline" className="mt-5 border-primary/50 text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4 mr-2" /> Criar primeira ficha
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char, i) => (
              <CharacterCard key={char.id} character={char} index={i} />
            ))}
          </div>
        )}
      </section>

      <div className="text-center mt-20 pb-10 text-[11px] uppercase tracking-[0.25em] text-muted-foreground/50">
        Sistema criado por <span className="text-muted-foreground/80">Izumi Yoshikawa</span>
      </div>
    </div>
  );
}
