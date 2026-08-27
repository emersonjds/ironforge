import { useMemo } from "react";
import { View, Alert, ScrollView, Pressable, ActivityIndicator, Share } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Card, Button, Divider, AppHeader, EmptyState } from "@ui/index";
import { colors } from "@theme/colors";
import { formatCurrencyBRL } from "@lib/utils/format";
import { useAuthStore } from "@features/auth/store";
import {
  useCoachPayment,
  type CoachPayment,
} from "@entities/athlete";
import {
  usePersonalRecords,
  useLoadHistorySummary,
  pickHeaviestRecord,
  activeWeeksCount,
  averageWeeklyVolume,
} from "@entities/load-history";
import { useSessionsCount } from "@entities/session";
import { useExercises } from "@entities/exercise";

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

const PIX_KEY_TYPE_LABEL: Record<string, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  email: "E-mail",
  phone: "Telefone",
  random: "Chave aleatória",
};

function memberSince(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

export default function ProfileScreen() {
  const authUser = useAuthStore((s) => s.user);
  const athleteProfile = useAuthStore((s) => s.athleteProfile);
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
        avatarUrl={authUser?.avatarUrl ?? null}
        showBell={false}
        onPressAvatar={() => router.push("/(app)/profile")}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-1 pb-28">
          <VStack space={5}>
            {authUser ? (
              <Card variant="raised" padding="lg">
                <VStack space={4}>
                  <HStack space={4} align="center">
                    {authUser.avatarUrl ? (
                      <Image
                        source={{ uri: authUser.avatarUrl }}
                        style={{ width: 64, height: 64, borderRadius: 32 }}
                        contentFit="cover"
                      />
                    ) : (
                      <View className="h-16 w-16 rounded-full bg-forest-100 items-center justify-center">
                        <Ionicons name="person" size={28} color={colors.forest[500]} />
                      </View>
                    )}
                    <VStack space={1} className="flex-1">
                      <Text className="text-lg font-bold text-text-primary">
                        {authUser.displayName}
                      </Text>
                      <Text variant="bodySmall">Membro desde {memberSince(authUser.createdAt)}</Text>
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
            ) : null}

            <StatsGrid />

            <PersonalRecordHero />

            <CoachCard />

            <PaymentCard />

            <Card variant="raised" padding="none">
              <View className="px-5 pt-5 pb-3">
                <Text variant="label" className="mb-3">Treino</Text>
                <Row label="Objetivo" value={GOAL_LABEL[athleteProfile?.goal ?? ""] ?? "—"} />
                <Divider className="my-2" />
                <Row
                  label="Nível"
                  value={LEVEL_LABEL[athleteProfile?.experienceLevel ?? ""] ?? "—"}
                />
                <Divider className="my-2" />
                <Row label="Unidade" value={(athleteProfile?.unitSystem ?? "kg").toUpperCase()} />
              </View>
            </Card>

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

interface StatItem {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function StatsGrid() {
  const sessionsCount = useSessionsCount();
  const records = usePersonalRecords();
  const summary = useLoadHistorySummary(12);

  const isLoading = sessionsCount.isLoading || records.isLoading || summary.isLoading;
  const isError = sessionsCount.isError || records.isError || summary.isError;

  if (isLoading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator color={colors.forest[500]} />
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Não foi possível carregar suas estatísticas"
        description="Verifique sua conexão e tente de novo."
        actionLabel="Tentar de novo"
        onAction={() => {
          void sessionsCount.refetch();
          void records.refetch();
          void summary.refetch();
        }}
      />
    );
  }

  const weeks = summary.data ?? [];
  const stats: StatItem[] = [
    { label: "Treinos", value: String(sessionsCount.data ?? 0), icon: "barbell-outline" },
    { label: "Recordes", value: String((records.data ?? []).length), icon: "trophy-outline" },
    { label: "Semanas Ativas", value: String(activeWeeksCount(weeks)), icon: "flame-outline" },
    {
      label: "Volume Médio",
      value: `${(averageWeeklyVolume(weeks) / 1000).toFixed(1)}t`,
      icon: "trending-up-outline",
    },
  ];

  return (
    <View className="flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
      {stats.map((s) => (
        <View key={s.label} style={{ width: "50%", padding: 6 }}>
          <StatCard stat={s} />
        </View>
      ))}
    </View>
  );
}

function StatCard({ stat }: { stat: StatItem }) {
  return (
    <Card variant="sunken" padding="md">
      <VStack space={2}>
        <Ionicons name={stat.icon} size={20} color={colors.forest[500]} />
        <Text className="font-display text-2xl font-black text-text-primary">{stat.value}</Text>
        <Text variant="caption" className="normal-case tracking-normal">{stat.label}</Text>
      </VStack>
    </Card>
  );
}

function PersonalRecordHero() {
  const records = usePersonalRecords();
  const exercises = useExercises();

  const heaviest = useMemo(() => pickHeaviestRecord(records.data ?? []), [records.data]);
  const exerciseName = useMemo(() => {
    if (!heaviest) return "";
    return (exercises.data ?? []).find((ex) => ex.id === heaviest.exerciseId)?.name ?? "Exercício";
  }, [exercises.data, heaviest]);

  return (
    <Card variant="raised" padding="lg">
      <VStack space={3}>
        <HStack justify="between" align="center">
          <Text variant="label">Recorde Pessoal</Text>
          <Pressable onPress={() => router.push("/(app)/progress")} hitSlop={8}>
            <Text className="text-xs font-semibold text-forest-500">Ver histórico</Text>
          </Pressable>
        </HStack>

        {records.isLoading || exercises.isLoading ? (
          <View className="py-6 items-center">
            <ActivityIndicator color={colors.forest[500]} />
          </View>
        ) : records.isError ? (
          <EmptyState
            title="Não foi possível carregar seu recorde"
            description="Verifique sua conexão e tente de novo."
            actionLabel="Tentar de novo"
            onAction={() => records.refetch()}
          />
        ) : !heaviest ? (
          <EmptyState
            title="Nenhum recorde ainda"
            description="Seu recorde pessoal aparece aqui assim que você bater um novo peso máximo."
          />
        ) : (
          <>
            <View className="flex-row items-baseline gap-1.5">
              <Text className="font-display text-5xl font-black text-text-primary leading-none">
                {heaviest.weight}
              </Text>
              <Text className="text-xl font-semibold text-text-tertiary leading-none">kg</Text>
            </View>
            <Text variant="bodySmall">
              {exerciseName} · {heaviest.reps} reps
            </Text>
          </>
        )}
      </VStack>
    </Card>
  );
}

function CoachCard() {
  const coachPayment = useCoachPayment();

  if (coachPayment.isLoading || coachPayment.isError || !coachPayment.data) return null;

  const payment = coachPayment.data;

  return (
    <Card variant="accent" padding="lg">
      <HStack space={4} align="center">
        <View className="h-12 w-12 rounded-full bg-forest-100 items-center justify-center">
          <Ionicons name="person" size={22} color={colors.forest[500]} />
        </View>
        <VStack space={1} className="flex-1">
          <Text className="text-sm font-bold text-text-primary">{payment.coachDisplayName}</Text>
          <Text variant="caption" className="normal-case tracking-normal">Sua treinadora</Text>
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
  );
}

function PaymentCard() {
  const coachPayment = useCoachPayment();

  return (
    <Card variant="raised" padding="lg">
      <VStack space={3}>
        <Text variant="label">Cobrança</Text>

        {coachPayment.isLoading ? (
          <View className="py-6 items-center">
            <ActivityIndicator color={colors.forest[500]} />
          </View>
        ) : coachPayment.isError ? (
          <EmptyState
            title="Não foi possível carregar a cobrança"
            description="Verifique sua conexão e tente de novo."
            actionLabel="Tentar de novo"
            onAction={() => coachPayment.refetch()}
          />
        ) : (
          <PaymentContent payment={coachPayment.data ?? null} />
        )}
      </VStack>
    </Card>
  );
}

function PaymentContent({ payment }: { payment: CoachPayment | null }) {
  if (!payment || !payment.pixKey) {
    return (
      <Text variant="bodySmall" className="text-text-tertiary">
        Sem cobrança configurada.
      </Text>
    );
  }

  function copyPixKey() {
    Share.share({ message: payment!.pixKey! }).catch(() => {
      Alert.alert("Não foi possível compartilhar a chave Pix");
    });
  }

  return (
    <VStack space={3}>
      <Row label="Chave Pix" value={payment.pixKey} />
      {payment.pixKeyType ? (
        <>
          <Divider className="my-1" />
          <Row label="Tipo" value={PIX_KEY_TYPE_LABEL[payment.pixKeyType] ?? payment.pixKeyType} />
        </>
      ) : null}
      {payment.monthlyPriceCents !== null ? (
        <>
          <Divider className="my-1" />
          <Row label="Mensalidade" value={formatCurrencyBRL(payment.monthlyPriceCents)} />
        </>
      ) : null}
      {payment.paymentNotes ? (
        <>
          <Divider className="my-1" />
          <Text variant="bodySmall" className="text-text-tertiary">
            {payment.paymentNotes}
          </Text>
        </>
      ) : null}
      <Button
        label="Copiar chave Pix"
        variant="outline"
        size="sm"
        fullWidth
        accessibilityRole="button"
        accessibilityLabel="Copiar chave Pix"
        leading={<Ionicons name="copy-outline" size={16} color={colors.text.primary} />}
        onPress={copyPixKey}
      />
    </VStack>
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
