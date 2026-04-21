import { useState } from "react";
import { Pressable, View } from "react-native";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Button } from "@ui/index";
import { useAuthStore } from "@features/auth/store";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

type Goal = "hypertrophy" | "strength" | "cutting" | "recomp";

const GOAL_OPTIONS: { value: Goal; label: string; sub: string }[] = [
  { value: "hypertrophy", label: "Hipertrofia", sub: "ganhar massa muscular" },
  { value: "strength", label: "Força pura", sub: "aumentar 1RM nos lifts base" },
  { value: "cutting", label: "Cutting", sub: "perder gordura preservando músculo" },
  { value: "recomp", label: "Recomposição", sub: "ganhar músculo e perder gordura" },
];

export default function OnboardingGoal() {
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const [selected, setSelected] = useState<Goal | null>(null);

  function handleContinue() {
    if (!selected) return;
    completeOnboarding({ goal: selected });
    router.replace("/(app)");
  }

  return (
    <Screen>
      <VStack space={10} className="flex-1 pt-8 pb-8">
        {/* Progress indicator */}
        <VStack space={3}>
          <HStack space={2}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                className={`h-1 flex-1 rounded-full ${i === 0 ? "bg-ember-500" : "bg-border"}`}
              />
            ))}
          </HStack>
          <Text className="text-2xs text-text-tertiary uppercase tracking-widest">1 de 4</Text>
        </VStack>

        <VStack space={2}>
          <Text variant="title">Qual seu objetivo?</Text>
          <Text variant="bodySmall">Calibra volume, carga e sugestões de progresso.</Text>
        </VStack>

        <VStack space={3} className="flex-1">
          {GOAL_OPTIONS.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setSelected(opt.value)}
                className={`rounded-xl border px-5 py-5 active:bg-bg-sunken ${
                  isSelected
                    ? "bg-ember-500/15 border-ember-500"
                    : "bg-bg-raised border-border"
                }`}
              >
                <VStack space={1}>
                  <Text className={`text-base font-bold ${isSelected ? "text-ember-400" : "text-text-primary"}`}>
                    {opt.label}
                  </Text>
                  <Text className="text-xs text-text-tertiary">{opt.sub}</Text>
                </VStack>
              </Pressable>
            );
          })}
        </VStack>

        <Button
          label="CONTINUAR"
          variant="solid"
          size="xl"
          fullWidth
          disabled={!selected}
          onPress={handleContinue}
        />
      </VStack>
    </Screen>
  );
}
