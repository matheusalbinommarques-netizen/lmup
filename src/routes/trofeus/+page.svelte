<script lang="ts">
  type TrophyRarity = 'common' | 'rare' | 'epic' | 'legendary';

  interface Trophy {
    id: number;
    name: string;
    description: string;
    rarity: TrophyRarity;
    icon: string;
    requirement: string;
    achieved: boolean;
  }

  const rarityLabels: Record<TrophyRarity, string> = {
    common: 'Comum',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Lendário',
  };

  const rarityClasses: Record<TrophyRarity, string> = {
    common:
      'border-slate-600/80 bg-slate-900/80 text-slate-200 shadow-sm shadow-slate-900/40',
    rare: 'border-blue-500/70 bg-slate-900/85 text-blue-100 shadow-lg shadow-blue-500/30',
    epic: 'border-purple-500/80 bg-slate-900/90 text-purple-100 shadow-lg shadow-purple-500/40',
    legendary:
      'border-amber-400/90 bg-slate-950 text-amber-100 shadow-xl shadow-amber-400/50',
  };

  function getRarityLabel(r: TrophyRarity): string {
    return rarityLabels[r];
  }

  function getRarityClass(r: TrophyRarity): string {
    return rarityClasses[r];
  }

  const trophies: Trophy[] = [
    {
      id: 1,
      name: 'Primeira Centelha',
      description: 'Completar a sua primeira missão no Quadro de Missões.',
      rarity: 'common',
      icon: '/art/badges/badge-comum.png',
      requirement: 'Conclua 1 missão.',
      achieved: true,
    },
    {
      id: 2,
      name: 'Rotina Engatada',
      description:
        'Começar a criar consistência e voltar à taverna com frequência.',
      rarity: 'rare',
      icon: '/art/badges/badge-raro.png',
      requirement: 'Conclua 10 missões no total.',
      achieved: true,
    },
    {
      id: 3,
      name: 'Guardião do Foco',
      description:
        'Manter o fogo aceso por vários dias seguidos, sem deixar a chama apagar.',
      rarity: 'epic',
      icon: '/art/badges/badge-epico.png',
      requirement: 'Mantenha um streak de 7 dias (sem quebrar).',
      achieved: false,
    },
    {
      id: 4,
      name: 'Herói Lendário',
      description:
        'Provar que você não está só de passagem: atingir um marco épico de XP.',
      rarity: 'legendary',
      icon: '/art/badges/badge-legendary.png',
      requirement: 'Alcance 10.000 XP acumulado.',
      achieved: false,
    },
    {
      id: 5,
      name: 'Mestre das Áreas',
      description:
        'Explorar mais de uma frente ao mesmo tempo, sem focar apenas em um tipo de missão.',
      rarity: 'rare',
      icon: '/art/badges/badge-raro.png',
      requirement: 'Completar missões em 4 áreas de foco diferentes.',
      achieved: false,
    },
    {
      id: 6,
      name: 'Lenda do Santuário',
      description:
        'Fazer o ecossistema florescer até seu auge, cuidando da árvore ao longo de toda a jornada.',
      rarity: 'epic',
      icon: '/art/badges/badge-epico.png',
      requirement: 'Alcançar o último estágio do Santuário.',
      achieved: false,
    },
  ];

  const upcomingTrophies: Trophy[] = [
    {
      id: 7,
      name: 'Em Breve...',
      description:
        'Novos troféus e desafios serão adicionados conforme o reino evoluir.',
      rarity: 'common',
      icon: '/art/badges/badge-em-breve.png',
      requirement: 'Aguarde as próximas atualizações.',
      achieved: false,
    },
  ];
</script>

<div class="flex flex-col gap-6 pb-8">
  <header class="text-center">
    <h1 class="text-3xl font-bold text-[#ffb74d] drop-shadow-sm font-serif">
      Sala de Troféus
    </h1>
    <p class="text-slate-400">
      Aqui ficam registradas as suas conquistas, lendas pessoais e marcas da sua
      jornada.
    </p>
  </header>

  <section
    class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4"
  >
    <div class="flex-1 text-sm text-slate-300">
      <p>
        Cada troféu representa um pedaço da sua história: dias focados, hábitos
        criados, desafios vencidos. Não é sobre perfeição, é sobre constância.
      </p>
      <p class="mt-2 text-xs text-slate-500">
        No futuro, estes troféus poderão se conectar com o seu perfil, pets e
        até com a Taverna, destravando visuais e efeitos especiais.
      </p>
    </div>

    <div
      class="flex flex-col items-stretch gap-2 text-xs text-slate-400 min-w-[190px]"
    >
      <div
        class="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800"
      >
        <span>Conquistas ativas</span>
        <span class="font-semibold text-slate-100">
          {trophies.filter((t) => t.achieved).length}
          <span class="text-slate-500">
            /
            {trophies.length}
          </span>
        </span>
      </div>
      <div
        class="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[0.7rem]"
      >
        <p class="text-slate-300 font-semibold">Como desbloquear?</p>
        <p class="text-slate-500 mt-1">
          Continue completando missões, mantendo streaks e evoluindo no
          Santuário. A Sala de Troféus se atualiza conforme você progride.
        </p>
      </div>
    </div>
  </section>

  <section class="space-y-6">
    <div class="space-y-3">
      <h2 class="text-sm font-semibold text-slate-300 flex items-center gap-2">
        <span class="text-base">🏆</span>
        Conquistas Atuais
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {#each trophies as trophy (trophy.id)}
          <article
            class={`rounded-2xl border p-4 flex flex-col gap-3 ${getRarityClass(
              trophy.rarity,
            )} ${trophy.achieved ? '' : 'opacity-60 grayscale'}`}
          >
            <div class="flex items-start gap-3">
              <div
                class="relative w-12 h-12 shrink-0 flex items-center justify-center"
              >
                <img
                  src={trophy.icon}
                  alt={getRarityLabel(trophy.rarity)}
                  class="w-full h-full object-contain"
                />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <h3 class="font-semibold text-sm">
                      {trophy.name}
                    </h3>
                    <p
                      class="text-[0.7rem] uppercase tracking-widest text-slate-400"
                    >
                      {getRarityLabel(trophy.rarity)}
                    </p>
                  </div>
                  <div
                    class={`px-2 py-1 rounded-full text-[0.7rem] ${
                      trophy.achieved
                        ? 'bg-emerald-500/15 border border-emerald-400/60 text-emerald-200'
                        : 'bg-slate-950/70 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {trophy.achieved ? 'Conquistado' : 'Não conquistado'}
                  </div>
                </div>

                <p class="text-xs text-slate-200 leading-relaxed mt-2">
                  {trophy.description}
                </p>
                <p class="text-[0.7rem] text-slate-400 mt-1">
                  <span class="text-slate-500 mr-1">Requisito:</span>
                  {trophy.requirement}
                </p>
              </div>
            </div>
          </article>
        {/each}
      </div>
    </div>

    <div class="space-y-3">
      <h2 class="text-sm font-semibold text-slate-300 flex items-center gap-2">
        <span class="text-base">✨</span>
        Futuras Lendas
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {#each upcomingTrophies as trophy (trophy.id)}
          <article
            class="rounded-2xl border border-slate-700/80 bg-slate-900/70 text-slate-300 shadow-inner p-4 flex flex-col gap-3 opacity-70"
          >
            <div class="flex items-start gap-3">
              <div
                class="relative w-12 h-12 shrink-0 flex items-center justify-center"
              >
                <img
                  src={trophy.icon}
                  alt="Em breve"
                  class="w-full h-full object-contain"
                />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-sm">
                  {trophy.name}
                </h3>
                <p class="text-xs text-slate-300 mt-1 leading-relaxed">
                  {trophy.description}
                </p>
                <p class="text-[0.7rem] text-slate-500 mt-1">
                  {trophy.requirement}
                </p>
              </div>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>
</div>
