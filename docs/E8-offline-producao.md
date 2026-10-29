# E8 — Leveza, offline e atualização

A versão de produção prepara os arquivos essenciais para uso offline, oferece instalação pelo navegador e coordena atualizações entre abas. O banco continua LevelMeUpDB v5, sem migração nesta etapa.

## Imagens e orçamento

Foram geradas 166 variantes WebP (160/320 px) de 83 ícones existentes. Originais preservados. As variantes somam 2.697.784 bytes; os originais correspondentes somam 118.638.827 bytes. Arte de cena mantém as variantes anteriores. A compressão não redesenha a personalidade do projeto.

Medição Chrome desktop 1440px e viewport móvel 390px: contexto novo por tela, service worker bloqueado, recursos sem compressão HTTP, primeiro estado ocioso e depois todas as imagens forçadas a carregar. Não é medição de tempo de resposta, LCP ou rede móvel real. MB abaixo usa 1.000.000 bytes.

| Tela       | Antes, tudo carregado |   Depois |             Redução |
| ---------- | --------------------: | -------: | ------------------: |
| Loja       |              27,25 MB |  0,56 MB |              97,94% |
| Conquistas |              46,73 MB |  0,68 MB |              98,55% |
| Hoje       |              0,458 MB | 0,479 MB | aumento de 0,021 MB |

A preparação offline é tráfego adicional separado dessas medições. O build registra seu número de arquivos e bytes em release.json (aproximadamente 1,19 MB nesta revisão). Não há download inicial do catálogo inteiro. scripts/optimize-art.mjs permite regenerar as variantes usando Chrome; a saída existente já está versionada.

## Cache e acesso offline

O manifesto é gerado depois do adapter estático, incluindo 200.html, todos os JS/CSS locais necessários às rotas, ícones de instalação e cenas pequenas. Instalação parcial do cache falha sem substituir o worker anterior. Cache de navegação atende somente rotas conhecidas, incluindo IDs de missões/projetos e parâmetros. Assets ausentes não recebem HTML.

Artes visitadas têm cache opcional com até 60 entradas e até 1 MiB por arquivo: teto teórico de 60 MiB, além do pacote essencial. A limpeza ocorre após cada gravação; não representa reserva de espaço. Uma cena grande não visitada usa a cena pequena offline; outras artes têm a alternativa textual da interface. Os dados pessoais continuam no IndexedDB, fora do cache de arquivos.

A primeira visita precisa de rede. Preparação confirmada aparece em Configurações. Falha de cache não promete prontidão. Estar instalado, estar offline e possuir backup são estados independentes. O navegador pode remover armazenamento; proteção persistente é solicitada opcionalmente e pode ser recusada. Backup externo continua necessário.

## Atualização

O worker novo espera. Uma ação explícita consulta todas as janelas da origem, inclusive não controladas; formulário aberto, notas sujas, gravação ou aba sem resposta impedem a troca. As abas prontas são bloqueadas durante a barreira e só recarregam na troca do controlador. Recusa destrava as abas. Requisições simultâneas são serializadas. URL e dados locais são preservados.

Protocolo 1 e schema 5 precisam coincidir. Revisão incompatível orienta backup e fechamento das abas, sem ativação forçada. Clientes antigos sem protocolo não confirmam prontidão e bloqueiam a troca coordenada enquanto abertos. A ativação normal do navegador depois de fechar todas as abas continua possível. Não há downgrade de banco nem rollback automático de schema. Mudança futura de schema exige nova estratégia e teste específico.

Quota, acesso negado ao banco e falha de cache têm mensagens próprias. A falha ao salvar notas mantém o rascunho na aba e permite tentar novamente; fechar essa aba ainda perde o rascunho não salvo.

## Verificação e limites

Lint, Svelte/tipos e build passaram (zero erros, três avisos já existentes). Passaram 126 testes de serviços, 106 cenários da jornada e 20 cenários PWA. Há 20 capturas dos cenários PWA. Auditoria de dependências: oito entradas de severidade baixa, nenhuma moderada/alta/crítica na consulta de 29/10/2026; o comando passou pelo limiar configurado. Não houve aplicação de correções forçadas.

As suítes usam perfis descartáveis, dados sintéticos e Chrome instalado no PC. A suíte PWA testa rede desligada com o servidor recusando requisições, navegação direta, criação, notas, recarga, conclusão/estorno, backup, atualização entre abas, formulário aberto, quota simulada, schema incompatível, worker legado, banco negado e cache indisponível. O manifesto é lido pelo Chrome; a interação do botão de instalação é simulada. As revisões de atualização têm workers diferentes e o mesmo aplicativo/schema.

Instalação nativa pelo menu do sistema operacional ainda precisa de confirmação manual. Não foi instalado um aplicativo no perfil pessoal do usuário. Não há celular disponível; viewports móveis não certificam Android/iOS, teclado virtual, suspensão ou pressão real de armazenamento. E8-04/E8-05 permanecem em verificação por esses limites. Não há publicação pública nesta entrega.

## Dependências e alcance

Os oito avisos baixos propagam cookie/SvelteKit e deepmerge pelas ferramentas. A busca no código não encontrou use:enhance, setHeaders ou deepmerge. Assim, não foi identificado o caminho de entrada exigido pelos avisos de formulário aprimorado e cabeçalho de prerender nesta aplicação; isto é avaliação do código atual, não garantia geral de segurança. O aviso de cabeçalho pode ocorrer durante o build, mesmo com hospedagem estática: reavaliar se conteúdo não confiável passar a definir cabeçalhos. Deepmerge fica nas ferramentas de build, sem entrada de configuração externa aceita por este projeto. A política anterior está em E1; atualizações principais/downgrades sugeridos pelo audit exigem avaliação própria.

## Uso local e manutenção

A instância acompanhada pelo usuário passa a servir build/ na mesma origem http://127.0.0.1:5174, preservando o armazenamento existente. Para desenvolvimento com HMR, usar outra porta (5175); cache de produção e desenvolvimento não devem compartilhar origem. Não construir enquanto o Vite usa a mesma pasta de saída. A instância local depende do processo servidor; para instalar/distribuir fora deste PC é necessário HTTPS e destino de hospedagem definido.

Comandos: npm ci; npm run verify; npm run test:e2e; npm run test:pwa. No Windows, LMU_BROWSER_CHANNEL=chrome usa o navegador existente. Servidor de teste PWA é separado, porta 4274, com controles de revisão/rede exclusivos dos testes. Não é distribuído no build.

## Referências consultadas

- [Ciclo de atualização e comunicação do Workbox](https://developer.chrome.com/docs/workbox/modules/workbox-window): esperar a revisão e permitir ativação após ação do usuário. A barreira de dados é uma decisão deste projeto.
- [StorageManager.persist](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist): a solicitação pode retornar false.
- [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API): persistência e descarte de armazenamento não substituem exportação de dados.

Avisos consultados: [formulários](https://github.com/advisories/GHSA-pfhg-q3qv-9q6r), [cabeçalho de prerender](https://github.com/advisories/GHSA-27mw-82g8-phjj), [deepmerge](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).
