# Spec: Demonstrações em vídeo no fluxo de treino (aluno) + captura no celular (coach)

> **Status:** draft · **Agente dono:** ux (mobile-ui-ux-designer) · **Prioridade:** P0 (aluno) / P1 (coach) · **Lado:** mobile
> **Branch:** `feat/video-demos` · **Specs relacionadas:** `../02-design-spec.md`, `../11-mobile-golden-rules.md`, `../10-frontend-architecture.md`, `coach-mode.md`, `../../../ironforge-api/docs/specs/video-library.md`

> **Nota de tema.** O pedido original dizia "dark-first". O design system deste app é **light-first** (`docs/02-design-spec.md` §883, `src/shared/theme/colors.ts`); dark mode é fase futura. Esta spec segue os tokens reais. A **única** superfície preta é o canvas do player (letterbox de vídeo), que é preto em qualquer tema por convenção de mídia.

---

## Problema / JTBD

**Aluno, em pé na academia, celular numa mão, descanso correndo.** Lê "Supino inclinado com halteres · 3×8-12 · RIR 2" e não sabe executar. JTBD: *"quero ver como se faz, agora, em cinco segundos, sem perder onde eu estava no registro da série."*

Restrições físicas que mandam no design (não são detalhe, são o design):

- **O descanso está correndo.** Qualquer coisa que esconda o timer cria ansiedade e faz o aluno sair rápido demais.
- **Uma mão só, polegar na metade inferior.** Controle no topo da tela é controle que não existe.
- **Tela suada, dedo escorregando.** Nada de gesto fino, scrub de timeline, duplo-toque ou alvo <44pt.
- **Academia barulhenta e o aluno está de fone com a própria playlist.** Áudio é inútil, e interromper a música dele é hostil. Vídeo é **mudo, curto e em loop** — ou não serve.
- **Subsolo, 4G ruim.** O vídeo pode não carregar. A *instrução escrita do personal* precisa aparecer mesmo assim.

**Coach, na academia com o aluno na frente.** JTBD: *"gravar a execução certa agora, com esse aluno olhando, e deixar isso vinculado ao exercício certo sem procurar nada."*

---

## Decisão

### 1. O vídeo aparece num **bottom sheet sobre o logger** — nunca em tela dedicada, nunca inline

`ExerciseDemoSheet`, ancorado no rodapé, altura ~72% da tela, sobre o `WorkoutLoggerScreen` **sem desmontá-lo**.

Por quê, na ordem do peso do argumento:

1. **Voltar ao ponto exato é o `dismiss` do sheet.** A tela por baixo continua montada com o mesmo scroll, a mesma série ativa, o mesmo timer. Tela dedicada (`router.push`) obriga a navegação de volta, arrisca remount, compete com o back-swipe do iOS e abre a porta para o aluno se perder no meio da sessão. O custo de errar aqui é o aluno perder o registro da série — o dado que é o produto inteiro.
2. **O timer continua vivo e visível.** O sheet **nunca pausa o rest timer** e replica o contador no seu próprio header. O aluno assiste sabendo quanto falta.
3. **Inline no card mata a tabela de séries.** Um player 16:9 come ~200pt da única tela onde o job principal é registrar peso/reps. E vídeo tocando ao lado do teclado numérico é ruído puro. O logger tem um dono: a série.
4. **Sheet é a linguagem que o app já fala.** `NumericKeypadSheet`, `ExerciseDetailSheet`, `DaySessionSheet` — mesmo padrão de dismiss (swipe-down amplo + tap no scrim), zero aprendizado novo.

**Divisão vertical do sheet, ditada pelo polegar:** player na metade **superior** (só olhar), texto no meio, **todos os controles na metade inferior** (alcance do polegar em uma mão). O CTA de registrar a série vive dentro do sheet: quando o descanso zera, o aluno registra **sem precisar fechar nada**.

**iOS vs Android:** mesmo componente, mesma altura. Divergências: Android respeita o back de sistema fechando o sheet (`onRequestClose`, já é o comportamento do `Modal`) e não trava o gesto de voltar; iOS mantém o swipe-down. Sem `presentation: "formSheet"` nativo — o app já padroniza `Modal` + Reanimated e não vale um segundo padrão de sheet.

### 2. Entrada única, com a cara do personal

O botão `ⓘ` genérico que existe hoje ao lado do nome do exercício **vira** o `DemoTrigger` — thumbnail real do vídeo + avatar do personal. O detalhe do exercício (músculos, equipamento) desce para dentro do mesmo sheet. Um exercício, um botão.

### 3. `coachNote` fica **colado embaixo do player, sempre acima da dobra**

Não antes (ler antes de ver bloqueia o que o aluno pediu), não sobreposta ao vídeo (tapa o movimento — que é o conteúdo), não depois de scroll (some). Ele lê enquanto o loop roda pela segunda vez. É o único texto acima da dobra.

**Duas notas diferentes, nunca fundidas:**

| Origem | Rótulo na UI | Conteúdo |
|---|---|---|
| `PlanExercise.coachNote` | `HOJE` | instrução da sessão ("segura 2s embaixo hoje") |
| `ExerciseDemo.coachNote` | `EXECUÇÃO` | cue permanente do movimento ("cotovelo a 45°, não abre") |

Se existirem as duas, `HOJE` vem primeiro. Fundir as duas apaga a diferença entre "regra do dia" e "regra do movimento" — e é a segunda que o aluno precisa decorar.

### 4. A interface envelhece **encolhendo**, não sumindo

O botão nunca desaparece (procurar um botão que já existiu é pior que ignorar um botão). Ele degrada em três estados, por exercício, com persistência local:

- **A — nunca visto:** linha inteira abaixo do nome do exercício, thumbnail 64pt + "Ver demonstração do seu personal" + ponto forest. Impossível não ver.
- **B — já visto:** colapsa para o alvo 44×44 ao lado do título (o `ⓘ` de hoje, agora com miniatura). Sem ponto, sem texto.
- **C — demo nova ou atualizada depois da última vez que ele viu:** volta ao estado A com o selo `NOVA`. Único re-alarme, e é honesto: existe conteúdo novo de verdade.

Persistência em `AsyncStorage` (`watched-demos`: `exerciseId → { videoId, watchedAt }`); comparação por `videoId`, não por data. Zero backend, zero gamificação — sem contador de vídeos assistidos, sem badge, sem "você é 3º aluno que mais estuda". Isso é anti-escopo do produto.

**Gancho da primeira semana:** no `WorkoutPreview` (antes de entrar na academia, onde ele tem tempo e Wi-Fi) a lista mostra o mesmo `DemoTrigger` por exercício e faz **prefetch** de todas as demos do dia. O gancho morre sozinho no segundo mês, porque tudo vira estado B.

### O que NÃO vamos fazer

- **Tela dedicada de vídeo** — perde o contexto do registro (§1).
- **Player inline no card do exercício** — rouba a tela da tabela de séries.
- **Autoplay com áudio, ou pedir sessão de áudio exclusiva** — cortaria a música do aluno. Sempre mudo; botão de som existe, é secundário.
- **Timeline com scrub** — dedo suado, alvo fino. Barra de progresso é indicador não-interativo na fatia 1.
- **Pausar o rest timer quando o sheet abre** — o aluno perde a noção do descanso e volta cedo ou tarde.
- **Fechar o sheet sozinho quando o timer zera** — roubar o controle no meio de um vídeo é pior que atrasar 5s. Em vez disso, o CTA de registrar sobe para dentro do sheet.
- **Reordenar as demos no cliente** — a ordem (coach primeiro, catálogo depois) é decisão do backend e é a posição do produto. Cliente renderiza na ordem recebida.
- **Rótulo de gênero do performer** — o backend expõe `performerGender` como filtro; a UI usa "silhueta A / B / ambas", nunca "vídeo masculino/feminino" (regra da spec de backend).
- **Upload/biblioteca completa no mobile do coach** — a `coach-mode.md` manda builder e biblioteca para a web. Esta spec abre **uma** exceção justificada: *gravar na hora*. Ver §6.
- **Download offline de vídeo** — armazenamento, invalidação de URL assinada e custo de banda não pagam na fatia 1. Fase 2.

---

## Dados (ref `07-data-model-v2.md`)

Estende `src/entities/video/schema.ts` (já tem `VideoSchema` e `ExerciseDemoSchema`). Novo: o objeto `playback` resolvido pelo backend, como **discriminated union** — é o que impede o cliente de montar URL.

```ts
// src/entities/video/schema.ts
export const PlaybackSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("youtube"),
    youtubeVideoId: z.string(),
    embedUrl: z.string().url(),
    watchUrl: z.string().url(),
    thumbnailUrl: z.string().url().nullable(),
  }),
  z.object({
    kind: z.literal("file"),
    url: z.string().url(),
    expiresAt: z.string().datetime(),
    thumbnailUrl: z.string().url().nullable(),
  }),
  z.object({
    kind: z.literal("unavailable"),
    reason: z.enum(["processing", "error", "removed", "storage_unavailable"]),
  }),
]);

export const ExerciseDemoItemSchema = z.object({
  videoId: z.string(),
  source: z.enum(["youtube", "upload"]),
  title: z.string(),
  coachNote: z.string().max(280).nullable(),
  isPrimary: z.boolean(),
  owner: z.enum(["coach", "platform"]),   // deriva de coachId === null
  coachName: z.string().nullable(),
  coachAvatarUrl: z.string().url().nullable(),
  performerGender: PerformerGenderSchema,
  playback: PlaybackSchema,
});
```

`owner`, `coachName` e `coachAvatarUrl` são o que a UI precisa para o selo do §2 — **handoff para o backend**: se `GET /exercises/:id/demos` não devolver esses três campos hoje, ele precisa devolver (ver Perguntas abertas). Sem eles, o diferencial do produto vira invisível.

**Camada de dados (regra do `docs/10`):** veio do servidor → TanStack Query.

```
src/entities/video/hooks/use-exercise-demos.ts
  queryKey: ["exercise-demos", exerciseId]
  staleTime: 24h · gcTime: 7d · retry: 2 · networkMode: "offlineFirst"
  queryFn: safeParse com ExerciseDemoItemSchema.array() (parsing na borda)
```

`playback.kind === "file"` traz URL assinada de TTL curto: em erro 403/404 no player, **invalidar a query e refazer uma vez** antes de mostrar erro. Nunca cachear a URL fora do Query.

Estado local do aluno → Zustand + persist:

```
src/features/workout/store-watched-demos.ts   // exerciseId → { videoId, watchedAt }
```

Fila de upload do coach → Zustand + persist: `src/features/coach-video-upload/store.ts`.

---

## Telas / fluxo — aluno

### 4.1 Logger: os dois estados do gatilho

```
ESTADO A — nunca viu demo deste exercício
┌─────────────────────────────────────────────┐
│  ✕            24:18                         │
│  ▓▓▓▓▓▓▓░░░░░░  exercício 3 de 6 · Push A   │
├─────────────────────────────────────────────┤
│                                             │
│  Supino inclinado com halteres              │
│  HALTERES · máx. estimado 84,0kg            │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ ┌────┐                             ●  │  │ ← ponto forest = não visto
│  │ │▶ ▓▓│(@) Ver demonstração            │  │   avatar 20pt sobre a thumb
│  │ │ 64 │    do seu personal · Marcos    │  │   linha inteira, alvo 64pt
│  │ └────┘                                │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  #   anterior      kg    reps   rir         │
│  1   —            32,5    10     2   ●      │
│  2   32,5×10      32,5    10     2   ●      │
│  3   32,5×10      [ 32,5  10     2 ] ○      │
│                                             │
├─────────────────────────────────────────────┤
│  DESCANSO   01:43        [ pular ]          │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░                        │
│  [   -15s   ] [   +15s   ]                  │
├─────────────────────────────────────────────┤
│  [       ✓ REGISTRAR SÉRIE 3   32,5×10    ] │
└─────────────────────────────────────────────┘

ESTADO B — já viu (segundo mês)
│  Supino inclinado com halteres        ┌────┐│
│  HALTERES · máx. estimado 84,0kg      │▶ ▓ ││ ← 44×44, thumb + play
│                                       └────┘│   sem texto, sem ponto

ESTADO C — coach publicou demo nova depois da última vez
│  ┌───────────────────────────────────────┐  │
│  │ ┌────┐                                │  │
│  │ │▶ ▓▓│(@) Nova demonstração  [ NOVA ] │  │ ← chip forest, texto + cor
│  │ └────┘    do seu personal             │  │
│  └───────────────────────────────────────┘  │
```

### 4.2 `ExerciseDemoSheet` — o caminho feliz

```
┌─────────────────────────────────────────────┐
│  (logger visível atrás, scrim 60%)          │
│▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁│
│                  ──                         │ ← drag handle
│  Supino inclinado          DESCANSO 01:31 ✕ │ ← timer segue correndo · ✕ 44pt
├─────────────────────────────────────────────┤
│ ███████████████████████████████████████████ │
│ █                                         █ │
│ █          [ vídeo 16:9, mudo, loop ]     █ │ ← canvas preto sempre
│ █                                         █ │
│ █  ┌──────────────────────┐        ┌────┐ █ │
│ █  │(@) Marcos · seu      │        │ 🔇 │ █ │ ← selo do personal (bottom-left)
│ █  │    personal          │        └────┘ █ │   som off, alvo 44pt
│ █  └──────────────────────┘               █ │
│ ███████████████████████████████████████████ │
│ ░░░░░░░░░░░░░░░░░░░░░ (progresso, só leitura)│
├─────────────────────────────────────────────┤
│  HOJE                                       │ ← PlanExercise.coachNote
│  Hoje segura 2 segundos embaixo.            │
│                                             │
│  EXECUÇÃO                                   │ ← ExerciseDemo.coachNote
│  Cotovelo a 45°, não abre. Desce até        │
│  sentir o peitoral alongar, sem bater...    │
│  ver mais                                   │ ← 3 linhas + expandir
├─────────────────────────────────────────────┤
│  OUTRAS DEMONSTRAÇÕES                       │ ← scroll horizontal, thumbs 96×56
│  ┌────────┐ ┌────────┐ ┌────────┐           │
│  │▓▓ (@)  │ │▓▓      │ │▓▓      │           │
│  │Marcos  │ │Catálogo│ │Catálogo│           │
│  └────────┘ └────────┘ └────────┘           │
│  ── (abaixo, só com scroll) ──              │
│  Músculo primário · Peitoral superior       │
│  Secundários · Tríceps, Deltoide anterior   │
│  Equipamento · Halteres                     │
├─────────────────────────────────────────────┤
│  [        ✓ REGISTRAR SÉRIE 3            ]  │ ← só quando descanso ≤ 0
└─────────────────────────────────────────────┘
```

Regras do sheet:

- Abre com o **primeiro item da lista** (o do coach, quando existe) já tocando: mudo, `loop`, `contentFit="contain"`.
- Marca como visto após **3s de reprodução** (não no `onPress` — abrir sem querer não conta).
- Timer no header: `01:31` em `font-mono`. Ao chegar a `00:00`, o texto vira `DESCANSO ACABOU` em `text-warning`, dispara `haptics.timerDone()` e o CTA `REGISTRAR SÉRIE N` **entra** na base do sheet (`SlideInDown`, 200ms). Confirmar ali abre o `NumericKeypadSheet` sobre o sheet de vídeo e, ao confirmar a série, **os dois fecham juntos**.
- Trocar de demo no carrossel: substitui o player e a nota `EXECUÇÃO` no lugar, sem navegar.
- Fechar: `✕`, swipe-down amplo, tap no scrim, back de Android.
- Nada de rotação/fullscreen na fatia 1 — o aluno está de pé, com uma mão.

### 4.3 Estados que não são o caminho feliz

```
SEM DEMO PARA O EXERCÍCIO                  VÍDEO INDISPONÍVEL (reason)
┌──────────────────────────────┐           ┌──────────────────────────────┐
│  Supino inclinado         ✕  │           │  Supino inclinado         ✕  │
├──────────────────────────────┤           ├──────────────────────────────┤
│  ┌────────────────────────┐  │           │  ┌────────────────────────┐  │
│  │         ▷ (cinza)      │  │           │  │        ⏳              │  │
│  │  Ainda sem demonstração│  │           │  │  A demo do seu personal│  │
│  │  para este exercício   │  │           │  │  está sendo processada │  │
│  └────────────────────────┘  │           │  │  Mostrando o catálogo  │  │
│                              │           │  └────────────────────────┘  │
│  HOJE                        │           │  ▸ toca automaticamente o    │
│  Hoje segura 2s embaixo.     │           │    próximo item da lista     │
│                              │           │                              │
│  Músculo primário · ...      │           │  EXECUÇÃO                    │
└──────────────────────────────┘           │  Cotovelo a 45°...           │
Gatilho no logger: NÃO renderiza           └──────────────────────────────┘
o DemoTrigger com thumb. Volta ao          Se TODOS estiverem indisponíveis:
ⓘ neutro 44×44 (detalhe do exercício).     card único + nota, sem player.
Nunca botão desabilitado "fantasma".        `removed`/`error` → "Vídeo indisponível".

OFFLINE (subsolo da academia)              REDE LENTA (>8s sem 1º frame)
┌──────────────────────────────┐           ┌──────────────────────────────┐
│  Supino inclinado         ✕  │           │  Supino inclinado         ✕  │
├──────────────────────────────┤           ├──────────────────────────────┤
│  ┌────────────────────────┐  │           │ ████ poster (thumb cacheada) │
│  │  ▓▓ poster cacheado ▓▓ │  │           │ ████   ░░░ shimmer ░░░       │
│  │      (sem conexão)     │  │           │ ████                         │
│  └────────────────────────┘  │           ├──────────────────────────────┤
│  Sem conexão. O vídeo volta  │           │  A rede da academia está     │
│  quando a rede voltar.       │           │  lenta.                      │
│  [   Tentar de novo   ]      │           │  [ Tentar de novo ]          │
│                              │           │  [ Abrir no YouTube ]  (só   │
│  HOJE                        │  ← TEXTO  │   quando kind === youtube)   │
│  Hoje segura 2s embaixo.     │    SEMPRE │                              │
│  EXECUÇÃO                    │    LEGÍVEL│  HOJE / EXECUÇÃO abaixo,     │
│  Cotovelo a 45°, não abre... │           │  legíveis desde o 1º frame   │
└──────────────────────────────┘           └──────────────────────────────┘
```

**A regra que amarra os quatro estados de erro:** o vídeo pode falhar, a **palavra do personal não pode**. `coachNote` vem no payload da ficha e fica no cache do Query (`gcTime` 7d) — renderiza offline, sempre, em qualquer estado de falha. Sem vídeo, o aluno ainda sai do sheet sabendo algo que não sabia.

Prefetch (o que salva o subsolo): ao abrir `WorkoutPreview`, `prefetchQuery` das demos de todos os exercícios do dia + `expo-image.prefetch` das thumbnails. Vídeo em si não é baixado (fatia 1).

### 4.4 Preview: assistir antes de entrar na academia

```
┌─────────────────────────────────────────────┐
│  Push A · 6 exercícios · ~58min             │
│  3 exercícios com demonstração nova         │ ← só quando houver estado A/C
├─────────────────────────────────────────────┤
│  1  Supino inclinado c/ halteres            │
│     3×8-12 · RIR 2              ┌────┐ ●    │
│                                 │▶ ▓ │      │
│                                 └────┘      │
│  2  Crucifixo na polia                      │
│     3×12-15 · RIR 1             ┌────┐      │
│                                 │▶ ▓ │      │
│                                 └────┘      │
├─────────────────────────────────────────────┤
│  [           ► COMEÇAR TREINO             ] │
└─────────────────────────────────────────────┘
```

Mesmo `ExerciseDemoSheet`, sem o bloco de timer e sem o CTA de registrar série.

---

## Telas / fluxo — coach (P1)

**Exceção justificada à `coach-mode.md`.** Aquela spec manda "upload de vídeo → web", e está certa para *gerenciar biblioteca*. Mas **gravar** é um job que só existe no celular: o coach está na academia, o aluno está executando na frente dele, o notebook não filma. Mobile ganha **capturar + vincular ao exercício em contexto**. Continuam na web: renomear, trocar primária, deletar, organizar, vincular em massa, buscar no catálogo.

### 5.1 Entrada contextual — o vínculo já vem resolvido

O ponto de entrada **é** a resposta para "como ele vincula sem uma busca infernal": ele entra pelo exercício. `exerciseId` vem do contexto de navegação, nunca de um campo de busca.

```
Coach → Alunos → [Ricardo] → Ficha → Plano atual → Push A
┌─────────────────────────────────────────────┐
│  ←  Push A · plano do Ricardo               │
├─────────────────────────────────────────────┤
│  Supino inclinado c/ halteres               │
│  3×8-12 · RIR 2                             │
│                        ┌──────────────────┐ │
│                        │ ▶ sua demo       │ │ ← já tem demo primária dele
│                        └──────────────────┘ │
│  ─────────────────────────────────────────  │
│  Crucifixo na polia                         │
│  3×12-15 · RIR 1                            │
│                        ┌──────────────────┐ │
│                        │ ⊕ gravar demo    │ │ ← sem demo dele: CTA claro
│                        └──────────────────┘ │
└─────────────────────────────────────────────┘
```

### 5.2 Captura → confirmação → fila

```
[⊕ gravar demo]
      │
      ▼  PRIMING (só na 1ª vez, antes do prompt do SO)
┌──────────────────────────────┐
│  Gravar a execução           │
│                              │
│  Para gravar a demonstração  │
│  precisamos da câmera e do   │
│  microfone. O vídeo vai      │
│  direto para a sua           │
│  biblioteca — o aluno vê     │
│  mudo, em loop.              │
│                              │
│  [   Permitir câmera     ]   │ → só aqui dispara o prompt do SO
│  [ Escolher da galeria   ]   │ → caminho sem câmera, sempre visível
│  [        Agora não       ]  │
└──────────────────────────────┘
      │
      ▼  CÂMERA (expo-image-picker, videoMaxDuration: 60, back camera)
      ▼
┌──────────────────────────────┐
│  ←  Nova demonstração        │
├──────────────────────────────┤
│  ████ preview 16:9 ████      │  ← loop mudo, o coach confere
│  ████  0:23 · 18 MB   ████   │
│  [ regravar ]                │
├──────────────────────────────┤
│  VINCULADO A                 │
│  Crucifixo na polia          │  ← texto fixo, não é campo
│  trocar exercício            │  ← escape hatch, link discreto
│                              │
│  TÍTULO                      │
│  [ Crucifixo na polia      ] │  ← pré-preenchido, ele só confirma
│                              │
│  NOTA DE EXECUÇÃO (opcional) │
│  [ ex.: cotovelo levemente  ]│  ← vira ExerciseDemo.coachNote, 280
│  [ flexionado, sem subir os ]│
│  [ ombros              0/280]│
│                              │
│  [✓] Definir como principal  │  ← default ON se ele não tem primária
├──────────────────────────────┤
│  [       ENVIAR              ]│
└──────────────────────────────┘
      │
      ▼  volta IMEDIATAMENTE para a ficha; upload roda em background
```

### 5.3 Progresso — barra persistente, não modal

```
┌─────────────────────────────────────────────┐
│ ↑ Enviando "Crucifixo na polia"  42%    ✕   │ ← barra sticky no topo de
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░  mantenha o app aberto │   TODAS as telas de (coach)
├─────────────────────────────────────────────┤
│  Alunos                                     │
│  ...                                        │

FALHA                                    FILA (2+ itens)
┌───────────────────────────────────┐    ┌───────────────────────────────────┐
│ ⚠ "Crucifixo" não enviou          │    │ ↑ Enviando 1 de 3 · 42%       ✕   │
│   [ tentar de novo ]  [ remover ] │    │ ▓▓▓▓▓▓▓░░░░░  toque para ver      │
└───────────────────────────────────┘    └───────────────────────────────────┘

ARQUIVO GRANDE EM 4G (>50 MB, sem Wi-Fi)
┌───────────────────────────────────┐
│  Esse vídeo tem 180 MB e você     │
│  está no 4G.                      │
│  [ Enviar agora ]                 │
│  [ Deixar na fila para o Wi-Fi ]  │
└───────────────────────────────────┘
```

Regras de upload, em ordem de importância:

1. **Sair da tela não cancela.** A fila vive em Zustand + `AsyncStorage`, fora da tela; navegar entre abas do coach não toca no upload.
2. **Matar o app cancela — e a UI diz isso.** "mantenha o app aberto" na barra. Não prometemos background real; upload verdadeiramente em background exige `expo-background-task` / foreground service e é **Fase 2**. Mentir aqui queima confiança na primeira vez que o coach volta e o vídeo não está lá.
3. **Falha não some.** Item fica na fila com estado `failed` e ação manual `tentar de novo`. **Sem retry automático agressivo** — reenviar 180 MB sozinho no 4G do coach é queimar o dado dele.
4. **Sequência do backend, sem atalho:** `POST /videos/uploads` → `PUT` direto no storage (progresso via `expo-file-system` `createUploadTask`) → `POST /videos/:id/complete` → `POST /exercises/:id/demos`. Se o `complete` falhar, o item volta para `failed` com o `videoId` guardado, e o retry retoma **do complete**, não da estaca zero.
5. **Limites antes de gastar rede:** gravação limitada a 60s; arquivo de galeria acima de 500 MB é barrado no cliente com mensagem clara (o backend rejeitaria de qualquer jeito); `STORAGE_UNAVAILABLE` (503) → "Envio indisponível agora, tente mais tarde", item fica na fila.
6. **`processing` é honesto para os dois lados:** enquanto o backend não marca `ready`, a ficha do coach mostra "processando" e o aluno cai no fallback de §4.3.

---

## Acessibilidade

- **`DemoTrigger`:** `accessibilityRole="button"`, `accessibilityLabel` = `"Ver demonstração de Supino inclinado, gravada pelo seu personal Marcos"` / `"...do catálogo IronForge"`. O selo do personal **não pode existir só em cor** — tem avatar + texto.
- **Estado "não visto"** não é só o ponto forest: o label carrega `"nova demonstração"`. Cor nunca é o único portador de estado (`docs/11` §2).
- **Sheet:** `accessibilityViewIsModal`, foco vai para o título ao abrir, `✕` com `accessibilityLabel="Fechar demonstração"`.
- **Player:** `accessibilityRole="image"` com `accessibilityLabel` = título + nota de execução (o vídeo é mudo, sem narração — **a `coachNote` é o equivalente textual**; declarar isso é o que torna a feature acessível, e é de graça porque o texto já está na tela).
- **Reduce Motion:** com `AccessibilityInfo.isReduceMotionEnabled()`, **não** autoplay em loop — mostra o poster com botão play 56pt e o loop só roda se ele pedir. Vale também para as transições do sheet (`FadeIn` em vez de `SlideInDown`).
- **Alvos:** ✕, mute, cada thumb do carrossel e cada CTA ≥ 44×44pt, ≥ 8pt entre alvos adjacentes.
- **Font scaling:** player fixo em 16:9 (não escala), notas e labels escalam livres; o bloco de notas é `ScrollView` — em `xxxLarge` a nota empurra o carrossel para baixo, e isso está certo: o texto do personal tem prioridade sobre a lista de alternativas.
- **Contraste:** o selo sobre o vídeo tem fundo `bg-black/60` (o frame do vídeo é imprevisível) — nunca texto branco direto sobre o vídeo.
- **TalkBack/VoiceOver na barra de upload:** `accessibilityRole="progressbar"` + `accessibilityValue={{ now, min: 0, max: 100 }}`; anúncio só na mudança de estado (iniciou/falhou/concluiu), nunca a cada porcento.

---

## Critérios de aceite

**Aluno**

- [ ] Tocar no gatilho de demo abre o `ExerciseDemoSheet` **sobre** o logger; ao fechar, série ativa, scroll e timer estão exatamente como estavam.
- [ ] O rest timer **continua correndo** com o sheet aberto e é visível no header dele.
- [ ] Ao zerar o descanso com o sheet aberto, o CTA `REGISTRAR SÉRIE N` aparece dentro do sheet e leva ao `NumericKeypadSheet` sem o aluno fechar nada.
- [ ] O primeiro vídeo que toca é o do coach do aluno quando existe; a ordem da lista é a que o backend mandou, sem reordenação no cliente.
- [ ] Vídeo abre **mudo, em loop**, e não interrompe áudio de outro app.
- [ ] `coachNote` de execução e `coachNote` do plano aparecem com rótulos distintos (`EXECUÇÃO` / `HOJE`), acima da dobra, sem scroll.
- [ ] Após 3s de reprodução o exercício vai para o estado B; o gatilho encolhe para 44×44 na próxima sessão.
- [ ] Demo com `videoId` diferente do último visto reabre o estado A com o selo `NOVA`.
- [ ] Exercício sem demo: nenhum botão de vídeo fantasma; o sheet abre no detalhe do exercício com as notas.
- [ ] `playback.kind === "unavailable"` no primário: cai automaticamente para o próximo item, com aviso discreto do motivo.
- [ ] Em modo avião, o sheet abre, mostra poster cacheado (ou placeholder), a mensagem de offline **e as duas notas legíveis**, com "Tentar de novo".
- [ ] Rede lenta: poster + shimmer, nunca spinner infinito; após 8s, mensagem + "Tentar de novo" (+ "Abrir no YouTube" quando `kind === "youtube"`).
- [ ] URL assinada expirada (403/404 no player) invalida a query e tenta uma vez antes de mostrar erro.
- [ ] `WorkoutPreview` faz prefetch das demos e das thumbnails do dia.
- [ ] Reduce Motion desativa autoplay e o loop.
- [ ] Nenhum contador, badge, ranking ou comparação entre alunos em qualquer superfície desta feature.

**Coach**

- [ ] "Gravar demo" só existe a partir de um exercício em contexto; o vínculo aparece como texto fixo, não como busca.
- [ ] Permissão de câmera é pedida **depois** de uma tela de priming, nunca a frio; "Escolher da galeria" continua disponível se ele negar.
- [ ] Título vem pré-preenchido com o nome do exercício; "Definir como principal" vem ligado quando ele ainda não tem primária.
- [ ] Ao tocar `ENVIAR`, ele volta para a ficha na hora e a barra de progresso aparece no topo de todas as telas de `(coach)`.
- [ ] Navegar entre abas não cancela o upload; a barra diz "mantenha o app aberto".
- [ ] Upload falho fica na fila com "tentar de novo" e sobrevive a fechar/reabrir o app; retry após `complete` pendente não reenvia o arquivo.
- [ ] Arquivo >500 MB é barrado no cliente com mensagem; >50 MB fora do Wi-Fi pergunta antes de enviar.
- [ ] Depois de `complete` + link, o vídeo aparece na ficha do aluno como demo daquele exercício.

**Sempre**

- [ ] `npm run typecheck && npm run lint && npm run test` verdes; testado em iPhone SE, iPhone com Dynamic Island e Android mid-range.

---

## Fora de escopo (fatia 1)

- Download de vídeo para offline real.
- Fullscreen / rotação / scrub / velocidade de reprodução / frame-by-frame.
- "Pedir vídeo ao meu personal" (não existe endpoint; vira ruído se o pedido não chegar a lugar nenhum).
- Upload em background verdadeiro (`expo-background-task` / foreground service).
- Biblioteca do coach no mobile (listar, renomear, deletar, trocar primária, vincular em massa) → **web**.
- Filtro de silhueta do performer na UI do aluno (backend expõe; UI espera `videoPerformerPref` resolvido).
- Legendas/CC, PiP, compartilhar demo.
- Comentário do aluno no vídeo, "marcar como difícil", qualquer sinal social.

---

## Perguntas abertas

1. **Backend:** `GET /exercises/:id/demos` devolve `owner`/`coachName`/`coachAvatarUrl`? Sem isso o selo "do seu personal" — o diferencial do produto — não existe. **Bloqueia a fatia 1 do aluno.**
2. **Backend:** o item traz `updatedAt` do demo? O estado C compara por `videoId`, mas coach que troca a nota sem trocar o vídeo não re-alarma. Aceitável na fatia 1; `updatedAt` melhoraria.
3. YouTube em `WebView` (`react-native-webview`, já instalado) atende o requisito "mudo + loop + sem chrome"? Se o embed insistir em mostrar controles/branding, avaliar `playerVars` ou aceitar o chrome do YouTube só nesse `kind`. Uploads usam `expo-video` (já instalado), sem essa dúvida.
4. Progresso de upload: `expo-file-system` `createUploadTask` com `PUT` pré-assinado — confirmar que o callback de progresso funciona com upload binário direto ao S3/GCS.
5. `coach-mode.md` diz "upload de vídeo → web". Esta spec abre a exceção da captura contextual. **PO precisa ratificar** antes da fatia do coach.

---

## Plano (arquivos / tarefas)

**Aluno (P0)**

- [ ] `src/entities/video/schema.ts` — `PlaybackSchema`, `ExerciseDemoItemSchema` (+ teste de parse dos 3 `kind`).
- [ ] `src/entities/video/hooks/use-exercise-demos.ts` — query + `safeParse` na borda.
- [ ] `src/entities/video/index.ts` — public API.
- [ ] `src/features/workout/store-watched-demos.ts` — visto/não-visto persistido (+ teste da regra do estado C).
- [ ] `src/widgets/demo-trigger/demo-trigger.tsx` — três estados A/B/C, usado no logger e no preview.
- [ ] `src/features/workout/components/exercise-demo-sheet.tsx` — substitui `exercise-detail-sheet.tsx` (absorve músculos/equipamento/nota do plano e remove o placeholder "Em breve").
- [ ] `src/features/workout/components/demo-player.tsx` — `expo-video` para `file`, `WebView` para `youtube`, estados de erro/offline/lento, Reduce Motion.
- [ ] `src/features/workout/screens/workout-logger-screen.tsx` — troca o `ⓘ` pelo `DemoTrigger`, passa o timer para o sheet, CTA de registrar dentro do sheet.
- [ ] `src/features/workout/screens/workout-preview-screen.tsx` — `DemoTrigger` por exercício + prefetch.

**Coach (P1)**

- [ ] `src/features/coach-video-upload/store.ts` — fila persistida (+ teste da máquina `queued → uploading → completing → done | failed`).
- [ ] `src/features/coach-video-upload/lib/upload-task.ts` — presign → PUT → complete → link, retomável no `complete`.
- [ ] `src/features/coach-video-upload/components/camera-priming-sheet.tsx`
- [ ] `src/features/coach-video-upload/screens/demo-capture-screen.tsx`
- [ ] `src/widgets/upload-progress-bar/upload-progress-bar.tsx` — sticky no `(coach)/_layout.tsx`.
- [ ] `app/(coach)/demo/[exerciseId].tsx` — wiring da tela de confirmação.
- [ ] `src/features/coach/screens/coach-student-screen.tsx` — CTA "gravar demo" por exercício.
