# Level Me Up — Beta local

Esta versão organiza missões, passos, notas, projetos e revisões e registra seu progresso neste navegador. A personalidade é provisória; as sessões de avaliação com pessoas foram adiadas pelo autor. Esta entrega não é uma V1 validada nem contém sincronização com nuvem.

## Abrir a cópia local

Se o app já está aberto ou instalado no PC de desenvolvimento, continue usando http://127.0.0.1:5174. Não inicie outro servidor nessa porta.

O pacote contém arquivos estáticos e um servidor local simples. Para iniciar uma cópia extraída, use Node.js 22.12+ ou 24 e execute, dentro da pasta do pacote:

```sh
node iniciar.mjs
```

Mantenha esse processo aberto e acesse http://127.0.0.1:5174. O servidor só escuta neste PC. O comando não abre abas nem instala nada automaticamente. Para parar o servidor iniciado por você, use Ctrl+C na janela que executa o comando. Se a porta já estiver ocupada, confira a instância existente; não encerre processos desconhecidos.

Instalar pelo menu do navegador cria o acesso do app. A primeira preparação offline precisa de conexão com o servidor. Depois de preparada, a jornada essencial pode abrir sem ele; para buscar novas versões, o servidor precisa estar disponível. Novas imagens não visitadas podem usar alternativas em texto.

## Usar a jornada

1. Em Hoje, crie uma missão ou retome uma que já começou. No primeiro uso, os exemplos opcionais abrem um rascunho editável; cancelar não cria uma tarefa.
2. Acrescente passos se forem úteis. Eles ajudam a executar; o esforço escolhido define o XP base.
3. Ao pausar, deixe uma nota e aguarde a confirmação de salvamento. Depois, use Continuar missão.
4. Conclua quando terminar. Você pode desfazer uma conclusão e corrigir um registro. Não é necessário manter o app aberto para preservar progresso já salvo.

No Refúgio, use Ver paisagem para explorar os quatro ambientes sem mudar o progresso. O cartão do marco distingue o que foi alcançado pelo XP do que tem prêmio registrado, estornado ou marcado como recebido em dados antigos. Ver registro deste marco mostra o recibo da ação quando ele existe.

## Atualizar e identificar a revisão

Em Configurações, use Verificar atualização. Quando houver uma revisão pronta, conclua formulários e gravações nas abas abertas e use Atualizar aplicativo ou Atualizar agora. A troca aguarda as outras abas; uma aba antiga sem resposta pode precisar ser fechada. Não apague dados do site para atualizar.

Em Uso offline e instalação, abra Sobre esta versão para conferir a revisão que está em uso na janela. Ela pode ser diferente da revisão nova que aguarda ativação. O arquivo build/release.json identifica o conteúdo deste pacote; integrity.json registra seus arquivos e hashes. Para conferir o pacote extraído, execute:

```sh
node scripts/verify-package.mjs .
```

Isso verifica arquivos ausentes, extras ou alterados. Não é uma assinatura digital e não autentica um remetente. A cópia distribuída não inclui o progresso pessoal; ele fica no navegador.

## Preservar a jornada

Em Configurações, use Exportar dados e confira o arquivo na pasta de downloads. Guarde uma cópia externa antes de trocar de computador, navegador ou origem. Navegador, protocolo, host e porta definem o espaço dos dados: localhost e 127.0.0.1 não são o mesmo endereço para esse fim. Instalação e uso offline não sincronizam nem substituem backup.

Para trazer dados a outra instalação, use Importar backup, confira o resumo e confirme a substituição apenas se for o arquivo desejado. A importação guarda uma recuperação local do estado anterior. Para voltar a esse estado, na área Recuperação local use Exportar recuperação mais recente. Depois importe esse arquivo, confira o resumo e confirme a substituição da jornada.

Uma importação com recibos de marcos incompatíveis com o contador de prêmios é recusada antes de substituir a jornada. O estado atual permanece disponível; conserve o arquivo para conferência e use um backup válido para restaurar.

Recuperações ficam no mesmo navegador e também são removidas se os dados do site forem apagados. Se o navegador negar armazenamento ou faltar espaço, mantenha o rascunho aberto, copie suas notas e use o backup que estiver disponível. O app preserva dados anteriores quando uma operação falha; texto ainda não salvo na aba pode ser perdido ao fechá-la.

O perfil mantém um rascunho enquanto está aberto. Se outra aba mudar o mesmo nome ou avatar, a edição é recusada para evitar sobrescrita silenciosa: copie o que quiser manter e reabra o formulário. XP, saldos e alterações em outros campos são preservados.

## Limitações desta Beta

PC com Chrome e viewports móveis têm verificações automatizadas; a instalação no PC foi confirmada pelo autor. Android/iOS físicos, suspensão e pressão real de armazenamento não foram certificados. A narrativa ainda será revisada e as sessões com participantes estão pendentes. O Clã é demonstrativo, sem conexão social ativa. Não há instalador Windows próprio ou hospedagem pública incluídos.
