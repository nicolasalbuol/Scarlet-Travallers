import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dices, Sparkles, Skull, Minus, Plus } from "lucide-react";
import { rollTest } from "@/lib/diceRoller";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

/** d20 em SVG que gira enquanto os números piscam. */
function SpinningD20({ rolling, value, tone = "default" }) {
  const [face, setFace] = useState(20);
  React.useEffect(() => {
    if (!rolling) { if (value != null) setFace(value); return; }
    const id = setInterval(() => setFace(1 + Math.floor(Math.random() * 20)), 55);
    return () => clearInterval(id);
  }, [rolling, value]);
  const stroke = tone === "crit" ? "hsl(40 80% 65%)" : tone === "fail" ? "hsl(14 88% 58%)" : "hsl(161 38% 58%)";
  return (
    <motion.div
      className="relative w-28 h-28 mx-auto"
      animate={rolling ? { rotate: [0, 200, 400, 720], scale: [1, 1.15, 0.95, 1] } : { rotate: 0, scale: [1.25, 1] }}
      transition={rolling ? { duration: 1, ease: "easeOut" } : { type: "spring", stiffness: 300, damping: 12 }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
        <polygon points="50,3 92,27 92,73 50,97 8,73 8,27" fill="hsl(161 20% 8%)" stroke={stroke} strokeWidth="2" style={{ filter: `drop-shadow(0 0 10px ${stroke})` }} />
        <polygon points="50,22 76,66 24,66" fill="none" stroke={stroke} strokeOpacity="0.7" strokeWidth="1.2" />
        <g stroke={stroke} strokeOpacity="0.35" strokeWidth="1">
          <line x1="50" y1="3" x2="50" y2="22" /><line x1="92" y1="27" x2="76" y2="66" /><line x1="92" y1="27" x2="50" y2="22" />
          <line x1="8" y1="27" x2="24" y2="66" /><line x1="8" y1="27" x2="50" y2="22" /><line x1="92" y1="73" x2="76" y2="66" />
          <line x1="8" y1="73" x2="24" y2="66" /><line x1="50" y1="97" x2="76" y2="66" /><line x1="50" y1="97" x2="24" y2="66" />
        </g>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center pt-3 font-cinzel text-2xl font-bold text-foreground tabular-nums">{face}</span>
    </motion.div>
  );
}

const plural = (n, sing, plur) => `${n} ${n === 1 ? sing : plur}`;

function Stepper({ label, value, onChange, accent }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="outline"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="h-7 w-7"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className={`w-7 text-center font-mono text-sm font-bold ${accent}`}>{value}</span>
        <Button size="icon" variant="outline" onClick={() => onChange(value + 1)} className="h-7 w-7">
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export default function DiceRollModal({
  open,
  onClose,
  label,
  attributeValue = 0,
  training = 0,
  bonus = 0,
  onRollResult,
}) {
  const [extraBonus, setExtraBonus] = useState(0);
  const [advantages, setAdvantages] = useState(0);
  const [disadvantages, setDisadvantages] = useState(0);
  const [result, setResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const attr = Number(attributeValue) || 0;
  const net = attr + advantages - disadvantages;
  const worst = net <= 0;

  const handleRoll = () => {
    setIsRolling(true);
    setResult(null);

    if (navigator.vibrate) navigator.vibrate(100);

    setTimeout(() => {
      const res = rollTest({
        attributeValue: attr,
        training,
        bonus,
        extraBonus: Number(extraBonus) || 0,
        advantages,
        disadvantages,
      });
      setResult(res);
      setIsRolling(false);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (res.isCritical && !reduce) {
        confetti({ particleCount: 140, spread: 80, startVelocity: 42, origin: { y: 0.55 }, colors: ["#e8c26a", "#f5dc9b", "#5f8c7e", "#ffffff"], zIndex: 9999 });
      }
      if (onRollResult) onRollResult({ ...res, label });
      if (navigator.vibrate && res.isCritical) navigator.vibrate([100, 50, 100, 50, 200]);
      if (navigator.vibrate && res.isCriticalFail) navigator.vibrate([300]);
    }, 1000);
  };

  const handleClose = () => {
    setResult(null);
    setExtraBonus(0);
    setAdvantages(0);
    setDisadvantages(0);
    onClose();
  };

  const balanceText = (() => {
    if (advantages === 0 && disadvantages === 0) return "";
    const parts = [];
    if (advantages > 0) parts.push(plural(advantages, "vantagem", "vantagens"));
    if (disadvantages > 0) parts.push(plural(disadvantages, "desvantagem", "desvantagens"));
    return `Atributo ${attr} + ${parts.join(" − ")} = ${worst ? "2d20 (pior)" : `${net}d20`}`;
  })();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-primary/30 shadow-[0_0_80px_-20px_hsl(161_38%_45%/0.8)]">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-xl flex items-center gap-2 text-primary">
            <Dices className="w-6 h-6" />
            {label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Fórmula */}
          <div className="bg-muted rounded-lg p-3 text-sm font-mono text-center space-y-1">
            <div>
              <span className="text-primary font-bold">{worst ? "2d20" : `${net}d20`}</span>
              <span className="text-muted-foreground ml-1">({worst ? "pior" : "maior"})</span>
              {training > 0 && <span className="text-foreground"> + {training} treino</span>}
              {bonus > 0 && <span className="text-foreground"> + {bonus} bônus</span>}
              {Number(extraBonus) > 0 && <span className="text-accent"> + {extraBonus} extra</span>}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Atributo {attr} → {worst ? "2d20 (pior)" : `${net}d20 (maior)`}
            </div>
            {balanceText && <div className="text-[11px] text-muted-foreground">{balanceText}</div>}
          </div>

          {/* Vantagem / Desvantagem */}
          <div className="space-y-2">
            <Stepper label="Vantagens" value={advantages} onChange={setAdvantages} accent="text-primary" />
            <Stepper label="Desvantagens" value={disadvantages} onChange={setDisadvantages} accent="text-destructive" />
          </div>

          {/* Bônus extra */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Bônus extra (situacional)</Label>
            <Input
              type="number"
              value={extraBonus}
              onChange={(e) => setExtraBonus(e.target.value)}
              className="bg-background border-border"
              min={0}
            />
          </div>

          {/* Dado */}
          {(isRolling || result) && (
            <SpinningD20
              rolling={isRolling}
              value={result?.selectedRoll}
              tone={result?.isCritical ? "crit" : result?.isCriticalFail ? "fail" : "default"}
            />
          )}

          {/* Botão rolar */}
          <Button
            onClick={handleRoll}
            disabled={isRolling}
            className="w-full h-14 text-lg font-cinzel font-bold tracking-[0.3em] bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_-6px_hsl(161_38%_50%/0.9)]"
          >
            {isRolling ? (
              <Dices className="w-6 h-6 animate-dice-roll" />
            ) : (
              "ROLAR"
            )}
          </Button>

          {/* Resultado */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={result.isCriticalFail ? { opacity: 1, scale: 1, y: 0, x: [0, -10, 9, -6, 4, 0] } : { opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                exit={{ opacity: 0 }}
                className={`rounded-xl p-5 text-center space-y-3 ${
                  result.isCritical
                    ? "bg-accent/15 border-2 border-accent animate-critical"
                    : result.isCriticalFail
                    ? "bg-destructive/20 border-2 border-destructive animate-fail"
                    : "bg-muted border border-border"
                }`}
              >
                {result.isCritical && (
                  <div className="flex items-center justify-center gap-2 text-accent">
                    <Sparkles className="w-6 h-6" />
                    <span className="font-cinzel font-bold text-xl">CRÍTICO!</span>
                    <Sparkles className="w-6 h-6" />
                  </div>
                )}
                {result.isCriticalFail && (
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <Skull className="w-6 h-6" />
                    <span className="font-cinzel font-bold text-xl">FALHA CRÍTICA!</span>
                    <Skull className="w-6 h-6" />
                  </div>
                )}

                <div className="text-5xl font-cinzel font-bold text-foreground">
                  {result.total}
                </div>

                {/* Todos os dados — o usado fica destacado */}
                <div className="flex flex-wrap justify-center gap-2">
                  {result.rolls.map((r, i) => (
                    <span
                      key={i}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-sm border ${
                        i === result.selectedIndex
                          ? "bg-primary text-primary-foreground border-primary font-bold"
                          : "bg-muted/40 text-muted-foreground/40 border-border"
                      }`}
                    >
                      {r}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    Rolados: <strong className="text-foreground">{result.numDice}d20</strong> · dado usado (
                    {result.worst ? "pior" : "maior"}):{" "}
                    <span
                      className={
                        result.worst ? "text-destructive font-bold" : "text-primary font-bold"
                      }
                    >
                      {result.selectedRoll}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-foreground/80">
                    {result.selectedRoll} (dado)
                    {result.training > 0 && ` + ${result.training} treino`}
                    {result.bonus > 0 && ` + ${result.bonus} bônus`}
                    {result.extraBonus > 0 && ` + ${result.extraBonus} extra`}
                    {` = ${result.total}`}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}