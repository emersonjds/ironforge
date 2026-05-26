# Spec: Feed de comunidade (Reels) — PARKED (P2 condicional)

> **Status:** parked · **Agente dono:** po · **Prioridade:** P2 (condicional) · **Lado:** mobile (aluno)
> **Specs relacionadas:** `01-product-scope.md`, `05-platform-vision.md`, `04-competitive-research.md`

## Veredito (product owner)
**Não construir agora.** No modelo **coach↔aluno**, a retenção já vem do **vínculo com o personal** (relação paga, plano personalizado, progressão visível). Feed social resolve a retenção de apps **solo** (Hevy/Strong), onde não há personal. Construir feed cedo é compensar um core que ainda não está pronto — não é feature, é sintoma.

Foi implementado uma vez (aba Reels + curtir) e **removido** após esta análise, para focar nas Fases A–D (vínculo, ficha, painel do personal, cobrança), que são a razão de o personal pagar.

## Tensão nos docs (registro)
- **A favor** (`04`): feed social é o moat do Hevy e o "diferencial que ninguém replicou com tração".
- **Contra** (`01`/`05`): cortado como anti-escopo — *"social/feed distrai da adesão individual"*, *"comparação social"* na lista de não-fazer.

## Se/quando reabrir — enquadramento obrigatório
- **Feed de turma**, não global: só o círculo do MEU personal ("colegas de treino com o Coach X").
- Celebrar **PR/adesão** ("João bateu recorde no supino"), **sem ranking** nem comparação de carga.
- **Opt-in explícito** do aluno.
- Feed público global = anti-escopo (vira Hevy, não IronForge).

## Gatilho para reabrir (condição)
- Massa crítica: **≥ 50 alunos ativos** distribuídos em **≥ 10 turmas** distintas.
- Fases A–G (especialmente vínculo, ficha, painel web e cobrança) rodando.

## Riscos que motivaram o "não agora"
- Moderação de foto/vídeo necessária desde o dia 1 (infra inexistente).
- Cold-start por design: feed vazio é pior que não ter feed.
- Compete com a métrica de ativação ("logar a 1ª sessão").
- Dívida de manutenção (CDN de vídeo, notificações, moderação) sem receita direta.
