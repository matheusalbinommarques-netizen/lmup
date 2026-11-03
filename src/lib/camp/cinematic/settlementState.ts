export type CampSettlementState = {
  version: 1;
  epoch: string;
  revision: number;
  caretakerMet: boolean;
  residenceBuilt: boolean;
};
export function validateCampSettlement(
  value: unknown,
): asserts value is CampSettlementState {
  const state = value as CampSettlementState | null;
  if (
    !state ||
    typeof state !== 'object' ||
    Array.isArray(state) ||
    state.version !== 1 ||
    typeof state.epoch !== 'string' ||
    !state.epoch ||
    !Number.isSafeInteger(state.revision) ||
    state.revision < 0 ||
    typeof state.caretakerMet !== 'boolean' ||
    typeof state.residenceBuilt !== 'boolean' ||
    (state.residenceBuilt && !state.caretakerMet) ||
    Object.keys(state).some(
      (key) =>
        ![
          'version',
          'epoch',
          'revision',
          'caretakerMet',
          'residenceBuilt',
        ].includes(key),
    )
  )
    throw Error('Estado do acampamento inválido. Os dados foram preservados.');
}
