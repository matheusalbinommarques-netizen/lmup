// Serviço bem simples só para tipagem e funcionalidade local
// Ajuste se seu serviço real for diferente.

let totalXp = 0;
let streak = 0;

export function getTotalXp() {
  return totalXp;
}

export function getStreak() {
  return streak;
}

export function addXp(amount: number) {
  totalXp += amount;
  return totalXp;
}

export function checkStreak() {
  // placeholder: incremente ou valide streak aqui
  streak = Math.max(1, streak);
}
