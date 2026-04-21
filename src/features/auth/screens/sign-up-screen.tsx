import { useState } from "react";
import { router } from "expo-router";
import { Screen, VStack, Text, Button, Input } from "@ui/index";
import { useAuthStore } from "../store";

export function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);

  async function handleSignUp() {
    setLoading(true);
    // TODO: real signup via features/auth/api.ts
    await new Promise((r) => setTimeout(r, 500));
    signIn(
      {
        id: "mock-user-id",
        email,
        displayName: name,
        unitSystem: "kg",
        experienceLevel: "intermediate",
        goal: "hypertrophy",
        onboardingCompleted: false,
      },
      "mock-token",
    );
    setLoading(false);
    router.replace("/(onboarding)/goal");
  }

  return (
    <Screen>
      <VStack space={8} className="flex-1 justify-center">
        <VStack space={2}>
          <Text variant="title">Criar conta</Text>
          <Text variant="bodySmall">3 minutos pra acender a forja.</Text>
        </VStack>

        <VStack space={4}>
          <Input
            label="Nome"
            placeholder="Como quer ser chamado"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Email"
            placeholder="voce@exemplo.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Senha"
            placeholder="mínimo 8 caracteres"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </VStack>

        <Button
          label={loading ? "Criando..." : "Criar conta"}
          variant="solid"
          size="xl"
          fullWidth
          disabled={loading || !name || !email || password.length < 8}
          onPress={handleSignUp}
        />
      </VStack>
    </Screen>
  );
}
