// "1 missão", "2 missões": the noun follows the count.
export function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}
