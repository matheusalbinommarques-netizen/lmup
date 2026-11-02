export const worldArt = '/art/world/';
export const locations = [
  {
    id: 'oasis',
    name: 'Oásis dos Fundadores',
    x: 35,
    y: 43,
    description:
      'Um assentamento recente ganha forma junto à água. Tendas, oficinas e andaimes revelam o trabalho de seus moradores.',
  },
  {
    id: 'north',
    name: 'Desfiladeiro do Norte',
    x: 40,
    y: 14,
    description:
      'Passagens estreitas atravessam os paredões do norte. Ainda não há uma rota de exploração estabelecida.',
  },
  {
    id: 'stone',
    name: 'Bosque de Pedra',
    x: 79,
    y: 28,
    description:
      'Formações de pedra se erguem no horizonte. A região ainda não foi explorada nesta campanha.',
  },
  {
    id: 'variel',
    name: 'Entreposto de Variel',
    x: 19,
    y: 76,
    description:
      'Um ponto de encontro de viajantes e carregadores. Sua localização pode ser confirmada durante a investigação.',
  },
  {
    id: 'sareth',
    name: 'Ruínas de Sareth',
    x: 84,
    y: 68,
    description:
      'Colunas antigas permanecem entre as rochas. A aproximação exige uma expedição futura.',
  },
] as const;
export type LocationId = (typeof locations)[number]['id'];
export type SceneId = 'settlement' | 'outskirts';
export const founders = [
  {
    id: 'alaric-conall',
    name: 'Alaric Conall',
    role: 'Guerreiro · Capitão da guarda de Valerion',
    age: 36,
  },
  {
    id: 'eldrin-vane',
    name: 'Eldrin Vane',
    role: 'Mago · Pesquisador e professor',
    age: 48,
  },
  {
    id: 'elowen-morrigan',
    name: 'Elowen Morrigan',
    role: 'Druida · Estudiosa da natureza',
    age: 42,
  },
  {
    id: 'lucan-dorian',
    name: 'Lucan Dorian',
    role: 'Ladino · Um dos quatro fundadores',
    age: 29,
  },
] as const;
export const clues = {
  manifest: {
    name: 'Registro da caravana',
    text: 'O quadro registra uma entrega de mantimentos pelo caminho do entreposto. A carga é esperada no Oásis; não existe ordem de desvio.',
  },
  axle: {
    name: 'Eixo rompido',
    text: 'As fibras da madeira se abriram sob o peso da carga. Não há marcas de lâmina ou de combate: a carroça sofreu uma avaria.',
  },
  cargo: {
    name: 'Carga organizada',
    text: 'Os sacos restantes foram separados em pequenos volumes. A farinha derramada está junto da roda, enquanto cordas foram cortadas para improvisar alças de transporte.',
  },
  tracks: {
    name: 'Rastro de retorno',
    text: 'Pegadas de botas e animais deixam a carroça e seguem pelo caminho alto de volta ao Oásis. As marcas são regulares, sem sinal de perseguição.',
  },
} as const;
export type ClueId = keyof typeof clues;
export const requiredClues: ClueId[] = ['axle', 'cargo', 'tracks'];
export const hotspots = [
  {
    id: 'lucan',
    scene: 'settlement',
    x: 22,
    y: 64,
    name: 'Conversar com Lucan',
    text: 'Lucan observa o movimento junto à área de construção.',
  },
  {
    id: 'board',
    scene: 'settlement',
    x: 86,
    y: 53,
    name: 'Quadro de avisos',
    text: clues.manifest.text,
    clue: 'manifest',
  },
  {
    id: 'supplies',
    scene: 'settlement',
    x: 83,
    y: 85,
    name: 'Mesa de provisões',
    text: 'Há cordas, recipientes e espaço para receber a carga. Os mantimentos abastecem trabalhadores e viajantes.',
  },
  {
    id: 'exit',
    scene: 'settlement',
    x: 78,
    y: 43,
    name: 'Caminho dos arredores',
    text: 'O portão leva à estrada que acompanha a água.',
  },
  {
    id: 'wagon',
    scene: 'outskirts',
    x: 23,
    y: 51,
    name: 'Examinar a carroça',
    text: clues.axle.text,
    clue: 'axle',
  },
  {
    id: 'bags',
    scene: 'outskirts',
    x: 18,
    y: 72,
    name: 'Examinar a carga',
    text: clues.cargo.text,
    clue: 'cargo',
  },
  {
    id: 'footprints',
    scene: 'outskirts',
    x: 59,
    y: 83,
    name: 'Seguir as pegadas',
    text: clues.tracks.text,
    clue: 'tracks',
  },
  {
    id: 'stone',
    scene: 'outskirts',
    x: 88,
    y: 48,
    name: 'Observar a pedra',
    text: 'A pedra tem marcas antigas desgastadas pelo vento. Elas não explicam a avaria nem o caminho dos carregadores.',
  },
  {
    id: 'return',
    scene: 'outskirts',
    x: 72,
    y: 33,
    name: 'Voltar ao assentamento',
    text: 'O caminho alto retorna ao portão do Oásis.',
  },
] as const;
export type HotspotId = (typeof hotspots)[number]['id'];
export const sceneContent = {
  settlement: {
    name: 'Oásis em construção',
    art: 'cena-oasis-construcao.webp',
    description:
      'Entre andaimes e tendas, o assentamento segue trabalhando. Converse com Lucan ou investigue o quadro de avisos.',
  },
  outskirts: {
    name: 'Arredores do Oásis',
    art: 'cena-arredores-pistas.webp',
    description:
      'Uma carroça avariada ficou à margem da estrada. Examine o que aconteceu e procure sinais do destino dos viajantes.',
  },
} as const;
