// this file is generated — do not edit it

declare module 'svelte/elements' {
  export interface HTMLAttributes<T> {
    'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
    'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
    'data-sveltekit-preload-code'?:
      | true
      | ''
      | 'eager'
      | 'viewport'
      | 'hover'
      | 'tap'
      | 'off'
      | undefined
      | null;
    'data-sveltekit-preload-data'?:
      | true
      | ''
      | 'hover'
      | 'tap'
      | 'off'
      | undefined
      | null;
    'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
    'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
  }
}

export {};

declare module '$app/types' {
  export interface AppTypes {
    RouteId():
      | '/'
      | '/bestiario'
      | '/cla'
      | '/config'
      | '/inventario'
      | '/loja'
      | '/missoes'
      | '/santuario'
      | '/trofeus';
    RouteParams(): {};
    LayoutParams(): {
      '/': Record<string, never>;
      '/bestiario': Record<string, never>;
      '/cla': Record<string, never>;
      '/config': Record<string, never>;
      '/inventario': Record<string, never>;
      '/loja': Record<string, never>;
      '/missoes': Record<string, never>;
      '/santuario': Record<string, never>;
      '/trofeus': Record<string, never>;
    };
    Pathname():
      | '/'
      | '/bestiario'
      | '/bestiario/'
      | '/cla'
      | '/cla/'
      | '/config'
      | '/config/'
      | '/inventario'
      | '/inventario/'
      | '/loja'
      | '/loja/'
      | '/missoes'
      | '/missoes/'
      | '/santuario'
      | '/santuario/'
      | '/trofeus'
      | '/trofeus/';
    ResolvedPathname(): `${'' | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
    Asset():
      | '/.well-known/appspecific/com.chrome.devtools.json'
      | '/apple-touch-icon-180-transparent.png.png'
      | '/art/badges/badge-comum.png'
      | '/art/badges/badge-em-breve.png'
      | '/art/badges/badge-epico.png'
      | '/art/badges/badge-legendary.png'
      | '/art/badges/badge-raro.png'
      | '/art/banner-missions-title.png'
      | '/art/bg/bg-cofre-arcano.webp'
      | '/art/bg/bg-global-dungeon.webp'
      | '/art/bg/bg-hero.png'
      | '/art/bg/bg-main-shell.webp'
      | '/art/bg/bg-taverna.png'
      | '/art/bg/eco-stage-1-seed.webp'
      | '/art/bg/eco-stage-2-sprout.webp'
      | '/art/bg/eco-stage-3-tree.webp'
      | '/art/bg/eco-stage-4-forest.webp'
      | '/art/Conquistas/a fenix.png'
      | '/art/Conquistas/acendendo-tocha.png'
      | '/art/Conquistas/acumulador.png'
      | '/art/Conquistas/arsenal-completo.png'
      | '/art/Conquistas/arvore-vigorosa.png'
      | '/art/Conquistas/aventureiro.png'
      | '/art/Conquistas/brotando.png'
      | '/art/Conquistas/caçador-missoes.png'
      | '/art/Conquistas/cliente fiel.png'
      | '/art/Conquistas/colecionador.png'
      | '/art/Conquistas/domador-lobos.png'
      | '/art/Conquistas/em-chamas.png'
      | '/art/Conquistas/especialista.png'
      | '/art/Conquistas/exterminador.png'
      | '/art/Conquistas/focado.png'
      | '/art/Conquistas/fogo-controlado.png'
      | '/art/Conquistas/guardiao-foco.png'
      | '/art/Conquistas/guardião-floresta.png'
      | '/art/Conquistas/heroi-lendario.png'
      | '/art/Conquistas/lenda-santuario.png'
      | '/art/Conquistas/lenda-viva.png'
      | '/art/Conquistas/mae-pai-dragao.png'
      | '/art/Conquistas/magnata.png'
      | '/art/Conquistas/matador-gigante.png'
      | '/art/Conquistas/melhores-amigos.png'
      | '/art/Conquistas/membro-fundador.png'
      | '/art/Conquistas/mestre-area.png'
      | '/art/Conquistas/mestre-areas.png'
      | '/art/Conquistas/mestre.png'
      | '/art/Conquistas/multitarefa.png'
      | '/art/Conquistas/novato.png'
      | '/art/Conquistas/novo-amigo.png'
      | '/art/Conquistas/o-semeador.png'
      | '/art/Conquistas/pao-duro.png'
      | '/art/Conquistas/perito.png'
      | '/art/Conquistas/polimata.png'
      | '/art/Conquistas/primeira-centelha.png'
      | '/art/Conquistas/primeira-compra.png'
      | '/art/Conquistas/primeiro-passo.png'
      | '/art/Conquistas/recruta.png'
      | '/art/Conquistas/rotina-engatada.png'
      | '/art/Conquistas/semideus.png'
      | '/art/Conquistas/trabalho-equipe.png'
      | '/art/Conquistas/veterano.png'
      | '/art/hero-avatar-default.png'
      | '/art/icones/bag-icon.png'
      | '/art/icones/book-icon.png'
      | '/art/icones/icon-backup.png'
      | '/art/icones/icon-cla.png'
      | '/art/icones/icon-cloud-sync.png'
      | '/art/icones/icon-config.png'
      | '/art/icones/icon-fire-streak.png'
      | '/art/icones/icon-leaf-eco.png'
      | '/art/icones/icon-missoes.png'
      | '/art/icones/icon-neurodiversity.png'
      | '/art/icones/icon-restore.png'
      | '/art/icones/icon-taverna.png'
      | '/art/icones/icon-xp.png'
      | '/art/icones/logo lmu.png'
      | '/art/icones/shop-icon.png'
      | '/art/icones/trophy-icon.png'
      | '/art/nav-wood-bar.png'
      | '/art/pets/pet-aberration-final.png'
      | '/art/pets/pet-dragon-final.png'
      | '/art/pets/pet-lich-final.png'
      | '/art/pets/pet-wolf-final.png'
      | '/art/tasks/card-mission-common.png'
      | '/art/tasks/card-mission-epic.png'
      | '/art/tasks/card-mission-legendary.png'
      | '/favicon-shield.ico'
      | '/pwa-192x192.png'
      | '/pwa-512x512-maskable.png'
      | '/pwa-512x512.png'
      | (string & {});
  }
}
