import { View, Alert, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Card, Button, Divider, AppHeader } from "@ui/index";
import { colors } from "@theme/colors";
import { useAuthStore } from "@features/auth/store";
import {
  mockUser,
  mockMembership,
  mockProfileStats,
  mockPersonalRecord,
  mockCoach,
  mockAthleteProfile,
  type ProfileStat,
} from "@shared/mocks";

cssInterop(View, { className: "style" });
cssInterop(ScrollView, { className: "style" });
cssInterop(Pressable, { className: "style" });

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
  const signOut = useAuthStore((s) => s.signOut);

  function confirmSignOut() {
    Alert.alert("Sair da conta?", "Você precisará entrar novamente.", [
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

  return (
    <Screen edges={["top"]} padded={false}>
      <AppHeader
        avatarUrl={mockUser.avatarUrl}
        hasNotifications
        onPressBell={() => router.push("/(app)/notifications")}
        onPressAvatar={() => router.push("/(app)/profile")}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-1 pb-28">
          <VStack space={5}>
            {/* Hero */}
            <Card variant="raised" padding="lg">
              <VStack space={4}>
                <HStack space={4} align="center">
                  {mockUser.avatarUrl ? (
                    <Image
                      source={{ uri: mockUser.avatarUrl }}
                      style={{ width: 64, height: 64, borderRadius: 32 }}
                      contentFit="cover"
                    />
                  ) : null}
                  <VStack space={1} className="flex-1">
                    <Text className="text-lg font-bold text-text-primary">
                      {mockUser.displayName}
                    </Text>
                    <Text variant="bodySmall">
                      Membro desde {mockMembership.since} · {mockMembership.plan}
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  label="Editar Perfil"
                  variant="outline"
                  size="sm"
                  fullWidth
                  onPress={() => Alert.alert("Editar Perfil", "Em breve.")}
                />
              </VStack>
            </Card>

            {/* Stats grid 2x2 */}
            <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
              {mockProfileStats.map((s) => (
                <View key={s.label} style={{ width: "50%", padding: 6 }}>
                  <StatCard stat={s} />
                </View>
              ))}
            </View>

            {/* Recorde pessoal */}
            <Card variant="raised" padding="lg">
              <VStack space={3}>
                <HStack justify="between" align="center">
                  <Text variant="label">Recorde Pessoal</Text>
                  <Pressable onPress={() => router.push("/(app)/progress")} hitSlop={8}>
                    <Text className="text-xs font-semibold text-forest-500">Ver histórico</Text>
                  </Pressable>
                </HStack>
                <HStack space={1} align="end">
                  <Text className="font-display text-5xl font-black text-text-primary">
                    {mockPersonalRecord.weightKg}
                  </Text>
                  <Text className="text-xl text-text-tertiary mb-1.5">kg</Text>
                </HStack>
                <Text variant="bodySmall">
                  {mockPersonalRecord.exercise} · {mockPersonalRecord.reps} reps
                </Text>
              </VStack>
            </Card>

            {/* Equipe & Suporte */}
            <Card variant="accent" padding="lg">
              <HStack space={4} align="center">
                {mockCoach.avatarUrl ? (
                  <Image
                    source={{ uri: mockCoach.avatarUrl }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                    contentFit="cover"
                  />
                ) : null}
                <VStack space={1} className="flex-1">
                  <Text className="text-sm font-bold text-text-primary">{mockCoach.name}</Text>
                  <Text variant="caption" className="normal-case tracking-normal">
                    {mockCoach.role}
                    {mockCoach.online ? " · online agora" : ""}
                  </Text>
                </VStack>
                <Button
                  label="Falar"
                  variant="solid"
                  size="sm"
                  leading={<Ionicons name="chatbubble-ellipses-outline" size={16} color="#FFFFFF" />}
                  onPress={() => Alert.alert("Suporte", "Abrindo conversa com sua treinadora…")}
                />
              </HStack>
            </Card>

            {/* Configurações de treino */}
            <Card variant="raised" padding="none">
              <View className="px-5 pt-5 pb-3">
                <Text variant="label" className="mb-3">Treino</Text>
                <Row label="Objetivo" value={GOAL_LABEL[mockAthleteProfile.goal] ?? "—"} />
                <Divider className="my-2" />
                <Row label="Nível" value={LEVEL_LABEL[mockAthleteProfile.experienceLevel] ?? "—"} />
                <Divider className="my-2" />
                <Row label="Unidade" value={mockAthleteProfile.unitSystem.toUpperCase()} />
              </View>
            </Card>

            {/* App */}
            <Card variant="raised" padding="none">
              <View className="px-5 pt-5 pb-3">
                <Text variant="label" className="mb-3">App</Text>
                <Row label="Notificações" value="em breve" disabled />
                <Divider className="my-2" />
                <Row label="Sobre" value="IronForge v0.1" />
              </View>
            </Card>

            <Button label="Sair da conta" variant="outline" size="md" fullWidth onPress={confirmSignOut} />
          </VStack>
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatCard({ stat }: { stat: ProfileStat }) {
  return (
    <Card variant="sunken" padding="md">
      <VStack space={2}>
        <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.forest[500]} />
        <Text className="font-display text-2xl font-black text-text-primary">{stat.value}</Text>
        <Text variant="caption" className="normal-case tracking-normal">{stat.label}</Text>
      </VStack>
    </Card>
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
