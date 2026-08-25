import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { cssInterop } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { Text, VStack, HStack } from "@ui/index";
import { colors } from "@theme/colors";
import { useExerciseDemos } from "../hooks/use-exercise-demos";
import { resolveDemoState } from "../lib/resolve-demo-state";
import { DemoPlayer } from "./demo-player";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

interface ExerciseDemoSectionProps {
  exerciseId: string;
}

export function ExerciseDemoSection({ exerciseId }: ExerciseDemoSectionProps) {
  const { data: demos, isLoading, isError } = useExerciseDemos(exerciseId);
  const [activeIndex, setActiveIndex] = useState(0);

  const state = resolveDemoState({ demos, isLoading, isError });

  if (state === "loading") {
    return (
      <View className="items-center justify-center py-6">
        <ActivityIndicator color={colors.forest[500]} />
      </View>
    );
  }

  if (state === "empty") {
    return <Text className="text-xs text-text-tertiary">Sem vídeo para este exercício.</Text>;
  }

  if (state === "error") {
    return <Text className="text-xs text-text-tertiary">Não foi possível carregar o vídeo agora.</Text>;
  }

  const active = demos![Math.min(activeIndex, demos!.length - 1)]!;

  return (
    <VStack space={3}>
      <DemoPlayer playback={active.playback} />

      {active.ownedByCoach && active.coach ? (
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

      {active.coachNote ? (
        <VStack space={1}>
          <Text variant="label">Execução</Text>
          <Text className="text-sm text-text-primary leading-relaxed">{active.coachNote}</Text>
        </VStack>
      ) : null}

      {demos!.length > 1 ? (
        <VStack space={2}>
          <Text variant="label">Outras demonstrações</Text>
          <HStack space={2} className="flex-wrap">
            {demos!.map((demo, index) => (
              <Pressable
                key={demo.videoId}
                onPress={() => setActiveIndex(index)}
                accessibilityRole="button"
                accessibilityLabel={`Ver demonstração: ${demo.title}`}
                hitSlop={8}
                className={`min-h-11 px-3 justify-center rounded-lg border ${
                  index === activeIndex ? "border-forest-500 bg-forest-100/40" : "border-border-subtle"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    index === activeIndex ? "text-forest-500" : "text-text-tertiary"
                  }`}
                  numberOfLines={1}
                >
                  {demo.title}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </VStack>
      ) : null}
    </VStack>
  );
}
