export const BUILDER_STEPS = [
  { id: "origem", label: "Origem", description: "Ao escolher uma origem, você recebe bônus e acessos que definem o início da sua jornada pelo multiverso." },
  { id: "passado", label: "Passado", description: "Um Passado, também chamado de Antecedente, é a origem do seu personagem antes de vestir o distintivo da HUNTER. Cada Passado concede +2 em duas perícias." },
  { id: "raca", label: "Raça", description: "Escolha a raça do seu personagem. Cada raça oferece vantagens e desvantagens únicas." },
  { id: "classe", label: "Classe", description: "A classe define as habilidades e o estilo de combate do seu personagem." },
  { id: "casa", label: "C.A.S.A.", description: "C.A.S.A. (Capacidade Através do Sexto Atributo) é o poder que define sua conexão com o desconhecido." },
  { id: "vinculos", label: "Vínculos", description: "Vínculos são ligações com entidades do universo que concedem poder e responsabilidade." },
  { id: "atributos", label: "Atributos", description: "Distribua seus pontos entre os seis atributos que definem as capacidades do seu personagem." },
  { id: "toques", label: "Toques Finais", description: "Defina os detalhes finais do seu personagem antes de criar a ficha." },
];

export const ORIGIN_OPTIONS = [
  {
    name: "Zeta",
    description: "São pessoas que nasceram com C.A.S.A. (Capacidade Através do Sexto Atributo), um poder que ninguém de onde veio, mas que têm um vínculo com alguma entidade do universo. Cada persona ganha um item que ajuda a identificar sua C.A.S.A. (broche, faixa, colar, etc.)",
    access: [
      "A uma Classe",
      "A uma C.A.S.A.",
      "Começam com 14 moedas de bronze",
      "3 slots de inventário inicial"
    ],
    bonuses: [
      "+1 ponto bônus de Atributo",
      "+1d10 PS",
      "+1d6 PV",
      "+1d20 PE"
    ]
  },
  {
    name: "Alpha",
    description: "São pessoas que desenvolveram C.A.S.A. através de treinamento intenso e dedicação. Escolheram buscar o poder e o conquistaram com esforço próprio, sem depender de entidades externas.",
    access: [
      "A uma Classe",
      "A uma C.A.S.A.",
      "Começam com 10 moedas de bronze",
      "4 slots de inventário inicial"
    ],
    bonuses: [
      "+1 ponto bônus de Atributo",
      "+1d8 PS",
      "+1d8 PV",
      "+1d12 PE"
    ]
  },
  {
    name: "Ômega",
    description: "São pessoas com uma conexão natural com o multiverso, capazes de sentir fendas e anomalias dimensionais. Seu poder vem de uma sintonia profunda com o tecido da realidade.",
    access: [
      "A uma Classe",
      "A uma C.A.S.A.",
      "Começam com 12 moedas de bronze",
      "3 slots de inventário inicial"
    ],
    bonuses: [
      "+1 ponto bônus de Atributo",
      "+1d12 PS",
      "+1d4 PV",
      "+1d12 PE"
    ]
  },
  {
    name: "Delta",
    description: "São pessoas transformadas por um evento traumático envolvendo energia interdimensional. O incidente despertou seu C.A.S.A. de forma violenta e imprevisível.",
    access: [
      "A uma Classe",
      "A uma C.A.S.A.",
      "Começam com 8 moedas de bronze",
      "2 slots de inventário inicial"
    ],
    bonuses: [
      "+2 pontos bônus de Atributo",
      "+1d6 PS",
      "+1d10 PV",
      "+1d6 PE"
    ]
  },
  {
    name: "Beta",
    description: "São pessoas que vieram de outra dimensão e chegaram a este mundo através de uma fenda. Carregam consigo conhecimentos e poderes de sua realidade de origem.",
    access: [
      "A uma Classe",
      "A uma C.A.S.A.",
      "Começam com 16 moedas de bronze",
      "3 slots de inventário inicial"
    ],
    bonuses: [
      "+1 ponto bônus de Atributo",
      "+1d6 PS",
      "+1d6 PV",
      "+1d20 PE"
    ]
  }
];

export const RACE_OPTIONS = [
  {
    name: "Humano",
    description: "Versáteis e adaptáveis, os humanos se destacam em qualquer área que escolherem seguir.",
    access: ["Versatilidade em perícias", "Adaptabilidade cultural"],
    bonuses: ["+1 em todos os atributos", "+1 perícia treinada extra"],
    vantagem: "Versatilidade: +1 em todos os atributos e 1 perícia treinada extra.",
    desvantagem: "Vida breve: -2 no PV máximo total."
  },
  {
    name: "Elfo",
    description: "Graciosos e longevos, os elfos possuem uma afinidade natural com magia e a natureza.",
    access: ["Visão noturna", "Afinidade mágica"],
    bonuses: ["+2 DES", "+1 INT", "Resistência a encantamentos"],
    vantagem: "Afinidade mágica: +2 DES, +1 INT e resistência a encantamentos.",
    desvantagem: "Frágil: -1 CON e vulnerabilidade a dano físico contundente."
  },
  {
    name: "Anão",
    description: "Resistentes e habilidosos, os anões são mestres da forja e da construção.",
    access: ["Visão no escuro", "Conhecimento de construção"],
    bonuses: ["+2 CON", "+1 FOR", "Resistência a venenos"],
    vantagem: "Resistência: +2 CON, +1 FOR e resistência a venenos.",
    desvantagem: "Lento: -1 DES e deslocamento reduzido em 1,5m."
  },
  {
    name: "Meio-Elfo",
    description: "Ponte entre dois mundos, os meio-elfos combinam a adaptabilidade humana com a graça élfica.",
    access: ["Visão noturna parcial", "Diplomacia natural"],
    bonuses: ["+1 em dois atributos à escolha", "+1 perícia treinada extra"],
    vantagem: "Diplomacia natural: +1 em dois atributos à escolha e 1 perícia extra.",
    desvantagem: "Sem pertencimento: -1 em testes de Intuição com elfos e humanos."
  },
  {
    name: "Halfling",
    description: "Pequenos e sortudos, os halflings possuem uma agilidade e sorte surpreendentes.",
    access: ["Furtividade natural", "Sorte inata"],
    bonuses: ["+2 DES", "+1 SAB", "Vantagem contra medo"],
    vantagem: "Sorte inata: +2 DES, +1 SAB e vantagem contra medo.",
    desvantagem: "Pequeno: -1 FOR e alcance de ataque corpo-a-corpo reduzido."
  },
  {
    name: "Draconato",
    description: "Sangue de dragão corre em suas veias, concedendo resistências e sopro elemental.",
    access: ["Sopro elemental", "Resistência elemental"],
    bonuses: ["+2 FOR", "+1 CAR", "Resistência a um tipo de dano"],
    vantagem: "Sangue dracônico: +2 FOR, +1 CAR, sopro elemental e resistência elemental.",
    desvantagem: "Arrogância: -1 em testes de Persuasão com outras raças."
  }
];

// Skills (Passivas + Habilidades) disponíveis por Classe, usadas no pop-up
// "Escolher Skill" exibido ao avançar da etapa de Classe.
export const CLASS_SKILLS = {
  "Guerreiro": {
    passivas: [
      { name: "Luta", description: "Proficiência com armas corpo a corpo." },
      { name: "Atletismo", description: "Saltar, escalar e nadar com maestria." },
      { name: "Fortitude", description: "Resistência física afeiçoada ao combate." },
      { name: "Intimidação", description: "Imposição marcial sobre inimigos." },
      { name: "Reflexos", description: "Reação rápida contra ataques." }
    ],
    habilidades: [
      { name: "Investida Brutal", cost: 2, ed: "FOR vs CA", damage: "1d8+FOR", description: "Avança e golpeia com força total." },
      { name: "Bloqueio", cost: 1, ed: "—", damage: "—", description: "Reduz o dano do próximo ataque." },
      { name: "Fúria", cost: 3, ed: "—", damage: "—", description: "Ganha +2 em FOR por 3 turnos." },
      { name: "Golpe Defensivo", cost: 2, ed: "FOR vs CA", damage: "1d6+FOR", description: "Ataca e ganha +1 na CA até o próximo turno." }
    ]
  },
  "Arqueiro": {
    passivas: [
      { name: "Pontaria", description: "Mira precisa com arcos e bestas." },
      { name: "Furtividade", description: "Movimento silencioso em terreno." },
      { name: "Reflexos", description: "Esquiva rápida contra perigos." },
      { name: "Percepção", description: "Detecção de alvos à distância." },
      { name: "Acrobacia", description: "Manobras ágeis de posicionamento." }
    ],
    habilidades: [
      { name: "Tiro Certeiro", cost: 2, ed: "DES vs CA", damage: "1d10+DES", description: "Disparo de longo alcance devastador." },
      { name: "Disparo Múltiplo", cost: 3, ed: "DES vs CA", damage: "1d8+DES", description: "Atinge até 2 alvos no mesmo turno." },
      { name: "Olho de Águia", cost: 1, ed: "—", damage: "—", description: "+2 em Pontaria por 1 turno." },
      { name: "Flecha Venenosa", cost: 2, ed: "DES vs CA", damage: "1d6+DES+veneno", description: "Dano extra contínuo por veneno." }
    ]
  },
  "Mago": {
    passivas: [
      { name: "Feitiçaria", description: "Conjuração arcana de magias." },
      { name: "Astúcia", description: "Raciocínio mágico aplicado." },
      { name: "Investigação", description: "Análise de fenômenos arcanos." },
      { name: "História", description: "Conhecimento de tradições mágicas." },
      { name: "Ocultismo", description: "Compreensão de forças ocultas." }
    ],
    habilidades: [
      { name: "Míssil Mágico", cost: 2, ed: "—", damage: "1d4+INT", description: "Dardos de força arcana infalíveis." },
      { name: "Escudo Arcano", cost: 1, ed: "—", damage: "—", description: "+2 na CA mágica por 1 turno." },
      { name: "Bola de Fogo", cost: 4, ed: "INT vs Reflexos", damage: "3d6 fogo", description: "Explosão flamejante em área." },
      { name: "Levitar", cost: 2, ed: "—", damage: "—", description: "Flutua livremente por 1 minuto." }
    ]
  },
  "Clérigo": {
    passivas: [
      { name: "Religião", description: "Conhecimento de dogmas e ritos." },
      { name: "Medicina", description: "Cura e diagnóstico de ferimentos." },
      { name: "Vontade", description: "Firmeza mental contra o mal." },
      { name: "Intuição", description: "Percepção das necessidades alheias." },
      { name: "Persuasão", description: "Discurso inspirador da fé." }
    ],
    habilidades: [
      { name: "Cura Divina", cost: 2, ed: "—", damage: "—", description: "Cura 2d8+CAR de um aliado." },
      { name: "Bênção", cost: 1, ed: "—", damage: "—", description: "+1 em testes de aliados próximos por 1 turno." },
      { name: "Luz Sagrada", cost: 2, ed: "CAR vs Fortitude", damage: "1d8 luz", description: "Dano radiante a um alvo." },
      { name: "Proteção", cost: 3, ed: "—", damage: "—", description: "Escudo que absorve 10 de dano." }
    ]
  },
  "Ladino": {
    passivas: [
      { name: "Furtividade", description: "Movimento imperceptível nas sombras." },
      { name: "Acrobacia", description: "Manobras evasivas ágeis." },
      { name: "Enganação", description: "Trapaça e dissimulação." },
      { name: "Presdigitação", description: "Mãos rápidas e leves." },
      { name: "Reflexos", description: "Reação instantânea ao perigo." }
    ],
    habilidades: [
      { name: "Ataque Furtivo", cost: 2, ed: "DES vs CA", damage: "1d6+DES+2d6", description: "Dano extra quando furtivo." },
      { name: "Evasão", cost: 1, ed: "—", damage: "—", description: "Reduz dano de área à metade." },
      { name: "Golpe Baixo", cost: 2, ed: "DES vs CA", damage: "1d4+DES", description: "Atordoa o alvo por 1 turno." },
      { name: "Fuga Ágil", cost: 1, ed: "—", damage: "—", description: "Desengaja e move-se livremente." }
    ]
  },
  "Bardo": {
    passivas: [
      { name: "Performance", description: "Arte que encanta plateias." },
      { name: "Persuasão", description: "Convicção pelo carisma." },
      { name: "Intuição", description: "Leitura emocional do público." },
      { name: "História", description: "Repertório de lendas e contos." },
      { name: "Enganação", description: "Ilusão pela palavra e arte." }
    ],
    habilidades: [
      { name: "Inspirar", cost: 1, ed: "—", damage: "—", description: "Aliado ganha +1d6 em um teste." },
      { name: "Canção Curativa", cost: 2, ed: "—", damage: "—", description: "Cura 1d8+CAR de aliados próximos." },
      { name: "Palavra Agressiva", cost: 2, ed: "CAR vs Vontade", damage: "1d6+CAR", description: "Dano psíquico com insulto ácido." },
      { name: "Disfarce", cost: 1, ed: "—", damage: "—", description: "Ilusão visual por 1 hora." }
    ]
  },
  "Paladino": {
    passivas: [
      { name: "Luta", description: "Combate marcial sagrado." },
      { name: "Religião", description: "Devoção ao juramento." },
      { name: "Intimidação", description: "Imposição da vontade divina." },
      { name: "Fortitude", description: "Resistência do escolhido." },
      { name: "Persuasão", description: "Voz do juramento." }
    ],
    habilidades: [
      { name: "Golpe Divino", cost: 2, ed: "FOR vs CA", damage: "1d8+FOR+1d8 luz", description: "Canaliza luz no ataque." },
      { name: "Imposição de Mãos", cost: 2, ed: "—", damage: "—", description: "Cura 2d4+CAR pelo toque." },
      { name: "Aura de Proteção", cost: 3, ed: "—", damage: "—", description: "+1 na CA a aliados em 3m." },
      { name: "Juramento", cost: 2, ed: "—", damage: "—", description: "+2 de dano contra inimigos marcados." }
    ]
  },
  "Invocador": {
    passivas: [
      { name: "Ocultismo", description: "Pactos e entidades de além." },
      { name: "Feitiçaria", description: "Ritualística de invocação." },
      { name: "Vontade", description: "Domínio mental sobre invocações." },
      { name: "Intuição", description: "Sensibilidade a presenças." },
      { name: "Astúcia", description: "Negociação de contratos." }
    ],
    habilidades: [
      { name: "Invocar Familiar", cost: 2, ed: "—", damage: "—", description: "Chama uma criatura menor auxiliar." },
      { name: "Invocar Guardião", cost: 4, ed: "—", damage: "—", description: "Chama um guardião de combate." },
      { name: "Vínculo Vital", cost: 1, ed: "—", damage: "—", description: "Compartilha dano com a invocação." },
      { name: "Selar Contrato", cost: 3, ed: "—", damage: "—", description: "Invocação ganha +2 em FOR por 3 turnos." }
    ]
  }
};

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

export const CLASS_OPTIONS = [
  {
    name: "Guerreiro",
    description: "Especialista em combate marcial, o guerreiro domina armas e armaduras com maestria.",
    access: ["Proficiência com todas as armas", "Uso de armaduras pesadas"],
    bonuses: ["+1d10 PV por nível", "Técnicas de combate"]
  },
  {
    name: "Arqueiro",
    description: "Especialista em combate à distância, o arqueiro precisa e letal com arcos e bestas.",
    access: ["Proficiência com arcos", "Tiro de precisão"],
    bonuses: ["+1d8 PV por nível", "Bônus de precisão"]
  },
  {
    name: "Mago",
    description: "Conjurador arcano que manipula as energias do universo para lançar magias poderosas.",
    access: ["Grimório de magias", "Conjuração arcana"],
    bonuses: ["+1d6 PV por nível", "+2 PE por nível"]
  },
  {
    name: "Clérigo",
    description: "Curandeiro divino que canaliza a energia de sua fé para proteger e curar aliados.",
    access: ["Magias de cura", "Proteção divina"],
    bonuses: ["+1d8 PV por nível", "+1 PS por nível"]
  },
  {
    name: "Ladino",
    description: "Mestre da furtividade e astúcia, o ladino ataca onde o inimigo é mais vulnerável.",
    access: ["Ataque furtivo", "Evasão aprimorada"],
    bonuses: ["+1d8 PV por nível", "Bônus de furtividade"]
  },
  {
    name: "Bardo",
    description: "Suporte e inspiração, o bardo usa música e arte para fortalecer seus aliados.",
    access: ["Magias de suporte", "Inspirar aliados"],
    bonuses: ["+1d8 PV por nível", "Bônus de carisma"]
  },
  {
    name: "Paladino",
    description: "Guerreiro sagrado que combina força marcial com poder divino em prol de um juramento.",
    access: ["Combate marcial", "Magias divinas"],
    bonuses: ["+1d10 PV por nível", "Bônus de defesa"]
  },
  {
    name: "Invocador",
    description: "Mestre das invocações, capaz de chamar criaturas de outros planos para lutar ao seu lado.",
    access: ["Invocação de criaturas", "Controle de invocações"],
    bonuses: ["+1d6 PV por nível", "+2 PE por nível"]
  }
];

export const CASA_OPTIONS = [
  {
    name: "Pirocinese",
    description: "Capacidade de gerar e controlar chamas, manipulando o fogo à vontade.",
    access: ["Controle de chamas", "Resistência ao calor"],
    bonuses: ["Dano de fogo em ataques", "Imunidade parcial a fogo"]
  },
  {
    name: "Criocinese",
    description: "Capacidade de reduzir temperaturas e manipular o gelo, congelando o ambiente ao redor.",
    access: ["Controle de gelo", "Resistência ao frio"],
    bonuses: ["Dano de gelo em ataques", "Imunidade parcial a frio"]
  },
  {
    name: "Telecinese",
    description: "Capacidade de mover e manipular objetos com a força da mente.",
    access: ["Manipulação de objetos", "Escudo telecinético"],
    bonuses: ["Ataques à distância", "Defesa mental"]
  },
  {
    name: "Telepatia",
    description: "Capacidade de ler mentes e comunicar-se telepaticamente com outros seres.",
    access: ["Leitura mental", "Comunicação telepática"],
    bonuses: ["Detecção de mentiras", "Bônus em Intuição"]
  },
  {
    name: "Biocinese",
    description: "Capacidade de manipular a energia vital, curando ou drenando a vida de outros.",
    access: ["Cura acelerada", "Drenagem vital"],
    bonuses: ["Regeneração passiva", "Dano por toque"]
  },
  {
    name: "Eletrocinese",
    description: "Capacidade de gerar e controlar eletricidade, manipulando raios e descargas.",
    access: ["Descargas elétricas", "Controle de campos magnéticos"],
    bonuses: ["Dano elétrico em ataques", "Imunidade parcial a eletricidade"]
  }
];

export const BOND_OPTIONS = [
  {
    name: "Entidade do Fogo",
    description: "Vínculo com uma entidade flamejante que concede poder sobre o calor e a destruição.",
    access: ["Afinidade com fogo", "Magias de chama"],
    bonuses: ["+1d4 dano de fogo", "Resistência a fogo"]
  },
  {
    name: "Entidade da Água",
    description: "Vínculo com uma entidade aquática que concede poder sobre os oceanos e a cura.",
    access: ["Afinidade com água", "Magias de cura"],
    bonuses: ["+1 PS por nível", "Resistência a água"]
  },
  {
    name: "Entidade do Vento",
    description: "Vínculo com uma entidade aérea que concede velocidade e controle dos ventos.",
    access: ["Afinidade com ar", "Magias de vento"],
    bonuses: ["+1 DES", "Velocidade aumentada"]
  },
  {
    name: "Entidade da Terra",
    description: "Vínculo com uma entidade telúrica que concede resistência e estabilidade.",
    access: ["Afinidade com terra", "Magias de proteção"],
    bonuses: ["+1 CON", "Defesa aumentada"]
  },
  {
    name: "Entidade das Sombras",
    description: "Vínculo com uma entidade obscura que concede furtividade e poder sobre a escuridão.",
    access: ["Afinidade com sombras", "Magias de escuridão"],
    bonuses: ["+1 em furtividade", "Visão no escuro"]
  },
  {
    name: "Entidade da Luz",
    description: "Vínculo com uma entidade luminosa que concede poder de cura e proteção divina.",
    access: ["Afinidade com luz", "Magias de luz"],
    bonuses: ["+1 em cura", "Resistência a trevas"]
  },
  {
    name: "Entidade do Caos",
    description: "Vínculo com uma entidade caótica que concede poder imprevisível e mutável.",
    access: ["Magias caóticas", "Energia instável"],
    bonuses: ["+1d6 dano caótico", "Imunidade a confusão"]
  },
  {
    name: "Entidade da Ordem",
    description: "Vínculo com uma entidade ordenada que concede estabilidade e poder estruturado.",
    access: ["Magias de ordem", "Energia estável"],
    bonuses: ["+1 em defesa", "Resistência a caos"]
  }
];

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

export const BASE_ATTRIBUTE_POINTS = 12;
export const ORIGIN_ATTRIBUTE_BONUS = { Zeta: 1, Alpha: 1, "Ômega": 1, Delta: 2, Beta: 1 };