<!-- src/lib/EcoPanel.svelte -->
<script lang="ts">
  import { db, type Profile, type Area, type XpLog } from '$services/db';
  import { liveQuery } from 'dexie';
  import { onMount } from 'svelte';
  import {
    ECO_STAGES,
    getEcoStageForTotalXp,
    getEcoProgressForTotalXp,
  } from '$services/ecoConfig';
  import { getHeroModifiersOnce } from '$services/gearService';

  type TopArea = {
    areaId: number;
    name: string;
    totalXp: number;
    percentOfTotal: number;
  };

  type EcoStageWithStatus = (typeof ECO_STAGES)[number] & {
    status: 'claimed' | 'available' | 'locked';
  };

  const fallbackProfile: Profile = {
    id: 1,
    name: '...',
    title: '...',
    level: 0,
    xpCurrent: 0,
    xpNext: 100,
    avatarUrl: '',
    totalXpEarned: 0,
    gold: 0,
    currentStreak: 0,
    lastCompletionDate: '',
    activeCompanionId: 1,
  };

  const hero = $state<Profile>(fallbackProfile);
  let areas = $state<Area[]>([]);
  let xpLogs = $state<XpLog[]>([]);

  // bônus extra vindo dos ANÉIS (sanctuaryBonusExtraPercent)
  let sanctuaryBonusExtraPercent = $state(0);

  const heroQuery = liveQuery(() => db.profile.get(1));
  const areasQuery = liveQuery(() => db.areas.toArray());
  const xpLogsQuery = liveQuery(() => db.xpLogs.toArray());

  onMount(() => {
    const heroSub = heroQuery.subscribe((profileData) => {
      Object.assign(hero, profileData || fallbackProfile);
    });

    const areasSub = areasQuery.subscribe((rows) => {
      areas = rows ?? [];
    });

    const logsSub = xpLogsQuery.subscribe((rows) => {
      xpLogs = rows ?? [];
    });

    // Carrega modificadores do herói (gear equipado) para saber o bônus extra do Santuário
    (async () => {
      try {
        const mods = await getHeroModifiersOnce();
        sanctuaryBonusExtraPercent = mods.sanctuaryBonusExtraPercent ?? 0;
      } catch (error) {
        console.error('Erro ao carregar HeroModifiers no EcoPanel:', error);
        sanctuaryBonusExtraPercent = 0;
      }
    })();

    return () => {
      heroSub.unsubscribe();
      areasSub.unsubscribe();
      logsSub.unsubscribe();
    };
  });

  // --- Derivados principais do Santuário ---

  const totalXp = $derived(hero.totalXpEarned ?? 0);

  const ecoStage = $derived(getEcoStageForTotalXp(totalXp));
  const ecoProgress = $derived(getEcoProgressForTotalXp(totalXp));

  // Bônus base do estágio (sem anel)
  const baseEcoBonusPercent = $derived(
    Math.round(((ecoStage.xpBonusMultiplier ?? 1) - 1) * 100),
  );

  const ecoBonusExtraFromGear = $derived(sanctuaryBonusExtraPercent || 0);

  // Bônus total aplicado nas missões (estágio + anéis)
  const ecoBonusTotalPercent = $derived(
    Math.max(0, baseEcoBonusPercent + ecoBonusExtraFromGear),
  );

  const hasExtraEcoBonus = $derived(ecoBonusExtraFromGear > 0);

  // meta salvo no profile pelo xpService (opcional, via "any")
  const ecoGoldClaimedUpToStage = $derived.by<number>(() => {
    const meta = hero as any;
    const raw = meta?.ecoGoldClaimedUpToStage;

    if (typeof raw === 'number' && raw >= 1) {
      return raw;
    }

    // por padrão, assumimos que o estágio 1 já está "claimado"
    return 1;
  });

  const ecoStagesWithStatus = $derived.by<EcoStageWithStatus[]>(() => {
    const current = ecoStage;
    const claimedUpTo = ecoGoldClaimedUpToStage;

    return ECO_STAGES.map((stage) => {
      let status: EcoStageWithStatus['status'];

      if (stage.id <= claimedUpTo) {
        status = 'claimed';
      } else if (stage.id <= current.id) {
        status = 'available';
      } else {
        status = 'locked';
      }

      return { ...stage, status };
    });
  });

  // --- Árvore de Área em Destaque (últimos ~30 dias) ---

  const topAreas = $derived.by<TopArea[]>(() => {
    if (!xpLogs.length) return [];

    const now = new Date();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const cutoff = new Date(now.getTime() - THIRTY_DAYS_MS);

    const sumByArea: Record<number, number> = {};

    for (const log of xpLogs) {
      const amount = Number(log.amount) || 0;
      if (amount <= 0) continue;

      let createdAt: Date;

      if (log.createdAt instanceof Date) {
        createdAt = log.createdAt;
      } else if (typeof log.createdAt === 'string') {
        createdAt = new Date(log.createdAt);
      } else if (typeof log.date === 'string') {
        createdAt = new Date(log.date);
      } else {
        continue;
      }

      if (createdAt.getTime() < cutoff.getTime()) continue;

      const rawId = log.areaId ?? 0;
      const areaId = Number.isFinite(rawId as number) ? (rawId as number) : 0;

      sumByArea[areaId] = (sumByArea[areaId] ?? 0) + amount;
    }

    const entries = Object.entries(sumByArea).map(([idStr, total]) => {
      const areaId = Number(idStr);
      const areaObj = areas.find((a) => a.id === areaId);

      const name =
        areaId === 0
          ? 'Geral'
          : areaObj?.nome?.trim() || `Área #${areaId.toString()}`;

      return {
        areaId,
        name,
        totalXp: total,
      };
    });

    if (!entries.length) return [];

    const totalAll = entries.reduce((acc, e) => acc + e.totalXp, 0) || 1;

    entries.sort((a, b) => b.totalXp - a.totalXp);

    return entries.slice(0, 3).map((e) => ({
      ...e,
      percentOfTotal: Math.round((e.totalXp / totalAll) * 100),
    }));
  });
</script>

<section
  class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col gap-5"
>
  <!-- Layout principal: imagem + painel lateral -->
  <div class="flex flex-col gap-4 md:flex-row">
    <!-- Bloco da imagem / progresso -->
    <div class="md:w-2/3 flex flex-col gap-3">
      <img
        src={ecoStage.image}
        alt={ecoStage.label}
        class="w-full h-68 object-cover rounded-lg border border-slate-700/50 shadow-inner"
      />

      <div>
        <div
          class="flex items-center justify-between text-xs text-slate-400 mb-1"
        >
          <span class="font-medium text-slate-300">
            Estágio do Santuário:
            <span class="text-emerald-300">{ecoStage.label}</span>
          </span>

          <span
            class="inline-flex items-center gap-1 font-medium text-slate-200"
          >
            <img
              src="/art/icones/icon-xp.png"
              alt="XP"
              class="h-4 w-4 object-contain"
            />
            {#if ecoStage.maxXp != null}
              <span>
                {totalXp.toLocaleString()} /
                {ecoStage.maxXp.toLocaleString()}
              </span>
            {:else}
              <span>{totalXp.toLocaleString()} (Máx)</span>
            {/if}
          </span>
        </div>

        <div
          class="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50"
        >
          <div
            class="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-500"
            style={`width: ${Math.max(0, Math.min(100, ecoProgress)).toFixed(
              1,
            )}%;`}
          ></div>
        </div>

        <p class="mt-1 text-[0.7rem] text-slate-400">
          Progresso dentro do estágio atual do Santuário. O bônus de XP aumenta
          conforme você evolui — e pode ser turbinado por anéis especiais.
        </p>
      </div>
    </div>

    <!-- Painel lateral: Bênçãos & Recompensas -->
    <aside class="md:w-1/3 flex flex-col gap-3">
      <!-- Bênçãos do Santuário -->
      <div
        class="rounded-xl border border-emerald-500/40 bg-slate-950/70 px-3 py-3 flex flex-col gap-2"
      >
        <h3
          class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300"
        >
          Bênçãos do Santuário
        </h3>

        <p class="text-[0.8rem] text-slate-200">
          Bônus permanente de XP:
          <span class="font-semibold text-emerald-300">
            +{ecoBonusTotalPercent}%
          </span>
          em todas as missões.
        </p>

        <p class="text-[0.7rem] text-slate-400">
          O bônus é aplicado automaticamente sempre que você ganha XP. Ouro é
          calculado em cima do XP final, então o Santuário também turbina seu
          Gold.
        </p>

        {#if hasExtraEcoBonus}
          <p class="mt-1 text-[0.7rem] text-emerald-200/90">
            Detalhe do bônus atual:
            <br />
            • Santuário (estágio): +{baseEcoBonusPercent}% XP
            <br />
            • Anéis equipados: +{ecoBonusExtraFromGear}% XP
            <br />
            • Total aplicado: +{ecoBonusTotalPercent}% XP
          </p>
        {/if}

        <div class="mt-2 space-y-1.5 text-[0.7rem]">
          {#each ECO_STAGES as stage (stage.id)}
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span
                  class="inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.6rem]
                    {ecoStage.id >= stage.id
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-950/60'
                    : 'border-slate-700 text-slate-400 bg-slate-900'}"
                >
                  {stage.id}
                </span>
                <span
                  class="font-medium {ecoStage.id >= stage.id
                    ? 'text-slate-100'
                    : 'text-slate-400'}"
                >
                  {stage.label}
                </span>
              </div>
              <span class="text-slate-400">
                +{Math.round((stage.xpBonusMultiplier - 1) * 100)}% XP base
              </span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Recompensas de Gold por Estágio -->
      <div
        class="rounded-xl border border-amber-500/40 bg-slate-950/70 px-3 py-3 flex flex-col gap-2"
      >
        <h3
          class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300"
        >
          Recompensas do Santuário
        </h3>
        <p class="text-[0.7rem] text-slate-300">
          Ao alcançar cada estágio, você já recebeu (ou receberá) um baú único
          de Gold:
        </p>

        <div class="mt-1 space-y-1.5 text-[0.7rem]">
          {#each ecoStagesWithStatus as stage (stage.id)}
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-base">
                  {#if stage.status === 'claimed'}
                    ✅
                  {:else if stage.status === 'available'}
                    🎁
                  {:else}
                    🔒
                  {/if}
                </span>
                <span
                  class="font-medium {stage.status === 'locked'
                    ? 'text-slate-500'
                    : 'text-slate-100'}"
                >
                  {stage.label}
                </span>
              </div>
              <span
                class={stage.status === 'claimed'
                  ? 'text-amber-300'
                  : stage.status === 'available'
                    ? 'text-amber-200'
                    : 'text-slate-500'}
              >
                +{stage.goldRewardOnEnter} Gold
              </span>
            </div>
          {/each}
        </div>

        <p class="mt-1 text-[0.65rem] text-slate-500">
          Essas recompensas são automáticas e só são dadas uma vez por estágio,
          mesmo que você saia e volte do jogo.
        </p>
      </div>
    </aside>
  </div>

  <!-- Árvore de Área em Destaque -->
  <div
    class="mt-1 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 flex flex-col gap-2"
  >
    <div
      class="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between"
    >
      <h3 class="text-sm font-semibold text-slate-100">
        🌱 Árvore de Área em Destaque
      </h3>
      <p class="text-[0.7rem] text-slate-400 md:max-w-md">
        Mostra quais áreas mais alimentaram o Santuário nos últimos ~30 dias.
        Quanto mais XP uma área gera, mais ela "rega" sua floresta.
      </p>
    </div>

    {#if topAreas.length > 0}
      <div class="mt-2 space-y-2">
        {#each topAreas as area (area.areaId)}
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[0.75rem]">
              <span class="font-medium text-slate-100">{area.name}</span>
              <span class="text-slate-400">
                +{area.totalXp.toLocaleString()} XP
                <span class="text-slate-500"> • {area.percentOfTotal}%</span>
              </span>
            </div>
            <div
              class="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800/60"
            >
              <div
                class="h-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                style={`width: ${Math.max(
                  5,
                  Math.min(100, area.percentOfTotal),
                )}%;`}
              ></div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="mt-2 text-[0.7rem] text-slate-500">
        Ainda não há XP suficiente registrado para destacar áreas. Complete
        algumas missões para começar a ver a floresta ganhar forma.
      </p>
    {/if}
  </div>
</section>
