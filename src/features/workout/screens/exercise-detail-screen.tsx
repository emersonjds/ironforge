import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StatusBar, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { cssInterop } from "nativewind";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Text, VStack, HStack, Card, Button } from "@ui/index";
import { colors } from "@theme/colors";
import { muscleLabel } from "@entities/exercise/lib/muscle-labels";
import { parseInstructions, ExerciseInstructions, useExercise } from "@entities/exercise";
import { DemoPlayer, DemoSelector, useExerciseDemos } from "@entities/video";
import { useActiveSessionStore } from "@features/workout/store";
import { RestCountdown, useRestTimerIsDone } from "@features/workout/components/rest-countdown";

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

export interface ExercisePrescription {
  targetSets: number;
  repRangeMin: number;
  repRangeMax: number;
  targetRir: number;
  coachNote: string | null;
}

interface ExerciseDetailScreenProps {
  exerciseId: string;
  planExerciseId: string;
  prescription: ExercisePrescription | null;
}

export function ExerciseDetailScreen({ exerciseId, planExerciseId, prescription }: ExerciseDetailScreenProps) {
  const { exercise, isLoading } = useExercise(exerciseId);
  const { data: demos } = useExerciseDemos(exerciseId);
  const [activeIndex, setActiveIndex] = useState(0);

  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const topPad = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : insets.top;

  const session = useActiveSessionStore((s) => s.session);
  const setsForExercise = useActiveSessionStore((s) => s.setsForExercise);
  const setPendingAction = useActiveSessionStore((s) => s.setPendingAction);
  const isLoggerContext = session !== null;
  const doneSets = isLoggerContext ? setsForExercise(planExerciseId) : [];
  const activeSetIndex = doneSets.length + 1;
  const restDone = useRestTimerIsDone();
  const showCta =
    isLoggerContext && prescription !== null && restDone && doneSets.length < prescription.targetSets;

  function handleClose() {
    router.back();
  }

  function handleRegister() {
    setPendingAction({ type: "openKeypad", planExerciseId, setIndex: activeSetIndex });
    router.back();
  }

  if (isLoading || !exercise) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: topPad, paddingBottom: insets.bottom }}>
        <Header title="" isLoggerContext={isLoggerContext} onClose={handleClose} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.forest[500]} />
        </View>
      </View>
    );
  }

  const coachNote = prescription?.coachNote ?? null;
  const secondaryMuscles = exercise.secondaryMuscles ?? [];
  const { steps, warning } = parseInstructions(exercise.instructions);
  const hasSteps = steps.length > 0 || warning !== null;
  const hasVideo = (demos?.length ?? 0) > 0;
  const active = hasVideo ? demos![Math.min(activeIndex, demos!.length - 1)]! : null;
  const playerWidth = windowWidth - 40;

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: topPad }}>
      <Header title={exercise.name} isLoggerContext={isLoggerContext} onClose={handleClose} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-5"
        contentContainerStyle={{ paddingBottom: showCta ? 16 : insets.bottom + 24 }}
      >
        <VStack space={4} className="pb-8">
          {prescription ? (
            <Text className="text-sm text-text-secondary font-mono">
              {prescription.targetSets}×{prescription.repRangeMin}–{prescription.repRangeMax} · RIR{" "}
              {prescription.targetRir}
            </Text>
          ) : null}

          {coachNote ? (
            <VStack space={2}>
              <Text variant="label" className="text-forest-500">Hoje</Text>
              <Card variant="accent" padding="md">
                <Text className="text-sm text-text-primary leading-relaxed">{coachNote}</Text>
              </Card>
            </VStack>
          ) : null}

          {active ? (
            <DemoPlayer playback={active.playback} width={playerWidth} deferMount />
          ) : hasSteps ? null : null}

          {active?.ownedByCoach && active.coach ? (
            <HStack space={2} align="center">
              {active.coach.avatarUrl ? (
                <Image
                  source={{ uri: active.coach.avatarUrl }}
                  style={{ width: 20, height: 20, borderRadius: 10 }}
                  contentFit="cover"
                />
              ) : (
                <Ionicons name="person-circle" size={20} color={colors.forest[500]} />
              )}
              <Text
                className="text-2xs font-semibold text-forest-500"
                accessibilityLabel={`Demonstração gravada por ${active.coach.name}, seu personal`}
              >
                {active.coach.name} · seu personal
              </Text>
            </HStack>
          ) : null}

          {demos && demos.length > 1 ? (
            <DemoSelector demos={demos} activeIndex={activeIndex} onSelect={setActiveIndex} />
          ) : null}

          {active?.coachNote ? (
            <VStack space={1}>
              <Text variant="label">Execução</Text>
              <Text className="text-sm text-text-primary leading-relaxed">{active.coachNote}</Text>
            </VStack>
          ) : null}

          {hasSteps ? (
            <ExerciseInstructions steps={steps} warning={warning} showLabel={hasVideo} />
          ) : null}

          {!hasVideo ? (
            hasSteps ? (
              <Text className="text-xs text-text-tertiary">Sem vídeo para este exercício.</Text>
            ) : null
          ) : null}

          <View className="h-px bg-border-subtle" />

          <VStack space={1}>
            <Text variant="label">Músculo primário</Text>
            <Text className="text-sm text-text-primary">{muscleLabel(exercise.primaryMuscle)}</Text>
          </VStack>

          {secondaryMuscles.length > 0 ? (
            <VStack space={2}>
              <Text variant="label">Músculos secundários</Text>
              <View className="flex-row flex-wrap gap-2">
                {secondaryMuscles.map((m) => (
                  <View key={m} className="px-3 py-1 rounded-full bg-bg-sunken border border-border-subtle">
                    <Text className="text-xs text-text-secondary">{muscleLabel(m)}</Text>
                  </View>
                ))}
              </View>
            </VStack>
          ) : null}

          <VStack space={1}>
            <Text variant="label">Equipamento</Text>
            <Text className="text-sm text-text-primary">
              {EQUIPMENT_LABEL[exercise.equipment] ?? exercise.equipment}
              {exercise.equipmentDetail ? ` · ${exercise.equipmentDetail}` : ""}
            </Text>
          </VStack>
        </VStack>
      </ScrollView>

      {showCta ? (
        <Animated.View
          entering={SlideInDown.duration(200)}
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          className="px-5 pt-3 border-t border-border-subtle bg-bg"
        >
          <Button
            label={`✓ REGISTRAR SÉRIE ${activeSetIndex}`}
            variant="solid"
            size="lg"
            fullWidth
            onPress={handleRegister}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

function Header({
  title,
  isLoggerContext,
  onClose,
}: {
  title: string;
  isLoggerContext: boolean;
  onClose: () => void;
}) {
  return (
    <Animated.View entering={FadeIn.duration(150)}>
      <HStack space={3} align="center" className="px-5 pt-2 pb-4">
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={isLoggerContext ? "Fechar e voltar ao treino" : "Fechar"}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center -ml-2"
        >
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-text-primary" numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        {isLoggerContext ? <RestCountdown /> : null}
      </HStack>
    </Animated.View>
  );
}
