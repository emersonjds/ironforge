# Spec: Gamificação (consistência) — decisão com validação dos agentes

> **Status:** parcial (grid implementado) · **Agentes:** po + bodybuilding-coach + mobile-ui-ux-designer · **Lado:** mobile (aluno)
> **Specs relacionadas:** `05-platform-vision.md` (corta "gamificação cringe"), `04-competitive-research.md`

## Contexto
Fundador pediu, no app do aluno: (1) grid de atividade estilo GitHub em "Semanas Ativas", (2) troféus por disciplina (estilo Duolingo), (3) desafios mensais. A visão (`05`) lista "gamificação infantil (badges/streaks cringe)" como anti-escopo — então cada item passou por validação dos agentes.

## Veredito dos agentes
| Item | PO | Coach | Decisão |
|---|---|---|---|
| **Grid de consistência** | SIM (P1) | SIM-com-ressalva | ✅ **Construído** |
| **Troféus/conquistas** | DEPENDE (P2) | NÃO / ressalva severa | ⏸️ **Adiado (P2)** |
| **Desafios mensais** | NÃO | NÃO | ❌ **Vetado** |

**Razão central (coach + po):** desafios/streaks incentivam o comportamento errado — o aluno fura o **deload programado** ou treina doente pra não quebrar a sequência, **brigando com a periodização do personal** (que paga a conta). É o "cringe" que o `05` cortou. O grid de consistência é o único defensável (Hevy/Strava usam), porque é **espelho de dado real**, não incentivo extrínseco.

## Regras de enquadramento (para não virar cringe)
- Medir **consistência/qualidade**, não streak. Nome: "Consistência de Treino" — nunca "Atividade"/"Streak".
- **Sem** contador regressivo de sequência, mascote, medalhas douradas, confete ou copy tipo "você consegue!". Linguagem adulta e factual.
- Semana de **deload programado** deve aparecer neutra/rotulada — nunca "vazia" (senão o aluno lê como falha). *(refinamento pendente: exige dado do plano.)*

## Implementado (esta fatia)
- **`ConsistencyGrid`** em `app/(app)/progress.tsx`: grid 26 semanas × 7 dias, células 12dp, 5 níveis de cor (`surface-300` → `forest-500`), scroll horizontal, legenda "menos · mais". Mock: `mockConsistencyWeeks` em `progress.mock.ts`.
- Título "Consistência de Treino" + legenda sóbria. Sem streak counter.

## Fora / adiado
- **Troféus**: P2. Só se forem conquistas de **dado real** (ex.: "Adicionou carga em 8 dos últimos 10 supinos"), ícone funcional (Ionicons outline, cor forest), **sem** medalha/mascote. Risco: colidir com periodização do coach.
- **Desafios mensais**: vetado no contexto coach↔aluno (compete com a programação do personal). Reavaliar só se existir modo "aluno autônomo".

## Perguntas abertas
1. Grid colorir por **qualidade** (% exercícios com progressão / RIR no alvo) em vez de presença — exige `LoadHistory` real (Fase C).
2. Marcar deload no grid — exige `weekConfigs`/plano com semanas de deload.
3. Mostrar o grid também na **dashboard do personal** (ficha do aluno) para ajustar volume.
