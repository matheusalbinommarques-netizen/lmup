export type PilotChoice = 'help' | 'follow';
export interface PilotState { scene: number; choice?: PilotChoice }
export const pilotScenes = [
  {title:'Uma cidade que nunca dorme', text:'Védria acorda entre pontes, pregões e martelos. A vida continua, mesmo quando os grandes acontecimentos parecem pertencer somente às canções.',caption:'Você não é um escolhido. Tem planos, pessoas que conhece e coisas para fazer.'},
  {title:'O festival das pontes',text:'Entre lanternas e músicos, uma criança interrompe sua corrida. Está olhando para o outro lado da praça, onde uma antiga passagem permanece fechada há gerações.',caption:'“Tem alguém do outro lado”, ela sussurra.'},
  {title:'O impossível é discreto',text:'Uma pequena luz surge sob a ponte interditada. Um guarda começa a se aproximar. Então o chão vibra — uma única vez — e a multidão fica em silêncio.',caption:'Você poderia investigar. Mas sua própria vida também precisa continuar.'},
  {title:'Seu próximo passo',text:'Nenhuma lenda resolve as coisas que você tem para fazer fora deste mundo. Conclua uma missão real à sua escolha para continuar esta experiência.',caption:'A aventura aguarda por você. Sem prazo e sem punição.'},
  {title:'O guarda da passagem',text:'Ao retornar, você encontra a praça quase vazia. Um guarda ferido está sentado junto à escadaria. Além da ponte, passos ecoam onde ninguém deveria caminhar.',caption:'O homem indica a passagem: “Não entre sozinho”.'},
  {title:'Uma escolha pequena, uma consequência real',text:'Você não sabe o que há sob a ponte. Sabe apenas que o guarda precisa de ajuda e que alguém pode estar seguindo para dentro das galerias.',caption:'A decisão que você tomar será lembrada neste pequeno piloto.'}
] as const;
