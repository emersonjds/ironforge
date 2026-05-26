import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { cssInterop } from "nativewind";
import { Screen, VStack, HStack, Text, Button, Input, Logo } from "@ui/index";
import { PasswordStrengthBar } from "../components/password-strength-bar";
import { useAuthStore } from "../store";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

export function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signIn = useAuthStore((s) => s.signIn);
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role = roleParam === "coach" ? "coach" : "athlete";

  const canSubmit = !!name && !!email && password.length >= 8 && !loading;

  async function handleSignUp() {
    setLoading(true);
    setError(null);
    // TODO: signup real via features/auth/api.ts
    await new Promise((r) => setTimeout(r, 500));
    signIn(
      {
        id: "mock-user-id",
        email,
        displayName: name,
        avatarUrl: null,
        createdAt: new Date().toISOString(),
      },
      "mock-token",
      {
        userId: "mock-user-id",
        coachId: null,
        goal: "hypertrophy",
        experienceLevel: "intermediate",
        unitSystem: "kg",
        bodyweightKg: null,
        restrictions: [],
        videoPerformerPref: "any",
        onboardingCompleted: false,
      },
      role,
    );
    setLoading(false);
    router.replace(role === "coach" ? "/(coach)" : "/(onboarding)/goal");
  }

  return (
    <Screen>
      <VStack space={8} className="flex-1 pt-4">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(auth)/welcome"))}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="self-start -ml-1 h-11 px-1 justify-center"
        >
          <Text className="text-text-secondary text-base">← voltar</Text>
        </Pressable>

        <VStack space={6} className="flex-1">
          <HStack space={3} align="center">
            <Logo size={48} />
            <Text className="font-display text-xl font-bold text-text-primary tracking-tight">
              IRONFORGE
            </Text>
          </HStack>

          <VStack space={2}>
            <Text variant="title">Crie sua conta.</Text>
            <Text variant="bodySmall">Leva 2 minutos. Sem cartão.</Text>
          </VStack>

          <VStack space={5} className="pt-1">
            <Input
              label="Como quer ser chamado"
              placeholder="Seu primeiro nome"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Email"
              placeholder="voce@exemplo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              value={email}
              onChangeText={setEmail}
            />
            <VStack space={2}>
              <Input
                label="Senha"
                placeholder="••••••••"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="done"
                hint={password.length === 0 ? "mínimo 8 caracteres" : undefined}
                value={password}
                onChangeText={setPassword}
              />
              <PasswordStrengthBar password={password} />
            </VStack>
          </VStack>

          {error ? (
            <View
              accessibilityLiveRegion="polite"
              className="bg-error-muted border-l-2 border-error rounded-xs px-4 py-3"
            >
              <Text className="text-error text-sm">{error}</Text>
            </View>
          ) : null}

          <Button
            label={loading ? "Criando conta..." : "CRIAR CONTA"}
            variant="solid"
            size="xl"
            fullWidth
            className="mt-1"
            disabled={!canSubmit}
            onPress={handleSignUp}
            leading={loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : undefined}
          />

          <Link href={{ pathname: "/(auth)/sign-in", params: { role } }} asChild>
            <Pressable accessibilityRole="link" className="self-center h-11 justify-center">
              <Text className="text-sm text-text-secondary text-center">
                Já tem conta? <Text className="text-forest-500 font-semibold">Entrar</Text>
              </Text>
            </Pressable>
          </Link>
        </VStack>
      </VStack>
    </Screen>
  );
}
