/**
 * Automação da ficha: o que a Origem, a C.A.S.A. e a Classe dão de graça.
 * Lê os textos das opções (os mesmos que o ADM edita em "Construção"),
 * então funciona tanto com o conteúdo padrão quanto com o personalizado.
 */
import { ORIGIN_OPTIONS, CASA_OPTIONS, CLASS_SKILLS } from "@/lib/builderData";

export const BASE_VITAL = 10;

const DICE_RE = /(\d+)\s*d\s*(\d+)/i;

export function rollDice(formula) {
  const m = DICE_RE.exec(formula || "");
  if (!m) return { formula: "", rolls: [], total: 0 };
  const n = Math.min(20, Number(m[1]) || 1);
  const sides = Number(m[2]) || 6;
  const rolls = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * sides));
  return { formula: `${n}d${sides}`, rolls, total: rolls.reduce((a, b) => a + b, 0) };
}

/** Lê "+1d6 PV", "Começam com 14 moedas de bronze", "3 slots de inventário" etc. */
export function parseOrigin(opt) {
  const lines = [...(opt?.bonuses || []), ...(opt?.access || []), ...(opt?.caracteristicas || [])];
  const find = (re) => {
    for (const l of lines) {
      const m = re.exec(l);
      if (m) return m;
    }
    return null;
  };
  const dice = (tag) => {
    const m = find(new RegExp(`(\\d+\\s*d\\s*\\d+)\\s*${tag}\\b`, "i"));
    return m ? m[1].replace(/\s+/g, "") : "";
  };
  const coins = find(/(\d+)\s*moedas?\s*(de\s*\w+)?/i);
  const slots = find(/(\d+)\s*slots?/i);
  return {
    pv: dice("PV"),
    pe: dice("PE"),
    ps: dice("PS"),
    coins: coins ? `${coins[1]} moedas ${coins[2] || ""}`.trim() : "",
    slots: slots ? Number(slots[1]) : 0,
  };
}

const findOpt = (opts, name, fallback) =>
  (opts || []).find((o) => o.name === name) || (fallback || []).find((o) => o.name === name);

const traitText = (opt) => {
  const parts = [];
  if (opt?.description) parts.push(opt.description);
  const list = [...(opt?.access || []), ...(opt?.bonuses || []), ...(opt?.caracteristicas || [])];
  if (list.length) parts.push(list.map((l) => `• ${l}`).join("\n"));
  return parts.join("\n\n");
};

/** Entradas de "Habilidades" que a Origem e a(s) C.A.S.A.(s) dão automaticamente. */
export function traitAbilities({ origin, casa, casa2, originOptions, casaOptions }) {
  const out = [];
  const o = findOpt(originOptions, origin, ORIGIN_OPTIONS);
  if (o) out.push({ name: `Origem ${o.name}`, cost: 0, ed: "Passiva", damage: "—", description: traitText(o), source: "origem" });
  [casa, casa2].filter(Boolean).forEach((c, i) => {
    const opt = findOpt(casaOptions, c, CASA_OPTIONS);
    out.push({
      name: `C.A.S.A. ${c}${casa2 ? (i === 0 ? " (Principal)" : " (Secundária)") : ""}`,
      cost: 0,
      ed: "Passiva",
      damage: "—",
      description: opt ? traitText(opt) : "",
      source: "casa",
    });
  });
  return out;
}

/** Tudo o que a criação aplica sozinha (usado na prévia e ao criar a ficha). */
export function startingKit({ character, originOptions, casaOptions, rolls }) {
  const origin = findOpt(originOptions, character.origin, ORIGIN_OPTIONS);
  const pack = parseOrigin(origin);
  const r = rolls || {};
  const vital = (key) => {
    const roll = r[key];
    const total = BASE_VITAL + (roll?.total || 0);
    return { formula: pack[key], roll, total };
  };
  const inventoryLines = [];
  if (pack.coins) inventoryLines.push(`Dinheiro: ${pack.coins}`);
  if (pack.slots) inventoryLines.push(`Slots de inventário: ${pack.slots}`, ...Array.from({ length: pack.slots }, (_, i) => `  ${i + 1}. (vazio)`));
  return {
    pack,
    pv: vital("pv"),
    pe: vital("pe"),
    ps: vital("ps"),
    inventory: inventoryLines.join("\n"),
    traits: traitAbilities({
      origin: character.origin,
      casa: character.casa,
      casa2: character.casa_2,
      originOptions,
      casaOptions,
    }),
  };
}

export function rollStartingVitals(character, originOptions) {
  const pack = parseOrigin(findOpt(originOptions, character.origin, ORIGIN_OPTIONS));
  return { pv: rollDice(pack.pv), pe: rollDice(pack.pe), ps: rollDice(pack.ps) };
}

/** Habilidades da(s) classe(s) da ficha, para a lista "Disponíveis". */
export function classAbilityCatalog(charClass) {
  const classes = String(charClass || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  const out = [];
  classes.forEach((c) => {
    (CLASS_SKILLS[c]?.habilidades || []).forEach((h) => out.push({ ...h, source: c }));
  });
  return out;
}
