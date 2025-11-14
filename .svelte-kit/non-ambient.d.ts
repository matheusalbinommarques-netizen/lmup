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
      | '/projetos'
      | '/projetos/[id]'
      | '/santuario'
      | '/trofeus';
    RouteParams(): {
      '/projetos/[id]': { id: string };
    };
    LayoutParams(): {
      '/': { id?: string };
      '/bestiario': Record<string, never>;
      '/cla': Record<string, never>;
      '/config': Record<string, never>;
      '/inventario': Record<string, never>;
      '/loja': Record<string, never>;
      '/missoes': Record<string, never>;
      '/projetos': { id?: string };
      '/projetos/[id]': { id: string };
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
      | '/projetos'
      | '/projetos/'
      | (`/projetos/${string}` & {})
      | (`/projetos/${string}/` & {})
      | '/santuario'
      | '/santuario/'
      | '/trofeus'
      | '/trofeus/';
    ResolvedPathname(): `${'' | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
    Asset():
      | '/.well-known/appspecific/com.chrome.devtools.json'
      | '/apple-touch-icon-180-transparent.png.png'
      | '/art/badge-icons/a-fenix.png'
      | '/art/badge-icons/acendendo-tocha.png'
      | '/art/badge-icons/acumulador.png'
      | '/art/badge-icons/arsenal-completo.png'
      | '/art/badge-icons/arvore-vigorosa.png'
      | '/art/badge-icons/aventureiro.png'
      | '/art/badge-icons/brotando.png'
      | '/art/badge-icons/cacador-missoes.png'
      | '/art/badge-icons/cliente-fiel.png'
      | '/art/badge-icons/colecionador.png'
      | '/art/badge-icons/domador-lobos.png'
      | '/art/badge-icons/em-chamas.png'
      | '/art/badge-icons/especialista.png'
      | '/art/badge-icons/exterminador.png'
      | '/art/badge-icons/focado.png'
      | '/art/badge-icons/fogo-controlado.png'
      | '/art/badge-icons/guardiao-foco.png'
      | '/art/badge-icons/guardião-floresta.png'
      | '/art/badge-icons/heroi-lendario.png'
      | '/art/badge-icons/lenda-santuario.png'
      | '/art/badge-icons/lenda-viva.png'
      | '/art/badge-icons/mae-pai-dragao.png'
      | '/art/badge-icons/magnata.png'
      | '/art/badge-icons/matador-gigantes.png'
      | '/art/badge-icons/melhores-amigos.png'
      | '/art/badge-icons/membro-fundador.png'
      | '/art/badge-icons/mestre-area.png'
      | '/art/badge-icons/mestre-areas.png'
      | '/art/badge-icons/mestre.png'
      | '/art/badge-icons/multitarefa.png'
      | '/art/badge-icons/novato.png'
      | '/art/badge-icons/novo-amigo.png'
      | '/art/badge-icons/o-semeador.png'
      | '/art/badge-icons/pao-duro.png'
      | '/art/badge-icons/perito.png'
      | '/art/badge-icons/polimata.png'
      | '/art/badge-icons/primeira-centelha.png'
      | '/art/badge-icons/primeira-compra.png'
      | '/art/badge-icons/primeiro-passo.png'
      | '/art/badge-icons/recruta.png'
      | '/art/badge-icons/rotina-engatada.png'
      | '/art/badge-icons/semideus.png'
      | '/art/badge-icons/trabalho-equipe.png'
      | '/art/badge-icons/veterano.png'
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
      | '/art/bg/bg-shop.webp'
      | '/art/bg/bg-taverna.webp'
      | '/art/bg/eco-stage-1-seed.webp'
      | '/art/bg/eco-stage-2-sprout.webp'
      | '/art/bg/eco-stage-3-tree.webp'
      | '/art/bg/eco-stage-4-forest.webp'
      | '/art/hero-avatar-default.png'
      | '/art/heroi.png'
      | '/art/icones/bag-icon.png'
      | '/art/icones/book-icon.png'
      | '/art/icones/encantamento-sombrio.png'
      | '/art/icones/gold-icon.png'
      | '/art/icones/grimorio-backup.png'
      | '/art/icones/icon-cla.png'
      | '/art/icones/icon-config.png'
      | '/art/icones/icon-fire-streak.png'
      | '/art/icones/icon-leaf-eco.png'
      | '/art/icones/icon-missoes.png'
      | '/art/icones/icon-neurodiversity.png'
      | '/art/icones/icon-projetos.png'
      | '/art/icones/icon-taverna.png'
      | '/art/icones/icon-xp.png'
      | '/art/icones/logo lmu.png'
      | '/art/icones/oneoff.png'
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
