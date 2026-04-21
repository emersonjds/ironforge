import { useMemo } from "react";
import { View } from "react-native";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Card, Button } from "@ui/index";
import { SEED_MESOCYCLE } from "@features/plans/data/seed-plan";
import { getExercise } from "@features/exercises/data/catalog";
import {
  deltaVsPrevious,
  sessionTotalVolume,
  sessionDurationSeconds,
  type ExerciseDelta,
} from "@features/workout/lib/session-stats";
import { useLastFinishedSession } from "@features/workout/hooks/use-last-finished-session";
import { formatDuration } from "@lib/utils/format";

cssInterop(View, { className: "style" });

export function WorkoutSummaryScreen() {
  const session = useLastFinishedSession();

  const deltas = useMemo<ExerciseDelta[]>(() => {
    if (!session) return [];
    const planDay = SEED_MESOCYCLE.days.find((d) => d.id === session.planDayId);
    if (!planDay) return [];
    return planDay.exercises.map((pe) =>
      deltaVsPrevious({
        currentSets: session.sets,
        previousSets: [],
        planExerciseId: pe.id,
      }),
    );
  }, [session]);

  if (!session) {
    return (
      <Screen>
        <VStack space={4} className="flex-1 items-center justify-center">
          <Text variant="title">Nada pra resumir ainda</Text>
          <Button label="Voltar" variant="outline" onPress={() => router.replace("/(app)")} />
        </VStack>
      </Screen>
    );
  }

  const planDay = SEED_MESOCYCLE.days.find((d) => d.id === session.planDayId);
  const totalVolume = sessionTotalVolume(session);
  const durationS = sessionDurationSeconds(session);
  const totalSets = session.sets.length;

  return (
    <Screen>
      <VStack space={8} className="flex-1 pt-8 pb-8">
        {/* Header */}
        <VStack space={4}>
          <HStack space={2} align="center">
            <View className="w-8 h-8 rounded-full bg-success/15 border border-success/40 items-center justify-center">
              <Text className="text-success text-sm font-bold">✓</Text>
            </View>
            <Text className="text-2xs text-success uppercase tracking-widest font-semibold">SESSÃO CONCLUÍDA</Text>
          </HStack>
          <Text variant="title">{planDay?.name ?? "Treino"}</Text>
          {/* Stats row */}
          <HStack space={3}>
            <Text variant="bodySmall">{formatDuration(durationS)}</Text>
            <Text className="text-text-disabled">·</Text>
            <Text variant="bodySmall">{totalSets} série{totalSets === 1 ? "" : "s"}</Text>
            <Text className="text-text-disabled">·</Text>
            <Text variant="bodySmall">{(totalVolume / 1000).toFixed(1)}t</Text>
          </HStack>
        </VStack>

        {/* Delta section */}
        <VStack space={4}>
          <Text variant="label">O QUE MUDOU vs. última sessão</Text>
          <Card variant="raised" padding="none">
            <VStack space={0}>
              {deltas.map((d, i) => {
                const exercise = (() => {
                  const pe = planDay?.exercises.find((p) => p.id === d.planExerciseId);
                  return pe ? getExercise(pe.exerciseId) : undefined;
                })();
                const hasSets = session.sets.some((s) => s.planExerciseId === d.planExerciseId);
                const isLast = i === deltas.length - 1;
                return (
                  <View key={d.planExerciseId}>
                    <HStack justify="between" align="center" className="px-5 py-4">
                      <Text className="text-sm text-text-primary flex-1 mr-4">
                        {exercise?.name ?? "—"}
                      </Text>
                      <DeltaBadge delta={d} hasSets={hasSets} />
                    </HStack>
                    {!isLast ? <View className="h-px bg-border-subtle mx-5" /> : null}
                  </View>
                );
              })}
            </VStack>
          </Card>
        </VStack>

        <View className="flex-1" />

        <Button
          label="CONCLUIR SESSÃO"
          variant="solid"
          size="xl"
          fullWidth
          onPress={() => router.replace("/(app)")}
        />
      </VStack>
    </Screen>
  );
}

function DeltaBadge({ delta, hasSets }: { delta: ExerciseDelta; hasSets: boolean }) {
  if (!hasSets) {
    return <Text variant="bodySmall" className="text-text-tertiary">não executado</Text>;
  }
  if (delta.status === "first_time") {
    return (
      <Text variant="bodySmall" className="text-text-secondary font-mono">
        {delta.currentBestWeight > 0 ? `${delta.currentBestWeight}kg` : ""}× {delta.currentBestReps}
      </Text>
    );
  }
  if (delta.status === "increase_weight" && delta.deltaKg !== null && delta.deltaKg > 0) {
    return <Text variant="bodySmall" className="text-success font-semibold">+{delta.deltaKg}kg ▲</Text>;
  }
  if (delta.status === "increase_reps" && delta.deltaReps !== null && delta.deltaReps > 0) {
    return <Text variant="bodySmall" className="text-success font-semibold">+{delta.deltaReps} rep ▲</Text>;
  }
  if (delta.status === "regression") {
    return <Text variant="bodySmall" className="text-warning font-semibold">-{Math.abs(delta.deltaKg ?? 0)}kg</Text>;
  }
  return <Text variant="bodySmall" className="text-text-secondary">mesmo peso</Text>;
}
