import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { Text, HStack } from "@ui/index";
import type { ExerciseDemo } from "../schema";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

interface DemoSelectorProps {
  demos: ExerciseDemo[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

function demoThumbnailUrl(demo: ExerciseDemo): string | null {
  if (demo.playback.kind === "unavailable") return null;
  return demo.playback.thumbnailUrl;
}

export function DemoSelector({ demos, activeIndex, onSelect }: DemoSelectorProps) {
  if (demos.length <= 1) return null;

  return (
    <View>
      <Text variant="label" className="mb-2">Outras demonstrações</Text>
      <HStack space={2} className="flex-wrap">
        {demos.map((demo, index) => {
          const selected = index === activeIndex;
          const thumbnailUrl = demoThumbnailUrl(demo);
          return (
            <Pressable
              key={demo.videoId}
              onPress={() => onSelect(index)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={
                demo.ownedByCoach
                  ? `Demonstração de ${demo.coach?.name ?? "seu personal"}, seu personal`
                  : "Demonstração do catálogo"
              }
              className={`rounded-lg overflow-hidden border-2 ${
                selected ? "border-forest-500" : "border-transparent"
              }`}
            >
              <View className="w-24 h-14 bg-bg-sunken items-center justify-center">
                {thumbnailUrl ? (
                  <Image source={{ uri: thumbnailUrl }} style={{ width: 96, height: 56 }} contentFit="cover" />
                ) : (
                  <Ionicons name="videocam-off-outline" size={16} color="#9CA3AF" />
                )}
                {selected ? (
                  <View className="absolute top-1 right-1 h-4 w-4 rounded-full bg-forest-500 items-center justify-center">
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                ) : null}
              </View>
              <Text className="text-2xs text-text-tertiary text-center py-1 w-24" numberOfLines={1}>
                {demo.ownedByCoach ? (demo.coach?.name ?? "Personal") : "Catálogo"}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </View>
  );
}
