import { View } from "react-native";
import { cssInterop } from "nativewind";
import { Screen, VStack, HStack, Text, Card, EmptyState } from "@ui/index";
import { useLastFinishedSession } from "@features/workout/hooks/use-last-finished-session";
import { SEED_MESOCYCLE } from "@features/plans/data/seed-plan";
import {
  sessionDurationSeconds,
  sessionTotalVolume,
} from "@features/workout/lib/session-stats";
import { formatDuration } from "@lib/utils/format";

cssInterop(View, { className: "style" });

export default function HistoryScreen() {
  const lastSession = useLastFinishedSession();

  if (!lastSession) {
    return (
      <Screen edges={["top"]}>
        <VStack space={6} className="flex-1 pt-8">
          <VStack space={2}>
            <Text className="text-2xs text-text-tertiary uppercase tracking-widest">HISTÓRICO</Text>
            <Text variant="title">Sessões passadas</Text>
          </VStack>
          <View className="flex-1 items-center justify-center">
            <EmptyState
              title="Forja ainda fria"
              description="Complete seu primeiro treino pra começar a forjar o histórico."
            />
          </View>
        </VStack>
      </Screen>
    );
  }

  const planDay = SEED_MESOCYCLE.days.find((d) => d.id === lastSession.planDayId);
  const durationS = sessionDurationSeconds(lastSession);
  const totalVolume = sessionTotalVolume(lastSession);
  const date = new Date(lastSession.startedAt).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <Screen edges={["top"]}>
      <VStack space={8} className="flex-1 pt-8">
        <VStack space={2}>
          <Text className="text-2xs text-text-tertiary uppercase tracking-widest">HISTÓRICO</Text>
          <Text variant="title">Sessões passadas</Text>
        </VStack>

        <Card variant="raised" padding="xl">
          <VStack space={5}>
            <HStack justify="between" align="start">
              <VStack space={2}>
                <Text variant="label">ÚLTIMA SESSÃO</Text>
                <Text variant="heading">{planDay?.name ?? "Treino"}</Text>
              </VStack>
              <View className="px-3 py-1.5 rounded-pill bg-bg-sunken border border-border-subtle">
                <Text className="text-xs text-text-tertiary">{date}</Text>
              </View>
            </HStack>

            <View className="h-px bg-border-subtle" />

            <View className="flex-row">
              <VStack space={2} className="flex-1 items-center">
                <Text variant="label">DURAÇÃO</Text>
                <Text className="text-lg font-bold font-mono text-text-primary">
                  {formatDuration(durationS)}
                </Text>
              </VStack>
              <View className="w-px bg-border-subtle" />
              <VStack space={2} className="flex-1 items-center">
                <Text variant="label">SÉRIES</Text>
                <Text className="text-lg font-bold font-mono text-text-primary">
                  {lastSession.sets.length}
                </Text>
              </VStack>
              <View className="w-px bg-border-subtle" />
              <VStack space={2} className="flex-1 items-center">
                <Text variant="label">VOLUME</Text>
                <Text className="text-lg font-bold font-mono text-text-primary">
                  {(totalVolume / 1000).toFixed(1)}t
                </Text>
              </VStack>
            </View>
          </VStack>
        </Card>

        <Text className="text-xs text-text-tertiary text-center uppercase tracking-widest">
          mais sessões aparecem conforme você treina
        </Text>
      </VStack>
    </Screen>
  );
}
