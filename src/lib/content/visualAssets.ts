import icons from './approved-icons.json';
export const approvedIcons = icons;
export const navigationIconFiles: Record<string, string> = {
  today: 'Hoje',
  missions: 'Missoes',
  recover: 'Recuperar',
  xp: 'XP',
};
export const paintings = {
  vedria: '/art/approved/paintings/01_Hoje_Vedria_panorama.webp',
  adventure: '/art/approved/paintings/02_Cartao_Aventura.webp',
  refuge: '/art/approved/paintings/03_Cartao_Refugio.webp',
  projects: '/art/approved/paintings/04_Cartao_Projetos.webp',
  map: '/art/approved/paintings/05_Cartao_Mapa.webp',
};
export function approvedIconPath(key: string | null | undefined, width = 64) {
  width = width <= 64 ? 64 : 128;
  if (key && Object.hasOwn(navigationIconFiles, key))
    return `/art/approved/navigation/${navigationIconFiles[key]}_${width}.png`;
  return key && approvedIcons.some((item) => item.key === key)
    ? `/art/approved/icons/${key}/${width}.png`
    : `/art/approved/navigation/Missoes_${width}.png`;
}

export function isTaskIconKey(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    (approvedIcons.some((item) => item.key === value) ||
      Object.hasOwn(navigationIconFiles, value))
  );
}
