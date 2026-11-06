// Conteúdo do livro (origens, raças, classes, skills, C.A.S.A.)
import { ORIGIN_OPTIONS, RACE_OPTIONS, CLASS_OPTIONS, CLASS_SKILLS, CASA_OPTIONS } from "./bookData";
export { ORIGIN_OPTIONS, RACE_OPTIONS, CLASS_OPTIONS, CLASS_SKILLS, CASA_OPTIONS };
// A etapa Vínculos usa a cascata Plano → Círculo → Elemento (vinculosData.js).
export const BOND_OPTIONS = [];

export const BUILDER_STEPS = [
  { id: "origem", label: "Origem", description: "A origem define se ele tem conexão com a C.A.S.A. Existem cinco tipos: Zeta, um ser sem poder; Alpha, que concede duas classes; Ômega, que oferece uma classe e um poder; Delta, que garante dois poderes; e Beta, que traz um poder corrompido." },
  { id: "passado", label: "Passado", description: "O passado define de onde vêm suas forças e o que molda seu papel no jogo. Principalmente os antecedentes antes de entrar na HUNTER ou em alguma Facção. Cada Passado concede +2 em duas perícias." },
  { id: "raca", label: "Raça", description: "A escolha da raça dá ao personagem vantagens e desvantagens únicas. Ela influencia tanto os atributos físicos quanto a forma como ele interage com o mundo. Híbridos possuem duas raças: recebem a Vantagem de uma e a Desvantagem da outra." },
  { id: "classe", label: "Classe", description: "Ao escolher sua classe, você também seleciona algumas Skills de Classe, que oferecem habilidades que diferenciam ainda mais personagens da mesma categoria." },
  { id: "casa", label: "C.A.S.A.", description: "C.A.S.A. (Capacidade Através do Sexto Atributo) é a base do poder de alguns personagens. Ela representa como ele acessa, canaliza e manifesta forças sobrenaturais, e dá bônus de atributo dependendo do tipo." },
  { id: "vinculos", label: "Vínculos", description: "Dentro desse mundo existem 3 planos: Plano Material, Plano Imaginário e Outro Lado. Escolha o círculo e o elemento do seu vínculo." },
  { id: "atributos", label: "Atributos", description: "Você recebe 7 pontos iniciais para distribuir entre os atributos (mín. 0, máx. 3), mais os pontos da sua Origem ou C.A.S.A." },
  { id: "pericias", label: "Perícias", description: "No início, você pode escolher 6 perícias. Além disso, recebe um número extra de perícias igual ao valor de Inteligência ou Sabedoria (você escolhe qual). Cada perícia começa com treino +5 em testes." },
  { id: "toques", label: "Toques Finais", description: "Defina os detalhes finais do seu personagem antes de criar a ficha." },
];





// Skills (Passivas + Habilidades) disponíveis por Classe, usadas no pop-up
// "Escolher Skill" exibido ao avançar da etapa de Classe.


// Quantidade de Skills que cada Origem exige no pop-up de Classe.
export const ORIGIN_SKILL_COUNT = { Zeta: 2, Alpha: 2, "Ômega": 2, Delta: 2, Beta: 1 };

// Garante que cada opção de raça tenha vantagem/desvantagem, mesclando com os
// defaults hardcoded quando o conteúdo dinâmico (BuilderContent) não os trouxer.
export function mergeRaceVantagens(options) {
  return (options || []).map((opt) => {
    const def = RACE_OPTIONS.find((r) => r.name === opt.name);
    return {
      ...opt,
      vantagem: opt.vantagem ?? def?.vantagem ?? "",
      desvantagem: opt.desvantagem ?? def?.desvantagem ?? "",
    };
  });
}







export const ATTRIBUTE_NAMES = {
  FOR: "Força",
  DES: "Destreza",
  CON: "Constituição",
  INT: "Inteligência",
  SAB: "Sabedoria",
  CAR: "Carisma",
};

export const ATTRIBUTE_ORDER = ["FOR", "DES", "CON", "INT", "SAB", "CAR"];

export const ALIGNMENT_GRID = {
  rows: ["Caótico", "Neutro", "Leal"],
  cols: ["Mau", "Neutro", "Bom"],
};

export const BASE_ATTRIBUTE_POINTS = 7; // livro: 7 pontos iniciais (mín. 0, máx. 3)
export const ORIGIN_ATTRIBUTE_BONUS = { Zeta: 1, Alpha: 1, "Ômega": 1, Delta: 2, Beta: 1 };