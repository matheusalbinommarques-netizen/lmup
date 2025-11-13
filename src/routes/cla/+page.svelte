<!-- src/routes/cla/+page.svelte -->
<script lang="ts">
  import { db, type Profile } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import PageTitleCard from '$lib/PageTitleCard.svelte';

  // --- 1. DADOS MOCKADOS (Simulados) ---
  const clanInfo = {
    name: 'Guardiões do Código',
    description: 'Focados em evoluir 1% a cada dia, sem bugs e sem desculpas.',
    level: 12,
    members: 24,
    banner: '/art/icones/icon-cla.png',
  };

  const otherPlayers = [
    {
      id: 101,
      name: 'Elara Luafera',
      level: 8,
      xpCurrent: 4500,
      title: 'Arquimaga Sênior',
    },
    {
      id: 102,
      name: 'Grommash',
      level: 7,
      xpCurrent: 3950,
      title: 'Devorador de Bugs',
    },
    {
      id: 103,
      name: 'Lyra Lâmina Ágil',
      level: 7,
      xpCurrent: 3800,
      title: 'Refatoradora Chefe',
    },
    {
      id: 104,
      name: 'Kaelthas',
      level: 4,
      xpCurrent: 2100,
      title: 'Estagiário Promissor',
    },
    {
      id: 105,
      name: 'Thorgal',
      level: 4,
      xpCurrent: 1900,
      title: 'Mestre Cervejeiro',
    },
  ];

  // --- 2. DADOS VIVOS (Seu Herói) ---
  const fallbackProfile: Profile = {
    id: 1,
    name: 'Carregando...',
    title: '...',
    level: 0,
    xpCurrent: 0,
    xpNext: 100,
    avatarUrl: '',
    totalXpEarned: 0,
    currentStreak: 0,
    lastCompletionDate: '',
    activeCompanionId: 1,
    gold: 0, // 👈 campo exigido pelo tipo Profile
  };

  const hero = $state<Profile>(fallbackProfile);

  const heroQuery = liveQuery(() => db.profile.get(1));

  onMount(() => {
    const subscription = heroQuery.subscribe((profileData) => {
      Object.assign(hero, profileData || fallbackProfile);
    });
    return () => subscription.unsubscribe();
  });

  // --- 3. TIPOS E LEADERBOARD ---
  type ClanPlayer = {
    id: number;
    name: string;
    level: number;
    xpCurrent: number;
    title: string;
    isUser: boolean;
    avatarUrl?: string;
    rank: number;
  };

  const leaderboard: ClanPlayer[] = $derived(
    (() => {
      const mockedPlayers: ClanPlayer[] = otherPlayers.map((p, index) => ({
        id: p.id,
        name: p.name,
        level: p.level,
        xpCurrent: p.xpCurrent,
        title: p.title,
        isUser: false,
        avatarUrl: undefined,
        rank: index + 1,
      }));

      const userPlayer: ClanPlayer = {
        id: hero.id ?? 1,
        name: hero.name,
        level: hero.level,
        // XP TOTAL para bater com a coluna "XP Total"
        xpCurrent: hero.totalXpEarned ?? hero.xpCurrent,
        title: hero.title,
        isUser: true,
        avatarUrl: hero.avatarUrl,
        rank: 0,
      };

      const allPlayers: ClanPlayer[] = [...mockedPlayers, userPlayer];

      allPlayers.sort((a, b) => b.xpCurrent - a.xpCurrent);

      return allPlayers.map((player, index) => ({
        ...player,
        rank: index + 1,
      }));
    })(),
  );

  function getRankStyle(rank: number) {
    if (rank === 1) return 'text-yellow-400 font-bold';
    if (rank === 2) return 'text-slate-300 font-bold';
    if (rank === 3) return 'text-amber-600 font-bold';
    return 'text-slate-400';
  }
</script>

<div class="min-h-full lmup-bg-cla bg-slate-950/60">
  <div class="flex flex-col gap-6">
    <PageTitleCard
      title="Salão do Clã"
      subtitle="Junte-se aos seus irmãos de batalha e conquistem o mundo juntos!"
      align="center"
    />

    <section
      class="relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 p-6 lg:p-8 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left"
    >
      <div
        class="shrink-0 w-24 h-24 lg:w-32 lg:h-32 bg-slate-950 rounded-2xl border-2 border-[#ffb74d]/30 flex items-center justify-center text-5xl lg:text-6xl shadow-lg p-4"
      >
        <img src={clanInfo.banner} alt="Brasão do Clã" class="opacity-80" />
      </div>
      <div class="flex-1 relative z-10">
        <div class="flex flex-col md:flex-row md:items-center gap-2 mb-2">
          <h2 class="text-2xl lg:text-3xl font-bold text-slate-100">
            {clanInfo.name}
          </h2>
          <span
            class="self-center md:self-auto px-3 py-1 rounded-full bg-[#ffb74d]/10 text-[#ffb74d] text-xs font-bold border border-[#ffb74d]/20"
          >
            Nível {clanInfo.level}
          </span>
        </div>
        <p class="text-slate-400 text-sm lg:text-base max-w-2xl mb-6">
          "{clanInfo.description}"
        </p>
        <div
          class="flex items-center justify-center md:justify-start gap-6 text-sm"
        >
          <div class="flex items-center gap-2 text-slate-300">
            <span class="text-lg">👥</span>
            <span><strong>{clanInfo.members}</strong> Membros</span>
          </div>
          <div class="flex items-center gap-2 text-slate-300">
            <span class="text-lg">⚔️</span>
            <span><strong>Top 10%</strong> Global</span>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-slate-200 font-serif">
          Ranking da Temporada
        </h3>
        <button class="text-sm text-primary hover:underline">Ver Todos</button>
      </div>

      <div
        class="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead
              class="bg-slate-950/50 text-slate-400 uppercase text-xs tracking-wider font-medium"
            >
              <tr>
                <th class="px-4 py-3 lg:px-6">Rank</th>
                <th class="px-4 py-3 lg:px-6 w-full">Herói</th>
                <th class="px-4 py-3 lg:px-6 text-right">Nível</th>
                <th class="px-4 py-3 lg:px-6 text-right">XP Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              {#each leaderboard as player (player.id)}
                <tr
                  class="transition-colors {player.isUser
                    ? 'bg-primary/10 hover:bg-primary/15'
                    : 'hover:bg-slate-800/30'}"
                >
                  <td
                    class="px-4 py-4 lg:px-6 whitespace-nowrap text-base {getRankStyle(
                      player.rank,
                    )}"
                  >
                    #{player.rank}
                  </td>
                  <td
                    class="px-4 py-4 lg:px-6 font-medium flex items-center gap-3 {player.isUser
                      ? 'text-[#ffb74d]'
                      : 'text-slate-200'}"
                  >
                    <div
                      class="relative w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs overflow-hidden"
                    >
                      {#if player.isUser && player.avatarUrl}
                        <img
                          src={player.avatarUrl}
                          alt={player.name}
                          class="w-full h-full object-cover"
                        />
                        <img
                          src="/art/hero-avatar-default.png"
                          alt="Moldura do Avatar"
                          class="absolute inset-0 w-full h-full pointer-events-none scale-[1.50]"
                        />
                      {:else if player.isUser}
                        <img
                          src="/art/hero-avatar-default.png"
                          alt="Seu Avatar"
                          class="w-full h-full object-cover scale-[1.50]"
                        />
                      {:else}
                        <span>{player.name[0]}</span>
                      {/if}
                    </div>
                    {player.name}
                    {#if player.isUser}
                      <span
                        class="text-[10px] px-1.5 py-0.5 bg-[#ffb74d]/20 text-[#ffb74d] rounded font-bold ml-2"
                      >
                        VOCÊ
                      </span>
                    {/if}
                  </td>
                  <td class="px-4 py-4 lg:px-6 text-right text-slate-400">
                    {player.level}
                  </td>
                  <td
                    class="px-4 py-4 lg:px-6 text-right font-mono text-slate-300"
                  >
                    {player.xpCurrent.toLocaleString()}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</div>
