import React from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClassSkillsModal({
  className,
  classData,
  requiredCount,
  selected,
  onToggle,
  onConfirm,
  onClose,
}) {
  const passivas = classData?.passivas || [];
  const habilidades = classData?.habilidades || [];
  const canConfirm = selected.length === requiredCount;

  const isSelected = (name, type) =>
    selected.some((s) => s.name === name && s.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-2xl max-h-[90dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-cinzel text-lg font-bold text-primary">Escolher Skill</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Classe: <span className="text-foreground font-medium">{className}</span> · Selecione{" "}
          {requiredCount} skill{requiredCount > 1 ? "s" : ""} ({selected.length}/{requiredCount}).
        </p>

        {/* Passivas */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-primary mb-2">Passivas</h4>
          <div className="space-y-2">
            {passivas.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhuma passiva disponível.</p>
            ) : (
              passivas.map((item) => (
                <SkillItem
                  key={item.name}
                  item={{ ...item, type: "passiva" }}
                  selected={isSelected(item.name, "passiva")}
                  onToggle={onToggle}
                />
              ))
            )}
          </div>
        </div>

        {/* Habilidades */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-primary mb-2">Habilidades</h4>
          <div className="space-y-2">
            {habilidades.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nenhuma habilidade disponível.</p>
            ) : (
              habilidades.map((item) => (
                <SkillItem
                  key={item.name}
                  item={{ ...item, type: "habilidade" }}
                  selected={isSelected(item.name, "habilidade")}
                  onToggle={onToggle}
                />
              ))
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={!canConfirm} className="flex-1 bg-primary text-primary-foreground">
            <Check className="w-4 h-4 mr-1" /> OK
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function SkillItem({ item, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(item)}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        selected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <div className="flex items-center gap-2">
        {selected ? (
          <Check className="w-4 h-4 text-primary flex-shrink-0" />
        ) : (
          <div className="w-4 h-4 rounded border border-border flex-shrink-0" />
        )}
        <div className="flex-1">
          <span className="font-cinzel font-semibold text-sm text-foreground">{item.name}</span>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
          )}
        </div>
      </div>
    </button>
  );
}