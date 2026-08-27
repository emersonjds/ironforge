# Spec — Limpeza do app para lançamento

**Cards:** SPA-107, SPA-108, SPA-121
**Status:** em implementação
**Repos afetados:** `ironforge` (app do aluno)

## Problema

Três superfícies alcançáveis em produção não deveriam estar no build de lançamento:

1. **`app/(coach)/`** — quatro telas (home, aluno, financeiro, perfil) e uma de vídeos, todas lendo de `@shared/mocks`. O financeiro abre um `Alert` dizendo que a assinatura é gerida no painel web. Tela com dado inventado é motivo de rejeição na revisão da App Store.
2. **`app/(app)/notifications.tsx`** — caixa de entrada alimentada por `notifications.mock.ts`, sem nenhuma infraestrutura de push por trás.
3. **Atalho de login de desenvolvimento** — `DevLoginPicker` já guarda `if (!__DEV__) return null`, mas `dev-accounts.ts` traz **senha em texto puro no código** e é importado estaticamente por `welcome-screen` e `sign-in-screen`. A string sobrevive ao bundle de produção mesmo com o componente não renderizando.

## Decisão

**O personal usa só o painel web.** O app é do aluno. A área do personal sai do produto, não é escondida.

## Escopo

### SPA-107 — remover a área do personal

Apagar:
- `app/(coach)/` inteiro — `_layout.tsx`, `index.tsx`, `financeiro.tsx`, `perfil.tsx`, `exercise-videos.tsx`, `student/[id].tsx`
- `src/features/coach/`
- `src/features/video-upload/` — o único consumidor é `app/(coach)/exercise-videos.tsx`. Some junto.
- Mocks órfãos: `coach.mock.ts`, `coach-students.mock.ts`, `coach-finance.mock.ts`

Ajustar:
- `app/_layout.tsx` — remover `<Stack.Screen name="(coach)" />`
- `app/index.tsx` — remover o `Redirect` para `/(coach)`
- `src/shared/mocks/index.ts` — remover os exports órfãos

Criar:
- Tela de orientação para quem tem **só** perfil de personal, explicando que o acompanhamento é feito no painel web, com botão que abre o navegador.

**Bug que morre junto:** `exercise-video-library-screen.tsx` alimentava o uploader com `EXERCISE_CATALOG` (ids no formato `ex-bench-barbell`) enquanto `video-upload/api.ts` chamava rotas reais que exigem `z.uuid()`. Toda chamada quebraria em produção.

### SPA-121 — remover a tela de notificações

Apagar `app/(app)/notifications.tsx`, a aba correspondente e `notifications.mock.ts`. A tela volta junto com o push de verdade (SPA-119).

### SPA-108 — tirar o atalho de login do build de produção

O guard `__DEV__` já existe e continua. O que muda é a **origem das credenciais**:

- `dev-accounts.ts` deixa de ter senha literal. Passa a ler de `process.env.EXPO_PUBLIC_DEV_ACCOUNT_PASSWORD`, definida só no `.env` local (que não é versionado).
- Sem a variável, a lista de contas fica vazia e o picker não renderiza — comportamento correto em qualquer build de produção.
- `.env.example` documenta a variável.

**Por que não bastava o `__DEV__`:** o componente não renderizar não impede o módulo de entrar no grafo do Metro. A senha literal iria para o bundle de release de qualquer forma. Tirar o literal do código é o que resolve.

## Fora de escopo

- Renovação de sessão e `expo-secure-store` (SPA-124).
- Push notification (SPA-119).
- Simplificar `UserRole` além do necessário para as telas removidas — o modelo de perfis paralelos da API continua valendo, e mexer nele agora é risco sem retorno.

## Critérios de aceite

- Nenhuma rota alcançável no app importa de `@shared/mocks`.
- Personal sem perfil de aluno faz login e vê a tela de orientação, com link funcionando. Nunca tela vazia nem loop de redirect.
- Quem tem os dois perfis entra normalmente como aluno.
- Build de produção não contém nenhuma senha de conta de desenvolvimento.
- `typecheck`, `lint` e a suíte inteira limpos.

## Testes

**Unitários**
- Roteamento raiz: aluno vai para `(app)`, aluno sem onboarding vai para `(onboarding)`, personal puro vai para a tela de orientação, não autenticado vai para `(auth)`.
- `dev-accounts`: sem a variável de ambiente, a lista é vazia.
- Nenhum arquivo fonte contém a senha de desenvolvimento como literal.

**Integração (MSW)**
- Login de aluno: `POST /auth/login` responde com `athleteId`, o store guarda o perfil e o destino é o app do aluno.
- Login de personal puro: a resposta traz `coachId` sem `athleteId`, e o destino é a tela de orientação.
- Erro 401 mantém a sessão deslogada com a mensagem de credencial inválida.

MSW passa a existir no repo do app a partir desta entrega, e serve de base para os cards que ligam o app à API real (SPA-102, SPA-103, SPA-105).
