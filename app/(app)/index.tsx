import { ScrollView, View } from "react-native";
import { cssInterop } from "nativewind";
import { Screen, VStack, HStack, Text, Button, Card } from "@ui/index";
import { useAuthStore } from "@features/auth/store";
import { router } from "expo-router";
import { getTodayPlanDay, SEED_MESOCYCLE } from "@features/plans/data/seed-plan";
import { getExercise } from "@features/exercises/data/catalog";
import { useActiveSessionStore } from "@features/workout/store";
import type { Muscle } from "@/types/domain";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });

const MUSCLE_LABEL: Partial<Record<Muscle, string>> = {
  chest: "peito",
  back_lats: "costas",
  back_upper: "costas",
  shoulders_front: "ombro",
  shoulders_side: "ombro",
  shoulders_rear: "ombro",
  triceps: "tríceps",
  biceps: "bíceps",
  quads: "quadríceps",
  hamstrings: "posterior",
  glutes: "glúteos",
  calves: "panturrilha",
};

const DAY_SHORT = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function TodayScreen() {
  const user = useAuthStore((s) => s.user);
  const hasActiveSession = useActiveSessionStore((s) => s.session !== null);

  const planDay = getTodayPlanDay();

  const musclesHit = new Set<string>();
  for (const pe of planDay.exercises) {
    const ex = getExercise(pe.exerciseId);
    if (ex) {
      const label = MUSCLE_LABEL[ex.primaryMuscle];
      if (label) musclesHit.add(label);
    }
  }
  const muscleSummary = Array.from(musclesHit).join(" · ");

  const totalSets = planDay.exercises.reduce((sum, pe) => sum + pe.targetSets, 0);
  const estMin = Math.round(
    planDay.exercises.reduce((sum, pe) => sum + pe.targetSets * (pe.restSeconds + 45), 0) / 60,
  );

  const today = new Date();
  const dayIdx = (today.getDay() + 6) % 7;
  const weekLabel = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const firstName = user?.displayName?.split(" ")[0] ?? "lifter";
  const greeting = getGreeting();

  return (
    <Screen edges={["top"]} padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pt-8 pb-10"
      >
        <VStack space={10}>
          {/* Greeting */}
          <VStack space={2}>
            <Text variant="title">{greeting}, {firstName}</Text>
            <Text variant="bodySmall" className="capitalize">
              {weekLabel} · semana 1 de {SEED_MESOCYCLE.weeks}
            </Text>
          </VStack>

          {/* Hero card */}
          <Card variant="accent" padding="xl">
            <VStack space={6}>
              <HStack justify="between" align="center">
                <Text variant="label">PRÓXIMO TREINO</Text>
                <Text className="text-2xs font-semibold tracking-widest text-ember-400 uppercase">
                  {SEED_MESOCYCLE.name}
                </Text>
              </HStack>

              <VStack space={2}>
                <Text variant="display" className="text-ember-50">
                  {planDay.name.toUpperCase()}
                </Text>
                <Text variant="bodySmall" className="text-text-secondary">
                  {muscleSummary}
                </Text>
              </VStack>

              {/* Stats row */}
              <View className="flex-row border-t border-border-subtle pt-5 pb-1">
                <VStack space={2} className="flex-1 items-center">
                  <Text variant="label">EXERCÍCIOS</Text>
                  <Text className="text-2xl font-bold font-mono text-text-primary">
                    {planDay.exercises.length}
                  </Text>
                </VStack>
                <View className="w-px bg-border-subtle" />
                <VStack space={2} className="flex-1 items-center">
                  <Text variant="label">SÉRIES</Text>
                  <Text className="text-2xl font-bold font-mono text-text-primary">
                    {totalSets}
                  </Text>
                </VStack>
                <View className="w-px bg-border-subtle" />
                <VStack space={2} className="flex-1 items-center">
                  <Text variant="label">DURAÇÃO</Text>
                  <Text className="text-2xl font-bold font-mono text-text-primary">
                    ~{estMin}
                    <Text className="text-sm text-text-tertiary font-semibold">min</Text>
                  </Text>
                </VStack>
              </View>

              <Button
                label={hasActiveSession ? "► CONTINUAR TREINO" : "► COMEÇAR TREINO"}
                variant="solid"
                size="xl"
                fullWidth
                onPress={() =>
                  router.push(hasActiveSession ? "/(workout)/logger" : "/(workout)/preview")
                }
              />
            </VStack>
          </Card>

          {/* Week strip */}
          <VStack space={4}>
            <HStack justify="between" align="center">
              <Text variant="label">ESTA SEMANA</Text>
              <Text variant="caption">
                0 de {SEED_MESOCYCLE.days.length} sessões
              </Text>
            </HStack>
            <HStack space={2}>
              {DAY_SHORT.map((abbrev, idx) => {
                const isToday = idx === dayIdx;
                const hasWorkout = idx < SEED_MESOCYCLE.days.length;
                return (
                  <View
                    key={abbrev}
                    className={`flex-1 h-20 rounded-lg items-center justify-center gap-2 ${
                      isToday
                        ? "bg-ember-500/15 border border-ember-500"
                        : hasWorkout
                          ? "bg-bg-raised border border-border"
                          : "bg-bg-sunken border border-border-subtle"
                    }`}
                  >
                    <Text
                      className={`text-2xs font-bold tracking-widest ${
                        isToday
                          ? "text-ember-400"
                          : hasWorkout
                            ? "text-text-tertiary"
                            : "text-text-disabled"
                      }`}
                    >
                      {abbrev}
                    </Text>
                    <View
                      className={`w-2 h-2 rounded-full ${
                        isToday
                          ? "bg-ember-500"
                          : hasWorkout
                            ? "bg-surface-600"
                            : "bg-transparent"
                      }`}
                    />
                  </View>
                );
              })}
            </HStack>
          </VStack>

          {/* Dica/mensagem do dia */}
          <Card variant="raised" padding="lg">
            <VStack space={3}>
              <Text variant="label">LEMBRETE</Text>
              <Text variant="body" className="text-text-secondary leading-relaxed">
                Anotar o RIR de cada série é o que transforma o app em coaching real. Sem isso, só resta força bruta.
              </Text>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>
    </Screen>
  );
}
