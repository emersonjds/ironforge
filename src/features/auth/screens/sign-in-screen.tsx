import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { cssInterop } from "nativewind";
import { Screen, VStack, HStack, Text, Button, Input, Logo } from "@ui/index";
import { useAuthStore } from "../store";
import { DevLoginPicker } from "../components/dev-login-picker";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

export function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signIn = useAuthStore((s) => s.signIn);
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role = roleParam === "coach" ? "coach" : "athlete";

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    // TODO: auth real via features/auth/api.ts
    await new Promise((r) => setTimeout(r, 500));
    signIn(
      {
        id: "mock-user-id",
        email,
        displayName: email.split("@")[0] ?? "lifter",
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
        onboardingCompleted: true,
      },
      role,
    );
    setLoading(false);
    router.replace(role === "coach" ? "/(coach)" : "/(app)");
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
          {/* Marca */}
          <HStack space={3} align="center">
            <Logo size={48} />
            <Text className="font-display text-xl font-bold text-text-primary tracking-tight">
              IRONFORGE
            </Text>
          </HStack>

          <VStack space={2}>
            <Text variant="title">Bem-vindo de volta.</Text>
            <Text variant="bodySmall">Entre para continuar sua evolução.</Text>
          </VStack>

          <VStack space={5} className="pt-1">
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
            <Input
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              value={password}
              onChangeText={setPassword}
              error={error ?? undefined}
              onSubmitEditing={() => {
                if (email && password && !loading) handleSignIn();
              }}
            />
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
            label={loading ? "Entrando..." : "ENTRAR"}
            variant="solid"
            size="xl"
            fullWidth
            className="mt-1"
            disabled={loading || !email || !password}
            onPress={handleSignIn}
            leading={loading ? <ActivityIndicator size="small" color="#FFFFFF" /> : undefined}
          />

          <Link href={{ pathname: "/(auth)/sign-up", params: { role } }} asChild>
            <Pressable accessibilityRole="link" className="self-center h-11 justify-center">
              <Text className="text-sm text-text-secondary text-center">
                Não tem conta? <Text className="text-forest-500 font-semibold">Criar conta</Text>
              </Text>
            </Pressable>
          </Link>

          <DevLoginPicker />
        </VStack>
      </VStack>
    </Screen>
  );
}
