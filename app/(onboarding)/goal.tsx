import { useState } from "react";
import { Pressable, View } from "react-native";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Button } from "@ui/index";
import { useOnboardingDraftStore } from "@features/auth/store/onboarding-draft.store";
import type { Goal, Experience, UnitSystem } from "@/types/enums";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

const EXPERIENCE_OPTIONS: { value: Experience; label: string; sub: string }[] = [
  { value: "beginner", label: "Iniciante", sub: "menos de 1 ano" },
  { value: "intermediate", label: "Intermediário", sub: "1 a 3 anos" },
  { value: "advanced", label: "Avançado", sub: "mais de 3 anos" },
];

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: "hypertrophy", label: "Hipertrofia" },
  { value: "strength", label: "Força pura" },
  { value: "cutting", label: "Definição" },
  { value: "recomp", label: "Recomposição" },
];

function SelectChip({
  label,
  sub,
  selected,
  onPress,
}: {
  label: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      className={`rounded-xl border px-5 py-4 active:opacity-80 ${
        selected ? "bg-forest-500 border-forest-500" : "bg-bg-raised border-border"
      }`}
    >
      <VStack space={0}>
        <Text
          className={`text-sm font-bold ${selected ? "" : "text-text-primary"}`}
          style={selected ? { color: "#FFFFFF" } : undefined}
        >
          {label}
        </Text>
        {sub ? (
          <Text
            className={`text-xs ${selected ? "" : "text-text-tertiary"}`}
            style={selected ? { color: "rgba(255,255,255,0.7)" } : undefined}
          >
            {sub}
          </Text>
        ) : null}
      </VStack>
    </Pressable>
  );
}

export default function OnboardingGoal() {
  const setStep1 = useOnboardingDraftStore((s) => s.setStep1);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [unit, setUnit] = useState<UnitSystem>("kg");

  const canContinue = experience !== null && goal !== null;

  function handleContinue() {
    if (!experience || !goal) return;
    setStep1({ goal, experienceLevel: experience, unitSystem: unit });
    router.push("/(onboarding)/restrictions");
  }

  return (
    <Screen padded>
      <VStack space={8} className="flex-1 pt-8 pb-6">
        {/* Progress */}
        <VStack space={2}>
          <HStack space={2}>
            {[true, false].map((active, i) => (
              <View
                key={i}
                className={`h-1 flex-1 rounded-full ${active ? "bg-forest-500" : "bg-border"}`}
              />
            ))}
          </HStack>
          <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Passo 1 de 2</Text>
        </VStack>

        <VStack space={1}>
          <Text variant="title">Como você treina?</Text>
          <Text variant="bodySmall">Leva 30 segundos.</Text>
        </VStack>

        <VStack space={6} className="flex-1">
          {/* Experiência */}
          <VStack space={3}>
            <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Experiência</Text>
            <VStack space={2}>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <SelectChip
                  key={opt.value}
                  label={opt.label}
                  sub={opt.sub}
                  selected={experience === opt.value}
                  onPress={() => setExperience(opt.value)}
                />
              ))}
            </VStack>
          </VStack>

          {/* Objetivo */}
          <VStack space={3}>
            <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Objetivo</Text>
            <View className="flex-row flex-wrap gap-2">
              {GOAL_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setGoal(opt.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: goal === opt.value }}
                  className={`rounded-xl border px-5 py-3 active:opacity-80 ${
                    goal === opt.value
                      ? "bg-forest-500 border-forest-500"
                      : "bg-bg-raised border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${goal === opt.value ? "" : "text-text-primary"}`}
                    style={goal === opt.value ? { color: "#FFFFFF" } : undefined}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </VStack>

          {/* Unidade */}
          <VStack space={3}>
            <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Unidade de peso</Text>
            <HStack space={2}>
              {(["kg", "lb"] as UnitSystem[]).map((u) => (
                <Pressable
                  key={u}
                  onPress={() => setUnit(u)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: unit === u }}
                  className={`flex-1 rounded-xl border py-3 items-center active:opacity-80 ${
                    unit === u ? "bg-forest-500 border-forest-500" : "bg-bg-raised border-border"
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${unit === u ? "" : "text-text-primary"}`}
                    style={unit === u ? { color: "#FFFFFF" } : undefined}
                  >
                    {u}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </VStack>
        </VStack>

        <Button
          label="CONTINUAR"
          variant="solid"
          size="xl"
          fullWidth
          disabled={!canContinue}
          onPress={handleContinue}
        />
      </VStack>
    </Screen>
  );
}
