import { Modal, Pressable, View, ScrollView } from "react-native";
import { cssInterop } from "nativewind";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import { Text, Card, VStack, HStack } from "@ui/index";
import { muscleLabel } from "@entities/exercise/lib/muscle-labels";
import type { Exercise } from "@entities/exercise";
import type { PlanExercise } from "@entities/plan";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(ScrollView, { className: "style" });

const EQUIPMENT_LABEL: Record<string, string> = {
  barbell: "Barra olímpica",
  dumbbell: "Halteres",
  machine: "Máquina",
  cable: "Cabo / polia",
  bodyweight: "Peso corporal",
  kettlebell: "Kettlebell",
  smith: "Barra guiada (Smith)",
  band: "Elástico",
};

interface ExerciseDetailSheetProps {
  visible: boolean;
  exercise: Exercise | null;
  planExercise: PlanExercise | null;
  onClose: () => void;
}

export function ExerciseDetailSheet({ visible, exercise, planExercise, onClose }: ExerciseDetailSheetProps) {
  if (!exercise) return null;

  const coachNote = planExercise?.coachNote ?? null;
  const secondaryMuscles = exercise.secondaryMuscles ?? [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-bg-overlay">
        <Animated.View
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(160)}
          style={{ position: "absolute", inset: 0 }}
        >
          <Pressable onPress={onClose} className="flex-1" />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(280)}
          exiting={SlideOutDown.duration(200)}
          className="bg-bg-raised border-t border-border rounded-t-2xl pt-3 pb-safe-bottom max-h-[75%]"
        >
          {/* Drag handle */}
          <View className="w-10 h-1 rounded-full bg-border self-center mb-4" />

          <ScrollView showsVerticalScrollIndicator={false} className="px-5">
            <VStack space={4} className="pb-6">
              {/* Header */}
              <VStack space={1}>
                <Text className="text-xl font-bold text-text-primary">{exercise.name}</Text>
                <Text className="text-sm text-text-secondary">
                  {muscleLabel(exercise.primaryMuscle)} · {EQUIPMENT_LABEL[exercise.equipment] ?? exercise.equipment}
                </Text>
              </VStack>

              <View className="h-px bg-border-subtle" />

              {/* Primary muscle */}
              <VStack space={1}>
                <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Músculo primário</Text>
                <Text className="text-sm text-text-primary">{muscleLabel(exercise.primaryMuscle)}</Text>
              </VStack>

              {/* Secondary muscles */}
              {secondaryMuscles.length > 0 ? (
                <VStack space={2}>
                  <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Músculos secundários</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {secondaryMuscles.map((m) => (
                      <View key={m} className="px-3 py-1 rounded-full bg-bg-sunken border border-border-subtle">
                        <Text className="text-xs text-text-secondary">{muscleLabel(m)}</Text>
                      </View>
                    ))}
                  </View>
                </VStack>
              ) : null}

              {/* Equipment */}
              <VStack space={1}>
                <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Equipamento</Text>
                <Text className="text-sm text-text-primary">
                  {EQUIPMENT_LABEL[exercise.equipment] ?? exercise.equipment}
                  {exercise.equipmentDetail ? ` · ${exercise.equipmentDetail}` : ""}
                </Text>
              </VStack>

              {/* Coach note */}
              {coachNote ? (
                <>
                  <View className="h-px bg-border-subtle" />
                  <VStack space={2}>
                    <Text className="text-2xs text-forest-500 uppercase tracking-widest">Nota do personal</Text>
                    <Card variant="accent" padding="md">
                      <Text className="text-sm text-text-primary leading-relaxed">{coachNote}</Text>
                    </Card>
                  </VStack>
                </>
              ) : null}

              {/* Video placeholder (P1) */}
              <Card variant="raised" padding="md">
                <HStack space={3} align="center">
                  <View className="w-10 h-10 rounded-lg bg-surface-300 items-center justify-center">
                    <Text className="text-lg">▷</Text>
                  </View>
                  <VStack space={1} className="flex-1">
                    <Text className="text-sm font-semibold text-text-secondary">Vídeo demonstrativo</Text>
                    <Text className="text-xs text-text-disabled">Em breve</Text>
                  </VStack>
                </HStack>
              </Card>
            </VStack>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
