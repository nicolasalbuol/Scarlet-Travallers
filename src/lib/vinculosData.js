// Vínculos (elementos mágicos): 3 Planos → Círculos → Elementos. Textos do livro (revisados pelo autor).
const el = (name, description) => ({ name, description });

export const VINCULOS_PLANOS = [
  {
    id: "material",
    name: "Plano Material",
    description:
      "Os Elementos do Plano Material são forças naturais presentes no próprio mundo físico, manifestadas através da matéria, da natureza e da energia que sustenta a realidade. Diferente dos outros círculos elementais, eles não só dependem de entidades, armas vivas ou vínculos espirituais, eles também têm uma conexão direta com o ambiente e as leis naturais do mundo. Seus usuários manipulam elementos puros e estáveis, utilizando o poder bruto da própria criação material em combate e técnicas cotidianas.",
    circulos: [
      {
        id: "celeste",
        name: "Círculo Celeste",
        description:
          "Os Elementos Celestes são forças primordiais ligadas aos Bubukis, armas vivas forjadas pelo Grande Pilar conhecido como O Ferreiro. Cada elemento representa um fragmento do cosmos e influencia a personalidade, o poder e a vontade da arma, criando estilos de combate únicos. Diferente de armas comuns, os Bubukis possuem consciência própria e escolhem seus portadores, formando vínculos que podem variar entre harmonia absoluta e conflitos destrutivos.",
        elementos: [
          el("Pyrus — As Chamas Vivas", "O elemento do fogo intenso, das emoções ardentes e da destruição absoluta. Bubukis de Pyrus nasceram diretamente das chamas da Grande Forja. Seu poder cresce conforme os sentimentos de seu portador se intensificam; raiva, determinação, amor ou ódio alimentam suas labaredas vivas. São armas violentas, explosivas e dominadoras, capazes de consumir tudo ao redor quando libertam todo seu potencial. Dizem que um Bubuki de Pyrus jamais aceita um coração vazio."),
          el("Ventus — Os Ventos Eternos", "O elemento da velocidade, liberdade e serenidade. Os Bubukis de Ventus possuem movimentos leves e quase dançantes. Seus ataques são rápidos, precisos e difíceis de prever, permitindo que seus usuários lutem com extrema mobilidade e fluidez. Embora raramente sejam os mais destrutivos, compensam isso com agilidade sobrenatural e versatilidade em combate. Muitos descrevem o som de um Bubuki de Ventus como o sussurro de uma tempestade distante."),
          el("Aquos — As Marés Oscilantes", "O elemento das águas profundas e das emoções instáveis. Assim como o oceano, os Bubukis de Aquos são imprevisíveis. Em um momento podem agir com calma absoluta; no outro, explodir com violência devastadora. Seus poderes oscilam constantemente, alternando entre defesa, suporte e destruição esmagadora. Portadores de Aquos costumam dizer que controlar essas armas é como tentar dominar uma onda gigante: impossível… apenas acompanhá-la."),
          el("Darkus — A Escuridão Eterna", "O elemento do rancor, da força selvagem e da vontade indomável. Os Bubukis de Darkus são temidos até mesmo entre os bubukianos. Carregam personalidades agressivas, orgulhosas e extremamente difíceis de controlar. Muitos recusam obedecer seus próprios usuários, entrando em conflito constante com aqueles considerados fracos ou indignos. Seu poder nasce da dor, da raiva e dos sentimentos mais obscuros do coração. Há rumores de que alguns Bubukis de Darkus já consumiram completamente a mente de seus portadores."),
          el("Haos — A Luz Divina", "O elemento da graça, técnica e perfeição espiritual. Bubukis de Haos são refinados, elegantes e extremamente precisos. Seus golpes carregam harmonia e controle absoluto, favorecendo usuários disciplinados e estrategistas. Diferente da brutalidade de outros elementos, Haos valoriza técnica acima de força. São armas vistas quase como relíquias sagradas, envoltas por brilho celestial e uma presença tranquilizadora. Dizem que um Bubuki de Haos jamais desperdiça um golpe."),
          el("Sub-Terra — A Terra Sagrada", "O elemento da resistência, estabilidade e força colossal. Os Bubukis de Sub-Terra possuem estruturas robustas e quase indestrutíveis. São armas pesadas, firmes e feitas para suportar impactos absurdos sem ceder. Seus usuários normalmente lutam como muralhas vivas, resistindo até mesmo aos ataques mais violentos. Entre todos os elementos, Sub-Terra é considerado o mais resiliente. Quando um Bubuki desse elemento finca sua força no solo, poucos conseguem movê-lo."),
        ],
      },
      {
        id: "terreno",
        name: "Círculo Terreno",
        description:
          "Os Elementos Terrenos são técnicas elementais desenvolvidas através do corpo, da energia e da afinidade natural de cada indivíduo. Diferente dos outros círculos, eles são mais livres e versáteis, permitindo inúmeras variações de habilidades dentro de sete grandes categorias: Lumus, Arius, Hydro, Sombrius, Pyro, Terrus e Neutro. Cada categoria reúne elementos com propriedades semelhantes, moldando estilos de combate, poderes e técnicas únicas.",
        categorias: [
          {
            name: "Lumus",
            hint: "vínculo com luz",
            elementos: [
              el("Estrela", "Fonte de luz pura e distante, guia e poder celestial."),
              el("Cósmico", "Relacionado ao universo, energia das galáxias e espaço infinito."),
              el("Energia", "Força vital ou mágica pura, canalizada para múltiplos efeitos."),
              el("Espelho", "Reflete a luz e o mundo, usado para ilusão, defesa ou distorção."),
              el("Lunar", "Energia suave da lua, associada a magia, calma e influência sutil."),
              el("Criação", "O poder de gerar, manifestar e dar forma à vida ou objetos."),
            ],
          },
          {
            name: "Arius",
            hint: "vínculo com vento",
            elementos: [
              el("Agilidade", "Rapidez de movimento, leveza e reflexos que cortam o ar."),
              el("Nuvens", "Vapor atmosférico mutável e leve, símbolo de transição e liberdade."),
              el("Voar", "Capacidade de se mover pelos ares livremente, acima do solo."),
              el("Som", "Vibração do ar, controlada ou ampliada, usada para atacar ou comunicar."),
              el("Tempestade", "Força natural violenta que mistura vento, trovões e caos."),
              el("Pulso", "Onda vibracional que se propaga no ar, como um impacto invisível."),
              el("Papel", "Leve, flexível, facilmente levado pelo vento, mas afiado em formas criativas."),
              el("Tiro", "Projétil lançado em alta velocidade, cortando o ar até atingir o alvo."),
              el("Linhas", "Fios ou conexões sutis que se esticam ou dançam com o vento."),
            ],
          },
          {
            name: "Hydro",
            hint: "vínculo com água",
            elementos: [
              el("Criocinese", "Água solidificada, fria, dura e usada para aprisionar ou ferir."),
              el("Neve", "Gelo leve e puro, pode ocultar ou amortecer, símbolo de calma ou inverno."),
              el("Veneno", "Líquido tóxico que contamina, enfraquece ou mata lentamente."),
              el("Gosma", "Substância viscosa e pegajosa, dificulta o movimento e adere aos alvos."),
              el("Sangue", "Essência vital líquida, ligada à vida, sacrifício ou maldição."),
              el("Lama", "Mistura pegajosa de terra e água, que prende e suja, símbolo de decadência."),
              el("Cura", "Restauração e regeneração através da fluidez e equilíbrio."),
              el("Flores", "Representa crescimento, delicadeza e harmonia com a água e natureza."),
            ],
          },
          {
            name: "Sombrius",
            hint: "vínculo com escuridão",
            elementos: [
              el("Sombras", "Forma obscura da luz, usada para se esconder, atacar ou manipular."),
              el("Corrupção", "Degradação da pureza, contaminando pessoas, lugares ou energias."),
              el("Pesadelo", "Manifestação dos piores medos, capaz de afetar mente e corpo."),
              el("Morte", "Representa o fim da vida, o vazio, o desconhecido."),
              el("Caos", "Energia desorganizada, imprevisível, ligada ao descontrole e destruição."),
              el("Glitch", "Erros ou falhas na realidade, causando comportamentos imprevisíveis."),
              el("Void", "O vazio absoluto, sem luz, som ou forma. Consome tudo ao redor."),
              el("Ilusão", "Manipulação da percepção, criando imagens ou situações falsas."),
            ],
          },
          {
            name: "Pyro",
            hint: "vínculo com fogo",
            elementos: [
              el("Cinzas", "Representa a destruição e o que resta após o fogo consumir algo; simboliza renascimento ou perda."),
              el("Explosão", "Força destrutiva intensa e repentina, causada por reações rápidas ou energia acumulada."),
              el("Lava", "Rocha derretida em estado bruto, símbolo de poder e instabilidade quente."),
              el("Plasma", "Estado energético da matéria; pura energia flamejante e volátil."),
              el("Solar", "Ligado ao poder do sol, calor extremo, luz radiante e fogo celestial."),
              el("Destruição", "Energia pura voltada à ruína, devastação e aniquilação."),
              el("Gula", "Desejo insaciável, muitas vezes violento, como uma chama que nunca se apaga."),
              el("Laser", "Energia concentrada em um feixe quente e preciso, geralmente usado como arma."),
              el("Nuclear", "Representa energia atômica, destrutiva e radioativa, com calor imensurável."),
              el("Amor", "Emoção ardente e intensa, frequentemente ligada à paixão e impulsividade."),
            ],
          },
          {
            name: "Terrus",
            hint: "vínculo com terra",
            elementos: [
              el("Pedra", "Base sólida e resistente, usada como escudo, arma ou construção."),
              el("Areia", "Grãos pequenos, mutáveis e cortantes, símbolo de passagem do tempo."),
              el("Cristal", "Estrutura mineral pura e mágica, usada em canalizações ou defesas."),
              el("Metal", "Elemento moldável e forte, usado para armaduras, armas e máquinas."),
              el("Ossos", "Estrutura rígida de seres vivos, símbolo de morte ou força interna."),
              el("Defesa", "Foco em resistir, proteger e bloquear ataques físicos ou mágicos."),
              el("Tamanho", "Representa crescimento físico, aumento de massa ou gigantismo."),
              el("Corte", "Capacidade de dividir ou fatiar com precisão, usando objetos físicos."),
              el("Engenharia", "Conhecimento técnico de construção e invenções físicas."),
            ],
          },
          {
            name: "Neutro",
            hint: "vínculo com o potencial físico ou sem vínculo",
            elementos: [
              el("Alquimia", "Combinação mágica de elementos para criar efeitos diversos."),
              el("Arcana", "Energia mágica pura, sem vínculo elemental direto."),
              el("Duplicação", "Capacidade de replicar a si mesmo ou objetos."),
              el("Cópia", "Capacidade de imitar habilidades, formas ou poderes."),
              el("Elasticidade", "Corpo ou forma que estica e retorna, adaptável."),
              el("Psíquico", "Força mental que afeta objetos, pessoas ou realidades."),
              el("Poder", "Força bruta ou mágica pura que aumenta o desempenho."),
              el("Tinta", "Substância artística e simbólica, usada para manipular ou criar."),
              el("Musical", "Vibrações sonoras que encantam, inspiram ou controlam."),
              el("Tempo", "Manipulação do passado, presente e futuro."),
              el("Tecnologia", "Uso de circuitos, máquinas e ciência avançada."),
              el("Armas", "Especialização no uso de ferramentas de combate."),
              el("Chifres", "Atributo físico extra, símbolo de força ou ferocidade."),
              el("Gravidade", "Manipulação da força que atrai corpos, afetando o movimento."),
              el("Espaço", "Distorção de posição, teleporte, ampliação ou dobra espacial."),
            ],
          },
        ],
      },
      {
        id: "corrompido",
        name: "Círculo Terreno Corrompido",
        description:
          "Os Elementos Corrompidos são técnicas elementais desenvolvidas através da extração e manipulação artificial da essência da natureza, utilizando uma energia e uma afinidade que não pertencem naturalmente ao indivíduo. Diferente dos outros círculos, esses elementos são mais livres e versáteis, permitindo que seus usuários modifiquem e distorçam suas propriedades de maneiras incomuns e imprevisíveis. No entanto, o uso dessa energia deixa marcas visíveis em sua presença, fazendo com que o usuário seja envolvido por uma aura ou energia podre, sombria e maligna.",
        elementos: [
          el("Podridão", "Líquido tóxico que contamina, enfraquece ou mata lentamente."),
          el("Sangue Maldito", "Essência vital líquida, ligada à vida, sacrifício ou maldição."),
          el("Infecção do Ser", "Degradação da pureza, contaminando pessoas, lugares ou energias."),
          el("Terror dos Abismos", "Manifestação dos piores medos, capaz de afetar mente e corpo."),
          el("Morte Negra", "Representa o fim da vida, o vazio, o desconhecido."),
          el("Caos Corrompido", "Energia desorganizada, imprevisível, ligada ao descontrole e destruição."),
          el("Lama Pútrida", "Mistura pegajosa de terra e água, que prende e suja, símbolo de decadência."),
          el("Ossos da Perdição", "Estrutura rígida de seres vivos, símbolo de morte ou força interna."),
        ],
      },
    ],
  },
  {
    id: "outro-lado",
    name: "Outro Lado",
    description: "Um lugar que ninguém nunca visitou pois nunca teve consciência pra voltar e contar a história.",
    circulos: [
      {
        id: "paranormal",
        name: "Círculo Paranormal",
        description:
          "Os elementos paranormais são energias sobrenaturais originadas do Outro Lado, manifestadas a partir de emoções, conceitos e medos que transcendem a realidade comum. Cada elemento possui características únicas e poderes capazes de desafiar as leis da natureza, influenciando tanto o mundo físico quanto o espiritual. Quando dominados, concedem habilidades extraordinárias, mas seu uso excessivo pode aproximar o usuário dos horrores e mistérios que lhes deram origem.",
        elementos: [
          el("❈ Conhecimento", "O elemento dos segredos ocultos, da sabedoria proibida e das verdades que desafiam a sanidade."),
          el("❈ Energia", "O elemento do caos puro, da transformação constante e do poder imprevisível que impulsiona a realidade."),
          el("❈ Morte", "O elemento do fim inevitável, do tempo que consome tudo e do silêncio que aguarda todas as coisas."),
          el("❈ Sangue", "O elemento das emoções intensas, dos instintos primitivos e da força vital que corre em todos os seres."),
          el("❈ Medo", "O elemento dos pesadelos, do desconhecido e dos horrores que habitam as profundezas da mente e da alma."),
        ],
      },
    ],
  },
  {
    id: "imaginario",
    name: "Plano Imaginário",
    description:
      "Os Elementos do Plano Imaginário são manifestações da mente, dos sonhos e da percepção da realidade. Diferente dos outros círculos elementais, seus poderes nascem da imaginação, das emoções e da capacidade de alterar conceitos, ilusões e possibilidades através da vontade. Seus usuários moldam o irreal como se fosse matéria, criando habilidades que desafiam lógica, espaço e até mesmo a própria existência.",
    circulos: [
      {
        id: "astral",
        name: "Círculo Astral",
        description:
          "Os Elementos Astrais são forças místicas ligadas aos Maho e ao ciclo do zodíaco astral. Diferente dos outros círculos elementais, seus poderes nascem da conexão entre alma, constelações e runas ancestrais incompreensíveis para a maioria dos mortais. Cada signo representa um elemento específico, influenciando personalidade, afinidade astral e habilidades únicas de seus portadores. Entre os estudiosos, acredita-se que essas runas sejam fragmentos de uma linguagem divina deixada pelos próprios espíritos astrais.",
        elementos: [
          el("FOGO", "Runas com conexão não só ao próprio fogo, mas conexão ao sol, lava e cinzas."),
          el("TECH", "Runas com conexão não só à própria tecnologia, mas conexão a máquinas, ciências e digital."),
          el("TEMPO", "Runas com conexão não só ao próprio tempo, mas conexão ao universo, história e realidade."),
          el("TERRA", "Runas com conexão não só à própria terra, mas conexão ao metal, joia e magnetismo."),
          el("VIDA", "Runas com conexão não só à própria vida, mas conexão à natureza, sonhos e evolução."),
          el("GELO", "Runas com conexão não só ao próprio gelo, mas conexão a espelhos, névoa e criocinese."),
          el("ÁGUA", "Runas com conexão não só à própria água, mas conexão com a mana, purificação e a lua."),
          el("LUZ", "Runas com conexão não só à própria luz, mas conexão com a ordem, angelical e sagrado."),
          el("MORTE", "Runas com conexão não só à própria morte, mas conexão com veneno, mortos e diabólico."),
          el("DARK", "Runas com conexão não só à própria escuridão, mas conexão com o demoníaco, desordem e void."),
          el("PSYCHIC", "Runas com conexão não só ao próprio psíquico, mas conexão com o imaginário, o crepúsculo e as almas."),
          el("VENTO", "Runas com conexão não só ao próprio vento, mas conexão com tempestade, som e clima."),
        ],
      },
      {
        id: "espiritual",
        name: "Círculos Espirituais",
        description:
          "Os Elementos Espirituais são forças que moldam corpo, mente e alma, geralmente herdadas pela tribo em que um Qareen nasce. Cada elemento carrega uma filosofia própria, influenciando não apenas o poder de seus usuários, mas também sua cultura, seus rituais e sua forma de enxergar o mundo. Alguns representam destruição e renascimento, outros equilíbrio, memória, velocidade ou até mesmo a própria realidade. Entre os povos astrais, dominar um elemento não é apenas aprender técnicas — é aceitar a natureza espiritual que habita dentro de si.",
        elementos: [
          {
            name: "Os Punhos de Titânio (Elemento Físico)",
            historia: "A tribo vive nos Desfiladeiros da Forja, vastos cânions onde o som de batalhas ecoa eternamente. Eles acreditam que o espírito nasce frágil e só encontra forma através da dor e da disciplina física. Desde pequenos, os membros passam por provas brutais, escalando penhascos sem proteção e lutando contra feras espirituais. Suas almas são moldadas como aço, e dizem que os ancestrais ainda treinam os jovens em sonhos.",
            treino: "Vivem em fortalezas esculpidas na rocha, onde cada sala é uma arena. O treinamento é constante: socos em placas de titânio, duelos rituais, e meditação com pesos. Valorizam honra, resistência e disciplina. Qareen entre eles ajudam a interpretar os sinais espirituais de fraturas e combates passados, como runas gravadas no corpo.",
          },
          {
            name: "Os Devotos da Chama (Elemento Ignir)",
            historia: "Eles surgiram após um cataclismo espiritual que queimou metade do mundo etéreo. De lá, ergueram templos entre rios de lava mística, onde a chama é tanto destruidora quanto purificadora. Eles acreditam que toda vida deve queimar para renascer mais forte. Suas guerras são danças flamejantes, e seus líderes, chamados Chamas Eternas, são espíritos que nunca se apagam.",
            treino: "Cada passo, cada movimento é coreografado com fogo – as lutas são artes cênicas, os rituais, sacrifícios energéticos. Forjam armamentos com energia viva e mantêm um ciclo constante de morte e renascimento simbólico. Qareen aqui são usados para alimentar chamas cerimoniais com desejos alheios, tornando-os brasas conscientes.",
          },
          {
            name: "Os Silenciosos do Inverno (Elemento Cryo)",
            historia: "Eles habitam nos Reinos Quietos, onde o tempo parece parar. Lá, o som é engolido pela neve espiritual e as emoções são guardadas sob camadas de gelo. São os guardiões do passado, mantendo memórias congeladas em cristais eternos. Acreditam que o calor da paixão corrompe a alma e que o verdadeiro poder está na mente fria e estável.",
            treino: "Treinam em lagos congelados e enfrentam reflexos seus em espelhos de gelo, numa busca constante por autocontrole. Seus corpos se adaptam ao frio espiritual e canalizam energia para paralisar inimigos. Qareen aqui são venerados como bibliotecas vivas, já que memórias e desejos congelados revelam verdades ocultas.",
          },
          {
            name: "Os Tempestuosos (Elemento Electro)",
            historia: "Essa tribo vive entre as Montanhas Que Gritam, atingidas por raios eternos. Eles acreditam que cada raio carrega um espírito ancestral buscando liberação. Seus corpos são marcados por cicatrizes de treinamento elétrico, e seus líderes são os Condutores, que canalizam os trovões com os ossos.",
            treino: "Combates e corridas em cordilheiras perigosas. Disputas de reflexo e velocidade, onde um erro pode significar a morte. Treinam até que seus músculos memorizem cada impulso. Qareen auxiliam nas tempestades espirituais, canalizando desejos para desorganizar as emoções dos inimigos.",
          },
          {
            name: "Os Dançarinos do Céu (Elemento Aéreos)",
            historia: "Nômades do Vazio Celeste, a tribo vive em cidades flutuantes entre correntes espirituais. São artistas, caçadores de ventos e mestres do equilíbrio. Acreditam que o espírito não deve ser fixo, mas livre, leve e sempre em movimento. Dizem que quando dançam, o mundo respira com eles.",
            treino: "Equilíbrio, agilidade e leveza são essenciais. Usam cordas aéreas, danças acrobáticas e batalhas em campos suspensos. Vestem-se com tecidos que captam o vento espiritual. Qareen nesta tribo se tornam oráculos, lendo desejos nas mudanças de brisa.",
          },
          {
            name: "Os Tecelões do Sonho (Elemento Imaginário)",
            historia: "Vivem entre véus de névoa, em florestas oníricas onde o tempo dorme. Essa tribo molda o mundo com pensamento, e cada membro aprende desde cedo a projetar seus desejos no mundo espiritual. As guerras são disputas de realidade, onde quem controla melhor a própria mente vence.",
            treino: "Isolamento, meditação, e manipulação de cenários mentais. Criam avatares e monstros ilusórios que se tornam reais conforme a crença. Dormem em turnos sincronizados para treinar juntos em sonhos compartilhados. Qareen aqui são chamados de \"Desejos Encarnados\", usados como canais para manifestar conceitos impossíveis.",
          },
          {
            name: "Os Andarilhos do Véu (Elemento Quântico)",
            historia: "Essa tribo não habita um único lugar, mas sim \"possibilidades\". Vivem entre as Fendas de Possibilidade, onde cada passo pode levá-los a uma versão alternativa do mundo. Seus membros são caóticos, filosóficos, e enxergam o tempo como uma tapeçaria rasgada. Dizem ser descendentes diretos de um espírito Qareen que se dividiu em mil versões.",
            treino: "Aprendem a existir em múltiplos estados. Treinam enfrentando clones temporais, lidando com paradoxos e alterando resultados de ações. Não seguem hierarquias fixas – seus líderes são eleitos por consensos simultâneos em realidades paralelas. Os Qareen ajudam a fundir desejos com as linhas alternativas, permitindo que o impossível se torne possível.",
          },
        ],
      },
    ],
  },
];

// Signos astrais (Mahō): ao escolher um, só estes ficam liberados para a próxima escolha.
export const ASTRAL_COMPAT = {
  FOGO: ["TEMPO", "TERRA", "VIDA", "GELO", "LUZ"],
  TECH: ["FOGO", "TEMPO", "TERRA", "MORTE", "PSYCHIC"],
  TEMPO: ["FOGO", "LUZ", "DARK", "PSYCHIC", "VENTO"],
  TERRA: ["ÁGUA", "MORTE", "DARK", "PSYCHIC", "VENTO"],
  VIDA: ["FOGO", "TECH", "TEMPO", "LUZ", "MORTE"],
  GELO: ["FOGO", "TECH", "TEMPO", "VIDA", "LUZ", "MORTE"],
  ÁGUA: ["FOGO", "TEMPO", "VIDA", "LUZ", "PSYCHIC", "VENTO"],
  LUZ: ["TECH", "TEMPO", "GELO", "ÁGUA", "MORTE", "DARK"],
  MORTE: ["FOGO", "VIDA", "GELO", "LUZ", "VENTO"],
  DARK: ["TECH", "TERRA", "GELO", "ÁGUA", "MORTE"],
  PSYCHIC: ["TERRA", "VIDA", "GELO", "ÁGUA", "DARK", "VENTO"],
  VENTO: ["TECH", "VIDA", "GELO", "ÁGUA", "LUZ", "PSYCHIC"],
};

// C.A.S.A. que obrigam um elemento (escolha 1 entre 2). São elementos do Círculo Terreno.
export const CASA_VINCULO = {
  Shadows: ["Sombras", "Veneno"],
  Crawlers: ["Destruição", "Sangue"],
  Divinus: ["Energia", "Cura"],
};

// Lista plana: cada elemento com seu plano, círculo e categoria (para busca e regras).
export const ALL_ELEMENTS = VINCULOS_PLANOS.flatMap((p) =>
  p.circulos.flatMap((c) =>
    (c.categorias || [{ name: "", elementos: c.elementos }]).flatMap((cat) =>
      cat.elementos.map((e) => ({
        ...e,
        id: `${c.id}:${e.name}`,
        plano: p.name,
        circuloId: c.id,
        circulo: c.name,
        categoria: cat.name,
      }))
    )
  )
);
