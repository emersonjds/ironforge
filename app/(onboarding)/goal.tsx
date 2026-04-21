import { router } from "expo-router";
import { Screen, VStack, Text, Button } from "@ui/index";
import { useAuthStore } from "@features/auth/store";

export default function OnboardingGoal() {
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  function handleContinue(goal: "hypertrophy" | "strength" | "cutting" | "recomp") {
    completeOnboarding({ goal });
    router.replace("/(app)");
  }

  return (
    <Screen>
      <VStack space={8} className="flex-1 justify-center">
        <VStack space={2}>
          <Text variant="caption">passo 1 de 8</Text>
          <Text variant="title">Qual seu objetivo?</Text>
          <Text variant="bodySmall">Calibra a sugestão de carga e volume.</Text>
        </VStack>

        <VStack space={3}>
          <Button
            label="Hipertrofia"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => handleContinue("hypertrophy")}
          />
          <Button
            label="Força pura"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => handleContinue("strength")}
          />
          <Button
            label="Cutting"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => handleContinue("cutting")}
          />
          <Button
            label="Recomposição"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => handleContinue("recomp")}
          />
        </VStack>
      </VStack>
    </Screen>
  );
}
