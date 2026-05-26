# IronForge — Arquitetura de Frontend (decisão: FSD adaptado)

> **ADR (Architecture Decision Record).** Supersede `03-architecture.md §1` (estrutura de pastas). Vale para **`ironforge` (mobile, Expo/RN)** e **`ironforge-web` (Next.js + TailAdmin)** — projetos separados que seguem a **mesma arquitetura** para consistência. `08-engineering-guide.md` e `memories/golden-rules.md` serão reconciliados na Fase 0 da migração.

## Contexto
O app cresceu de logger solo → plataforma personal↔aluno, com duas superfícies (mobile + web) e domínio compartilhado por spec (`07`). Precisa escalar features sem virar espaguete, com fronteiras claras para um time misto de humanos e agentes de IA.

## Opções avaliadas (análise fria)
1. **Layered (por tipo técnico).** Pastas por camada (services, controllers, components). ❌ Não escala por domínio; cada feature nova se espalha por N pastas; alto acoplamento.
2. **Feature-folder (atual).** `src/features/<dom>/{screens,components,hooks,lib,store,api}`. ✅ Simples, domínio-cêntrico, baixo atrito. ⚠️ **Fraqueza:** entidades reutilizadas entre features (ex.: `Exercise` aparece em plans, workout, progress) não têm casa canônica → ou viram import cruzado entre features (acoplamento escondido) ou incham um `shared/` genérico.
3. **FSD puro (Feature-Sliced Design).** Camadas `app → pages → widgets → features → entities → shared`, *slices* por domínio, *segments* (`ui/model/lib/api`), import estritamente unidirecional. ✅ Disciplina, escala para times grandes, **agnóstico de framework** (mesmo padrão em RN e Next). ⚠️ Cerimônia alta; a camada **`pages` conflita com Expo Router e Next App Router**, que já fazem roteamento baseado em arquivo (duplicação/confusão).
4. **FSD adaptado ("FSD-lite") — ESCOLHIDO.** Adota o que é valioso do FSD (camada **`entities`**, **regra de import unidirecional**, **public API por slice**) e descarta o que briga com os routers file-based (a camada `pages` vira o próprio `app/`).

## Decisão: FSD adaptado

### Camadas (mobile — Expo Router)
```
app/                  → ROTEAMENTO (Expo Router) = camada "pages". Só wiring: importa um screen e renderiza.
src/
├── widgets/          → blocos de UI compostos, cross-feature (ex.: NextWorkoutCard, WeekStrip, PrCelebration)
├── features/         → CASOS DE USO / fluxos (ex.: log-set, rest-timer, assign-plan, bulk-assign, swap-exercise, suggest-load)
├── entities/         → DOMÍNIO reutilizável. Por entidade: schema Zod + lógica pura + UI "burra" da entidade
│   ├── exercise/     (catálogo, variações, swap helpers)
│   ├── plan/         (template, assigned, next-session-resolver)
│   ├── session/      (e1rm, volume, pr-detection, set log)
│   ├── load-history/ (sugestão de carga, regras de invalidação)
│   ├── athlete/  └── coach/  └── video/
└── shared/           → design system (ui/), infra (lib/: storage, query, haptics), theme/, types base, utils
```

**Mapeamento a partir do código atual:** o que hoje está em `src/features/<dom>` se divide — o que é **dado+regra reutilizável** desce para `entities/`; o que é **ação/fluxo** fica em `features/`. `components/ui`, `lib/`, `theme/`, `types/` sobem para `shared/`. As telas continuam finas em `app/` (Expo Router).

> Distinção-chave (decore): **entity = substantivo** (Exercise, Session, Plan). **feature = verbo** (logar set, atribuir plano, trocar exercício). **widget = bloco de tela** que junta entities/features. Se está em dúvida, pergunte "é um *dado/regra* (entity) ou uma *ação do usuário* (feature)?".

### Regra de import — a alma do FSD (obrigatória)
- Import só **"para baixo"**: `app → widgets → features → entities → shared`. Nunca para cima.
- **Sem import lateral** entre slices da mesma camada (feature A não importa feature B; entity X não importa entity Y direto). Comunicação acontece por uma camada acima ou via `shared`/`entities`.
- Cada slice expõe uma **public API** (`index.ts`); o interior é privado.
- **Enforço automático:** `eslint-plugin-boundaries` (ou **Steiger**, linter oficial do FSD) no CI. Quebra de fronteira = build vermelho.
- **Path aliases:** `@app/*`, `@widgets/*`, `@features/*`, `@entities/*`, `@shared/*`.

### Por que isto e não FSD puro
- Expo Router e Next App Router **já são** a camada de pages/roteamento — não duplicar.
- Preserva a simplicidade do feature-folder que o time já usa; só **formaliza a fronteira entity↔feature** e as **regras de import** (que é onde feature-folder apodrece).
- **Cross-surface:** a mesma mental model vale no mobile (Expo) e na web (Next/TailAdmin) → os dois projetos separados ficam consistentes sem serem um monorepo.

### Aplicação na web (`ironforge-web` — Next + TailAdmin)
- `app/` (Next App Router) = pages. Componentes do **TailAdmin** entram adaptados em `shared/ui`. Mesmas camadas `entities/features/widgets/shared`. O domínio (`entities/*/schema`) é **replicado de `docs/07`** (projetos separados, sem pacote unificado).

## Estado: TanStack Query (servidor) vs Zustand (cliente)

Para o fluxo nunca virar espaguete, vale **uma regra única, decidível numa frase**:

> **Veio de fora (servidor)? → TanStack Query. Nasce e vive no app? → Zustand.**

Não são substitutos — resolvem estados diferentes:

| | **TanStack Query** | **Zustand** |
|---|---|---|
| Tipo de estado | **Server state** (assíncrono, remoto) | **Client state** (síncrono, local) |
| Fonte da verdade | o servidor | o próprio app |
| Responsabilidade | fetch, cache, invalidação, staleness, retry, sync | sessão em andamento, UI efêmera, flags |
| Exemplos | ficha do aluno, planos do coach, histórico remoto | treino em execução, índice do exercício atual, rest timer, auth/token |

**Invariante que mantém simples:** *nenhum dado mora em dois lugares.* Query nunca duplica estado em Zustand; Zustand nunca vira cache de dados remotos. Enquanto a fronteira for respeitada, o fluxo é linear:

```
SERVIDOR ──fetch──> TanStack Query ──┐
                                      ├──> Tela (lê de UM ou de OUTRO, nunca soma os dois)
usuário interage ──> Zustand store ──┘
```

**Onde mora cada coisa nas camadas:** stores Zustand vivem em `features/<feature>/store.ts` (estado de fluxo, ex.: sessão ativa) ou `shared` quando global (auth). Hooks de Query vivem em `features/<feature>/hooks/` (ou `entities/<dom>` quando é leitura de domínio puro), consumindo o `queryClient` de `shared/lib/query`. **Parsing na borda:** todo dado que entra (storage hoje, rede amanhã) é validado com o schema Zod da entity (`safeParse`) antes de virar estado — vale tanto para a hidratação do Zustand quanto para o `queryFn`.

> **Estado atual do projeto:** o `QueryClientProvider` já está montado, mas ainda **sem `useQuery`/`useMutation`** (backend "a definir" — dados locais/mock). O Zustand carrega o peso hoje (sessão ativa + auth); o Query entra quando o backend existir. Cada recurso novo então é só "mais um `useQuery`" — a regra acima já decidiu a lib, sem zona cinzenta.

## Migração (incremental — sem big-bang)
- **Fase 0:** criar `src/shared/` (mover `components/ui`, `lib`, `theme`, `types`) e `src/entities/` (mover catálogo de exercício; mover `e1rm`/`progression`/`volume`/`pr-detection` para `entities/session` ou `entities/exercise`). Manter `src/features/` para fluxos. Configurar aliases + `eslint-plugin-boundaries`.
- **Boy-scout rule:** não reescrever tudo de uma vez — mover por feature conforme for tocando.
- Atualizar `08-engineering-guide.md` e `golden-rules.md` (de "feature-first" → "FSD-lite") no PR que iniciar a migração.

## Trade-offs / riscos
- **Curva de aprendizado** da distinção entity vs feature → mitigada com exemplos no `08`.
- **Over-engineering** se o app fosse pequeno — mas a plataforma (2 superfícies, domínio rico) justifica a disciplina.
- **Custo de manutenção das fronteiras** → automatizado por lint, então é barato após o setup.

## Decisão
**Adotar FSD adaptado (FSD-lite)** em `ironforge` e `ironforge-web`, com migração incremental começando na Fase A do roadmap (`06`).
