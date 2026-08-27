# IronForge — guia para IAs (leia primeiro)

IronForge é uma **plataforma personal↔aluno** (B2B2C): app mobile (Expo/RN) para o aluno + painel web (`ironforge-web`, base TailAdmin) para o personal. Era um app solo; o pivot está em `docs/05-platform-vision.md`.

## Regras de ouro da plataforma IronForge

> Bloco idêntico nos três repositórios (`ironforge-api`, `ironforge-web`, `ironforge`). Mudou aqui, muda nos três no mesmo dia.

### Commits
Micro commits, um por contexto, **Conventional Commits** em inglês (`feat(auth): add refresh token rotation`). Git flow: `master` (estável) ← `developer` (integração) ← `feature/…` · `fix/…` · `docs/…`; feature sai de `developer` e volta pra ela com merge `--no-ff`.

**Autoria é exclusivamente do Emerson** (`Emerson Silva <emerson_jdss@hotmail.com>`). **Zero lastro de LLM:** nenhum `Co-Authored-By`, nenhum 🤖, nenhuma menção a Claude/Anthropic/IA em mensagem, corpo, PR ou comentário. Rodar `typecheck` + `lint` + `test` antes de cada commit. Commitar e pushar **só quando pedido**.

### Código
- **Clean code e clean architecture em todo lugar.** Qualquer dev — júnior, pleno ou sênior — entende um arquivo em até 10 segundos. Se precisa de esforço, o arquivo está errado.
- **Padrão de projeto certo para o contexto:** backend em vertical slices (rota → serviço → repositório, sem camada especulativa); front e mobile em **FSD** (`app → widgets → features → entities → shared`, imports só para baixo).
- **Sem comentários** — o código se explica. Comentário só onde a lógica é genuinamente complexa e o "porquê" não cabe no nome.
- **Tudo em inglês:** código, nomes, commits, documentação técnica. **Português apenas no que o usuário final lê** (UI, mensagens de erro exibidas, copy).
- **Zod é a fonte única** de tipo e validação (`z.infer<>`), do banco à borda da API à tela. Sem `any` — use `unknown`.
- Sem abstração sem segundo caso concreto: nada de interface com uma implementação, factory de um produto, config para valor que nunca muda.

### Testes
Toda entrega vem com teste. Não existe "teste depois".
- **Backend:** testes de **integração** contra banco real, exercitando o fluxo ponta a ponta (rota → validação → auth → transação → SQL). Unitário só para lógica pura e ramificada.
- **Front e mobile:** unitário (Vitest / Jest) + **integração com MSW** para tudo que fala com a API + **e2e com Playwright** quando o fluxo é crítico.

### Documentação
- **Swagger sempre em dia.** O backend gera OpenAPI a partir dos schemas das rotas; nova rota ou mudança de contrato regenera `docs/openapi.json` no mesmo commit.
- **README matador em todo repo:** o que é, como rodar do zero, badges de stack e cobertura de testes, comandos, estrutura de pastas.
- **Licença proprietária** em todo repo, com as sanções da Lei 9.610/1998, Lei 9.609/1998 e art. 184 do Código Penal.

### Orquestração — `spp`
Mensagem começando com **`spp`** é ordem de orquestração Superpowers para a feature ou correção que segue. Fluxo obrigatório, sem pular etapa:
1. **brainstorming** → alinhar intenção, apresentar design, obter aprovação.
2. **spec** → `docs/specs/<feature>.md`.
3. **writing-plans** → plano de implementação.
4. **Implementação orquestrada** → delegar aos subagentes de `.claude/agents/`.
5. **Verificar** → `typecheck` + `lint` + `test` + rodar de verdade.

`spp` sozinho retoma a orquestração ativa. **Subagente nunca herda o modelo da sessão:** `haiku` para tarefa mecânica, `sonnet` como padrão, `opus` só para raciocínio difícil (arquitetura, segurança, estratégia).

### Gerenciador de pacotes
**npm em todos os três repositórios.** Nada de pnpm ou bun: um só lockfile (`package-lock.json`), um só comando na cabeça, e nenhum problema de resolução que só aparece num deles. Dependência nova entra com `npm install`; no app Expo, sempre com `npx expo install`, que escolhe a versão compatível com o SDK.

### MCPs
`context-mode` (economia de contexto), `context7` (documentação de biblioteca atualizada) e o plugin `superpowers`. Saída grande vai para `ctx_batch_execute`/`ctx_execute` — log bruto nunca entra no contexto.

## Trabalhe assim — Spec-Driven Development
**Nenhum código sem spec.** Loop: entender → especificar (`docs/specs/<feature>.md`, copie `_TEMPLATE.md`) → revisar com o agente certo → planejar → implementar → verificar (`/run`, `/verify`) → PR. Detalhes em `docs/09-spec-driven-development.md`.

## Fonte de verdade (docs/)
- `05` visão (por quê) · `06` PRD (o quê + prioridade P0/P1/P2) · `07` modelo de dados (Zod) · `02` design spec · `08` como criar uma feature · `09` processo + git flow · `10` **arquitetura de frontend (FSD adaptado)**.
- `11` = **regras invioláveis específicas do mobile** (design, a11y, touch/interação, FlashList, kebab-case). Arquitetura = **FSD-lite** (`app→widgets→features→entities→shared`, imports só pra baixo — ver `10`).

## Agentes (`.claude/agents/`) — coordenam-se pelos docs
- domínio/coaching → `bodybuilding-coach`
- UX/UI → `mobile-ui-ux-designer`
- arquitetura/dados/perf → `mobile-dev-expert`
- mercado/prioridade (palavra final) → `fitness-market-product-owner`

## Stack
Expo/RN + expo-router + NativeWind + Zustand + TanStack Query + React Hook Form/Zod. Storage: AsyncStorage (MMKV opcional, exige dev build). Backend: `../ironforge-api` (Fastify + Drizzle + Postgres); contrato HTTP é o OpenAPI gerado por ela. **App e Web são projetos SEPARADOS** (não monorepo): a web (`ironforge-web`) é Next.js com **TailAdmin como base** e replica os schemas de `docs/07`.

## Comandos
`npm run start | ios | android | web` · `npm run typecheck` · `npm run lint`
