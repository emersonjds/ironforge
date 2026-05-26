import { View, Alert, ScrollView } from "react-native";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Card, Button, Divider } from "@ui/index";
import { useAuthStore } from "@features/auth/store";

cssInterop(View, { className: "style" });
cssInterop(ScrollView, { className: "style" });

const GOAL_LABEL: Record<string, string> = {
  hypertrophy: "Hipertrofia",
  strength: "Força pura",
  cutting: "Cutting",
  recomp: "Recomposição",
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const athleteProfile = useAuthStore((s) => s.athleteProfile);
  const signOut = useAuthStore((s) => s.signOut);

  function confirmSignOut() {
    Alert.alert("Sair da conta?", "Você precisará logar novamente.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  }

  const initials = (user?.displayName ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Screen edges={["top"]} padded={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-8 pb-12">
        <VStack space={8}>
        <VStack space={2}>
          <Text className="text-2xs text-text-tertiary uppercase tracking-widest">PERFIL</Text>
          <Text variant="title">Sua conta</Text>
        </VStack>

        {/* Avatar card */}
        <Card variant="raised" padding="xl">
          <HStack space={5} align="center">
            <View className="w-16 h-16 rounded-full bg-ember-500/15 border-2 border-ember-500/60 items-center justify-center">
              <Text className="text-xl font-bold text-ember-400">{initials}</Text>
            </View>
            <VStack space={1} className="flex-1">
              <Text className="text-lg font-bold text-text-primary">{user?.displayName ?? "—"}</Text>
              <Text className="text-sm text-text-tertiary">{user?.email ?? "—"}</Text>
            </VStack>
          </HStack>
        </Card>

        {/* Treino settings */}
        <Card variant="raised" padding="none">
          <View className="px-5 pt-5 pb-3">
            <Text variant="label" className="mb-4">TREINO</Text>
            <Row label="Objetivo" value={GOAL_LABEL[athleteProfile?.goal ?? "hypertrophy"] ?? "—"} />
            <Divider className="my-2" />
            <Row label="Nível" value={LEVEL_LABEL[athleteProfile?.experienceLevel ?? "intermediate"] ?? "—"} />
            <Divider className="my-2" />
            <Row label="Unidade" value={athleteProfile?.unitSystem?.toUpperCase() ?? "KG"} />
          </View>
        </Card>

        {/* App settings */}
        <Card variant="raised" padding="none">
          <View className="px-5 pt-5 pb-3">
            <Text variant="label" className="mb-4">APP</Text>
            <Row label="Notificações" value="em breve" disabled />
            <Divider className="my-2" />
            <Row label="Integração Health" value="em breve" disabled />
            <Divider className="my-2" />
            <Row label="Sobre" value="IronForge v0.1" />
          </View>
        </Card>

        <Button
          label="Sair da conta"
          variant="outline"
          size="md"
          fullWidth
          onPress={confirmSignOut}
        />
        </VStack>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, disabled }: { label: string; value: string; disabled?: boolean }) {
  return (
    <HStack justify="between" align="center" className="py-3">
      <Text variant="body" className={disabled ? "text-text-tertiary" : "text-text-primary"}>
        {label}
      </Text>
      <Text variant="bodySmall" className={disabled ? "text-text-tertiary" : "text-text-secondary"}>
        {value}
      </Text>
    </HStack>
  );
}
