import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { Screen, VStack, HStack, Text, Card, AppHeader } from "@ui/index";
import { colors } from "@theme/colors";
import { router } from "expo-router";
import {
  mockUser,
  mockBodyWeightSeries,
  mockWeeklyVolume,
  mockPrHistory,
} from "@shared/mocks";
import { useSessionHistory } from "@features/workout/hooks/use-session-history";
import { buildConsistencyGrid } from "@entities/session";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });

export default function ProgressScreen() {
  const sessionHistory = useSessionHistory();
  const consistencyWeeks = useMemo(() => {
    const sessions = Object.values(sessionHistory);
    const real = buildConsistencyGrid(sessions);
    // Fall back to mock if no real data yet
    return real;
  }, [sessionHistory]);

  const current = mockBodyWeightSeries[mockBodyWeightSeries.length - 1]!;
  const first = mockBodyWeightSeries[0]!;
  const delta = current.kg - first.kg;

  const weights = mockBodyWeightSeries.map((p) => p.kg);
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;

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
            <Text variant="title">Progresso</Text>

            {/* Evolução corporal */}
            <Card variant="raised" padding="lg">
              <VStack space={4}>
                <HStack justify="between" align="center">
                  <Text variant="label">Evolução Corporal</Text>
                  <View className="bg-forest-100 rounded-pill px-3 py-1">
                    <Text className="text-2xs font-bold text-forest-600">PESO (KG)</Text>
                  </View>
                </HStack>
                <HStack space={2} align="end">
                  <Text className="font-display text-4xl font-black text-text-primary">
                    {current.kg.toFixed(1)}
                  </Text>
                  <HStack space={1} align="center" className="mb-2">
                    <Ionicons
                      name={delta >= 0 ? "trending-up" : "trending-down"}
                      size={16}
                      color={colors.forest[500]}
                    />
                    <Text className="text-sm font-semibold text-forest-500">
                      {delta >= 0 ? "+" : ""}
                      {delta.toFixed(1)}kg
                    </Text>
                  </HStack>
                </HStack>

                {/* mini gráfico de barras */}
                <View>
                  <View className="flex-row items-end gap-2" style={{ height: 96 }}>
                    {mockBodyWeightSeries.map((p) => {
                      const h = ((p.kg - min) / (max - min)) * 100;
                      const isLast = p.month === current.month;
                      return (
                        <View
                          key={p.month}
                          className={`flex-1 rounded-md ${isLast ? "bg-forest-500" : "bg-forest-100"}`}
                          style={{ height: `${Math.max(h, 8)}%` }}
                        />
                      );
                    })}
                  </View>
                  <View className="flex-row gap-2 mt-2">
                    {mockBodyWeightSeries.map((p) => (
                      <Text key={p.month} className="flex-1 text-center text-2xs text-text-tertiary">
                        {p.month}
                      </Text>
                    ))}
                  </View>
                </View>
              </VStack>
            </Card>

            {/* Consistência de treino (grid estilo contribuição) */}
            <Card variant="raised" padding="lg">
              <VStack space={3}>
                <Text variant="label">Consistência de Treino</Text>
                <Text variant="caption" className="normal-case tracking-normal -mt-1">
                  Cada quadrado é um dia. Mais escuro = treino mais consistente.
                </Text>
                <ConsistencyGrid weeks={consistencyWeeks} />
              </VStack>
            </Card>

            {/* Volume semanal por grupo */}
            <Card variant="raised" padding="lg">
              <VStack space={4}>
                <Text variant="label">Volume Semanal · Séries</Text>
                <VStack space={3}>
                  {mockWeeklyVolume.map((v) => {
                    const pct = Math.min(v.sets / v.target, 1);
                    return (
                      <VStack key={v.muscle} space={1}>
                        <HStack justify="between" align="center">
                          <Text className="text-sm text-text-primary">{v.muscle}</Text>
                          <Text variant="caption" className="normal-case tracking-normal">
                            {v.sets}/{v.target}
                          </Text>
                        </HStack>
                        <View className="h-2 rounded-full bg-surface-300 overflow-hidden">
                          <View
                            className="h-2 rounded-full bg-forest-500"
                            style={{ width: `${pct * 100}%` }}
                          />
                        </View>
                      </VStack>
                    );
                  })}
                </VStack>
              </VStack>
            </Card>

            {/* Recordes pessoais */}
            <VStack space={3}>
              <Text variant="label">Recordes Pessoais</Text>
              <Card variant="raised" padding="none">
                {mockPrHistory.map((pr, i) => (
                  <HStack
                    key={pr.id}
                    space={3}
                    align="center"
                    className={`px-4 py-3 ${i > 0 ? "border-t border-border-subtle" : ""}`}
                  >
                    <Ionicons name="trophy-outline" size={20} color={colors.forest[500]} />
                    <VStack space={1} className="flex-1">
                      <Text className="text-sm font-semibold text-text-primary">{pr.exercise}</Text>
                      <Text variant="caption" className="normal-case tracking-normal">
                        {pr.reps} {pr.reps === 1 ? "rep" : "reps"} · {pr.date}
                      </Text>
                    </VStack>
                    <Text className="font-display text-lg font-black text-text-primary">
                      {pr.weightKg}
                      <Text className="text-sm text-text-tertiary"> kg</Text>
                    </Text>
                  </HStack>
                ))}
              </Card>
            </VStack>
          </VStack>
        </View>
      </ScrollView>
    </Screen>
  );
}

// 5 níveis de intensidade (vazio → forest-500). Consistência, não streak.
const LEVEL_BG = ["bg-surface-300", "bg-forest-100", "bg-forest-200", "bg-forest-400", "bg-forest-500"];

function ConsistencyGrid({ weeks }: { weeks: number[][] }) {
  return (
    <VStack space={3}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row" style={{ gap: 3 }}>
          {weeks.map((week, wi) => (
            <View key={wi} style={{ gap: 3 }}>
              {week.map((level, di) => (
                <View
                  key={di}
                  className={LEVEL_BG[level] ?? "bg-surface-300"}
                  style={{ width: 12, height: 12, borderRadius: 2 }}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <HStack space={1} align="center" justify="end">
        <Text variant="caption" className="normal-case tracking-normal mr-1">menos</Text>
        {LEVEL_BG.map((c, i) => (
          <View key={i} className={c} style={{ width: 10, height: 10, borderRadius: 2 }} />
        ))}
        <Text variant="caption" className="normal-case tracking-normal ml-1">mais</Text>
      </HStack>
    </VStack>
  );
}
