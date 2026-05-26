import { ScrollView, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Card, AppHeader } from "@ui/index";
import { colors } from "@theme/colors";
import { SEED_PLAN } from "@features/plans/data/seed-plan";
import { getExercise } from "@features/exercises/data/catalog";
import { mockUser } from "@shared/mocks";
import type { Muscle, PlanDay } from "@/types/domain";

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

function muscleSummary(day: PlanDay): string {
  const set = new Set<string>();
  for (const pe of day.exercises) {
    const ex = getExercise(pe.exerciseId);
    const label = ex ? MUSCLE_LABEL[ex.primaryMuscle] : undefined;
    if (label) set.add(label);
  }
  return Array.from(set).join(" · ");
}

export default function WorkoutsScreen() {
  return (
    <Screen edges={["top"]} padded={false}>
      <AppHeader
        avatarUrl={mockUser.avatarUrl}
        hasNotifications
        onPressBell={() => router.push("/(app)/notifications")}
        onPressAvatar={() => router.push("/(app)/profile")}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-1 pb-28">
          <VStack space={5}>
            <VStack space={1}>
              <Text variant="title">Seu Plano</Text>
              <Text variant="bodySmall">
                {SEED_PLAN.name} · {SEED_PLAN.weeks} semanas
              </Text>
            </VStack>

            <VStack space={3}>
              {SEED_PLAN.days.map((day) => {
                const totalSets = day.exercises.reduce((s, pe) => s + pe.targetSets, 0);
                return (
                  <Pressable
                    key={day.id}
                    onPress={() => router.push("/(workout)/preview")}
                    accessibilityRole="button"
                    accessibilityLabel={`Treino ${day.name}`}
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
                          <Text className="text-base font-bold text-text-primary">{day.name}</Text>
                          <Text variant="bodySmall" numberOfLines={1}>
                            {muscleSummary(day)}
                          </Text>
                          <Text variant="caption" className="normal-case tracking-normal mt-0.5">
                            {day.exercises.length} exercícios · {totalSets} séries
                          </Text>
                        </VStack>
                        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                      </HStack>
                    </Card>
                  </Pressable>
                );
              })}
            </VStack>
          </VStack>
        </View>
      </ScrollView>
    </Screen>
  );
}
