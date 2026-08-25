# Spec: Demonstrações em vídeo no fluxo de treino (aluno) + captura no celular (coach)

> **Status:** draft · **Agente dono:** ux (mobile-ui-ux-designer) · **Prioridade:** P0 (aluno) / P1 (coach) · **Lado:** mobile
> **Branch:** `feat/video-demos` · **Specs relacionadas:** `../02-design-spec.md`, `../11-mobile-golden-rules.md`, `../10-frontend-architecture.md`, `coach-mode.md`, `../../../ironforge-api/docs/specs/video-library.md`

> 🔴 **A DECISÃO VIGENTE É O [ADENDO V3](#adendo-v3--modal-de-tela-cheia-substitui-o-bottom-sheet-da-v2).** O detalhe do exercício **continua sendo modal, mas deixa de ser bottom sheet de meia tela e passa a ocupar a tela inteira** — rota `app/(workout)/exercise/[planExerciseId].tsx` com `presentation: "fullScreenModal"`. Decisão do PO após teste no simulador: no sheet o player fica cortado pela dobra e o aluno estuda o movimento num espaço de ~60% de tela. **O vídeo toca embutido; o aluno não sai do app para assistir.** Onde v3, v2 e o corpo original divergirem, **vale o v3**.
>
> ⚠️ **Adendos anteriores (histórico, não apagar).** **[Adendo v2](#adendo-v2--instructions-prévia-clicável-e-autoria-do-coach)** substituiu a ordem interna do sheet (§4.2) e o gatilho de linha do preview (§4.4). O conteúdo de v2 continua valendo **exceto** o container (sheet → página) e o que o v3 revisa explicitamente. O corpo original (v1) é a base.
>
> **Mapa rápido de quem manda no quê:** container e navegação → **v3** · ordem dos blocos e dobra → **v3** · `instructions`/parser/alerta → **v2** · linha tocável da prévia → **v2** · autoria do coach → **v2** · estados de erro de rede → **v1 §4.3 + v3 §V3-6** · fluxo do coach → **v1 §5** · anti-escopo → soma dos três.

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

---
---

# Adendo v2 — `instructions`, prévia clicável e autoria do coach

> **Data:** 2026-08-24 · **Autor:** ux (mobile-ui-ux-designer) · **Status:** decidido
> **Substitui:** §4.2 (ordem interna do sheet) e §4.4 (gatilho de demo na prévia).
> **Mantém intacto:** §1 (sheet, nunca tela dedicada), §3 (`HOJE` vs `EXECUÇÃO` nunca fundidas), §4.3 (estados de erro), §5 (coach), anti-escopo.
> **Nota de tema:** segue valendo o §0 — o design system é light-first (`src/shared/theme/colors.ts`). O único preto é o letterbox do player.

## O que mudou desde a v1

| # | Mudança | Impacto no design |
|---|---|---|
| 1 | Backend passa a entregar **`instructions`** por exercício: 3 a 5 passos curtos em pt-BR, separados por `\n`, incluindo o erro mais comum quando o movimento é arriscado. | Existe conteúdo textual **sempre disponível e offline**. Isso inverte a briga vídeo↔texto pela dobra (§V2-3). |
| 2 | O item da **prévia da sessão** passa a ser tocável e abre a explicação + vídeo. | Nasce uma segunda âncora de toque na tela do CTA primário (§V2-1). |
| 3 | O demo traz `coach: { name, avatarUrl }` (já existe em `ExerciseDemoSchema`). | A autoria vira visível — e precisa de exatamente **um** lugar (§V2-6). |

---

## V2-0. Dado: `Exercise.instructions`

`instructions` é do **exercício**, não do demo — ele existe mesmo sem vídeo. Entra em `src/entities/exercise/schema.ts`:

```ts
instructions: z.string().nullable().default(null),
```

**Contrato de formatação (handoff para o backend, sem negociação no cliente):**

- Linhas separadas por `\n`. Linha vazia é ignorada. De 3 a 5 linhas úteis.
- Uma linha (no máximo uma) pode começar com o prefixo **`Erro comum:`** ou **`Atenção:`** (case-insensitive). Essa linha é o alerta de execução e **não recebe número**.
- Nenhuma linha traz numeração própria (`1.`, `1)`, `-`). Quem numera é a UI.
- Sem markdown, sem emoji.

Parser puro, testável, uma função só:

```ts
// src/entities/exercise/lib/parse-instructions.ts
export interface InstructionBlocks { steps: string[]; warning: string | null }
export function parseInstructions(raw: string | null): InstructionBlocks
```

**O cliente nunca adivinha qual passo é o erro.** Sem prefixo → `warning === null` e todas as linhas viram passos numerados. `riskFlags` **não** é usado para inferir alerta: ele descreve o exercício, não a frase.

---

## V2-1. Prévia: como o item convida ao toque sem competir com "INICIAR TREINO"

**Decisão: a linha inteira vira o alvo, e ela não ganha nenhum enfeite novo.** A afordância é a densidade da linha + um chevron terciário + o feedback de pressão. Zero cor de marca no item.

Por quê, na ordem do peso:

1. **Só um elemento na tela pode ser verde-floresta sólido, e ele é o CTA.** Se o item da lista ganhar borda accent, botão "ver execução" ou thumbnail com play, a tela passa a ter 7 chamadas concorrentes e o aluno que já sabe o treino tem que filtrar 6 delas para chegar no botão. O CTA mantém monopólio do `variant="solid"`.
2. **Linha inteira > botão dentro da linha.** Um alvo de 56pt de altura por toda a largura é mais fácil de acertar de pé e não precisa de nenhum pixel de UI para existir. Botãozinho na linha custa 44pt de largura, 8pt de gap, e ainda cria um segundo alvo dentro do primeiro.
3. **O aluno que já sabe o treino não é atrapalhado:** nada mudou visualmente para ele — mesma linha, mesma prescrição, mesmo `4×8–10` à direita. O toque é uma porta que só quem procura enxerga, e ela é descoberta de graça no primeiro toque acidental (que abre algo útil, não um destino destrutivo).
4. **A thumbnail por linha da v1 morre aqui.** Ela existia para ser a afordância; agora a linha é a afordância. Cinco thumbs 44pt numa lista de prévia é a poluição que o PO teme, e cada uma custa uma imagem de rede antes do treino começar.

**Dica de descoberta, uma vez só:** acima da lista, `Text variant="label"` — `TOQUE NO EXERCÍCIO PARA VER A EXECUÇÃO`. Some para sempre assim que o aluno abrir o primeiro sheet. Reusa o store que já existe (`store-watched-demos`): a dica esconde quando o store tiver ≥1 entrada. Sem flag nova, sem AsyncStorage novo.

**Ponto de "nova demonstração" (estado C da §4.4):** sobrevive, encolhido para um `●` de 6pt `forest-500` **antes do chevron**, com o estado carregado no `accessibilityLabel` (cor nunca é o único portador — `docs/11` §2). Estado A/B não colocam nada na prévia: na prévia tudo é "nunca visto" no primeiro mês e a lista viraria um campo de bolinhas.

### Wireframe — item da prévia

```
NORMAL (linha tocável, 56pt de altura mínima)
┌─────────────────────────────────────────────────────┐
│  EXERCÍCIOS                                         │  ← Text variant="label"
│  TOQUE NO EXERCÍCIO PARA VER A EXECUÇÃO             │  ← dica, some após 1º sheet
│                                                     │
│   1   Puxada frontal                 4×8–10    ›    │  ← ‹num mono w-5› ‹nome›
│  ─────────────────────────────────────────────────  │     ‹prescrição mono›
│   2   Remada curvada                 3×6–8     ›    │     ‹chevron 16pt›
│       SUPERSET                                      │
│  ─────────────────────────────────────────────────  │
│   3   Crucifixo na polia          ● 3×12–15    ›    │  ← ● só no estado C
│  ─────────────────────────────────────────────────  │
│   4   Rosca direta                   3×10–12   ›    │
└─────────────────────────────────────────────────────┘

PRESSIONADO (durante o press, 120ms)
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░1   Puxada frontal                 4×8–10    ›░░  │  ← bg-bg-sunken na linha
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │     inteira (edge-to-edge
│  ─────────────────────────────────────────────────  │     dentro do Card, -mx-5 px-5)
                                                          Android: ripple nativo
                                                          Sem scale, sem opacity
```

Implementação da linha (o essencial, o resto é o que já está lá):

```tsx
<Pressable
  onPress={() => openSheet(pe)}
  android_ripple={{ color: colors.bg.sunken }}
  accessibilityRole="button"
  accessibilityLabel={`${ex.name}, ${pe.targetSets} séries de ${pe.repRangeMin} a ${pe.repRangeMax} repetições. Ver execução.`}
  accessibilityHint="Abre a explicação e o vídeo do exercício"
  className="min-h-14 -mx-5 px-5 active:bg-bg-sunken"
>
```

- `min-h-14` (56pt) > 44pt mesmo com fonte no menor tamanho; com `xxxLarge` a linha cresce sozinha, nunca corta o nome (`numberOfLines={2}`).
- Chevron `Ionicons name="chevron-forward" size={16} color={colors.text.tertiary}` — mesmo par nome/cor já usado em `coach-home-screen.tsx`. É a única coisa nova na linha.
- O `Card` que embrulha a lista continua `padding="none"`; o press precisa vazar até a borda do card (`-mx-5 px-5`), senão parece que só o texto é clicável.
- **Sem haptic na abertura do sheet.** Háptico aqui é ruído: o aluno vai abrir 6 sheets numa prévia. Háptico segue reservado ao registro de série e ao fim do timer (`docs/11` §3).
- Evento a instrumentar: `preview_exercise_opened { exerciseId, hasVideo }` — é o número que diz se a prévia virou ferramenta de estudo ou continua sendo um checkpoint antes do CTA.

**Não fazer:** botão "ver execução" na linha · borda accent no item · thumbnail por linha · abrir em `router.push` (a prévia tem que continuar montada; é o mesmo argumento da §1) · badge de contagem de demos.

---

## V2-2. Hierarquia dentro do sheet — ordem fixa, um comportamento só

**Decisão: mesma ordem nos dois contextos. O sheet não se reorganiza por contexto — ele só ganha ou perde o bloco de sessão (timer + CTA de registrar).**

Ordem, de cima para baixo:

| # | Bloco | Por que aqui |
|---|---|---|
| 1 | **Título + prescrição** (`Puxada frontal` / `4×8–10 · RIR 2`) | É a confirmação de que ele abriu o exercício certo, e mid-set é frequentemente a única coisa que ele veio conferir. Custa 2 linhas e resolve uma visita inteira. |
| 2 | **`HOJE`** (`PlanExercise.coachNote`), quando existe | Regra do dia sobrescreve a regra do movimento. Se ele ler os passos e sair sem ver "hoje segura 2s embaixo", o personal escreveu no vazio. É curto (≤280) e raro — não empurra o resto. |
| 3 | **`COMO EXECUTAR`** — passos numerados + alerta | O conteúdo do job. §V2-3. |
| 4 | **Vídeo** | Logo abaixo dos passos, com o topo do player visível sem scroll (peek). |
| 5 | **`EXECUÇÃO`** (`ExerciseDemo.coachNote`) + byline do coach | Ancorada no vídeo, é o comentário *daquele* vídeo. Fundir com `HOJE` continua proibido (§3). |
| 6 | **Detalhe do exercício** (músculo primário, secundários, equipamento) | Referência, não instrução. Abaixo da dobra, sem exceção. |

**Por que a mesma ordem nos dois momentos, contra a tentação de adaptar:**

O aluno sentado no sofá e o aluno em pé no descanso são a **mesma pessoa com uma semana de diferença**. Ele aprende no domingo onde fica cada coisa e usa essa memória na terça, com o descanso correndo. Reordenar por contexto quebra exatamente a memória que faz a consulta mid-set custar 3 segundos em vez de 10 — e o contexto de abertura é o mais difícil de acertar em heurística (abrir a prévia dentro do vestiário 2 min antes de treinar é "planejando" ou "treinando"?). Errar essa heurística é pior que não ter heurística: a tela muda de forma sem o aluno entender por quê.

**A adaptação que existe** (e é a mesma da v1, já aprovada):

- **Contexto logger:** header carrega `DESCANSO 01:31` correndo em `font-mono`, e o CTA `✓ REGISTRAR SÉRIE N` entra na base do sheet quando o descanso zera. Ordem do conteúdo idêntica.
- **Contexto prévia:** sem timer, sem CTA de registrar. O rodapé do sheet fica vazio — e fica vazio mesmo, sem "Entendi"/"Fechar" de consolação. Fechar já tem `✕`, swipe e scrim.

**Consequência de layout que o dev precisa respeitar:** o sheet é um `ScrollView` com `max-h-[85%]` (subiu de 75%, porque agora há passos). O bloco 1 é fixo (não rola); 2–6 rolam. Sem seção colapsável, sem accordion — accordion em pé, com dedo suado, é um toque a mais para ver o que ele já pediu.

---

## V2-3. Quem ganha a dobra: **o texto**

Reversão explícita do §4.2 (lá o player era o topo). Lá o texto era só uma nota opcional do coach; agora existe explicação estruturada em todo exercício. O que mudou foi o conteúdo, não o gosto.

1. **Fone com a playlist dele + academia barulhenta.** O vídeo é mudo por decisão nossa (§1). Vídeo mudo é uma pantomima: ótima para "qual é a pegada", inútil para "não trave o cotovelo". A frase carrega o que o loop não fala.
2. **Uma mão ocupada, tela suada.** Ler 4 linhas é um toque (nenhum). Entender um loop de 6s pode custar 2 ou 3 voltas — e o aluno fica parado olhando enquanto o descanso corre.
3. **O texto já está no dispositivo, o vídeo talvez não.** Subsolo, 4G ruim, URL assinada expirada: o player pode virar shimmer por 8 segundos. Se o player está no topo, o sheet abre **vazio** na área mais nobre. Com o texto no topo, o sheet nunca abre vazio — o tempo de primeira informação útil é **0ms**, sempre.
4. **Escaneabilidade.** O aluno mid-set não quer aprender o movimento, quer conferir um detalhe ("é pegada supinada?"). Ele varre 4 linhas numeradas com o olho. Vídeo não se varre.
5. **Aprender o movimento — o caso onde o vídeo ganha — acontece na prévia, sentado, com Wi-Fi**, e ali um scroll de 100pt não custa nada. Otimizar a dobra para o caso caro (academia) e pagar um scroll no caso barato (sofá) é a troca certa.

**Mas o vídeo não pode parecer ausente.** O player fica imediatamente abaixo dos passos e **~40% dele aparece sem scroll** (peek). Ver a borda do player cortada pela dobra é a melhor afordância de scroll que existe. Na prévia com Wi-Fi ele já está carregado quando o aluno chega lá.

**Autoplay:** só começa quando ≥60% do player está visível na viewport (`onLayout` + `scrollY`), e para quando sai. Não gasta a rede da academia com um vídeo que ninguém está olhando, e mantém a regra de Reduce Motion da §Acessibilidade.

---

## V2-4. Os passos: lista numerada, e o alerta que não grita

**Lista numerada, um bloco só, sem card por passo.** Cinco cards = cinco caixas = a tela vira um formulário. Parágrafo corrido perde a escaneabilidade que é a razão do texto existir. Numeração é o que comunica "isto é uma sequência com ordem".

- Índice em `font-mono`, `text-xs`, `text-text-disabled`, coluna `w-5 text-right` — **exatamente o mesmo tratamento do número do exercício na prévia**, então o aluno vê "lista ordenada" sem aprender nada.
- Texto do passo: `text-sm text-text-primary leading-relaxed`, 12pt entre passos. Sem `numberOfLines` — passo cortado é passo inútil.
- Sem ícone por passo, sem bullet, sem divisória entre passos.

**O alerta (`Erro comum:` / `Atenção:`):**

- Fica **sempre no fim** da lista, independente da posição em que veio no `\n`. É o que ele deve levar embora.
- Visual: `bg-warning-muted` (`#FEF3C7`), **borda esquerda 3pt `warning`** (`#B45309`), `rounded-lg`, `p-3`, ícone `alert-circle-outline` 16pt `warning` no início da linha, e o rótulo `ERRO COMUM` em `Text variant="label"` na cor `warning`. Texto do corpo em `text-text-primary`.
- **Nunca `error`/vermelho.** Vermelho é o token de falha do sistema; um cue técnico que aparece em toda perna de treino em vermelho vira ruído e o aluno para de ler em duas semanas — e aí ele não lê no dia em que importa.
- Nunca ícone circular preenchido, nunca fundo âmbar sangrando a largura toda do sheet, nunca mais de um alerta por exercício.
- Sem alerta no payload → **nada é renderizado**. Não existe "sem alertas para este exercício".

---

## V2-5. Sem vídeo: os passos são o conteúdo, não o consolo

Esse é o caso **majoritário** (exercício customizado do personal). O sheet sem vídeo tem que parecer uma tela terminada.

- **Nenhuma caixa 16:9 vazia, nenhum placeholder cinza, nenhum `▷` desabilitado, nenhuma ilustração.** Isso é o que transforma uma tela completa numa tela quebrada.
- O bloco `COMO EXECUTAR` **sobe** e ocupa o espaço; o rótulo `COMO EXECUTAR` some e os passos passam a vir direto sob o título/`HOJE` — sem rótulo, porque não há nada de que se diferenciar. (Com vídeo o rótulo volta, porque aí existem dois conteúdos irmãos.)
- Onde estaria o vídeo entra **uma linha só**, `text-xs text-text-tertiary`, sem card e sem ícone: `Sem vídeo para este exercício.` Um fato, não um estado de erro.
- **Sem "pedir vídeo ao meu personal"** — segue fora de escopo (§Fora de escopo): não há endpoint, e um pedido que não chega a lugar nenhum é pior que a ausência.
- Se o exercício **também** não tem `instructions` (nem vídeo nem texto): aí sim o sheet cai no comportamento antigo — título, `HOJE` se houver, e o detalhe do exercício (músculos/equipamento) sobe para virar o conteúdo. É o único caso em que o bloco 6 fica acima da dobra.

---

## V2-6. Autoria do coach: um selo por sheet, colado no que é dele

**Regra:** a autoria aparece **uma vez por sheet**, ancorada no artefato que realmente é do coach, e some quando o conteúdo é do catálogo.

| Situação | Onde aparece | Forma |
|---|---|---|
| Demo com `ownedByCoach === true` | **Byline logo abaixo do player**, alinhada à esquerda, colada na nota `EXECUÇÃO` | avatar 20pt + `Marcos · seu personal` em `text-2xs font-semibold text-forest-500` |
| Demo do catálogo (`ownedByCoach === false`) | Nada | silêncio = genérico. Sem "IronForge", sem "catálogo" em selo |
| Exercício criado pelo coach (`ownerCoachId !== null`) e **sem** vídeo dele | Uma linha ao **fim dos passos** | mesmo avatar + `Orientação de Marcos, seu personal` |
| Ambos os casos ao mesmo tempo | **Só a byline do vídeo.** Nunca duas | — |

- **Fora do overlay do vídeo.** A v1 colocava o selo sobre o frame (`bg-black/60`) — cai fora: sobre a imagem ele exige um fundo escuro que só existe para ele, some quando o player está em shimmer/erro, e é justamente no erro que o aluno mais precisa saber de quem é a orientação. Abaixo do player ele vive no tema do app, contrasta sempre e sobrevive a todos os estados da §4.3.
- **Nunca na prévia, nunca no header do sheet, nunca no logger.** Repetir a cara do personal em toda superfície é selo publicitário; ele vira invisível em três dias e rouba densidade da lista.
- **Sem `avatarUrl`:** `Ionicons name="person-circle" size={20} color={colors.forest[500]}` — o mesmo fallback que `exercise-demo-section.tsx` já usa. Nunca iniciais em círculo colorido (padrão novo, sem motivo).
- `expo-image` com `width`/`height` declarados e `contentFit="cover"` (`docs/11` §4).

---

## Wireframes — sheet completo

```
COM VÍDEO · contexto LOGGER (mid-set, descanso correndo)
┌─────────────────────────────────────────────┐
│  (logger visível atrás, scrim bg-bg-overlay)│
│▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁│
│                  ──                         │ ← drag handle (já existe)
├─────────────────────────────────────────────┤ ┐
│  Puxada frontal            DESCANSO 01:31 ✕ │ │ BLOCO FIXO (não rola)
│  4×8–10 · RIR 2                             │ │ timer mono · ✕ 44×44
├─────────────────────────────────────────────┤ ┘
│  HOJE                                       │ ← só se planExercise.coachNote
│  ┌───────────────────────────────────────┐  │   Card variant="accent"
│  │ Hoje segura 2 segundos embaixo.       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  COMO EXECUTAR                              │ ← Text variant="label"
│   1  Sente com as coxas travadas sob o      │   índice mono w-5, igual à prévia
│      apoio, pés firmes no chão.             │
│   2  Pegada pronada, um pouco mais aberta   │
│      que os ombros.                         │
│   3  Puxe a barra até a clavícula levando   │
│      os cotovelos para baixo e para trás.   │
│   4  Volte controlado até estender os       │
│      cotovelos sem soltar os ombros.        │
│  ┃┌──────────────────────────────────────┐  │ ← borda esq. 3pt warning
│  ┃│ ⚠ ERRO COMUM                         │  │   bg-warning-muted
│  ┃│ Não jogue o tronco para trás para     │ │   ícone 16pt warning
│  ┃│ subir a carga.                        │ │
│  ┃└──────────────────────────────────────┘  │
│                                             │
│ ███████████████████████████████████████████ │ ← topo do player visível
│ █        [ vídeo 16:9, mudo, loop ]       █ │   sem scroll (peek ~40%)
│ ─ ─ ─ ─ ─ ─ ─ dobra da tela ─ ─ ─ ─ ─ ─ ─ ─ │
│ █                                         █ │
│ ███████████████████████████████████ [ 🔇 ] █│ ← mute 44×44, canto inf. dir.
│ ░░░░░░░░░░░░░░ (progresso, só leitura) ░░░░ │
│  (@) Marcos · seu personal                  │ ← byline: avatar 20pt + nome
│                                             │
│  EXECUÇÃO                                   │ ← ExerciseDemo.coachNote
│  Cotovelo desce colado ao corpo, não abre.  │
│                                             │
│  OUTRAS DEMONSTRAÇÕES                       │ ← só se demos.length > 1
│  ┌────────┐ ┌────────┐                      │
│  │▓▓ (@)  │ │▓▓      │                      │
│  └────────┘ └────────┘                      │
│                                             │
│  Músculo primário · Dorsal                  │
│  Secundários · Bíceps, Deltoide posterior   │
│  Equipamento · Cabo / polia                 │
├─────────────────────────────────────────────┤
│  [        ✓ REGISTRAR SÉRIE 3            ]  │ ← entra só quando descanso ≤ 0
└─────────────────────────────────────────────┘   (SlideInDown 200ms)


SEM VÍDEO · contexto PRÉVIA (sentado, planejando)
┌─────────────────────────────────────────────┐
│                  ──                         │
├─────────────────────────────────────────────┤
│  Crucifixo na polia                      ✕  │ ← sem timer neste contexto
│  3×12–15 · RIR 1                            │
├─────────────────────────────────────────────┤
│  HOJE                                       │
│  ┌───────────────────────────────────────┐  │
│  │ Foca na contração, carga é secundária.│  │
│  └───────────────────────────────────────┘  │
│                                             │
│   1  Ajuste as polias na altura dos ombros  │ ← sem rótulo COMO EXECUTAR:
│      e dê um passo à frente.                │   não há vídeo do que separar
│   2  Cotovelos levemente flexionados e      │
│      travados nessa angulação.              │
│   3  Junte as mãos à frente do peito sem    │
│      subir os ombros.                       │
│  ┃┌──────────────────────────────────────┐  │
│  ┃│ ⚠ ERRO COMUM                         │  │
│  ┃│ Não transforme em supino dobrando os  │ │
│  ┃│ cotovelos no meio do movimento.       │ │
│  ┃└──────────────────────────────────────┘  │
│                                             │
│  (@) Orientação de Marcos, seu personal     │ ← só se ownerCoachId !== null
│                                             │
│  Sem vídeo para este exercício.             │ ← 1 linha, text-tertiary,
│  ─ ─ ─ ─ ─ ─ ─ dobra ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │   sem card, sem ícone, sem CTA
│  Músculo primário · Peitoral                │
│  Secundários · Deltoide anterior            │
│  Equipamento · Cabo / polia                 │
│                                             │
│  (rodapé vazio — sem botão "Entendi")       │
└─────────────────────────────────────────────┘
```

---

## Acessibilidade (v2)

- **Item da prévia:** `accessibilityRole="button"`; label `"Puxada frontal, 4 séries de 8 a 10 repetições. Ver execução."`; com `●` de demo nova, o label termina em `" Nova demonstração do seu personal."`. `accessibilityHint` só na primeira linha da lista (repetir hint em 6 itens é tortura de leitor de tela).
- **Passos:** o container recebe `accessibilityRole="list"`; cada passo é lido como `"Passo 2 de 4. Pegada pronada..."` — o número precisa estar **no label**, não só no glifo `font-mono`, que o leitor lê como "2" solto.
- **Alerta:** `accessibilityLabel={\`Erro comum: ${warning}\`}`. Sem `accessibilityRole="alert"` — não é um evento, é conteúdo estático; `alert` faria o TalkBack interromper a leitura em curso.
- **Byline do coach:** `accessibilityLabel="Demonstração gravada por Marcos, seu personal"`; o avatar é decorativo (`accessibilityElementsHidden`), o nome carrega tudo. Cor `forest-500` nunca é o único portador — o texto diz "seu personal".
- **Player:** `accessibilityLabel` = título + primeiro passo (o vídeo é mudo; os passos são o equivalente textual).
- **Font scaling:** com `xxxLarge`, passos e alerta empurram o player para baixo — está certo, o texto tem prioridade. Player fixo em 16:9, não escala. Nenhuma altura de linha fixa em `px` no bloco de passos.
- **Reduce Motion:** o press da linha da prévia não anima nada além do background (já é compatível); o sheet mantém a regra da v1 (`FadeIn` no lugar de `SlideInDown`).
- **Alvos:** linha da prévia `min-h-14`; `✕`, mute e cada thumb ≥44×44; ≥8pt entre alvos.

---

## Critérios de aceite (v2)

- [ ] Tocar em qualquer ponto da linha da prévia abre o sheet; o feedback de pressão cobre a linha inteira (`bg-bg-sunken` no iOS, ripple no Android) e não tem scale nem opacity.
- [ ] A prévia **não** ganhou botão, borda accent nem thumbnail por item; `INICIAR TREINO` continua o único elemento `solid`/forest da tela.
- [ ] A dica `TOQUE NO EXERCÍCIO PARA VER A EXECUÇÃO` some permanentemente depois do primeiro sheet aberto, sem flag nova de storage.
- [ ] Fechar o sheet devolve a prévia com o scroll intacto (nada de `router.push`).
- [ ] A ordem do sheet é idêntica na prévia e no logger; a única diferença é o timer no header e o CTA de registrar na base.
- [ ] Ao abrir o sheet, título, prescrição e o primeiro passo estão legíveis **sem scroll e sem rede**; o topo do player aparece cortado pela dobra.
- [ ] Passos vêm numerados pela UI; nenhuma numeração duplicada quando o backend mandar linha já numerada por engano (o parser tolera e remove prefixos `1.`/`1)`/`- `).
- [ ] O alerta usa tokens `warning`, aparece no máximo uma vez, sempre no fim da lista, e não é renderizado quando não há prefixo no payload.
- [ ] Exercício sem vídeo: nenhuma caixa 16:9, nenhum placeholder, nenhum botão desabilitado — só a linha `Sem vídeo para este exercício.`
- [ ] Exercício sem vídeo e sem `instructions`: o detalhe (músculos/equipamento) sobe e o sheet não fica vazio.
- [ ] Autoria do coach aparece **no máximo uma vez** por sheet e nunca sobre o frame do vídeo; demo de catálogo não mostra selo nenhum.
- [ ] `parseInstructions` tem teste unitário cobrindo: 3 linhas sem alerta, 5 linhas com `Erro comum:` no meio (deve ir para o fim), prefixo `Atenção:`, `null`, string vazia, linhas em branco.
- [ ] Nenhum contador, streak, badge ou comparação entre alunos em qualquer superfície nova.
- [ ] `npm run typecheck && npm run lint && npm run test` verdes; conferido em iPhone SE, iPhone com Dynamic Island e Android mid-range.

---

## Plano (v2 — arquivos)

- [ ] `src/entities/exercise/schema.ts` — campo `instructions`.
- [ ] `src/entities/exercise/lib/parse-instructions.ts` + teste — `steps` / `warning`.
- [ ] `src/entities/exercise/ui/exercise-instructions.tsx` — lista numerada + bloco de alerta (UI burra, recebe `InstructionBlocks`).
- [ ] `src/entities/video/ui/exercise-demo-section.tsx` — byline do coach sai do overlay e vai para baixo do player; remove o selo duplicado do título.
- [ ] `src/features/workout/components/exercise-detail-sheet.tsx` — nova ordem dos blocos, `max-h-[85%]`, header fixo com prescrição, estado sem vídeo, rodapé contextual.
- [ ] `src/features/workout/screens/workout-preview-screen.tsx` — linha `Pressable`, chevron, dica de descoberta, estado do sheet, prefetch das demos do dia.

## Perguntas abertas (v2)

1. **Backend:** `instructions` respeita o contrato de prefixo `Erro comum:` / `Atenção:`? Sem prefixo o alerta simplesmente não existe — o cliente **não** vai inferir a partir de `riskFlags`.
2. **Backend:** `instructions` vem no payload da ficha (junto do plano) ou só no `GET /exercises/:id`? Precisa vir **na ficha** — é o que garante que o texto esteja em cache antes do subsolo.
3. **PO:** a prescrição no header do sheet mostra `RIR` sempre, ou só quando o plano define? (Hoje o seed sempre define.)

---
---

# Adendo v3 — modal de tela cheia (substitui o bottom sheet da v2)

> **Data:** 2026-08-25 · **Autor:** ux (mobile-ui-ux-designer) · **Status:** decidido pelo PO
> **Substitui:** §1 (sheet de meia tela), §4.2, §4.4 (container do preview), §V2-2 (container e dobra), §V2-3 (quem ganha a dobra), e todos os wireframes de sheet.
> **Mantém intacto:** §V2-0 (`instructions` + parser), §V2-1 (linha tocável da prévia), §V2-4 (passos numerados + alerta `warning`), §V2-5 (sem vídeo), §V2-6 (autoria do coach), §4.3 (estados de rede), §5 (coach), todo o anti-escopo.
> **Nota de tema (vale desde a v1):** o pedido fala em "dark-first", mas o design system real é **light-first** (`src/shared/theme/colors.ts`, `docs/02-design-spec.md`). Este modal segue os tokens que existem. As **únicas** superfícies escuras são o letterbox do player (preto por convenção de mídia) e o `contentStyle: "#0A0A0B"` que o `(workout)/_layout.tsx` já aplica ao stack de treino.

## Por que reverter a v2

O PO testou no simulador e decidiu. Razões dele, textuais:

> *"o aluno vai querer ver com calma o vídeo pra entender como fazer o movimento no treino"*
> *"pode ser um modal, mas que apareça na tela completo e não só em partes… pense em como trazer a melhor experiência pro usuário em UX, UI e performance, e o vídeo tem que aparecer no app, o usuário não tem que sair do app pra ver o vídeo"*

**A leitura correta do incômodo dele:** o problema do bottom sheet era ocupar **meia tela**, não ser modal. A natureza modal é o que faz a v1 ter razão sobre não perder o contexto do registro — contexto temporário, fecha e volta exatamente para onde estava. Então: **modal continua, meia tela morre.** É um modal de tela cheia, não uma página de navegação comum.

Três consequências que atravessam todo este adendo:

1. **Modal de tela cheia** (§V3-2) — muda o cabeçalho (`✕`, não `‹`), o gesto de fechar e o comportamento nos dois sistemas.
2. **Sair do app está proibido** (§V3-6) — o vídeo toca embutido, ponto. `Abrir no YouTube` **deixa de ser uma ação da interface** e vira último recurso de um caso raro. Dado novo do PO: dos 37 vídeos do catálogo, **36 permitem embed**; o erro que apareceu na tela era bug nosso de implementação. Logo, "vídeo indisponível" é exceção rara — e se desenha como exceção discreta, sem alarme.
3. **Performance é requisito de UX, não detalhe técnico** (§V3-7) — abrir sem engasgo, não recarregar o vídeo no scroll, não piscar a tela de trás.

O sintoma que ele viu é culpa do container, não da ordem dos blocos:

- O sheet tem `max-h-[85%]`, e desses 85% o header fixo, o handle e o rodapé comem mais uns 15%. Sobra ~60% de tela para **todo** o conteúdo. Um player 16:9 a 343pt de largura ocupa 193pt — num iPhone SE isso é 45% da área rolável do sheet. Com os passos antes dele, o player **nunca** aparece inteiro.
- "Ver com calma" e "espiar 40% do player" são jobs diferentes. A v2 otimizou a dobra para a consulta de 3 segundos e, ao fazer isso, tornou o estudo do movimento impossível — que é o job que o vídeo existe para servir.

**O que continua verdadeiro da v2 e o v3 respeita:** o vídeo é mudo, a rede da academia é ruim, e o texto do personal precisa estar legível a 0ms. Numa tela inteira esses dois requisitos **param de competir** — cabe header instantâneo + player + primeiros passos na mesma dobra. A v2 estava resolvendo uma escassez que a tela cheia elimina.

**O que o modal custa e a v1 tinha razão em temer:** empilhar sobre o logger arrisca perder o contexto do registro. Isso não é mais um argumento contra — é o **requisito nº 1 da implementação** (§V3-2). O native stack do `expo-router` mantém a tela anterior montada; quem quebrar isso com `replace`/remount quebra a feature inteira.

---

## V3-1. A dobra numa tela inteira: **o vídeo sobe, o texto não sai**

Reversão parcial e explícita do §V2-3. Lá o texto ganhou a dobra porque o player, no topo de um sheet, podia deixar a área mais nobre em shimmer e empurrar o conteúdo para fora. Na tela cheia o custo do player é **fixo, limitado e conhecido**: 193pt num slot 16:9 que nunca cresce — e ele **nunca fica vazio**, porque o poster entra antes do vídeo (§V3-7). O argumento de "shimmer na área mais nobre" morre com o poster; o argumento de "o texto precisa existir a 0ms" continua vivo e é atendido pelos blocos 1–3.

**Ordem do modal, de cima para baixo:**

| # | Bloco | Rola? | Por que aqui |
|---|---|---|---|
| 1 | **Header:** `✕` fechar + nome do exercício + slot de timer | **fixo** | Confirma que ele abriu o exercício certo e mantém o descanso à vista. Vem do cache, aparece a 0ms. |
| 2 | **Prescrição** (`4×8–10 · RIR 2`) | rola | 1 linha, `font-mono`, cache local. |
| 3 | **`HOJE`** (`PlanExercise.coachNote`), quando existe | rola | Regra do dia sobrescreve a regra do movimento (§3). Curta (≤280), offline, garante que o modal **nunca abre vazio**, mesmo antes de o vídeo chegar. É esta linha que herda a garantia de 0ms da v2. |
| 4 | **Player 16:9** | rola | O motivo do modal existir. Slot de altura fixa: reserva o espaço antes de carregar, então nada pula quando o vídeo chega. |
| 5 | **Byline do coach** (§V2-6) | rola | Colada no artefato que é dele. |
| 6 | **`OUTRAS DEMONSTRAÇÕES`** — só se `demos.length > 1` | rola | §V3-5. |
| 7 | **`EXECUÇÃO`** (`ExerciseDemo.coachNote`) | rola | Comentário daquele vídeo. Nunca fundida com `HOJE` (§3, inegociável). |
| 8 | **`COMO EXECUTAR`** — passos numerados + alerta | rola | Tratamento visual **idêntico** ao da v2 (§V2-4): índice `font-mono w-5`, alerta `warning` no fim, no máximo um. |
| 9 | **Detalhe** (músculo primário, secundários, equipamento) | rola | Referência. Sempre abaixo da dobra. |

**Orçamento vertical no pior caso (iPhone SE, 375×667, fonte padrão):**

```
safe area top                20
header fixo                  56
prescrição                   22
HOJE (card, 2 linhas)        68
player 16:9 (343 × 193)     193
byline                       28
──────────────────────────  387   → sobram ~280pt de área visível
EXECUÇÃO + COMO EXECUTAR    → rótulo + passos 1 e 2 legíveis sem scroll
```

Sem `HOJE` (caso comum), o passo 3 também entra. **O player aparece inteiro na dobra em todos os aparelhos-alvo** — que é exatamente o que o sheet não conseguia.

**Regras da dobra que o implementador não pode negociar:**

- O slot do player tem **altura reservada** (`aspect-[16/9]`, largura da tela menos o padding) desde o primeiro frame de render, **com o poster dentro** (§V3-7). Nada de o player nascer com altura 0 e empurrar os passos quando carrega — layout shift no meio da leitura é pior que espera.
- Com **font scaling `xxxLarge`**, o header e o `HOJE` crescem e o player desce. Está certo: o texto tem prioridade (mesma regra da v2). O player nunca escala com a fonte.
- **Autoplay:** mudo, em loop, pausa quando o player sai da viewport e volta quando entra. **Pausa nunca é desmontagem** (§V3-7). Reduce Motion → poster + botão play 56pt, sem loop.

---

## V3-2. Navegação: **modal de tela cheia**, saída barata, contexto intacto

### A rota

```
app/(workout)/exercise/[planExerciseId].tsx
  → src/features/workout/screens/exercise-detail-screen.tsx

<Stack.Screen
  name="exercise/[planExerciseId]"
  options={{ presentation: "fullScreenModal", animation: "slide_from_bottom", gestureEnabled: true }}
/>
```

Dentro do stack `(workout)` que já existe. `planExerciseId` é a chave certa (e não `exerciseId`): é ela que resolve prescrição, `coachNote` do dia e o índice da série ativa.

**`presentation: "fullScreenModal"`, não `"modal"`.** O `"modal"` do `react-native-screens` vira `pageSheet` no iOS: card com folga no topo, tela de trás aparecendo, cantos arredondados — ou seja, exatamente a meia-tela que o PO recusou, só que maior. `fullScreenModal` ocupa a tela inteira nos dois sistemas.

**Por que modal e não `push` comum, agora que é tela cheia:** a diferença é semântica e o aluno sente. Modal = tarefa temporária, entra de baixo, sai de baixo, volta para o mesmo lugar. `push` = você avançou na hierarquia, e o `‹` sugere que existe um caminho adiante. O aluno mid-set não está navegando, está consultando. A entrada vertical também é o que preserva a memória do sheet da v1/v2 — mesma direção, mesmo gesto de saída, só que inteira.

**Comportamento por sistema:**

| | iOS | Android |
|---|---|---|
| Entrada | slide de baixo, nativo | slide de baixo, nativo |
| Fechar explícito | `✕` no topo **esquerdo** (convenção HIG de modal) | `✕` no topo esquerdo (mesma posição — consistência de marca vale mais que espelhar o `✕` à direita do Material aqui, e a barra é idêntica nos dois) |
| Fechar por gesto | **swipe-down** (custom, ver abaixo) — `fullScreenModal` não traz o edge-swipe do stack | back de sistema + **gesto preditivo** fazem dismiss, sem interceptação |
| Barra de status | conteúdo sob a safe area; `StatusBar` clara sobre o header claro | edge-to-edge, insets aplicados |

**O `✕` está no topo, e o topo não é alcançável com o polegar.** A v1 tinha razão nisso. Por isso ele **não é a única saída**:

- **`✕`** 44×44 com `hitSlop`, `accessibilityLabel="Fechar"`. Garantido, sempre lá.
- **Swipe-down para fechar** — ativo **só quando o scroll está no topo** (`scrollY <= 0`), padrão de visualizador de mídia que todo aluno já usa no Instagram/Fotos. `react-native-gesture-handler` Pan simultâneo com o `ScrollView`, `translateY` acompanhando o dedo em worklet Reanimated (UI thread, sem `setState`), sem scale e sem fade. Passou de 120pt ou de 800pt/s de velocidade → `runOnJS(router.back)` e a animação nativa de dismiss termina o movimento; abaixo disso, `withSpring` de volta ao lugar. **Se o gesto brigar com a transição nativa, ele é cortado — o `✕` e o back do Android são as saídas garantidas.**
- **Android:** back de sistema e preditivo fecham. Sem confirmação, sem `Alert`, sem "tem certeza". Prender o back é quebra de confiança de plataforma.

`gestureEnabled: true` nesta `Stack.Screen` sobrescreve o `gestureEnabled: false` do `(workout)/_layout.tsx`. O default do layout está certo para `preview`/`logger`/`summary` (não se sai de um treino em andamento por acidente) e **errado para um modal de conteúdo**.

### O que NÃO pode acontecer na saída

O native stack mantém `logger` montado por baixo. Portanto, e isto é a razão de a v1 ter medo de sair do sheet:

- **Proibido `router.replace` / `router.dismissAll` para fechar.** Só `router.back()`.
- Ao fechar, o logger tem **o mesmo scroll, a mesma série ativa, o mesmo rascunho de peso/reps e o mesmo timer**. Se algum remount for observado, o bug é do wiring, não da decisão — não se conserta com "salvar e restaurar estado".
- **A tela de trás não pisca** ao abrir nem ao fechar (§V3-7). Nada de `setState` no logger no momento do `push`.
- O `WorkoutPreview` idem: volta com o scroll intacto.

### O cronômetro de descanso

Hoje `useRestTimer` é `useState` + `setInterval` **dentro do componente do logger**. Com o modal empilhado o logger continua montado, então o timer não pausa por acidente — mas o modal **não consegue lê-lo**. Duas mudanças, ambas na raiz:

1. **Subir o timer para um store** — `src/features/workout/store-rest-timer.ts` (Zustand). Um único intervalo, dono do estado, fora da árvore de qualquer tela. `use-rest-timer.ts` vira um seletor fino, e o logger não muda de forma.
2. **Passar a contar por relógio de parede** (`endsAt: number` em epoch ms; `remaining = max(0, endsAt - Date.now())`), não por decremento. O motivo é justamente esta feature: o aluno vai abrir o modal, ver o vídeo, **bloquear a tela ou atender uma ligação** — e timer JS é estrangulado em background nos dois sistemas. Decremento por `setInterval` mente sobre quanto descanso passou, e o descanso é dado de treino. Consertar só o "subir para o store" deixaria a mentira de pé.

Regras de comportamento, herdadas da v1 e mantidas:

- **O timer nunca pausa** ao abrir o modal. Nunca.
- Ele aparece no header do modal, à direita, `font-mono`, mesmo formato do `rest-timer-bar`. Ao zerar: texto vira `DESCANSO ACABOU` em `text-warning` e **um** háptico (`haptics.pr()`), disparado pelo store, **exatamente uma vez**, não importa quantas telas estejam montadas.
- **Sem `−15s` / `+15s` / `pular` no modal.** Esses controles moram no logger. Duplicá-los cria duas fontes de verdade para "onde eu mexo no descanso" e dobra a superfície de erro com o dedo suado.
- **O tique de 1Hz não pode re-renderizar a tela.** Só o `Text` do contador assina o store (§V3-7). Re-render da árvore inteira a cada segundo derrubaria o player num Pixel 6a.

### O CTA `REGISTRAR SÉRIE` num modal de tela cheia

- Vive numa **barra fixa no rodapé do modal**, acima do home indicator (`useSafeAreaInsets().bottom`, nunca `34` na mão). Só existe no contexto logger, e só **quando o descanso ≤ 0** — igual à v2. Entra com `SlideInDown` 200ms (`FadeIn` sob Reduce Motion).
- **Tocar nele fecha o modal e abre o teclado numérico no logger** — não empilha o `NumericKeypadSheet` sobre o vídeo. Motivo: empilhar sheet sobre modal de tela cheia obriga a desmontar duas camadas na confirmação, e deixa o aluno olhando um vídeo depois de registrar a série. O lugar de registrar é a tela onde a tabela de séries está — ver a linha preencher **é** a confirmação. Um toque, um destino.
- Mecanismo: `router.back()` + um campo `pendingAction: { type: "openKeypad"; planExerciseId; setIndex } | null` no store da sessão, consumido pelo logger no `useFocusEffect` e limpo em seguida. Sem params de navegação, sem event emitter.
- **Ele NÃO fecha o modal sozinho quando o descanso zera.** Fechar por conta própria é roubar a tela — mesma regra do anti-escopo da v1. O aluno recebe o háptico, vê `DESCANSO ACABOU` e o CTA aparecer. Ele decide se termina o vídeo.

**Evento a instrumentar:** `demo_registered_from_modal { exerciseId, restOverrunSeconds }` — é o número que diz se o modal virou um desvio do registro ou um atalho de volta para ele.

---

## V3-3. Os dois momentos: mesmo modal, três diferenças

Mesma ordem de blocos nos dois contextos, pelo mesmo motivo da §V2-2: o aluno do sofá no domingo e o aluno em pé na terça são a mesma pessoa, e a memória de onde fica cada coisa é o que faz a consulta mid-set custar 3 segundos.

O contexto **não vem por parâmetro de rota** (parâmetro mente quando o app é reaberto por deep link). Ele é derivado do store: `useActiveSessionStore.session !== null`. Sem sessão ativa → contexto prévia.

| | aberto da **prévia** | aberto do **logger** |
|---|---|---|
| Header, lado direito | nada — só o título ocupa a linha | `DESCANSO 01:31` correndo · `DESCANSO ACABOU` em `warning` no zero |
| Rodapé | **não existe.** O conteúdo só termina. Sem "Entendi", sem "Fechar", sem botão de consolação | barra com `✓ REGISTRAR SÉRIE N`, só quando descanso ≤ 0 |
| Label do `✕` | `"Fechar"` | `"Fechar e voltar ao treino"` |
| Rede esperada | quente — a prévia já fez `prefetchQuery` + `expo-image.prefetch` (regra da v1, sobrevive) | pode estar fria → poster estático enquanto o vídeo chega é o caminho normal, não a exceção |

**Nada mais muda.** Sem timer, o header não mostra `00:00`, não mostra placeholder, não reserva o espaço — a linha do título simplesmente usa a largura toda. Meia UI cinza esperando um estado que não vai existir é pior que ausência.

---

## V3-4. Tela cheia e rotação: **fullscreen sim, rotação não (ainda)**

O app é `orientation: "portrait"` em `app.json`. A decisão se divide em duas coisas que costumam ser confundidas:

**Fullscreen em retrato — entra na fatia 1.** Botão 44×44 no canto inferior direito do player, ao lado do mute (≥8pt entre eles), ícone `expand`, `accessibilityLabel="Ver em tela cheia"`. Para `kind === "file"`, é o fullscreen nativo do `VideoView` (`expo-video`, já instalado). Custo: um prop e um botão. Ganho: o player sai de 193pt e ocupa a tela toda — que é 80% do que o PO pediu com "ver com calma", **e continua dentro do app**.

**Rotação para paisagem — Fase 2, e o custo é o motivo.** Fazer o vídeo girar de verdade exige destravar a orientação no nível do app/activity, e isso não é um botão:

- Nova dependência (`expo-screen-orientation`, não instalada) + config plugin + dev build.
- iOS: liberar landscape no `Info.plist` passa a permitir que **qualquer** tela gire; todas precisam de auditoria de safe area e layout.
- Android: mudança de orientação é *configuration change*. Com o logger montado por baixo e uma sessão de treino em andamento, o risco é exatamente o que estamos protegendo — remount e perda do rascunho da série.
- Trocar o risco de perder o registro do treino por uma comodidade de visualização é o pior negócio disponível nesta feature.

**E não existe escape hatch fora do app.** A v3 anterior sugeria mandar quem quer paisagem para o app do YouTube; o PO cortou isso (§V3-6). Quem quiser paisagem na fatia 1 gira o pescoço; na Fase 2 a gente gira a tela direito. Fullscreen em retrato já resolve o "ver com calma" que motivou a mudança — paisagem é conforto, não requisito.

**Anti-escopo reafirmado:** sem PiP, sem scrub, sem velocidade de reprodução, sem frame a frame, sem gesto de pinch no player.

---

## V3-5. Múltiplas demos: **seletor de thumbs, não abas, não carrossel de players**

Os chips de `OUTRAS DEMONSTRAÇÕES` da v1 sobrevivem, promovidos para logo abaixo do player. **Um player só na tela, sempre.**

- **Renderiza só quando `demos.length > 1`.** Com uma demo, não existe rótulo, não existe faixa, não existe espaço reservado.
- Faixa horizontal, thumbs 96×56 (`expo-image`, `contentFit="cover"`, alvo total ≥44pt de altura com o rótulo), rótulo curto sob cada uma (`Marcos` / `Catálogo`).
- Selecionada: borda 2pt `forest-500` **+ ícone de check 12pt** no canto — cor nunca sozinha (`docs/11` §2) — e `accessibilityState={{ selected: true }}`.
- Tocar troca **a fonte do player no lugar**: mesma posição de scroll, reinicia mudo em loop, e troca junto a **byline** e a nota `EXECUÇÃO`. Não navega, não rola a tela sozinha.
- **Ordem é a que o backend mandou** (coach primeiro). Zero reordenação no cliente — regra da v1, intacta.
- **Só a demo selecionada carrega vídeo.** As outras são thumbnails. Nada de pré-carregar N streams no 4G da academia.

**Por que não abas:** aba promete seções paralelas de peso igual; estas são ranqueadas, e o vídeo do personal é o produto. Aba ainda custa ~48pt permanentes de segmented control brigando com o header.

**Por que não carrossel de players com swipe:** obriga a montar vários players (contra §V3-7), deixa ambíguo qual está tocando, e o swipe horizontal briga com o pan vertical de fechar.

**Por que não lista vertical de players:** N players = N streams = a rede da academia morre e o aluno rola procurando qual olhar.

---

## V3-6. Quando o vídeo falha: **exceção rara, tratada em voz baixa**

**Dado do PO que muda o peso desta seção:** dos 37 vídeos do catálogo, **36 permitem embed**. Nenhum recusa. O retângulo com erro em inglês que apareceu no simulador era **bug nosso de implementação**, já em correção — não era o YouTube nos barrando.

Consequência de desenho: a falha **não é a regra, é a exceção**. A v1 e a v3-preliminar desenharam esta seção como se metade dos vídeos fossem quebrar, e o resultado foi uma interface defensiva — botão de escape permanente ao lado do player, mensagens grandes, caixas de alerta. Isso ensina o aluno a desconfiar de um player que funciona 97% das vezes. **Erro raro se trata em voz baixa.**

A regra que amarra todos os casos continua sendo a da v1, agora mais forte porque há mais texto: **o vídeo pode falhar, a palavra do personal não pode.** `HOJE`, `COMO EXECUTAR`, o alerta e a byline renderizam idênticos em todos os estados de falha. A tela tem que **parecer terminada**, não quebrada.

### O aluno não sai do app

Regra do PO, sem exceção de conveniência: **o vídeo toca embutido.** Portanto:

- **Não existe `↗ Assistir no YouTube` no caminho feliz.** A v3-preliminar propunha isso para "não parecer defeito quando falhar"; está revogado. Um link permanente para fora é um convite a abandonar o app no meio do treino, com o descanso correndo — e mandar o aluno para o feed de recomendações do YouTube durante a série é a pior coisa que essa tela pode fazer com a retenção.
- **Não existe botão de compartilhar, abrir no navegador, ou "ver no app do YouTube".**
- Sair do app é **último recurso de um caso raro**, e só aparece **dentro** do bloco de falha, quando aquele vídeo específico recusar reprodução embutida. Nunca ao lado de um player que está tocando.
- Fullscreen em retrato (§V3-4) é a resposta para "quero ver maior" — dentro do app.

**Proibições explícitas:** retângulo preto vazio · mensagem em inglês · código de erro · nome de biblioteca · `Alert` nativo · toast · spinner infinito · botão desabilitado fantasma.

**Proibições explícitas:** retângulo preto vazio · mensagem em inglês · código de erro · nome de biblioteca · `Alert` nativo · toast · spinner infinito · botão desabilitado fantasma · ícone de alerta grande · fundo vermelho.

**Forma do slot na falha:**

- **Com poster** (o caso normal — a prévia fez prefetch, `expo-image` com `cachePolicy="memory-disk"`): mantém o 16:9, poster com scrim escuro e **uma linha** de texto centralizada por cima. Continua parecendo vídeo, só que parado. Sem ícone, sem caixa, sem borda.
- **Sem poster:** o slot **encolhe** para um bloco de 2 linhas em `bg-bg-sunken`, `rounded-xl`, `p-4`. Caixa 16:9 cinza e vazia é o sinal universal de "quebrou".

**Copy por caso, em pt-BR, sem jargão, sem ponto de exclamação:**

| Caso | Texto | Ação |
|---|---|---|
| `unavailable/processing` | `O vídeo do seu personal ainda está sendo preparado.` | cai automaticamente para a próxima demo da lista, se houver (regra da v1) |
| `unavailable/removed \| error \| storage_unavailable` | `Este vídeo não está disponível agora.` | nenhuma |
| offline | `Sem conexão. O vídeo volta quando a rede voltar.` | `Tentar de novo`, botão `variant="ghost"` |
| lento (>8s sem 1º frame) | `A rede está lenta.` — sobre o poster, que já está lá | `Tentar de novo`, `ghost` |
| **embed recusado** (raro: 1 em 37) | `Este vídeo não abre aqui.` | `Assistir no YouTube ↗`, `variant="ghost"`, **dentro do slot**, `text-xs` — nunca fora dele, nunca no caminho feliz |
| sem demo nenhuma | `Sem vídeo para este exercício.` — 1 linha, `text-xs text-text-tertiary`, sem card, sem ícone | nenhuma (§V2-5, intacta) |
| URL assinada expirada (403/404) | nada aparece na primeira vez | invalida a query e refaz **uma** vez antes de mostrar erro (regra da v1) |

**Detecção do embed recusado:** `react-native-webview` não dispara `onError`/`onHttpError` para bloqueio dentro do iframe. Sem sinal confiável, o proxy é o mesmo timeout de 8s do caso "rede lenta" — **um código só cobre os dois**, e a diferença fica na copy secundária: se há conexão e o timeout estourou em `kind === "youtube"`, mostra `Tentar de novo` **e**, só depois de o retry também falhar, o `Assistir no YouTube ↗`. Escalonar assim garante que o botão de sair do app só apareça quando realmente não há alternativa.

`Linking.openURL(playback.watchUrl)` · evento `demo_youtube_fallback_opened { exerciseId }` — se esse número passar de ~1% das aberturas, é bug nosso, não bloqueio do YouTube. É o alarme de regressão desta feature.

---

## V3-7. Performance como requisito de UX

O PO pediu performance explicitamente. Aqui ela vira decisão de desenho, não nota de rodapé. Alvo: **Pixel 6a**, não iPhone 16 Pro.

### 1. Abrir sem engasgo: o poster entra antes do player

**O slot 16:9 nasce com o poster dentro, não vazio.** `expo-image` com `source={playback.thumbnailUrl}`, `contentFit="cover"`, `cachePolicy="memory-disk"`, `transition={0}` — a imagem já está no disco porque a prévia fez `expo-image.prefetch` (regra da v1). O player monta **por cima** e faz `FadeIn` de 150ms no primeiro frame.

Efeito para o aluno: nos primeiros ~300ms ele vê o que parece um vídeo pausado, não um buraco. O tempo de "primeira informação útil" no bloco do vídeo é **0ms**, igual ao do texto.

**O player não monta durante a transição de abertura.** Montar um `VideoView`/`WebView` no mesmo frame em que o modal desliza de baixo é o que produz o engasgo — é trabalho nativo pesado competindo com a animação. Regra: montar o player **depois** da transição (`InteractionManager.runAfterInteractions()`), com o poster segurando o layout. A animação de entrada fica em 60fps porque durante ela só existe uma imagem em cache na tela.

### 2. O vídeo não recarrega quando o aluno rola

- **A instância do player é criada uma vez** (`useVideoPlayer` com dependências estáveis) e **nunca** é recriada por scroll, por re-render do header, nem pelo tique do timer.
- A regra de visibilidade só chama `play()` / `pause()`. **Pausar nunca é desmontar.** Renderização condicional do player em função do scroll está proibida — é exatamente o bug que faz o vídeo voltar ao início toda vez que o aluno sobe para reler o passo 2.
- O scroll é lido com `useAnimatedScrollHandler` (Reanimated, UI thread). `runOnJS` dispara **só quando o booleano de visibilidade vira**, não a cada frame.
- Trocar de demo na faixa (§V3-5) troca a **fonte** do player existente (`player.replaceAsync(...)`), não o componente.

### 3. A tela de trás não pisca

- `fullScreenModal` mantém o logger montado por baixo; **nenhum `setState` no logger** no momento do `push`, e nenhum `key` que mude.
- **O tique de 1Hz do descanso re-renderiza só o `Text` do contador.** Seletor Zustand estreito (`useRestTimerStore(s => s.remainingSeconds)`) dentro de um componente `RestCountdown` isolado — nem o modal, nem o player, nem a lista de passos assinam esse valor. Sem isso, o app re-renderiza a árvore inteira uma vez por segundo com um vídeo tocando, e o Pixel 6a cai para ~30fps.
- O CTA de registrar assina só `remainingSeconds <= 0` (booleano derivado), não o número.

### 4. Nada de peso desnecessário na árvore

- Container é `ScrollView` simples. O conteúdo é limitado (≤5 passos, 1 player, ≤4 thumbs) — `FlashList` aqui é overhead sem retorno.
- **Um player montado por vez, sempre** (§V3-5). As outras demos são thumbnails.
- Blocos estáticos (`ExerciseInstructions`, detalhe do exercício, byline) em `React.memo` — eles não têm motivo para re-renderizar e são o grosso da árvore.
- Sem `Modal` do RN, sem biblioteca de sheet nova, sem `BlurView`: o modal é a rota nativa, e o custo de composição é zero.
- Dados vêm do cache do TanStack Query já aquecido pela prévia (`staleTime` 24h). **Nenhum spinner de carregamento na abertura** — se a query estiver fria, o que aparece é o texto (que vem do payload da ficha) e o poster; nunca uma tela em branco.

**Orçamento aceito:** abertura do modal ≤ 300ms até o conteúdo estático estar na tela, primeiro frame de vídeo ≤ 1,5s no Wi-Fi, zero layout shift depois do primeiro paint.

---

## Wireframes — modal de tela cheia

```
A) COM VÍDEO · contexto PRÉVIA (sentado, Wi-Fi)
┌─────────────────────────────────────────────┐
│ ▔▔▔▔▔ safe area (useSafeAreaInsets.top) ▔▔▔ │  modal entra deslizando de
│  ✕   Puxada frontal                         │ ← baixo, ocupa a tela INTEIRA
│      ✕ = 44×44 · label "Fechar"             │   header FIXO 56pt, sem timer
├─────────────────────────────────────────────┤ ← borda subtle, o resto rola
│  ⌄ swipe-down fecha (só com scroll no topo) │   saída alcançável pelo polegar
│  4×8–10 · RIR 2                             │ ← font-mono, text-secondary
│                                             │
│  HOJE                                       │ ← Text variant="label"
│  ┌───────────────────────────────────────┐  │   Card variant="accent"
│  │ Hoje segura 2 segundos embaixo.       │  │   0ms, vem do cache
│  └───────────────────────────────────────┘  │
│                                             │
│ ███████████████████████████████████████████ │ ┐
│ █                                         █ │ │ slot 16:9 de ALTURA
│ █      [ vídeo mudo, em loop ]            █ │ │ RESERVADA (aspect-[16/9])
│ █   (poster em cache aparece a 0ms; o     █ │ │ 343 × 193 no SE
│ █    player monta por cima após a         █ │ │ nunca retângulo vazio
│ █    transição e faz FadeIn 150ms)        █ │ │
│ █                          [ 🔇 ] [ ⛶ ]  █ │ │ 44×44 cada, gap 8pt
│ ███████████████████████████████████████████ │ ┘ ⛶ = tela cheia DENTRO do app
│ ░░░░░░░░ progresso, só leitura ░░░░░░░░░░░░ │
│  (@) Marcos · seu personal                  │ ← byline, avatar 20pt (§V2-6)
│                                             │   SEM link para o YouTube aqui
│ ─ ─ ─ ─ ─ dobra do iPhone SE ─ ─ ─ ─ ─ ─ ─  │
│                                             │
│  OUTRAS DEMONSTRAÇÕES                       │ ← só se demos.length > 1
│  ┌────────┐ ┌────────┐                      │   selecionada: borda 2pt
│  │▓▓ ✓(@) │ │▓▓      │                      │   forest + check (nunca só cor)
│  │ Marcos │ │Catálogo│                      │
│  └────────┘ └────────┘                      │
│                                             │
│  EXECUÇÃO                                   │
│  Cotovelo desce colado ao corpo, não abre.  │
│                                             │
│  COMO EXECUTAR                              │ ← tratamento idêntico ao §V2-4
│   1  Sente com as coxas travadas sob o      │   índice font-mono w-5
│      apoio, pés firmes no chão.             │
│   2  Pegada pronada, um pouco mais aberta   │
│      que os ombros.                         │
│   3  Puxe a barra até a clavícula levando   │
│      os cotovelos para baixo e para trás.   │
│   4  Volte controlado até estender os       │
│      cotovelos sem soltar os ombros.        │
│  ┃┌──────────────────────────────────────┐  │ ← borda esq. 3pt warning
│  ┃│ ⚠ ERRO COMUM                         │  │   bg-warning-muted
│  ┃│ Não jogue o tronco para trás para    │  │   nunca error/vermelho
│  ┃│ subir a carga.                       │  │
│  ┃└──────────────────────────────────────┘  │
│                                             │
│  Músculo primário · Dorsal                  │
│  Secundários · Bíceps, Deltoide posterior   │
│  Equipamento · Cabo / polia                 │
│                                             │
│  (rodapé não existe neste contexto)         │
└─────────────────────────────────────────────┘


B) ABERTO DURANTE A SÉRIE · contexto LOGGER, descanso correndo
┌─────────────────────────────────────────────┐
│  ✕   Puxada frontal        DESCANSO 01:31   │ ← header FIXO
│      "Fechar e voltar      font-mono, vivo  │   timer NUNCA pausa · só este
│       ao treino"                            │   Text assina o store (1Hz)
├─────────────────────────────────────────────┤
│  4×8–10 · RIR 2 · série 3 de 4              │
│  HOJE  ┌────────────────────────────────┐   │
│        │ Hoje segura 2 segundos embaixo.│   │
│        └────────────────────────────────┘   │
│ ███████████████████████████████████████████ │
│ █      [ vídeo mudo, em loop ]            █ │
│ █                          [ 🔇 ] [ ⛶ ]  █ │
│ ███████████████████████████████████████████ │
│  (@) Marcos · seu personal                  │
│ ─ ─ ─ ─ ─ dobra ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  COMO EXECUTAR                              │
│   1  Sente com as coxas travadas...         │
│      (conteúdo idêntico ao contexto prévia) │
└─────────────────────────────────────────────┘

     ▼ descanso chega a 00:00 (o modal NÃO fecha sozinho)

┌─────────────────────────────────────────────┐
│  ✕   Puxada frontal      DESCANSO ACABOU    │ ← text-warning + 1 háptico
├─────────────────────────────────────────────┤   disparado pelo store, 1× só
│  ... conteúdo continua onde ele estava ...  │
│      o vídeo continua tocando               │
├─────────────────────────────────────────────┤
│  [        ✓ REGISTRAR SÉRIE 3            ]  │ ← barra fixa, SlideInDown 200ms
│ ▁▁▁ safe area bottom (home indicator) ▁▁▁▁▁ │   toque → fecha o modal e o
└─────────────────────────────────────────────┘   teclado abre NO LOGGER


C) SEM VÍDEO (exercício customizado do personal — o caso majoritário)
┌─────────────────────────────────────────────┐
│  ✕   Crucifixo na polia    DESCANSO 02:04   │
├─────────────────────────────────────────────┤
│  3×12–15 · RIR 1                            │
│                                             │
│  HOJE                                       │
│  ┌───────────────────────────────────────┐  │
│  │ Foca na contração, carga é secundária.│  │
│  └───────────────────────────────────────┘  │
│                                             │
│   1  Ajuste as polias na altura dos ombros  │ ← §V2-5: sem rótulo COMO
│      e dê um passo à frente.                │   EXECUTAR (não há vídeo do
│   2  Cotovelos levemente flexionados e      │   que se diferenciar)
│      travados nessa angulação.              │
│   3  Junte as mãos à frente do peito sem    │
│      subir os ombros.                       │
│  ┃┌──────────────────────────────────────┐  │
│  ┃│ ⚠ ERRO COMUM                         │  │
│  ┃│ Não transforme em supino dobrando os │  │
│  ┃│ cotovelos no meio do movimento.      │  │
│  ┃└──────────────────────────────────────┘  │
│                                             │
│  (@) Orientação de Marcos, seu personal     │ ← só se ownerCoachId !== null
│                                             │
│  Sem vídeo para este exercício.             │ ← 1 linha, text-xs, tertiary
│ ─ ─ ─ ─ ─ dobra ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │   SEM caixa 16:9, sem ícone,
│  Músculo primário · Peitoral                │   sem play cinza, sem CTA
│  Secundários · Deltoide anterior            │
│  Equipamento · Cabo / polia                 │
└─────────────────────────────────────────────┘


D) VÍDEO INDISPONÍVEL — exceção rara (1 em 37), tratada em voz baixa
┌─────────────────────────────────────────────┐
│  ✕   Supino inclinado      DESCANSO 01:12   │
├─────────────────────────────────────────────┤
│  3×8–12 · RIR 2                             │
│                                             │
│  HOJE  ┌────────────────────────────────┐   │ ← o texto NUNCA some
│        │ Hoje segura 2 segundos embaixo.│   │
│        └────────────────────────────────┘   │
│                                             │
│ ▓▓▓▓▓▓▓ poster em cache + scrim ▓▓▓▓▓▓▓▓▓▓▓ │ ← mantém 16:9, parece vídeo
│ ▓                                         ▓ │   parado, não vídeo quebrado
│ ▓      Este vídeo não abre aqui.          ▓ │   1 linha, pt-BR, sem ícone,
│ ▓      Assistir no YouTube ↗              ▓ │   sem caixa, sem código de erro
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│  (@) Marcos · seu personal                  │ ← autoria sobrevive à falha
│ ─ ─ ─ ─ ─ dobra ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │   (é no erro que ela importa)
│  COMO EXECUTAR                              │
│   1  Deite no banco inclinado a 30°...      │ ← tela inteira, não quebrada
└─────────────────────────────────────────────┘
   O "Assistir no YouTube ↗" só existe AQUI, ghost, text-xs, dentro do slot,
   e só depois de o Tentar de novo falhar. Nunca ao lado de um player que toca.

   SEM poster (offline frio) → o slot ENCOLHE, não fica cinza 16:9:
   ┌───────────────────────────────────────┐
   │ Sem conexão. O vídeo volta quando a   │   bg-bg-sunken, rounded-xl, p-4
   │ rede voltar.   [ Tentar de novo ]     │   2 linhas, sem caixa 16:9 vazia
   └───────────────────────────────────────┘
```

---

## Acessibilidade (v3 — o que é novo por ser modal de tela cheia)

Vale tudo da §Acessibilidade da v1 e da v2. Muda o que decorre do container:

- **É modal:** `accessibilityViewIsModal` no container (iOS) e `importantForAccessibility="no-hide-descendants"` na tela de trás (Android) — o leitor de tela não pode vazar para o logger por baixo. Ao abrir, o foco vai para o **título do exercício**, não para o `✕`.
- **`✕`:** `accessibilityRole="button"`, label contextual (`"Fechar"` na prévia / `"Fechar e voltar ao treino"` no logger), 44×44 com `hitSlop` — nunca só o glifo.
- **O swipe-down não é a única saída acessível.** VoiceOver/TalkBack usam o `✕` e o gesto de "voltar" de duas dedos / back do sistema. O gesto custom nunca pode ser requisito para sair.
- **Timer no header:** `accessibilityLiveRegion="none"` durante a contagem (anunciar cada segundo é tortura) e **um único anúncio** no zero: `AccessibilityInfo.announceForAccessibility("Descanso terminou")`. Ao abrir com o descanso correndo, o label do header inclui `"descanso, 1 minuto e 31 segundos restantes"` — dito uma vez.
- **CTA de registrar:** ao entrar, `accessibilityLabel="Registrar série 3"` + o foco **não** é roubado. Ele aparece, não sequestra.
- **Botão de fullscreen:** `accessibilityLabel="Ver em tela cheia"`; sair do fullscreen devolve o foco ao player.
- **Faixa de demos:** container `accessibilityRole="tablist"` não se aplica (não são abas) — cada thumb é `accessibilityRole="button"` com `accessibilityState={{ selected }}` e label `"Demonstração de Marcos, seu personal"` / `"Demonstração do catálogo"`.
- **Link do YouTube (só no bloco de falha):** `accessibilityRole="link"`, label `"Assistir no YouTube, abre outro aplicativo"` — avisar que sai do app é obrigatório, e é mais um motivo para ele não existir no caminho feliz.
- **Estados de falha:** a mensagem é texto real na árvore, com `accessibilityRole="text"`. Nunca só um ícone, nunca só cor.
- **Poster antes do player:** enquanto só o poster está na tela, o slot já expõe o `accessibilityLabel` final (título + primeiro passo, §V2-4) — o leitor de tela não passa por um estado sem nome.
- **Alvos:** `✕`, mute, fullscreen, cada thumb, `Tentar de novo` e o CTA ≥44×44pt, ≥8pt entre alvos adjacentes — mute e fullscreen lado a lado exigem atenção especial no canto do player.
- **Safe areas:** `useSafeAreaInsets()` no topo (Dynamic Island) e na base (home indicator + barra de gestos do Android). Nenhum `44`/`34`/`20` cravado. Em `fullScreenModal` o inset do topo **não** vem de graça — é o modal que aplica.

---

## Anti-escopo (v3 — o que o modal NÃO ganha por ocupar a tela toda)

Tudo o que já estava fora continua fora. O risco de uma tela inteira é ela pedir enfeite; ela não ganha nada disso:

- **Qualquer caminho para fora do app no caminho feliz** — link para o YouTube, compartilhar, abrir no navegador. O vídeo toca embutido (§V3-6). Único caso tolerado: o bloco de falha do embed, depois do retry.
- **Fechar sozinho quando o descanso zera.** Navegação automática é roubar a tela.
- **Empilhar o `NumericKeypadSheet` sobre este modal.** Registrar acontece no logger.
- **Duplicar `−15s` / `+15s` / `pular` aqui.**
- **`presentation: "modal"` (pageSheet no iOS)** — é a meia tela que o PO recusou.
- **Rotação / destravar orientação do app** (§V3-4) · PiP · scrub · velocidade · frame a frame · pinch no player.
- **Abas, carrossel de players, ou mais de um player montado** (§V3-5).
- **Pré-carregar todas as demos** — só a selecionada.
- **Desmontar/remontar o player em função do scroll** (§V3-7). Pausa é pausa.
- **Tab bar, header colapsável com large title, ou qualquer chrome de navegação extra.** É um modal, não uma seção do app.
- **"Próximo exercício" / "anterior" aqui.** Navegar exercício é job do logger; aqui viraria uma segunda navegação concorrente e o aluno perde de onde veio.
- **Botão "Entendi" / "Fechar" no rodapé no contexto prévia.** Rodapé vazio é rodapé honesto; o `✕` e o swipe já resolvem.
- **Scrim, blur ou tela de trás visível.** Tela cheia é tela cheia.
- **Contador, streak, badge, "você já viu 12 demos", comparação entre alunos.** Segue anti-escopo do produto (§4 da v1).
- **Comentar, curtir, salvar, compartilhar a demo.**
- **Download offline** — Fase 2, sem mudança.

---

## Critérios de aceite (v3)

**Container e navegação**

- [ ] O detalhe do exercício é a rota `app/(workout)/exercise/[planExerciseId].tsx` com `presentation: "fullScreenModal"`; nenhum `ExerciseDetailSheet` é renderizado em `workout-preview-screen` nem em `workout-logger-screen`.
- [ ] O modal ocupa a **tela inteira** nos dois sistemas — nenhuma faixa da tela de trás aparece, nenhum canto arredondado de `pageSheet`, nenhum scrim.
- [ ] `gestureEnabled: true` só nesta `Stack.Screen`; `preview`/`logger`/`summary` continuam com o gesto travado.
- [ ] `✕` (topo esquerdo), swipe-down com o scroll no topo, e back de sistema/preditivo (Android) fazem a mesma coisa: `router.back()`, sem confirmação e sem interceptação.
- [ ] O swipe-down **não** dispara quando o aluno já rolou a tela; o `ScrollView` continua rolando normalmente.
- [ ] Fechar devolve o logger com **scroll, série ativa, rascunho de peso/reps e timer idênticos**; nenhum `router.replace`/`dismissAll` no caminho; teste cobrindo que o logger não remonta.

**Timer e CTA**

- [ ] O rest timer vive em `store-rest-timer.ts`, calcula por `endsAt` (relógio de parede) e **não pausa** ao abrir o modal; teste do caso "app em background por 40s" com o restante correto na volta.
- [ ] O háptico de fim de descanso dispara **exatamente uma vez**, mesmo com logger e modal montados ao mesmo tempo.
- [ ] O header mostra o descanso correndo no contexto logger e **nada** no contexto prévia (sem `00:00`, sem placeholder).
- [ ] Com descanso ≤ 0 no contexto logger, a barra `✓ REGISTRAR SÉRIE N` entra; tocar nela fecha o modal e abre o `NumericKeypadSheet` no logger, na série certa.
- [ ] O modal **nunca** fecha sozinho ao zerar o descanso.

**Layout e conteúdo**

- [ ] Ao abrir, em iPhone SE: header, prescrição, `HOJE` (quando existe) e o **player 16:9 inteiro** estão visíveis sem scroll; o slot tem altura reservada e nada pula de posição quando o vídeo carrega.
- [ ] Com `xxxLarge`, nada corta: o texto empurra o player para baixo e o player não escala.
- [ ] `demos.length === 1` → nenhum rótulo `OUTRAS DEMONSTRAÇÕES`, nenhum espaço reservado. `> 1` → faixa de thumbs, um player só montado, seleção com borda **e** check, troca no lugar sem mexer no scroll.
- [ ] Fullscreen funciona em retrato via player nativo, **dentro do app**; `orientation: "portrait"` intacto e nenhuma dependência de orientação adicionada.

**Vídeo embutido e falhas**

- [ ] **Nenhum caminho para fora do app** em nenhuma superfície do caminho feliz: sem link do YouTube ao lado do player, sem compartilhar, sem abrir no navegador.
- [ ] `Assistir no YouTube ↗` só existe dentro do bloco de falha de embed, em `ghost`, e só depois de o `Tentar de novo` falhar.
- [ ] Nenhum estado de falha mostra retângulo preto vazio, texto em inglês, código de erro, ícone de alerta grande, `Alert` ou toast; sem poster o slot encolhe em vez de virar caixa 16:9 cinza.
- [ ] Em qualquer falha de vídeo, `HOJE`, `COMO EXECUTAR`, o alerta e a byline continuam renderizados e legíveis.

**Performance (§V3-7)**

- [ ] O slot do player mostra o **poster** desde o primeiro frame de render; nunca existe um retângulo vazio ou preto antes do vídeo.
- [ ] O player só monta **depois** da transição de abertura; a animação de entrada roda a 60fps num Pixel 6a (medido com o profiler ou `PerformanceObserver` do dev build).
- [ ] Rolar até os passos e voltar **não recarrega nem reinicia o vídeo**; só `play()`/`pause()`. Teste explícito desse caso.
- [ ] O tique de 1Hz do descanso re-renderiza **só** o componente do contador — verificável com `why-did-you-render` ou contagem de render no teste.
- [ ] Abrir e fechar o modal não causa piscada nem remount visível no logger.
- [ ] Nenhum spinner de carregamento na abertura; com a query fria, o texto e o poster aparecem mesmo assim.

**Sempre**

- [ ] Reduce Motion: sem autoplay/loop (poster + play 56pt) e `FadeIn` no lugar do `SlideInDown` do CTA.
- [ ] Safe areas via `useSafeAreaInsets()` no topo e na base; conferido em iPhone SE, iPhone com Dynamic Island e Android mid-range (Pixel 6a).
- [ ] `npm run typecheck && npm run lint && npm run test` verdes.

---

## Plano (v3 — arquivos)

- [ ] `app/(workout)/_layout.tsx` — registrar a `Stack.Screen` com `presentation: "fullScreenModal"`, `animation: "slide_from_bottom"`, `gestureEnabled: true`.
- [ ] `app/(workout)/exercise/[planExerciseId].tsx` — rota, wiring do param.
- [ ] `src/features/workout/screens/exercise-detail-screen.tsx` — o modal (substitui `components/exercise-detail-sheet.tsx`, que é **deletado**). Inclui o header fixo, o pan de swipe-down e o rodapé contextual.
- [ ] `src/features/workout/components/rest-countdown.tsx` — contador isolado, único assinante do tique de 1Hz (§V3-7).
- [ ] `src/features/workout/store-rest-timer.ts` — timer no store, `endsAt` por relógio de parede, háptico único (+ teste de background/drift).
- [ ] `src/features/workout/hooks/use-rest-timer.ts` — vira seletor fino do store; assinatura pública preservada.
- [ ] `src/features/workout/store.ts` — campo `pendingAction` (`openKeypad`) + consumo/limpeza.
- [ ] `src/features/workout/screens/workout-logger-screen.tsx` — `router.push` da rota, `useFocusEffect` consumindo `pendingAction`, remove o sheet.
- [ ] `src/features/workout/screens/workout-preview-screen.tsx` — a linha `Pressable` da §V2-1 passa a fazer `router.push` em vez de abrir sheet; remove o sheet e o estado local dele.
- [ ] `src/entities/video/ui/demo-player.tsx` — slot 16:9 com poster imediato, montagem pós-transição, mute + fullscreen, `play`/`pause` por visibilidade **sem remount**, estados de falha da §V3-6.
- [ ] `src/entities/video/ui/demo-selector.tsx` — faixa de thumbs, só quando `demos.length > 1`, troca a fonte do player existente.

## Perguntas abertas (v3)

1. **Dev:** `presentation: "fullScreenModal"` do `react-native-screens` no Android com edge-to-edge — confirmar que os insets do topo chegam ao modal (em algumas versões o modal não herda o inset do host) e que o gesto preditivo de back anima o dismiss em vez de cortar.
2. **Dev:** o pan de swipe-down simultâneo ao `ScrollView` vale o custo, ou o `✕` + back do Android bastam? Recomendação: implementar, medir; se brigar com a transição nativa, **cortar** — não é a saída garantida.
3. **Dev:** `react-native-webview` não detecta embed recusado de forma confiável (`onError`/`onHttpError` não disparam para bloqueio dentro do iframe). Confirmar que o timeout de 8s como proxy cobre o caso — com 36/37 vídeos aprovados, o custo de errar aqui é baixo.
4. **Dev:** confirmar que o `VideoView` do `expo-video` 3.x entra em fullscreen com o app travado em `portrait` no Android (activity `screenOrientation="portrait"`). Se não entrar, o fullscreen fica só no iOS na fatia 1 e o Android segue com o player em 16:9 — **não** com um caminho para fora do app.
5. **PO:** confirmado que "vídeo indisponível" é exceção rara (1 em 37). Se o número subir com vídeos de coach (uploads em `processing`), o bloco de falha pode precisar de mais peso — mas aí a resposta é acelerar o processamento, não engrossar a mensagem de erro.
