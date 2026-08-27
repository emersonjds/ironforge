import { ScrollView, View, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Card, AppHeader, EmptyState } from "@ui/index";
import { colors } from "@theme/colors";
import { useAssignments, pickActiveAssignment } from "@entities/plan";
import { useExercises } from "@entities/exercise";
import { useAuthStore } from "@features/auth/store";
import type { Exercise, Muscle, PlanDay } from "@/types/domain";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

const MUSCLE_LABEL: Partial<Record<Muscle, string>> = {
  chest: "Peito",
  back_lats: "Costas",
  back_upper: "Costas",
  shoulders_front: "Ombros",
  shoulders_side: "Ombros",
  shoulders_rear: "Ombros",
  triceps: "Tríceps",
  biceps: "Bíceps",
  quads: "Quadríceps",
  hamstrings: "Posterior",
  glutes: "Glúteos",
  calves: "Panturrilha",
};

function muscleSummary(day: PlanDay, byId: Map<string, Exercise>): string {
  const labels = new Set<string>();

  for (const planExercise of day.exercises) {
    const label = MUSCLE_LABEL[byId.get(planExercise.exerciseId)?.primaryMuscle as Muscle];
    if (label) labels.add(label);
  }

  return Array.from(labels).join(" · ");
}

export default function WorkoutsScreen() {
  const assignments = useAssignments();
  const exercises = useExercises();
  const authUser = useAuthStore((s) => s.user);

  const plan = pickActiveAssignment(assignments.data ?? []);
  const byId = new Map((exercises.data ?? []).map((exercise) => [exercise.id, exercise]));
  const isLoading = assignments.isLoading || exercises.isLoading;

  return (
    <Screen edges={["top"]} padded={false}>
      <AppHeader
        avatarUrl={authUser?.avatarUrl ?? null}
        showBell={false}
        onPressAvatar={() => router.push("/(app)/profile")}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-1 pb-28">
          <VStack space={5}>
            <VStack space={1}>
              <Text variant="title">Seu Plano</Text>
              {plan ? (
                <Text variant="bodySmall">
                  {plan.name} · {plan.weeks} semanas
                </Text>
              ) : null}
            </VStack>

            {isLoading ? (
              <View className="py-16 items-center">
                <ActivityIndicator color={colors.forest[500]} />
              </View>
            ) : assignments.isError ? (
              <EmptyState
                title="Não foi possível carregar seu plano"
                description="Verifique sua conexão e tente de novo."
                actionLabel="Tentar de novo"
                onAction={() => assignments.refetch()}
              />
            ) : !plan ? (
              <EmptyState
                title="Nenhum plano ativo"
                description="Seu personal ainda não enviou uma ficha para você."
              />
            ) : (
              <VStack space={3}>
                {plan.days.map((day) => {
                  const totalSets = day.exercises.reduce((sum, pe) => sum + pe.targetSets, 0);
                  const summary = muscleSummary(day, byId);

                  return (
                    <Pressable
                      key={day.id}
                      onPress={() =>
                        router.push({
                          pathname: "/(workout)/preview",
                          params: { dayId: day.id },
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Treino ${day.name}, ${day.exercises.length} exercícios`}
                      className="active:opacity-80"
                    >
                      <Card variant="raised" padding="lg">
                        <HStack space={4} align="center">
                          <View className="h-12 w-12 rounded-xl bg-forest-500 items-center justify-center">
                            <Text className="font-display text-lg font-black text-white leading-none">
                              {day.slotLabel}
                            </Text>
                          </View>
                          <VStack space={1} className="flex-1">
                            <Text className="text-base font-bold text-text-primary">
                              {day.name}
                            </Text>
                            {summary ? (
                              <Text variant="bodySmall" numberOfLines={1}>
                                {summary}
                              </Text>
                            ) : null}
                            <Text variant="caption" className="normal-case tracking-normal mt-0.5">
                              {day.exercises.length} exercícios · {totalSets} séries
                            </Text>
                          </VStack>
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={colors.text.tertiary}
                          />
                        </HStack>
                      </Card>
                    </Pressable>
                  );
                })}
              </VStack>
            )}
          </VStack>
        </View>
      </ScrollView>
    </Screen>
  );
}
