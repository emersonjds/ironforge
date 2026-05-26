# IronForge — Spec-Driven Development (como IAs e devs trabalham)

> Regra central: **nenhuma linha de código sem spec.** A spec vive nos docs; o código a implementa; o PR prova que cumpre. Vale igual para humanos e agentes de IA.

## 1. Por que SDD aqui
Projeto multi-agente e multi-superfície (mobile + web + domínio compartilhado). Sem spec, cada agente/dev diverge e o produto vira colcha de retalhos. A spec é o **contrato** que os 4 agentes usam para se coordenar e que protege a simplicidade e a performance (que são features, ver `05`).

## 2. Hierarquia de specs (fonte de verdade)
```
05 vision        → por quê / posicionamento / princípios
06 PRD           → o quê + prioridade (P0/P1/P2) + lado (web/mobile)
07 data model    → entidades/campos (Zod)
02 design spec   → UI/tokens/telas
08 engineering   → como construir (camadas, fluxo de dados)
09 (este)        → processo + git flow
docs/specs/<x>.md→ spec da feature específica (use _TEMPLATE.md)
memories/golden-rules.md → regras INVIOLÁVEIS
```
Doc desatualizado é bug: mudou decisão → atualize o doc/spec **no mesmo PR**.

## 3. O loop SDD (toda mudança segue isto)
0. **Entender** — ler a visão + a parte relevante do PRD + modelo de dados.
1. **Especificar** — criar/atualizar `docs/specs/<feature>.md` a partir do `_TEMPLATE.md`: decisão, dados, telas, critérios de aceite, fora-de-escopo, perguntas abertas.
2. **Revisar com o agente certo** — domínio→`bodybuilding-coach`; fluxo/tela→`mobile-ui-ux-designer`; arquitetura/dados→`mobile-dev-expert`; prioridade/conflito→`fitness-market-product-owner`. (Por padrão agentes **analisam/recomendam**, não editam.)
3. **Planejar** — quebrar em tarefas + arquivos tocados. Se a spec mudou de direção, confirmar com o humano antes de codar.
4. **Implementar** — seguir `08` (camadas, fluxo) + golden-rules. **Lógica pura em `lib/` primeiro, com teste.**
5. **Verificar** — `typecheck` + `lint` + testes, e **rodar o app** (skills `/run`, `/verify`) pra ver funcionando. Os critérios de aceite da spec batem?
6. **PR** — pequeno, focado, com link pra spec. Ver §5.

## 4. Como os agentes de IA trabalham
- Invoque o **especialista do domínio certo**; não decida fora do seu domínio.
- **Coordenação é pelos docs**, não por suposição. Saída de um agente que afeta outro vira **handoff escrito** → reconciliado pelo PO.
- Agentes **não editam código sem spec aprovada**. Análise é o default; implementação é etapa separada e explícita.
- O `fitness-market-product-owner` tem a **palavra final** em conflito de prioridade.
- Ações difíceis de reverter ou externas (criar repo, instalar deps, push, deploy) → **confirmar com o humano** antes.

## 5. Git flow (best practices)
- **Trunk-based com branches curtas.** `master` é a verdade. **Nunca** commitar trabalho de feature direto em `master` — crie branch.
- **Nomes de branch:** `feat/<escopo>`, `fix/<escopo>`, `docs/<escopo>`, `refactor/<escopo>`, `chore/<escopo>`. Ex.: `feat/load-history`, `docs/sdd`.
- **Conventional Commits** (o repo já usa): `tipo(escopo): descrição`. Tipos: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`, `style`. Escopo = feature/área (`feat(workout): …`). Descrição no imperativo (pode ser PT). **1 commit = 1 ideia coesa.**
- **PRs pequenos e focados.** Um PR = uma fatia de uma spec. Descreva: o quê, por quê, **link pra spec**, e **como testar**. Anexe screenshot/gravação se mexeu em UI.
- **Quando commitar/pushar:** só quando o humano pedir. Rode `typecheck`+`lint`+testes antes. **Commits NÃO mencionam IA** — sem trailer de co-autoria, sem "Generated with…". A autoria é sempre do dev.
- **Review:** todo PR passa por review (humano ou agente). Use `/code-review` ou `/review`.

## 6. Definition of Done
- [ ] Spec atualizada e **critérios de aceite cumpridos**.
- [ ] Lógica pura testada; sem `any`; **Zod como fonte**.
- [ ] Camadas respeitadas (`08`), golden-rules ok, **acessibilidade** ok, estados loading/erro/empty.
- [ ] Mutação **optimistic**; tokens de tema (zero hex/fontSize inline).
- [ ] `typecheck` + `lint` + testes verdes; **app roda e a feature funciona de verdade**.
- [ ] PR pequeno, com link pra spec e como-testar.

## 7. Anti-padrões (não faça)
- Codar sem spec; "documento depois".
- Agente decidir fora do domínio sem handoff escrito.
- PR gigante misturando várias features.
- Duplicar tipo/regra (use Zod / `lib` compartilhada).
- Commitar direto em `master` ou sem rodar os quality gates.
- Deixar doc/spec divergente do código.
