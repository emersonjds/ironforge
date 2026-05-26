# Spec: Papéis (aluno/professor) + Coach Mode mobile (companion)

> **Status:** draft · **Agente dono:** mobile-dev + po · **Prioridade:** P1 · **Lado:** mobile
> **Branch:** `feat/coach-mode` · **Specs relacionadas:** `05-platform-vision.md`, `06-platform-spec.md`, `07-data-model-v2.md`, `auth-redesign.md`

## Problema / JTBD
O app mobile hoje é só do **aluno**; o personal opera pelo painel web. O fundador pediu **duas visões no login (sou aluno / sou professor)**. JTBD do personal no celular: *"enquanto estou na academia, quero olhar de relance quem treinou, quem sumiu, e mandar um retorno rápido — sem abrir o notebook."* Ou seja, o mobile do coach é **companion** (leitura + ação rápida), não a superfície de construção de treino.

## Decisão
1. **Login com seleção de papel** (`Sou Aluno` / `Sou Professor`) **agora**, por ser fase mock sem backend e ser o pedido direto. O `role` é gravado no `useAuthStore`.
   - **Produção (handoff):** o ideal (recomendação do PO) é **detectar pelo perfil** — `CoachProfile`/`AthleteProfile` na conta — e só mostrar seletor para contas com **ambos** os perfis. Seletor genérico passa a ideia errada de que qualquer um vira coach. Migrar quando houver auth real.
2. **Coach mobile = companion leve.** Web continua a power surface (builder, cópia em massa, periodização, vídeo, cobrança ficam **fora** do mobile).
3. Roteamento por papel na raiz: coach → `/(coach)`, aluno → `/(app)`.

## Dados (ref `07-data-model-v2.md`)
- `useAuthStore` ganha `role: "athlete" | "coach" | null`.
- Usa conceitualmente `CoachProfile`, `AthleteProfile`, `CoachAthleteRelation`. Nesta fase, **mock** em `src/shared/mocks/coach-students.mock.ts` (aluno: nome, foto, adesão semanal, dias desde última sessão, plano atual).

## Telas / fluxo
```
Welcome → [Sou Aluno]   → SignIn/SignUp (role=athlete) → /(app)
        → [Sou Professor]→ SignIn/SignUp (role=coach)   → /(coach)

/(coach)  (tab/stack companion)
  Home: lista de alunos (adesão, alerta de sumiço) → tap → Ficha do aluno (leitura)
```

## Critérios de aceite
- [ ] Welcome oferece as duas visões; papel persiste e a raiz roteia por papel.
- [ ] Coach Home lista alunos (mock) com status de adesão da semana e destaque de quem sumiu 3+ dias.
- [ ] Ficha do aluno (leitura): plano atribuído, última sessão, cargas — sem edição.
- [ ] Aluno comum nunca cai na view de coach.
- [ ] `npm run typecheck && npm run lint` verdes; roda iOS/Android.

## Escopo desta fatia (slice 1 — P0)
- Seleção de papel no login + roteamento.
- Coach Home: lista de alunos + adesão (mock).
- Ficha do aluno (leitura, mock).

## Fora de escopo (web-only ou fases futuras)
- P1 mobile (próxima fatia): nota rápida contextual no exercício; aprovar/rejeitar troca de exercício.
- Builder de treino, cópia em massa, periodização/weekConfigs, upload de vídeo, biblioteca, cobrança, dashboard analítico → **web**.
- Auth real / detecção de papel por perfil (handoff acima).
- Push real de adesão (mock visual por ora).

## Financeiro do professor (mock agora · gateway depois)
**Modelo (PO):** MVP é **SaaS por faixa de alunos** (professor paga a plataforma; cobra o aluno) — MFit/Tecnofit/Fitfolio fazem assim. Take-rate/split entra só quando houver gateway. **Fintech-BR:** gateway alvo **Asaas** (subconta, cobrança recorrente PIX/cartão/boleto, split, saque PIX). O mobile **nunca processa pagamento — só exibe**.
- **Tela Financeiro (mock):** saldo disponível + "Sacar via Pix"; **adiantamento de recebíveis** (antecipa o a-receber com taxa); **provisão de recebimentos** (agenda por período); **cobranças por aluno** (status pago/a vencer/atrasado, método, vencimento) + "gerar cobrança".
- **Campos já no mock (1:1 com Asaas, zero retrabalho):** valores em **centavos**; `status: paid|pending|overdue`; `method: pix|credit_card|boleto`; bruto vs líquido vs taxa; `dueDate`; recorrência. Balance: `available/pending/receivedThisMonth`.
- **Ativar aluno:** FSM `pending_payment → active → past_due → suspended → cancelled` (webhook confirma). No mock, ativação imediata.
- **KYC** (CPF/MEI + chave Pix) acontece no onboarding do PSP, não no nosso backend — guardar só `gatewayAccountId` + `kycStatus` quando plugar.
- **Web-only:** builder, cópia em massa, periodização, vídeo, dashboards ricos.

## Perguntas abertas
1. Coach tab bar própria (Alunos / Avisos / Perfil) ou stack simples? (MVP: stack simples com Home + detalhe.)
2. Coach que também é aluno (perfil duplo) — seletor de contexto: fora do MVP.

## Plano (arquivos / tarefas) — slice 1
- [ ] `src/shared/mocks/coach-students.mock.ts` — alunos mock + adesão.
- [ ] `src/features/auth/store.ts` — `role` no estado + `signIn(..., role)`.
- [ ] `src/features/auth/screens/welcome-screen.tsx` — seleção de papel.
- [ ] `app/index.tsx` — roteia por papel.
- [ ] `app/(coach)/_layout.tsx` + `app/(coach)/index.tsx` (Home) + `app/(coach)/student/[id].tsx` (ficha).
- [ ] `src/features/coach/screens/*` — Home (lista) + Ficha do aluno.
- [ ] `app/_layout.tsx` — corrigir tema raiz (remover `dark`, StatusBar escuro, fundo claro).
