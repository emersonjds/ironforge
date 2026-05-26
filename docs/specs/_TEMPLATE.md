# Spec: <Nome da Feature>

> **Status:** draft · **Agente dono:** <coach|ux|mobile-dev|po> · **Prioridade:** P0|P1|P2 · **Lado:** web|mobile|ambos
> **Branch:** `feat/<escopo>` · **Specs relacionadas:** [[...]]

## Problema / JTBD
Quem precisa, de quê, por quê. Personal ou aluno? Qual job-to-be-done resolve.

## Decisão
O que vamos fazer — e o que decidimos **NÃO** fazer (e por quê). Cite alternativas descartadas.

## Dados (ref `07-data-model-v2.md`)
Entidades/campos Zod tocados. Schemas novos? Mudança em existente? Regra de invalidação/soft-delete?

## Telas / fluxo (ref `02-design-spec.md` + `08`)
Telas, navegação, estados (loading / erro / empty / offline). Wireframe em texto se ajudar.

## Critérios de aceite
- [ ] ...
- [ ] ...

## Fora de escopo
O que explicitamente **não** entra nesta fatia.

## Perguntas abertas
Decisões que dependem de humano ou de outro agente (handoffs).

## Plano (arquivos / tarefas)
- [ ] `src/types/domain.ts` — ...
- [ ] `src/features/<feature>/lib/...` (+ teste)
- [ ] `src/features/<feature>/...`
- [ ] `app/.../...` (wiring de rota)
