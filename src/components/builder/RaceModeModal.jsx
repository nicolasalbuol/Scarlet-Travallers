import React from "react";
import { motion } from "framer-motion";
import { User, Users, ArrowLeft } from "lucide-react";

const OPTIONS = [
  {
    mode: "unica",
    icon: User,
    title: "Raça Única (1 raça)",
    desc: "Você terá a vantagem e a desvantagem de uma única raça.",
  },
  {
    mode: "hibrida",
    icon: Users,
    title: "Raça Híbrida (2 raças)",
    desc: "Você terá a vantagem de uma raça e a desvantagem da outra.",
  },
];

export default function RaceModeModal({ onChoose, onBack }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <h3 className="font-cinzel text-lg font-bold text-primary mb-1">Escolher</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Defina como deseja escolher a raça do seu personagem.
        </p>

        <div className="space-y-3">
          {OPTIONS.map(({ mode, icon: Icon, title, desc }) => (
            <button
              key={mode}
              onClick={() => onChoose(mode)}
              className="w-full text-left p-4 rounded-xl border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <div className="flex items-center gap-3 mb-1">
                <Icon className="w-5 h-5 text-primary" />
                <span className="font-cinzel font-semibold text-foreground">{title}</span>
              </div>
              <p className="text-sm text-muted-foreground pl-8">{desc}</p>
            </button>
          ))}
        </div>

        <button
          onClick={onBack}
          className="mt-5 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar à etapa anterior
        </button>
      </motion.div>
    </div>
  );
}