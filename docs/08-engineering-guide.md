# IronForge — Guia de Engenharia (como criar uma feature)

> Para qualquer dev que entra no projeto: entenda a arquitetura, o fluxo de dados, e copie o passo-a-passo para criar uma feature nova sem quebrar convenção. Complementa `10-frontend-architecture.md` (arquitetura FSD-lite) e `memories/golden-rules.md` (regras de ouro — leitura obrigatória).

---

## 1. Modelo mental em 30 segundos

```
app/                  → SÓ rota. Importa um <Screen/> da feature e renderiza. Zero lógica.
src/widgets/          → Blocos de UI compostos cross-feature (ex.: WeekStrip, NextWorkoutCard).
src/features/<dom>/   → CASOS DE USO / fluxos. screens + components + hooks + store + api.
src/entities/<dom>/   → DOMÍNIO reutilizável. schema Zod + lógica pura + UI "burra" da entidade.
src/shared/ui/        → Design system BURRO (Button, Text, Card...). Zero regra de negócio.
src/shared/lib/       → Infra (storage, query client, haptics, utils). Não fala de musculação.
src/shared/theme/     → Tokens (cores, motion, tipografia). Nunca hardcode hex/fontSize.
src/types/domain.ts   → Fachada pública; reexporta todos os schemas Zod das entities.
```

**Regra de import (soul of FSD — enforçada por eslint-plugin-boundaries):**
`app → widgets → features → entities → shared → types`. Nunca para cima. Sem import lateral entre slices da mesma camada.

**Path aliases disponíveis:**
- `@app/*` → `./app/*`
- `@widgets/*` → `./src/widgets/*`
- `@features/*` → `./src/features/*`
- `@entities/*` → `./src/entities/*`
- `@shared/*` → `./src/shared/*`
- `@ui/*` → `./src/shared/ui/*` (atalho)
- `@lib/*` → `./src/shared/lib/*` (atalho)
- `@theme/*` → `./src/shared/theme/*` (atalho)
- `@types/*` → `./src/types/*`
- `@/*` → `./src/*` (escape hatch; evitar)

---

## 2. Distinção entity vs feature (decore)

> **entity = substantivo** (Exercise, Session, Plan). **feature = verbo** (logar set, atribuir plano, trocar exercício). **widget = bloco de tela** que junta entities/features.

Se está em dúvida, pergunte: *"é um dado/regra reutilizável (entity) ou uma ação do usuário (feature)?"*

### Camadas e responsabilidades

| Camada | Responsabilidade | Pode ter React? |
|---|---|---|
| `app/<grupo>/x.tsx` | Definir a rota; re-exportar o screen | Sim (1 linha) |
| `widgets/*/` | Bloco de UI composto cross-feature | Sim |
| `features/*/screens/` | Compor a tela (layout, junta hooks + components) | Sim |
| `features/*/components/` | UI específica do fluxo | Sim |
| `features/*/hooks/` | Conectar UI ↔ estado/dados | Sim (hooks) |
| `features/*/store.ts` | Estado client efêmero/persistente (Zustand) | Não (vanilla) |
| `features/*/api.ts` | Chamadas de servidor (TanStack Query) | Não |
| `entities/*/schema.ts` | Schemas Zod + tipos TS | Não |
| `entities/*/lib/*.ts` | **Lógica pura** (cálculo, regra de negócio) | **NÃO** |
| `entities/*/index.ts` | **Public API** da entidade | Não |
| `shared/ui/` | Componentes de design system sem lógica de domínio | Sim |
| `shared/lib/` | Infra: storage, query client, haptics, utils | Não |
| `shared/theme/` | Tokens de design | Não |

---

## 3. Fluxo de dados

### Quem é dono de qual estado
- **Servidor** → TanStack Query (`features/*/api.ts` + `shared/lib/query/client.ts`).
- **Client efêmero/persistente** → Zustand (`features/*/store.ts`), persistido via AsyncStorage.
- **Local de tela** → `useState`/`useReducer`.
- **Form** → React Hook Form + resolver Zod.

### Caminho de LEITURA
```
Screen
  └─ hook da feature (ex.: useNextSession())
       ├─ lê do store (Zustand) — seletor ATÔMICO: useStore(s => s.campo)
       ├─ e/ou lê de query (TanStack) — cache primeiro, rede depois
       └─ passa dados para funções puras de entities/*/lib/
  └─ renderiza com shared/ui/ + shared/theme/
```

### Caminho de ESCRITA (offline-first + optimistic)
```
Usuário toca "registrar set"
  └─ action do store (logSet)
       1. valida com SetLogSchema.parse(...)
       2. atualiza LOCAL imediatamente (optimistic) + persiste
       3. executa lógica pura de entities/ (pr-detection, progression)
       4. dispara mutation da api (fire-and-forget); marca syncedAt no sucesso
       5. em erro: mantém pendente (syncedAt=null) → re-sync quando online
```

---

## 4. Anatomia de uma entidade (entity slice)

```
src/entities/<entidade>/
├── schema.ts          → Schemas Zod + z.infer<> types
├── lib/
│   └── *.ts           → Lógica pura (sem React, sem efeitos colaterais)
└── index.ts           → PUBLIC API — único ponto de entrada para importadores externos
```

**Regra**: código fora de `entities/<entidade>/` só importa de `entities/<entidade>/index.ts`.

---

## 5. Anatomia de uma feature

```
src/features/<feature>/
├── screens/        <feature>-screen.tsx
├── components/      *.tsx
├── hooks/           use-*.ts
├── lib/             *.ts (shims → entities/ enquanto migração acontece)
├── data/            *.ts | *.json (seeds, catálogos locais)
├── store.ts                         
└── api.ts                           
```

---

## 6. Passo a passo: criar uma feature nova

> Exemplo: **"medidas corporais"** (`measurements`)

**1) Schema na entidade** (`src/entities/measurement/schema.ts`)
```ts
import { z } from "zod";
export const MeasurementSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  takenAt: z.string().datetime(),
  bodyweightKg: z.number().min(0).nullable(),
  waistCm: z.number().min(0).nullable(),
  notes: z.string().max(300).nullable().default(null),
});
export type Measurement = z.infer<typeof MeasurementSchema>;
```

**2) Lógica pura** (`src/entities/measurement/lib/trend.ts`)
```ts
import type { Measurement } from "../schema";
export function rollingBodyweight(items: Measurement[], windowDays = 7) { ... }
```

Teste em `tests/unit/entities/measurement/trend.test.ts`.

**3) Public API** (`src/entities/measurement/index.ts`)
```ts
export { MeasurementSchema } from "./schema";
export type { Measurement } from "./schema";
export { rollingBodyweight } from "./lib/trend";
```

**4) Store** (`src/features/measurements/store.ts`)
```ts
import { MeasurementSchema } from "@entities/measurement";
export const useMeasurementsStore = create<...>()(persist(...));
```

**5) Hook** → **Componentes** → **Screen** → **Rota em `app/`** (fino, só wiring).

**6) Verificar:** `npm run typecheck && npm run lint && npm test`.

---

## 7. Convenções que o reviewer vai cobrar

- **FSD-lite.** Lógica de domínio em `entities/*/lib/`. Fluxo de usuário em `features/*/`. Bloco de tela cross-feature em `widgets/`.
- **Public API por slice.** Importar apenas de `entities/<entidade>/index.ts`. Nunca do caminho interno.
- **Zod é a fonte.** Tipo via `z.infer<>`. Nada de interface duplicada. Parse na borda (api/storage).
- **Sem `any`.** Use `unknown` + type guard. Sem default export (exceto rotas em `app/`).
- **kebab-case** em arquivos; **PascalCase** em componentes; **`useFoo`** em hooks; **`useFooStore`** em stores.
- **Tokens sempre.** Cores de `shared/theme/colors.ts`. Nunca hex/fontSize avulso.
- **Zustand atômico.** `useStore(s => s.campo)` — nunca o objeto inteiro.
- **Listas > 20 itens** → `FlatList`/`FlashList`, nunca `.map()` no JSX.
- **Optimistic sempre.** A UI não espera a rede.
- **Haptics** só via `shared/lib/haptics`. **Storage** só via store (nunca direto).
- **Acessibilidade** (crítico): `accessibilityLabel` em todo interativo; touch target ≥44×44.
- **Lógica pura em `entities/*/lib/` com teste.** Se tem cálculo/regra, não faça inline na UI.

---

## 8. Checklist de PR

- [ ] Schema Zod na entity correta com `z.infer<>`.
- [ ] Lógica pura em `entities/*/lib/` com teste unitário.
- [ ] Public API exposta via `entities/*/index.ts`.
- [ ] Feature importa entities via alias, não path interno.
- [ ] `app/` só faz wiring de rota (uma linha de import + `export default`).
- [ ] Tokens de tema (zero hex/fontSize inline).
- [ ] Seletores Zustand atômicos; listas longas virtualizadas.
- [ ] Loading/erro/empty tratados; mutação optimistic.
- [ ] `accessibilityLabel` + touch targets + safe area.
- [ ] `npm run typecheck && npm run lint && npm test` passam.

---

## 9. Como roda o fluxo (visão macro)
```
Cold start → app/_layout.tsx (providers: Theme, Query, GestureHandler, AuthGate)
   └─ AuthGate lê auth/store (User + AthleteProfile)
        ├─ sem sessão        → (auth)
        ├─ sem onboarding    → (onboarding)
        ├─ Atleta            → (app) tabs: Hoje, Histórico, Perfil
        └─ Coach             → (coach) — implementado na Fase B
   └─ Treino abre como modal full-screen ACIMA das tabs: (workout) preview → logger → summary
```
Fonte de verdade do produto: `05-platform-vision.md` (o quê/por quê), `06-platform-spec.md` (features+prioridades), `07-data-model-v2.md` (dados). Este guia é o "como".
