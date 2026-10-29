# E9 — candidato técnico e preservação do perfil

Esta rodada antecipa trabalho técnico de regressão e preparação da entrega. As sessões com participantes continuam adiadas a pedido do autor. E9-03 e E9-04 não estão encerradas: ajustes decorrentes dessas sessões ainda exigirão nova verificação. A V1 não é declarada concluída.

## Falhas tratadas

A edição de perfil sincronizava o formulário com o objeto reativo do banco. Se outra aba mudasse nome ou avatar, um rascunho aberto podia ser substituído. Agora a edição captura apenas a identidade inicial, mantém seu rascunho e grava somente os campos alterados. Uma transação compara esses campos com o estado atual; mudança concorrente no mesmo campo é recusada com o rascunho preservado. XP, saldos e campos não editados continuam atuais. Perfil ausente não é recriado com saldos zerados por uma edição.

O formulário usa o diálogo nativo e os componentes existentes: foco inicial, Escape, retorno ao disparador, salvamento com feedback local e recusa de imagem fora dos formatos/tamanho suportados. Upload de PNG/JPEG/WebP tem limite de 2 MiB; não há gravação até salvar. Falha de leitura ou quota mantém o rascunho. A prévia do avatar é local e o arquivo integra backups de dados.

Os diálogos receberam espaçamento que preserva leitura em tela estreita e texto ampliado. O limite de linhas das ações é testado além da ausência de rolagem horizontal. Os três avisos anteriores de captura de props foram corrigidos: rascunho do perfil deliberadamente isolado e raridade do cartão derivada da prop. Não foram suprimidos avisos do compilador.

Configurações → Sobre esta versão mostra a revisão retornada pelo controlador ativo. Uma revisão aguardando atualização não substitui esse identificador. A interface distingue a versão em uso da disponível e não consulta release.json do servidor para chamar uma revisão nova de ativa.

## Pacote

Depois do build, npm run package:beta gera uma pasta dist/level-me-up-beta-<revisão>-<identificação>. O pacote contém somente build estático, servidor local com Node, iniciador, guia e manifesto de integridade. Não inclui node_modules nem o banco pessoal.

O identificador considera os arquivos empacotados, revisão, commit e estado de alterações do checkout. Os hashes verificam integridade; não são assinatura digital. npm run verify:package -- <pasta> recusa arquivos alterados, ausentes, extras, links simbólicos e caminhos inválidos. npm run test:package monta a cópia, provoca falhas controladas e a restaura integralmente antes de encerrar. O pacote intacto é verificado novamente.

O iniciador mantém 127.0.0.1:5174 por padrão. O processo local precisa estar rodando para buscar atualizações; não abre navegador automaticamente. O guia explica preparação offline, diferenças de origem, backup e recuperação por exportação/importação. Não é novo instalador Windows ou publicação pública.

## Evidências e limites

Os testes do perfil cobrem duas abas editando o mesmo nome, alteração de avatar em outra aba, XP ganho durante a edição, falha de quota seguida de nova tentativa, nome inválido e foco/leitura em 320px com texto de 200%. Serviços usam IndexedDB em memória; navegador usa contextos descartáveis. Artefatos das suítes de PWA e jornada agora têm diretórios separados para evitar disputa pelos arquivos de diagnóstico.

A captura visual complementa as medidas automáticas: largura válida por si só não garante que um botão esteja legível. A tela de perfil ainda contém o layout legado da Taverna; a modernização desta rodada é do formulário de identidade, não uma reconstrução de toda essa tela.

Verificação local concluída: lint e Svelte/tipos sem erros nem avisos; 132 testes de serviços, 118 cenários da jornada, 20 cenários PWA e cinco verificações funcionais de integridade do pacote passaram. As evidências completas ficam em entregas/E9-tecnica, fora do código. Android/iOS físicos e pesquisa de engajamento continuam sem validação. A matriz de Node 22/24 está configurada no GitHub; a execução local desta rodada usa Windows/Node 24.

## Referências

- [Svelte: dependências reativas e untrack](https://svelte.dev/docs/svelte/%24derived): a separação entre uma fotografia inicial e os valores reativos é uma decisão deste formulário.
- [Dexie: transações](https://dexie.org/docs/Dexie/Dexie.transaction%28%29): comparação e gravação da identidade permanecem na mesma transação de leitura/escrita.
