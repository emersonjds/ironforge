# IronForge — PRD da Plataforma (features, prioridades, roadmap)

> Reconciliação das análises dos 4 agentes. Cada feature: **decisão · lado (web/mobile/ambos) · prioridade · porquê**.
> Prioridades: **P0 = agora (MVP plataforma)** · **P1 = próximo** · **P2 = depois**.

---

## 1. Vínculo Personal ↔ Aluno (P0 · ambos)
**Decisão:** perfis paralelos `CoachProfile` + `AthleteProfile` no mesmo `User` (não um enum `role`). Personal convida aluno → aluno aceita via deep link → relação `active`. Aluno sem coach = autônomo (modo solo preservado).
**Porquê:** é o alicerce de tudo; sem vínculo não há atribuição, cobrança nem acompanhamento. Perfis paralelos evitam `if (role===...)` espalhado e cobrem o caso real de quem é coach e aluno ao mesmo tempo.

## 2. Vídeo: biomecânica, upload e entrega segmentada por executante (P1 · ambos)
**Decisão (catálogo):** **NÃO** criar categorias "exercícios de homem/mulher". A segmentação é por **executante do vídeo** (`performerGender: male|female|all`) + preferência do aluno (`same|any`), apresentada como **silhueta A / B / todos** — sem rótulo de gênero na UI. Ênfase por objetivo (ex.: glúteo/posterior) é resolvida por filtro de objetivo e `muscleEmphasis`, não por gênero.
**Decisão (curadoria):** vídeo só entra com checklist técnico (amplitude completa, ângulo de câmera correto, carga ~60-70% pra demonstrar técnica, sem compensações de risco). Top 30-40 exercícios revisados por profissional CREF/fisio. MVP pode usar links externos curados + wrapper de checklist (vídeo próprio é P1).
**Decisão (upload):** personal sobe vídeo no painel web → pre-signed URL direto pro storage (backend não recebe o binário) → transcodificação assíncrona → HLS adaptativo. Vídeo do personal tem prioridade sobre o genérico.
**Porquê:** atende conforto/representatividade e técnica correta sem o app endossar desinformação metodológica. Upload direto + CDN escala sem custo por aluno adicional.

## 3. Catálogo de exercícios: máquinas + variações (P1 · ambos)
**Decisão:** modelo de 2 níveis — **exercício-base** + **variação** via `baseExerciseId`. Campos novos: `variationType`, `equipmentDetail` (ex.: "Hammer Strength", "leg press 45°"), `muscleEmphasis` (stretch/peak/mid-range), `difficultyLevel`, `riskFlags`. Substituição inteligente prioriza mesmo `baseExerciseId`, depois `movementPattern`.
**Expansão:** Fase 1 = +50 exercícios cobrindo todos os músculos com 3-4 variações de equipamento; foco em sub-representados (glúteos, posterior, deltóide posterior, panturrilha, isolamentos). Fase 2 = 100+ variações de máquinas + exercícios customizados do personal (sempre com `baseExerciseId` pra preservar histórico).
**Porquê:** máquinas são a maioria do equipamento em academias BR; variar sem `baseExerciseId` quebra substituição e histórico.

## 4. Registro de carga PERSISTENTE (P0 · mobile) — sua dor #1
**Decisão:** entidade `LoadHistory` **indexada por `exerciseId`** (não pelo plano). `SetLog` ganha `exerciseId` desnormalizado. Planos e exercícios usam **soft-delete** (`deletedAt`), FK `ON DELETE RESTRICT`. Carga **nunca some** ao trocar/arquivar treino. Só invalida em 3 casos explícitos: `manual_override` (aluno logou carga diferente), `weight_change_requested` (aluno pediu mudar), `coach_reset` (personal resetou). Edição de carga preserva `originalWeight` + `editedAt` (auditoria).
**Porquê:** progressão de longo prazo só existe se o histórico persiste através de trocas de treino; é o diferencial de fidelização mais forte.

## 5. Cópia em massa de treino (P0 · web)
**Decisão:** `POST /plan-templates/:id/bulk-assign { athleteIds[], startDate, coachNotes? }` numa transação → cria N `AssignedPlan` (snapshots). UI "Enviar para turma": checkbox + filtros rápidos ("intermediários em hipertrofia", "sem plano ativo"). Opção "ajustar por aluno" abre edição multi-coluna.
**Porquê:** copiar 1-a-1 para 20+ alunos é inaceitável; é a dor operacional central do personal com muitos clientes.

## 6. Periodização ABCD distribuída (P1 · web→mobile)
**Decisão:** `PlanTemplate` (do personal) → `AssignedPlan` (snapshot do aluno). Dias usam `slotLabel` ("A/B/C/D") + `slotIndex` (ordem de rotação) + `targetDaysOfWeek` (sugestão). "Qual treino hoje" é resolvido por função pura `resolveNextSession()`. Progressão multi-semana via `weekConfigs` (volumeMultiplier, deload, nota de intensidade) + `weeklyRirProgression`. O personal monta blocos (Acumulação/Intensificação/Pico/Deload) numa timeline e envia o macrociclo.
**Porquê:** "pasta ABCD" é o vocabulário operacional do personal; snapshot impede o treino mudar embaixo do aluno no meio do ciclo.

## 7. Adaptação de treino copiado por aluno (P1 · web)
**Decisão:** ao copiar template, tela de "configuração rápida": nível (iniciante/interm/avançado), objetivo (hipertrofia/força/recomp), restrições físicas (multiselect). Sistema sugere ajustes globais (volume/faixa de reps/RIR-alvo/carga) com revisão manual depois. `riskFlags` no exercício **alertam** (nunca bloqueiam) contra restrições do aluno. `AdaptationLog` registra o porquê das mudanças.
**Porquê:** sem ajuste rápido em massa, a fricção mata o uso real; autonomia do personal é preservada (alerta, não bloqueio).

## 8. Página "Quem sou eu" (P1 · web→mobile)
**Decisão:** página pública do personal (`/p/<slug>`): foto, CREF, especialidade, bio, experiência, resultados/depoimentos, planos de trabalho. Editor por blocos (rich text simples). No app do aluno aparece em Perfil → "Treinando com [Nome]" + vínculo emocional ("treina com X há 3 meses, 24 sessões juntos").
**Porquê:** o aluno paga por um humano, não por um app — reduz churn.

## 9. Pagamento recorrente (P1 · web · requer especialista fintech-BR)
**Decisão (modelo dois lados):**
- **IronForge → personal:** SaaS por nº de alunos (ex.: Starter grátis até 3 · Pro até 20 · Elite ilimitado). Trial 14 dias, paywall proativo no dia 12, nunca bloqueia alunos existentes.
- **Personal → aluno:** o personal define planos de serviço (ex.: Básico/Premium/Avulso); a plataforma gerencia o cartão recorrente; IronForge cobra take-rate (~10%) sobre transações intermediadas. Aluno que já paga por fora = "cliente offline", sem taxa.
**Pendências (fase fintech):** rails BR (cartão recorrente, PIX, boleto), gateway (Stripe Connect / Pagar.me / similar), CET/taxas, inadimplência, LGPD. **Acionar `microcredito-fintech-br-specialist` quando esta fase começar.**
**Porquê:** recorrência é a receita; o modelo de marketplace (take-rate) alinha incentivo e tira o personal de gerenciar gateway.

## 10. Treinos prontos / ficha de treino do aluno (P0 · mobile)
**Decisão:** a "ficha" é o `AssignedPlan` visto pelo aluno — só leitura, estrutura clara: objetivo, duração com progressão de RIR explícita, notas do personal por exercício/sessão, vídeo de referência, histórico de carga visível. Personal pode limitar visibilidade futura (`weekVisibility: current_only | current_and_next | all`).
**NÃO entra:** programas genéricos de prateleira, descrição "benefícios do exercício", badges. O valor é a progressão planejada, não a lista de exercícios.
**Porquê:** evita comoditização (anti-escopo do `01`) e mantém o vínculo com o personal.

## 11. Aba "Adicione seu vídeo" para professores (P1 · web)
**Decisão:** seção Biblioteca de Vídeos no painel: por exercício, lista de vídeos (executante A/B/universal), upload com observação que aparece pro aluno. Coberto pela infra da feature 2.

## 12. Simplicidade + "sacrificar logins" (P0 · ambos)
**Decisão:** reduzir fricção sem abrir mão de segurança — sessão persistente ~90 dias, biometria como reautenticação após inatividade, login social (Apple/Google) como caminho principal, **convite por deep link** (`ironforge://invite/:token`, TTL 48h). Onboarding do aluno cai de 4 telas → 2 (experiência+objetivo+unidade; pronto). Personal escolhe frequência/plano — o aluno não.
**Porquê:** "sacrificar logins" = confiar na sessão longa, não eliminar auth. Menos telas = ativação mais rápida.

## 13. Requisitos não-funcionais: rápido, escalável, global (P0 · transversal)
**Decisão:** offline-first (aluno baixa o `AssignedPlan` e trabalha local); **migrar AsyncStorage → MMKV**; cache agressivo TanStack Query (plano `staleTime: Infinity` até nova atribuição; catálogo 7 dias com seed local + diff); **FlashList** em listas longas; optimistic UI em toda mutation; **paginação por cursor** (nunca offset); sync em background ao voltar online; vídeo via CDN + signed URLs. Backend (quando definido): edge, RLS por tenant, gzip/brotli, ETags, push/SSE pra invalidar cache.
**Porquê:** "aguentar muitos alunos no mundo todo" se ganha no cliente (offline/cache/optimistic) tanto quanto no servidor.

---

## Stack mobile vs Flutter
**Decisão: manter React Native/Expo.** Há investimento funcional feito; integrações HealthKit/Health Connect mais maduras em RN; TypeScript compartilhado com a web reduz bugs de contrato; New Architecture (Fabric/TurboModules) + Reanimated 4 eliminaram os gargalos históricos. Flutter só se justificaria com pose estimation/AR pesados no device — não é o caso.

---

## Decisões abertas (preciso de você ou de fase dedicada)
1. ~~Monorepo vs repos separados~~ → **RESOLVIDO (2026-05-25): repos separados.** O app (`ironforge`) e a web (`ironforge-web`) são projetos independentes. A web usa **TailAdmin como base**. `docs/07` é a spec de domínio compartilhada; cada lado replica os schemas Zod relevantes (sem monorepo, sem pacote `@ironforge/domain` unificado).
2. **Pricing exato** (faixas e take-rate) — validar com PO/mercado.
3. **Deload:** automático por nº de semanas, por fadiga acumulada, ou só label manual do personal? (coach-agent pediu definição)
4. **Personal edita sessão ativa do aluno em tempo real?** Regra de precedência. (UX + eng pediram)
5. **Supervisão em tempo real** (personal vê o log durante a sessão) — P2? Exige WebSocket/SSE.

---

## Roadmap (fases)

> Reaproveita o que já existe (logger, e1RM, progressão, telas de auth/onboarding/today). Backend é **paralelo/posterior** (decisão "depois"): seguimos com Zod + mocks.

- **Fase A — Fundação do domínio v2 (P0).** Implementar `07-data-model-v2.md` (Zod), extrair `@ironforge/domain`, migrar AsyncStorage→MMKV, namespacing por usuário. Sem UI nova.
- **Fase B — Vínculo + papéis (P0).** `CoachProfile`/`AthleteProfile`, convite por deep link, AuthGate dual, onboarding enxuto do aluno.
- **Fase C — Ficha do aluno + carga persistente (P0).** Tabs do aluno (Hoje/Fichas/Histórico/Progresso/Perfil), `LoadHistory` por `exerciseId`, `resolveNextSession`, notas do personal.
- **Fase D — Painel web do personal (P0/P1).** Scaffold `ironforge-web` (TailAdmin): dashboard de alunos, editor de treino, **cópia em massa**, biblioteca.
- **Fase E — Vídeo + catálogo expandido (P1).** Upload + entrega segmentada por executante, +50 exercícios/variações.
- **Fase F — Periodização + adaptação (P1).** Timeline de blocos, `weekConfigs`, configuração rápida de adaptação.
- **Fase G — "Quem sou eu" + Pagamento (P1).** Página pública; integração de cobrança (aciona fintech-BR).
- **Fase H — Backend + escala (paralela).** Definir backend, RLS, edge, sync, CDN de vídeo, push.
