import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { cssInterop } from "nativewind";
import { Screen, VStack, Text, Button, Input } from "@ui/index";
import { useAuthStore } from "../store";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

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
      <VStack space={10} className="flex-1 pt-8">
        {/* Back nav */}
        <Pressable onPress={() => router.back()} className="self-start -ml-1 h-11 px-1 justify-center">
          <Text className="text-text-secondary text-base">← voltar</Text>
        </Pressable>

        <VStack space={6} className="flex-1 justify-center">
          <VStack space={2}>
            <Text variant="title">Criar conta</Text>
            <Text variant="bodySmall">Leva 2 minutos. Sem cartão.</Text>
          </VStack>

          <View className="pt-2">
            <VStack space={5}>
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
          </View>

          <View className="pt-4">
            <Button
              label={loading ? "Criando conta..." : "CRIAR CONTA"}
              variant="solid"
              size="xl"
              fullWidth
              disabled={loading || !name || !email || password.length < 8}
              onPress={handleSignUp}
            />
          </View>
        </VStack>
      </VStack>
    </Screen>
  );
}
