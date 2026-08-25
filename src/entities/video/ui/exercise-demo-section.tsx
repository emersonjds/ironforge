import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { cssInterop } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { Text, VStack, HStack, Card } from "@ui/index";
import { colors } from "@theme/colors";
import { useExerciseDemos } from "../hooks/use-exercise-demos";
import { DemoPlayer } from "./demo-player";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

interface ExerciseDemoSectionProps {
  exerciseId: string;
}

export function ExerciseDemoSection({ exerciseId }: ExerciseDemoSectionProps) {
  const { data: demos, isLoading, isError } = useExerciseDemos(exerciseId);
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading && !demos) {
    return (
      <Card variant="raised" padding="lg">
        <View className="items-center justify-center py-6">
          <ActivityIndicator color={colors.forest[500]} />
        </View>
      </Card>
    );
  }

  if (!demos || demos.length === 0) {
    return (
      <Card variant="raised" padding="md">
        <HStack space={3} align="center">
          <View className="w-10 h-10 rounded-lg bg-surface-300 items-center justify-center">
            <Text className="text-lg">▷</Text>
          </View>
          <VStack space={1} className="flex-1">
            <Text className="text-sm font-semibold text-text-secondary">Vídeo demonstrativo</Text>
            <Text className="text-xs text-text-disabled">
              {isError ? "Não foi possível carregar o vídeo agora." : "Sem demonstração cadastrada."}
            </Text>
          </VStack>
        </HStack>
      </Card>
    );
  }

  const active = demos[Math.min(activeIndex, demos.length - 1)]!;

  return (
    <VStack space={3}>
      <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Vídeo demonstrativo</Text>

      <DemoPlayer playback={active.playback} />

      <HStack space={2} align="center" className="flex-wrap">
        <Text className="text-sm font-semibold text-text-primary flex-1" numberOfLines={1}>
          {active.title}
        </Text>
        {active.ownedByCoach && active.coach ? (
          <HStack space={1} align="center" className="px-2 py-0.5 rounded-full bg-forest-100">
            {active.coach.avatarUrl ? (
              <Image
                source={{ uri: active.coach.avatarUrl }}
                style={{ width: 16, height: 16, borderRadius: 8 }}
                contentFit="cover"
              />
            ) : (
              <Ionicons name="person-circle" size={16} color={colors.forest[500]} />
            )}
            <Text className="text-2xs font-bold text-forest-500" numberOfLines={1}>
              {active.coach.name}
            </Text>
          </HStack>
        ) : null}
      </HStack>

      {active.coachNote ? (
        <Card variant="accent" padding="md">
          <VStack space={1}>
            <Text className="text-2xs text-forest-500 uppercase tracking-widest">Execução</Text>
            <Text className="text-sm text-text-primary leading-relaxed">{active.coachNote}</Text>
          </VStack>
        </Card>
      ) : null}

      {demos.length > 1 ? (
        <HStack space={2} className="flex-wrap">
          {demos.map((demo, index) => (
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
      ) : null}
    </VStack>
  );
}
