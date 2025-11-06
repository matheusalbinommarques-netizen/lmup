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
    RouteId(): '/' | '/config';
    RouteParams(): {};
    LayoutParams(): {
      '/': Record<string, never>;
      '/config': Record<string, never>;
    };
    Pathname(): '/' | '/config' | '/config/';
    ResolvedPathname(): `${'' | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
    Asset():
      | '/.well-known/appspecific/com.chrome.devtools.json'
      | '/apple-touch-icon-180-transparent.png.png'
      | '/art/badges/badge-em-breve.png'
      | '/art/badges/badge-epico.png'
      | '/art/badges/badge-legendary.png'
      | '/art/badges/badge-raro.png'
      | '/art/banner-missions-title.png'
      | '/art/bg/bg-cofre-arcano.png'
      | '/art/bg/bg-global-dungeon.webp'
      | '/art/bg/bg-hero.png'
      | '/art/bg/bg-main-shell.png'
      | '/art/bg/bg-taverna.png'
      | '/art/bg/eco-stage-1-seed.webp'
      | '/art/bg/eco-stage-2-sprout.webp'
      | '/art/bg/eco-stage-3-tree.webp'
      | '/art/bg/eco-stage-4-forest.webp'
      | '/art/hero-avatar-default.png'
      | '/art/icones/icon-backup.png'
      | '/art/icones/icon-cla.png'
      | '/art/icones/icon-cloud-sync.png'
      | '/art/icones/icon-fire-streak.png'
      | '/art/icones/icon-leaf-eco.png'
      | '/art/icones/icon-missoes.png'
      | '/art/icones/icon-neurodiversity.png'
      | '/art/icones/icon-restore.png'
      | '/art/icones/icon-taverna.png'
      | '/art/icones/icon-xp.png'
      | '/art/icones/logo lmu.png'
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
