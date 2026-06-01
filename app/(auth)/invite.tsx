import { useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { cssInterop } from "nativewind";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, VStack, HStack, Text, Button, Card } from "@ui/index";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@theme/colors";
import { decodeMockInviteToken } from "@entities/invite";
import type { InviteToken } from "@entities/invite";

cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

type ScreenState = "loading" | "invalid" | "expired" | "ready" | "accepting";

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [state, setState] = useState<ScreenState>("loading");
  const [invite, setInvite] = useState<InviteToken | null>(null);

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    const decoded = decodeMockInviteToken(token);
    if (!decoded) {
      setState("invalid");
      return;
    }
    const expired = new Date(decoded.expiresAt) < new Date();
    if (expired) {
      setState("expired");
      return;
    }
    setInvite(decoded);
    setState("ready");
  }, [token]);

  async function handleAccept() {
    setState("accepting");
    // Mock: just navigate to onboarding
    router.replace("/(onboarding)/goal");
  }

  function handleDecline() {
    router.replace("/(auth)/welcome");
  }

  if (state === "loading") {
    return (
      <Screen edges={["top", "bottom"]} padded>
        <VStack space={4} className="flex-1 items-center justify-center">
          <Text variant="bodySmall">Carregando convite…</Text>
        </VStack>
      </Screen>
    );
  }

  if (state === "invalid" || state === "expired") {
    return (
      <Screen edges={["top", "bottom"]} padded>
        <VStack space={6} className="flex-1 pt-8">
          <Text className="text-2xs text-text-tertiary uppercase tracking-widest text-center">
            Convite de personal
          </Text>
          <Card variant="raised" padding="lg">
            <VStack space={4} className="items-center">
              <View className="w-16 h-16 rounded-full bg-surface-300 items-center justify-center">
                <Ionicons name="link-outline" size={28} color={colors.text.tertiary} />
              </View>
              <Text className="text-lg font-bold text-text-primary text-center">
                {state === "expired" ? "Convite expirado" : "Convite inválido"}
              </Text>
              <Text className="text-sm text-text-secondary text-center">
                {state === "expired"
                  ? "Este convite expirou. Peça ao personal um novo link."
                  : "Este convite não é mais válido ou já foi utilizado."}
              </Text>
            </VStack>
          </Card>
          <Button
            label="Ir para o início"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => router.replace("/(auth)/welcome")}
          />
        </VStack>
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "bottom"]} padded>
      <VStack space={6} className="flex-1 pt-8 pb-4">
        <Text className="text-2xs text-text-tertiary uppercase tracking-widest text-center mb-2">
          Convite de personal
        </Text>

        <Card variant="raised" padding="lg">
          <VStack space={5} className="items-center">
            {invite?.coachAvatarUrl ? (
              <Image
                source={{ uri: invite.coachAvatarUrl }}
                style={{ width: 72, height: 72, borderRadius: 36 }}
                contentFit="cover"
              />
            ) : (
              <View className="w-18 h-18 rounded-full bg-forest-100 items-center justify-center">
                <Ionicons name="person" size={32} color={colors.forest[500]} />
              </View>
            )}

            <VStack space={1} className="items-center">
              <Text className="text-xl font-bold text-text-primary text-center">
                {invite?.coachName}
              </Text>
              <Text className="text-sm text-text-secondary text-center">Personal Trainer</Text>
            </VStack>

            {invite?.coachBio ? (
              <>
                <View className="w-full h-px bg-border-subtle" />
                <Text className="text-sm text-text-secondary text-center leading-relaxed">
                  {invite.coachBio}
                </Text>
              </>
            ) : null}

            <View className="w-full h-px bg-border-subtle" />

            <Text className="text-sm text-text-secondary text-center leading-relaxed">
              Você receberá treinos personalizados, acompanhamento de evolução e suporte direto deste profissional.
            </Text>
          </VStack>
        </Card>

        <VStack space={3} className="mt-auto">
          <Button
            label={state === "accepting" ? "Aguarde…" : "ACEITAR CONVITE"}
            variant="solid"
            size="lg"
            fullWidth
            disabled={state === "accepting"}
            onPress={handleAccept}
          />
          <Pressable
            onPress={handleDecline}
            hitSlop={8}
            className="py-2 items-center active:opacity-60"
          >
            <Text className="text-sm text-text-tertiary">Recusar convite</Text>
          </Pressable>
          <Text className="text-2xs text-text-disabled text-center px-4">
            Ao aceitar, seu progresso e treinos ficam visíveis ao personal.
            Você pode encerrar o vínculo a qualquer momento em Perfil.
          </Text>
        </VStack>
      </VStack>
    </Screen>
  );
}
