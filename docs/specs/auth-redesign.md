# Spec: Auth Redesign — Forest Minimalist + Logo

> **Status:** draft · **Agente dono:** mobile-ui-ux-designer · **Prioridade:** P0 · **Lado:** mobile
> **Branch:** `feat/auth-redesign` · **Specs relacionadas:** [[02-design-spec.md]], [[05-platform-vision.md]]

---

## Problema / JTBD

A tela de Welcome atual não tem identidade visual — é texto plano sem logo. Sign-in e Sign-up têm estrutura funcional mas sem hierarquia visual clara: o título "Entrar" e "Criar conta" não são ancorados por nenhum elemento de marca. O resultado é que o primeiro contato do usuário com o IronForge não transmite a promessa da marca (Forest Minimalist, profissional, disciplinado).

**JTBD primário (aluno):** "Quero entrar no app rápido e confiar que isso é sério, não mais um app de academia genérico."
**JTBD secundário (personal):** "Meu cliente vai ver minha marca antes de ver qualquer dado — precisa passar confiança."

---

## Decisão

**Fazer:** Redesenhar Welcome, Sign-in e Sign-up com o logo (hexágono + halter) como âncora visual de marca, usando exclusivamente os tokens Forest Minimalist já especificados. O logo é renderizado com primitivas RN (`View` + `react-native-svg`) — sem assets externos.

**Não fazer:**
- Imagem de fundo ou hero foto de academia (clichê do segmento, aumenta bundle, não alinha ao minimalismo da marca).
- Login com Apple/Google no MVP (complexidade de infra OAuth ainda não resolvida — ver §Perguntas abertas). Botões reservados mas desabilitados/ocultos.
- Animação de splash separada — logo já na Welcome serve de reveal de marca sem custo extra de tela.
- "Esqueci a senha" inline nesta spec — vai para `ForgotPasswordSheet` (spec futura).

---

## Dados (ref `07-data-model-v2.md`)

Nenhuma entidade nova. Fluxo usa `useAuthStore` (`signIn`) e `router.replace` já existentes. A spec descreve somente camada de apresentação.

---

## Telas / fluxo

### Fluxo geral

```
Welcome
  ├── tap "CRIAR CONTA"  → SignUp → (onboarding)
  └── tap "JÁ TENHO CONTA" → SignIn → (app)
```

Ambas as telas de formulário têm seta de voltar para Welcome (já implementado via `router.back()`).

---

## Parte 1 — Telas de Auth

### 1.0 Logo — especificação de primitivas RN

O logo é um **quadrado arredondado verde-floresta** (fundo `forest-500` #1B4332, `borderRadius` 20) contendo um **hexágono branco** (contorno branco espesso, ~8px stroke) que envolve um **halter/barra** (ícone branco centralizado).

**Proporções e construção:**

```
Tamanho padrão (Welcome): 96×96 dp
Tamanho compacto (Sign-in / Sign-up): 56×56 dp

Quadrado arredondado externo
  width/height: N dp
  borderRadius: N * 0.208  (ex. 96→20, 56→12)
  backgroundColor: #1B4332 (forest-500)

Hexágono (react-native-svg <Polygon>)
  6 pontos calculados em coordenadas polares (flat-top)
  raio externo: N * 0.42   (ex. 96→40, 56→23)
  stroke: #FFFFFF
  strokeWidth: N * 0.083   (ex. 96→8, 56→4.5)
  fill: "none"
  centro: (N/2, N/2)

Hexágono flat-top — fórmula dos 6 vértices (i = 0..5):
  x = cx + r * cos(60° * i)
  y = cy + r * sin(60° * i)

Halter/barra (Dumbbell — react-native-svg <Rect> + <Rect> + <Rect>)
  Composto por 3 Rect brancos:
  — Barra central: width N*0.38, height N*0.083, rx N*0.02
  — Anilha esq:    width N*0.083, height N*0.25, rx N*0.02
  — Anilha dir:    idem, espelhada
  Todos centralizados no eixo Y do hexágono
  fill: #FFFFFF

Variante "tile verde" (fundo branco/bg, logo como tile com fundo forest):
  Wrapper: View backgroundColor="#1B4332" borderRadius={20}
  Interior: SVG hexágono + halter brancos

Variante "inline claro" (Sign-in / Sign-up):
  Wrapper: View backgroundColor="#1B4332" borderRadius={12}
  SVG em 56×56
```

**Componente:** `src/shared/ui/logo.tsx` — `<Logo size={96|56} />`. Aceita `size` e calcula todas as proporções derivadas. Não aceita `color` — o logo sempre usa `forest-500` + branco (identidade fixa).

**Acessibilidade:** `accessibilityLabel="IronForge"` no View raiz, `accessible={true}`.

---

### 1.1 WelcomeScreen

**Arquivo atual:** não existe como componente isolado (está em `app/(auth)/welcome.tsx` ou equivalente). Esta spec especifica o alvo.

**Layout (wireframe)**

```
┌─────────────────────────────────────────┐
│                                         │  ← SafeAreaView bg-bg (#F9FAFB)
│                                         │  ← espaço superior ~15% altura tela
│           ┌──────────────┐              │
│           │   [LOGO 96]  │              │  ← <Logo size={96} /> centralizado
│           └──────────────┘              │
│                                         │
│           IRONFORGE                     │  ← Text variant="display"
│                                         │     font-display text-4xl font-black
│                                         │     text-text-primary tracking-tight
│           Sua evolução,                 │  ← Text variant="bodySmall"
│           sua responsabilidade.         │     text-text-secondary text-base
│                                         │     text-center, max 2 linhas
│                                         │
│                                         │  ← espaço flexível (flex-1)
│                                         │
│  ┌─────────────────────────────────┐    │
│  │         CRIAR CONTA             │    │  ← Button solid xl fullWidth
│  └─────────────────────────────────┘    │     bg-forest-500 text-white
│                                         │
│  ┌─────────────────────────────────┐    │
│  │        JÁ TENHO CONTA           │    │  ← Button outline xl fullWidth
│  └─────────────────────────────────┘    │     border-border text-text-primary
│                                         │
│  Ao continuar, você concorda com os     │  ← Text variant="caption"
│  Termos de Uso e Política de            │     text-text-tertiary text-center
│  Privacidade.                           │     (Pressable nos links → WebView/sheet)
│                                         │  ← paddingBottom safe-area + 24dp
└─────────────────────────────────────────┘
```

**Componentes @ui**

| Elemento | Primitiva | NativeWind classes |
|---|---|---|
| Container | `Screen` | `edges={['top','bottom']}` `padded={true}` |
| Logo | `<Logo size={96} />` | `self-center mb-4` |
| Wordmark | `Text variant="display"` | `text-center text-text-primary` |
| Tagline | `Text variant="bodySmall"` | `text-center text-text-secondary mt-2` |
| Spacer | `View className="flex-1"` | — |
| CTA primário | `Button variant="solid" size="xl" fullWidth` | — |
| CTA secundário | `Button variant="outline" size="xl" fullWidth` | — |
| Legal | `Text variant="caption"` | `text-center mt-4 px-4` |

**Tokens exatos**

- `bg`: `#F9FAFB` (bg token)
- Logo fundo: `#1B4332` (forest-500)
- CTA primário bg: `#1B4332` / pressed `#143728` (forest-600)
- CTA primário text: `#FFFFFF`
- CTA secundário border: `#E5E7EB` (border token)
- CTA secundário text: `#191C1D` (text-primary)
- Tagline text: `#414844` (text-secondary)
- Legal text: `#717973` (text-tertiary)
- Raio botão: 4px (xs — estético "funcional/ferramenta")
- Raio logo wrapper: 20dp (derivado de 96×0.208)

**Copy (pt-BR)**

| Elemento | Texto |
|---|---|
| Wordmark | `IRONFORGE` |
| Tagline | `Sua evolução, sua responsabilidade.` |
| CTA primário | `CRIAR CONTA` |
| CTA secundário | `JÁ TENHO CONTA` |
| Legal | `Ao continuar, você concorda com os Termos de Uso e Política de Privacidade.` |

**Estados**

| Estado | Comportamento |
|---|---|
| default | Logo + CTAs visíveis. Tagline aparece. |
| loading (sessão restaurada) | CTAs `disabled opacity-40`, spinner pequeno abaixo do logo (12dp, forest-500). |
| offline | Sem mudança visual — auth não depende de rede neste estado. |

**Motion (entrada da tela)**

| Elemento | Propriedade animada | Duração | Easing | Haptic |
|---|---|---|---|---|
| Logo | `opacity 0→1 + scale 0.85→1` | 480ms | spring (damping 14, stiffness 180) | — |
| Wordmark | `opacity 0→1 + translateY 12→0` | 360ms delay 120ms | anvil | — |
| Tagline | `opacity 0→1` | 240ms delay 240ms | iron | — |
| CTAs | `opacity 0→1 + translateY 16→0` stagger 80ms | 320ms delay 360ms | anvil | — |
| Tap CTA | `scale 1→0.97→1` | 160ms | iron | selection |

Tudo via `useSharedValue` + `withDelay` + `withTiming`. **Reduce motion:** desativar translateY e scale; manter opacity com duração 80ms.

**A11y**

- Logo: `accessibilityLabel="IronForge"` `accessible={true}`
- CTA primário: `accessibilityRole="button"` `accessibilityLabel="Criar conta"`
- CTA secundário: `accessibilityRole="button"` `accessibilityLabel="Já tenho conta, entrar"`
- Links legais: `accessibilityRole="link"`
- Dynamic type: `allowFontScaling={true}` no Text (padrão RN). Logo em dp — não escala com texto.

---

### 1.2 SignInScreen

**Arquivo atual:** `src/features/auth/screens/sign-in-screen.tsx` — estrutura funcional, sem logo.

**Layout (wireframe)**

```
┌─────────────────────────────────────────┐
│  ← voltar                               │  ← Pressable h-11, Text text-text-secondary
│                                         │
│       ┌────────┐                        │
│       │ [L 56] │  IRONFORGE             │  ← HStack: Logo 56dp + wordmark
│       └────────┘                        │     Logo alinhado ao topo do text-block
│                                         │
│  Bem-vindo de volta.                    │  ← Text variant="title" mt-8
│  Entre para continuar sua evolução.     │  ← Text variant="bodySmall" mt-1
│                                         │
│  Email                                  │  ← Input label="Email"
│  ┌─────────────────────────────────┐    │     keyboardType="email-address"
│  │ voce@exemplo.com                │    │     autoComplete="email"
│  └─────────────────────────────────┘    │     autoCapitalize="none"
│                                         │
│  Senha                                  │  ← Input label="Senha"
│  ┌─────────────────────────────────┐    │     secureTextEntry
│  │ ••••••••                        │    │     autoComplete="current-password"
│  └─────────────────────────────────┘    │
│                                         │
│  Esqueci minha senha                    │  ← Pressable → ForgotPasswordSheet
│                                         │     Text variant="bodySmall" text-forest-500
│                                         │
│  [banner de erro, condicional]          │  ← Box bg-error-muted border-l-2 border-error
│                                         │     rounded-sm px-4 py-3 mb-2
│                                         │
│  ┌─────────────────────────────────┐    │
│  │            ENTRAR               │    │  ← Button solid xl fullWidth
│  └─────────────────────────────────┘    │
│                                         │
│  Não tem conta? Criar conta             │  ← Text variant="bodySmall" text-center
│                                         │     "Criar conta" → Pressable text-forest-500
└─────────────────────────────────────────┘
```

**Componentes @ui**

| Elemento | Primitiva | NativeWind classes |
|---|---|---|
| Container | `Screen` | `padded={true}` |
| Back | `Pressable` | `self-start h-11 px-1 justify-center` |
| Logo + wordmark | `HStack space={3}` + `<Logo size={56} />` + `Text` | `items-center mt-6` |
| Heading | `Text variant="title"` | `mt-8` |
| Subtítulo | `Text variant="bodySmall"` | `mt-1 text-text-secondary` |
| Inputs | `Input` (email + senha) | `w-full` |
| Esqueci senha | `Pressable` | `self-start mt-2` |
| Banner erro | `View` condicional | `bg-error-muted border-l-2 border-error rounded-xs px-4 py-3` |
| CTA | `Button solid xl fullWidth` | `mt-6` |
| Link criar conta | `Text variant="bodySmall"` + `Pressable` inline | `text-center mt-4` |

**Tokens exatos**

- Input border focused: `#1B4332` (forest-500) — já implementado em `input.tsx`
- Input border error: `#BA1A1A` (error token)
- Input bg: `#F3F4F5` (bg-sunken)
- Banner erro bg: `#FFDAD6` (error-muted)
- Banner erro border: `#BA1A1A` (error)
- Link "Esqueci" + "Criar conta": `#1B4332` (forest-500 / text-accent)
- CTA disabled: `opacity-40` (já no Button)
- Raio input: 8px (sm — já em `input.tsx` como `rounded-lg`)

**Copy (pt-BR)**

| Elemento | Texto |
|---|---|
| Wordmark | `IRONFORGE` |
| Heading | `Bem-vindo de volta.` |
| Subtítulo | `Entre para continuar sua evolução.` |
| Label email | `Email` |
| Placeholder email | `voce@exemplo.com` |
| Label senha | `Senha` |
| Placeholder senha | `••••••••` |
| Link esqueci | `Esqueci minha senha` |
| CTA default | `ENTRAR` |
| CTA loading | `Entrando...` |
| Erro email/senha inválidos | `Email ou senha incorretos. Verifique e tente novamente.` |
| Erro sem rede | `Sem conexão. Verifique sua internet e tente novamente.` |
| Link criar conta | `Não tem conta? Criar conta` |

**Estados**

| Estado | Comportamento visual |
|---|---|
| default | Campos vazios. CTA `disabled opacity-40`. |
| preenchido válido | CTA ativo (`bg-forest-500`). |
| loading | CTA `disabled`, label "Entrando...", `ActivityIndicator` 16dp branco no leading do Button. |
| erro credencial | Banner `bg-error-muted` aparece acima do CTA com `withTiming opacity 0→1 + translateY -8→0` 240ms. Campo Senha ganha `border-error`. |
| erro rede | Banner com mensagem de rede. |
| success | CTA some (`opacity 0` 160ms), `router.replace('/(app)')`. |

**Motion**

| Elemento | Propriedade | Duração | Easing | Haptic |
|---|---|---|---|---|
| Logo + header entrada | `opacity 0→1 + translateY 8→0` | 360ms | anvil | — |
| Inputs entrada | stagger 60ms, `opacity 0→1 + translateY 8→0` | 240ms each | iron | — |
| Banner erro | `opacity 0→1 + translateY -8→0` | 240ms | iron | notificationError |
| Tap CTA | `scale 1→0.97→1` (via Button) | 160ms | iron | selection |
| Reduce motion | sem translateY, opacity 80ms | — | — | — |

**A11y**

- `accessibilityLabel` em todos os Inputs (já passado via `label` prop).
- Banner de erro: `accessibilityLiveRegion="polite"` — anuncia quando aparece.
- Senha: `textContentType="password"` para autofill iOS.
- Email: `textContentType="emailAddress"`.
- Tab order implícito (RN): email → senha → CTA. Garantir com `returnKeyType="next"` no campo email, `returnKeyType="done"` no campo senha.

---

### 1.3 SignUpScreen

**Arquivo atual:** `src/features/auth/screens/sign-up-screen.tsx` — estrutura funcional, sem logo.

**Layout (wireframe)**

```
┌─────────────────────────────────────────┐
│  ← voltar                               │
│                                         │
│       ┌────────┐                        │
│       │ [L 56] │  IRONFORGE             │  ← igual ao Sign-in
│       └────────┘                        │
│                                         │
│  Crie sua conta.                        │  ← Text variant="title" mt-8
│  Leva 2 minutos. Sem cartão.            │  ← Text variant="bodySmall" mt-1
│                                         │
│  Como quer ser chamado                  │  ← Input label="Nome"
│  ┌─────────────────────────────────┐    │     autoCapitalize="words"
│  │ Seu primeiro nome               │    │     autoComplete="name"
│  └─────────────────────────────────┘    │     returnKeyType="next"
│                                         │
│  Email                                  │  ← Input label="Email"
│  ┌─────────────────────────────────┐    │     keyboardType="email-address"
│  │ voce@exemplo.com                │    │     returnKeyType="next"
│  └─────────────────────────────────┘    │
│                                         │
│  Senha                                  │  ← Input label="Senha"
│  ┌─────────────────────────────────┐    │     secureTextEntry
│  │ mínimo 8 caracteres             │    │     autoComplete="new-password"
│  └─────────────────────────────────┘    │     returnKeyType="done"
│                                         │
│  [barra de força da senha]              │  ← PasswordStrengthBar (novo componente)
│  ● ● ● ○ ○  Médio                      │     ver spec abaixo
│                                         │
│  [banner de erro, condicional]          │  ← mesmo padrão do Sign-in
│                                         │
│  ┌─────────────────────────────────┐    │
│  │          CRIAR CONTA            │    │  ← Button solid xl fullWidth
│  └─────────────────────────────────┘    │     disabled se nome vazio || email inválido
│                                         │     || senha < 8 chars
│  Já tem conta? Entrar                   │  ← Text + Pressable text-forest-500
└─────────────────────────────────────────┘
```

**PasswordStrengthBar — spec**

Componente novo: `src/features/auth/components/password-strength-bar.tsx`

```
Props: { password: string }

Lógica de força:
  0 chars → nada (invisible)
  1–7 chars → Fraca (1/5 dots preenchidos, error)
  8 chars sem complexidade → Regular (2/5, warning)
  8+ chars + maiúscula OU número → Médio (3/5, warning)
  8+ chars + maiúscula + número → Forte (4/5, success-DEFAULT)
  12+ chars + maiúscula + número + especial → Excelente (5/5, forest-500)

Visual: HStack de 5 View circulares (8×8dp), gap-1
  preenchidos: bg-[cor por nível]
  vazios: bg-surface-400
  Label: Text variant="caption" ml-2 — "Fraca" / "Regular" / "Médio" / "Forte" / "Excelente"

Motion: cada dot ganha fill com `withTiming opacity 0→1` 160ms stagger 40ms
```

**Componentes @ui**

Igual ao Sign-in, acrescido de:

| Elemento | Primitiva | NativeWind |
|---|---|---|
| Input Nome | `Input` | `label="Como quer ser chamado"` |
| Barra força senha | `PasswordStrengthBar` | `mt-2` |

**Tokens exatos** — idênticos ao Sign-in.

**Copy (pt-BR)**

| Elemento | Texto |
|---|---|
| Heading | `Crie sua conta.` |
| Subtítulo | `Leva 2 minutos. Sem cartão.` |
| Label nome | `Como quer ser chamado` |
| Placeholder nome | `Seu primeiro nome` |
| Label email | `Email` |
| Label senha | `Senha` |
| Hint senha (abaixo do campo) | `mínimo 8 caracteres` |
| CTA default | `CRIAR CONTA` |
| CTA loading | `Criando conta...` |
| Erro email já usado | `Esse email já tem uma conta. Quer entrar em vez disso?` (com link "Entrar" inline) |
| Erro rede | `Sem conexão. Verifique sua internet e tente novamente.` |
| Link já tem conta | `Já tem conta? Entrar` |

**Estados**

| Estado | Comportamento |
|---|---|
| default | Campos vazios. CTA disabled. Barra de força invisível. |
| nome + email + senha válidos | CTA ativo. |
| loading | CTA `disabled`, label "Criando conta...", spinner branco. |
| erro email duplicado | Banner + link inline "Entrar" → Sign-in. |
| erro rede | Banner de rede. |
| sucesso | `router.replace('/(onboarding)/goal')`. |

**Motion** — igual ao Sign-in, com adição:

| Elemento | Propriedade | Duração | Easing |
|---|---|---|---|
| Barra força (dots) | stagger fill por nível | 160ms stagger 40ms | iron |
| Banner erro | `opacity + translateY` | 240ms | iron |

**A11y**

- Nome: `textContentType="name"` `autoComplete="name"`.
- Email: `textContentType="emailAddress"`.
- Senha: `textContentType="newPassword"` `autoComplete="new-password"`.
- Barra de força: `accessibilityLabel="Força da senha: [nível]"` atualizado ao digitar.
- `returnKeyType` encadeia nome→email→senha→submete.
- Banner erro: `accessibilityLiveRegion="polite"`.

---

## Parte 2 — Mapa de telas: deltas das referências

### 2.1 Dashboard (ref: `01-dashboard.png`)

**O que a referência mostra:**

- Header: Logo `IF` (tile verde 24dp) + wordmark `IRONFORGE` + ícone de sino (notificações). Sem avatar.
- Hero card: imagem de fundo de academia (foto escurecida) + chip "Treino de Hoje" + nome do treino + descrição + tempo estimado + CTA `Iniciar Agora ►`. Card tem border-radius grande (~16dp).
- Seção Hidratação: grande, com valor em destaque `2.1 Litros` + barra de progresso verde.
- Seção Suplementação: lista com checkboxes verdes.
- Seção Frequência Semanal: strip de dias da semana sem dados (placeholder vazio).
- Seção Próximos Treinos: lista com chip de dia (SEX/SAB/SEG), nome do treino, descrição.
- Bottom tab: 4 abas — Dashboard, Workouts, Progress, Profile.

**Tela atual (`app/(app)/index.tsx`):**

- Header: texto saudação + ícone configurações.
- Hero: Card com nome do treino, exercícios listados, CTA `COMEÇAR TREINO`.
- Week strip: implementada (dias da semana, dots de sessão).
- Seção "Próximos treinos" com dia/exercícios.
- Sem hidratação, sem suplementação.
- 4 tabs (Dashboard, Workouts, Progress, Profile) — alinhado com referência.

**Deltas / componentes necessários:**

| Delta | Prioridade | Componente/Card |
|---|---|---|
| Header: substituir texto saudação + ícone configs por `HStack` com `<Logo size={24} />` + wordmark + ícone sino | P0 | `AppHeader` (novo shared widget) |
| Hero card: adicionar imagem de fundo com overlay escurecido (ImageBackground + `rgba(0,0,0,0.45)` overlay). Texto e CTA sobre a imagem em branco. | P1 | `TodayHeroCard` (refator) |
| Hero chip "Treino de Hoje": `View bg-forest-500/80 rounded-pill px-3 py-1` + `Text variant="label" text-white` acima do título | P0 | inline no TodayHeroCard |
| Hero: aumentar border-radius para `rounded-xl` (16dp) — atual usa `rounded-xl` do Card, confirmar visualmente | P0 | — |
| Seção Hidratação: novo card com valor destacado (`Text variant="metric"`), barra de progresso, meta configurável | P2 | `HydrationCard` (nova feature) |
| Seção Suplementação: lista de itens com checkbox (Pressable toggle) | P2 | `SupplementCard` (nova feature) |
| Frequência Semanal: week strip atual já existe — delta é visual (dots maiores, label "Concluído" com chip verde no canto direito) | P1 | `WeeklyFrequencyStrip` (refator) |
| Próximos treinos: adicionar chip colorido com abreviação do dia (`SEX`, `SAB`) + layout com chevron direito | P1 | `UpcomingSessionRow` (novo) |
| Bottom tab: ícones e labels alinhados à referência — confirmar labels ("Dashboard" não "Today") | P0 | tab layout em `app/(app)/_layout.tsx` |

---

### 2.2 Profile (ref: `02-profile.png`)

**O que a referência mostra:**

- Header: mesmo `AppHeader` do Dashboard (Logo + wordmark + sino + avatar do usuário à direita).
- Foto de perfil circular (80dp), nome, subtítulo "Membro desde [data] · Plano Pro" + botão "Editar Perfil".
- Stats em 2 colunas: Treinos (142), Recordes (18), Média Semanal (8,4h), Semanas Ativas (12).
- Seção "Progresso — Evolução Corporal": chip "Peso Atual" + gráfico de linha (peso no tempo, sem dados preenchidos na ref).
- Seção "Antes e Depois": galeria 2×2 com fotos de progresso + botão "Novo Registro".
- Card "Equipe e Suporte": avatar do coach + CTA `Falar com Suporte`.
- Seção "Recorde Pessoal": destaque grande (`120 kg Supino Reto · 3 reps`) + link "Ver histórico de recordes →".

**Tela atual (`app/(app)/profile.tsx`):**

- Lista simples: nome, email, botão de logout. Sem stats, sem fotos, sem PRs.

**Deltas / componentes necessários:**

| Delta | Prioridade | Componente/Card |
|---|---|---|
| `ProfileHeroCard`: avatar circular (`Image borderRadius={40}`), nome, subtítulo membro + plano, botão "Editar Perfil" (`Button outline sm`) | P0 | `ProfileHeroCard` |
| `StatsGrid`: grid 2×2 com `Card variant="sunken"` por stat, valor em `Text variant="metric"` (menor — 28px), label em `Text variant="label"` | P0 | `StatsGrid` |
| Seção "Evolução Corporal": gráfico de linha peso (react-native-skia), chip data atual, range selector [7d/30d/90d] | P1 | `BodyWeightChart` |
| Seção "Antes e Depois": grid 2×2 `Image` com label data sobreposto, botão "Novo Registro" (`Button outline sm`) à direita do header | P2 | `ProgressPhotosGrid` |
| Card "Equipe e Suporte" (plataforma B2C2B): avatar coach, nome, CTA `Falar com Suporte` → deep link WhatsApp/chat | P1 | `CoachSupportCard` |
| "Recorde Pessoal" destacado: `Text variant="display"` para o número, nome do exercício em bodySmall, link "Ver histórico" | P0 | `PersonalRecordHero` |
| Remover tela atual e rebuildar com `ScrollView` + `VStack space={6}` | P0 | estrutura da tela |
| Avatar no header (`AppHeader` com prop `avatarUrl`) | P1 | `AppHeader` |

---

### 2.3 Workout Detail / Registro de Carga (ref: `03-workout-detail.png`)

**O que a referência mostra:**

- Header: seta voltar + Logo + `IRONFORGE` + sino + ícone de notificação amarelo (não interpretado — pode ser timer ou badge).
- Hero: imagem do exercício (academia, barbell squat) fullwidth com overlay e botão play centralizado.
- Chips de categoria: `Inferiores`, `Força` — pills com `bg-forest-100` e `text-forest-500`.
- Título: `Agachamento Livre` em heading grande (24px bold).
- Seção "Instruções Técnicas": lista numerada 1–4 com instruções em body-md, numeração em circle verde-floresta.
- Seção "Registro de Carga": label "Histórico" à direita (link). Tabela: Série | Reps | Peso (kg) | Ação. Série 1 completa com checkmark verde; Série 2 vazia; Série 3 com cadeado (bloqueada). Botão `+ Adicionar Série` com borda tracejada fullwidth.
- CTA sticky bottom: `FINALIZAR EXERCÍCIO ►` fullwidth verde-floresta.
- Dica flutuante no rodapé (fora do scroll): `Dica: Se estiver sentindo dores no lombar...`

**Tela atual (`WorkoutLogger` — `src/features/workout/screens/workout-logger-screen.tsx`):**

- Existe estrutura de logger com tabela de sets, mas sem vídeo/imagem hero, sem instruções técnicas, sem chips de categoria, sem CTA "FINALIZAR EXERCÍCIO" (usa "COMPLETAR SÉRIE").

**Deltas / componentes necessários:**

| Delta | Prioridade | Componente/Card |
|---|---|---|
| Hero de exercício: `ImageBackground` fullwidth ~200dp com overlay escuro + ícone play centrado (`Pressable` → `ExerciseInfoSheet` com vídeo) | P1 | inline no ExerciseHeader |
| Chips de categoria/grupo muscular: `HStack` de chips `View bg-forest-100 rounded-pill px-3 py-1` + `Text text-forest-500 text-xs font-semibold` | P0 | `ExerciseCategoryChips` |
| Título em `Text variant="heading"` (24px bold) — atual já usa heading, confirmar tamanho | P0 | — |
| Seção "Instruções Técnicas": `VStack` de rows com número em circle (`View w-6 h-6 rounded-full bg-forest-500` + `Text text-white text-xs`) + texto instrução | P1 | `ExerciseInstructions` (novo) |
| Tabela de sets: redesign para colunas Série | Reps | Peso | Ação conforme referência. Série completa: checkmark `forest-500`. Série futura: ícone cadeado (locked). | P0 | `SetTable` (refator) |
| Botão `+ Adicionar Série`: `Pressable` com `border border-dashed border-border rounded-sm` fullwidth, `Text text-text-secondary text-sm` centralizado | P0 | inline no SetTable |
| CTA sticky: renomear "COMPLETAR SÉRIE" → `FINALIZAR EXERCÍCIO ►` apenas ao finalizar TODAS as séries do exercício (fluxo de navegação para próximo exercício) | P1 | lógica no logger |
| Dica contextual fixa abaixo do CTA: `View bg-forest-50 px-4 py-3` + `Text variant="bodySmall" text-text-secondary` (texto dinâmico por exercício — campo `tip` no catálogo) | P2 | `ExerciseTip` |
| Header na referência usa `Logo 24dp` — unificar com `AppHeader` mas no contexto de modal fullscreen do logger | P1 | `WorkoutHeader` (adaptado) |

---

## Critérios de aceite

- [ ] `<Logo size={96} />` renderiza corretamente em Welcome sem asset externo (apenas View + SVG).
- [ ] `<Logo size={56} />` renderiza em Sign-in e Sign-up com proporções corretas.
- [ ] Welcome entra com animação stagger (logo → wordmark → CTAs). Reduce-motion desativa transforms.
- [ ] Sign-in: estados default / loading / erro / sucesso cobertos. Banner de erro tem `accessibilityLiveRegion="polite"`.
- [ ] Sign-up: `PasswordStrengthBar` visível apenas após começar a digitar senha. Estados corretos.
- [ ] Todos os touch targets ≥ 44dp (logo, botões, link "esqueci senha", link "criar conta").
- [ ] Tokens usados são exatamente os definidos em `tailwind.config.js` — sem hex hardcoded nos componentes.
- [ ] `npm run typecheck` e `npm run lint` passam sem erros novos.
- [ ] Fluxo funcional: Welcome → SignUp → onboarding; Welcome → SignIn → app.

---

## Fora de escopo

- Login com Apple/Google (OAuth — infra não definida).
- `ForgotPasswordSheet` (spec separada).
- Dark mode (Forest Minimalist é light-first; dark mode é fase futura conforme `docs/02-design-spec.md`).
- Onboarding redesign (spec separada).
- Implementação dos cards de Dashboard, Profile e WorkoutDetail (esta spec entrega apenas o mapa de deltas como backlog).
- Animação de splash (`SplashScreen` separada).

---

## Perguntas abertas

1. **OAuth:** Apple Sign-in e Google Sign-in aparecem na referência de Sign-in como botões secundários. Incluir na UI agora como botões desabilitados (com tooltip "em breve") ou omitir até o backend estar pronto? Decisão impacta layout de Sign-in.
2. **Imagem hero do exercício:** o catálogo atual (`src/features/exercises/data/catalog.ts`) tem `videoUrl` mas não `imageUrl`. A referência usa foto estática. Adicionar campo `imageUrl` ao `Exercise` agora ou usar placeholder verde-floresta (View sólido) até a mídia existir?
3. **Plano Pro:** o subtítulo do Profile mostra "Plano Pro" — implica tiers. MVP é flat (um plano). Mostrar ou omitir?

---

## Plano (arquivos / tarefas)

### Auth — telas (esta spec)
- [ ] `src/shared/ui/logo.tsx` — componente `<Logo size>` com SVG hexágono + halter
- [ ] `src/features/auth/screens/welcome-screen.tsx` — novo (ou refatorar existente em `app/(auth)/`)
- [ ] `src/features/auth/screens/sign-in-screen.tsx` — adicionar Logo + copywrite + banner de erro + link criar conta
- [ ] `src/features/auth/screens/sign-up-screen.tsx` — adicionar Logo + PasswordStrengthBar + estados completos
- [ ] `src/features/auth/components/password-strength-bar.tsx` — novo componente

### Backlog gerado (não entra nesta branch)
- [ ] `src/features/home/components/app-header.tsx` — header unificado com Logo + sino + avatar
- [ ] `src/features/home/components/today-hero-card.tsx` — refator com ImageBackground
- [ ] `src/features/home/components/upcoming-session-row.tsx` — row com chip de dia
- [ ] `src/features/profile/screens/profile-screen.tsx` — rebuild completo
- [ ] `src/features/profile/components/` — ProfileHeroCard, StatsGrid, BodyWeightChart, CoachSupportCard, PersonalRecordHero
- [ ] `src/features/workout/components/exercise-header.tsx` — hero de vídeo/foto + chips
- [ ] `src/features/workout/components/exercise-instructions.tsx` — lista numerada
- [ ] `src/features/workout/components/set-table.tsx` — redesign colunas + dashed "Adicionar Série"
- [ ] `src/features/exercises/data/catalog.ts` — adicionar campo `imageUrl?: string` e `tip?: string`
