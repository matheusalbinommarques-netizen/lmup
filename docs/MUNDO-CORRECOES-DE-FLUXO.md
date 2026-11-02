# Correções de fluxo, arte e clareza da investigação

Rodada na branch existente `feat/world-cinematic`, após as decisões explícitas do usuário. Sem PR, push ou integração à main. Mantém as outras frentes independentes.

## Fluxo e interações

O problema era a coexistência de duas apresentações: Oásis imersivo e Arredores na tela antiga, com retorno principal para o mapa e lista fixa de ações. O mesmo componente de cena agora apresenta as duas pinturas com suas próprias coordenadas/objetos. Não foi criado outro motor nem outra rota.

Arredores oferece Voltar ao Oásis como ação principal. O ponto de retorno e Escape, quando não há painel/inspeção para fechar, também levam à cena do Oásis. Mapa permanece um atalho explícito ao mapa regional. Não é necessário selecionar o Oásis e entrar novamente após a volta. Em ambas as cenas, as interações principais ficam na pintura; a lista só aparece quando solicitada, com teclado/toque preservados.

O microtítulo Observe de perto foi removido. O painel contextual inicia pelo nome do objeto, sem pseudoelementos, traço ou sublinhado decorativo nesse título.

## Arte correta

Lucan usa o PNG horizontal indicado pelo usuário, tanto na conversa como no Atlas. A cópia é byte a byte idêntica ao anexo, sem nova geração ou edição: `static/art/world/lucan-dorian-horizontal.png`, 2.634.871 bytes, SHA-256 `20712c0eb9c8d1a9df5ae18d3ef1330a9c1d582e0c40706ece041c0bc14cdcb9`. A origem e o hash estão no manifesto. O WebP vertical anterior foi conservado como arquivo legado, mas não é a imagem usada por Lucan no Mundo.

No desktop a arte ocupa a composição ampla com máscaras para integrar o cenário e a caixa de texto. No celular há enquadramento da mesma imagem; não foi substituída por outro rosto ou outra pose. O PNG original está abaixo do limite existente de 3 MiB e foi incluído no cache essencial, sem afrouxar limites.

## Investigação e decisão

A causa definitiva é o eixo quebrado. Os sacos menores/alças de corda explicam como parte dos mantimentos foi levada à mão; os rastros indicam o caminho alto até o Oásis. A carga restante está junto à carroça nos arredores, não esperando no entreposto. Variel continua sendo a origem da entrega e uma referência geográfica.

O aviso de retorno aparece no quadro após a visita aos Arredores. É derivado do progresso já salvo e confirma que todos os carregadores chegaram em segurança. Não adiciona pista, campo de banco ou requisito. Ler o quadro não é condição para decidir; Lucan também informa a confirmação durante a conversa. O registro adicional do quadro está identificado como opcional.

Antes de escolher, a conversa apresenta três relações curtas entre evidência e conclusão. As duas tarefas vêm primeiro nas respostas; a revisão detalhada continua opcional. Recuperar a carga significa acompanhar pessoalmente a retirada dos sacos, enquanto Lucan prepara a rota. Preparar a rota significa assumir as marcações/orientações do caminho alto, enquanto Lucan acompanha a recuperação.

As consequências descritivas aparecem na fala final, no diário das novas conclusões, na distribuição de tarefas e na mesa de provisões (cordas/alças ou esboço/orientações). A investigação termina ao assumir a providência; não foi criado um minijogo posterior de transporte ou construção. Não há XP, custo, punição, recompensa ou sistema econômico novo.

## Dados e compatibilidade

Mesmas três pistas obrigatórias, IDs de escolhas `rescue`/`route`, estados, recibos e regras transacionais. O serviço só mudou a descrição registrada em novas conclusões. Registros já gravados não são reescritos ou migrados. Banco, versão de estado, formato de backup, Missões, Acampamento e Aposentos não foram alterados.

## Validação

- 26 testes de serviço/backup passaram, incluindo ambas as decisões sem ler o aviso, ausência de desbloqueio antecipado, recibos, concorrência, rollback e preservação de conclusões antigas.
- 14 cenários únicos de navegador desktop/mobile passaram, incluindo as quatro verificações novas de fluxo/aviso e recuperação da carga. Um cenário mobile foi reexecutado após corrigir a sincronização do helper com a abertura assíncrona da cena. Após reduzir o texto e ordenar as escolhas, os quatro cenários novos foram repetidos e passaram; reexecuções não são cenários adicionais.
- 2 cenários PWA desktop/mobile passaram com a arte horizontal: primeira exploração offline, investigação completa, retomada, conclusão e Atlas.
- 4 testes do mecanismo de precache; tipos sem erros/avisos, lint direcionado e build de produção.
- Conferência visual em 1536 × 900, 1024 × 768, 390 × 844 e 320 × 844: sem erro de execução ou transbordamento externo, aviso e retorno acessíveis, duas escolhas e preparos distintos. Mobile emulado, não aparelho físico. A decisão pode exigir rolagem para apresentar as evidências e respostas sem cortar conteúdo.

Build final: 262 arquivos essenciais, 19.890.339 bytes, versão a8494bb1561ef6a4. O aumento é principalmente a arte horizontal original pedida, sem alterar a política offline. A última verificação obrigatória de integração/CI completa continua pendente de aprovação; não foi executada durante esta prototipagem.

Prévia: http://127.0.0.1:5192/mundo. Capturas e arte usada: http://127.0.0.1:5192/correcoes.html. Artefatos locais ignorados pelo Git: `.review-previews.local/world-cinematic-corrections/`. Instalação principal 5174 fora do escopo; não foi publicada ou modificada por esta rodada.
