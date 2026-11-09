import React from "react";
import { ATTRIBUTE_ORDER, ATTRIBUTE_NAMES } from "@/lib/builderData";
import { attributeTotal } from "@/lib/attributeBonuses";

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-2 py-1.5 border-b border-border/50 text-sm">
      <span className="text-muted-foreground whitespace-nowrap">{label}</span>
      <span className="font-medium text-foreground text-right">{value || "—"}</span>
    </div>
  );
}

export default function FinalSummary({ character }) {
  const bond = character.bond_elemento
    ? `${character.bond_plano} · ${character.bond_circulo} · ${character.bond_elemento}`
    : character.bond;
  const race = character.race_2 ? `${character.race} / ${character.race_2}` : character.race;
  const charClass = character.char_class_2 ? `${character.char_class} / ${character.char_class_2}` : character.char_class;
  const casa = character.casa_2 ? `${character.casa} / ${character.casa_2}` : character.casa;
  const attrs = ATTRIBUTE_ORDER.map(
    (k) => `${ATTRIBUTE_NAMES[k].slice(0, 3)} ${attributeTotal(character.casaBonus, character.attributePoints, k)}`
  ).join(" · ");

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="font-cinzel text-sm font-bold text-primary mb-2">Resumo do Personagem</h3>
      <Row label="Nome" value={character.name} />
      <Row label="Origem" value={character.origin} />
      <Row label="Passado" value={character.passado} />
      <Row label="Raça" value={race} />
      <Row label="Classe" value={charClass} />
      <Row label="C.A.S.A." value={casa} />
      <Row label="Vínculo" value={bond} />
      <Row label="Atributos" value={attrs} />
      <Row label="Alinhamento" value={character.alignment} />
      <Row label="Nível" value={character.level} />
    </div>
  );
}