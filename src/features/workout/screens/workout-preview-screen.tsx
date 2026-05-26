import { View } from "react-native";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Card, Button } from "@ui/index";
import { getTodayPlanDay } from "@features/plans/data/seed-plan";
import { getExercise } from "@features/exercises/data/catalog";
import { useActiveSessionStore } from "@features/workout/store";
import { useAuthStore } from "@features/auth/store";

cssInterop(View, { className: "style" });

export function WorkoutPreviewScreen() {
  const planDay = getTodayPlanDay();
  const startSession = useActiveSessionStore((s) => s.startSession);
  const user = useAuthStore((s) => s.user);

  const estimatedMinutes = Math.round(
    planDay.exercises.reduce((sum, pe) => sum + pe.targetSets * (pe.restSeconds + 45), 0) / 60,
  );
  const totalSets = planDay.exercises.reduce((sum, pe) => sum + pe.targetSets, 0);

  function handleStart() {
    startSession(planDay, user?.id ?? "user-local", undefined);
    router.replace("/(workout)/logger");
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
            <Text variant="label" className="mb-4">EXERCÍCIOS</Text>
            {planDay.exercises.map((pe, idx) => {
              const ex = getExercise(pe.exerciseId);
              const pairId = pe.isSupersetWith;
              const isSuperset = pairId !== null;
              const isLast = idx === planDay.exercises.length - 1;
              return (
                <View key={pe.id}>
                  <HStack justify="between" align="center" className="py-4">
                    <View className="flex-1 flex-row items-center gap-4">
                      <Text className="text-xs text-text-disabled font-mono w-5 text-right">
                        {idx + 1}
                      </Text>
                      <VStack space={1} className="flex-1">
                        <Text className="text-sm font-semibold text-text-primary">
                          {ex?.name ?? "—"}
                        </Text>
                        {isSuperset && pe.order < (pairId ? planDay.exercises.find((p) => p.id === pairId)?.order ?? 999 : 999) ? (
                          <Text className="text-2xs text-ember-400 uppercase tracking-widest">
                            superset
                          </Text>
                        ) : null}
                      </VStack>
                    </View>
                    <Text className="text-xs font-mono text-text-tertiary">
                      {pe.targetSets}×{pe.repRangeMin}–{pe.repRangeMax}
                    </Text>
                  </HStack>
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
