// Planos, círculos e elementos do capítulo "Círculos Elementais" do livro.
import { VINCULOS_PLANOS } from "./bookData";
export { VINCULOS_PLANOS };



// Resolve a cascata a partir das três seleções
export function resolveVinculo(planoName, circuloName, elementoName) {
  const plano = VINCULOS_PLANOS.find((p) => p.name === planoName);
  if (!plano) return null;
  const circulo = plano.circulos.find((c) => c.name === circuloName);
  if (!circulo) return null;
  const elemento = circulo.elementos.find((e) => e.name === elementoName);
  if (!elemento) return null;
  return { plano, circulo, elemento };
}