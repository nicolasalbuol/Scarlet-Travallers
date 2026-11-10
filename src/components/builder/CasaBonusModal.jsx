import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ATTRIBUTE_NAMES, ATTRIBUTE_ORDER } from "@/lib/builderData";
import { emptyPoints } from "@/lib/attributeBonuses";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function AttrPicker({ label, value, exclude, onChange }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <div className="grid grid-cols-3 gap-1.5">
        {ATTRIBUTE_ORDER.map((key) => {
          const disabled = exclude && key === exclude;
          const selected = value === key;
          return (
            <button
              key={key}
              disabled={disabled}
              onClick={() => onChange(key)}
              className={cn(
                "py-2 rounded-md border text-xs font-medium transition-colors",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : disabled
                    ? "border-border opacity-30 cursor-not-allowed"
                    : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const fmtBonus = (b) =>
  Object.entries(b)
    .map(([k, v]) => `+${v} ${ATTRIBUTE_NAMES[k] || k}`)
    .join(" · ");

/** Livro: cada C.A.S.A. tem entidades, e cada entidade oferece duas distribuições fixas. */
function EntityPicker({ casaName, entidades, onConfirm, onClose }) {
  const [pick, setPick] = useState(null); // { entidade, index }
  const confirm = () => {
    if (!pick) return;
    const bonus = emptyPoints();
    Object.entries(pick.entidade.options[pick.index]).forEach(([k, v]) => { bonus[k] = (bonus[k] || 0) + v; });
    onConfirm(bonus, pick.entidade.name);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="st-panel max-w-lg w-full p-4 sm:p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-lg font-bold text-primary">Entidade da C.A.S.A.</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Escolha a entidade de <span className="text-foreground font-medium">{casaName}</span> e um dos dois bônus de atributo que ela oferece.
        </p>
        <div className="space-y-3">
          {entidades.map((ent) => (
            <div key={ent.name} className="rounded-xl border border-border p-3">
              <div className="font-cinzel font-semibold text-foreground mb-2">{ent.name}</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {ent.options.map((opt, i) => {
                  const on = pick?.entidade.name === ent.name && pick.index === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setPick({ entidade: ent, index: i })}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-xs text-left transition-colors",
                        on ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {fmtBonus(opt)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" disabled={!pick} onClick={confirm}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
}

export default function CasaBonusModal({ casaName, casaOption, onConfirm, onClose }) {
  if (casaOption?.entidades?.length) {
    return <EntityPicker casaName={casaName} entidades={casaOption.entidades} onConfirm={onConfirm} onClose={onClose} />;
  }
  return <FreeBonusModal casaName={casaName} onConfirm={onConfirm} onClose={onClose} />;
}

// C.A.S.A. personalizada pelo ADM sem entidades: distribuição livre 2/2 ou 3/1.
function FreeBonusModal({ casaName, onConfirm, onClose }) {
  const [mode, setMode] = useState("2/2");
  const [attrA, setAttrA] = useState("");
  const [attrB, setAttrB] = useState("");

  useEffect(() => {
    setAttrA("");
    setAttrB("");
  }, [mode]);

  const canConfirm = !!attrA && !!attrB && attrA !== attrB;

  const handleConfirm = () => {
    if (!canConfirm) return;
    const bonus = emptyPoints();
    if (mode === "2/2") {
      bonus[attrA] = 2;
      bonus[attrB] = 2;
    } else {
      bonus[attrA] = 3;
      bonus[attrB] = 1;
    }
    onConfirm(bonus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-4 sm:p-6 space-y-4 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-lg font-bold text-primary">Bônus de Atributo da C.A.S.A.</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Sua C.A.S.A. <span className="text-foreground font-medium">{casaName}</span> concede bônus de atributo. Escolha como distribuir.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {["2/2", "3/1"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "py-2 rounded-lg border text-sm font-medium transition-colors",
                mode === m
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {m === "2/2" ? "2 em dois atributos" : "3 em um + 1 em outro"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <AttrPicker
            label={mode === "2/2" ? "Primeiro atributo (+2)" : "Atributo principal (+3)"}
            value={attrA}
            exclude={attrB}
            onChange={setAttrA}
          />
          <AttrPicker
            label={mode === "2/2" ? "Segundo atributo (+2)" : "Atributo secundário (+1)"}
            value={attrB}
            exclude={attrA}
            onChange={setAttrB}
          />
        </div>

        {canConfirm && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            <span className="text-muted-foreground">Distribuição: </span>
            <span className="text-foreground font-medium">
              {ATTRIBUTE_NAMES[attrA]} +{mode === "2/2" ? 2 : 3}
              {"  ·  "}
              {ATTRIBUTE_NAMES[attrB]} +{mode === "2/2" ? 2 : 1}
            </span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button className="flex-1" disabled={!canConfirm} onClick={handleConfirm}>Confirmar</Button>
        </div>
      </div>
    </div>
  );
}