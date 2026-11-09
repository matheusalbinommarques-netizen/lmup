import { mergeConfig } from 'vitest/config';
import base from '../../vitest.config.js';

export default mergeConfig(base, {
  plugins: [
    {
      name: 'audit-m06-in-memory',
      enforce: 'pre',
      transform(code, id) {
        if (
          !id
            .replaceAll('\\', '/')
            .split('?')[0]
            .endsWith('/src/services/rewardService.ts')
        )
          return null;
        const source = code.replaceAll('\r\n', '\n');
        const find =
          '.filter((event) => !event.occurrenceId && !event.reversedAt)';
        if (source.split(find).length !== 2)
          throw Error('M06 não aplicado exatamente uma vez');
        return {
          code: source.replace(find, '.filter((event) => !event.occurrenceId)'),
          map: null,
        };
      },
    },
  ],
});
