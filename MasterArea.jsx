import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Crown, Lock, Unlock, Search, Users, ScrollText, Flag, TrendingUp, LayoutGrid, Rows3, KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { ORIGINS } from "@/lib/gameConstants";
import { ADMIN_PASSWORD, isMasterUnlocked, setMasterUnlocked } from "@/lib/masterAccess";
import CharacterCard from "@/components/characters/CharacterCard";
import Sigil from "@/components/fx/Sigil";
import ScrambleText from "@/components/fx/ScrambleText";
import CountUp from "@/components/fx/CountUp";

/* ------------------------------------------------------------------ */
/* Cofre: pede a mesma senha do Painel ADM                             */
/* ------------------------------------------------------------------ */
function Vault({ onUnlock }) {
  const { user, navigateToLogin } = useAuth();
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(0);
  const [opening, setOpening] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      setShake((n) => n + 1);
      toast.error("Senha incorreta");
      return;
    }
    setPassword("");
    setOpening(true);
    setTimeout(() => {
      setMasterUnlocked(true);
      onUnlock();
    }, 1100);
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 py-10">
      <motion.div
        key={shake}
        animate={shake ? { x: [0, -14, 12, -8, 5, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-sm"
      >
        <div className="flex justify-center -mb-20 relative z-10">
          <motion.div
            className="relative"
            animate={opening ? { scale: [1, 1.15, 2.4], opacity: [1, 1, 0], rotate: [0, 30, 180] } : {}}
            transition={{ duration: 1.1, ease: [0.7, 0, 0.2, 1] }}
          >
            <Sigil size={190} showLogo={false} />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={opening ? { rotate: [0, -25, 0], y: [0, -6, 0] } : {}}
                className="w-16 h-16 rounded-full bg-background border border-primary/50 flex items-center justify-center shadow-[0_0_30px_hsl(161_38%_45%/0.6)]"
              >
                {opening ? <Unlock className="w-7 h-7 text-accent" /> : <Lock className="w-7 h-7 text-primary" />}
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="st-panel st-live-border pt-24 pb-7 px-7 text-center">
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary/80">Acesso restrito</div>
          <h1 className="font-cinzel text-2xl font-bold text-foreground mt-1">Área do Mestre</h1>
          <p className="text-sm text-muted-foreground mt-2">
            O Arquivo guarda as fichas de todos os viajantes. Use a mesma senha do Painel ADM.
          </p>

          {!user ? (
            <Button className="w-full mt-6 bg-primary" onClick={navigateToLogin}>Entrar para continuar</Button>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-3 text-left">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha do mestre"
                  className="pl-10 h-11 bg-background tracking-widest"
                  aria-label="Senha do mestre"
                />
              </div>
              <Button type="submit" disabled={opening || !password} className="w-full h-11 font-cinzel tracking-[0.25em] bg-primary hover:bg-primary/90">
                {opening ? "ROMPENDO O SELO..." : "ABRIR O ARQUIVO"}
              </Button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Arquivo geral                                                       */
/* ------------------------------------------------------------------ */
function Stat({ icon: Icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="st-panel p-4 overflow-hidden"
    >
      <Icon className="w-4 h-4 text-primary mb-2" />
      <div className="font-cinzel text-3xl font-bold text-foreground"><CountUp value={value} /></div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">{label}</div>
    </motion.div>
  );
}

function Archive({ onLock }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("Todas");
  const [view, setView] = useState("players");

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ["master-all-characters"],
    queryFn: () => base44.entities.Character.list("-updated_date", 500),
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => base44.entities.Campanha.list("-created_date", 200),
  });

  const campaignOf = useMemo(() => {
    const map = {};
    campaigns.forEach((c) => (c.members || []).forEach((m) => { if (m.character_id) map[m.character_id] = c.title; }));
    return map;
  }, [campaigns]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return characters.filter((c) => {
      if (origin !== "Todas" && c.origin !== origin) return false;
      if (!q) return true;
      return [c.name, c.created_by, c.race, c.char_class, c.passado, c.rank, campaignOf[c.id]]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  }, [characters, search, origin, campaignOf]);

  const byPlayer = useMemo(() => {
    const groups = {};
    filtered.forEach((c) => {
      const k = c.created_by || "desconhecido";
      (groups[k] = groups[k] || []).push(c);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const players = new Set(characters.map((c) => c.created_by).filter(Boolean)).size;
  const avgLevel = characters.length
    ? Math.round(characters.reduce((s, c) => s + (Number(c.level) || 1), 0) / characters.length)
    : 0;

  return (
    <div className="px-4 lg:px-10 py-8 lg:py-12 max-w-6xl mx-auto">
      {/* Cabeçalho */}
      <div className="relative flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-accent flex items-center gap-2">
            <Crown className="w-3.5 h-3.5" /> Área do Mestre
          </div>
          <h1 className="font-cinzel text-3xl lg:text-5xl font-bold text-foreground mt-1">
            <ScrambleText text="Arquivo Geral" duration={1000} />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Todas as fichas de todos os jogadores do servidor.</p>
        </div>
        <motion.div
          initial={{ scale: 3, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: -12 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 14 }}
          className="hidden sm:block absolute right-40 -top-2 border-2 border-primary/70 text-primary/80 font-cinzel font-bold tracking-[0.3em] text-sm px-3 py-1 rounded-sm pointer-events-none"
        >
          CONFIDENCIAL
        </motion.div>
        <Button variant="outline" onClick={onLock} className="border-border text-muted-foreground hover:text-foreground">
          <Lock className="w-4 h-4 mr-2" /> Trancar
        </Button>
      </div>

      {user?.role !== "admin" && (
        <div className="st-panel border-accent/40 p-4 mb-6 text-sm text-muted-foreground">
          Sua conta ainda não é ADM, então aqui aparecem só as suas fichas e as das campanhas que você mestra.
          Para ver as de todos, marque sua conta como ADM no Supabase (veja o guia de instalação).
        </div>
      )}

      {/* Números */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Stat icon={ScrollText} label="Fichas" value={characters.length} delay={0.1} />
        <Stat icon={Users} label="Jogadores" value={players} delay={0.18} />
        <Stat icon={Flag} label="Campanhas" value={campaigns.length} delay={0.26} />
        <Stat icon={TrendingUp} label="Nível médio" value={avgLevel} delay={0.34} />
      </div>

      {/* Filtros */}
      <div className="st-panel p-3 sm:p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, jogador, raça, classe, campanha..."
              className="pl-10 bg-background"
            />
          </div>
          <div className="flex rounded-lg border border-border p-1 bg-background/60 self-start">
            {[["players", Rows3, "Por jogador"], ["grid", LayoutGrid, "Todas"]].map(([v, Icon, l]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors ${view === v ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {view === v && <motion.span layoutId="st-view" className="absolute inset-0 rounded-md bg-primary" />}
                <Icon className="relative w-3.5 h-3.5" /> <span className="relative">{l}</span>
              </button>
            ))}
          </div>
        </div>
        <LayoutGroup>
          <div className="flex flex-wrap gap-1.5">
            {["Todas", ...ORIGINS].map((o) => (
              <button
                key={o}
                onClick={() => setOrigin(o)}
                className={`relative px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.15em] border transition-colors ${origin === o ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {origin === o && <motion.span layoutId="st-origin" className="absolute inset-0 rounded-full bg-primary/15" />}
                <span className="relative">{o}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="st-panel text-center py-16 text-muted-foreground">
          <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p>Nenhuma ficha encontrada.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <div key={c.id}>
              <CharacterCard character={c} index={i} showOwner />
              {campaignOf[c.id] && <CampaignTag title={campaignOf[c.id]} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {byPlayer.map(([email, chars], gi) => (
            <motion.section
              key={email}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(gi, 5) * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/20 border border-primary/40 flex items-center justify-center font-cinzel text-sm font-bold text-foreground">
                  {email.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-cinzel font-semibold text-foreground truncate">{email.split("@")[0]}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{email} · {chars.length} {chars.length === 1 ? "ficha" : "fichas"}</div>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {chars.map((c, i) => (
                  <div key={c.id}>
                    <CharacterCard character={c} index={i} />
                    {campaignOf[c.id] && <CampaignTag title={campaignOf[c.id]} />}
                  </div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignTag({ title }) {
  return (
    <div className="mt-1.5 ml-2 text-[10px] text-accent/90 flex items-center gap-1">
      <Flag className="w-3 h-3" /> {title}
    </div>
  );
}

export default function MasterArea() {
  const [unlocked, setUnlocked] = useState(isMasterUnlocked());

  return (
    <AnimatePresence mode="wait">
      {unlocked ? (
        <motion.div key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Archive onLock={() => { setMasterUnlocked(false); setUnlocked(false); }} />
        </motion.div>
      ) : (
        <motion.div key="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }}>
          <Vault onUnlock={() => setUnlocked(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
