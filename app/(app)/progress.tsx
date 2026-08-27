import { useMemo } from "react";
import { ScrollView, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { Screen, VStack, HStack, Text, Card, AppHeader, EmptyState } from "@ui/index";
import { colors } from "@theme/colors";
import { router } from "expo-router";
import { useAuthStore } from "@features/auth/store";
import {
  useMeasurements,
  toBodyWeightSeries,
  type BodyWeightPoint,
} from "@entities/athlete";
import { useConsistencySessions, buildConsistencyGrid } from "@entities/session";
import { useLoadHistorySummary, usePersonalRecords, type WeekSummary } from "@entities/load-history";
import { useExercises } from "@entities/exercise";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).toUpperCase();
}

export default function ProgressScreen() {
  const authUser = useAuthStore((s) => s.user);

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
            <Text variant="title">Progresso</Text>

            <BodyWeightCard />
            <ConsistencyCard />
            <WeeklyVolumeCard />
            <PersonalRecordsCard />
          </VStack>
        </View>
      </ScrollView>
    </Screen>
  );
}

function BodyWeightCard() {
  const measurements = useMeasurements();
  const series = useMemo(() => toBodyWeightSeries(measurements.data ?? []), [measurements.data]);

  return (
    <Card variant="raised" padding="lg">
      <VStack space={4}>
        <HStack justify="between" align="center">
          <Text variant="label">Evolução Corporal</Text>
          <View className="bg-forest-100 rounded-pill px-3 py-1">
            <Text className="text-2xs font-bold text-forest-600">PESO (KG)</Text>
          </View>
        </HStack>

        {measurements.isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color={colors.forest[500]} />
          </View>
        ) : measurements.isError ? (
          <EmptyState
            title="Não foi possível carregar seu peso"
            description="Verifique sua conexão e tente de novo."
            actionLabel="Tentar de novo"
            onAction={() => measurements.refetch()}
          />
        ) : series.length === 0 ? (
          <EmptyState
            title="Sem medidas registradas"
            description="Peça pro seu personal registrar sua primeira pesagem pra começar a ver sua evolução aqui."
          />
        ) : (
          <BodyWeightChart series={series} />
        )}
      </VStack>
    </Card>
  );
}

function BodyWeightChart({ series }: { series: BodyWeightPoint[] }) {
  const current = series[series.length - 1]!;
  const first = series[0]!;
  const delta = current.kg - first.kg;
  const weights = series.map((p) => p.kg);
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;

  return (
    <VStack space={4}>
      <HStack space={2} align="end">
        <Text className="font-display text-4xl font-black text-text-primary">
          {current.kg.toFixed(1)}
        </Text>
        {series.length > 1 ? (
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
        ) : null}
      </HStack>

      <View>
        <View className="flex-row items-end gap-2" style={{ height: 96 }}>
          {series.map((p) => {
            const h = ((p.kg - min) / (max - min)) * 100;
            const isLast = p.measuredAt === current.measuredAt;
            return (
              <View
                key={p.measuredAt}
                className={`flex-1 rounded-md ${isLast ? "bg-forest-500" : "bg-forest-100"}`}
                style={{ height: `${Math.max(h, 8)}%` }}
              />
            );
          })}
        </View>
        <View className="flex-row gap-2 mt-2">
          {series.map((p) => (
            <Text key={p.measuredAt} className="flex-1 text-center text-2xs text-text-tertiary">
              {shortDate(p.measuredAt)}
            </Text>
          ))}
        </View>
      </View>
    </VStack>
  );
}

const LEVEL_BG = ["bg-surface-300", "bg-forest-100", "bg-forest-200", "bg-forest-400", "bg-forest-500"];

function ConsistencyCard() {
  const sessions = useConsistencySessions();
  const weeks = useMemo(() => buildConsistencyGrid(sessions.data ?? []), [sessions.data]);

  return (
    <Card variant="raised" padding="lg">
      <VStack space={3}>
        <Text variant="label">Consistência de Treino</Text>
        <Text variant="caption" className="normal-case tracking-normal -mt-1">
          Cada quadrado é um dia. Mais escuro = treino mais consistente.
        </Text>

        {sessions.isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color={colors.forest[500]} />
          </View>
        ) : sessions.isError ? (
          <EmptyState
            title="Não foi possível carregar seu histórico"
            description="Verifique sua conexão e tente de novo."
            actionLabel="Tentar de novo"
            onAction={() => sessions.refetch()}
          />
        ) : (
          <ConsistencyGrid weeks={weeks} />
        )}
      </VStack>
    </Card>
  );
}

function ConsistencyGrid({ weeks }: { weeks: ReturnType<typeof buildConsistencyGrid> }) {
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

function WeeklyVolumeCard() {
  const summary = useLoadHistorySummary(12);
  const weeks = summary.data ?? [];

  return (
    <Card variant="raised" padding="lg">
      <VStack space={4}>
        <Text variant="label">Volume Semanal</Text>

        {summary.isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color={colors.forest[500]} />
          </View>
        ) : summary.isError ? (
          <EmptyState
            title="Não foi possível carregar seu volume"
            description="Verifique sua conexão e tente de novo."
            actionLabel="Tentar de novo"
            onAction={() => summary.refetch()}
          />
        ) : weeks.length === 0 ? (
          <EmptyState
            title="Sem histórico de treino ainda"
            description="Seu volume semanal aparece aqui assim que você registrar séries."
          />
        ) : (
          <WeeklyVolumeChart weeks={weeks} />
        )}
      </VStack>
    </Card>
  );
}

function WeeklyVolumeChart({ weeks }: { weeks: WeekSummary[] }) {
  const current = weeks[weeks.length - 1]!;
  const previous = weeks.length > 1 ? weeks[weeks.length - 2]! : null;
  const delta = previous ? current.totalVolume - previous.totalVolume : 0;
  const volumes = weeks.map((w) => w.totalVolume);
  const max = Math.max(...volumes, 1);

  return (
    <VStack space={4}>
      <HStack space={2} align="end">
        <Text className="font-display text-4xl font-black text-text-primary">
          {(current.totalVolume / 1000).toFixed(1)}t
        </Text>
        {previous ? (
          <HStack space={1} align="center" className="mb-2">
            <Ionicons
              name={delta >= 0 ? "trending-up" : "trending-down"}
              size={16}
              color={colors.forest[500]}
            />
            <Text className="text-sm font-semibold text-forest-500">
              {delta >= 0 ? "+" : ""}
              {(delta / 1000).toFixed(1)}t
            </Text>
          </HStack>
        ) : null}
      </HStack>

      <View>
        <View className="flex-row items-end gap-2" style={{ height: 96 }}>
          {weeks.map((w) => {
            const h = (w.totalVolume / max) * 100;
            const isLast = w.weekStart === current.weekStart;
            return (
              <View
                key={w.weekStart}
                className={`flex-1 rounded-md ${isLast ? "bg-forest-500" : "bg-forest-100"}`}
                style={{ height: `${Math.max(h, 8)}%` }}
              />
            );
          })}
        </View>
        <View className="flex-row gap-2 mt-2">
          {weeks.map((w) => (
            <Text key={w.weekStart} className="flex-1 text-center text-2xs text-text-tertiary">
              {shortDate(w.weekStart)}
            </Text>
          ))}
        </View>
      </View>
    </VStack>
  );
}

function PersonalRecordsCard() {
  const records = usePersonalRecords();
  const exercises = useExercises();

  const exerciseName = useMemo(() => {
    const byId = new Map((exercises.data ?? []).map((ex) => [ex.id, ex.name]));
    return (exerciseId: string) => byId.get(exerciseId) ?? "Exercício";
  }, [exercises.data]);

  const sorted = useMemo(
    () => [...(records.data ?? [])].sort((a, b) => b.performedAt.localeCompare(a.performedAt)),
    [records.data],
  );

  return (
    <VStack space={3}>
      <Text variant="label">Recordes Pessoais</Text>

      {records.isLoading || exercises.isLoading ? (
        <View className="py-8 items-center">
          <ActivityIndicator color={colors.forest[500]} />
        </View>
      ) : records.isError ? (
        <EmptyState
          title="Não foi possível carregar seus recordes"
          description="Verifique sua conexão e tente de novo."
          actionLabel="Tentar de novo"
          onAction={() => records.refetch()}
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="Nenhum recorde registrado ainda"
          description="Seus recordes pessoais aparecem aqui assim que você bater um novo peso máximo."
        />
      ) : (
        <Card variant="raised" padding="none">
          {sorted.map((pr, i) => (
            <HStack
              key={`${pr.exerciseId}-${pr.performedAt}`}
              space={3}
              align="center"
              className={`px-4 py-3 ${i > 0 ? "border-t border-border-subtle" : ""}`}
            >
              <Ionicons name="trophy-outline" size={20} color={colors.forest[500]} />
              <VStack space={1} className="flex-1">
                <Text className="text-sm font-semibold text-text-primary">
                  {exerciseName(pr.exerciseId)}
                </Text>
                <Text variant="caption" className="normal-case tracking-normal">
                  {pr.reps} {pr.reps === 1 ? "rep" : "reps"} · {shortDate(pr.performedAt)}
                </Text>
              </VStack>
              <Text className="font-display text-lg font-black text-text-primary">
                {pr.weight}
                <Text className="text-sm text-text-tertiary"> kg</Text>
              </Text>
            </HStack>
          ))}
        </Card>
      )}
    </VStack>
  );
}
