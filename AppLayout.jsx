import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, BookOpen, ScrollText, User, Flag, Shield, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import ScarletField from "@/components/fx/ScarletField";
import RiftTransition from "@/components/fx/RiftTransition";
import { LOGO_URL } from "@/components/fx/Sigil";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Início", hint: "Saguão" },
  { path: "/characters", icon: ScrollText, label: "Fichas", hint: "Seus agentes" },
  { path: "/campaigns", icon: Flag, label: "Campanhas", hint: "Missões" },
  { path: "/book", icon: BookOpen, label: "Livro", hint: "Regras" },
  { path: "/mestre", icon: Crown, label: "Mestre", hint: "Arquivo geral" },
  { path: "/profile", icon: User, label: "Perfil", hint: "Conta" },
];

export default function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isActivePath = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const items = isAdmin ? [...NAV_ITEMS, { path: "/admin", icon: Shield, label: "ADM", hint: "Painel" }] : NAV_ITEMS;

  return (
    <div className="min-h-screen font-inter flex flex-col st-grain relative">
      <ScarletField />
      <RiftTransition routeKey={location.pathname} />

      <div className="flex flex-1 relative z-10">
        {/* Barra lateral (desktop) */}
        <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-0 h-screen border-r border-border/70 bg-[hsl(150_22%_4%/0.72)] backdrop-blur-xl px-5 py-7">
          <Link to="/" className="flex items-center gap-3 mb-10 group">
            <div className="relative">
              <span className="absolute -inset-1 rounded-full bg-primary/40 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <img src={LOGO_URL} alt="" className="relative w-11 h-11 rounded-full object-cover ring-1 ring-primary/60" />
            </div>
            <div className="leading-tight">
              <div className="font-cinzel text-[15px] font-bold tracking-[0.12em] text-foreground">SCARLET</div>
              <div className="font-display italic text-lg text-primary -mt-1">Travellers</div>
            </div>
          </Link>

          <nav className="flex flex-col gap-1 relative">
            {items.map((item, i) => {
              const isActive = isActivePath(item.path);
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                >
                  <Link
                    to={item.path}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 group ${
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="st-nav-active"
                        className="absolute inset-0 rounded-xl border border-primary/40 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="st-nav-thread"
                        className="absolute -left-5 top-1/2 -translate-y-1/2 h-8 w-[3px] rounded-full bg-primary shadow-[0_0_14px_hsl(145_90%_55%)]"
                      />
                    )}
                    <item.icon className={`relative w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-primary" : ""}`} />
                    <span className="relative text-sm font-medium">{item.label}</span>
                    <span className="relative ml-auto text-[10px] uppercase tracking-[0.18em] text-muted-foreground/0 group-hover:text-muted-foreground/70 transition-colors">
                      {item.hint}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-border/60">
            <p className="font-display italic text-sm text-muted-foreground leading-snug">
              "Infinitos universos. Infinitas vidas. Uma única missão."
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 mt-3">
              Sistema de Izumi Yoshikawa
            </p>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 min-w-0 pb-24 xl:pb-0">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none", transform: "none" } }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Navegação inferior (celular) */}
      <nav className="xl:hidden fixed bottom-3 left-3 right-3 z-50 rounded-2xl border border-border/80 bg-[hsl(150_20%_5%/0.88)] backdrop-blur-xl shadow-[0_10px_40px_-10px_hsl(145_80%_30%/0.6)]">
        <div className="flex items-stretch justify-between px-1 py-1">
          {items.map((item) => {
            const isActive = isActivePath(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="st-mnav-active"
                    className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/30"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <item.icon className={`relative w-5 h-5 ${isActive ? "stroke-[2.4]" : ""}`} />
                <span className="relative text-[9.5px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
