import { ALL_ELEMENTS, ASTRAL_COMPAT, CASA_VINCULO } from "./vinculosData";

const BY_ID = Object.fromEntries(ALL_ELEMENTS.map((e) => [e.id, e]));
export const elementById = (id) => BY_ID[id];

// Contexto da ficha que decide o que fica liberado.
export function vinculoContext(c) {
  return {
    origin: c.origin || "",
    races: [c.race, c.race_2].filter(Boolean),
    classes: [c.char_class, c.char_class_2].filter(Boolean),
    casas: c.origin === "Ômega" || c.origin === "Delta" ? [c.casa, c.origin === "Delta" ? c.casa_2 : ""].filter(Boolean) : [],
    entidade: c.casa_entidade || "",
  };
}

const LIMIT = { Zeta: 3, Alpha: 2, Beta: 1, "Ômega": 2, Delta: 2 };

// shortcut: Ômega e Delta valem 2 (1 por C.A.S.A./slot); se o livro der outro número, ajustar LIMIT.
export function vinculoLimit(ctx) {
  return LIMIT[ctx.origin] || 0;
}

// Vínculos obrigados pela C.A.S.A. (Shadows, Crawlers, Divinus): um slot por C.A.S.A.
export function predefinedSlots(ctx) {
  if (ctx.origin === "Beta") return [];
  return ctx.casas.filter((c) => CASA_VINCULO[c]).map((casa) => ({ casa, options: CASA_VINCULO[casa] }));
}

const nucleoUnico = (ctx) => ctx.casas.includes("Bubukianos") && /n[úu]cleo [úu]nico/i.test(ctx.entidade);

// Trava do círculo pela ficha (Origem, Raça, Classe, C.A.S.A.). Devolve o motivo ou "".
export function circleBaseLock(ctx, circuloId) {
  if (ctx.origin === "Beta" && circuloId !== "corrompido") return "Origem Beta: só 1 elemento Corrompido";
  if (nucleoUnico(ctx) && circuloId !== "celeste") return "Núcleo Único: só o Círculo Celeste";
  switch (circuloId) {
    case "celeste": return ctx.casas.includes("Bubukianos") ? "" : "Requer C.A.S.A. Bubukianos";
    case "paranormal": return ctx.classes.includes("Ocultista") ? "" : "Requer a classe Ocultista";
    case "astral": return ctx.casas.includes("Mahō") ? "" : "Requer C.A.S.A. Mahō";
    case "espiritual": return ctx.races.includes("Qareen") ? "" : "Requer a raça Qareen";
    default: return "";
  }
}

// Trava do círculo pelo que já foi escolhido (Terreno ⇄ Corrompido).
export function circleLock(ctx, chosen, circuloId) {
  const base = circleBaseLock(ctx, circuloId);
  if (base) return base;
  const has = (id) => chosen.some((v) => elementById(v.id)?.circuloId === id);
  if (circuloId === "corrompido" && has("terreno")) return "Trancado: você escolheu um elemento Terreno";
  if (circuloId === "terreno" && has("corrompido")) return "Trancado: você escolheu um elemento Corrompido";
  return "";
}

// Signos ainda liberados = interseção das listas dos signos já escolhidos.
function astralAllowed(chosen, name) {
  const signs = chosen.map((v) => elementById(v.id)).filter((e) => e?.circuloId === "astral").map((e) => e.name);
  return signs.every((s) => s === name || ASTRAL_COMPAT[s]?.includes(name));
}

// Motivo para não poder escolher este elemento agora, ou "".
export function elementLock(ctx, chosen, id, { ignorePredef = false } = {}) {
  const e = elementById(id);
  if (!e) return "Elemento desconhecido";
  if (chosen.some((v) => v.id === id)) return "";
  const c = circleLock(ctx, chosen, e.circuloId);
  if (c) return c;
  if (e.circuloId === "astral" && !astralAllowed(chosen, e.name)) return "Signo incompatível com os já escolhidos";
  const slots = predefinedSlots(ctx);
  const free = vinculoLimit(ctx) - slots.length;
  const pickedFree = chosen.filter((v) => !v.casa).length;
  if (!ignorePredef && slots.some((s) => !chosen.some((v) => v.casa === s.casa))) return "Escolha primeiro o Vínculo da C.A.S.A.";
  if (free <= 0) return "Sem vínculos livres para esta Origem";
  if (pickedFree >= free && free > 1) return "Limite atingido: desmarque um vínculo";
  return "";
}

// Escolher/desmarcar um elemento livre. Com 1 vaga livre, a nova escolha substitui a anterior.
export function toggleElement(ctx, chosen, id) {
  if (chosen.some((v) => v.id === id && !v.casa)) return chosen.filter((v) => v.id !== id);
  if (chosen.some((v) => v.id === id)) return chosen; // já é o vínculo da C.A.S.A.
  if (elementLock(ctx, chosen, id)) return chosen;
  const free = vinculoLimit(ctx) - predefinedSlots(ctx).length;
  const base = free === 1 ? chosen.filter((v) => v.casa) : chosen;
  return [...base, { id }];
}

// Escolher o vínculo de uma C.A.S.A. (troca o anterior dessa mesma C.A.S.A.).
export function choosePredefined(chosen, casa, name) {
  const id = `terreno:${name}`;
  return [...chosen.filter((v) => v.casa !== casa && v.id !== id), { id, casa }];
}

// Remove o que deixou de ser permitido (ex.: o jogador voltou e trocou de Origem/Raça/Classe/C.A.S.A.).
export function sanitizeVinculos(ctx, chosen) {
  const slots = predefinedSlots(ctx);
  const out = chosen.filter((v) => (v.casa ? slots.some((s) => s.casa === v.casa && s.options.some((o) => `terreno:${o}` === v.id)) : true));
  const kept = out.filter((v) => v.casa);
  for (const v of out.filter((x) => !x.casa)) {
    if (!elementLock(ctx, kept, v.id, { ignorePredef: true })) kept.push(v);
  }
  return kept;
}

export const vinculosComplete = (ctx, chosen) => {
  const limit = vinculoLimit(ctx);
  return limit > 0 && chosen.length === limit && predefinedSlots(ctx).every((s) => chosen.some((v) => v.casa === s.casa));
};
