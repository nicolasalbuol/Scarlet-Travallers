// Livro: 7 pontos iniciais para todos + pontos da Origem (Ômega/Delta recebem o bônus pela C.A.S.A.)
export const BASE_POINTS = 7;
// Pontos extras de atributo por Origem
export const ORIGIN_FREE_POINTS = { Zeta: 1, Alpha: 3, Beta: 2, "Ômega": 0, Delta: 0 };

// Todo atributo começa em 1 (regra da mesa).
export const BASE_ATTRIBUTE = 1;
// Máximo da base (1 + pontos distribuídos). O bônus da C.A.S.A. soma por cima e pode passar disso.
export const ATTRIBUTE_MAX = 3;

const ATTR_KEYS = ["FOR", "DES", "CON", "INT", "SAB", "CAR"];

export function emptyPoints() {
  return { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 };
}

// Soma os pontos distribuídos pelo usuário
export function sumPoints(points) {
  return ATTR_KEYS.reduce((s, k) => s + (points?.[k] || 0), 0);
}

// Total de pontos livres disponíveis para distribuir
export function availablePointsFor(origin, points) {
  const total = BASE_POINTS + (ORIGIN_FREE_POINTS[origin] || 0);
  return total - sumPoints(points);
}

// Base de um atributo = 1 + pontos do usuário (limitada a ATTRIBUTE_MAX)
export function baseValue(points, key) {
  return BASE_ATTRIBUTE + (points?.[key] || 0);
}

// Total final de um atributo = base + bônus da C.A.S.A.
export function attributeTotal(casaBonus, points, key) {
  return baseValue(points, key) + (casaBonus?.[key] || 0);
}