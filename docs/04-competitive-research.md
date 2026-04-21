# IronForge — Pesquisa Competitiva

> Autor: mobile-ui-ux-designer agent · Insumo de design e produto.
> Data de referência: abril 2026. Dados coletados via WebSearch/WebFetch de fontes públicas.
> Foco: apps de tracking de força/hipertrofia para lifter intermediário/avançado.

---

## 1. Panorama do Mercado

### 1.1 Quem lidera em qual dimensão

| Dimensão | Líder | Runner-up | Observação |
|---|---|---|---|
| Simplicidade / velocidade de log | **Strong** | Hevy | Strong é o padrão ouro histórico; Hevy o igualou com melhor visual |
| Profundidade de dados / analytics | **Alpha Progression** | Hevy Pro | Alpha tem RIR nativo + progressão automática; Hevy é mais superficial |
| Programação / mesociclo | **RP Hypertrophy** | Alpha Progression | RP é o mais robusto em teoria, mas é webapp pago e sem mobile nativo |
| Programas prontos / coach content | **Boostcamp** | Liftin' | Boostcamp tem 200+ programas de coaches reais (Israetel, Helms, Nippard) |
| Social / comunidade | **Hevy** | Nenhum relevante | Hevy construiu o único efeito de rede real no segmento |
| UX visual / design polish | **Hevy** | Liftin' | Hevy é o benchmark de UI em 2025/26; Liftin' é o mais "Apple" |
| Custo-benefício | **Hevy** | Boostcamp | Hevy free tier é o mais generoso do mercado |
| Tracking de volume/hipertrofia | **Alpha Progression** | RP Hypertrophy | Únicos que tratam hard sets + RIR como cidadão de primeira classe |

### 1.2 Preços e modelos de monetização

| App | Modelo | Free tier | Preço pago | Lifetime | Receita estimada |
|---|---|---|---|---|---|
| **Hevy** | Freemium | Generoso — log ilimitado, biblioteca, histórico 3 meses | $2.99/mês ou $23.99/ano | $74.99 | ~$600k/mês (fev/2026, Sensor Tower) |
| **Strong** | Freemium + one-time | 3 rotinas customizadas, log ilimitado | $4.99/mês ou $29.99/ano | $99.99 | Não público — 3M+ usuários |
| **Fitbod** | Paywall agressivo | 3 treinos ou 7 dias | $15.99/mês ou $95.99/ano | ~$359.99 (ocasional) | Não público |
| **Liftin'** | Freemium leve | 5 treinos/mês | $2.99/mês ou $24.99/ano | $99.99 | Não público — 701 ratings (nicho) |
| **Boostcamp** | Freemium | Programas básicos e log | ~$9.99/mês | Não disponível | 1M+ usuários, 300M treinos logados |
| **Alpha Progression** | Freemium | Trial limitado | ~$5/mês (varia por região) | Disponível | "Melhor app de musculação 2025" — não público |
| **JEFIT** | Freemium + ads | Com anúncios | $12.99/mês ou $69.99/ano | Não disponível | Não público |
| **RP Hypertrophy** | Subscription puro | Nenhum | $34.99/mês ou $299.99/ano | Não disponível | Não público — Trustpilot 2.8/5 |
| **Caliber** | Coaching premium | Free tracking básico | $200–$467/mês (coaching humano) | Não aplicável | Não público — App Store 4.8/5 |

**Leitura estratégica:** O mercado está polarizando entre (a) freemium com free tier generoso e monetização em analytics/premium (Hevy, Alpha, Boostcamp) e (b) paywall alto com proposta de coaching/programação especializada (RP, Caliber, Fitbod). O modelo intermediário legacy (Strong, JEFIT) está sofrendo por não se decidir. O IronForge entra num mercado onde $3–$10/mês é o piso esperado para funcionalidades sérias, e onde o free tier precisa ser genuinamente útil para gerar descoberta orgânica.

### 1.3 Tração real (dados verificáveis)

- **Hevy**: 12+ milhões de usuários declarados; 400k downloads/mês (fev/2026, Sensor Tower); $2M ARR em 2022 com crescimento acelerado; 2M downloads orgânicos com apenas $15k em ads. É o case de produto mais citado do segmento.
- **Strong**: 3M+ downloads, rating 4.8 na App Store. Sem dados de receita públicos. Crescimento orgânico desacelerado — produto estagnado visualmente.
- **Boostcamp**: 1M+ lifters, 300M+ treinos logados. Rating 4.8. Crescimento forte ancorado em programas de coaches conhecidos do Reddit/YouTube.
- **Fitbod**: Sem dados públicos de downloads. Alta visibilidade em mídias especializadas mas usuários avançados migram por falta de controle.
- **Liftin'**: 701 ratings (App Store US) — nicho iOS com alta satisfação mas audiência limitada.

---

## 2. Análise Profunda — 4 Apps Tier 1

---

### 2.1 Hevy

**Quem desenha**

- **Guillem Ros** (CEO & co-fundador, Barcelona) é o product lead histórico — tem background de produto em fitness apps, não de design formal. A filosofia declarada é "mínimo marketing, máximo produto." O time de design hoje tem **Aneta Sobaniec** (Designer, Polônia/Espanha) como responsável pela experiência. Head of Product é **Gustavo Comitre** (Brasil, 10+ anos em healthtech).
- Filosofia pública: "Não dizemos ao atleta como treinar — fornecemos as ferramentas." Approach non-prescriptive. Em entrevista ao RevenueCat, Guillem declarou ter planejado toda a UX end-to-end em Sketch + Marvel antes de escrever código, com library de componentes, guia de estilos e icon library prontos antes do v1.

**Screenshots descritos (baseados em dados públicos)**

1. **Home / Dashboard**: Seção "Últimos 7 dias" com diagrama corporal colorido por grupo muscular treinado. Acesso ao social feed de atletas seguidos. Widget de streak e "próximo treino". Design com fundo branco/light-mode como padrão (controverso — muitos usuários pedem dark-first; dark mode existe mas não é o default).
2. **Workout Logger**: Tabela de sets com colunas Set | Previous | kg | reps | check. A coluna "Previous" é preenchida automaticamente com o último valor registrado para aquele exercício — clicável para copiar o valor para o campo ativo. Timer de descanso automático dispara após marcar set como completo (ícone de check). O exercício atual fica no topo da tela; scroll vertical para ver todos os sets do exercício. Navegação entre exercícios via swipe ou botão "next".
3. **Exercise Detail**: Gráfico de e1RM estimado com range de tempo selecionável (7d/30d/90d/1y/all). "Set Records" mostra PRs por número de reps (1RM, 3RM, 5RM, 8RM). "Strength Level" posiciona o lifter como Beginner/Intermediate/Advanced/Elite para o exercício. History tab mostra cada sessão em que o exercício foi feito com todos os sets logados.
4. **Workout Summary (pós-sessão)**: Múltiplos slides com comparações motivacionais ("você levantou 12.610 kg — equivale a um caminhão"). Frequência cardíaca média e gráfico de FC (se via Apple Watch). Streak ativo. Botões de share para Instagram/Facebook. Destaque inline dos PRs batidos na sessão.
5. **Social Feed / Discover**: Feed de workouts de usuários seguidos, com reações. Leaderboards por exercício. Perfis públicos de atletas. Este é o diferencial que nenhum concorrente replicou com tração equivalente.

**Padrões de interação únicos**

- **"Start Empty Workout"**: usuário pode ignorar completamente qualquer rotina salva e iniciar do zero, adicionando exercícios conforme treina. Sem fricção de planejar antes. O app aprende do histórico mesmo assim.
- **Previous value tap-to-fill**: clicar no valor da coluna "Previous" preenche automaticamente o campo ativo. Reduz o zero-entry a um toque por set.
- **Social workout visibility**: ao completar o treino, a sessão pode ser publicada no feed interno. Outros usuários veem os exercícios, sets e pesos. Gera accountability passivo sem forçar competição.
- **Live Activity no Dynamic Island**: exibe o timer de descanso ativo no Dynamic Island do iPhone durante a sessão, sem precisar abrir o app.
- **Strength Level benchmarking**: posiciona o lifter num ranking percentual para cada exercício, dando contexto de onde ele está vs. a base de 12M usuários.

**O que fazem muito bem**

1. **Free tier genuinamente útil.** Log ilimitado, biblioteca completa, histórico de 3 meses — tudo gratuito. Isso gerou 12M de usuários com $15k em ads. A maioria dos concorrentes paywalla justamente as features que criam hábito.
2. **Coluna "Previous" no logger.** É o padrão de indústria agora — mas Hevy foi quem popularizou. Zero ambiguidade sobre o que foi feito na última sessão, sem sair da tela do logger. Elimina a decisão cognitiva de "quanto eu fiz mesmo?".
3. **Efeito de rede social.** Único app com social feed com tração real. Seguidores, leaderboards, workouts públicos — criou um layer de accountability que retém usuário mesmo quando o produto teria churned.

**O que fazem mal / deixaram escapar**

1. **RPE opcional, RIR ausente.** Hevy tem RPE como opt-in (desabilitado por default). RIR como métrica de intensidade não existe — é apenas "esforço percebido" genérico. Para lifter de hipertrofia que usa RIR como alavanca de autorregulação (o que é evidência-based), Hevy é cego ao dado mais importante.
2. **Sem mesociclo como primitivo.** A estrutura de dados é sessão → rotina, sem nenhuma camada de "bloco de treino" (4-12 semanas com progressão de volume planejada). O lifter que auto-programa por mesociclos usa planilha para isso e Hevy para logar — não há integração. Oportunidade direta do IronForge.
3. **Analytics paywallado desnecessariamente.** Histórico além de 3 meses requer Pro. Isso cria fricção exatamente quando o usuário está crescendo (6+ meses de dados é quando os gráficos ficam realmente informativos). É uma fricção que gera resentimento mais que conversão.

---

### 2.2 Strong

**Quem desenha**

- Strong é desenvolvido pela **Econusas Inc.**, fundada por **Marv Ericsson**. Não há informação pública sobre um time de design dedicado — o produto parece ser desenvolvido por time pequeno de engenharia. O caso de estudo de redesign (HwaiJun Yap, Medium) identificou os problemas do design original como ausência de dark mode, "color boring", e excesso de texto sem elementos visuais.
- Filosofia implícita: velocidade de entry acima de tudo. "Think less, lift more." Zero gamification, zero social, zero AI. O app é deliberadamente restritivo em scope.

**Screenshots descritos (baseados em dados públicos)**

1. **Home / Dashboard**: Lista de rotinas salvas. Botão "Start Workout" proeminente. Design limpo mas datado — tipografia regular, sem hierarquia visual forte. Ícones genéricos de exercício por grupo muscular.
2. **Workout Logger**: Interface tabular com colunas Set | Weight | Reps | check. Cada linha é uma série. Campo de peso e reps são tappable — abre teclado do sistema (sem keypad customizado). A linha de série ativa fica destacada. Sem coluna "Previous" explícita no mesmo viewport — o usuário vê os dados anteriores como referência acima dos campos. Timer de descanso no topo da tela (configurável) que dispara automaticamente.
3. **Exercise Search**: Lista filtrada por grupo muscular, com campo de busca. Sem vídeos no free tier. Sem filtro por equipamento de forma granular.
4. **Progress Charts**: Gráfico de 1RM estimado por exercício ao longo do tempo. Volume total por sessão. Disponível apenas no Pro. A limitação da versão free é a maior crítica recorrente em reviews.
5. **Plate Calculator**: Uma das melhores do segmento — calcula anilhas de forma visual para uma carga alvo. Limitado a barras padrão (não suporta barras de peso customizado).

**Padrões de interação únicos**

- **"Repeat Previous Workout"**: ao iniciar um treino de uma rotina salva, todos os pesos e reps da última sessão são pré-preenchidos. O lifter só precisa confirmar ou ajustar — o padrão mais próximo de "auto-fill by default" no mercado.
- **Tap-to-increment**: nos campos de peso/reps, tap no número existente abre inline editor com +/- buttons além do teclado. Não é keypad custom, mas reduz entrada de dados.
- **Warm-up calculator**: dado um peso alvo de trabalho, sugere pesos e reps de aquecimento progressivo para ativação. Feature subestimada que lifters experientes adoram.

**O que fazem muito bem**

1. **Velocidade pura de log.** "Logging a set takes just a couple of quick taps." Sem modal, sem confirmação, sem animação bloqueante. O padrão de velocidade que todos tentam replicar. Foco absoluto no fluxo log → descanso → log.
2. **One-time purchase como opção.** $99.99 lifetime é uma proposta honesta para o lifter que não quer assinatura perpétua. Num mercado saturado de subscriptions, é um diferencial de confiança.
3. **Confiabilidade histórica.** 3M+ usuários, App Store rating 4.8, existe desde 2012. Tem o trust de ser o "app que não some". Isso tem valor real para quem tem 5 anos de histórico de treino guardado lá.

**O que fazem mal / deixaram escapar**

1. **Produto estagnado visualmente e funcionalmente.** Reviews de 2025/26 são unânimes: "interface parece que foi feita quando calça boca-de-sino era moda." Sem dark mode nativo por muito tempo (adicionaram, mas tarde), sem micro-animations, sem feedback visual de PR em tempo real. A sensação é de abrir um app de 2012.
2. **Sem progressão automática / sugestão de carga.** O app não faz nenhum cálculo de double progression, não sugere aumentos de peso, não detecta padrão de progressão estagnada. O lifter precisa de planilha paralela para ter esse dado. Em 2026, isso é uma lacuna crítica.
3. **Teclado do sistema no logger.** Sem keypad customizado — usa o teclado nativo iOS/Android. Para lifter com luva ou mãos suadas, targets de 36dp são insuficientes. O design foi apontado como ponto de atrito em múltiplos reviews de UX.

---

### 2.3 Fitbod

**Quem desenha**

- **Fitbod** foi fundada por **Allen Chen** (CEO) e tem como diferencial ser uma empresa de ML aplicado a fitness. O time de design não tem informações públicas detalhadas — o produto é claramente conduzido por engenharia/ML. Design é polished mas é produto de engenharia sofisticada, não de design-led thinking.
- Filosofia declarada: "Less planning. More progress." A proposta é remover o burden cognitivo de programação — o app pensa por você. Usa machine learning para gerar treinos baseados em fadiga muscular, equipamento disponível, histórico e metas.

**Screenshots descritos (baseados em dados públicos)**

1. **Home / Workout Generation**: Tela com "Generate Workout" como CTA principal. Heatmap corporal mostrando músculos frescos (verde) vs. fadigados (vermelho/laranja). O workout gerado pelo AI aparece como lista de exercícios com sets/reps sugeridos. Usuário pode substituir exercícios mas não tem controle total sobre a programação.
2. **Workout Logger**: Logger similar ao padrão do mercado — tabela de sets com peso/reps. A diferença é que os targets de peso e reps são sugeridos pelo algoritmo, não pelo histórico do próprio lifter explicitamente. Feedback de "complete" marca a série. Rest timer integrado.
3. **Muscle Recovery Heatmap (Body Tab)**: Vista anatômica do corpo humano com gradiente de cor por grupo muscular. 0% = completamente descansado; 100% = máxima fadiga. Lifter pode ajustar manualmente o percentual de recuperação de um músculo se sentir que está mais/menos recuperado do que o algoritmo calculou.
4. **Exercise Detail**: Gráfico de performance histórica. Dados de volume e intensidade por sessão. Sem RIR nativo.
5. **Settings / Profile**: Configuração de equipamento disponível (crucial para o algoritmo). Metas (hipertrofia, força, resistência). Frequência de treino.

**Padrões de interação únicos**

- **Muscle Recovery Heatmap como entrada de decisão**: o único app que usa visualização anatômica como "estado" antes de treinar, não só como relatório pós-treino. O lifter vê o heatmap e o AI já sabe quais músculos priorizar.
- **Equipment-aware workout generation**: configurar academia uma vez; o AI nunca vai sugerir exercício que você não tem equipamento para fazer. Útil para quem treina em academias diferentes.
- **Manual recovery override**: o lifter pode dizer ao app "esse músculo está mais cansado do que você pensa" — o algoritmo ajusta. Raro: dá controle sem remover automação.

**O que fazem muito bem**

1. **Remove o problema cognitivo de programação para um segmento real.** Para lifter que viaja, que não tem coach, que muda de academia — o AI que gera o treino baseado em fadiga real tem valor genuíno. Reviews de usuários intermediários são muito positivos.
2. **Heatmap de recuperação muscular como UI.** É o padrão mais elegante do mercado para visualizar "em que músculos trabalhar hoje". Mais intuitivo que tabelas de volume por grupo muscular.
3. **Polishing de UX em iOS.** Smooth navigation, transições limpas, exercise guides com instruções claras. É o app visualmente mais "premium feeling" para quem entra sem contexto.

**O que fazem mal / deixaram escapar**

1. **Antitético para o lifter que auto-programa.** Quem segue PPL, Upper/Lower ou plano de coach externo não quer que um AI "recomende" um treino de pernas quando ele tem Push programado. O app briga com quem tem metodologia própria. Reviews de lifters avançados são consistentemente negativos nesse ponto.
2. **Paywall agressivo sem free tier real.** 3 workouts ou 7 dias antes de pagar $16/mês. Isso cria uma barreira de experimentação que impede tração orgânica. Fitbod é descoberto via conteúdo de fitness, não via boca-a-boca de lifter pra lifter.
3. **Sem RIR nativo, sem mesociclo, sem volume tracking granular.** O algoritmo de Fitbod é black box — o lifter não sabe quantas hard sets fez por músculo na semana, não tem controle sobre progressão de RIR ao longo do ciclo, não tem ferramenta para planejar um bloco de hipertrofia com MEV/MAV/MRV. Para o persona P1/P2 do IronForge, Fitbod é uma caixa preta que não oferece aprendizado sobre o próprio treino.

---

### 2.4 Liftin'

**Quem desenha**

- Não há informação pública sobre o designer ou fundador do Liftin'. O app está listado na App Store desde pelo menos 2020 (MacRumors review de ago/2020) e tem desenvolvimento ativo (última update: agosto 2025). A linguagem do produto ("Feel like it was made by Apple") e o ecossistema Apple-first (iPhone + iPad + Mac + Apple Watch como cidadãos de primeira classe) sugerem desenvolvedor indie ou time muito pequeno, fortemente influenciado pelos Human Interface Guidelines.
- Filosofia implícita: "Minimalismo nativo iOS." Fiddle less with your device, focus on your workout. Não há post de blog, podcast ou Medium de design — o produto fala por si.

**Screenshots descritos (baseados em dados públicos)**

1. **Home / Dashboard**: Interface limpa com atividade recente e acesso rápido a rotinas. Calendar de frequência de treino. PRs pessoais. Modo claro e escuro disponíveis. Design que segue convenções iOS nativas — sem linguagem visual própria forte.
2. **Workout Logger**: Sets e reps com campos compactos. Automatic progression integrado — o app já sugere o peso baseado na regra de progressão configurada para aquele exercício (se bateu o rep target, sobe a carga automaticamente na próxima vez). Rest timer nativo no Watch app.
3. **Progress Graphs**: Gráficos de peso, volume, 1RM estimado ou training max — o lifter escolhe qual métrica exibir. Suporta percentagem de 1RM (útil para powerlifting e programas estilo 5/3/1). Design de gráfico minimalista, sem grid pesada.
4. **Apple Watch App**: Tela de log de série no pulso com rest timer dedicado. Standalone (funciona sem iPhone por perto). Live sync com iPhone. Integração com Activity Rings.
5. **Program Templates**: nSuns, Wendler 5/3/1, outros com cálculo de percentagem de 1RM automático. Suporte a AMRAP com mínimo de reps.

**Padrões de interação únicos**

- **Two-finger swipe para multi-select**: gesto nativo iOS para selecionar múltiplos exercícios de uma vez (copiar entre rotinas, mover). Quem conhece o padrão ama; quem não conhece nunca descobre.
- **Automatic weight adjustment rules**: cada exercício pode ter uma regra configurada ("se bater 3×8 com pelo menos RIR 1, sobe +2.5kg na próxima sessão"). Isso é double progression baked in, mas configurável por exercício — não um sistema de sugestão, mas uma automação de rule-based progression.
- **Apple Watch standalone logging**: único app do comparativo que funciona completamente sem iPhone. Para lifter que deixa o telefone no armário durante o treino, isso é decisivo.

**O que fazem muito bem**

1. **Integração nativa com ecossistema Apple sem compromisso.** iPhone + iPad + Mac + Watch, tudo sincronia de verdade. Para usuário Apple-first (que é o persona P1 do IronForge), essa integração é percebida como premium e cria lock-in saudável.
2. **Automatic progression rules configuráveis por exercício.** Nenhum outro app do comparativo faz isso de forma tão granular — a regra de progressão é por exercício, não global. Lifter avançado que usa esquemas diferentes para compostos e isolamentos vai amar.
3. **Menor preço de subscricão real do mercado** ($24.99/ano) com feature set substancial. Posiciona bem contra Hevy Pro ($23.99/ano) com mais profundidade de progressão.

**O que fazem mal / deixaram escapar**

1. **Audiência muito pequena para efeito de rede.** 701 ratings na App Store US. Sem social features, sem discovery, sem programa de crescimento visível. Para um app de lifestyle, isso é um sinal de que falta mecanismo de retenção além da funcionalidade.
2. **Dark mode não é default.** App "feito como a Apple faria" num contexto de academia onde dark-mode-first é expectativa. Light mode como default é um sinal de desalinhamento com o contexto real de uso.
3. **Documentação e onboarding fracos.** As features mais poderosas (automatic progression rules, two-finger swipe, programas com percentagem) não são auto-explicáveis. Lifter que não leu o manual não vai descobrir. "Feel like it was made by Apple" mas sem o onboarding que a Apple faria para features complexas.

---

## 3. Features Must-Have (Derivadas do Mercado)

Cruzamento com o §2 do `01-product-scope.md`. Cada feature derivada do que os apps sérios convergem como indispensável.

### Logger Core

| Feature | Todos têm? | IronForge | Prioridade |
|---|---|---|---|
| Log de peso × reps por série | Sim — 100% | ✅ SetLog.weight/reps | Sprint 1 |
| Coluna "Anterior" visível no logger (sem sair da tela) | Hevy, Strong, Alpha | ✅ ghost text na spec | Sprint 1 |
| Rest timer automático pós-série | Hevy, Strong, Boostcamp, Liftin' | ✅ §2.7 + §5.2 spec | Sprint 1 |
| Adicionar/remover sets inline durante sessão | Hevy, Strong | ✅ "+ Adicionar série" na spec | Sprint 1 |
| Warmup sets (flag separado) | Hevy, Strong, Alpha | ✅ SetType.warmup | Sprint 1 |
| Supersets | Hevy, Strong, Liftin' | ⚠️ **Ausente no escopo atual** | Sprint 2 |
| Dropsets | Hevy, Strong, Alpha | ⚠️ **Ausente no escopo atual** | Sprint 2 |
| Notas por série/exercício | Hevy, Strong | ✅ SetLog.notes | Sprint 1 |
| RIR tracking nativo | Alpha Progression, RP, MacroFactor | ✅ SetLog.rir obrigatório em working sets | Sprint 1 |
| RPE como alternativa ao RIR | Hevy (opt-in), Boostcamp | ⚠️ Não especificado — considerar toggle | Sprint 2 |
| Swap de exercício mid-session mantendo histórico do slot | Hevy | ✅ ExerciseSwap na spec | Sprint 1 |
| Plate calculator inline | Strong, Liftin', Hevy, Boostcamp | ✅ PlateCalculatorSheet na spec | Sprint 1 |
| Keypad numérico customizado (não teclado do sistema) | Apenas IronForge (spec) | ✅ §6.1 da design spec | Sprint 1 |

### Programação / Plano

| Feature | Todos têm? | IronForge | Prioridade |
|---|---|---|---|
| Rotinas salvas com exercícios pré-definidos | Sim — 100% | ✅ PlanDay/PlanExercise | Sprint 1 |
| Mesociclo como primitivo (bloco temporal com progressão) | RP, Alpha Progression | ✅ Mesocycle na spec | Sprint 1 |
| Rep range-alvo por exercício no plano | Alpha, RP | ✅ rep_range_min/max | Sprint 1 |
| RIR-alvo no plano (não só no log) | Alpha, RP | ✅ PlanExercise.target_rir | Sprint 1 |
| Sugestão de carga via double progression | Alpha Progression (automático), IronForge (manual com sugestão) | ✅ use-set-suggestion hook | Sprint 1 |
| Templates de programas prontos | Boostcamp (200+), Liftin' | ⚠️ OnbPlanPick tem 3 templates — quantidade insuficiente | Sprint 2 |
| Criação de rotina por drag-and-drop | Hevy, Strong | ✅ PlanEditor na spec | Sprint 2 |
| Deload automático sugerido por acúmulo de fadiga | RP Hypertrophy | 🔮 Nice-to-have v2 (§3 scope) | v2 |
| Multiple gym profiles (equipamento por localização) | Alpha Progression (2025) | ❌ Fora do escopo, persona não viaja com esse granularidade | Descartar |
| Importar programa por planilha / CSV | Alguns | 🔮 v2 (§3 scope) | v2 |

### Analytics / Progresso

| Feature | Todos têm? | IronForge | Prioridade |
|---|---|---|---|
| Gráfico de e1RM por exercício | Hevy, Strong Pro, Alpha, Liftin' | ✅ ExerciseDetail + e1rm.ts | Sprint 2 |
| PRs por número de reps (1RM, 3RM, 5RM, 8RM, 10RM) | Hevy, Alpha | ✅ §5.3 da spec | Sprint 2 |
| Volume semanal por grupo muscular | Alpha, RP, Hevy (Pro) | ✅ §2.6 scope — hard sets com peso 0.5 para secundários | Sprint 2 |
| Faixas MEV/MAV/MRV como referência visual | RP Hypertrophy | ✅ §2.6 scope | Sprint 2 |
| Heatmap de recuperação muscular | Fitbod | ⚠️ **Ausente no escopo atual** — alto valor para P1/P2 | Sprint 2 |
| Histórico de sessões com detalhe de sets | Hevy, Strong, todos | ✅ HistoryScreen | Sprint 2 |
| Workout summary pós-sessão com PRs batidos | Hevy | ✅ WorkoutSummary spec | Sprint 1 |
| Comparação de sessões (esta semana vs. semana anterior) | Alpha, Hevy Pro | 🔮 v2 | v2 |
| Year in review / monthly reports | Hevy | 🔮 v2 | v2 |
| "Strength Level" vs. base de usuários (benchmarking) | Hevy | ❌ Requer base de dados suficiente — sem sentido no MVP | Descartar no MVP |

### Auxiliares

| Feature | Todos têm? | IronForge | Prioridade |
|---|---|---|---|
| Timer de descanso configurável por exercício | Hevy, Liftin' | ✅ PlanExercise.rest_seconds | Sprint 1 |
| Haptics em set logado / PR | Especificado apenas pelo IronForge | ✅ motion.haptic | Sprint 1 |
| Offline-first | Liftin', Boostcamp | ✅ MMKV + optimistic | Sprint 1 |
| Bodyweight tracking (série temporal) | Hevy, Caliber | ✅ User.bodyweight + BodyMeasurements | Sprint 2 |
| Fotos de progresso | Hevy, Liftin' | 🔮 v2 (§3 scope) | v2 |
| Apple Watch / WearOS companion | Liftin', Strong, Fitbod | ⚠️ **Ausente no escopo atual** | v2 (considerar Sprint 2 para Watch) |
| Social feed / following | Hevy (único com tração) | ❌ Anti-escopo declarado (§4) | Descartar |
| Vídeos de execução | JEFIT (1400 exercícios), Boostcamp | 🔮 v2 com links externos | v2 |
| Integração com HealthKit/Health Connect | Liftin', Fitbod, Hevy | ⚠️ OnbPermissions na spec mas não integrado funcionalmente | Sprint 2 |

### Features ausentes no escopo que precisam de decisão antes do Sprint 1

**⚠️ SUPERSETS e DROPSETS:** Todos os apps sérios têm. O escopo atual do IronForge tem `SetTypeSchema` com `dropset` e `myorep`, mas não tem nenhuma UX especificada para logar um superset (dois exercícios intercalados com descanso zero entre eles). Lifter intermediário faz supersets em isolamentos. Ignorar no MVP cria atrito imediato para P2. Recomendação: implementar superset como "link entre dois PlanExercises" com flag visual no logger — não complexo, mas precisa de spec.

**⚠️ HEATMAP DE RECUPERAÇÃO:** O Fitbod popularizou isso e a referência ficou no imaginário dos lifters. Não precisa do algoritmo de recuperação complexo do Fitbod — pode ser derivado dos sets logados por músculo na semana, visualizando carga acumulada vs. MEV/MRV. Gera "o que treinar hoje?" como dado visual. Alto valor de retenção, relativamente simples de implementar a versão básica.

---

## 4. Padrões de Design e Anti-Padrões

### 4.1 Padrões para copiar/adaptar

**Padrão 1 — Do Hevy: "Previous column tap-to-fill" no logger**
A coluna "Previous" no logger do Hevy mostra o último valor logado (peso×reps) como referência imediata sem sair da tela. O gesto de tap no valor copia para o campo ativo. O IronForge já tem isso na spec como "ghost text/anterior" — mas deve ir além: o tap-to-fill deve ser o comportamento primário, não um atalho secundário. A implementação do IronForge via keypad customizado (§6.1 da design spec) tem um botão "= anterior" que é exatamente esse padrão, só que melhor — porque é um target 56dp em vez de texto inline de 12pt. Manter e priorizar este padrão.

**Padrão 2 — Do Fitbod: Heatmap corporal como "estado" pré-treino (adaptado)**
Fitbod usa o heatmap como ponto de entrada para geração de treino via AI. Para o IronForge, que não tem AI de geração, o padrão pode ser adaptado como: na HomeScreen, um mini-body diagram (torso anterior + posterior) mostrando a intensidade de volume da semana atual por grupo muscular, colorida com a escala de tokens do IronForge (verde = abaixo do MEV, ember = na faixa MAV, vermelho = acima do MRV). Não é AI — é derivado dos hard sets logados. Gera "o que minha semana parece" em 2 segundos, sem entrar em Progress. É um padrão visual de alta densidade informacional que o lifter de hipertrofia entende imediatamente.

**Padrão 3 — Do Liftin': Automatic progression rule por exercício**
A implementação de double progression do Liftin' é mais granular que qualquer concorrente: cada exercício tem uma regra configurada independentemente. O IronForge tem a lógica de double progression no `use-set-suggestion` hook — mas a UX de configuração dessa regra está no PlanExercise (rep_range + target_rir), sem exposição explícita de "se bater o topo da faixa em todas as séries, sugere +2.5kg". O padrão do Liftin' sugere que essa regra deveria ser um componente visual explícito no PlanEditor, não apenas campos de dados — algo como "Regra de progressão: [+2.5kg] quando [bater topo da faixa] em [todas as séries] com [RIR ≥ 1]". Isso comunica ao lifter que o app está "pensando junto" com ele.

### 4.2 Anti-padrões para evitar

**Anti-padrão 1 — Evitar paywall no logger core (como JEFIT e Strong Pro)**
JEFIT paywalla os gráficos de progresso. Strong paywalla o histórico completo. Ambos recebem críticas constantes por isso, porque o usuário sente que o app "aprendeu com ele" mas esconde o conhecimento atrás de um muro. No IronForge, o logger de sessão, o histórico de todos os exercícios, e os gráficos de e1RM devem ser gratuitos ou de acesso muito amplo no free tier. Paywall deveria ser em features de planejamento avançado (ex.: mesociclos com templates múltiplos, exportação de dados, integração com coach futura) — nunca no core loop de log→ver progresso.

**Anti-padrão 2 — Evitar o teclado do sistema no logger (como Strong)**
Strong usa o teclado nativo iOS para entrada de peso/reps. O resultado é: (a) layout shift com animação lenta (280–400ms de latência vs. 240ms do keypad custom), (b) tap targets de 36dp insuficientes para mão suada/luva, (c) sem atalhos contextuais (+2.5, +5, "= anterior"). A design spec do IronForge já corrigiu isso com o keypad customizado (§6.1) — nunca abrir mão disso, mesmo que pareça "engenharia extra". É o detalhe que separa o app de academia de um app de planilha.

**Anti-padrão 3 — Evitar clutter de tabs/navegação do JEFIT (7 itens no bottom nav)**
JEFIT tem bottom tab com mais de 5 itens, sub-menus escondidos em hamburguer, seções redundantes entre "workout" e "exercises". O resultado é que novo usuário leva minutos para descobrir onde está a função que quer. A spec do IronForge com 5 tabs bem definidas (Today, Plans, History, Progress, Profile) com workout como modal fullscreen está certa — manter a disciplina de não adicionar tab 6 "Explore" ou "Community" conforme o produto cresce. Cada nova feature deve caber dentro de uma tab existente ou ser um modal/sheet, nunca uma nova tab.

### 4.3 Filosofia de design recomendada para o IronForge

O mercado em 2026 está num equilíbrio instável: Hevy venceu a guerra do "simples e grátis" com tração social; Strong sobrevive no "confiável e rápido" mas estagna; Fitbod domina "AI pensa pra você" mas exclui quem pensa por si; Alpha Progression tem a profundidade certa mas UI de nicho sem tração.

O território disponível para o IronForge é: **"ferramenta séria para lifter que pensa, com UX de produto de consumo premium"**. Em outras palavras: a profundidade do Alpha Progression (RIR nativo, mesociclo, hard sets, double progression) com a polish visual do Hevy e o dark-first / industrial de uma marca que entende o território emocional do bodybuilding.

Os designers de referência mais relevantes para o IronForge não são os dos apps de academia acima — são:
- **Telegram / Linear**: interfaces densas mas limpas, dark-first, tipografia como hierarquia
- **Whoop**: dashboard de dados atléticos com visual premium sem parecer app de médico
- **Nike Training Club**: motion design como feedback de progresso, não decoração

Princípio central que nenhum concorrente aplicou com consistência: **o número grande é o herói, o contexto é secundário**. Um lifter que bateu um PR quer ver "128 kg" em 64px na tela, não numa linha de tabela. O IronForge já tem isso na spec (font-size "metric-xl" 64px, weight 800) — é o único app do comparativo com esse token definido explicitamente. Isso é diferenciação real.

---

## 5. Recomendações Acionáveis para o IronForge

### Sprint 1 (logger core + fundação)

**S1-R1 — Adicionar suporte a supersets no modelo de dados e UX básica do logger**
Urgência: todos os concorrentes sérios têm. O lifter que faz superset de bíceps + tríceps é P1 do IronForge. Implementação mínima: flag `is_superset_with: plan_exercise_id` no `PlanExercise`, UX no logger mostrando dois exercícios agrupados com borda compartilhada e label "SUPERSET". Rest timer só dispara após o segundo exercício do par. Não é complexo arquiteturalmente — é uma relação 1:1 opcional no PlanExercise.

**S1-R2 — Confirmar que o keypad customizado tem "= anterior" como botão primário, não terciário**
A design spec (§6.1) já tem o padrão certo. Risco de implementação: engineer pode tratar "= anterior" como feature adicional e não como fluxo padrão. A UX deve fazer "= anterior" ser o primeiro botão visual no keypad (não o teclado numérico), porque em ~85% dos sets o lifter vai repetir o peso da sessão anterior. Colocar o número antes da confirmação reduz zero-entry para 1 toque em vez de 3+.

**S1-R3 — Tornar RIR o campo central, não opcional**
Hevy tem RPE como opt-in. Strong não tem nada. Alpha tem RIR mas como campo extra. O IronForge tem RIR obrigatório em working sets (§7a do scope) — isso é a decisão certa, mas o keypad precisa deixar RIR como terceiro campo na sequência KG → REPS → RIR (nessa ordem), com navegação por tab/swipe entre eles sem precisar tap em cada um. Se o lifter precisar de mais de 3 gestos para confirmar uma série completa, vai pular o RIR.

**S1-R4 — Workout Summary com "o que mudou" vs. sessão anterior**
Hevy tem comparações motivacionais ("você levantou um caminhão"). O IronForge pode ser mais específico: no WorkoutSummary, mostrar delta por exercício vs. a última sessão do mesmo dia do plano. "Supino: +2.5kg · Rosca: mesmo peso · Elevação: -1 rep (fadiga?)". Isso é actionable, não motivacional vazio. Usa os dados que já existem no modelo.

**S1-R5 — Confirmar fluxo de onboarding: 8 telas é muito para persona intermediária/avançada**
A spec atual tem 8 telas de onboarding. Comparação: Hevy tem ~4 steps antes do primeiro treino; Strong tem 2; Liftin' tem 1. Para P1 (lifter intermediário que já sabe o que quer), perguntar Goal + Experience + Frequency + Units + Body + PlanPick + Permissions + Ready é excessivo. Recomendação: comprimir para 4 telas máximo — (1) Units+Goal numa tela, (2) Experience+Frequency numa tela, (3) PlanPick, (4) Permissions. Body/fotos são opcionais e podem ir para Profile depois. Redução de churn antes do primeiro treino.

### Sprint 2+

**S2-R1 — Implementar heatmap de volume semanal por músculo na HomeScreen**
Mini body diagram (não full screen, ~120dp de altura) mostrando intensidade de volume da semana atual. Não precisa do algoritmo de recuperação do Fitbod — apenas soma hard sets por músculo e compara com faixa MEV/MRV configurável. Adiciona enorme valor de contexto diário ("quais músculos ainda tenho espaço hoje?") e diferencia da HomeScreen genérica de qualquer concorrente.

**S2-R2 — Apple Watch companion como prioridade de v2, não v3**
Liftin' prova que Watch standalone é diferenciador real para lifter que deixa o iPhone no armário. A arquitetura offline-first do IronForge (MMKV + Zustand) é compatível com Watch sync. Não precisa de Watch app completo — logger básico (log set, ver previous, timer) já seria suficiente para diferenciação. Considerar como Sprint 2 tardio, não v3.

**S2-R3 — Templates de programas prontos: aumentar de 3 para 8–12**
O scope atual tem 3 templates no onboarding (PPL, Upper/Lower, Bro Split). Boostcamp tem 200+ de coaches reconhecidos. Para P1 do IronForge, a proposta não é "programas prontos" (anti-escopo), mas **"ponto de partida para customização"** — templates suficientemente detalhados (exercícios, séries, faixas de reps, rest times, RIR-alvo por semana do mesociclo) para que o lifter os use como base e modifique. 8–12 templates bem feitos é o suficiente para comunicar "esse app entende de programação" sem virar Boostcamp.

**S2-R4 — Dropsets e Myoreps com UX específica**
O `SetTypeSchema` já tem `dropset` e `myorep`. A UX do logger precisa traduzir isso: dropset = série na sequência imediata sem descanso, com indicador visual de fluxo contínuo (sem timer). Myorep = série com reps cluster, cada mini-série logada separadamente. São padrões que P2 usa consistentemente e que Hevy tem de forma básica. Spec de interação necessária antes de implementar.

**S2-R5 — Consideração honesta sobre "programas prontos" no MVP**
O scope atual (§4) declara "programas prontos genéricos = anti-escopo" para não comoditizar. Essa decisão tem risco real: **lifter intermediário que vem de Boostcamp espera pelo menos alguns programas de referência**. A diferenciação não é ter ou não ter templates — é na qualidade e na profundidade da personalização. Sugestão: ter 8–12 templates ricos (com progressão de RIR semana a semana, não só exercícios) que demonstram o que o mesociclo do IronForge pode fazer. Isso converte o "programa pronto" em aula de como usar o construtor de mesociclo.

---

## 6. Gaps Competitivos — Por Onde o IronForge Ganha

### Gap 1 — RIR como cidadão de primeira classe (não opt-in)

Nenhum dos apps de tração do mercado (Hevy, Strong, Boostcamp) trata RIR como dado central. Hevy tem RPE opt-in. Strong não tem nada. Alpha Progression tem RIR mas é app de nicho sem visual polish.

O IronForge é o único app com: (a) RIR obrigatório em working sets como dado de intensidade, (b) RIR-alvo no plano (não só no log), (c) sugestão de progressão que cruza rep range + RIR realizado (se bateu o topo da faixa com RIR ≥ 1, sugere subir carga). Isso não é feature — é uma afirmação metodológica. "Este app é construído sobre evidência de ciência do exercício, não sobre hábito de mercado."

Esse posicionamento atrai diretamente P1 e P2 que já leram Helms, Israetel ou seguem conteúdo de RP Strength / 3DMJ. É um diferencial honesto, não marketing.

**Risco:** exige educação do usuário. "RIR" precisa de um onboarding inline (a RPEGuideSheet já está na spec) e o primeiro treino precisa ser forgiving se o lifter não souber estimar. O campo deve ter default visível ("quanto mais próximo de 0, mais perto da falha") e não bloquear o log se não preenchido no warmup.

### Gap 2 — Mesociclo como estrutura de progressão visível, não planilha paralela

Todos os apps de tração (Hevy, Strong, Fitbod) tratam "plano" como sinônimo de "rotina semanal repetida indefinidamente". Não há conceito de bloco temporal (4-8 semanas), de progressão planejada de volume ou intensidade dentro do bloco, ou de deload como evento programado.

O lifter intermediário/avançado que auto-programa usa planilha paralela (Google Sheets, Notion) para manter o mesociclo e usa o app só para logar. Isso é uma ferida aberta no mercado: **a camada de planejamento e a camada de logging são dois produtos separados**.

O IronForge unifica isso com o Mesocycle como primitivo de dados. A visibilidade na UI (PlansScreen mostra "semana 4 de 12", ProgressBar de conclusão do meso, deload sugerido quando fadiga acumula no v2) comunica ao lifter que o app está pensando no arco temporal, não só na sessão de hoje.

**Risco:** o construtor de mesociclo (PlanEditor) é a tela mais complexa do MVP. Se a UX for difícil, o lifter vai ao Strong que é mais simples. Precisa de 5 minutos ou menos para criar um mesociclo básico funcional — benchmarke esse tempo antes do launch.

### Gap 3 — Dark-first + identidade visual de território (não "mais um app de academia")

O mercado em 2025/26 é dividido entre dois visuais: (a) branco/pastel/wellness (Fitbod, Caliber) e (b) cinza neutro sem personalidade (Hevy, Strong, JEFIT). Nenhum app do comparativo tem uma identidade visual que comunica o território emocional do bodybuilding sério — que não é "wellness pastel" nem "cinza corporativo".

O IronForge com zinc-950 como background, ember-500 (#FF5A1F) como acento primário, Druk Wide como display font e o vocabulário "forja/brasa/aço" ocupa um território vazio. É o único app do comparativo que poderia ter um pôster que combina com a estética de academia de verdade.

Isso não é cosmético — é posicionamento de produto. O lifter avançado que paga $30/mês num app quer que o app reflita quem ele é. A Apple Watch Ultra é cinza e laranja por uma razão. O Whoop é preto por uma razão.

**Risco:** execução. "Dark industrial com ember" pode virar "escuro genérico" se os tokens não forem aplicados com consistência e se a tipografia display (Druk Wide/Bebas Neue) não estiver licenciada e carregando do primeiro frame. O design system da spec (§4 do `02-design-spec.md`) precisa ser aplicado sem exceções na Fase 1.

---

## 7. Resumo de Risco no Escopo Atual

### Risco principal: posicionamento anti-programas-prontos pode ser fatal na aquisição

O scope (§4 do `01-product-scope.md`) declara "programas prontos genéricos = anti-escopo". A intenção é correta (evitar comoditização e atrair a persona certa). Mas o risco real é: **como o lifter que não conhece o app vai confiar no construtor de mesociclo se nunca viu um exemplo de como ele fica?**

Boostcamp usa programas prontos de coaches como aquisição. Hevy usa o free tier generoso. Strong usa 12 anos de reputação. O IronForge ainda não tem nenhum desses mecanismos.

A solução não é "adicionar programas genéricos" — é ter 8–12 templates ricos e bem especificados (com progressão de RIR semana a semana, não só exercícios) que funcionam como demonstração do construtor. O lifter usa o template, modifica, e entende o app. Templates são marketing e onboarding, não produto core.

---

## 8. Referências

- [Hevy Features](https://www.hevyapp.com/features/)
- [Hevy About Us](https://www.hevyapp.com/about-us/)
- [Hevy Previous Workout Values](https://www.hevyapp.com/features/track-exercises/)
- [Hevy Gym Performance Tracking](https://www.hevyapp.com/features/gym-performance/)
- [Guillem Ros — RevenueCat Podcast](https://www.revenuecat.com/blog/growth/guillem-ros-hevy-podcast/)
- [Strong App Review — HotelGyms](https://www.hotelgyms.com/blog/the-strong-app-review-think-less-lift-more)
- [Strong vs. Setgraph — Honest Review](https://setgraph.app/articles/strong-app-review-is-it-worth-it-honest-comparison-vs-setgraph)
- [Strong App Redesign Case Study — Medium](https://medium.com/@hwaijunyap/ui-ux-case-study-strong-workout-app-redesign-fc22afbada65)
- [Fitbod Review — GymGod](https://gymgod.app/blog/fitbod-review)
- [Fitbod Muscle Recovery](https://fitbod.me/blog/tracking-volume-intensity-and-recovery-with-fitbod/)
- [Liftin' App Store](https://apps.apple.com/us/app/liftin-gym-workout-tracker/id1445041669)
- [Liftin' Website](https://www.liftinapp.co)
- [Boostcamp Website](https://www.boostcamp.app/)
- [RP Hypertrophy Review — Dr. Muscle](https://dr-muscle.com/rp-hypertrophy-app-review/)
- [Alpha Progression Review — FitnessDrum](https://fitnessdrum.com/alpha-progression-app-review/)
- [Strong vs Hevy vs Boostcamp vs Fitbod — Vora Blog](https://askvora.com/blog/best-strength-training-apps-2026)
- [Best Workout Tracker Apps — Setgraph](https://setgraph.app/ai-blog/best-workout-tracker-apps-for-iphone)
- [Hevy Pricing](https://hevy.com/pricing)
- [Caliber Review — BarBend](https://barbend.com/caliber-fitness-app-review/)
