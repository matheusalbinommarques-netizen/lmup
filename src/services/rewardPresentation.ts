// Consumed once by Execution; never stored in a URL or used to grant rewards.
let pending = '';
export function celebrateReward(id: string) {
  pending = id;
}
export function takeRewardCelebration() {
  const id = pending;
  pending = '';
  return id;
}
