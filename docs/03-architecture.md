# IronForge — Arquitetura do app

> Síntese das saídas do `bodybuilding-coach` (escopo MVP) e `mobile-ui-ux-designer` (telas + tokens) num blueprint executável pelo `mobile-dev-expert`.
>
> Princípios: **escalável, óbvia, testável, refatorável sem medo**.

---

## 0. Princípios de arquitetura

1. **Telas são finas, features são gordas.** Cada arquivo em `app/` é orquestração: importa um screen component da feature e o renderiza. Toda a lógica vive em `src/features/<dominio>/`.
2. **Domínio acima de camada técnica.** Pasta por *feature* (workout, plans, progress), não por tipo (controllers, services). Mover/deletar uma feature deve ser uma operação atômica.
3. **Pure logic em arquivos sem React.** Cálculo de e1RM, contagem de hard sets, regra de double progression, detecção de PR — vivem em `src/features/*/lib/*.ts` e são testáveis sem renderizar nada.
4. **Tipos são fonte de verdade — Zod gera tudo.** Schemas Zod em `src/types/domain.ts` definem entidades; tipos TS são `z.infer<>`; validação de I/O usa o mesmo schema. Backend e frontend compartilham.
5. **Offline-first por default.** MMKV grava primeiro, server sync é fire-and-forget com retry. UI nunca espera network — sempre optimistic.
6. **State management mínimo.** Zustand para client state efêmero (sessão ativa), TanStack Query para server cache, MMKV para persistência. Nada de Redux.
7. **Componentes UI são burros.** `src/components/ui/*` é a camada de design system (wrappers Gluestack + tokens NativeWind), zero lógica de negócio. Nunca importam de `features/`.

---

## 1. Estrutura de diretórios

```
ironforge/
├── app/                           # Expo Router — APENAS roteamento + composição
│   ├── _layout.tsx               # Root: providers (Theme, Query, GestureHandler, Auth gate)
│   ├── +not-found.tsx
│   ├── (auth)/                   # Stack — usuário deslogado
│   │   ├── _layout.tsx
│   │   ├── splash.tsx
│   │   ├── welcome.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx   # presentation: 'modal'
│   ├── (onboarding)/             # Stack — autenticado sem perfil completo
│   │   ├── _layout.tsx           # progress bar compartilhada
│   │   ├── goal.tsx
│   │   ├── experience.tsx
│   │   ├── frequency.tsx
│   │   ├── units.tsx
│   │   ├── body.tsx
│   │   ├── plan-pick.tsx
│   │   ├── permissions.tsx
│   │   └── ready.tsx
│   ├── (app)/                    # Tabs — autenticado + onboarded
│   │   ├── _layout.tsx           # Bottom tabs (5 tabs)
│   │   ├── (today)/
│   │   │   ├── _layout.tsx
│   │   │   └── index.tsx
│   │   ├── (plans)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── [planId].tsx
│   │   │   ├── editor.tsx
│   │   │   ├── templates.tsx
│   │   │   └── exercise-picker.tsx
│   │   ├── (history)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   └── [sessionId].tsx
│   │   ├── (progress)/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── exercise/[exerciseId].tsx
│   │   │   ├── muscle/[muscleId].tsx
│   │   │   └── body.tsx
│   │   └── (profile)/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       └── settings.tsx
│   └── (workout)/                # Modal full-screen ACIMA das tabs
│       ├── _layout.tsx           # presentation: 'fullScreenModal', gestureEnabled: false
│       ├── preview.tsx
│       ├── logger.tsx            # A tela mais crítica
│       └── summary.tsx
│
├── src/
│   ├── components/
│   │   ├── ui/                   # Design system: wrappers Gluestack + NativeWind
│   │   │   ├── button.tsx
│   │   │   ├── text.tsx          # Heading, Body, Metric, Caption
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── chip.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── icon.tsx
│   │   │   └── index.ts          # barrel export
│   │   └── shared/               # Cross-feature, mas mais pesados que ui/
│   │       ├── error-boundary.tsx
│   │       ├── offline-banner.tsx
│   │       ├── pr-celebration.tsx
│   │       └── force-unlock-button.tsx
│   │
│   ├── features/                 # DOMÍNIO — lógica + componentes por feature
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── sign-in-form.tsx
│   │   │   │   └── apple-button.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-auth.ts
│   │   │   │   └── use-current-user.ts
│   │   │   ├── api.ts            # Server calls (sign-in, refresh, etc.)
│   │   │   ├── store.ts          # Zustand: token, user
│   │   │   └── screens/
│   │   │       ├── sign-in-screen.tsx
│   │   │       ├── sign-up-screen.tsx
│   │   │       └── welcome-screen.tsx
│   │   │
│   │   ├── onboarding/
│   │   │   ├── components/
│   │   │   │   ├── option-card.tsx
│   │   │   │   └── step-progress.tsx
│   │   │   ├── store.ts          # Wizard state (Zustand)
│   │   │   └── screens/
│   │   │
│   │   ├── workout/              # ★ A FEATURE MAIS IMPORTANTE
│   │   │   ├── components/
│   │   │   │   ├── set-row.tsx
│   │   │   │   ├── numeric-keypad-sheet.tsx
│   │   │   │   ├── rest-timer.tsx
│   │   │   │   ├── rest-timer-overlay.tsx
│   │   │   │   ├── split-cta.tsx           # Bottom split timer/confirm
│   │   │   │   ├── exercise-swap-sheet.tsx
│   │   │   │   ├── plate-calculator-sheet.tsx
│   │   │   │   └── pr-modal.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-active-session.ts
│   │   │   │   ├── use-rest-timer.ts
│   │   │   │   ├── use-set-suggestion.ts   # Double progression
│   │   │   │   ├── use-pr-detection.ts
│   │   │   │   └── use-session-sync.ts
│   │   │   ├── lib/                        # Pure logic (NO React)
│   │   │   │   ├── e1rm.ts                 # Estimated 1RM (Epley/Brzycki)
│   │   │   │   ├── progression.ts          # Double progression rule
│   │   │   │   ├── volume.ts               # Hard set counting
│   │   │   │   ├── pr-detection.ts
│   │   │   │   └── session-fsm.ts          # Active session state machine
│   │   │   ├── api.ts                       # POST /sessions, /sets
│   │   │   ├── store.ts                     # Active session Zustand store
│   │   │   └── screens/
│   │   │       ├── workout-preview-screen.tsx
│   │   │       ├── workout-logger-screen.tsx
│   │   │       └── workout-summary-screen.tsx
│   │   │
│   │   ├── plans/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── screens/
│   │   │
│   │   ├── exercises/             # Catálogo + busca + swap
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── data/              # Seed JSON do catálogo (300+ exercícios)
│   │   │   │   └── exercise-catalog.json
│   │   │   ├── api.ts
│   │   │   └── screens/
│   │   │
│   │   ├── progress/
│   │   │   ├── components/
│   │   │   │   ├── e1rm-chart.tsx          # Skia chart
│   │   │   │   ├── volume-bar.tsx
│   │   │   │   └── pr-list.tsx
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   │   └── aggregations.ts         # Volume semanal, e1RM série
│   │   │   ├── api.ts
│   │   │   └── screens/
│   │   │
│   │   ├── today/
│   │   │   ├── components/
│   │   │   │   ├── next-workout-card.tsx
│   │   │   │   └── week-strip.tsx
│   │   │   └── screens/
│   │   │
│   │   ├── history/
│   │   └── profile/
│   │
│   ├── lib/                       # Infraestrutura compartilhada
│   │   ├── api/
│   │   │   ├── client.ts          # tRPC client OU fetch wrapper
│   │   │   ├── interceptors.ts    # Auth header, retry, error mapping
│   │   │   └── types.ts           # API contracts (compartilha com backend)
│   │   ├── storage/
│   │   │   ├── mmkv.ts            # Singleton MMKV instance
│   │   │   ├── secure.ts          # expo-secure-store wrapper (tokens)
│   │   │   └── keys.ts            # const STORAGE_KEYS = {...} centralizado
│   │   ├── query/
│   │   │   ├── client.ts          # QueryClient singleton + defaults
│   │   │   └── persister.ts       # MMKV persister para cache offline
│   │   ├── haptics/
│   │   │   └── index.ts           # Wrapper expo-haptics usando motion.haptic
│   │   ├── analytics/
│   │   │   └── index.ts           # PostHog/Amplitude/no-op
│   │   ├── i18n/
│   │   │   ├── index.ts
│   │   │   └── locales/
│   │   │       ├── pt-BR.json
│   │   │       └── en.json
│   │   └── utils/
│   │       ├── date.ts
│   │       ├── format.ts          # kg/lb display, duração mm:ss
│   │       └── math.ts
│   │
│   ├── theme/                     # Design tokens
│   │   ├── motion.ts              # Reanimated durations/easings/haptic map
│   │   ├── colors.ts              # Re-export do tailwind config (tipado)
│   │   ├── typography.ts
│   │   └── index.ts
│   │
│   ├── stores/                    # Zustand stores cross-feature (raros)
│   │   ├── app-store.ts           # Theme override, locale, units
│   │   └── session-bridge.ts      # Comunicação tabs ↔ workout modal
│   │
│   └── types/                     # TS types cross-feature
│       ├── domain.ts              # Zod schemas: Plan, Session, Exercise, SetLog
│       ├── api.ts                 # Tipos de I/O da API
│       └── env.d.ts
│
├── assets/
│   ├── fonts/                     # Inter, Druk Wide / Bebas Neue, JetBrains Mono
│   ├── icons/                     # SVG icons (lucide-react-native preferido)
│   ├── images/
│   └── animations/                # Lottie (.json) — forge anim, etc.
│
├── tests/
│   ├── unit/
│   │   └── features/
│   │       └── workout/
│   │           ├── e1rm.test.ts
│   │           ├── progression.test.ts
│   │           └── volume.test.ts
│   └── e2e/                       # Maestro YAML flows
│       ├── log-first-set.yaml
│       └── complete-workout.yaml
│
├── app.config.ts                  # Expo config (env-aware)
├── babel.config.js                # babel-preset-expo (Reanimated plugin auto)
├── tailwind.config.js             # Ver docs/02-design-spec.md §4
├── metro.config.js                # NativeWind setup
├── tsconfig.json                  # strict, paths aliases
├── eslint.config.js
├── package.json
└── README.md
```

### Por que essa estrutura

- **`app/` é puro routing.** Quem abre o repo sabe imediatamente onde uma URL leva. Quem entende Expo Router lê isso em 2 minutos. Lógica não polui essa camada.
- **`features/` por domínio.** Quando o coach pedir "vamos adicionar deload sugerido", isso é uma feature dentro de `workout/` (ou nova feature `mesocycle/`) — não uma cirurgia espalhada por 12 arquivos.
- **`features/*/lib/` são funções puras.** Esse é o coração testável: `e1rm.ts`, `progression.ts`, `volume.ts` são funções TypeScript sem React, sem MMKV, sem nada — input → output. Testes unitários rodam em milissegundos e dão confiança real (a matemática de coaching é o que diferencia o app).
- **`components/ui/` vs `components/shared/` vs `features/*/components/`.** Três camadas claras de reuso. Botão é `ui/`. Banner offline é `shared/`. Set row é `workout/components/`. Regra para mover algo "pra cima": só quando a 2ª feature precisar.
- **`lib/` é infra, não domínio.** MMKV, QueryClient, haptics — coisas técnicas que não falam de musculação.
- **`theme/` separado de `lib/`.** Tokens são contrato com design, merecem visibilidade.

---

## 2. Camada de dados — Zod como fonte de verdade

```ts
// src/types/domain.ts
import { z } from "zod";

export const MuscleSchema = z.enum([
  "chest", "back_lats", "back_upper", "back_lower",
  "quads", "hamstrings", "glutes", "calves",
  "shoulders_front", "shoulders_side", "shoulders_rear",
  "biceps", "triceps", "forearms", "core",
]);
export type Muscle = z.infer<typeof MuscleSchema>;

export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  primaryMuscle: MuscleSchema,
  secondaryMuscles: z.array(MuscleSchema).default([]),
  equipment: z.enum(["barbell", "dumbbell", "machine", "cable", "bodyweight", "kettlebell"]),
  movementPattern: z.enum(["push_h", "push_v", "pull_h", "pull_v", "squat", "hinge", "lunge", "carry", "isolation"]),
  isUnilateral: z.boolean().default(false),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const SetTypeSchema = z.enum(["warmup", "working", "backoff", "dropset", "myorep"]);

export const SetLogSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  planExerciseId: z.string(),
  setIndex: z.number().int().min(1),
  type: SetTypeSchema.default("working"),
  weight: z.number().min(0).multipleOf(0.5),
  reps: z.number().int().min(0),
  rir: z.number().int().min(0).max(10).nullable(),  // obrigatório no working set, validado em camada de UI
  restTakenSeconds: z.number().int().min(0).nullable(),
  completedAt: z.string().datetime(),
  notes: z.string().max(500).nullable(),
  syncedAt: z.string().datetime().nullable(),       // null = pendente
});
export type SetLog = z.infer<typeof SetLogSchema>;

// ... Session, Plan, PlanDay, PlanExercise, Mesocycle seguem o mesmo padrão
```

**Regras de uso**
- Tipo TS sempre via `z.infer<typeof XSchema>` — nunca declare interfaces duplicadas.
- I/O da API: parse com `XSchema.parse(response)` em `lib/api/client.ts`. Falha de schema = erro logado, UI mostra retry.
- Persistência MMKV: serializa com `JSON.stringify(SetLogSchema.parse(...))` para garantir invariantes.
- Backend (quando definido): mesmos schemas em pacote compartilhado (monorepo) ou gerados por OpenAPI/tRPC.

---

## 3. State management — quem é dono de quê

| Tipo de estado | Ferramenta | Onde mora | Exemplo |
|---|---|---|---|
| Servidor (cache de queries) | TanStack Query | `lib/query/client.ts` + `features/*/api.ts` | Lista de planos, histórico de sessões |
| Client efêmero compartilhado | Zustand (vanilla) | `features/*/store.ts` | Sessão ativa, wizard de onboarding |
| Client global cross-feature | Zustand | `src/stores/*` | Auth user, app settings (units, theme) |
| Local de tela | `useState` / `useReducer` | inline na tela | Visibilidade de sheet, input controlado |
| Persistente offline | MMKV via Zustand `persist` middleware | `features/*/store.ts` | Sets pendentes de sync, cache de exercise picker |
| Animação | Reanimated `useSharedValue` | inline no componente | Progress ring do force-unlock |
| Form | React Hook Form + Zod resolver | inline no form | Sign-up, plan editor |

**Padrão para a sessão ativa (mais crítico):**
```ts
// src/features/workout/store.ts
export const useActiveSessionStore = create<ActiveSessionState>()(
  persist(
    (set, get) => ({
      session: null,
      pendingSets: [],
      startSession: (planDayId) => { /* ... */ },
      logSet: (setLog) => {
        // 1. push para pendingSets imediatamente (optimistic)
        // 2. dispara mutate da API (fire-and-forget, retry pela query layer)
        // 3. on success → marca syncedAt
      },
      endSession: () => { /* ... */ },
    }),
    { name: "active-session", storage: createMMKVStorage() },
  ),
);
```

---

## 4. Camada de roteamento e gates

```tsx
// app/_layout.tsx (esqueleto)
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <QueryProvider>
          <GluestackUIProvider config={config}>
            <AuthGate>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="(app)" />
                <Stack.Screen
                  name="(workout)"
                  options={{ presentation: "fullScreenModal", gestureEnabled: false }}
                />
              </Stack>
            </AuthGate>
          </GluestackUIProvider>
        </QueryProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
```

`AuthGate` lê de `auth/store` + checa `onboardingComplete` e redireciona via `<Redirect />` para a stack apropriada. O Expo Router cuida do resto.

---

## 5. Convenções de código

- **Arquivos kebab-case** (`set-row.tsx`), **componentes PascalCase** (`SetRow`), **hooks `useFooBar`**, **stores `useFooBarStore`**.
- **Path aliases** em `tsconfig.json`:
  ```json
  "paths": {
    "@/*": ["./src/*"],
    "@app/*": ["./app/*"],
    "@features/*": ["./src/features/*"],
    "@ui/*": ["./src/components/ui/*"],
    "@theme/*": ["./src/theme/*"],
    "@lib/*": ["./src/lib/*"]
  }
  ```
- **Barrel exports só em `components/ui/`** — em features, importe direto do arquivo (deps explícitas, melhor tree-shaking, menos circular imports).
- **Sem default exports** (exceto rotas em `app/` que o Expo Router exige).
- **Zero comentários redundantes.** Comentário só pra "porquê não-óbvio" — nunca pra "o quê".
- **Tipos em `<>`, não `as`.** `as` só pra cast em borda (network parse). Internamente, tipo correto desde a origem.
- **Tests co-locados em `tests/unit/features/<feature>/`** espelhando estrutura de `src/features/`.

---

## 6. Pipeline de qualidade

| Etapa | Ferramenta | Quando roda |
|---|---|---|
| Format | Prettier | pre-commit (lint-staged) |
| Lint | ESLint (`eslint-config-expo` + plugin-tailwindcss) | pre-commit + CI |
| Type check | `tsc --noEmit` strict | pre-commit + CI |
| Unit tests | Vitest (puro TS) ou Jest | pre-commit + CI |
| E2E | Maestro | CI nightly + pre-release |
| Build verify | EAS Build (preview channel) | PR para `main` |

---

## 7. Roadmap de implementação (ordem sugerida)

### Fase 0 — Foundation (1-2 dias)
1. `npx create-expo-app@latest ironforge --template default` (ou `tabs`).
2. Instalar e configurar: NativeWind v4, Gluestack UI v3, Reanimated 4, gesture-handler, MMKV, TanStack Query, Zustand, RHF + Zod, expo-haptics, expo-image, lucide-react-native.
3. Aplicar `tailwind.config.js` da §4 do design spec.
4. Criar `src/theme/motion.ts`, `src/lib/storage/mmkv.ts`, `src/lib/query/client.ts`.
5. Esqueleto de pastas conforme §1 (commit vazio com `.gitkeep`).
6. Root `_layout.tsx` com providers.

### Fase 1 — UI primitives + Auth (2-3 dias)
1. `src/shared/ui/*` — Button, Text, Input, Card, Sheet, Skeleton, Chip, EmptyState. Cada um tipado, NativeWind por baixo, light-first (Forest Minimalist).
2. `(auth)` stack com Welcome, SignIn, SignUp (UI completa, mock de auth).
3. `features/auth/store.ts` + `useCurrentUser` hook.
4. `AuthGate` no root layout.

### Fase 2 — Onboarding (1-2 dias)
8 telas sequenciais com progress bar, wizard state em Zustand, persistência MMKV.

### Fase 3 — Today + Plans (lista) (3-4 dias)
1. Tab `(today)` com hero card + week strip + PR card. Mock de dados via TanStack Query com `placeholderData`.
2. Tab `(plans)` com lista, plano ativo, templates curados (seed JSON).
3. `features/plans/lib/` com lógica de cálculo de volume estimado.

### Fase 4 — Workout flow (CORE — 5-7 dias)
1. `features/workout/lib/*` primeiro: `e1rm.ts`, `progression.ts`, `volume.ts`, `pr-detection.ts` com testes unitários.
2. `useActiveSessionStore` com persist MMKV.
3. `WorkoutPreview` screen.
4. `WorkoutLogger` — set table + set row + numeric keypad sheet (custom) + split CTA + force-unlock button.
5. Rest timer + overlay sheet.
6. PR celebration modal.
7. `WorkoutSummary` com agregações pós-sessão.

### Fase 5 — History + Progress (3-4 dias)
1. `(history)` lista + detalhe de sessão.
2. `(progress)` overview + ExerciseDetail com chart Skia + PRs por reps.

### Fase 6 — Plan editor (3-4 dias)
Drag-and-drop de exercícios (react-native-draggable-flatlist), exercise picker com busca/filtro, edição de sets/reps/rest.

### Fase 7 — Profile + polish (2-3 dias)
Settings, units toggle, integrations stub, error boundaries, offline banner, analytics events.

### Fase 8 — Backend integration (paralelizável)
Definir backend (Supabase / própria API) — o `mobile-dev-expert` deve ser consultado. As Zod schemas de §2 viram contrato compartilhado.

---

## 8. O que está fora deste documento (decisões pendentes)

- **Backend**: BaaS (Supabase/Firebase) vs API própria (Node + Postgres). Recomendação inicial: **Supabase** — Auth, Postgres, RLS, Storage, Realtime prontos. Realtime útil para sync entre dispositivos. Edge Functions cobrem lógica server-side.
- **Pagamento/monetização**: RevenueCat para in-app purchase (assinatura); estratégia de paywall fora do MVP, mas a arquitetura suporta.
- **Notifications**: expo-notifications + EAS push. Estratégia (lembrete de treino, descanso completo em background) é decisão de produto.
- **Analytics**: PostHog (open-source friendly) ou Amplitude. Fora do MVP funcional, mas eventos críticos já mapeados (`session_started`, `set_logged`, `pr_achieved`, `session_abandoned`).
- **Internacionalização real**: i18n setup feito, mas só pt-BR no MVP.

---

## 9. Próximo passo concreto

Chamar o `mobile-dev-expert` com:
> "Faça o scaffold da Fase 0 + Fase 1 conforme `docs/03-architecture.md`. Saída esperada: projeto Expo SDK 54+ rodando, estrutura de pastas criada, tokens NativeWind aplicados, primitivos UI funcionais, Welcome screen renderizando."
