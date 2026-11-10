import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RaceHybridModal({ race1, race2, options, onConfirm, onClose }) {
  const [advantageRace, setAdvantageRace] = useState(null);
  const [disadvantageRace, setDisadvantageRace] = useState(null);

  const races = [race1, race2]
    .filter(Boolean)
    .map((name) => options.find((o) => o.name === name))
    .filter(Boolean);

  // Regra de bloqueio cruzado: a vantagem e a desvantagem devem vir de raças
  // diferentes. Selecionar a vantagem de uma raça bloqueia a vantagem da outra
  // e a desvantagem da própria raça (e vice-versa).
  const isVantagemDisabled = (raceName) => {
    if (advantageRace && advantageRace !== raceName) return true;
    if (disadvantageRace === raceName) return true;
    return false;
  };
  const isDesvantagemDisabled = (raceName) => {
    if (disadvantageRace && disadvantageRace !== raceName) return true;
    if (advantageRace === raceName) return true;
    return false;
  };

  const toggleVantagem = (raceName) => {
    if (isVantagemDisabled(raceName)) return;
    setAdvantageRace((prev) => (prev === raceName ? null : raceName));
  };
  const toggleDesvantagem = (raceName) => {
    if (isDesvantagemDisabled(raceName)) return;
    setDisadvantageRace((prev) => (prev === raceName ? null : raceName));
  };

  const canConfirm =
    advantageRace && disadvantageRace && advantageRace !== disadvantageRace;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(advantageRace, disadvantageRace);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-cinzel text-lg font-bold text-primary">
            Seleção de Vantagem e Desvantagem
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Escolha <span className="text-foreground font-medium">1 vantagem</span> de uma raça e{" "}
          <span className="text-foreground font-medium">1 desvantagem</span> da outra raça.
        </p>

        <div className="space-y-4">
          {races.map((race) => (
            <div key={race.name} className="border border-border rounded-xl p-4 bg-background/50">
              <h4 className="font-cinzel font-semibold text-foreground mb-3">{race.name}</h4>
              <SelectableBox
                label="Vantagem"
                value={race.vantagem}
                selected={advantageRace === race.name}
                disabled={isVantagemDisabled(race.name)}
                onClick={() => toggleVantagem(race.name)}
              />
              <div className="mt-2">
                <SelectableBox
                  label="Desvantagem"
                  value={race.desvantagem}
                  selected={disadvantageRace === race.name}
                  disabled={isDesvantagemDisabled(race.name)}
                  onClick={() => toggleDesvantagem(race.name)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm} className="flex-1 bg-primary text-primary-foreground">
            <Check className="w-4 h-4 mr-1" /> OK
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function SelectableBox({ label, value, selected, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        disabled
          ? "border-border/40 bg-muted/30 opacity-40 cursor-not-allowed"
          : selected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {selected ? (
          <Check className="w-4 h-4 text-primary" />
        ) : (
          <div className="w-4 h-4 rounded-full border border-border" />
        )}
        <span className="text-xs font-semibold text-primary">{label}</span>
      </div>
      <p className="text-sm text-foreground/80 pl-6">{value || "—"}</p>
    </button>
  );
}