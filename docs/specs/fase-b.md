# Spec: Fase B — Vínculo Personal↔Aluno + Onboarding

> **Status:** ✅ implementado · **Agentes:** po + coach + mobile-ui-ux-designer + mobile-dev-expert · **Lado:** mobile (aluno)
> **Branch:** `feat/domain-v2` · **Specs relacionadas:** `06-platform-spec.md §1,12`, `07-data-model-v2.md §Identidade`

## Contexto
Fase A entregou o domínio v2 completo (schemas Zod, FSD-lite, 38 testes verdes). Fase B monta o vínculo coach↔atleta e o fluxo de ativação do aluno no mobile — sem backend real (mock-first, mesmos contratos Zod que a Fase H vai preencher).

## Decisões dos agentes

| Decisão | PO | Dev | Resultado |
|---|---|---|---|
| Token real (TTL, envio por SMS) | backend | backend | Mock: decoder local com tokens fixos |
| `CoachProfile` completo no mobile | não | não | Só `displayName + avatarUrl + bio` |
| `status` transitions (suspended/terminated) | web | web | Mobile só lê `pending→active` |
| Onboarding em 2 telas (não 4) | SIM | SIM | goal.tsx → restrictions.tsx |
| `restrictions` como strings snake_case | SIM | SIM | Salvo em `AthleteProfile.restrictions[]` |

## O que entra em Fase B

### B1 — Seed de relação coach↔atleta
- `src/shared/mocks/relation.mock.ts` com `mockRelation` (status `active`)
- Injeta `coachId` no `AthleteProfile` ao signIn com `role=athlete`

### B2 — Invite token (mock-first)
- `src/entities/invite/schema.ts` — `InviteTokenSchema`
- `src/entities/invite/lib/decode-token.ts` — decodifica token local (tabela estática)
- Chave `pending_invite_token` no `STORAGE_KEYS`
- TTL: token de teste sempre válido no dev (`expiresAt = +48h`)

### B3 — Tela de aceitação de convite
- `app/(auth)/invite.tsx` — recebe `?token=` via params
- Estados: `loading | invalid | expired | ready | accepting`
- "Aceitar" → `acceptInvite()` → onboarding; "Recusar" → welcome
- Registrar em `app/(auth)/_layout.tsx`

### B4 — Onboarding v2 (2 telas)
- `app/(onboarding)/goal.tsx` — refatorar para coletar: Experiência + Objetivo + Unidade (não chama `completeOnboarding` ainda)
- `app/(onboarding)/restrictions.tsx` — nova tela: lista multiselect de restrições físicas + `bodyweightKg`; chama `completeOnboarding`
- `src/features/auth/store/onboarding-draft.store.ts` — store temporário (sem persist) para passar dados entre step 1 e step 2
- AuthGate: `hasCompletedOnboarding=false` → `/(onboarding)/goal`; coach → `/(coach)` (já funciona)

## O que NÃO entra em Fase B
- Token real (geração, TTL backend, envio)
- `CoachProfile` com CREF, slug, página pública
- Transitions `suspended/terminated`
- `riskFlags` vs `restrictions` alertas no logger

## Critérios de aceite
- [x] Tela `invite.tsx` carrega coach mock via token, aceita/rejeita e navega corretamente
- [x] `goal.tsx` coleta 3 campos (experiência, objetivo, unidade) sem chamar `completeOnboarding`
- [x] `restrictions.tsx` recebe draft, adiciona `bodyweightKg + restrictions`, chama `completeOnboarding` → vai para `/(app)`
- [x] `hasCompletedOnboarding=false` + `role=athlete` → vai para `/(onboarding)/goal`
- [x] `typecheck` verde

## Telas / fluxo
```
ironforge://invite?token=invite-amanda-test
    └─→ /(auth)/invite.tsx
             ├─ Aceitar → /(onboarding)/goal → /(onboarding)/restrictions → /(app)
             └─ Recusar → /(auth)/welcome

/(auth)/sign-up (role=athlete)
    └─→ /(onboarding)/goal → /(onboarding)/restrictions → /(app)
```
