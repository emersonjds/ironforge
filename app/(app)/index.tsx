import { useState } from "react";
import { ScrollView, View, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Button, Card, AppHeader } from "@ui/index";
import { colors } from "@theme/colors";
import {
  mockUser,
  mockTodayHero,
  mockHydration,
  mockSupplements,
  mockUpcomingSessions,
  mockReminder,
  type Supplement,
} from "@shared/mocks";
import { SEED_PLAN } from "@features/plans/data/seed-plan";
import { useSessionHistory } from "@features/workout/hooks/use-session-history";
import { DaySessionSheet } from "@features/workout/components/day-session-sheet";
import type { StoredSession } from "@features/workout/hooks/use-last-finished-session";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=70&fit=crop";
const DAY_SHORT = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardScreen() {
  const sessionHistory = useSessionHistory();
  const [supplements, setSupplements] = useState<Supplement[]>(mockSupplements);
  const [sheetSession, setSheetSession] = useState<StoredSession | null>(null);
  const [sheetDateLabel, setSheetDateLabel] = useState("");
  const [sheetVisible, setSheetVisible] = useState(false);

  function openDaySheet(date: Date, session: StoredSession | null) {
    setSheetSession(session);
    setSheetDateLabel(
      date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }),
    );
    setSheetVisible(true);
  }

  function toggleSupplement(id: string) {
    setSupplements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, taken: !s.taken } : s)),
    );
  }

  const firstName = mockUser.displayName.split(" ")[0];

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
          <VStack space={6}>
            <VStack space={1}>
              <Text variant="title">
                {getGreeting()}, {firstName}
              </Text>
              <Text variant="bodySmall">Pronto para superar seus limites hoje?</Text>
            </VStack>

            <TodayHeroCard />

            <HydrationCard />

            <SupplementsCard items={supplements} onToggle={toggleSupplement} />

            <WeekStrip sessionHistory={sessionHistory} onOpenDay={openDaySheet} />

            <UpcomingSessions />

            <Card variant="sunken" padding="lg">
              <VStack space={2}>
                <Text variant="label">Lembrete</Text>
                <Text variant="bodySmall" className="text-text-secondary leading-relaxed">
                  {mockReminder}
                </Text>
              </VStack>
            </Card>
          </VStack>
        </View>
      </ScrollView>

      <DaySessionSheet
        visible={sheetVisible}
        session={sheetSession}
        dateLabel={sheetDateLabel}
        onClose={() => setSheetVisible(false)}
      />
    </Screen>
  );
}

function TodayHeroCard() {
  return (
    <View className="rounded-xl overflow-hidden" style={{ minHeight: 200 }}>
      <Image source={{ uri: HERO_IMAGE }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={StyleSheet.absoluteFill} className="bg-forest-900/70" />
      <View className="p-6 flex-1 justify-between" style={{ minHeight: 200 }}>
        <View className="self-start bg-forest-500 rounded-pill px-3 py-1">
          <Text className="text-2xs font-bold uppercase tracking-widest text-white">
            {mockTodayHero.tag}
          </Text>
        </View>
        <VStack space={3} className="mt-4">
          <VStack space={1}>
            <Text className="font-display text-3xl font-black text-white tracking-tight">
              {mockTodayHero.name}
            </Text>
            <Text className="text-sm text-white/80">{mockTodayHero.focus}</Text>
            <Text className="text-xs text-white/60 mt-1">
              Tempo estimado: {mockTodayHero.estimatedMin} min
            </Text>
          </VStack>
          <Button
            label="Iniciar Agora"
            variant="solid"
            size="lg"
            trailing={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            className="self-start"
            onPress={() => router.push("/(workout)/preview")}
          />
        </VStack>
      </View>
    </View>
  );
}

function HydrationCard() {
  const pct = Math.min(mockHydration.currentLiters / mockHydration.goalLiters, 1);
  return (
    <Card variant="raised" padding="lg">
      <VStack space={3}>
        <HStack justify="between" align="center">
          <HStack space={2} align="center">
            <Ionicons name="water-outline" size={16} color={colors.forest[500]} />
            <Text variant="label">Hidratação</Text>
          </HStack>
          <Text variant="caption" className="normal-case tracking-normal">
            Meta: {mockHydration.goalLiters.toFixed(1)}L
          </Text>
        </HStack>
        <View className="flex-row items-baseline gap-1.5">
          <Text className="font-display text-4xl font-black text-text-primary leading-none">
            {mockHydration.currentLiters.toFixed(1)}
          </Text>
          <Text className="text-base font-semibold text-text-tertiary leading-none">Litros</Text>
        </View>
        <View className="h-2 rounded-full bg-surface-300 overflow-hidden">
          <View className="h-2 rounded-full bg-forest-500" style={{ width: `${pct * 100}%` }} />
        </View>
      </VStack>
    </Card>
  );
}

function SupplementsCard({
  items,
  onToggle,
}: {
  items: Supplement[];
  onToggle: (id: string) => void;
}) {
  return (
    <Card variant="raised" padding="lg">
      <VStack space={4}>
        <HStack space={2} align="center">
          <Ionicons name="nutrition-outline" size={16} color={colors.forest[500]} />
          <Text variant="label">Suplementação</Text>
        </HStack>
        <VStack space={3}>
          {items.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => onToggle(s.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: s.taken }}
              accessibilityLabel={`${s.name}, ${s.dose}`}
              className="flex-row items-center gap-3 active:opacity-70"
            >
              <Ionicons
                name={s.taken ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={s.taken ? colors.forest[500] : colors.text.tertiary}
              />
              <Text
                className={`text-base flex-1 ${
                  s.taken ? "text-text-tertiary line-through" : "text-text-primary"
                }`}
              >
                {s.name}
              </Text>
              <Text variant="bodySmall">{s.dose}</Text>
            </Pressable>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

function WeekStrip({
  sessionHistory,
  onOpenDay,
}: {
  sessionHistory: Record<string, StoredSession>;
  onOpenDay: (date: Date, session: StoredSession | null) => void;
}) {
  const today = new Date();
  const dayIdx = (today.getDay() + 6) % 7;

  return (
    <VStack space={3}>
      <HStack justify="between" align="center">
        <Text variant="label">Frequência Semanal</Text>
        <Text variant="caption" className="normal-case tracking-normal">
          {Object.keys(sessionHistory).length} de {SEED_PLAN.days.length} sessões
        </Text>
      </HStack>
      <HStack space={2}>
        {DAY_SHORT.map((abbrev, idx) => {
          const isToday = idx === dayIdx;
          const dayDate = new Date(today);
          dayDate.setDate(today.getDate() - dayIdx + idx);
          const dateKey = dayDate.toISOString().slice(0, 10);
          const sessionForDay = sessionHistory[dateKey] ?? null;
          const isDone = sessionForDay !== null;

          const containerClass = isToday
            ? "bg-forest-500 border border-forest-500"
            : isDone
              ? "bg-forest-100 border border-forest-500"
              : "bg-bg-sunken border border-border";

          return (
            <Pressable
              key={abbrev}
              onPress={() => onOpenDay(dayDate, sessionForDay)}
              accessibilityLabel={`Ver treino de ${abbrev} ${dayDate.getDate()}`}
              className={`flex-1 rounded-lg items-center justify-center py-2.5 gap-1 active:opacity-70 ${containerClass}`}
            >
              <Text
                className={`text-2xs font-bold tracking-wide ${
                  isToday ? "text-white/80" : "text-text-tertiary"
                }`}
              >
                {abbrev}
              </Text>
              <Text
                className={`text-sm font-bold ${
                  isToday ? "text-white" : isDone ? "text-forest-600" : "text-text-secondary"
                }`}
              >
                {dayDate.getDate()}
              </Text>
              <View
                className={`h-1.5 w-1.5 rounded-full ${
                  isDone ? "bg-forest-500" : isToday ? "bg-white/60" : "bg-transparent"
                }`}
              />
            </Pressable>
          );
        })}
      </HStack>
    </VStack>
  );
}

function UpcomingSessions() {
  return (
    <VStack space={3}>
      <HStack justify="between" align="center">
        <Text variant="label">Próximos Treinos</Text>
        <Pressable onPress={() => router.push("/(app)/workouts")} hitSlop={8}>
          <Text className="text-xs font-semibold text-forest-500">Ver agenda</Text>
        </Pressable>
      </HStack>
      <Card variant="raised" padding="none">
        {mockUpcomingSessions.map((s, i) => (
          <View
            key={s.id}
            className={`flex-row items-center gap-3 px-4 py-3 ${
              i > 0 ? "border-t border-border-subtle" : ""
            }`}
          >
            <View className="h-11 w-11 rounded-xl bg-forest-500 items-center justify-center">
              <Text className="text-[11px] font-black tracking-widest text-white leading-none">
                {s.dayAbbrev}
              </Text>
            </View>
            <VStack space={1} className="flex-1">
              <Text className="text-sm font-semibold text-text-primary">{s.name}</Text>
              <Text className="text-xs text-text-tertiary" numberOfLines={1}>
                {s.description}
              </Text>
            </VStack>
            <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
          </View>
        ))}
      </Card>
    </VStack>
  );
}
