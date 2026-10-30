# Level Me Up — estado da Beta

Publicação do desenvolvimento local em branch separada, em 29/10/2026. A branch main não foi mesclada ou substituída. A base funcional congelada é o commit 7329191c78328d29a3619c6f2f7347e0d53e981a; o commit de publicação acrescenta documentação, sem mudança de comportamento.

## Produto entregue

Jornada de Hoje, missões com passos/notas e pausa/retomada, conclusão/estorno transacionais, projetos e revisões, progresso por eventos, perfil/equipamentos, Refúgio, companheiros, loja/coleção/conquistas, preferências, backup/recuperação, instalação PWA, offline e atualização coordenada.

As quatro famílias de companheiros têm três estágios com identidade visual compartilhada. Foram 11 gerações novas pela ferramenta integrada image_gen e preservado o primeiro lobo piloto; as 36 variantes WebP estão em static/art/companions-v2/. [Catálogo visual](imagens/companheiros-beta.png) e [prompts exatos](arte/companheiros-prompts.json). Os arquivos fontes/fontes de geração referidos no JSON permanecem no workspace local de evidências; não são necessários para executar o app. As artes finais usadas pelo app estão versionadas.

## Verificação da base congelada

- Lint, tipos/Svelte e build passaram; zero erros/avisos Svelte.
- 150 testes de serviços passaram.
- 152 cenários distintos da jornada cobertos: 150 na execução ampla e dois novos de legado na execução final de 28 cenários pertinentes. Repetições não somadas.
- 20 cenários PWA passaram em execução sequencial, incluindo as 12 imagens reais offline e fallback para miniatura compacta.
- Cinco verificações de integridade e execução do pacote extraído online/offline passaram.

O último pacote local corresponde à revisão 8996fa87a5d6f4f4, protocolo 1, schema 5, origem limpa 7329191. Seu ZIP tem SHA-256 8c521e25571c3aac606350f9f1ce22a3425ad4a353409f7685af390f5ad762bb. ZIP, logs brutos, capturas adicionais e fontes PNG estão preservados no workspace de entregas; ficam fora do Git. Este registro não é um GitHub Release nem comprovação de testes novos executados pelo GitHub Actions.

## Executar e conferir

Consulte o README para instalação e comandos. npm run verify valida código, tipos, serviços e build; npm run test:e2e executa a jornada; npm run test:pwa verifica offline/atualização; npm run test:package confere integridade. Não paralelizar a suíte PWA acima do workers: 1 configurado, pois os testes compartilham as simulações de rede/versão.

## Escopo e próximos passos

A Beta tem [funcionalidades congeladas](CONGELAMENTO-DA-BETA.md). A lista de acabamento F01–F04 foi encerrada: artes, integração/offline, leitura/dados e candidato estável. Novas funcionalidades opcionais aguardam avaliação ou reabertura explícita pelo autor.

[Roadmap](planejamento/ROADMAP-Level-Me-Up.md) e [backlog](planejamento/BACKLOG-Level-Me-Up.md) acompanham a entrega. E9-02 (sessões reais) foi adiada pelo autor. E9-03 (regressão posterior aos achados), E9-04 (entrega definitiva) e E9-05 (encerramento da V1) permanecem abertas. A narrativa segue provisória; Android/iOS físicos, retenção e engajamento não foram validados. Conta/sincronização e Clã real estão fora da V1 atual.
