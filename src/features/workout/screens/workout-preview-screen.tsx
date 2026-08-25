import { useMemo } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { cssInterop } from "nativewind";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, VStack, HStack, Text, Card, Button, EmptyState } from "@ui/index";
import { colors } from "@theme/colors";
import { useAssignments, pickActiveAssignment, resolveNextSession } from "@entities/plan";
import { useExercises } from "@entities/exercise";
import { useActiveSessionStore } from "@features/workout/store";
import { useAuthStore } from "@features/auth/store";
import { useLastFinishedSession } from "@features/workout/hooks/use-last-finished-session";
import { useFirstSheetHint } from "@features/workout/hooks/use-first-sheet-hint";
import { resolveSessionExercises, type SessionExerciseView } from "@features/workout/lib/resolve-session-exercises";

cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

export function WorkoutPreviewScreen() {
  const { dayId } = useLocalSearchParams<{ dayId?: string }>();
  const assignmentsQuery = useAssignments();
  const exercisesQuery = useExercises();
  const lastSession = useLastFinishedSession();
  const startSession = useActiveSessionStore((s) => s.startSession);
  const user = useAuthStore((s) => s.user);
  const { showHint, dismissHint } = useFirstSheetHint();

  const exercisesById = useMemo(
    () => new Map((exercisesQuery.data ?? []).map((e) => [e.id, e])),
    [exercisesQuery.data],
  );

  if (assignmentsQuery.isLoading || exercisesQuery.isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.forest[500]} />
        </View>
      </Screen>
    );
  }

  if (assignmentsQuery.isError || exercisesQuery.isError) {
    return (
      <Screen>
        <EmptyState
          title="Não foi possível carregar seu treino"
          description="Verifique sua conexão e tente novamente."
          actionLabel="Tentar de novo"
          onAction={() => {
            assignmentsQuery.refetch();
            exercisesQuery.refetch();
          }}
        />
      </Screen>
    );
  }

  const activeAssignment = pickActiveAssignment(assignmentsQuery.data ?? []);

  if (!activeAssignment) {
    return (
      <Screen>
        <EmptyState
          title="Nenhum plano ativo"
          description="Seu personal ainda não montou um plano de treino para você."
        />
      </Screen>
    );
  }

  const assignmentId = activeAssignment.id;
  // O aluno pode ter escolhido um dia na lista; sem escolha, seguimos a rotação.
  const chosenDay = dayId ? activeAssignment.days.find((day) => day.id === dayId) : undefined;
  const planDay =
    chosenDay ??
    resolveNextSession(activeAssignment, lastSession ? { planDayId: lastSession.planDayId } : null)
      .planDay;
  const sessionExercises = resolveSessionExercises(planDay, exercisesById);

  const estimatedMinutes = Math.round(
    planDay.exercises.reduce((sum, pe) => sum + pe.targetSets * (pe.restSeconds + 45), 0) / 60,
  );
  const totalSets = planDay.exercises.reduce((sum, pe) => sum + pe.targetSets, 0);

  function handleStart() {
    startSession(planDay, user?.id ?? "user-local", assignmentId);
    router.replace("/(workout)/logger");
  }

  function openDetail(item: SessionExerciseView) {
    dismissHint();
    const { exercise: ex, planExercise: pe } = item;
    if (!ex) return;
    router.push({
      pathname: "/(workout)/exercise/[planExerciseId]",
      params: {
        planExerciseId: pe.id,
        exerciseId: ex.id,
        targetSets: String(pe.targetSets),
        repRangeMin: String(pe.repRangeMin),
        repRangeMax: String(pe.repRangeMax),
        targetRir: String(pe.targetRir),
        ...(pe.coachNote ? { coachNote: pe.coachNote } : {}),
      },
    });
  }

  return (
    <Screen>
      <VStack space={8} className="flex-1 pt-8 pb-8">
        {/* Header */}
        <VStack space={3}>
          <Text className="text-2xs text-text-tertiary uppercase tracking-widest">PRÉVIA DA SESSÃO</Text>
          <Text variant="title">{planDay.name}</Text>
          <HStack space={2} align="center">
            <Text variant="bodySmall">{planDay.exercises.length} exercícios</Text>
            <Text className="text-text-disabled">·</Text>
            <Text variant="bodySmall">{totalSets} séries</Text>
            <Text className="text-text-disabled">·</Text>
            <Text variant="bodySmall">~{estimatedMinutes} min</Text>
          </HStack>
        </VStack>

        {/* Exercise list */}
        <Card variant="raised" padding="none">
          <View className="px-5 pt-5 pb-3">
            <Text variant="label" className="mb-1">EXERCÍCIOS</Text>
            {showHint ? (
              <Text variant="label" className="mb-3 text-forest-400">
                TOQUE NO EXERCÍCIO PARA VER A EXECUÇÃO
              </Text>
            ) : (
              <View className="mb-1" />
            )}
            {sessionExercises.map((item, idx) => {
              const { planExercise: pe, exercise: ex } = item;
              const pairId = pe.isSupersetWith;
              const isSuperset = pairId !== null;
              const isLast = idx === sessionExercises.length - 1;
              return (
                <View key={pe.id}>
                  <Pressable
                    onPress={() => openDetail(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`${ex?.name ?? "Exercício"}, ${pe.targetSets} séries de ${pe.repRangeMin} a ${pe.repRangeMax} repetições. Ver execução.`}
                    accessibilityHint={idx === 0 ? "Abre a explicação e o vídeo do exercício" : undefined}
                    className="min-h-14 -mx-5 px-5 flex-row items-center active:bg-bg-sunken"
                  >
                    <View className="flex-1 flex-row items-center gap-4">
                      <Text className="text-xs text-text-disabled font-mono w-5 text-right">
                        {idx + 1}
                      </Text>
                      <VStack space={1} className="flex-1">
                        <Text className="text-sm font-semibold text-text-primary" numberOfLines={2}>
                          {ex?.name ?? "—"}
                        </Text>
                        {isSuperset && pe.order < (pairId ? planDay.exercises.find((p) => p.id === pairId)?.order ?? 999 : 999) ? (
                          <Text className="text-2xs text-forest-400 uppercase tracking-widest">
                            superset
                          </Text>
                        ) : null}
                      </VStack>
                    </View>
                    <Text className="text-xs font-mono text-text-tertiary mr-2">
                      {pe.targetSets}×{pe.repRangeMin}–{pe.repRangeMax}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
                  </Pressable>
                  {!isLast ? (
                    <View className="h-px bg-border-subtle ml-9" />
                  ) : null}
                </View>
              );
            })}
          </View>
        </Card>

        <View className="flex-1" />

        <VStack space={3}>
          <Button label="► INICIAR TREINO" variant="solid" size="xl" fullWidth onPress={handleStart} />
          <Button label="Cancelar" variant="ghost" size="md" fullWidth onPress={() => router.back()} />
        </VStack>
      </VStack>
    </Screen>
  );
}
