# IronForge — Stack escolhido

App de musculação/bodybuilding inspirado no mFit Personal.

## Decisão de stack (após pesquisa em abril/2026)

| Camada | Escolha | Por quê |
|---|---|---|
| Runtime | **Expo SDK 54+** (managed, New Architecture) | DX, EAS Build/Submit/Update, config plugins cobrem 95% das libs nativas |
| Linguagem | **TypeScript strict** | Refatoração segura conforme o app cresce |
| Navegação | **Expo Router** (file-based, type-safe) | Padrão atual do Expo, deep links e tipagem prontos |
| Styling | **NativeWind v4** (Tailwind para RN, AOT-compilado) | Zero custo de runtime, classes Tailwind familiares, ótimo perf |
| Components | **Gluestack UI v3** (headless + acessível, usa NativeWind por baixo) | v3 é unstyled/modular, full a11y, otimizado para Expo SDK 54 + Fabric |
| Animações | **react-native-reanimated v4** + **react-native-gesture-handler** | API CSS para state-driven, worklets para gestos, roda na UI thread |
| State client | **Zustand** | Simples, sem boilerplate |
| State servidor | **TanStack Query** | Cache, retries, optimistic updates |
| Storage | **MMKV** | KV nativo rápido, offline-first |
| Forms | **React Hook Form + Zod** | Validação com schema tipado |
| Build/Release | **EAS Build + Submit + Update** | Builds na nuvem, OTA para mudanças JS |
| Lint/Format | ESLint + Prettier + TS strict | Padrão |

### Por que NativeWind + Gluestack (e não Tamagui)

- Gluestack v3 já adota NativeWind como engine de styling — combo oficial.
- Curva de aprendizado menor (Tailwind é universal).
- Gluestack entrega acessibilidade pronta sem trabalho extra.
- Tamagui ganharia em performance bruta no compile-time, mas o ganho não justifica a complexidade para um app de fitness.

### Reanimated 4 — pontos críticos

- Requer **New Architecture (Fabric)** — já default no Expo SDK 54.
- Limites de performance: ~100 nós animados em Android baixo, ~500 em iOS.
- Animar `transform` e `opacity`, **nunca** `width/height/top/left` (dispara layout pass).
- Babel preset do Expo configura o plugin do Reanimated automaticamente.

## Agents especialistas configurados em `agents/`

1. **bodybuilding-coach** — Educação Física, programação de treinos, periodização, hipertrofia, nutrição. Decide *o quê* o app deve oferecer do ponto de vista do treinador.
2. **mobile-dev-expert** — RN/Expo (primário), iOS nativo, Android nativo, Flutter (comparativo). Decide *como* implementar.
3. **mobile-ui-ux-designer** — Design mobile com background em startups unicórnio. Decide *como o usuário vê e sente* o app.

## Documentos do projeto

- [`docs/01-product-scope.md`](docs/01-product-scope.md) — escopo MVP, personas, modelo de dados (autor: bodybuilding-coach)
- [`docs/02-design-spec.md`](docs/02-design-spec.md) — inventário de telas, design tokens, wireframes, motion specs (autor: mobile-ui-ux-designer)
- [`docs/03-architecture.md`](docs/03-architecture.md) — síntese: estrutura de pastas, camadas, convenções, roadmap de implementação

## Próximos passos sugeridos

1. Validar nome do app (IronForge é placeholder — pode trocar).
2. Decidir backend (Supabase recomendado no `docs/03`).
3. Chamar `mobile-dev-expert` para scaffold da Fase 0 + 1 conforme `docs/03-architecture.md`.

---

## Fontes da pesquisa

- [The 10 best React Native UI libraries of 2026 — LogRocket](https://blog.logrocket.com/best-react-native-ui-component-libraries/)
- [Best React Native Component Libraries with Tailwind Support 2026 — DEV](https://dev.to/ninarao/best-react-native-component-libraries-with-tailwind-support-for-fast-ui-development-in-2026-2fe4)
- [gluestack UI](https://gluestack.io/)
- [react-native-reanimated — Expo Docs](https://docs.expo.dev/versions/latest/sdk/reanimated/)
- [Reanimated 4 Stable Release — SWMansion Blog](https://blog.swmansion.com/reanimated-4-stable-release-the-future-of-react-native-animations-ba68210c3713)
- [Reanimated Performance Guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/performance/)
