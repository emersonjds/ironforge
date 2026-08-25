import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { cssInterop } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Input, Card } from "@ui/index";
import { colors } from "@theme/colors";
import { EXERCISE_CATALOG } from "@entities/exercise/catalog";
import { muscleLabel } from "@entities/exercise/lib/muscle-labels";
import { ExerciseDemoSection } from "@entities/video";
import type { Exercise } from "@entities/exercise";
import { VideoUploader } from "../components/video-uploader";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

export function ExerciseVideoLibraryScreen() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Exercise | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return EXERCISE_CATALOG;
    return EXERCISE_CATALOG.filter((ex) => ex.name.toLowerCase().includes(q));
  }, [query]);

  if (selected) {
    return (
      <Screen edges={["top"]}>
        <VStack space={4} className="flex-1 pt-2">
          <Pressable
            onPress={() => setSelected(null)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a lista de exercícios"
            className="h-9 w-9 -ml-1 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>

          <VStack space={1}>
            <Text variant="title">{selected.name}</Text>
            <Text variant="bodySmall">{muscleLabel(selected.primaryMuscle)}</Text>
          </VStack>

          <VStack space={5} className="flex-1">
            <ExerciseDemoSection exerciseId={selected.id} />
            <VStack space={2}>
              <Text variant="label">Adicionar demonstração</Text>
              <VideoUploader
                exerciseId={selected.id}
                exerciseName={selected.name}
                onLinked={() => setSelected({ ...selected })}
              />
            </VStack>
          </VStack>
        </VStack>
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]}>
      <VStack space={4} className="flex-1 pt-2">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(coach)"))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="h-9 w-9 -ml-1 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>

        <VStack space={1}>
          <Text variant="title">Vídeos de exercícios</Text>
          <Text variant="bodySmall">Envie ou vincule uma demonstração para seus alunos verem no treino.</Text>
        </VStack>

        <Input
          placeholder="Buscar exercício…"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          accessibilityLabel="Buscar exercício"
        />

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelected(item)}
              accessibilityRole="button"
              accessibilityLabel={`Ver vídeos de ${item.name}`}
              className="py-1"
            >
              <Card variant="raised" padding="md">
                <HStack justify="between" align="center">
                  <VStack space={1} className="flex-1 mr-2">
                    <Text className="text-sm font-semibold text-text-primary">{item.name}</Text>
                    <Text variant="caption" className="normal-case tracking-normal">
                      {muscleLabel(item.primaryMuscle)}
                    </Text>
                  </VStack>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                </HStack>
              </Card>
            </Pressable>
          )}
        />
      </VStack>
    </Screen>
  );
}
