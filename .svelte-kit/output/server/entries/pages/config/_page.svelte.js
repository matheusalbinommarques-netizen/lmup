import 'clsx';
import {
  U as attr_class,
  _ as attr,
  $ as clsx,
} from '../../../chunks/index2.js';
import Dexie from 'dexie';
import { e as escape_html } from '../../../chunks/context.js';
class LMUPDB extends Dexie {
  areas;
  items;
  constructor() {
    super('lmup');
    this.version(1).stores({
      areas: '++id, nome',
      items: '++id, areaId, nome, xp, done',
    });
  }
}
new LMUPDB();
function SettingsManager($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let isExporting = false;
    let isImporting = false;
    let darkEnchantment = false;
    let focusMode = false;
    let largeText = false;
    let lowStimulus = false;
    function switchClasses(enabled) {
      return enabled
        ? 'inline-flex h-7 w-12 items-center rounded-full bg-emerald-400/90 px-1 transition-colors'
        : 'inline-flex h-7 w-12 items-center rounded-full bg-slate-700/80 px-1 transition-colors';
    }
    function knobClasses(enabled) {
      return enabled
        ? 'h-5 w-5 translate-x-5 rounded-full bg-slate-950 shadow transition-transform'
        : 'h-5 w-5 translate-x-0 rounded-full bg-slate-300 shadow transition-transform';
    }
    $$renderer2.push(`<section class="w-full mb-8"><div class="config-card mx-auto max-w-3xl overflow-hidden relative"><div class="pointer-events-none absolute -inset-px bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.35),_transparent_60%)] opacity-70" aria-hidden="true"></div> <div class="relative px-6 pt-6 pb-7 md:px-8 md:pt-8 md:pb-8"><header class="mb-6"><div class="settings-subcard rounded-2xl border border-sky-500/60 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 px-4 py-4 text-center shadow-[0_0_40px_rgba(56,189,248,0.55)]"><h2 class="text-2xl md:text-3xl font-extrabold text-sky-50">Configurações &amp; Backup</h2> <p class="mx-auto mt-2 max-w-xl text-xs text-slate-200/85">Guarde seu progresso em segurança, restaure seus dados quando
            precisar e ative encantamentos para deixar a experiência mais
            confortável.</p></div></header> <div class="settings-subcard mb-6 flex flex-col gap-3 rounded-2xl border border-violet-500/60 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 px-4 py-3 shadow-[0_0_40px_rgba(168,85,247,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/25 text-violet-100">🕯️</div> <div><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Encantamento sombrio</p> <span class="rounded-full border border-violet-300/70 bg-violet-500/15 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-violet-100">Em breve</span></div> <p class="text-xs text-slate-300/80 max-w-md">Encanta o seu reino com as trevas ou com a luz. Use com cuidado.</p></div></div> <button type="button"${attr_class(clsx(switchClasses(darkEnchantment)))} role="switch"${attr('aria-checked', darkEnchantment)} aria-label="Ativar ou desativar encantamento sombrio"><span${attr_class(clsx(knobClasses(darkEnchantment)))}></span></button></div> <div class="space-y-3"><div class="settings-subcard flex flex-col gap-3 rounded-2xl border border-violet-500/60 bg-gradient-to-r from-violet-950 via-slate-900 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(168,85,247,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">📜</div> <div><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Grimório de backup</p> <span class="rounded-full border border-violet-400/60 bg-violet-500/10 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-violet-200">Raro</span></div> <p class="text-xs text-slate-300/80 max-w-md">Aprisiona as memórias do seu reino num grimório em <code>.json</code>, para que possa levar e restaurar em qualquer lugar.</p></div></div> <button type="button" class="rounded-full bg-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-violet-400 disabled:opacity-60"${attr('disabled', isExporting, true)}>${escape_html('Exportar dados')}</button></div> <div class="settings-subcard flex flex-col gap-3 rounded-2xl border border-emerald-500/60 bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(16,185,129,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">🧪</div> <div><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Ritual de restauração</p> <span class="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-emerald-200">Épico</span></div> <p class="text-xs text-slate-300/80 max-w-md">Importe um grimório em <code>.json</code> criado por um herói, para
                trazer de volta as memórias de seu reino, com suas áreas, missões
                e XP.</p> <p class="mt-1 text-[0.65rem] text-amber-200/80">Atenção: este ritual substituirá o reino atual pelo do grimório
                utilizado. E este será jogado em trevas sombrias e ranger de
                dentes!.</p></div></div> <button type="button" class="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md hover:bg-emerald-400 disabled:opacity-60"${attr('disabled', isImporting, true)}>${escape_html('Importar backup')}</button> <input type="file" accept="application/json" class="hidden"/></div> <div class="settings-subcard flex flex-col gap-3 rounded-2xl border border-sky-500/60 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-950 px-4 py-4 shadow-[0_0_40px_rgba(56,189,248,0.55)] md:flex-row md:items-center md:justify-between"><div class="flex items-start gap-3"><div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/25 text-sky-200">☁️</div> <div class="flex-1"><div class="flex items-center gap-2"><p class="text-sm font-semibold text-white">Sincronia estelar</p> <span class="rounded-full border border-sky-400/60 bg-sky-500/15 px-2 py-[1px] text-[0.6rem] font-semibold uppercase tracking-widest text-sky-200">Em breve</span></div> <p class="text-xs text-slate-200/85 max-w-md">Futuramente você poderá sincronizar seu reino com as estrelas e
                o cosmos, para nunca perder o seu reino e legado de aprendizado
                e desenvolvimento.</p></div></div> <button type="button" class="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md hover:bg-sky-400 disabled:opacity-60" disabled title="Sincronização com a nuvem será habilitada em breve">Sincronizar</button></div></div> <div class="my-6 h-px bg-gradient-to-r from-transparent via-slate-600/60 to-transparent"></div> <div class="space-y-4"><div class="rounded-2xl border border-emerald-500/70 bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-900 px-4 py-4 text-center shadow-[0_0_45px_rgba(16,185,129,0.85)]"><h2 class="text-2xl md:text-3xl font-extrabold text-emerald-100">Neurodiversidade</h2> <p class="mx-auto mt-2 max-w-xl text-xs text-emerald-50/80">Ajustes suaves para foco, legibilidade e redução de estímulos
            visuais. Pense nisso como encantamentos opcionais para o seu
            cérebro.</p></div> <div class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"><div><p class="text-sm font-semibold text-white">Modo foco</p> <p class="text-xs text-slate-300/80 max-w-md">Reduz brilhos e sombras intensas para diminuir distrações visuais.</p></div> <button type="button"${attr_class(clsx(switchClasses(focusMode)))} role="switch"${attr('aria-checked', focusMode)} aria-label="Ativar ou desativar modo foco"><span${attr_class(clsx(knobClasses(focusMode)))}></span></button></div> <div class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"><div><p class="text-sm font-semibold text-white">Texto maior</p> <p class="text-xs text-slate-300/80 max-w-md">Aumenta levemente o tamanho base das fontes para leitura mais
              confortável.</p></div> <button type="button"${attr_class(clsx(switchClasses(largeText)))} role="switch"${attr('aria-checked', largeText)} aria-label="Ativar ou desativar texto maior"><span${attr_class(clsx(knobClasses(largeText)))}></span></button></div> <div class="neuro-card flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-3"><div><p class="text-sm font-semibold text-white">Estímulos suaves</p> <p class="text-xs text-slate-300/80 max-w-md">Encurta animações e transições para que nada fique piscando por
              muito tempo na tela.</p></div> <button type="button"${attr_class(clsx(switchClasses(lowStimulus)))} role="switch"${attr('aria-checked', lowStimulus)} aria-label="Ativar ou desativar estímulos suaves"><span${attr_class(clsx(knobClasses(lowStimulus)))}></span></button></div></div></div></div></section>`);
  });
}
function _page($$renderer) {
  SettingsManager($$renderer);
}
export { _page as default };
