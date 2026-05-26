# Spec: Fase C — Ficha do Aluno + Carga Persistente

> **Status:** em implementação · **Agentes:** po + coach + mobile-ui-ux-designer + mobile-dev-expert · **Lado:** mobile (aluno)
> **Branch:** `feat/domain-v2` · **Specs relacionadas:** `06-platform-spec.md §4,10,13`, `07-data-model-v2.md §LoadHistory`

## Contexto
Com o domínio v2 (Fase A) e o vínculo coach↔atleta (Fase B), a Fase C fecha o ciclo do aluno: carga persistente sobrevivendo à troca de plano, sugestão de progressão baseada em histórico real, e "qual treino hoje" calculado deterministicamente.

## Decisões dos agentes (coaching science)

| Questão | Resposta do coach | Implementado como |
|---|---|---|
| Sessões no topo para aumentar carga | **1 sessão** (não 2) | `allAtTop` olha sessão corrente |
| Deload reduz peso sugerido? | **Não** — só reps | `reps = round(repRangeMax * volumeMultiplier)` |
| RIR < alvo + reps no topo | Antecipar aumento | Tratado antes do `allAtTop` check |
| Staleness threshold | **21 dias** | `-10%` (21-27d), `-15%` (28-41d), `-20%` (42+d) |
| Arredondamento de peso | Para `0.5` mais próximo | `Math.round(w * 2) / 2` |
| Invalidation reason faltante | `rom_change` (ROM alterada) | Adicionado ao enum do schema |
| Sessões de deload no histórico | Filtrar, não invalidar | `isDeload` filter na query |

## O que entra em Fase C

### C1 — LoadHistory store
- `src/entities/load-history/store.ts` — Zustand, AsyncStorage lazy por `${athleteId}:${exerciseId}`
- `upsert`, `getLastEntry`, `getEntriesFor`, `invalidate`, `hydrateForExercise`
- Integração: `logSet()` no workout store chama `upsert` (fire-and-forget)

### C2 — `resolveNextSession`
- `src/entities/plan/lib/resolve-next-session.ts` — função pura
- Retorna `ResolvedSession { planDay, slotLabel, estimatedDate, isToday }`
- Rotação circular por `slotIndex`; sem sessão anterior → `days[0]`
- `currentWeek` via `daysSince(plan.startDate) / 7`

### C3 — `useSuggestNextSet` hook
- `src/entities/load-history/hooks/use-suggest-next-set.ts`
- Lê `LoadHistoryStore`, filtra entradas não-invalidadas e não-deload
- Staleness: 21/28/42 dias → redução escalonada, arredonda para 0.5
- Retorna `ProgressionSuggestion & { note: string }`

### C4 — Sugestão de carga no logger
- `NumericKeypadSheet` — prop `suggestion?: ProgressionSuggestion & { note: string }`
- Sub-linha dentro do botão `= ANTERIOR`: `"→ Sugestão: Xkg × N"`
- Só aparece quando suggestion difere do anterior

### C5 — ExerciseDetailSheet
- `src/features/workout/components/exercise-detail-sheet.tsx`
- Props: `exercise`, `planExercise`, `onClose`
- Conteúdo: nome, músculos chips (PT-BR), equipment, `coachNote` em card accent, slot vídeo P1 placeholder
- Abre via botão `ⓘ` no preview e no logger

### C6 — TodayHeroCard com treino real
- `app/(app)/index.tsx` — substituir `mockTodayHero` por `resolveNextSession(SEED_PLAN, lastSession)`
- Badge de estado: TREINO DE HOJE / PRÓXIMO · dia / DESCANSO / sem plano
- Músculos calculados dos exercícios do `PlanDay`

### C7 — Consistency grid com sessões reais
- `src/entities/session/lib/consistency-grid.ts` — `buildConsistencyGrid(sessions[], weeks)`
- Nível 0-4 por volume da sessão; quartis do histórico
- `app/(app)/progress.tsx` substitui `mockConsistencyWeeks`

## O que NÃO entra em Fase C
- Gráfico de carga por exercício ao longo do tempo (P1)
- `weekVisibility` enforcement (backend)
- Múltiplos `AssignedPlan` ativos (web)
- Supervisão em tempo real (Fase H)

## Critérios de aceite (gate PO)
- [ ] `resolveNextSession` com testes: plano 1/2/4 dias, semana completa (reinício), sem plano (null)
- [ ] Home mostra `PlanDay` correto do `SEED_PLAN` (não `mockTodayHero`)
- [ ] Logger exibe sugestão de carga para exercícios com histórico
- [ ] `LoadHistoryEntry` persiste após kill do app
- [ ] Consistency grid mostra sessões reais completadas
- [ ] `typecheck` + `lint` verdes
