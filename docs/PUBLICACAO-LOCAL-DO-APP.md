# Atualizações do aplicativo instalado pelo Chrome

> O fluxo oficial agora é a [sincronização isolada da branch estável no GitHub](SINCRONIZACAO-GITHUB.md). A publicação direta por commits descrita abaixo registra a configuração inicial e foi desabilitada nesta instalação. Use o guia novo para promoção, sincronização e recuperação.

O Level Me Up instalado continua em `http://127.0.0.1:5174/`, no mesmo perfil do Chrome. A publicação troca os arquivos do aplicativo; não copia, limpa ou substitui o IndexedDB do usuário.

## Uso cotidiano

1. Finalize as alterações neste projeto e faça um commit completo.
2. O hook `post-commit` executa `npm run verify`: lint, tipos, testes de serviço, testes da publicação e build.
3. Se tudo passar e não restarem alterações sem commit, uma cópia completa é conferida por hashes e ativada de uma vez. Durante a compilação, o app continua recebendo a versão publicada anteriormente.
4. O app procura novidades ao abrir, ao voltar para a janela e a cada minuto enquanto estiver visível. Quando a atualização estiver pronta, apresenta o aviso existente.
5. Confirme **Atualizar agora** no aplicativo. O mecanismo existente de atualização coordena as abas e impede a aplicação durante operações ou formulários pendentes.

Na primeira vez, use **Configurações → Verificar atualização** e aplique a versão disponível para receber também a busca automática de novidades. Não é necessário reinstalar o aplicativo.

Um commit não é desfeito se a publicação falhar. Os erros aparecem no terminal e a versão anterior continua disponível quando a verificação ou a cópia falha. Depois de corrigir e commitar, é possível publicar novamente.

## Alcance

Este fluxo acompanha commits feitos **neste checkout, neste computador**, com os hooks do Husky habilitados. Não é uma sincronização com a nuvem nem uma publicação automática a partir do GitHub. Um push envia o código ao repositório remoto; não substitui o servidor local do aplicativo.

Para alterações recebidas de outro computador ou feitas diretamente no GitHub, primeiro traga o código para este projeto e execute `npm run app:publicar`. Um `git pull` por avanço direto não executa `post-commit`. Commits feitos com hooks desativados também exigem publicação manual.

O servidor escuta somente neste computador. A publicação inicia o servidor em segundo plano se ele estiver parado. Não foram alteradas configurações de inicialização do Windows. Depois de reiniciar o computador, o app pode usar o cache offline; para disponibilizar novas versões, execute `npm run app:iniciar` ou publique uma versão.

## Comandos de recuperação e consulta

```sh
npm run app:versao
npm run app:iniciar
npm run app:publicar
```

- `app:versao`: mostra se a publicação após commits está habilitada, a versão ativa e o commit de origem.
- `app:iniciar`: disponibiliza a versão publicada no endereço habitual.
- `app:publicar`: exige o projeto sem alterações pendentes, executa as verificações e publica.
- `app:preparar`: configuração inicial, que habilita o hook e publica um build já validado. Não deve substituir a publicação cotidiana, pois não executa as verificações.

Nesta instalação, a configuração inicial aceita o build validado das entregas ainda presentes no diretório de trabalho. Os metadados registram esse estado como `dirty: true`; isso não significa que tais alterações já foram commitadas ou enviadas ao GitHub.

## Armazenamento e proteção da versão ativa

Os arquivos publicados ficam em `.local-app/`, ignorado pelo Git e pelo lint. São retidas até três versões completas; arquivos imutáveis anteriores continuam disponíveis para clientes que ainda estão abertos. Isso utiliza espaço adicional em disco, proporcional ao tamanho do build.

O ponteiro `active.json` só muda após a conferência da cópia. Compilações futuras não alteram essa cópia. Publicações concorrentes são bloqueadas; um servidor diferente ocupando a porta não é encerrado automaticamente. Mudanças do schema de dados ou do protocolo de atualização exigem revisão explícita antes da publicação.

O fluxo não força recargas nem altera a economia do jogo. A atualização continua dependendo da confirmação no app e das proteções já existentes para dados e abas abertas.

## Validação desta entrega

- `npm run verify`: lint e tipos sem erros, 167 testes de serviço e 4 testes de publicação aprovados, build concluído.
- `npm run test:pwa` com Chrome: 30 testes aprovados em desktop e celular, incluindo detecção ao voltar ao app, busca indisponível, funcionamento offline e atualização entre abas.
- `npm run test:e2e -- production.spec.ts --workers=2`: 34 testes aprovados para rotas e recarga no servidor estático.
- `npm run test:package`: 5 verificações de integridade aprovadas.
- Instalação local ativada: versão `7ab804d0572a39a1` confirmada tanto no status do servidor quanto no `release.json` servido na porta 5174; hook habilitado.
- Invocação do fluxo pós-commit com alterações pendentes: publicação recusada e ponteiro ativo preservado. Não foi criado um commit apenas para testar o hook.
