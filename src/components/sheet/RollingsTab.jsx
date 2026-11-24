import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dices } from "lucide-react";
import CritFx, { critConfetti } from "@/components/dice/CritFx";

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

function rollN(n, sides) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
}

// Crítico só existe no d20 e olha o dado natural (sem modificador):
// algum 20 = sucesso crítico; todos os dados em 1 = falha crítica (mesma regra do teste, que usa o maior).
export function critOf(sides, rolls) {
  if (sides !== 20 || rolls.length === 0) return null;
  if (rolls.includes(20)) return "crit";
  if (rolls.every((r) => r === 1)) return "fail";
  return null;
}

export default function RollingsTab() {
  const [results, setResults] = useState([]);
  const [freeQty, setFreeQty] = useState(1);
  const [freeSides, setFreeSides] = useState(20);
  const [freeMod, setFreeMod] = useState(0);
  const [fx, setFx] = useState(null);

  const addResult = (label, rolls, mod, sides) => {
    const total = rolls.reduce((a, b) => a + b, 0) + mod;
    const crit = critOf(sides, rolls);
    setResults((prev) => [{ label, rolls, mod, total, crit, id: Date.now() }, ...prev].slice(0, 15));
    if (crit) {
      setFx(null);
      requestAnimationFrame(() => setFx(crit)); // reinicia o efeito se sair outro crítico em seguida
      if (crit === "crit") critConfetti();
      if (navigator.vibrate) navigator.vibrate(crit === "crit" ? [100, 50, 100, 50, 200] : [300]);
    }
  };

  const quickRoll = (sides) => {
    const rolls = rollN(1, sides);
    addResult(`d${sides}`, rolls, 0, sides);
  };

  const freeRoll = () => {
    const qty = Math.max(1, Math.min(20, Number(freeQty) || 1));
    const sides = Math.max(2, Number(freeSides) || 20);
    const mod = Number(freeMod) || 0;
    const rolls = rollN(qty, sides);
    const label = `${qty}d${sides}${mod > 0 ? ` + ${mod}` : mod < 0 ? ` - ${Math.abs(mod)}` : ""}`;
    addResult(label, rolls, mod, sides);
  };

  return (
    <div className="mt-4 space-y-5">
      {fx && <CritFx kind={fx} onDone={() => setFx(null)} />}
      {/* Quick Dice */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">DADOS RÁPIDOS</h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {DICE_TYPES.map((sides) => (
            <button
              key={sides}
              onClick={() => quickRoll(sides)}
              className="flex flex-col items-center justify-center aspect-square rounded-xl bg-card border border-border hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-150 active:scale-95 gap-1"
            >
              <Dices className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              <span className="text-xs font-bold font-cinzel">d{sides}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Free Roll */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground mb-3">ROLAGEM LIVRE</h3>
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[9px] text-muted-foreground block mb-1">Quantidade</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={freeQty}
                onChange={(e) => setFreeQty(e.target.value)}
                className="bg-background text-center text-sm"
              />
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground block mb-1">Tipo de Dado</label>
              <Select value={String(freeSides)} onValueChange={(v) => setFreeSides(Number(v))}>
                <SelectTrigger className="bg-background text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DICE_TYPES.map((d) => (
                    <SelectItem key={d} value={String(d)}>d{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[9px] text-muted-foreground block mb-1">Modificador</label>
              <Input
                type="number"
                value={freeMod}
                onChange={(e) => setFreeMod(e.target.value)}
                placeholder="0"
                className="bg-background text-center text-sm"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground font-mono">
              {Math.max(1, Math.min(20, Number(freeQty) || 1))}d{Math.max(2, Number(freeSides) || 20)}
              {Number(freeMod) > 0 ? ` + ${freeMod}` : Number(freeMod) < 0 ? ` - ${Math.abs(Number(freeMod))}` : ""}
            </p>
            <Button onClick={freeRoll} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Dices className="w-4 h-4 mr-2" /> Rolar
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-muted-foreground">HISTÓRICO</h3>
            <button onClick={() => setResults([])} className="text-[10px] text-muted-foreground hover:text-destructive transition-colors">Limpar</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((r) => {
              const isNat20 = r.crit === "crit";
              const isNat1 = r.crit === "fail";
              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-sm border ${
                    isNat20 ? "bg-primary/10 border-primary/30 text-primary" :
                    isNat1 ? "bg-[hsl(var(--fail)/0.12)] border-[hsl(var(--fail)/0.4)] text-[hsl(var(--fail))]" :
                    "bg-card border-border"
                  }`}
                >
                  <span className="font-medium text-xs">{r.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    [{r.rolls.join(", ")}]{r.mod !== 0 ? ` ${r.mod > 0 ? "+" : ""}${r.mod}` : ""}
                    {" → "}<strong className="text-foreground">{r.total}</strong>
                    {isNat20 && " ★"}{isNat1 && " ✗"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}