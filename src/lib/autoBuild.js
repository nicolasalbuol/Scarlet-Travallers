/**
 * Automação da ficha seguindo o livro Scarlet Travellers.
 * Tudo é lido dos textos das opções (os mesmos que o ADM pode editar),
 * então continua funcionando se o conteúdo for personalizado.
 *
 * Regras usadas (livro):
 *  - PV/PS/PE iniciais pela Origem: "PV inicial: 40 + CON" etc.
 *  - Moedas e slots pela Origem: "25 moedas de bronze", "6+FOR slots".
 *  - Passiva base da C.A.S.A. (só a principal): "+2 em Vontade e Sorte",
 *    "+15PV +5PS", "+4 de slot", "+5 em CA Física", "+5 de CA Magia".
 *  - CA Física = 10 + CON + Fortitude ; CA Mágica = 10 + (PE/5) + Feitiçaria.
 *  - Perícias treinadas: +5.
 */
import { ORIGIN_OPTIONS, CASA_OPTIONS, CLASS_SKILLS } from "@/lib/builderData";

export const TRAINED_VALUE = 5;
export const BASE_PERICIAS = 6;

const ATTR_KEYS = ["FOR", "DES", "CON", "INT", "SAB", "CAR"];
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const findOpt = (opts, name, fallback) =>
  (opts || []).find((o) => o.name === name) || (fallback || []).find((o) => o.name === name);

const textOf = (opt) =>
  [opt?.passiva, ...(opt?.caracteristicas || []), ...(opt?.access || []), ...(opt?.bonuses || [])]
    .filter(Boolean)
    .join(" \n ");

/** "PV inicial: 40 + CON" → { base: 40, attr: "CON" } */
function parseVital(text, tag) {
  const m = new RegExp(`${tag}\\s*inicial\\s*:?\\s*(\\d+)\\s*\\+?\\s*(FOR|DES|CON|INT|SAB|CAR)?`, "i").exec(text);
  return m ? { base: Number(m[1]), attr: (m[2] || "").toUpperCase() } : { base: 0, attr: "" };
}

export function parseOrigin(opt) {
  const t = textOf(opt);
  const coins = /(\d+)\s*moedas?\s*(de\s*[a-zçãéêó]+)?/i.exec(t);
  const slots = /(\d+)\s*\+?\s*(FOR|DES|CON|INT|SAB|CAR)?\s*slots?/i.exec(t);
  return {
    pv: parseVital(t, "PV"),
    ps: parseVital(t, "PS"),
    pe: parseVital(t, "PE"),
    coins: coins ? `${coins[1]} moedas ${coins[2] || ""}`.trim() : "",
    slots: slots ? { base: Number(slots[1]), attr: (slots[2] || "").toUpperCase() } : { base: 0, attr: "" },
  };
}

/** Bônus numéricos da passiva base da C.A.S.A. */
export function parseCasaPassiva(opt) {
  const t = opt?.passiva || (opt?.caracteristicas || []).find((c) => /passiva/i.test(c)) || "";
  const num = (re) => {
    const m = re.exec(t);
    return m ? Number(m[1]) : 0;
  };
  const skills = [];
  const sm = /recebe\s*\+(\d+)\s*em\s*([^/.]+)/i.exec(t);
  if (sm) {
    sm[2]
      .split(/\s+e\s+|,/)
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((name) => skills.push({ name, value: Number(sm[1]) }));
  }
  return {
    skills,
    pv: num(/\+(\d+)\s*PV/i),
    ps: num(/\+(\d+)\s*PS/i),
    pe: num(/\+(\d+)\s*PE/i),
    slots: num(/\+(\d+)\s*(?:de\s*)?slots?/i),
    caFisica: num(/\+(\d+)\s*em\s*CA\s*F[ií]s/i),
    caMagica: num(/\+(\d+)\s*de\s*CA\s*M[aá]g/i),
  };
}

/** Nomes do livro que variam um pouco do nome da perícia na ficha. */
const SKILL_ALIASES = { fortitudo: "fortitude", reflexo: "reflexos" };
export function matchSkill(skills, name) {
  const n = SKILL_ALIASES[norm(name)] || norm(name);
  return (skills || []).find((s) => norm(s.name) === n);
}

const traitText = (opt, extra = []) => {
  const parts = [];
  if (opt?.description) parts.push(opt.description);
  const list = [...extra, ...(opt?.caracteristicas || [...(opt?.access || []), ...(opt?.bonuses || [])])];
  if (list.length) parts.push(list.map((l) => `• ${l}`).join("\n"));
  return parts.join("\n\n");
};

/** Entradas da aba Habilidades que Origem e C.A.S.A.(s) dão automaticamente. */
export function traitAbilities({ origin, casa, casa2, entidade, originOptions, casaOptions }) {
  const out = [];
  const o = findOpt(originOptions, origin, ORIGIN_OPTIONS);
  if (o) out.push({ name: `Origem ${o.name}`, cost: 0, ed: "Passiva", damage: "—", description: traitText(o), source: "origem" });
  [casa, casa2].filter(Boolean).forEach((c, i) => {
    const opt = findOpt(casaOptions, c, CASA_OPTIONS);
    const secondary = i === 1;
    const label = casa2 ? (secondary ? " (Secundária)" : " (Principal)") : "";
    const ent = !secondary && entidade ? [`Entidade escolhida: ${entidade}`] : [];
    out.push({
      name: `C.A.S.A. ${c}${label}`,
      cost: 0,
      ed: secondary ? "Selo de Comando" : "Passiva",
      damage: "—",
      description: opt ? traitText(opt, ent) : ent.join(""),
      source: "casa",
    });
  });
  return out;
}

/**
 * Tudo o que a criação aplica sozinha.
 * `attributes` são os atributos finais; `skills` as perícias já com treino/bônus.
 */
export function startingKit({ character, originOptions, casaOptions, attributes = {}, skills = [] }) {
  const origin = findOpt(originOptions, character.origin, ORIGIN_OPTIONS);
  const pack = parseOrigin(origin);
  const casaOpt = character.casa ? findOpt(casaOptions, character.casa, CASA_OPTIONS) : null;
  const passiva = casaOpt ? parseCasaPassiva(casaOpt) : parseCasaPassiva(null);
  const a = (k) => Number(attributes[k] || 0);

  const vital = (key) => {
    const v = pack[key];
    const attrVal = v.attr ? a(v.attr) : 0;
    const bonus = passiva[key] || 0;
    return { base: v.base, attr: v.attr, attrVal, bonus, total: v.base + attrVal + bonus, known: v.base > 0 };
  };
  const pv = vital("pv");
  const ps = vital("ps");
  const pe = vital("pe");

  const slotsTotal = pack.slots.base + (pack.slots.attr ? a(pack.slots.attr) : 0) + passiva.slots;

  const skillVal = (name) => {
    const s = matchSkill(skills, name);
    return s ? Number(s.training || 0) + Number(s.bonus || 0) : 0;
  };
  const caFisica = 10 + a("CON") + skillVal("Fortitude") + passiva.caFisica;
  const caMagica = 10 + Math.floor(pe.total / 5) + skillVal("Feitiçaria") + passiva.caMagica;

  const inventoryLines = [];
  if (pack.coins) inventoryLines.push(`Dinheiro: ${pack.coins}`);
  if (slotsTotal > 0) {
    inventoryLines.push(`Slots de inventário: ${slotsTotal}`);
    for (let i = 1; i <= slotsTotal; i++) inventoryLines.push(`  ${i}. (vazio)`);
  }

  return {
    pack,
    passiva,
    pv,
    ps,
    pe,
    slots: { ...pack.slots, attrVal: pack.slots.attr ? a(pack.slots.attr) : 0, bonus: passiva.slots, total: slotsTotal },
    ca: { fisica: caFisica, magica: caMagica },
    inventory: inventoryLines.join("\n"),
    traits: traitAbilities({
      origin: character.origin,
      casa: character.casa,
      casa2: character.casa_2,
      entidade: character.casa_entidade,
      originOptions,
      casaOptions,
    }),
  };
}

/** Aplica os +2 da passiva base da C.A.S.A. principal nas perícias. */
export function applyCasaSkillBonus(skills, casaOpt) {
  if (!casaOpt) return skills;
  const { skills: bonus } = parseCasaPassiva(casaOpt);
  bonus.forEach(({ name, value }) => {
    const s = matchSkill(skills, name);
    if (s) s.bonus = Number(s.bonus || 0) + value;
  });
  return skills;
}

/** Skills (passivas e habilidades) da(s) classe(s) da ficha, para a lista "Disponíveis". */
export function classAbilityCatalog(charClass) {
  const classes = String(charClass || "")
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  const out = [];
  classes.forEach((c) => {
    const data = CLASS_SKILLS[c];
    if (!data) return;
    (data.passivas || []).forEach((p) => out.push({ name: p.name, cost: 0, ed: "Passiva", damage: "—", description: p.description, source: c }));
    (data.habilidades || []).forEach((h) => out.push({ ...h, source: c }));
  });
  return out;
}

export { ATTR_KEYS };
