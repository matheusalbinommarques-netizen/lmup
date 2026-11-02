# Integração de ícones por área e remoção de missões

Integração autorizada pelo usuário em 2 de novembro de 2026, limitada às duas
funcionalidades de missões. A exploração do Mundo permanece em desenvolvimento.

A branch `integration/missions-20261102` parte da publicação `3017a1a` e reúne
`7176297` (ícones), `9ed4516` (seletor offline) e `d9c52e9` (remoção segura).
O conflito em `Missions.svelte` foi resolvido preservando os imports de ambos
os recursos. Nenhum código ou arte da exploração foi incluído.

- Gerenciar áreas permite escolher e alterar o ícone compartilhado pelas missões.
- Excluir missão abre uma confirmação; cadastros sem uso são apagados, enquanto
  missões com histórico ou vínculos são arquivadas e permanecem consultáveis.
- Schema 6, backup formato 4, economia e acampamento existentes são preservados.
- O teste `missionIntegration.test.ts` verifica as duas operações juntas e a
  restauração de backup, incluindo preservação de recibos e do acampamento.

Os relatórios `ICONES-POR-AREA.md` e `EXCLUSAO-ARQUIVAMENTO.md` registram a
prototipagem anterior. Suas pausas para aprovação foram substituídas pela
autorização atual. A publicação seguirá o sincronizador existente após a
validação local e os checks obrigatórios do PR.
