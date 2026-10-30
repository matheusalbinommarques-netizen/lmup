/** Non-canonical chapter prototype: easily replaceable without touching XP or task rules. */
export type PilotChoice = 'help' | 'follow';
export interface PilotState {
  scene: number;
  choice?: PilotChoice;
  /** Total XP when chapter one ended, not the lifetime XP required for the chapter. */
  chapterOneEndXp?: number;
  chapterTwoUnlocked?: boolean;
  chapterTwoScene?: number;
}
export const CHAPTER_TWO_XP = 150;

export interface PilotScene {
  title: string;
  text: string;
  caption: string;
  speaker?: string;
  dialogue?: string;
  art: string;
}
export const pilotScenes: PilotScene[] = [
  {
    title: 'Uma cidade que nunca dorme',
    text: 'Védria desperta entre pontes, pregões e martelos. As torres refletem a luz da manhã, enquanto centenas de pessoas se preparam para o festival.',
    caption: 'Por enquanto, o maior acontecimento do dia parece ser a própria vida.',
    art: '/art/pilot/scene-1.webp',
  },
  {
    title: 'O festival das pontes',
    text: 'Ao cair da tarde, lanternas iluminam a praça. Uma criança interrompe a brincadeira e aponta para uma passagem interditada há gerações.',
    speaker: 'Criança',
    dialogue: 'Ei... tem alguém do outro lado!',
    caption: 'Os músicos continuam tocando. Quase ninguém percebe.',
    art: '/art/pilot/scene-2.webp',
  },
  {
    title: 'O impossível é discreto',
    text: 'Uma luz tênue percorre as pedras da passagem. Um guarda se aproxima, mas o chão vibra sob seus pés. A música se interrompe de repente.',
    speaker: 'Guarda',
    dialogue: 'Afastem-se da ponte. Agora!',
    caption: 'O silêncio dura apenas um instante; os gritos vêm logo depois.',
    art: '/art/pilot/scene-3.webp',
  },
  {
    title: 'Sob as lanternas',
    text: 'A multidão recua. Do arco interditado sai uma corrente de ar gelado, espalhando papéis e apagando tochas. O guarda tenta conter as pessoas.',
    speaker: 'Vendedora',
    dialogue: 'A passagem está fechada desde antes do meu avô nascer...',
    caption: 'Nenhum dos presentes parece ter uma explicação.',
    art: '/art/bg/bg-missoes.webp',
  },
  {
    title: 'O guarda da passagem',
    text: 'Quando a praça esvazia, você encontra o guarda ferido junto à escadaria. Da direção da ponte vêm passos que não combinam com os de uma pessoa.',
    speaker: 'Guarda',
    dialogue: 'Se for entrar... não vá sozinho.',
    caption: 'Ele tenta se levantar, mas não consegue.',
    art: '/art/pilot/scene-3.webp',
  },
  {
    title: 'Uma escolha pequena, uma consequência real',
    text: 'O guarda precisa de ajuda. Ao mesmo tempo, os passos se afastam pela galeria. Você tem poucos instantes para decidir o que fazer.',
    caption: 'Nenhuma resposta é obrigatória. A sua decisão ficará registrada neste piloto.',
    art: '/art/bg/bg-global-dungeon.webp',
  },
];

export const chapterTwoScenes: PilotScene[] = [
  {
    title: 'Ecos da passagem',
    text: 'A madrugada encontra a ponte cercada por guardas e curiosos. Alguém deixou marcas novas na pedra antiga. Não parecem ferramentas de pedreiro.',
    speaker: 'Sentinela',
    dialogue: 'Isso apareceu depois que as lanternas se apagaram. Ninguém consegue explicar.',
    caption: 'Capítulo 2: pequena demonstração de continuidade, não roteiro definitivo.',
    art: '/art/bg/bg-global-dungeon.webp',
  },
  {
    title: 'Uma lembrança inesperada',
    text: 'Um restaurador ambulante examina as marcas. Não se espanta. Em vez disso, parece reconhecer algo que preferia não encontrar novamente.',
    speaker: 'Restaurador',
    dialogue: 'Se isso voltou a acontecer, há mais coisas mudando do que essas pedras.',
    caption: 'Ele se recusa a explicar como conhece a inscrição.',
    art: '/art/pilot/scene-2.webp',
  },
  {
    title: 'Depois do primeiro passo',
    text: 'Ao longe, os sinos de Védria anunciam o amanhecer. O restaurador guarda o desenho da inscrição e parte antes que você possa fazer outra pergunta.',
    speaker: 'Restaurador',
    dialogue: 'Talvez a gente se encontre de novo. Espero que em circunstâncias melhores.',
    caption: 'Fim desta demonstração. Os próximos capítulos serão escritos depois de validarmos a experiência.',
    art: '/art/pilot/scene-1.webp',
  },
];
