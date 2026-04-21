# IronForge — Definição de MVP (Visão de Coaching)

> Autor: bodybuilding-coach agent · Insumo de produto, não de UI.

## 1. Personas-alvo

**P1 — Lifter Intermediário Sério (foco MVP)**
2-5 anos de treino consistente, treina 4-6×/semana em split (PPL, Upper/Lower, Bro Split), objetivo hipertrofia/recomposição. Já entende RIR/RPE básico, frustrado com planilha Excel ou Notes do iPhone. Quer histórico longitudinal sem fricção.

**P2 — Bodybuilder Avançado / Pré-Competição**
5+ anos, possivelmente enhanced, segue programação de coach externo ou auto-programa por blocos. Precisa de tracking granular de volume por músculo, deload, e progressão de carga sub-1kg. Toleraria mais fricção em troca de profundidade de dados.

> Não é persona MVP: iniciante absoluto, atleta de força pura, generalista de "fitness".

---

## 2. Features MUST-HAVE

### 2.1 Construtor de Plano/Mesociclo
- **O quê:** criar mesociclo (4-8 semanas) com split semanal, exercícios por sessão, ordem fixa.
- **Mecanismo:** estrutura semanal estável é pré-requisito para progressive overload mensurável; sem plano fixo, "progresso" vira ruído.
- **Dados:** nome, duração (semanas), dias/semana, lista ordenada de exercícios por dia com séries-alvo e faixa de reps.

### 2.2 Logger de Sessão (núcleo do app)
- **O quê:** registrar carga × reps × RIR por série, com cronômetro de descanso embutido.
- **Mecanismo:** carga e reps são as duas alavancas de overload; RIR ancora intensidade real (proximidade da falha = driver primário de hipertrofia em faixas 5-30 reps). Descanso ≥2min em compostos preserva volume efetivo.
- **Dados:** carga (kg, incremento 0.5), reps (int), RIR (0-4+), tempo de descanso real, flag "warmup/working".
- **Contrato de entrada KG → REPS → RIR:** a ordem dos campos não é decisão de UX — é decisão metodológica. Carga é a única variável decidida *antes* da série (o lifter olha a anilha e já sabe o valor). Reps é resultado — emerge durante a execução. RIR é auto-avaliação que existe apenas na janela imediata após a última repetição; quanto mais o lifter demora para registrar, maior a contaminação por memória. Inverter essa ordem — por exemplo, colocar RIR antes de reps — destrói a validade do dado. Qualquer refatoração de UX que altere essa sequência deve ser tratada como breaking change na metodologia do app, não como melhoria de fluxo.

### 2.3 Sugestão de Carga/Reps na Próxima Série
- **O quê:** ao abrir um exercício, mostrar a última performance e sugerir target (double progression).
- **Mecanismo:** double progression (subir reps dentro da faixa antes de subir carga) é o método de overload mais robusto para hipertrofia; remove decisão cognitiva mid-set, aumenta adesão.
- **Dados:** último log do exercício, faixa de reps-alvo, regra de incremento (ex.: bateu topo da faixa em todas as séries com RIR ≥1 → +2.5kg upper / +5kg lower).

### 2.4 Biblioteca de Exercícios com Substituição
- **O quê:** catálogo com músculo primário/secundário, equipamento, padrão de movimento; permitir swap mantendo histórico do "slot".
- **Mecanismo:** equipamento indisponível é a #1 causa de pular sessão; swap inteligente (mesmo padrão/músculo) preserva adesão sem comprometer estímulo.
- **Dados:** nome, músculo primário, músculo(s) secundário(s), equipamento, padrão (push horizontal, hinge, etc.).

### 2.5 Histórico por Exercício (gráfico de carga estimada)
- **O quê:** visualização de 1RM estimado (Epley) ou tonelagem por sessão ao longo do tempo, por exercício.
- **Mecanismo:** progressive overload só existe se for visível; gráfico de e1RM filtra ruído de variação de reps. Dado que dirige decisão: "estagnado 3 semanas → trocar exercício / deload / revisar sono".
- **Dados:** série temporal (data, e1RM, top set, volume).

### 2.6 Volume Semanal por Grupo Muscular (séries efetivas)
- **O quê:** contador de hard sets por músculo na semana, com faixas MV/MEV/MAV/MRV referenciais.
- **Mecanismo:** dose-resposta de hipertrofia é mediada por volume semanal (10-20 séries/músculo/semana para maioria); contar é a única forma de detectar sub/sobre-dosagem.
- **Dados:** soma de working sets por músculo primário (peso 1.0) e secundário (peso 0.5), por semana.

### 2.7 Cronômetro de Descanso Automático
- **O quê:** dispara ao completar série, configurável por exercício.
- **Mecanismo:** descanso adequado mantém performance entre séries → mais volume efetivo. Automático = zero fricção.

### 2.8 Supersets
- **O quê:** agrupar 2 exercícios como superset no Plan (configuração prévia) e ad-hoc durante a sessão (agrupa exercícios já no log ativo).
- **Mecanismo:** superset de antagonistas (bíceps+tríceps, chest+back) ou mesmo grupo em isolamentos é padrão de eficiência de tempo com estímulo preservado — os dois exercícios compartilham o tempo de descanso passivo do músculo oposto. Para P1 em sessões de 60 min cronometradas, superset é a diferença entre cumprir o volume-alvo ou cortar exercício. Não implementar isso é romper o contrato com a persona antes do primeiro treino.
- **Dados:** flag `isSupersetWith: planExerciseId | null` no `PlanExercise` (relação 1:1 opcional). Timer de descanso só dispara após completar o segundo exercício do par, não após o primeiro. UX: dois exercícios com borda compartilhada e label "SUPERSET" no logger.
- **Escopo do MVP:** superset clássico de 2 exercícios. Triset (3 exercícios) é raro e escala depois sem mudança de modelo.

---

## 3. Nice-to-have (v2+)

- **Periodização automática / deload sugerido** — exige modelo de fadiga validado; bro-science se mal feito. Espere dados.
- **Tracking de cardio/passos** — não é core de bodybuilding logging; integrar HealthKit/Health Connect no v2.
- **Fotos de progresso e medidas corporais** — alto valor mas baixa frequência; não bloqueia MVP.
- **Social/feed/compartilhar treino** — distrai da adesão individual.
- **Vídeos de execução** — custo de produção alto; v2 com links externos curados.
- **IA conversacional para ajustar plano** — sem dataset próprio = alucinação cara.
- **Importar/exportar planilha** — útil mas migrável depois.

---

## 4. Anti-escopo (NÃO entra, nunca ou tarde)

- WODs, AMRAPs, EMOMs, Hyrox, "functional".
- Nutrição/macros (app dedicado faz melhor; integrar via API depois).
- Gamificação tipo streaks com badges infantis — bodybuilder sério acha cringe.
- **Programas prontos genéricos sem mesociclo estruturado** ("PPL do influencer X, faça por tempo indeterminado") — comoditiza o app e atrai persona errada. **Exceção aceita:** 8–12 templates ricos com progressão de RIR semana a semana e mesociclo definido (4-8 sem) são aceitáveis como **demonstração do construtor de mesociclo**, não como produto core. O lifter usa o template como ponto de partida, modifica, e entende a profundidade do app. Templates são onboarding disfarçado de feature, não comoditização. A diferença para o anti-escopo acima é estrutural: template sem progressão planejada = lista de exercícios com nome de influencer; template com RIR progressivo por semana = aula implícita de como o mesociclo do IronForge funciona.
- Coach marketplace, chat com PT.
- Tracking de sono/HRV nativo.
- Treino de mobilidade/yoga.

---

## 5. Modelo de Dados Central

**User** — id, email, unit_system (kg/lb), bodyweight (opcional, série temporal).

**Mesocycle (Plan)** — id, user_id, name, weeks, start_date, status (active/archived). *Defesa: bloco temporal é unidade de progressão.*

**PlanDay** — id, mesocycle_id, day_index (1-7), name ("Push A").

**PlanExercise** — id, plan_day_id, exercise_id, order, target_sets, rep_range_min, rep_range_max, rest_seconds, target_rir. *Defesa: rep_range + RIR-alvo = prescrição de intensidade; rest = preserva volume efetivo.*

**Exercise** — id, name, primary_muscle, secondary_muscles[], equipment, movement_pattern, is_unilateral. *Defesa: músculo primário/secundário alimenta contagem de volume; pattern habilita swap.*

**Session** — id, user_id, plan_day_id, started_at, ended_at, bodyweight_at_session, notes, perceived_fatigue (1-10). *Defesa: fadiga percebida é dado barato que dirige deload.*

**SetLog** — id, session_id, plan_exercise_id, set_index, type (warmup/working/backoff/dropset), weight, reps, rir, rest_taken_seconds, completed_at, notes. *Defesa: RIR > RPE para hipertrofia (mais intuitivo, menos ruído); rest_taken real ≠ rest prescrito; notas capturam contexto qualitativo (dor, técnica).*

**ExerciseSwap** — id, session_id, plan_exercise_id, swapped_to_exercise_id, reason. *Defesa: preserva integridade do slot histórico.*

---

## 6. Top 5 Telas Críticas

1. **Sessão Ativa (Logger)** — registrar série atual com carga/reps/RIR e descanso, sem sair da tela.
2. **Exercício em Foco (dentro da sessão)** — última performance, sugestão, todas as séries do dia.
3. **Home / Próximo Treino** — qual sessão hoje, CTA "Iniciar".
4. **Histórico do Exercício** — gráfico de e1RM + tabela de sessões passadas.
5. **Construtor/Editor de Mesociclo** — montar split, exercícios, faixas de reps, supersets e RIR-alvo por semana.

> **Nota sobre ordenação:** a decisão de manter o Construtor em 5º lugar é deliberada mesmo com a inclusão de templates ricos (Mudança C). Templates são onboarding — reduzem a frequência com que o lifter precisa abrir o Construtor do zero, não aumentam. A tela continua crítica porque é onde o lifter modifica o template e entende o app. Não subiu de posição porque aquisição e retenção continuam dependendo das telas 1–4 na ordem atual.

---

## 7. Três Decisões Não-Óbvias

**a) RIR obrigatório, RPE opcional.**
RIR (reps-in-reserve) tem menor erro de medida que RPE em treino de hipertrofia (Helms et al.) e é cognitivamente mais simples mid-set. Forçar RIR garante dado utilizável para autoregulação; RPE vira ruído.

**b) Sem "programas prontos" no MVP.**
Comoditiza o app e atrai persona errada (iniciante caçando programa grátis). Construtor de mesociclo posiciona IronForge como ferramenta de lifter que sabe o que está fazendo — defende preço futuro.

**c) Volume contado por séries efetivas (hard sets), não por tonelagem.**
Tonelagem (kg×reps×sets) infla com cargas pesadas em baixas reps e subestima estímulo de isolation em altas reps. Hard sets ≥RIR 3 é a métrica que correlaciona com hipertrofia na literatura (Schoenfeld). Contagem secundária com peso 0.5 evita inflação por exercícios compostos.

**d) Superset como relação 1:1 opcional no PlanExercise, não entidade separada.**
Uma entidade `Superset` própria (com id, lista de exercises, ordem) parece modelagem limpa, mas vira complexidade de navegação: o logger precisaria resolver "estou em qual exercício do superset?", a tela de edição do plano precisaria de um container aninhável, e a contagem de volume precisaria ignorar a entidade e ir direto nos exercícios filhos. A relação 1:1 (`isSupersetWith: planExerciseId | null`) é suficiente para 95% dos casos reais — superset clássico de 2 exercícios. O par é implícito: exercício A aponta para exercício B; o logger renderiza os dois como grupo, dispara o timer após o segundo, e a contagem de volume continua operando sobre os exercícios individualmente. Triset (3 exercícios) é raro em protocolos de hipertrofia sérios e pode ser escalado depois sem quebrar o modelo — o nó B simplesmente apontaria para um nó C. Decisão conservadora que cobre o caso real sem inflação de modelo de dados.
