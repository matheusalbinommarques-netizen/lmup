// Presentation only: no costs, rewards, persistent IDs or progression rules.
export const identity = {
  name: 'Level Me Up',
  tagline: 'Da ideia ao feito.',
};
export const destinations = {
  today: 'Hoje',
  missions: 'Missões',
  projects: 'Projetos',
  world: 'Refúgio',
  companions: 'Companheiros',
  achievements: 'Conquistas',
};
export const homeCopy = {
  eyebrow: 'Seu tempo. Sua jornada.',
  title: 'Um passo de cada vez.',
  next: 'Escolha o que quer levar adiante agora.',
  resume: 'Você já começou. Continue de onde parou.',
  first: 'Tire uma ideia do papel, começando pelo que cabe hoje.',
  clear: 'Não há missão disponível agora. Você pode encerrar por aqui.',
  firstTitle: 'Qual ideia você quer tirar do papel?',
  firstDescription:
    'Dê um nome a algo que você quer fazer. Você pode ajustar os detalhes depois.',
  clearTitle: 'Você está em dia.',
  clearDescription:
    'O que você fez continua registrado. O próximo passo pode ficar para outra hora.',
  waitingTitle: 'Suas revisões têm seu tempo.',
  waitingDescription:
    'Nenhuma revisão está disponível agora. Consulte as próximas datas em Missões ou encerre por aqui.',
  archivedTitle: 'Sem missões ativas.',
  archivedDescription:
    'Missões arquivadas não entram nas sugestões. Crie outra quando fizer sentido.',
  examplesTitle: 'Precisa de uma ideia?',
  examplesHint:
    'São pontos de partida. Nada é criado até você revisar e salvar.',
  companion: 'Companhia para o caminho, sem pressa para chegar.',
};
export type MissionStarter = {
  key: string;
  label: string;
  title: string;
  steps: string[];
};
export const missionStarters: MissionStarter[] = [
  {
    key: 'study',
    label: 'Estudar uma ideia',
    title: 'Ler duas páginas e anotar uma ideia',
    steps: [
      'Escolher duas páginas',
      'Ler e marcar o que chamou atenção',
      'Anotar uma ideia com minhas palavras',
    ],
  },
  {
    key: 'project',
    label: 'Destravar um projeto',
    title: 'Fazer um primeiro rascunho do projeto',
    steps: [
      'Escolher uma parte pequena',
      'Fazer um rascunho sem polir',
      'Anotar o próximo passo',
    ],
  },
  {
    key: 'routine',
    label: 'Preparar meu espaço',
    title: 'Preparar meu espaço para começar',
    steps: [
      'Escolher onde vou trabalhar',
      'Separar o que vou usar',
      'Deixar uma atividade pronta para começar',
    ],
  },
];
export const executionCopy = {
  completion: 'Esse passo é seu.',
  afterCompletion:
    'Você fez acontecer. O próximo passo pode ficar para outra hora.',
};
export const refugeCopy = {
  eyebrow: 'O que sua jornada construiu',
  description:
    'Seu progresso ganha forma aqui: ambiente, companheiros e descobertas do caminho.',
  visit: 'Visitar refúgio',
  explore: 'Explorar o Refúgio',
};
