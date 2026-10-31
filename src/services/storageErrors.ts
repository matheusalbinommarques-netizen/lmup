export function storageError(cause: unknown, fallback: string, draft = false) {
  let current: any = cause;
  for (
    let i = 0;
    i < 4 && current;
    i++, current = current.inner ?? current.cause
  ) {
    if (current.name === 'QuotaExceededError')
      return (
        'O espaço de armazenamento está cheio. ' +
        (draft
          ? 'Seu texto continua aqui. '
          : 'Os dados anteriores não foram apagados. ') +
        'Libere espaço sem apagar os dados deste site, exporte um backup quando possível e tente novamente.'
      );
    if (
      [
        'SecurityError',
        'InvalidStateError',
        'MissingAPIError',
        'OpenFailedError',
      ].includes(current.name)
    )
      return 'Este navegador não permitiu abrir os dados locais. Tente uma janela normal com armazenamento permitido. Os dados existentes não foram apagados.';
    if (current.name === 'VersionError')
      return 'Este navegador contém dados de uma versão mais nova. Abra a versão mais recente do aplicativo; os dados não foram apagados.';
  }
  return cause instanceof Error ? cause.message : fallback;
}
