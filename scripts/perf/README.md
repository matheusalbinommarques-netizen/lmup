# Medidor de desempenho

Mede carga fria por tela e o custo de abrir/concluir com histórico crescente. Dados sintéticos, perfis temporários do navegador, porta própria (`PERF_PORT`, padrão 5198; a 5174 é recusada) e resultado em `perf-results/` (fora do Git). Não roda na CI e não tem meta bloqueante.

```bash
npm run build
npm run perf:load    # carga fria por rota, CPU x1 e x4
npm run perf:scale   # histórico de 0, 1, 3 e 5 anos (8 missões/dia)
```

Acrescente `-- --quick` para uma passada única (conferir se roda). Compare **tendências**, não milissegundos: a máquina, a carga e o navegador mudam o resultado. Rode antes e depois da alteração, na mesma máquina.

Referência de 06/11/2026, nesta máquina, `perf:scale` completo: vazio 193 ms (Hoje) / 82 ms (concluir); 5 anos, 14.600 linhas por tabela: Hoje ≈ 3,0 s, Missões ≈ 4,2 s, concluir ≈ 5,2 s.

Diagnóstico de uma conclusão: `node scripts/perf/profile-complete.mjs [anos]` (padrão 5) conta as leituras do IndexedDB por tabela e grava um perfil de CPU em `perf-results/`. Referência de 11/11/2026, depois do C03: 5 anos, Hoje ≈ 1,5 s, Missões ≈ 1,7 s, concluir ≈ 1,4 s.
