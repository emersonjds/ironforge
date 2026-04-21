# IronForge — Design System & Spec MVP

> Autor: mobile-ui-ux-designer agent · Handoff direto para engenharia.
> Stack: Expo + RN + NativeWind v4 + Gluestack UI v3 + Reanimated 4.

---

## 1. Inventário de telas do MVP

### Auth (Stack)
| Tela | Propósito | Tipo |
|---|---|---|
| `SplashScreen` | Brand reveal + bootstrap de sessão/cache. | stack (root) |
| `WelcomeScreen` | Hero forge + dois CTAs (criar conta / entrar). | stack |
| `SignInScreen` | Login email/senha + Apple/Google. | stack |
| `SignUpScreen` | Cadastro mínimo (email, senha, nome). | stack |
| `ForgotPasswordSheet` | Recuperação de senha sem sair do contexto. | sheet |

### Onboarding (Stack — modal full screen pós-signup)
| Tela | Propósito | Tipo |
|---|---|---|
| `OnbBasics` | Objetivo (hipertrofia / força / cutting) + Unidades (kg/lb) + Nível de experiência — 3 perguntas numa tela, seleção por chip, sem scroll. | stack |
| `OnbFrequency` | Dias/semana disponíveis (3–6) + horário preferido (manhã / tarde / noite) — calibra sugestão de sessão no Today. | stack |
| `OnbPlanPick` | Templates sugeridos pelo coach com detalhes completos (PPL, Upper/Lower, Bro Split, Full Body, nSuns, 5/3/1, Upper/Lower Força, Push-Pull) — scroll horizontal, tap para preview, "Criar do zero" ao final. | stack |
| `OnbReady` | "Forja pronta" + animação de forja + CTA `INICIAR PRIMEIRO TREINO`. | stack |

> **Decisão de design — redução de fricção pré-primeira-sessão:** 8 telas era churn antes do primeiro treino. Hevy tem 4 steps, Strong tem 2 (pesquisa §5 S1-R5). Para P1 (lifter intermediário que já sabe o que quer), perguntar cada dado numa tela separada é burocracia, não personalização. A compressão para 4 telas preserva todos os dados necessários para calibração do coach sem sacrificar taxa de conclusão do onboarding. **Dados removidos do onboarding:** peso/altura/foto de progresso → opcionais em `ProfileScreen` após o primeiro treino concluído; permissões de notificações e HealthKit/HealthConnect → solicitadas inline na `TodayScreen` no contexto certo (push ao final da primeira sessão, Health ao primeiro registro de peso), nunca como etapa de onboarding.

### Main Tabs (Bottom Tabs)
| Tela | Propósito | Tipo |
|---|---|---|
| `TodayScreen` (tab 1) | Treino do dia + estado motivacional + atalho rápido. | tab |
| `PlansScreen` (tab 2) | Lista/seleção/edição de planos e templates. | tab |
| `HistoryScreen` (tab 3) | Calendário + lista de sessões + filtros. | tab |
| `ProgressScreen` (tab 4) | PRs, volume, gráficos por exercício/grupo. | tab |
| `ProfileScreen` (tab 5) | Conta, unidades, integrações, logout. | tab |

### Workout Flow (Stack acima das tabs, full screen modal)
| Tela | Propósito | Tipo |
|---|---|---|
| `WorkoutPreview` | Resumo da sessão (exercícios, volume estimado, duração). | modal stack |
| `WorkoutLogger` | **A tela mais importante**: log de séries em tempo real. | modal stack (root do flow) |
| `RestTimerOverlay` | Timer persistente (chip flutuante + full sheet). | overlay/sheet |
| `ExerciseSwapSheet` | Trocar exercício no meio da sessão. | sheet |
| `ExerciseInfoSheet` | Vídeo/notas/forma do exercício. | sheet |
| `WorkoutSummary` | Pós-sessão: PRs batidos, volume total, delta por exercício, share. | stack |

**SupersetGroup — padrão visual no WorkoutLogger**

Pares de `PlanExercise` vinculados com `is_superset_with` são renderizados como grupo visual no logger:

- Borda compartilhada contínua (`border border-ember-500/40 rounded-xl`) envolvendo os dois blocos de exercício, com um traço vertical ember (`w-0.5 bg-ember-500`) conectando os dois headers.
- Label `SUPERSET A/B` aparece acima do par (uppercase, `text-2xs font-semibold tracking-widest text-ember-400`).
- Header do keypad mostra exercício ativo do par: `SUPERSET · Agora: Curl direto` / `SUPERSET · Agora: Tríceps corda`.
- Rest timer **não dispara** após completar o último set do primeiro exercício. Dispara apenas após completar o último set do segundo exercício.
- Indicadores durante a sessão: "SUPERSET 1/2" no topo do logger enquanto ativo no primeiro exercício, "SUPERSET 2/2" durante o segundo — substituem o header de exercício normal.
- Spec de modelo de dados: `PlanExercise.is_superset_with: UUID | null` (relação 1:1, sempre bidirecional — se A aponta para B, B deve apontar para A; validado no PlanEditor).

### Plans Flow (Stack dentro de tab Plans)
| Tela | Propósito | Tipo |
|---|---|---|
| `PlanDetail` | Estrutura semanal + exercícios por dia. | stack |
| `PlanEditor` | Drag-and-drop de exercícios, sets, reps, RPE alvo. | stack |
| `ExercisePicker` | Busca + filtros (grupo, equipamento). | stack/sheet |
| `TemplateGallery` | Templates curados pelo coach. | stack |

### Progress Flow (Stack dentro de tab Progress)
| Tela | Propósito | Tipo |
|---|---|---|
| `ExerciseDetail` | PRs por reps, gráfico estimado 1RM, histórico de séries. | stack |
| `MuscleGroupDetail` | Volume semanal/mensal por grupo. | stack |
| `BodyMeasurements` | Peso, medidas, fotos progress (opcional). | stack |

### Modais globais
| Tela | Propósito | Tipo |
|---|---|---|
| `PRCelebrationModal` | Confete sóbrio + share quando bate PR. | modal |
| `EndSessionConfirmSheet` | Confirma encerrar treino incompleto. | sheet |
| `PlateCalculatorSheet` | Calcula anilhas para a barra. | sheet |
| `RPEGuideSheet` | Tabela RPE 1–10 inline. | sheet |
| `UnitToggleSheet` | Troca rápida kg/lb. | sheet |

**Total MVP:** ~33 telas/sheets.

---

## 2. Estrutura de navegação

```
RootNavigator (Stack)
├── (auth) AuthStack            [não autenticado]
│   ├── Splash
│   ├── Welcome
│   ├── SignIn
│   ├── SignUp
│   └── ForgotPasswordSheet
│
├── (onboarding) OnbStack       [autenticado, sem perfil completo]
│   └── 4 telas sequenciais com progress bar (OnbBasics → OnbFrequency → OnbPlanPick → OnbReady)
│
├── (app) MainTabs              [autenticado + perfil completo]
│   ├── Today        ─→ TodayStack     (Today, Notifications)
│   ├── Plans        ─→ PlansStack     (List, Detail, Editor, Picker)
│   ├── History      ─→ HistoryStack   (List, SessionDetail)
│   ├── Progress     ─→ ProgressStack  (Overview, ExerciseDetail, MuscleGroup, Body)
│   └── Profile      ─→ ProfileStack   (Profile, Settings, Integrations)
│
└── (workout) WorkoutModalStack [presentation: fullScreenModal]
    ├── Preview
    ├── Logger
    └── Summary
```

### Justificativa de 5 tabs
Quatro tabs é o ideal cognitivo, mas musculação tem **cinco verbos canônicos** que o usuário executa em ciclos diferentes: **treinar hoje, planejar, revisar passado, medir progresso, ajustar conta**. Compactar Plans+History numa só tab esconde planejamento (ação semanal de alta intenção) atrás de fricção. Esconder Progress no Profile mata o loop dopamínico que retém o usuário. Cinco tabs com ícones + labels (8sp) cabe em 360dp sem aperto. Workout não é tab — é **modal fullscreen** porque é estado modal real (não dá para "navegar pra outra tab" no meio de uma série).

---

## 3. Wireframes ASCII de fluxos críticos

### 3.1 Onboarding (primeiro uso → primeira sessão)

```
┌──────────────┐    ┌──────────────┐    ┌───────────────────────────────────────┐
│   Welcome    │───>│   SignUp     │───>│  OnbBasics              ●○○○           │
│              │    │              │    │ ─────────────────────────────────────  │
│ [Forge hero] │    │ Email        │    │  OBJETIVO                              │
│              │    │ Senha        │    │  [Hipertrofia] [Força] [Cutting]       │
│ [Criar]      │    │              │    │                                        │
│ [Entrar]     │    │ [Continuar]  │    │  EXPERIÊNCIA                           │
└──────────────┘    └──────────────┘    │  [Iniciante] [Intermediário] [Avançado]│
                                        │                                        │
                                        │  UNIDADES                              │
                                        │  [kg ●] [lb ○]    [cm ●] [in ○]       │
                                        │                                        │
                                        │  [CONTINUAR]                           │
                                        └───────────────────┬───────────────────┘
                                                            │
                                                            v
┌───────────────────────────────────────┐    ┌─────────────────────────────────────┐
│  OnbFrequency               ●●○○       │    │  OnbPlanPick              ●●●○       │
│ ─────────────────────────────────────  │    │ ───────────────────────────────────  │
│  DIAS POR SEMANA                       │    │  ESCOLHA SEU PONTO DE PARTIDA        │
│  ○ 3   ○ 4   ● 5   ○ 6                │    │                                      │
│                                        │    │  ◄ scroll horizontal ►               │
│  HORÁRIO PREFERIDO                     │    │  ┌──────────┐ ┌──────────┐           │
│  [Manhã] [Tarde●] [Noite]             │    │  │PPL · 6d  │ │Up/Low 4d │  ...      │
│                                        │    │  │Avançado  │ │Intermed. │           │
│  (calibra sugestão de sessão no Today) │    │  │[Preview] │ │[Preview] │           │
│                                        │    │  └──────────┘ └──────────┘           │
│  [CONTINUAR]                           │    │                                      │
└──────────────────────┬─────────────────┘    │  ─── DO ZERO ───                     │
                       │                      │  [Construir meu plano]               │
                       └──────────────────────►                                      │
                                              │  [USAR ESTE PLANO]                   │
                                              └───────────────────┬─────────────────┘
                                                                  │
                                                                  v
                    ┌─────────────────────────┐    ┌──────────────────────────────┐
                    │  OnbReady       ●●●●     │───>│   Today (primeira vez)       │
                    │ ───────────────────────  │    │  ┌─────────────────────────┐ │
                    │                         │    │  │ "Forja acesa, [Nome]"   │ │
                    │  [animação forja acende] │    │  └─────────────────────────┘ │
                    │                         │    │  Treino A · Push             │
                    │  [INICIAR PRIMEIRO       │    │  6 exercícios · ~58min       │
                    │   TREINO]               │    │  ┌─────────────────────────┐ │
                    └─────────────────────────┘    │  │   ► COMEÇAR TREINO      │ │
                                                   │  └─────────────────────────┘ │
                                                   └──────────────────────────────┘
```

> Chips de seleção nos três grupos do `OnbBasics` usam `Pressable` com `border-ember-500` ao selecionar — nenhum campo de texto, zero teclado, 3 toques e avança. Peso/altura/foto de progresso entram em `ProfileScreen` após o primeiro treino. Permissões (notificações, HealthKit) são pedidas inline na `TodayScreen` no momento de maior motivação — ao final da primeira sessão concluída, não antes.

### 3.2 Sessão de treino ativa (logger)

```
┌─────────────────────────────────────────┐
│ ←   Push A          ⏱ 24:18    ⋯       │  ← header sticky, X confirm
├─────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓░░░░░░░░  exercício 3/6         │  ← progress
├─────────────────────────────────────────┤
│                                         │
│  SUPINO RETO  ·  barra                  │
│  PR atual: 110kg × 5    [info ⓘ]       │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ Set │ Anterior │ kg   │ reps │ ✓ │  │
│  ├─────┼──────────┼──────┼──────┼───┤  │
│  │  1  │ 100×8    │ 100  │  8   │ ● │  │  ← logged (verde)
│  │  2  │ 100×8    │ 100  │  8   │ ● │  │
│  │  3  │ 100×7    │[100] │ [_]  │ ○ │  │  ← ATIVO (highlight ember)
│  │  4  │ 100×6    │ 100  │  -   │ ○ │  │
│  └───────────────────────────────────┘  │
│                                         │
│  + Adicionar série                      │
│                                         │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │       ✓ COMPLETAR SÉRIE          │   │  ← CTA primário 56dp
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ ◄  anterior   │  próximo ►              │
└─────────────────────────────────────────┘

[Após tap em ✓]
        │
        v
┌─────────────────────────────────────────┐
│ ⏱  DESCANSO  02:00 → 01:43             │  ← bottom sheet 40% height
│ ━━━━━━━━━━━░░░░░░░░░░                   │
│ Próximo: Set 4 · meta 100×6             │
│                                         │
│ [-15s]  [+15s]   [Pular descanso]      │
└─────────────────────────────────────────┘
```

### 3.3 Visualizar progresso (PR + volume semanal)

```
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  Progress                   │    │ ←  Supino Reto              │
│ ─────────────────────────── │    │ ─────────────────────────── │
│  Esta semana                │    │  ┌───────────────────────┐  │
│  ┌──────────────────────┐   │    │  │  PR ESTIMADO 1RM      │  │
│  │   VOLUME             │   │    │  │     128 kg            │  │
│  │   12.480 kg ▲ 8%     │   │    │  │     ▲ +4kg em 30d     │  │
│  │   ▁▃▅▂▇▄▆            │   │    │  └───────────────────────┘  │
│  └──────────────────────┘   │    │                             │
│                             │    │  Gráfico (90d)              │
│  PRs RECENTES               │    │  ┌───────────────────────┐  │
│  ─────────                  │    │  │       ╱─╮  ╱╲   ╱     │  │
│  Supino     128kg  +4 ▲     │ ─> │  │     ╱   ╰╱  ╰─╱       │  │
│  Agachamento 160kg +5 ▲     │    │  │   ╱                   │  │
│  Levantamento 180kg —       │    │  │ ╱                     │  │
│                             │    │  └───────────────────────┘  │
│  POR GRUPO                  │    │  [7d] [30d] [90d] [1y]      │
│  Peito   ████████░░ 18 sets │    │                             │
│  Costas  ██████████ 22 sets │    │  PRs por reps               │
│  Pernas  ███████░░░ 16 sets │    │  1RM  128kg  · 12/04        │
│  Ombros  ████░░░░░░  9 sets │    │  3RM  118kg  · 05/04        │
│  Braços  ██████░░░░ 14 sets │    │  5RM  110kg  · 28/03        │
│                             │    │  8RM  100kg  · 14/03        │
│  [Ver detalhes >]           │    │                             │
└─────────────────────────────┘    └─────────────────────────────┘
```

### 3.4 Criar / escolher plano

```
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  Plans                  +   │    │  Templates                  │
│ ─────────────────────────── │    │ ─────────────────────────── │
│  ATIVO                      │    │  CURADOS                    │
│  ┌────────────────────────┐ │    │  ┌────────────────────────┐ │
│  │ ◉ Push Pull Legs       │ │    │  │ PPL · 6d/sem  ★★★★★    │ │
│  │   6 dias · semana 4    │ │    │  │ Avançado · hipertrofia │ │
│  │   ─────────────        │ │    │  └────────────────────────┘ │
│  │   [Editar][Trocar]     │ │    │  ┌────────────────────────┐ │
│  └────────────────────────┘ │    │  │ Upper/Lower · 4d  ★★★★ │ │
│                             │    │  │ Intermediário · força  │ │
│  MEUS PLANOS                │ ─> │  └────────────────────────┘ │
│  ─────────                  │    │  ┌────────────────────────┐ │
│  ○ Upper/Lower 4d           │    │  │ 5/3/1 · 4d  ★★★★★      │ │
│  ○ Bro Split clássico       │    │  │ Avançado · força pura  │ │
│  ○ Full Body 3d             │    │  └────────────────────────┘ │
│                             │    │                             │
│  ┌────────────────────────┐ │    │  ─── DO ZERO ───            │
│  │ + Criar do zero         │ │    │  ┌────────────────────────┐ │
│  └────────────────────────┘ │    │  │  Construir plano custom │ │
│  ┌────────────────────────┐ │    │  └────────────────────────┘ │
│  │ Explorar templates >    │ │    └─────────────────────────────┘
│  └────────────────────────┘ │              │
└─────────────────────────────┘              v
                                  ┌─────────────────────────────┐
                                  │ ←  PPL · Detalhe            │
                                  │ ─────────────────────────── │
                                  │  Seg · PUSH A               │
                                  │   1. Supino reto 4×6-8      │
                                  │   2. Inclinado halt. 3×8-10 │
                                  │   3. Crossover 3×12-15      │
                                  │   ...                       │
                                  │  Ter · PULL A               │
                                  │   ...                       │
                                  │  ┌───────────────────────┐  │
                                  │  │  USAR ESTE PLANO       │  │
                                  │  └───────────────────────┘  │
                                  └─────────────────────────────┘
```

---

## 4. Design tokens

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // dark-mode-first; default class on root
  theme: {
    extend: {
      colors: {
        // BACKGROUND / SURFACE — frio, áspero, dark-first
        bg: {
          DEFAULT: "#0A0A0B",
          raised:  "#111114",
          sunken:  "#050506",
          overlay: "rgba(10,10,11,0.72)",
        },
        surface: {
          50: "#F4F4F5", 100: "#E4E4E7", 200: "#A1A1AA", 300: "#71717A",
          400: "#52525B", 500: "#3F3F46", 600: "#27272A", 700: "#1F1F23",
          800: "#18181B", 900: "#0F0F11", 950: "#0A0A0B",
        },
        ember: {
          50: "#FFF4ED", 100: "#FFE6D5", 200: "#FFC8AA", 300: "#FFA274",
          400: "#FF7A3C", 500: "#FF5A1F", 600: "#F03E08", 700: "#C42E08",
          800: "#9C260F", 900: "#7E2210", 950: "#440D04",
        },
        steel: {
          50: "#F1F5F9", 100: "#E2E8F0", 200: "#CBD5E1", 300: "#94A3B8",
          400: "#64748B", 500: "#475569", 600: "#334155", 700: "#1E293B",
          800: "#0F172A", 900: "#0A1220", 950: "#050912",
        },
        success: { DEFAULT: "#22C55E", muted: "#0F2A18", strong: "#16A34A" },
        warning: { DEFAULT: "#F59E0B", muted: "#2A1D08", strong: "#D97706" },
        error:   { DEFAULT: "#EF4444", muted: "#2A0F0F", strong: "#DC2626" },
        info:    { DEFAULT: "#3B82F6", muted: "#0E1A2E", strong: "#2563EB" },
        text: {
          primary: "#FAFAFA", secondary: "#A1A1AA", tertiary: "#71717A",
          disabled: "#3F3F46", inverse: "#0A0A0B", accent: "#FF7A3C",
        },
        border: {
          subtle: "#1F1F23", DEFAULT: "#27272A", strong: "#3F3F46", accent: "#FF5A1F",
        },
      },
      fontFamily: {
        display: ["Druk Wide", "Bebas Neue", "Inter", "system-ui"],
        sans:    ["Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace"],
      },
      fontSize: {
        "2xs":  ["10px", { lineHeight: "14px", letterSpacing: "0.04em" }],
        "xs":   ["12px", { lineHeight: "16px", letterSpacing: "0.02em" }],
        "sm":   ["14px", { lineHeight: "20px" }],
        "base": ["16px", { lineHeight: "24px" }],
        "lg":   ["18px", { lineHeight: "26px" }],
        "xl":   ["20px", { lineHeight: "28px" }],
        "2xl":  ["24px", { lineHeight: "32px", letterSpacing: "-0.01em" }],
        "3xl":  ["30px", { lineHeight: "36px", letterSpacing: "-0.02em" }],
        "4xl":  ["36px", { lineHeight: "40px", letterSpacing: "-0.02em" }],
        "5xl":  ["48px", { lineHeight: "52px", letterSpacing: "-0.03em" }],
        "metric-xl": ["64px", { lineHeight: "64px", letterSpacing: "-0.04em", fontWeight: "800" }],
      },
      fontWeight: {
        regular: "400", medium: "500", semibold: "600", bold: "700", black: "900",
      },
      spacing: {
        "0": "0px", "1": "4px", "2": "8px", "3": "12px", "4": "16px",
        "6": "24px", "8": "32px", "12": "48px", "16": "64px", "24": "96px",
        "safe-bottom": "env(safe-area-inset-bottom, 24px)",
      },
      borderRadius: {
        none: "0px", xs: "4px", sm: "8px", md: "12px", lg: "16px",
        xl: "20px", "2xl": "24px", pill: "999px",
      },
      transitionDuration: {
        instant: "80", fast: "160", base: "240", slow: "360", epic: "560",
      },
      transitionTimingFunction: {
        iron:   "cubic-bezier(0.22, 1, 0.36, 1)",
        forge:  "cubic-bezier(0.32, 0, 0.67, 0)",
        anvil:  "cubic-bezier(0.65, 0, 0.35, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      boxShadow: {
        none: "none",
        glow: "0 0 0 1px rgba(255,90,31,0.20), 0 8px 24px -8px rgba(255,90,31,0.35)",
        lift: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 16px -8px rgba(0,0,0,0.6)",
        sheet: "0 -8px 32px -8px rgba(0,0,0,0.7)",
      },
    },
  },
};
```

### Tokens fora do Tailwind (`src/theme/motion.ts`)

```ts
import { Easing } from "react-native-reanimated";

export const motion = {
  duration: { instant: 80, fast: 160, base: 240, slow: 360, epic: 560 },
  easing: {
    iron:   Easing.bezier(0.22, 1, 0.36, 1),
    forge:  Easing.bezier(0.32, 0, 0.67, 0),
    anvil:  Easing.bezier(0.65, 0, 0.35, 1),
    spring: { damping: 14, stiffness: 180, mass: 0.9 },
  },
  haptic: {
    tap:        "selection",
    setLogged:  "impactMedium",
    pr:         "notificationSuccess",
    error:      "notificationError",
    longPress:  "impactHeavy",
  },
} as const;
```

---

## 5. Specs detalhados — 4 telas críticas

### 5.1 Home / Today

```
┌─────────────────────────────────────────┐
│  ☀ Bom dia, Cazlu                  ⚙   │
│  Sexta · 20 abr · semana 4              │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   PRÓXIMO TREINO                  │  │
│  │                                   │  │
│  │   PUSH A                          │  │
│  │   peito · ombro · tríceps         │  │
│  │                                   │  │
│  │   6 exercícios   ~58 min          │  │
│  │   volume alvo: 8.4t               │  │
│  │                                   │  │
│  │   ┌─────────────────────────────┐ │  │
│  │   │     ► COMEÇAR TREINO        │ │  │
│  │   └─────────────────────────────┘ │  │
│  │   trocar para outro dia ↻         │  │
│  └───────────────────────────────────┘  │
│                                         │
│  VOLUME DA SEMANA                       │
│  ┌───────────────────────────────────┐  │
│  │        ┌─┐   ┌─┐                 │  │
│  │       ┌┤ ├───┤ ├┐                │  │
│  │       │ PEITO  COSTA│            │  │
│  │       │12/18  22/22 │            │  │
│  │       └─────────────┘            │  │
│  │  (silhueta front view · SVG)     │  │
│  │  steel-700 → ember-500 por       │  │
│  │  intensidade vs. MEV-MAV        │  │
│  │  Tap grupo → MuscleGroupDetail  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ESTA SEMANA                            │
│  ┌───┬───┬───┬───┬───┬───┬───┐         │
│  │ S │ T │ Q │ Q │ S │ S │ D │         │
│  │ ● │ ● │ ● │ ● │ ◉ │ ○ │ ○ │         │
│  └───┴───┴───┴───┴───┴───┴───┘         │
│  4 de 6 sessões · streak 12d 🔥         │
│                                         │
│  PR DE ONTEM                            │
│  ┌───────────────────────────────────┐  │
│  │ Agachamento  160kg × 5  +5kg ▲   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Componentes Gluestack**
- `SafeAreaView` → `ScrollView` → `VStack space="6" px="4" pt="6"`
- Header: `HStack justifyContent="space-between" alignItems="center"`
- Hero card: `Pressable` (toda área tappable) → `VStack` com `Box bg="bg-raised" rounded="xl" p="6"`
- CTA: `Button size="xl" variant="solid" action="primary"` (`bg-ember-500`, label `font-display uppercase tracking-wide`)
- **Volume da Semana** (componente `WeeklyVolumeDiagram`): `Box bg="bg-raised" rounded="xl" p="4"` height 120dp. Implementar como SVG via `react-native-svg`: silhueta humana frontal simplificada (paths anatômicos por grupo muscular — peito, costas, ombros, bíceps, tríceps, quadríceps, posterior, abdômen). Fill de cada grupo: interpolação linear entre `steel-700` (#1E293B) e `ember-500` (#FF5A1F) conforme `hard_sets_semana / mav_sets_grupo` (clampado em 0–1). Números sobrepostos por grupo: `text-2xs font-semibold` (`sets_feitos/mav`). Tap em qualquer grupo: `Pressable` wrapper com `onPress → navigate('MuscleGroupDetail', { group })`. Sem teclado, sem sheet — navegação direta.
- Week strip: `HStack space="2"` de `Pressable`s 40dp×40dp
- PR card: `Box bg="bg-raised" rounded="lg" p="4"` com `HStack`

**Estados**
| Estado | Comportamento |
|---|---|
| **default** | Treino do dia carregado, week strip preenchida. |
| **loading** | Skeleton no hero card, shimmer 1200ms loop. |
| **success** | Toast `bg-success-muted` border-l ember 240ms. |
| **error** | Hero card vira `Box border border-error`: "Não foi possível carregar treino. [Tentar de novo]". |
| **empty** | Hero substituído: "Sem plano ativo. [Escolher um plano]" + ícone forge apagada. |
| **rest day** | Hero "Hoje é descanso. Recuperação > volume." + CTA secundário "Treino extra". |
| **offline** | Banner topo `bg-warning-muted`. |

**Microcopy**
- Saudação contextual + nome.
- CTA: `► COMEÇAR TREINO` (uppercase, display).
- Empty: `Forja apagada. Escolha seu primeiro plano.` · CTA `EXPLORAR PLANOS`.

**Motion**
| Elemento | Propriedade | Duração | Easing | Haptic |
|---|---|---|---|---|
| Hero card entrada | `opacity 0→1 + translateY 12→0` | 360ms | anvil | — |
| Tap no hero | `scale 1→0.98→1` | 160ms | iron | selection |
| Week strip dot ativo | `scale 1→1.1` pulse loop | 1800ms | iron | — |
| Streak flame | `rotate ±2°` loop sutil | 2400ms | linear | — |
| WeeklyVolumeDiagram mount | SVG `strokeDashoffset` desenha contorno da silhueta → fill de cada grupo muscular em stagger 80ms por grupo (peito → costas → ombros → braços → pernas → abdômen) | contorno 400ms iron, fill total ~560ms stagger | iron | — |
| Tap em grupo muscular | `scale 1→0.96→1` no path SVG do grupo | 160ms | iron | selection |

---

### 5.2 Workout Logger (a tela mais importante)

```
┌─────────────────────────────────────────┐
│  ✕   Push A · 24:18              ⋯     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  ex 3 de 6     │
├─────────────────────────────────────────┤
│  SUPINO RETO                       ⓘ   │
│  barra olímpica · banco plano           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Histórico: 100×8, 100×8, 100×7  │   │
│  └─────────────────────────────────┘   │
│  PR 110kg×5 · 1RM est. 128kg            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │SET│ ANTERIOR │  KG   │  REPS │ RPE │ │
│ ├───┼──────────┼───────┼───────┼─────┤ │
│ │ 1 │ 100×8    │ 100.0 │   8   │  7  │ ✓
│ │ 2 │ 100×8    │ 100.0 │   8   │  8  │ ✓
│ │ 3 │ 100×7    │┃100.0┃│ ┃ _ ┃ │  -  │ ◉ ATIVO
│ │ 4 │ 100×6    │ 100.0 │   -   │  -  │ ○
│ └─────────────────────────────────────┘ │
│                                         │
│  + Adicionar série     ⌫ Remover última │
│  Notas: ┌─────────────────────────┐     │
│         │ pegada 1.5x ombro       │     │
│         └─────────────────────────┘     │
├─────────────────────────────────────────┤
│  ┌────────────┬────────────────────┐    │
│  │  ⏱ 02:00   │ ✓ COMPLETAR SÉRIE  │    │
│  └────────────┴────────────────────┘    │
└─────────────────────────────────────────┘

Bottom-sheet teclado numérico custom:
┌─────────────────────────────────────────┐
│  ┌──── KG ────┬──── REPS ───┬── RIR ──┐ │  ← segmented control, foco auto-avança
│  └────────────┴─────────────┴─────────┘ │    após confirmar; swipe lateral alterna
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐ │
│  │         = ANTERIOR  100×8           │ │  ← primário 56dp fullwidth, bg-ember-500/20
│  │              border-ember-500       │ │    border-ember-500; 1 toque confirma tudo
│  └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│   7    8    9         [+2.5]  [+5]      │
│   4    5    6         [-2.5]  [-5]      │
│   1    2    3                           │
│   .    0    ⌫         [✓ CONFIRMAR]    │
└─────────────────────────────────────────┘

> **Decisão de layout — "= anterior" como botão primário (não terciário):** ~85% dos sets repete o peso da sessão anterior. Colocar o teclado numérico no topo com "= anterior" como fallback escondido inverte a frequência de uso: o caso comum vira exceção, e o caso exceção (alterar o peso) vira o caminho principal. O layout acima corrige isso — "= anterior" ocupa topo fullwidth em destaque ember, teclado numérico fica abaixo para os ~15% de casos onde há mudança. Não é uma feature extra — é a hierarquia de informação correta para um lifter real. Ver também §6.4.
```

**Componentes Gluestack**
- Root: `KeyboardAvoidingView` desativado (sheet custom) → `VStack flex={1}`
- Header: `HStack` com `Pressable` X + `Heading` + timer (`Text font-mono`) + `Pressable` ⋯ que abre `Actionsheet`
- Progress: `Progress value={50} variant="ember"` (height 3dp)
- Set table: `VStack space="2"` de `HStack` rows; cada row é `Pressable` (long press = editar)
- Inputs: NÃO usar `Input` padrão — `Pressable` que abre `KeypadSheet` custom
- CTA principal: `HStack space="0"` com `Button` timer + `Button` confirmar (70%)
- Rest overlay: `Actionsheet` snap points `[160, '50%']`
- **Keypad — sequência KG → REPS → RIR sem tap extra:** segmented control no topo do `KeypadSheet` mostra os 3 campos na ordem de entrada. Ao tocar em "✓ CONFIRMAR" (ou ao selecionar "= anterior"), o foco avança automaticamente para o próximo campo — nenhum tap de transição. Swipe lateral no keypad sheet alterna entre campos. RIR nunca deve exigir tap extra para aparecer — está sempre presente como terceiro segment, pré-preenchido com o valor da sessão anterior. O lifter nunca faz mais de 3 gestos para confirmar uma série completa (= anterior → confirmar → PR haptic). Se exigir mais, o RIR vai ser pulado.
- **Supersets na tabela de sets:** dois blocos de exercício com `border-l-2 border-ember-500` compartilhado como traço vertical conectando os dois headers. Header acima do par alterna: `SUPERSET 1/2` durante exercício A, `SUPERSET 2/2` durante exercício B — em `text-2xs font-semibold tracking-widest text-ember-400`. Rest timer: estado `disabled` (cinza, inativo) enquanto no primeiro exercício do par; ativa apenas após confirmar o último set do segundo. O visual do timer no bottom CTA reflete isso: área do timer aparece em `steel-700` com label `APÓS O PAR` durante exercício A.

**Estados**
| Estado | Comportamento |
|---|---|
| **default** | Set ativo destacado com ring `border-ember-500`. |
| **logging** | Row pisca `bg-success-muted` 240ms, scale 1→1.02→1, haptic `impactMedium`, próxima row vira ativa, rest timer dispara. |
| **PR detectado** | `PRCelebrationModal` overlay 560ms, confete sóbrio (8 partículas ember), haptic `notificationSuccess`. |
| **loading sync** | Indicador inline 12dp na coluna ✓, optimistic. |
| **error sync** | Row vira `border-error` com ↻ tap-to-retry (não interrompe próximo set). |
| **empty** | "Anterior" mostra "—", placeholder "kg alvo". |
| **offline** | Badge persistente: "OFFLINE · 3 séries pendentes". |
| **rest active** | Timer no header pulsa, overlay sheet visível, conteúdo logger blur 4dp. |
| **session abandon** | `Actionsheet`: "Encerrar treino? 3 de 6 exercícios feitos." |

**Microcopy**
- CTA: `✓ COMPLETAR SÉRIE` (display, uppercase).
- Pós-PR: `NOVO PR · Supino 110×6` + subtexto `+5kg em 14d`.
- Empty notas: `notas (pegada, sensação, falha técnica…)`.
- Confirm sair: `Encerrar treino?` · `Salvar e sair` / `Descartar` / `Continuar`.

**Motion**
| Elemento | Propriedade | Duração | Easing | Haptic |
|---|---|---|---|---|
| Confirmar série | `scale row 1→1.02→1` + `bg success-muted→bg-raised` | 240ms | iron | impactMedium |
| Próximo set ativa | `border opacity 0→1` + `translateY 8→0` | 160ms | iron | selection |
| Keypad sheet entra | `translateY 100%→0` | 240ms | anvil | — |
| Rest sheet entra | `translateY 100%→0 + opacity 0→1` | 240ms | anvil | impactLight |
| Timer último 3s | `scale 1→1.1` + `color → warning` | 360ms loop | iron | selection a cada s |
| Timer fim | `scale 1→1.2→1` + ring expand | 360ms | spring | notificationSuccess |
| PR badge | confete particles `translateY + rotate + opacity` | 560ms | spring | notificationSuccess |
| Tap tab proibido | shake horizontal `±4px` | 160ms | iron | notificationError |

---

### 5.3 Exercise Detail / PR

```
┌─────────────────────────────────────────┐
│  ←  Supino Reto                    ⋯   │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │  1RM ESTIMADO                     │  │
│  │     128 kg                        │  │
│  │     ▲ +4kg em 30d                 │  │
│  └───────────────────────────────────┘  │
│                                         │
│  GRÁFICO                                │
│  ┌───────────────────────────────────┐  │
│  │ 130┤              ╱─╮              │  │
│  │ 120┤         ╱──╯   ╰─╮     ╱──    │  │
│  │ 110┤    ╱──╯           ╰──╯        │  │
│  │ 100┤──╯                            │  │
│  │     90d        60d        30d  hoje│  │
│  └───────────────────────────────────┘  │
│  [7d] [30d] [90d●] [1y] [tudo]          │
│                                         │
│  PR POR REPS                            │
│  1RM    128 kg   12 abr      🥇         │
│  3RM    118 kg   05 abr                 │
│  5RM    110 kg   28 mar                 │
│  8RM    100 kg   14 mar                 │
│  10RM    95 kg   01 mar                 │
│                                         │
│  HISTÓRICO DE SÉRIES                    │
│  19 abr · Push A                        │
│   100×8  100×8  100×7  100×6            │
│  16 abr · Push A                        │
│   97.5×8 97.5×8 97.5×7 97.5×6           │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │   ►  ADICIONAR AO TREINO DE HOJE  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Componentes Gluestack**
- `ScrollView` → `VStack space="8" px="4" pt="4"`
- Hero: `Box bg="bg-raised" rounded="xl" p="6"` com `Heading size="metric-xl" font-display`
- Gráfico: `Box` wrapping `<react-native-skia>` chart, height 200dp, sem grid pesada (`border-subtle`)
- Range picker: `HStack` de `Pressable` toggle
- PR list: `VStack` de `HStack justifyContent="space-between" py="3"` com divider `border-b border-subtle`
- Histórico: `SectionList` virtualizado
- CTA: `Button variant="outline" action="primary"` (não primary)

**Estados**
| Estado | Comportamento |
|---|---|
| **default** | Dados carregados, gráfico interativo (drag para scrub). |
| **loading** | Hero skeleton 64px, gráfico shimmer linha. |
| **empty** | Hero: "Sem dados ainda. Faça uma série pra começar a forjar PRs." + CTA. |
| **single point** | Gráfico mostra ponto + linha tracejada "primeira referência". |
| **PR streak** | Badge `🔥 3 PRs em 30d` no topo. |
| **error** | `Alert action="error"` inline. |
| **scrubbing** | Tooltip flutuante data + valor + RPE; haptic `selection`. |

**Microcopy**
- Hero label: `1RM ESTIMADO` (Epley/Brzycki, configurável).
- Sem PR recente: `sem mudança em 30d` (cor `text-tertiary`).
- Empty: `Sem dados ainda. Faça uma série pra começar a forjar PRs.`

**Motion**
| Elemento | Propriedade | Duração | Easing | Haptic |
|---|---|---|---|---|
| Gráfico mount | `path strokeDashoffset` desenha esq→dir | 560ms | iron | — |
| Range toggle | `bg` segmento ativo `translateX` | 240ms | anvil | selection |
| Scrub | tooltip `opacity + translateY` follow | instant | linear | selection ponto-a-ponto |
| PR row tap | `scale 1→0.98→1` + abre detalhe | 160ms | iron | selection |
| Hero number entrada | `opacity + translateY 16→0` (sem slot machine) | 360ms | anvil | — |

---

### 5.4 Plan List

```
┌─────────────────────────────────────────┐
│  Plans                            +     │
│ ─────────────────────────────────────── │
│  ATIVO                                  │
│  ┌───────────────────────────────────┐  │
│  │ ◉ PUSH PULL LEGS                  │  │
│  │   6 dias/sem · semana 4 de 12     │  │
│  │   próximo: Push A (sex)           │  │
│  │   ▓▓▓▓▓▓▓░░░░░░░░░░ 33%           │  │
│  │   [Detalhes]   [Editar]   [Trocar]│  │
│  └───────────────────────────────────┘  │
│                                         │
│  MEUS PLANOS                            │
│  ┌───────────────────────────────────┐  │
│  │ ○ Upper / Lower                   │  │
│  │   4 dias · 8 semanas    [Ativar]  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ ○ Bro Split clássico              │  │
│  │   5 dias · sem fim      [Ativar]  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ─── EXPLORAR ───                       │
│  ┌───────────────────────────────────┐  │
│  │  📚 Templates curados          >  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  🛠 Construir do zero          >  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Componentes Gluestack**
- `ScrollView` → `VStack space="8" px="4" pt="6"`
- Header: `HStack` com `Heading` + `Pressable` (Plus icon)
- Card ATIVO: `Box bg="bg-raised" border border-ember-500/30 rounded="xl" p="6"`
- Cards MEUS: `Pressable` → `Box bg="bg-raised" rounded="lg" p="4"` (long-press = swipe actions)
- Botões inline: `Button size="sm" variant="outline"`
- Explorar: `Pressable` com `HStack` ícone + texto + chevron

**Estados**
| Estado | Comportamento |
|---|---|
| **default** | Plano ativo destacado, lista de outros, atalhos. |
| **loading** | 1 hero skeleton + 3 row skeletons. |
| **empty** | Card ATIVO substituído: "Você ainda não tem um plano. Forja vazia esfria." |
| **trocar plano mid-cycle** | Confirm sheet: "Trocar de plano descarta progresso semanal de PPL." |
| **error** | Alert + retry. |
| **offline** | Banner topo + cards interativos (cache). |
| **plan finished** | Card vira `bg-success-muted`: "PPL concluído em 12 sem · +8kg supino." |

**Microcopy**
- Empty: `Forja vazia esfria. Escolha um plano pra acender.`
- Botões plano ativo: `Detalhes · Editar · Trocar`.
- Confirm trocar: `Trocar descarta progresso da semana. Continuar?`
- Plus action sheet: `Criar do zero · Importar · Explorar templates`.

**Motion**
| Elemento | Propriedade | Duração | Easing | Haptic |
|---|---|---|---|---|
| Card ativo entrada | `opacity + translateY 12→0` | 360ms | anvil | — |
| Cards lista entrada | stagger 60ms, `opacity + translateY 16→0` | 240ms each | iron | — |
| Long-press | `scale 1→0.97` + reveal swipe actions | 160ms | iron | impactHeavy |
| Tap "Ativar" | row `bg 0→ember-muted→bg-raised` flash | 360ms | iron | impactMedium |
| Trocar plano | hero card `crossfade` velho→novo | 360ms | anvil | notificationSuccess |
| FAB + tap | `rotate 0→90deg` enquanto sheet sobe | 240ms | anvil | selection |

---

### 5.5 Workout Summary

```
┌─────────────────────────────────────────┐
│  ✓   Push A                  compartilhar│
│  58 min · 12 séries · 8.4t               │
├─────────────────────────────────────────┤
│  O QUE MUDOU vs. última Push A           │
│                                          │
│  Supino reto       +2.5kg ▲              │
│  Inclinado halt.   mesmo                 │
│  Crossover         +1 rep ▲              │
│  Desenv. máq.      -1 rep (fadiga?)      │
│  Elevação lateral  +1 rep ▲              │
│  Tríceps corda     +2.5kg ▲              │
├─────────────────────────────────────────┤
│  PR: Supino 100×8 (e1RM 128kg)           │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │         CONCLUIR SESSÃO             │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

> **Decisão de design — delta específico vs. motivacional genérico:** o Hevy mostra comparações como "você levantou um caminhão" (pesquisa §5 S1-R4). Isso é ruído motivacional. O IronForge mostra delta por exercício vs. a última sessão do mesmo dia do plano — "Supino: +2.5kg, Desenv. máq.: -1 rep (fadiga?)". Isso é **actionable**: o lifter sai sabendo o que ajustar na próxima sessão. Motivacional genérico não retém; progressão visível retém.

**Componentes Gluestack**
- Root: `ScrollView` → `VStack space="0"` (tela modal, sem scroll na maioria dos casos)
- Header: `HStack justifyContent="space-between"` com ícone checkmark `ember-500` + nome da sessão `Heading size="lg"` + `Pressable` compartilhar (abre share sheet nativa)
- Subtítulo: `HStack space="4"` com `Text size="sm" color="text-secondary"` — duração · séries · volume total
- Seção delta: `VStack space="0"` com divider `border-b border-subtle`. Cada linha: `HStack justifyContent="space-between"` — nome do exercício `Text size="sm"` + delta `Text size="sm"` com cor e ícone por estado (ver tabela abaixo)
- PR badge: `Box bg="ember-500/10" border border-ember-500/40 rounded-lg p="4"` com texto `font-semibold` + e1RM estimado como `text-secondary`
- CTA: `Button size="xl" variant="solid" action="primary"` fullwidth, `mb="safe-bottom"`

**Estados do delta por exercício**
| Estado | Cor | Ícone | Texto |
|---|---|---|---|
| Aumento de carga | `success-DEFAULT` | ▲ | `+2.5kg` |
| Aumento de reps | `success-DEFAULT` | ▲ | `+1 rep` |
| Sem mudança | `text-tertiary` | — | `mesmo` |
| Queda de performance | `text-secondary` | ▼ | `-1 rep (fadiga?)` |
| Primeiro treino deste plano | `ember-400` | ★ | `primeira referência` |
| Exercício não logado (skip) | `text-disabled` | — | `pulado` |

**Estados da tela**
| Estado | Comportamento |
|---|---|
| **PR na sessão** | `PRCelebrationModal` dispara antes desta tela (560ms), então Summary exibe badge PR inline com e1RM calculado. |
| **Sem mudança vs. anterior** | Seção delta exibe "Manteve o padrão — consistência é progressão." com cor `text-secondary`. Sem mensagem alarmista. |
| **Primeira sessão do plano** | Seção delta substituída por "Primeira sessão registrada. Próxima vez vamos comparar aqui." + todos os exercícios com ícone ★ `ember-400`. |
| **Meta de volume não atingida** | Badge `warning-muted` com "Volume abaixo do alvo (6.2t / 8.4t). Próxima sessão: checar descanso e carga." |
| **Sessão abandonada (< 50%)** | Header mostra ⚠ em vez de ✓; badge `warning-muted`: "Sessão parcial salva. 3 de 6 exercícios concluídos." |

**Microcopy**
- Header sessão completa: `✓ [Nome do dia do plano]` (ex.: `✓ Push A`)
- Header sessão parcial: `⚠ Push A (parcial)`
- CTA: `CONCLUIR SESSÃO` (uppercase, display)
- Compartilhar: opens share sheet nativa com texto pré-montado "Concluí Push A · 58 min · 12 séries · PR no supino 100×8 #ironforge" — editável antes de compartilhar
- Empty delta (sem sessão anterior): "Primeira vez que você faz Push A neste plano. Referência salva."
- Queda com sufixo contextual: `-1 rep (fadiga?)` — o sufixo "(fadiga?)" aparece apenas se a queda for no último exercício do bloco muscular principal da sessão (heurística: se 60%+ dos exercícios do mesmo grupo tiveram queda, é fadiga acumulada de sessão)

**Motion**
| Elemento | Propriedade | Duração | Easing | Haptic |
|---|---|---|---|---|
| Tela entra | `translateY 100%→0` (push da direita, não modal) | 360ms | anvil | — |
| Linhas delta entrada | stagger 40ms por linha, `opacity 0→1 + translateX -8→0` | 240ms each | iron | — |
| PR badge | `scale 0.8→1.05→1 + opacity 0→1` | 480ms | spring | notificationSuccess |
| ▲ ícone de aumento | `translateY 4→0 + opacity 0→1` com delay após linha | 160ms | iron | — |
| Tap compartilhar | `scale 1→0.96→1` | 120ms | iron | selection |
| Tap CONCLUIR | `scale 1→0.98→1` → dismiss modal + retorna tabs | 240ms | anvil | impactMedium |

---

## 6. Padrões de interação não-óbvios

### 6.1 Teclado numérico custom (não usar o nativo)
**O que:** ao tocar num campo de kg/reps/RPE no logger, abrimos um `Actionsheet` com keypad próprio (números 56dp, botões `+2.5/+5`, "igual ao set anterior", "confirmar"). Teclado do sistema **nunca** aparece nessa tela.

**Por quê:**
1. **Latência**: teclado iOS leva 280–400ms. Sheet custom em Reanimated 4 faz em 240ms com easing `anvil`, sem layout shift.
2. **Contexto**: 95% dos casos repete peso anterior. Botão "= anterior" mata 3 toques.
3. **Anilhas reais**: `+2.5` e `+5` refletem o que existe na sala. Reduz erros de digitação.
4. **Suor + luva**: tap target 56dp ignora dedo molhado e luva. Teclado nativo tem 36dp.

### 6.2 Bottom CTA com "fantasma de descanso" — split button contextual
**O que:** CTA do logger tem dois estados visuais coexistindo. Antes de logar: botão único `✓ COMPLETAR SÉRIE`. Após confirmar: split button `[⏱ 02:00] [✓ COMPLETAR SÉRIE]` onde esquerda mostra timer ativo, direita está pré-armada pra próxima série. O botão direita só ativa quando descanso atinge 80% (transição `disabled→enabled` com glow ember).

**Por quê:**
1. Reduz navegação ocular: timer está exatamente onde a próxima ação acontece.
2. Bloqueia confirmar cedo demais: gating força respeitar descanso mínimo.
3. Densidade de informação sem clutter: dois propósitos numa região.

**Spec:** `Reanimated layout animation` com `LinearTransition` 240ms easing `anvil`. Disabled: `opacity 0.4`, `bg steel-700`. Ativo: `bg ember-500` com `boxShadow: glow`.

### 6.3 "Force unlock" no botão de encerrar treino — tap-and-hold
**O que:** o X no header do logger é press-and-hold 600ms com ring de progresso ember preenchendo. Tap simples mostra tooltip "Segure para sair" — nada mais.

**Por quê:**
1. Saída acidental é catastrófica (perder 40 min de log).
2. Equivale ao "swipe to power off" do iOS — ação destrutiva merece gesto deliberado.
3. Comunica reverência ao trabalho.

**Spec:**
- `Pressable` + `useAnimatedStyle` com `withTiming(progress, { duration: 600, easing: Easing.bezier(0.65,0,0.35,1) })`.
- Ring SVG: `strokeDashoffset` de circumference→0.
- Haptic: `impactLight` em 50%, `impactMedium` em 100%, então abre sheet.
- Bypass por edge-swipe: desabilitado durante sessão (`gestureEnabled: false`).

### 6.4 "= anterior" como fallback primário — defendendo o layout anti-intuitivo

**O padrão:** no `KeypadSheet` do logger, o botão "= anterior" ocupa o topo em 56dp × fullwidth com `bg-ember-500/20 border border-ember-500`. O teclado numérico fica abaixo, de acesso secundário.

**Por que documentar isso explicitamente:** este layout vai parecer errado para qualquer designer ou engenheiro que não seja lifter. A intuição de produto padrão diz "teclado numérico é a entrada de dados, atalhos ficam à parte". Essa intuição está errada para este contexto específico. Se essa decisão não for defendida em texto, vai ser "corrigida" numa PR sem discussão.

**O argumento:**

Em aproximadamente 85% dos sets de um lifter de hipertrofia intermediário/avançado, o peso da série é idêntico ao da última sessão. Esse não é um comportamento ocasional — é a norma do treino de hipertrofia (a progressão acontece em ciclos de semanas, não sessão a sessão). Colocar o teclado numérico no topo com "= anterior" escondido em canto inverte a hierarquia de frequência:

- Caso comum (~85%): repetir peso → exige 3+ toques para achar e ativar "= anterior"
- Caso exceção (~15%): alterar peso → imediato, teclado já na frente

O layout correto inverte isso:

- Caso comum: 1 toque em "= anterior" → confirmar → próximo campo
- Caso exceção: ignorar "= anterior", usar teclado numérico abaixo

**Fundamento de design:** Fitts's Law + frequência de uso determinam posição primária. O botão mais usado deve estar na posição de menor custo de acesso (topo da sheet, fullwidth = alvo máximo). Esta é a mesma lógica do "Repeat Previous Workout" do Strong (pesquisa §4.1, Padrão 1) — mas implementada com target 56dp em vez de texto inline de 12pt.

**O que NÃO fazer:** transformar "= anterior" num ghost text clicável dentro da coluna da tabela (como Hevy). Target pequeno, contexto de mão suada, inacessível para luvas. O keypad custom resolve isso — não abrir mão do keypad custom pelo teclado do sistema apenas para "simplificar".

**Spec definitiva:** `Pressable` 56dp height, `w-full`, `bg-ember-500/20`, `border border-ember-500`, `rounded-lg`, label `= ANTERIOR · [peso×reps da última sessão]` em `font-semibold text-base text-ember-300`. Ao tap: preenche os três campos do keypad (kg, reps, rir) com os valores da última série correspondente, avança para campo RIR para confirmação ou toque em `✓ CONFIRMAR`.

---

## Handoff notes pra engenharia

- Todas as durações em ms estão no design token `motion.duration` — referenciar, nunca hardcode.
- Reanimated 4: priorizar `useSharedValue` + `useAnimatedStyle`. Evitar `LayoutAnimation` legado.
- Haptics via `expo-haptics`, mapeados em `motion.haptic`.
- Dark-mode-first: `darkMode: 'class'` aplicado no root via `useColorScheme()`. Light mode é fase 2.
- Tipografia display: licenciar Druk Wide ou usar Bebas Neue (Google Fonts) como fallback inicial.
- Tap targets: nada abaixo de 44pt iOS / 48dp Android, **inclusive os botões "+2.5/+5"** do keypad (56dp specado, manter).
