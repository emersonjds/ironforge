import { useState } from "react";
import { Pressable, View, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Button, Card } from "@ui/index";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@theme/colors";
import { useAuthStore } from "@features/auth/store";
import { useOnboardingDraftStore } from "@features/auth/store/onboarding-draft.store";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(ScrollView, { className: "style" });

interface RestrictionOption {
  value: string;
  label: string;
}

const RESTRICTION_OPTIONS: RestrictionOption[] = [
  { value: "joelho_direito", label: "Joelho direito" },
  { value: "joelho_esquerdo", label: "Joelho esquerdo" },
  { value: "ombro_direito", label: "Ombro direito" },
  { value: "ombro_esquerdo", label: "Ombro esquerdo" },
  { value: "lombar", label: "Lombar" },
  { value: "cervical", label: "Cervical" },
  { value: "quadril", label: "Quadril" },
  { value: "punho_antebraco", label: "Punho / antebraço" },
  { value: "tornozelo", label: "Tornozelo" },
];

export default function OnboardingRestrictions() {
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const { goal, experienceLevel, unitSystem, reset } = useOnboardingDraftStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bodyweightInput, setBodyweightInput] = useState("");
  const [saving, setSaving] = useState(false);

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function handleComplete() {
    setSaving(true);
    const parsed = parseFloat(bodyweightInput.replace(",", "."));
    const bodyweightKg = !isNaN(parsed) && parsed > 0 ? parsed : null;
    completeOnboarding({
      goal: goal ?? "hypertrophy",
      experienceLevel: experienceLevel ?? "intermediate",
      unitSystem: unitSystem,
      bodyweightKg,
      restrictions: Array.from(selected),
      onboardingCompleted: true,
    });
    reset();
    router.replace("/(app)");
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
    <Screen edges={["top", "bottom"]} padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pt-8 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <VStack space={8}>
          {/* Progress */}
          <VStack space={2}>
            <HStack space={2}>
              {[true, true].map((active, i) => (
                <View
                  key={i}
                  className={`h-1 flex-1 rounded-full ${active ? "bg-forest-500" : "bg-border"}`}
                />
              ))}
            </HStack>
            <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Passo 2 de 2</Text>
          </VStack>

          <VStack space={1}>
            <Text variant="title">Mais alguns dados</Text>
            <Text variant="bodySmall">Leva 30 segundos.</Text>
          </VStack>

          {/* Peso corporal */}
          <VStack space={3}>
            <Text className="text-2xs text-text-tertiary uppercase tracking-widest">
              Peso corporal ({unitSystem})
            </Text>
            <View className="flex-row items-center bg-bg-raised border border-border rounded-xl px-4 h-14">
              <TextInput
                value={bodyweightInput}
                onChangeText={setBodyweightInput}
                placeholder={`Ex.: 80`}
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                returnKeyType="done"
                className="flex-1 text-base text-text-primary font-semibold"
                style={{ color: colors.text.primary }}
                maxLength={6}
              />
              <Text className="text-sm text-text-tertiary ml-2">{unitSystem}</Text>
            </View>
            <Text className="text-2xs text-text-disabled -mt-1">
              Opcional. Usado para calcular volume relativo ao seu peso.
            </Text>
          </VStack>

          {/* Restriction list */}
          <Card variant="raised" padding="none">
            {RESTRICTION_OPTIONS.map((opt, i) => {
              const isSelected = selected.has(opt.value);
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => toggle(opt.value)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  className={`h-14 px-4 flex-row items-center gap-3 active:bg-bg-sunken ${
                    i > 0 ? "border-t border-border-subtle" : ""
                  }`}
                >
                  <View
                    className={`w-5 h-5 rounded items-center justify-center ${
                      isSelected ? "bg-forest-500" : "border border-border"
                    }`}
                  >
                    {isSelected ? (
                      <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <Text className="text-sm text-text-primary flex-1">{opt.label}</Text>
                </Pressable>
              );
            })}
          </Card>

          {/* Skip option */}
          <Pressable
            onPress={() => setSelected(new Set())}
            hitSlop={8}
            className="items-center active:opacity-60"
          >
            <Text className="text-sm text-forest-500">Nenhuma restrição por enquanto</Text>
          </Pressable>

          <Button
            label={saving ? "Salvando…" : "CONCLUIR"}
            variant="solid"
            size="xl"
            fullWidth
            disabled={saving}
            onPress={handleComplete}
          />

          <Text className="text-2xs text-text-disabled text-center">
            Você pode ajustar isso depois em Perfil.
          </Text>
        </VStack>
      </ScrollView>
    </Screen>
    </KeyboardAvoidingView>
  );
}
