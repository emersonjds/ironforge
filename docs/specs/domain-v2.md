# Spec: Domínio v2 + Fundação FSD-lite (Fase A)

> **Status:** implementado · **Agente dono:** mobile-dev · **Prioridade:** P0 · **Lado:** mobile (contrato replicado pela web)
> **Branch:** `feat/domain-v2` · **Specs relacionadas:** `07-data-model-v2.md`, `10-frontend-architecture.md`, `08-engineering-guide.md`

## Problema / JTBD
O domínio atual (`src/types/domain.ts`, 132 linhas) é **single-user/solo**: `User` único, `Mesocycle` ligado ao usuário, `SetLog` indexado por `planExerciseId`, sem papéis, sem template→atribuição, sem histórico de carga permanente. Toda feature P0 da plataforma (vínculo personal↔aluno, ficha do aluno, carga persistente, cópia em massa) depende de um **modelo v2** e de uma **arquitetura que escale** (FSD-lite, `10`). Esta fase entrega a fundação — **sem UI nova** — para as features subsequentes assentarem.

## Decisão
1. **Migrar o modelo v1 → v2** conforme `07-data-model-v2.md` (greenfield: não há usuários reais; apenas seeds a ajustar — sem migração de dados de produção).
2. **Reorganizar para FSD-lite** (`10`): promover infra/design para `shared/`, extrair `entities/` (domínio + lógica pura), manter `features/` para fluxos.
3. **Não** mexer em telas/UX nesta fase (só imports/movimentação). **Não** implementar backend (Zod + dados locais/mocks).
4. Fazer **incremental** (boy-scout), em 3 sub-passos sequenciais e revisáveis (ver Plano).

### O que decidimos NÃO fazer agora
- Não reescrever telas nem o fluxo de workout (só atualizar imports quando mover).
- Não criar o app web (projeto separado, fase D).
- Não adotar FSD puro (camada `pages` — Expo Router já é).

## Dados (ref `07-data-model-v2.md`)
**Substituições/extensões em relação ao v1:**
- `User` (v1, monolítico) → **`User`** (identidade base) + **`CoachProfile`** + **`AthleteProfile`** + **`CoachAthleteRelation`**. Mover `goal/experience/unitSystem/bodyweight` para `AthleteProfile`.
- `Mesocycle` (v1) → **`PlanTemplate`** (do coach) + **`AssignedPlan`** (snapshot do aluno, com `weekConfigs`, `weekVisibility`, `coachNotes`).
- `PlanDay` → ganha `slotLabel`, `slotIndex`, `targetDaysOfWeek`.
- `Exercise` → ganha `baseExerciseId`, `variationType`, `equipmentDetail`, `muscleEmphasis`, `difficultyLevel`, `requiresSpotter`, `riskFlags`, `ownerCoachId`.
- **Novos:** `Video`, `ExerciseDemo` (vídeo segmentado por executante), `LoadHistoryEntry` (chave `exerciseId`, regras de invalidação), `AdaptationLog`, `WeekConfig`.
- `SetLog` → adiciona `exerciseId` (desnormalizado), `assignedPlanId`, `editedAt`, `originalWeight`, `deletedAt`; `planExerciseId` vira nullable.
- Soft-delete (`deletedAt`) em `PlanTemplate`, `AssignedPlan`, `SetLog`; helper `withoutDeleted`.

## Telas / fluxo
**Nenhuma.** Fase de fundação. Critério: o app **continua compilando e rodando** com o comportamento atual após a migração.

## Critérios de aceite
- [x] Schemas v2 do `07` implementados, todos com `z.infer<>`; **zero `any`**; `npm run typecheck` verde.
- [x] Estrutura FSD-lite criada: `src/shared/`, `src/entities/`, `src/features/` com **aliases** `@shared/* @entities/* @features/* @widgets/* @app/*`.
- [x] Matemática de coaching movida para entities, **com testes** passando: `entities/session/lib/{e1rm,pr-detection,session-stats}`, `entities/load-history/lib/progression`, `entities/exercise` (catálogo + swap). (38 testes verdes.)
- [x] `eslint-plugin-boundaries` configurado e **lint quebra** em import "pra cima"/lateral.
- [x] Cada slice de entity expõe **public API** (`index.ts`); imports do app usam o alias, não caminho interno.
- [x] Helper `withoutDeleted` + parsing na borda (storage) usando os schemas (`SessionWithSetsSchema.safeParse` nas hooks de histórico/última sessão e no `merge` do store de sessão ativa).
- [x] App **roda** com o comportamento atual intacto (logger, histórico) — dados gravados já são v2; parsing tolera ausência/corrupção sem quebrar.
- [x] `08-engineering-guide.md` e `golden-rules.md` atualizados de "feature-first" → "FSD-lite".

## Fora de escopo
UI nova, backend/API real, app web, migração de dados de produção, features P0 de produto (vínculo, ficha, cópia em massa) — essas vêm nas fases B/C/D consumindo este domínio.

## Perguntas abertas (handoffs) — RESOLVIDAS
1. **Storage: MMKV agora ou depois?** → **AsyncStorage mantido** nesta fase (continua rodando no Expo Go). Migração para MMKV fica para fase própria, ao sair do Expo Go.
2. **`Mesocycle` legado:** → **Removido totalmente** em favor de `PlanTemplate`/`AssignedPlan`, sem alias de compatibilidade (não há dados reais). Zero referências a `Mesocycle` no código.
3. **Namespacing por usuário nas chaves de storage:** → **Adiado para a fase de multi-conta (B/C).** Com Zustand persist o `name` da chave é estático na criação do store; namespacing real por usuário exigiria reestruturar como cada store/hook resolve a chave — fora do escopo "comportamento intacto" desta fundação. **Handoff:** introduzir `withUserScope(key, userId)` + façade única de chaves quando multi-conta for implementado.

## Plano (arquivos / tarefas) — incremental

**A.1 — Domínio v2 + entities (baixo churn, additivo)**
- [x] `src/types/domain.ts` vira fachada que reexporta os schemas distribuídos por `entities/*/schema.ts`.
- [x] Criar `src/entities/{exercise,session,plan,load-history,athlete,coach,video}/` com `schema.ts` + `index.ts`.
- [x] Mover `features/workout/lib/{e1rm,pr-detection,session-stats}.ts` → `entities/session/lib/`; `progression.ts` → `entities/load-history/lib/`; `features/exercises/data/catalog.ts` + swap → `entities/exercise/`. (Shims de reexport mantidos em `features/workout/lib` e `features/exercises/data` para migração incremental de imports.)
- [x] Mover testes correspondentes para `tests/unit/entities/...`; verdes (38).

**A.2 — Promoção `shared/` (churn de imports)**
- [x] Mover `src/components/ui` → `src/shared/ui`; `src/lib` → `src/shared/lib`; `src/theme` → `src/shared/theme`.
- [x] Configurar aliases em `tsconfig.json` + Babel (`babel-plugin-module-resolver`); reescrever imports.
- [x] Remover os diretórios antigos duplicados (`src/components`, `src/lib`, `src/theme`) após confirmar zero referências.

**A.3 — Fronteiras + docs**
- [x] Adicionar e configurar `eslint-plugin-boundaries` (camadas + regra unidirecional) no lint.
- [x] Atualizar `08` e `golden-rules.md` para FSD-lite.
- [x] `npm run typecheck && npm run lint` verdes; testes verdes; app roda (comportamento intacto).
