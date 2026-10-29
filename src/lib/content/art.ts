import entries from './artVariants.json';
const variants: Record<string, { '160': string; '320': string }> = entries;
export function artVariants(src: string) {
  return variants[src];
}
export function optimizedArt(src: string) {
  return variants[src]?.['160'] ?? src;
}
