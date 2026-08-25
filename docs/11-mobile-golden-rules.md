# IronForge — Golden Rules

Regras de ouro do projeto derivadas das skills instaladas (ui-ux-pro-max, frontend-design, vercel-react-best-practices).
Stack: React Native + Expo (managed workflow) + NativeWind (Tailwind) + Zustand + AsyncStorage.

---

## 1. Design & Estética

- **Identidade visual ("Forest Minimalist", ver `DESIGN.md`)**: app de treino com tom profissional, funcional e disciplinado — minimalismo moderno, calma e foco. Marca em **verde-floresta** (`#1B4332`). Alto contraste e tipografia limpa em **Inter**.
- **Light-first é padrão**: todas as telas devem funcionar perfeitamente no tema claro definido em `src/shared/theme/colors.ts` (fundos `#F9FAFB`/`#FFFFFF`, texto `#191C1D`). Nunca hardcode cores — use sempre os tokens do tema.
- **Profundidade por contorno, não por sombra**: cards/inputs usam borda 1px `#E5E7EB`. Sombras são raras e difusas (só flutuantes/modais). Estado ativo = borda 2px na cor primary ou leve mudança de background.
- **Ícones**: use SVG ou biblioteca de ícones (ex.: `@expo/vector-icons`). Nunca use emojis como ícone de UI.
- **Espaçamento**: baseado em múltiplos de 4 (4, 8, 12, 16, 24, 32, 48). Nunca valores arbitrários avulsos.
- **Hierarquia tipográfica**: respeite a escala de `src/shared/ui/text.tsx`. Nunca `fontSize` inline fora da escala. `font-mono` é reservado a dados numéricos tabulares (carga/reps/timer).
- **Animações**: duração entre 150–300ms. Use `react-native-reanimated` com `withSpring` ou `withTiming`. Respeite `prefers-reduced-motion` quando disponível.

---

## 2. Acessibilidade (CRÍTICO)

- Todo elemento interativo precisa de `accessibilityLabel` descritivo.
- Botões com apenas ícone **obrigatoriamente** precisam de `accessibilityLabel`.
- Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande.
- Touch targets mínimo **44×44pt** (Apple HIG). Estenda a área de toque com `hitSlop` se necessário.
- Espaçamento mínimo de **8pt** entre targets tocáveis adjacentes.
- `accessibilityRole` correto em botões, inputs e listas.
- Nunca remova o indicador de foco em componentes focusáveis.
- Suporte a Dynamic Type: evite fontes com `fontSize` fixo sem escala; use `allowFontScaling` corretamente.

---

## 3. Touch & Interação

- Nunca dependa de hover para ações primárias — React Native não tem hover.
- Botões em operações assíncronas devem ficar desabilitados durante o loading e mostrar feedback (spinner ou loading state).
- Feedbacks hápticos (`src/lib/haptics/index.ts`) em: confirmações de set, conclusão de timer, swipe para finalizar treino. Evite uso excessivo.
- `gesture-conflicts`: não use swipe horizontal em listas onde o GestureHandler já captura o scroll vertical.
- Swipe actions precisam de affordance visual clara (chevron, label ou animação de hint).
- Não bloqueie gestos do sistema (back swipe iOS, Control Center).
- Respeite safe areas: use `SafeAreaView` ou `useSafeAreaInsets` em todas as telas.

---

## 4. Performance (React Native / Expo)

- **Listas**: use `FlatList` ou `FlashList` para listas longas. Nunca renderize listas > 20 itens com `.map()` direto no JSX.
- **Re-renders**: selecione fatias atômicas do Zustand store (`useWorkoutStore(s => s.campo)`) — nunca selecione o objeto inteiro.
- **Evite inline components**: nunca defina um componente dentro do render de outro (cria nova referência a cada render).
- **Memo com critério**: use `React.memo` apenas quando o profiler confirmar re-renders desnecessosos. Não aplique preventivamente em todo componente.
- **Imagens**: use `expo-image` com `contentFit` e `placeholder`. Sempre declare `width` e `height` para evitar layout shift.
- **Estado derivado no render**: prefira derivar valores diretamente no render em vez de armazená-los em `useEffect` + `useState`.
- **Refs para valores transitórios**: use `useRef` para valores que mudam com frequência mas não precisam acionar re-render (ex.: timestamp do último toque).
- **Imports diretos**: nunca importe de barrel files (`index.ts`) quando o módulo é pesado — importe diretamente do arquivo.

---

## 5. Arquitetura & Convenções de Código (FSD-lite)

- **FSD-lite (ver `docs/10`)**: camadas `app → widgets → features → entities → shared → types`. Import **só pra baixo**, nunca pra cima nem lateralmente entre slices da mesma camada (enforçado por `eslint-plugin-boundaries`).
  - `src/entities/<dom>/` → domínio reutilizável: `schema.ts` (Zod) + lógica pura em `lib/` + UI "burra" da entidade. Cada slice expõe **public API** via `index.ts`.
  - `src/features/<feature>/` → fluxos do usuário (screens, hooks de negócio, stores). Importa entities/shared, nunca outra feature.
  - `src/shared/` → infra e design system sem regra de negócio: `shared/ui` (Button, Text…), `shared/lib` (storage, query, haptics, utils), `shared/theme` (tokens).
  - `app/` → só wiring de rota (Expo Router); a tela real vive em `src/features/<feature>/screens/`.
- **Imports via alias, nunca caminho interno de outra slice**: `@entities/* @features/* @shared/* @ui/* @lib/* @theme/* @types/* @app/* @widgets/*`.
- **Tipagem**: schemas de domínio vivem em `src/entities/<dom>/schema.ts` (Zod). `src/types/domain.ts` é **fachada** que reexporta os schemas das entities. Nunca crie tipos duplicados em features.
- **Parsing na borda**: dados vindos do storage/rede são validados com o schema Zod no limite (ex.: `safeParse` ao ler do AsyncStorage) + `withoutDeleted` para soft-delete. Nunca confie em `as` para dados externos.
- **Storage**: use `@react-native-async-storage/async-storage` via Zustand persist. Nunca acesse o storage diretamente fora do store/hook de dados.
- **Haptics**: centralize em `src/shared/lib/haptics` (alias `@lib/haptics`). Nunca importe do expo-haptics diretamente em componentes.
- **Hooks de negócio**: ficam em `src/features/<feature>/hooks/`. UI reutilizável e burra fica em `src/shared/ui` (alias `@ui/*`).
- **Sem `any`**: proibido usar `any` no TypeScript. Use `unknown` + type guard ou defina o tipo correto.
- **Nomeação de arquivos**: kebab-case para todos os arquivos (ex.: `set-row.tsx`, `use-rest-timer.ts`).

---

## 6. Fluxo de Treino (Domínio)

- O estado de sessão ativa vive exclusivamente no `src/features/workout/store.ts`.
- Progressão automática segue o modelo de **double progression** definido em `src/entities/load-history/lib/progression.ts` (alias `@entities/load-history`) — não implemente lógica de progressão inline.
- e1RM calculado com **fórmula de Epley** (`src/entities/session/lib/e1rm.ts`, via `@entities/session`).
- Detecção de PR acontece após cada set (`src/entities/session/lib/pr-detection.ts`) — nunca no momento de salvar sessão.
- `isSupersetWith` em `PlanExercise`: quando preenchido, os exercícios são exibidos agrupados no logger.

---

## 7. Formulários & Feedback

- Inputs numéricos (peso/reps) usam o `NumericKeypadSheet` — nunca o teclado nativo para valores de treino.
- Mensagens de erro aparecem **abaixo do campo** que originou o erro, nunca só no topo da tela.
- Confirmações destrutivas (ex.: abandonar treino) exigem confirmação explícita (Alert ou sheet modal).
- Feedback de sucesso: animação + háptico leve. Nunca apenas mudança silenciosa de estado.

---

## 8. Navegação

- Bottom tab bar máximo **5 itens** (Apple HIG). Atualmente: Home, History, Profile.
- Deep linking: todas as rotas do `(workout)` devem ser linkáveis.
- Fluxo de workout: `preview → logger → summary`. Nunca permita navegar de volta do logger para o preview sem confirmação de abandono.
- Rotas de `(auth)` e `(onboarding)` ficam fora do tab bar — são stacks independentes.
