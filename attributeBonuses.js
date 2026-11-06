// Livro: 7 pontos iniciais para todos + pontos da Origem (Ômega/Delta recebem o bônus pela C.A.S.A.)
export const BASE_POINTS = 7;
// Pontos extras de atributo por Origem
export const ORIGIN_FREE_POINTS = { Zeta: 1, Alpha: 3, Beta: 2, "Ômega": 0, Delta: 0 };

// Limite máximo de cada atributo DURANTE a montagem da ficha
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

// Total final de um atributo = bônus da C.A.S.A. + pontos do usuário
export function attributeTotal(casaBonus, points, key) {
  return (casaBonus?.[key] || 0) + (points?.[key] || 0);
}