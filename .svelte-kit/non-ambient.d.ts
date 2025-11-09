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
      | '/art/bg/bg-cla.webp'
      | '/art/bg/bg-cofre-arcano.webp'
      | '/art/bg/bg-config.webp'
      | '/art/bg/bg-global-dungeon.webp'
      | '/art/bg/bg-hero.png'
      | '/art/bg/bg-main-shell.webp'
      | '/art/bg/bg-missoes.webp'
      | '/art/bg/bg-taverna.webp'
      | '/art/bg/eco-stage-1-seed.webp'
      | '/art/bg/eco-stage-2-sprout.webp'
      | '/art/bg/eco-stage-3-tree.webp'
      | '/art/bg/eco-stage-4-forest.webp'
      | '/art/conquistas/a fenix.png'
      | '/art/conquistas/acendendo-tocha.png'
      | '/art/conquistas/acumulador.png'
      | '/art/conquistas/arsenal-completo.png'
      | '/art/conquistas/arvore-vigorosa.png'
      | '/art/conquistas/aventureiro.png'
      | '/art/conquistas/brotando.png'
      | '/art/conquistas/caçador-missoes.png'
      | '/art/conquistas/cliente fiel.png'
      | '/art/conquistas/colecionador.png'
      | '/art/conquistas/domador-lobos.png'
      | '/art/conquistas/em-chamas.png'
      | '/art/conquistas/especialista.png'
      | '/art/conquistas/exterminador.png'
      | '/art/conquistas/focado.png'
      | '/art/conquistas/fogo-controlado.png'
      | '/art/conquistas/guardiao-foco.png'
      | '/art/conquistas/guardião-floresta.png'
      | '/art/conquistas/heroi-lendario.png'
      | '/art/conquistas/lenda-santuario.png'
      | '/art/conquistas/lenda-viva.png'
      | '/art/conquistas/mae-pai-dragao.png'
      | '/art/conquistas/magnata.png'
      | '/art/conquistas/matador-gigante.png'
      | '/art/conquistas/melhores-amigos.png'
      | '/art/conquistas/membro-fundador.png'
      | '/art/conquistas/mestre-area.png'
      | '/art/conquistas/mestre-areas.png'
      | '/art/conquistas/mestre.png'
      | '/art/conquistas/multitarefa.png'
      | '/art/conquistas/novato.png'
      | '/art/conquistas/novo-amigo.png'
      | '/art/conquistas/o-semeador.png'
      | '/art/conquistas/pao-duro.png'
      | '/art/conquistas/perito.png'
      | '/art/conquistas/polimata.png'
      | '/art/conquistas/primeira-centelha.png'
      | '/art/conquistas/primeira-compra.png'
      | '/art/conquistas/primeiro-passo.png'
      | '/art/conquistas/recruta.png'
      | '/art/conquistas/rotina-engatada.png'
      | '/art/conquistas/semideus.png'
      | '/art/conquistas/trabalho-equipe.png'
      | '/art/conquistas/veterano.png'
      | '/art/hero-avatar-default.png'
      | '/art/icones/bag-icon.png'
      | '/art/icones/book-icon.png'
      | '/art/icones/encantamento-sombrio.png'
      | '/art/icones/grimorio-backup.png'
      | '/art/icones/icon-cla.png'
      | '/art/icones/icon-config.png'
      | '/art/icones/icon-fire-streak.png'
      | '/art/icones/icon-leaf-eco.png'
      | '/art/icones/icon-missoes.png'
      | '/art/icones/icon-neurodiversity.png'
      | '/art/icones/icon-taverna.png'
      | '/art/icones/icon-xp.png'
      | '/art/icones/logo lmu.png'
      | '/art/icones/ritual-restauracao.png'
      | '/art/icones/shop-icon.png'
      | '/art/icones/sincronia-estelar.png'
      | '/art/icones/trash-icon.png'
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
