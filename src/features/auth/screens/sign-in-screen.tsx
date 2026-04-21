import { useState } from "react";
import { router } from "expo-router";
import { Screen, VStack, Text, Button, Input } from "@ui/index";
import { useAuthStore } from "../store";

export function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signIn = useAuthStore((s) => s.signIn);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    // TODO: real auth via features/auth/api.ts
    // Mock success for Phase 1
    await new Promise((r) => setTimeout(r, 500));
    signIn(
      {
        id: "mock-user-id",
        email,
        displayName: email.split("@")[0] ?? "lifter",
        unitSystem: "kg",
        experienceLevel: "intermediate",
        goal: "hypertrophy",
        onboardingCompleted: true,
      },
      "mock-token",
    );
    setLoading(false);
    router.replace("/(app)");
  }

  return (
    <Screen>
      <VStack space={8} className="flex-1 justify-center">
        <VStack space={2}>
          <Text variant="title">Entrar</Text>
          <Text variant="bodySmall">Forja acesa. Bem-vindo de volta.</Text>
        </VStack>

        <VStack space={4}>
          <Input
            label="Email"
            placeholder="voce@exemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Senha"
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            error={error ?? undefined}
          />
        </VStack>

        <Button
          label={loading ? "Entrando..." : "Entrar"}
          variant="solid"
          size="xl"
          fullWidth
          disabled={loading || !email || !password}
          onPress={handleSignIn}
        />
      </VStack>
    </Screen>
  );
}
