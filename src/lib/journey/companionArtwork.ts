import type { Companion } from '$services/db';
import {
  getCompanionEvolutionState,
  getCompanionStageImage,
} from '$services/companionService';
import { companionContent } from '$lib/content/world';
// Presentation choice only; evolution and availability remain in the service.
export function companionArtwork(companion: Companion | null | undefined) {
  const state = getCompanionEvolutionState(companion);
  return state?.key === 'wolf' && state.currentStage.stage === 1
    ? companionContent.wolf.pilot
    : (getCompanionStageImage(companion) ?? companion?.imagePath ?? '');
}
