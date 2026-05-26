# IronForge — Visão da Plataforma (Personal ↔ Aluno)

> **Este documento redefine o produto.** Os docs `01-product-scope.md` e `03-architecture.md` descrevem o IronForge como um app **solo** (lifter registra o próprio treino). A partir daqui o IronForge é uma **plataforma de coaching B2B2C**: o personal trainer monta e atribui treinos; o aluno executa. O escopo solo continua válido como *modo* (aluno sem coach = autônomo), mas não é mais o produto principal.
>
> Síntese das análises dos agentes `bodybuilding-coach`, `mobile-ui-ux-designer`, `mobile-dev-expert` e `fitness-market-product-owner` (2026-05).

---

## 1. A tese

**Um único app, organizado, rápido e escalável, que substitui MFit + Fitfolio.** Hoje o personal usa um app pra montar treino, outra ferramenta pra cobrar, WhatsApp pra mandar vídeo, e planilha pra acompanhar. O aluno recebe uma experiência feia e lenta. O IronForge unifica isso:

- O **personal** faz tudo de um lugar (painel web): monta treino, copia em massa, periodiza, sobe vídeo, cobra recorrente, acompanha alunos.
- O **aluno** ganha um app mobile lindo, rápido e offline-first que diz exatamente o que fazer hoje, mostra a técnica certa com vídeo de quem ele se identifica, registra em segundos e faz o progresso parecer real.

**Velocidade, simplicidade e a capacidade do personal de escalar sua base de alunos são o produto** — não a lista de features.

## 2. Os dois clientes

| | **Personal (comprador / power-user)** | **Aluno (consumidor diário)** |
|---|---|---|
| Superfície principal | Painel **web** (TailAdmin) | App **mobile** (Expo/RN) |
| Job-to-be-done | "Escalar para N alunos sem minha hora administrativa crescer junto" | "Chegar, saber o que fazer hoje, fazer certo, registrar rápido, sentir que progrido" |
| Paga | Assinatura SaaS do IronForge (por nº de alunos) | Assinatura ao personal (gerenciada na plataforma) |
| Sucesso | Nº de alunos gerenciados (north-star), adesão dos alunos, pagamentos em dia | Logou 1ª sessão logo após receber a ficha; sessões/semana; sente progresso |

> Regra de ouro de escopo: **uma feature só vale se servir o JTBD de um lado sem quebrar o outro.** Toda decisão separa explicitamente *lado-personal (web)* de *lado-aluno (mobile)*.

## 3. Princípios de produto

1. **Simplicidade é feature.** Páginas curtas, organizadas, uma decisão por tela. O trabalho cognitivo pesado mora no painel do personal; o app do aluno só mostra o resultado.
2. **Velocidade é feature.** Offline-first no aluno, optimistic UI, MMKV, listas virtualizadas, paginação por cursor, CDN de vídeo. O app nunca espera a rede.
3. **Escala global.** Arquitetura que aguenta muitos alunos simultâneos no mundo todo (ver `06`/`07` e a fase de backend).
4. **O dado é do aluno.** Histórico de carga e progresso pertencem ao aluno — se ele trocar de coach, o progresso continua. Constrói confiança na plataforma, não só no personal.
5. **Rigor metodológico.** O app não endossa pseudociência (ex.: "exercício de homem/mulher"). Representatividade sim; desinformação não.
6. **Preço competitivo.** Posicionamento igual ou abaixo do mercado (MFit/Fitfolio), com vídeo explicativo completo e fácil. (Pricing detalhado em `06`.)

## 4. O que compõe a plataforma

- **`ironforge` (mobile, Expo/RN)** — app do aluno (núcleo) + view de acompanhamento do personal.
- **`ironforge-web` (Next.js, base TailAdmin)** — painel do personal (montar/copiar/periodizar treino, biblioteca de vídeo, "quem sou eu", cobrança, dashboard de alunos).

> **App e Web são projetos SEPARADOS** (decisão do dono — não é monorepo). O contrato de domínio compartilhado é o **`docs/07-data-model-v2.md`**: é a fonte de verdade dos schemas Zod, e cada lado (mobile e web) os replica/implementa a partir dele. A web **usa o TailAdmin como base** de componentes e telas.

## 5. Anti-escopo (mantido / reforçado)

- WODs/AMRAP/EMOM/"functional", nutrição/macros nativos, gamificação infantil (badges/streaks cringe), comparação social, "plano de 30 dias pra secar".
- **Catálogo segmentado por gênero do exercício** (ver `06` §2 — substituído por preferência de vídeo por executante).
- Periodização 100% automática por IA no MVP (o personal decide; o sistema só dá visibilidade e cálculo).

## 6. Como os agentes colaboram

A inteligência do projeto está distribuída em 4 agentes que se coordenam **através destes docs**:

- `bodybuilding-coach` — método, biomecânica, catálogo, periodização, que dados capturar.
- `mobile-ui-ux-designer` — fluxos e telas dos dois produtos, paleta, momentos de recompensa.
- `mobile-dev-expert` — arquitetura, performance/escala, modelo de dados, web compartilhado.
- `fitness-market-product-owner` — posicionamento, pricing, priorização, e a decisão final quando há conflito.

Ver `06-platform-spec.md` (PRD + prioridades + roadmap) e `07-data-model-v2.md` (modelo de dados).
