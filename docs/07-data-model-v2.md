# IronForge — Modelo de Dados v2 (Plataforma)

> **Supersede `03-architecture.md` §2.** Esta é a fonte de verdade do domínio para a plataforma personal↔aluno. Zod é a fonte; tipos TS são `z.infer<>`; o mesmo schema valida I/O de API e serialização local. No mobile vive em `src/types/domain.ts`. **App e web são projetos separados** — a web (`ironforge-web`) replica os schemas relevantes a partir **deste documento** (sem monorepo).
>
> Síntese reconciliada dos agentes `bodybuilding-coach` + `mobile-dev-expert`.

## Princípios
- **Identidades paralelas, não `role`.** `User` é a identidade base; `CoachProfile`/`AthleteProfile` penduram nela.
- **Template → snapshot.** O personal cria `PlanTemplate`; o aluno recebe `AssignedPlan` (cópia congelada). Editar o template não muda planos já atribuídos.
- **Histórico indexado por `exerciseId`.** Carga e logs sobrevivem a troca/arquivamento de plano. Soft-delete em tudo que tem histórico; FK `ON DELETE RESTRICT`.

---

## Enums

```ts
export const MuscleSchema = z.enum([
  "chest","back_lats","back_upper","back_lower","quads","hamstrings","glutes",
  "calves","shoulders_front","shoulders_side","shoulders_rear","biceps","triceps","forearms","core",
]);
export const EquipmentSchema = z.enum(["barbell","dumbbell","machine","cable","bodyweight","kettlebell","smith","band"]);
export const MovementPatternSchema = z.enum(["push_h","push_v","pull_h","pull_v","squat","hinge","lunge","carry","isolation"]);
export const SetTypeSchema = z.enum(["warmup","working","backoff","dropset","myorep"]);
export const MuscleEmphasisSchema = z.enum(["stretch","peak","mid_range"]);
export const ExperienceSchema = z.enum(["beginner","intermediate","advanced"]);
export const GoalSchema = z.enum(["hypertrophy","strength","cutting","recomp"]);
export const UnitSystemSchema = z.enum(["kg","lb"]);
export const PerformerGenderSchema = z.enum(["male","female","all"]);
```

## Identidade e papéis

```ts
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().url().nullable().default(null),
  createdAt: z.string().datetime(),
});

export const CoachProfileSchema = z.object({
  userId: z.string(),
  slug: z.string(),                       // /p/<slug> — página pública
  bio: z.string().max(500).nullable(),
  cref: z.string().nullable(),
  specialties: z.array(MuscleSchema).default([]),
  maxAthletes: z.number().int().positive().nullable(),  // null = ilimitado
  createdAt: z.string().datetime(),
});

export const AthleteProfileSchema = z.object({
  userId: z.string(),
  coachId: z.string().nullable(),         // null = autônomo (modo solo)
  goal: GoalSchema.default("hypertrophy"),
  experienceLevel: ExperienceSchema.default("intermediate"),
  unitSystem: UnitSystemSchema.default("kg"),
  bodyweightKg: z.number().min(0).nullable(),
  restrictions: z.array(z.string()).default([]),         // ex.: "joelho_direito"
  videoPerformerPref: z.enum(["same","any"]).default("any"),
  onboardingCompleted: z.boolean().default(false),
});

export const CoachAthleteRelationSchema = z.object({
  id: z.string(),
  coachId: z.string(),
  athleteId: z.string(),
  status: z.enum(["pending","active","suspended","terminated"]),
  startedAt: z.string().datetime(),
  terminatedAt: z.string().datetime().nullable().default(null),
});
```

## Catálogo de exercícios e vídeo

```ts
export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  primaryMuscle: MuscleSchema,
  secondaryMuscles: z.array(MuscleSchema).default([]),
  equipment: EquipmentSchema,
  movementPattern: MovementPatternSchema,
  isUnilateral: z.boolean().default(false),
  // — expansão de catálogo —
  baseExerciseId: z.string().nullable().default(null),   // agrupa variações
  variationType: z.string().nullable().default(null),    // "45-degree","seated","incline-30"
  equipmentDetail: z.string().nullable().default(null),  // "Hammer Strength","cable-low-pulley"
  muscleEmphasis: MuscleEmphasisSchema.nullable().default(null),
  difficultyLevel: ExperienceSchema.default("intermediate"),
  requiresSpotter: z.boolean().default(false),
  riskFlags: z.array(z.string()).default([]),            // casa com AthleteProfile.restrictions (alerta, não bloqueio)
  ownerCoachId: z.string().nullable().default(null),     // null = catálogo global; senão exercício custom do personal
});

// Vídeo é entidade do personal (upload + transcodificação + entrega)
export const VideoSchema = z.object({
  id: z.string(),
  coachId: z.string(),
  title: z.string(),
  status: z.enum(["pending","processing","ready","error"]),
  durationSeconds: z.number().int().positive().nullable(),
  thumbnailUrl: z.string().url().nullable(),
  hlsUrl: z.string().url().nullable(),
  gifUrl: z.string().url().nullable(),                   // fallback leve offline
  performerGender: PerformerGenderSchema.default("all"),
  verifiedBy: z.string().nullable().default(null),
  verifiedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
});

// Liga exercício ↔ vídeo (um exercício pode ter vídeos de executantes diferentes)
export const ExerciseDemoSchema = z.object({
  exerciseId: z.string(),
  videoId: z.string(),
  isPrimary: z.boolean().default(false),
  coachNote: z.string().max(280).nullable().default(null),
});
```

## Planos: template → atribuição (snapshot)

```ts
export const PlanExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  order: z.number().int().min(0),
  targetSets: z.number().int().min(1),
  repRangeMin: z.number().int().min(1),
  repRangeMax: z.number().int().min(1),
  restSeconds: z.number().int().min(0),
  targetRir: z.number().int().min(0).max(10),
  isSupersetWith: z.string().nullable().default(null),   // id de outro PlanExercise (relação 1:1)
  coachNote: z.string().max(500).nullable().default(null),
});

export const PlanDaySchema = z.object({
  id: z.string(),
  slotLabel: z.string(),                  // "A","B","Push A"...
  slotIndex: z.number().int().min(0),     // ordem de rotação
  name: z.string(),
  targetDaysOfWeek: z.array(z.number().int().min(0).max(6)).default([]),
  exercises: z.array(PlanExerciseSchema).default([]),
});

export const PlanTemplateSchema = z.object({
  id: z.string(),
  coachId: z.string(),
  name: z.string(),
  weeks: z.number().int().min(1).max(16),
  targetLevel: ExperienceSchema.default("intermediate"),
  targetGoal: GoalSchema.default("hypertrophy"),
  description: z.string().nullable().default(null),
  days: z.array(PlanDaySchema).default([]),
  deletedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
});

export const WeekConfigSchema = z.object({
  weekNumber: z.number().int().min(1),
  volumeMultiplier: z.number().min(0.5).max(1.5).default(1),  // 0.8 = deload
  rir: z.number().int().min(0).max(10).nullable().default(null),
  intensityNote: z.string().nullable().default(null),
});

export const AssignedPlanSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  coachId: z.string().nullable(),         // null = self-assigned (solo)
  templateId: z.string().nullable(),      // origem; null = criado do zero
  name: z.string(),
  weeks: z.number().int().min(1).max(16),
  startDate: z.string().date(),
  status: z.enum(["active","paused","completed","archived"]),
  days: z.array(PlanDaySchema).default([]),               // SNAPSHOT congelado
  weekConfigs: z.array(WeekConfigSchema).default([]),
  weekVisibility: z.enum(["current_only","current_and_next","all"]).default("current_and_next"),
  coachNotes: z.string().max(2000).nullable().default(null),
  version: z.number().int().default(1),
  deletedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
  syncedAt: z.string().datetime().nullable().default(null),
});
```

## Sessão, sets e histórico de carga

```ts
export const SessionSchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  assignedPlanId: z.string().nullable(),
  planDayId: z.string().nullable(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable(),
  bodyweightKg: z.number().min(0).nullable(),
  perceivedFatigue: z.number().int().min(1).max(10).nullable(),
  notes: z.string().max(1000).nullable().default(null),
  syncedAt: z.string().datetime().nullable().default(null),
});

export const SetLogSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  exerciseId: z.string(),                 // ★ desnormalizado — chave de permanência
  planExerciseId: z.string().nullable(),  // contexto; null = sessão livre
  assignedPlanId: z.string().nullable(),  // em qual ciclo foi executado
  setIndex: z.number().int().min(1),
  type: SetTypeSchema.default("working"),
  weight: z.number().min(0).multipleOf(0.5),
  reps: z.number().int().min(0),
  rir: z.number().int().min(0).max(10).nullable(),
  restTakenSeconds: z.number().int().min(0).nullable(),
  completedAt: z.string().datetime(),
  notes: z.string().max(500).nullable().default(null),
  editedAt: z.string().datetime().nullable().default(null),
  originalWeight: z.number().min(0).nullable().default(null),  // auditoria de correção
  deletedAt: z.string().datetime().nullable().default(null),
  syncedAt: z.string().datetime().nullable().default(null),
});

// Última carga utilizável por exercício (alimenta a sugestão de double progression)
export const LoadHistoryEntrySchema = z.object({
  id: z.string(),
  athleteId: z.string(),
  exerciseId: z.string(),                 // ★ chave de busca (NÃO planExerciseId)
  weight: z.number().min(0).multipleOf(0.5),
  reps: z.number().int().min(1),
  rir: z.number().int().min(0).max(10).nullable(),
  setType: SetTypeSchema,
  performedAt: z.string().datetime(),
  sessionId: z.string(),
  invalidatedAt: z.string().datetime().nullable().default(null),
  invalidationReason: z.enum(["manual_override","weight_change_requested","coach_reset"]).nullable().default(null),
});

// Rastro de por que o treino de um aluno diverge do template (auditoria)
export const AdaptationLogSchema = z.object({
  id: z.string(),
  assignedPlanId: z.string(),
  templateId: z.string().nullable(),
  coachId: z.string(),
  adaptedAt: z.string().datetime(),
  reason: z.string(),
  changes: z.array(z.object({ field: z.string(), from: z.unknown(), to: z.unknown() })).default([]),
});
```

## Regras de uso
- Tipo sempre `z.infer<typeof XSchema>` — nunca interface duplicada.
- I/O de API: `XSchema.parse(res)` na borda (`lib/api/client.ts`). Falha = log + retry na UI.
- MMKV: serializa `JSON.stringify(XSchema.parse(...))`. Cache namespaced por `userId`.
- Leitura ignora soft-deleted por padrão: helper `withoutDeleted(rows)`.
- `useSetSuggestion(exerciseId)` lê o último `LoadHistoryEntry` não-invalidado — offline, latência zero.
- Backend (fase H): mesmos schemas; JWT carrega `{ userId, athleteId?, coachId? }` → RLS por tenant.
```
