import type { WorldState } from './worldState';
export const worldArt = '/art/world/';
export const lucanArt = worldArt + 'lucan-dorian-horizontal.png';
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
    text: 'O eixo de madeira cedeu sob o peso dos mantimentos e imobilizou a carroça. Não há marcas de lâmina ou de combate.',
  },
  cargo: {
    name: 'Carga organizada',
    text: 'Sacos menores e alças feitas com as cordas da carroça mostram como os carregadores levaram parte dos mantimentos à mão. A carga restante ainda está junto à roda.',
  },
  tracks: {
    name: 'Rastro de retorno',
    text: 'Pegadas saem da carroça pelo caminho alto e seguem até o Oásis. As marcas são regulares: os carregadores voltaram por ali, sem sinais de perseguição.',
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
    name: 'Voltar ao Oásis',
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

// Public notice derived from existing progress; reading it is never a quest requirement.
export function returnNoticeAvailable(world: WorldState) {
  return world.quest !== 'new' && world.visitedScenes.includes('outskirts');
}
export const returnNotice = {
  title: 'Aviso de retorno',
  text: 'Registro do portão: todos os carregadores chegaram em segurança pelo caminho alto, trazendo parte dos mantimentos à mão. A carga restante ficou junto à carroça avariada, nos arredores.',
};
export const investigationFindings = [
  {
    id: 'axle',
    title: 'Por que parou',
    text: 'O eixo quebrou sob o peso da carga.',
  },
  {
    id: 'cargo',
    title: 'Como transportaram',
    text: 'Dividiram os mantimentos em sacos menores, com alças de corda para carregá-los à mão.',
  },
  {
    id: 'tracks',
    title: 'Por onde voltaram',
    text: 'As pegadas seguem pelo caminho alto até o Oásis.',
  },
] as const;
export const personalTasks = {
  rescue: {
    player: 'Recuperar a carga restante junto à carroça.',
    lucan: 'Preparar o caminho alto para as próximas entregas.',
    scene:
      'Cordas e alças estão separadas para você acompanhar a recuperação dos sacos. Lucan ficou com o esboço das marcações do caminho alto.',
    journal:
      'Você assumiu a recuperação da carga restante junto à carroça. Lucan ficou responsável por preparar o caminho alto para as próximas entregas. Ele passou a confiar em sua iniciativa.',
  },
  route: {
    player: 'Preparar uma rota mais segura para as próximas entregas.',
    lucan: 'Acompanhar a recuperação da carga restante.',
    scene:
      'O esboço do caminho alto e as orientações aos viajantes estão prontos para você preparar a rota. Lucan separou as cordas para acompanhar a recuperação dos sacos.',
    journal:
      'Você assumiu a preparação de uma rota mais segura pelo caminho alto. Lucan ficou responsável por recuperar a carga restante junto à carroça. Ele passou a respeitar sua atenção aos detalhes.',
  },
} as const;
