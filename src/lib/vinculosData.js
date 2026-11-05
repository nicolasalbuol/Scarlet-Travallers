// Estrutura em cascata para a etapa Vínculos: Plano → Círculo → Elemento.
// Conteúdo padrão — ajuste conforme a definição oficial do RPG.

export const VINCULOS_PLANOS = [
  {
    name: "Plano Material",
    description: "Vínculos com forças primais do mundo físico e da natureza.",
    circulos: [
      {
        name: "Círculo Elemental",
        description: "Conexão direta com os elementos da natureza.",
        elementos: [
          {
            name: "Fogo",
            description: "Vínculo flamejante que concede poder sobre o calor e a destruição.",
            access: ["Afinidade com fogo", "Magias de chama"],
            bonuses: ["+1d4 dano de fogo", "Resistência a fogo"],
          },
          {
            name: "Água",
            description: "Vínculo aquático que concede poder sobre os oceanos e a cura.",
            access: ["Afinidade com água", "Magias de cura"],
            bonuses: ["+1 PS por nível", "Resistência a água"],
          },
          {
            name: "Terra",
            description: "Vínculo telúrico que concede resistência e estabilidade.",
            access: ["Afinidade com terra", "Magias de proteção"],
            bonuses: ["+1 CON", "Defesa aumentada"],
          },
          {
            name: "Vento",
            description: "Vínculo aéreo que concede velocidade e controle dos ventos.",
            access: ["Afinidade com ar", "Magias de vento"],
            bonuses: ["+1 DES", "Velocidade aumentada"],
          },
        ],
      },
      {
        name: "Círculo Vital",
        description: "Conexão com a energia vital e as forças opostas da vida.",
        elementos: [
          {
            name: "Luz",
            description: "Vínculo luminoso que concede poder de cura e proteção divina.",
            access: ["Afinidade com luz", "Magias de luz"],
            bonuses: ["+1 em cura", "Resistência a trevas"],
          },
          {
            name: "Sombras",
            description: "Vínculo obscuro que concede furtividade e poder sobre a escuridão.",
            access: ["Afinidade com sombras", "Magias de escuridão"],
            bonuses: ["+1 em furtividade", "Visão no escuro"],
          },
        ],
      },
    ],
  },
  {
    name: "Plano Astral",
    description: "Vínculos com entidades além do véu material, entre ordem e caos.",
    circulos: [
      {
        name: "Círculo Luminoso",
        description: "Entidades de luz, ordem e estabilidade estruturada.",
        elementos: [
          {
            name: "Luz Astral",
            description: "Entidade luminosa que concede proteção e poder divino.",
            access: ["Magias de luz astral", "Energia estável"],
            bonuses: ["+1 em cura", "Resistência a trevas"],
          },
          {
            name: "Ordem",
            description: "Entidade ordenada que concede estabilidade e poder estruturado.",
            access: ["Magias de ordem", "Energia estável"],
            bonuses: ["+1 em defesa", "Resistência a caos"],
          },
        ],
      },
      {
        name: "Círculo Obscuro",
        description: "Entidades das sombras e do caos imprevisível.",
        elementos: [
          {
            name: "Sombras Astrais",
            description: "Entidade obscura que concede furtividade e poder sobre a escuridão.",
            access: ["Magias de sombra", "Energia instável"],
            bonuses: ["+1 em furtividade", "Visão no escuro"],
          },
          {
            name: "Caos",
            description: "Entidade caótica que concede poder imprevisível e mutável.",
            access: ["Magias caóticas", "Energia instável"],
            bonuses: ["+1d6 dano caótico", "Imunidade a confusão"],
          },
        ],
      },
    ],
  },
  {
    name: "Plano Mental",
    description: "Vínculos com poderes da mente e da consciência expandida.",
    circulos: [
      {
        name: "Círculo Psíquico",
        description: "Poderes mentais e cognitivos da consciência.",
        elementos: [
          {
            name: "Telepatia",
            description: "Capacidade de ler mentes e comunicar-se telepaticamente.",
            access: ["Leitura mental", "Comunicação telepática"],
            bonuses: ["Detecção de mentiras", "Bônus em Intuição"],
          },
          {
            name: "Telecinese",
            description: "Capacidade de mover e manipular objetos com a força da mente.",
            access: ["Manipulação de objetos", "Escudo telecinético"],
            bonuses: ["Ataques à distância", "Defesa mental"],
          },
        ],
      },
      {
        name: "Círculo Cinético",
        description: "Manipulação de energia física e movimento.",
        elementos: [
          {
            name: "Pirocinese",
            description: "Geração e controle de chamas, manipulando o fogo à vontade.",
            access: ["Controle de chamas", "Resistência ao calor"],
            bonuses: ["Dano de fogo em ataques", "Imunidade parcial a fogo"],
          },
          {
            name: "Criocinese",
            description: "Redução de temperaturas e manipulação do gelo.",
            access: ["Controle de gelo", "Resistência ao frio"],
            bonuses: ["Dano de gelo em ataques", "Imunidade parcial a frio"],
          },
          {
            name: "Eletrocinese",
            description: "Geração e controle de eletricidade, raios e descargas.",
            access: ["Descargas elétricas", "Controle de campos magnéticos"],
            bonuses: ["Dano elétrico em ataques", "Imunidade parcial a eletricidade"],
          },
        ],
      },
    ],
  },
];

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