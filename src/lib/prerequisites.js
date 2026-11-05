// Sistema de pré-requisitos dos itens da Construção de Ficha.
// Armazenado em cada item (BuilderContent.options / Passado) como:
//   prerequisites: [{ type, value, min?, mode }]
//   prerequisiteRule: "all" | "any"

export const PREREQ_TYPE_OPTIONS = [
  { value: "origem", label: "Origem" },
  { value: "passado", label: "Passado" },
  { value: "raca", label: "Raça" },
  { value: "classe", label: "Classe" },
  { value: "casa", label: "C.A.S.A." },
  { value: "vinculo", label: "Vínculo / Elemento" },
  { value: "skill", label: "Skill" },
  { value: "atributo", label: "Atributo mínimo" },
  { value: "pericia", label: "Perícia mínima" },
];

export const PREREQ_MODE_OPTIONS = [
  { value: "require", label: "Exigir" },
  { value: "block", label: "Bloquear" },
];

const TYPE_LABEL = PREREQ_TYPE_OPTIONS.reduce((acc, t) => {
  acc[t.value] = t.label;
  return acc;
}, {});

const norm = (s) => String(s ?? "").trim().toLowerCase();

/** Monta o estado da ficha usado para avaliar pré-requisitos. */
export function buildPrereqState(character) {
  const c = character || {};
  return {
    origem: [c.origin].filter(Boolean),
    passado: [c.passado].filter(Boolean),
    raca: [c.race, c.race_2].filter(Boolean),
    classe: [c.char_class, c.char_class_2].filter(Boolean),
    casa: [c.casa, c.casa_2].filter(Boolean),
    vinculo: [c.bond_circulo, c.bond_elemento].filter(Boolean),
    skill: [...(c.classSkills || []), ...(c.classSkills_2 || [])].map((s) => s.name),
    atributo: c.attributes || {},
    pericia: c.skills || [],
  };
}

function checkOne(p, state) {
  const value = p?.value;
  switch (p?.type) {
    case "origem":
    case "passado":
    case "raca":
    case "classe":
    case "casa":
    case "vinculo":
    case "skill":
      return (state[p.type] || []).some((x) => norm(x) === norm(value));
    case "atributo":
      return Number((state.atributo || {})[value] || 0) >= Number(p.min ?? 1);
    case "pericia":
      return (state.pericia || []).some(
        (s) => norm(s.name) === norm(value) && Number(s.training || 0) + Number(s.bonus || 0) >= Number(p.min ?? 1)
      );
    default:
      return false;
  }
}

export function describePrereq(p) {
  const label = TYPE_LABEL[p?.type] || p?.type || "";
  if (p?.type === "atributo" || p?.type === "pericia") {
    return `${label}: ${p.value} ≥ ${p.min ?? 1}`;
  }
  return p?.mode === "block" ? `Não ${label} ${p.value}` : `${label} ${p.value}`;
}

/**
 * Avalia se um item está liberado.
 * Retorna { locked, missing: [rótulos do que falta] }.
 */
export function evaluatePrerequisites(item, state) {
  const prereqs = item?.prerequisites || [];
  if (!prereqs.length) return { locked: false, missing: [] };

  const rule = item?.prerequisiteRule === "any" ? "any" : "all";
  const checks = prereqs.map((p) => {
    const ok = checkOne(p, state || {});
    return { p, passes: p.mode === "block" ? !ok : ok };
  });

  if (rule === "any") {
    const locked = !checks.some((c) => c.passes);
    return { locked, missing: locked ? prereqs.map(describePrereq) : [] };
  }

  const failing = checks.filter((c) => !c.passes);
  return { locked: failing.length > 0, missing: failing.map((c) => describePrereq(c.p)) };
}