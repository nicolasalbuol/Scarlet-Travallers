// Categorias de Passado (Antecedente)
export const PASSADO_CATEGORIES = [
  {
    id: "convocado",
    name: "Convocado",
    phrase: "Nem todos escolhem a HUNTER. Alguns são escolhidos por ela.",
    description:
      "Há quem nunca tenha buscado o combate contra o sobrenatural — e, ainda assim, foi encontrado por ele. O Convocado é identificado pela própria HUNTER, seja porque uma facção notou seu potencial, seja porque seus atos chamaram atenção demais para passarem despercebidos. Não houve escolha consciente de entrar: a organização veio até ele, e recusar raramente é uma opção real. Esses agentes costumam carregar um misto de orgulho e desconforto — afinal, foram escolhidos, mas nem sempre por motivos que compreendem por completo.",
  },
  {
    id: "treino",
    name: "Treino por Conta Própria",
    phrase: "Ninguém bateu à porta. Então eles mesmos arrombaram a da HUNTER.",
    description:
      "Esses são os que não esperaram ser escolhidos. Sabendo do próprio potencial — ou simplesmente recusando-se a viver sem controlá-lo — passaram anos se preparando sozinhos, muitas vezes na marra, até atingir um nível que a HUNTER não pudesse ignorar. Não tiveram mestres oficiais nem recursos de uma facção: cada erro foi pago com o próprio corpo, e cada avanço, conquistado sozinho. São agentes marcados por autonomia e teimosia — confiam mais em si mesmos do que na cadeia de comando, e carregam isso como orgulho.",
  },
  {
    id: "ex_agente",
    name: "Ex-agente Reconvocado",
    phrase: "Pensavam que tinham deixado aquela vida para trás. A HUNTER raramente deixa alguém ir de verdade.",
    description:
      "Esses personagens já vestiram o distintivo antes — e saíram dele, por bem ou por mal. Alguns se aposentaram após perdas pesadas, outros desertaram por não concordar mais com os métodos da organização, e outros simplesmente tentaram construir uma vida normal. Agora, uma nova ameaça — ou uma dívida antiga — os traz de volta ao campo. São agentes marcados pela experiência e pelo peso do passado: sabem exatamente no que estão se metendo, e isso pode ser tanto uma vantagem quanto um fardo.",
  },
  {
    id: "mundano",
    name: "Mundano",
    phrase: "Nunca pediram por isso. O sobrenatural é que não perguntou.",
    description:
      "Diferente dos outros, o Mundano não começa com nenhum vínculo com a HUNTER — nem mesmo com o Sexto Sentido, necessariamente. É um personagem comum, inserido em uma vida comum, que se vê arrastado para dentro de uma missão por acaso, acidente ou circunstância. Ao longo das sessões, acaba se envolvendo cada vez mais, provando seu valor na prática até se tornar, de fato, um agente — sem nunca ter planejado isso. É a categoria ideal para histórias que começam fora do universo sobrenatural e crescem junto com a campanha, com o passado ganhando mais sentido conforme o mestre e o jogador desenvolvem a trama.",
  },
];

// Passados padrão (usados quando não há registros na entidade Passado)
export const PASSADO_DEFAULTS = [
  // Convocado
  { name: "Protegido da Facção", category: "convocado", description: "Cresceu sob a tutela de uma facção que percebeu seu potencial cedo. Foi treinado desde a marca dos 10 anos.", skill_1: "Diplomacia", skill_2: "Atualidades", bonus_value: 2, order: 0 },
  { name: "Herói Involuntário", category: "convocado", description: "Salvou pessoas durante um incidente sobrenatural e chamou a atenção da HUNTER.", skill_1: "Reflexos", skill_2: "Integridade", bonus_value: 2, order: 1 },
  { name: "Prodígio Observado", category: "convocado", description: "Agentes o vigiaram por anos antes do recrutamento. Ele descobriu isso tarde demais.", skill_1: "Percepção", skill_2: "Intuição", bonus_value: 2, order: 2 },
  { name: "Herdeiro de Linhagem", category: "convocado", description: "Vem de uma família tradicional de agentes, e a convocação foi quase um destino.", skill_1: "História", skill_2: "Vontade", bonus_value: 2, order: 3 },
  { name: "Escolhido pelo Acaso", category: "convocado", description: "A HUNTER só o encontrou porque ele estava no lugar certo na hora certa, e ele escapou de situações impossíveis.", skill_1: "Atletismo", skill_2: "Sorte", bonus_value: 2, order: 4 },
  { name: "Filho de Culto", category: "convocado", description: "Cresceu entre rituais de uma facção religiosa, e a HUNTER o tirou de lá aos 16, quando o poder despertou.", skill_1: "Religião", skill_2: "Sorte", bonus_value: 2, order: 5 },
  // Treino por Conta Própria
  { name: "Sobrevivente de Rua", category: "treino", description: "Aprendeu a se virar sozinho, escondendo a marca e o poder.", skill_1: "Sobrevivência", skill_2: "Furtividade", bonus_value: 2, order: 6 },
  { name: "Autodidata do Oculto", category: "treino", description: "Estudou livros proibidos e rituais até dominar o que sentia.", skill_1: "Ocultismo", skill_2: "Feitiçaria", bonus_value: 2, order: 7 },
  { name: "Lutador de Academia", category: "treino", description: "Treinou em rings e dojôs até alcançar o nível exigido.", skill_1: "Luta", skill_2: "Fortitude", bonus_value: 2, order: 8 },
  { name: "Nerd Investigador", category: "treino", description: "Rastreou casos sobrenaturais por hobby e provou seu valor com resultados.", skill_1: "Investigação", skill_2: "Tecnologia", bonus_value: 2, order: 9 },
  { name: "Domador de Feras", category: "treino", description: "Vivia em uma fazenda ou reserva e desenvolveu um laço com animais que o poder ampliou. Treinou sozinho até ser notado.", skill_1: "Adestramento", skill_2: "Sorte", bonus_value: 2, order: 10 },
  { name: "Artista de Rua", category: "treino", description: "Usava o poder em apresentações e shows, e aos poucos percebeu que era mais do que truque.", skill_1: "Performance", skill_2: "Sorte", bonus_value: 2, order: 11 },
  // Ex-agente Reconvocado
  { name: "Veterano Aposentado", category: "ex_agente", description: "Saiu após uma perda pesada e foi chamado de volta quando a ameaça retornou.", skill_1: "Memória", skill_2: "Pontaria", bonus_value: 2, order: 12 },
  { name: "Desertor Perdoado", category: "ex_agente", description: "Abandonou a HUNTER por discordar dela, e agora ela precisa dele.", skill_1: "Enganação", skill_2: "Intimidação", bonus_value: 2, order: 13 },
  { name: "Ex-agente Civil", category: "ex_agente", description: "Levou uma vida comum como médico ou professor, até o passado bater à porta.", skill_1: "Medicina", skill_2: "Ciências", bonus_value: 2, order: 14 },
  { name: "Sobrevivente de Unidade Extinta", category: "ex_agente", description: "Único que restou de uma agência destruída.", skill_1: "Sorte", skill_2: "Acrobacia", bonus_value: 2, order: 15 },
  { name: "Piloto Aposentado", category: "ex_agente", description: "Era motorista ou piloto de fuga da unidade, e sobreviveu a missões em que ninguém deveria. Foi chamado de volta por causa das habilidades e da fama de nunca morrer.", skill_1: "Direção", skill_2: "Sorte", bonus_value: 2, order: 16 },
  // Mundano
  { name: "Amnésico", category: "mundano", description: "Acordou sem lembrar de quem era e foi arrastado para uma missão da HUNTER. Seu corpo reage antes da mente, e talvez o passado esteja ligado ao sobrenatural.", skill_1: "Reflexos", skill_2: "Integridade", bonus_value: 2, order: 17 },
  { name: "Prisioneiro Sentenciado", category: "mundano", description: "Condenado por seus crimes, recebeu uma escolha: cumprir pena ou servir como agente. A HUNTER o vigia de perto, e ele ainda não confia em ninguém.", skill_1: "Intimidação", skill_2: "Fortitude", bonus_value: 2, order: 18 },
  { name: "Prisioneiro Arrependido", category: "mundano", description: "Errou feio e pagou o preço. Ao sair, decidiu usar o poder para ajudar quem precisa e se redimir, mesmo sem ninguém exigir isso.", skill_1: "Vontade", skill_2: "Diplomacia", bonus_value: 2, order: 19 },
  { name: "Testemunha Acidental", category: "mundano", description: "Viu algo que não devia durante um ataque sobrenatural. Em vez de ser silenciado, acabou ajudando na missão e foi ficando.", skill_1: "Percepção", skill_2: "Memória", bonus_value: 2, order: 20 },
  { name: "Socorrista Voluntário", category: "mundano", description: "Paramédico, bombeiro ou voluntário de ONG que cuidou de vítimas de ataques e acabou se envolvendo com os agentes.", skill_1: "Medicina", skill_2: "Atletismo", bonus_value: 2, order: 21 },
  { name: "Curioso de Mistérios", category: "mundano", description: "Criador de conteúdo ou fã de teorias que foi atrás de um caso real e acabou no meio de uma missão.", skill_1: "Atualidades", skill_2: "Investigação", bonus_value: 2, order: 22 },
];

// Texto de introdução da etapa Passado
export const PASSADO_INTRO =
  "Toda alma marcada carrega uma história de antes — e é essa história que molda a lâmina que ela se torna. Um Passado, também chamado de Antecedente, é a origem do seu personagem antes de vestir o distintivo da HUNTER (ou de decidir, por conta própria, que vestiria um se pudesse). Não é apenas um pano de fundo narrativo: é um reflexo mecânico de quem seu personagem foi antes da história começar. Cada Passado concede +2 em duas perícias, representando as lições, cicatrizes e talentos moldados por aquela vida pregressa. Existem quatro grandes categorias de Passado, cada uma ligada a uma forma diferente de ingresso na HUNTER: Convocado, Treino por Conta Própria, Ex-agente Reconvocado e Mundano. Escolha aquele que melhor conta a origem do seu personagem — ou use-o como ponto de partida para criar o seu próprio.";