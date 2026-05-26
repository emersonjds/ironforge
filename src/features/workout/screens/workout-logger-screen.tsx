import { useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { VStack, HStack, Text } from "@ui/index";
import { NumericKeypadSheet, type KeypadValues } from "@features/workout/components/numeric-keypad-sheet";
import { RestTimerBar } from "@features/workout/components/rest-timer-bar";
import { useActiveSessionStore } from "@features/workout/store";
import { getExercise } from "@features/exercises/data/catalog";
import { suggestNextSet } from "@features/workout/lib/progression";
import { bestE1RM } from "@features/workout/lib/e1rm";
import { detectPRs } from "@features/workout/lib/pr-detection";
import { SetRow } from "@features/workout/components/set-row";
import { useRestTimer } from "@features/workout/hooks/use-rest-timer";
import { useSessionTimer } from "@features/workout/hooks/use-session-timer";
import { persistLastFinishedSession } from "@features/workout/hooks/use-last-finished-session";
import { formatDuration } from "@lib/utils/format";
import { haptics } from "@lib/haptics";
import type { PlanExercise } from "@/types/domain";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(ScrollView, { className: "style" });

export function WorkoutLoggerScreen() {
  const session = useActiveSessionStore((s) => s.session);
  const planDay = useActiveSessionStore((s) => s.planDay);
  const currentIdx = useActiveSessionStore((s) => s.currentExerciseIndex);
  const logSet = useActiveSessionStore((s) => s.logSet);
  const nextExercise = useActiveSessionStore((s) => s.nextExercise);
  const prevExercise = useActiveSessionStore((s) => s.prevExercise);
  const endSession = useActiveSessionStore((s) => s.endSession);
  const cancelSession = useActiveSessionStore((s) => s.cancelSession);
  const setsForExercise = useActiveSessionStore((s) => s.setsForExercise);

  const elapsed = useSessionTimer(session?.startedAt ?? null);
  const timer = useRestTimer();
  const [keypadVisible, setKeypadVisible] = useState(false);
  const [lastPRMessage, setLastPRMessage] = useState<string | null>(null);

  const planExercise: PlanExercise | undefined = planDay?.exercises[currentIdx];
  const exercise = planExercise ? getExercise(planExercise.exerciseId) : undefined;
  const supersetPartnerId = planExercise?.isSupersetWith ?? null;
  const supersetPartner =
    (supersetPartnerId ? planDay?.exercises.find((e) => e.id === supersetPartnerId) : null) ?? null;
  const supersetPartnerExercise = supersetPartner ? getExercise(supersetPartner.exerciseId) : null;

  const doneSets = planExercise ? setsForExercise(planExercise.id) : [];

  const suggestion = useMemo(() => {
    if (!planExercise || !exercise) return null;
    return suggestNextSet({
      lastSets: doneSets.map((s) => ({ weight: s.weight, reps: s.reps, rir: s.rir })),
      repRangeMin: planExercise.repRangeMin,
      repRangeMax: planExercise.repRangeMax,
      targetRir: planExercise.targetRir,
      pattern: exercise.movementPattern,
    });
  }, [planExercise, exercise, doneSets]);

  if (!session || !planDay || !planExercise || !exercise) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <Text variant="title">Nenhuma sessão ativa</Text>
        <Pressable onPress={() => router.dismiss()} className="mt-4">
          <Text variant="bodySmall" className="text-text-accent">voltar para home</Text>
        </Pressable>
      </View>
    );
  }

  const totalSets = planExercise.targetSets;
  const totalExercises = planDay.exercises.length;
  const activeSetIndex = doneSets.length + 1;
  const isLastSet = doneSets.length >= totalSets;
  const isLastExercise = currentIdx === totalExercises - 1;

  function handleOpenKeypad() {
    if (isLastSet) return;
    setKeypadVisible(true);
  }

  function handleConfirmSet(values: KeypadValues) {
    if (!planExercise || !exercise) return;
    setKeypadVisible(false);
    const logged = logSet({
      planExerciseId: planExercise.id,
      exerciseId: planExercise.exerciseId,
      setIndex: activeSetIndex,
      weight: values.kg,
      reps: values.reps,
      rir: values.rir,
      restTakenSeconds: null,
    });
    haptics.setLogged();

    const prs = detectPRs({
      currentSet: { weight: logged.weight, reps: logged.reps },
      history: doneSets
        .filter((s) => s.planExerciseId === planExercise.id)
        .map((s) => ({ weight: s.weight, reps: s.reps })),
    });
    if (prs.length) {
      const e1rm = prs.find((p) => p.type === "e1rm");
      const repMax = prs.find((p) => p.type === "rep_max");
      if (e1rm) setLastPRMessage(`PR! e1RM ${e1rm.weight.toFixed(1)}kg`);
      else if (repMax) setLastPRMessage(`PR! ${repMax.weight}kg × ${repMax.reps}`);
      haptics.pr();
    } else {
      setLastPRMessage(null);
    }

    const isSecondOfSuperset =
      supersetPartner !== null && planExercise.order > supersetPartner.order;
    const shouldStartTimer = !supersetPartner || isSecondOfSuperset;
    if (shouldStartTimer) {
      timer.start(planExercise.restSeconds);
    }
  }

  async function handleEndSession() {
    const finished = endSession();
    if (finished) {
      await persistLastFinishedSession(finished);
      router.replace("/(workout)/summary");
    }
  }

  function confirmCancel() {
    Alert.alert(
      "Encerrar treino?",
      `${doneSets.length} série${doneSets.length === 1 ? "" : "s"} registrada${doneSets.length === 1 ? "" : "s"}.`,
      [
        { text: "Continuar treinando", style: "cancel" },
        {
          text: "Salvar e sair",
          onPress: handleEndSession,
        },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => {
            cancelSession();
            router.dismiss();
          },
        },
      ],
    );
  }

  const previousHistorySummary = doneSets
    .map((s) => `${s.weight}×${s.reps}`)
    .join(", ") || "—";

  const sessionBestE1RM = bestE1RM(doneSets.map((s) => ({ weight: s.weight, reps: s.reps })));
  const insets = useSafeAreaInsets();

  // iOS: insets.top já inclui status bar + notch/Dynamic Island
  // Android: StatusBar.currentHeight cobre a barra de status
  const topPad = Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : insets.top;
  const bottomPad = Math.max(insets.bottom, 20);

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: topPad }}>

      {/* ── Navbar ─────────────────────────────────── */}
      <View className="px-4 pb-3 border-b border-border-subtle">
        <HStack justify="between" align="center" className="h-14">
          {/* Botão X — área de toque 44×44, claramente fora do status bar */}
          <Pressable
            onPress={confirmCancel}
            hitSlop={12}
            accessibilityLabel="Encerrar treino"
            accessibilityRole="button"
            className="w-10 h-10 rounded-full border border-border bg-bg-raised items-center justify-center active:opacity-60"
          >
            <Text className="text-text-primary text-sm font-bold">✕</Text>
          </Pressable>

          <Text className="font-mono text-text-primary text-xl font-bold tabular-nums">
            {formatDuration(elapsed)}
          </Text>

          <View className="w-10" />
        </HStack>

        {/* Barra de progresso */}
        <View className="h-1 rounded-full bg-bg-sunken overflow-hidden">
          <View
            className="h-full bg-forest-500 rounded-full"
            style={{ width: `${((currentIdx + 1) / totalExercises) * 100}%` }}
          />
        </View>
        <HStack justify="between" align="center" className="mt-2">
          <Text className="text-2xs text-text-tertiary tracking-widest uppercase">
            exercício {currentIdx + 1} de {totalExercises}
          </Text>
          <Text className="text-2xs text-text-tertiary tracking-widest uppercase">
            {planDay.name}
          </Text>
        </HStack>
      </View>

      {/* ── Conteúdo scrollável ─────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 }}
      >
        <VStack space={6}>
          {supersetPartner && supersetPartnerExercise ? (
            <View className="self-start px-3 py-2 rounded-full bg-forest-500/15 border border-forest-500/40">
              <Text className="text-2xs font-semibold tracking-widest text-forest-400 uppercase">
                SUPERSET · com {supersetPartnerExercise.name}
              </Text>
            </View>
          ) : null}

          <VStack space={2}>
            <Text variant="title" className="text-text-primary">{exercise.name}</Text>
            <HStack space={2} align="center">
              <Text className="text-xs text-text-tertiary uppercase tracking-widest">
                {prettyEquipment(exercise.equipment)}
              </Text>
              {sessionBestE1RM > 0 ? (
                <>
                  <View className="w-px h-3 bg-border" />
                  <Text className="text-xs text-text-tertiary">
                    e1RM {sessionBestE1RM.toFixed(1)}kg
                  </Text>
                </>
              ) : null}
            </HStack>
          </VStack>

          {previousHistorySummary !== "—" ? (
            <View className="flex-row items-center gap-3 px-4 py-3 rounded-lg bg-bg-sunken border border-border-subtle">
              <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Sessão:</Text>
              <Text className="text-xs font-mono text-text-secondary flex-1">{previousHistorySummary}</Text>
            </View>
          ) : null}

          <VStack space={3}>
            <HStack className="px-3 pb-2">
              <Text variant="label" className="w-8">#</Text>
              <Text variant="label" className="w-24">anterior</Text>
              <View className="flex-1 flex-row justify-center gap-3">
                <Text variant="label" className="w-16 text-center">kg</Text>
                <Text variant="label" className="w-12 text-center">reps</Text>
                <Text variant="label" className="w-10 text-center">rir</Text>
              </View>
              <View className="w-6" />
            </HStack>

            {Array.from({ length: totalSets }).map((_, i) => {
              const setNumber = i + 1;
              const done = doneSets[i];
              const status = done
                ? "done"
                : setNumber === doneSets.length + 1
                  ? "active"
                  : "pending";
              return (
                <SetRow
                  key={setNumber}
                  index={setNumber}
                  status={status}
                  previous={done ? { weight: done.weight, reps: done.reps } : null}
                  weight={done?.weight}
                  reps={done?.reps}
                  rir={done?.rir}
                  targetReps={`${planExercise.repRangeMin}-${planExercise.repRangeMax}`}
                  onPress={handleOpenKeypad}
                />
              );
            })}
          </VStack>

          {lastPRMessage ? (
            <View className="self-start px-3 py-2 rounded-full bg-success/15 border border-success/40">
              <Text className="text-success font-bold uppercase tracking-widest text-2xs">
                {lastPRMessage}
              </Text>
            </View>
          ) : null}
        </VStack>
      </ScrollView>

      {/* ── Rest timer ──────────────────────────────── */}
      {timer.active ? (
        <RestTimerBar
          remainingSeconds={timer.remainingSeconds}
          totalSeconds={timer.totalSeconds}
          onAdjust={timer.adjust}
          onSkip={timer.stop}
        />
      ) : null}

      {/* ── CTA bottom — home indicator iOS / nav bar Android ── */}
      <View
        className="px-5 pt-4 border-t border-border-subtle bg-bg"
        style={{ paddingBottom: bottomPad }}
      >
        {isLastSet ? (
          <VStack space={3}>
            <Text className="text-xs text-text-tertiary text-center uppercase tracking-widest">
              Exercício concluído
            </Text>
            <HStack space={3}>
              <Pressable
                onPress={() => prevExercise()}
                disabled={currentIdx === 0}
                accessibilityLabel="Exercício anterior"
                className={`flex-1 h-14 rounded-xl border border-border items-center justify-center ${currentIdx === 0 ? "opacity-30" : "active:opacity-60"}`}
              >
                <Text className="text-text-secondary font-semibold text-sm">◄ voltar</Text>
              </Pressable>
              {isLastExercise ? (
                <Pressable
                  onPress={handleEndSession}
                  accessibilityLabel="Finalizar treino"
                  className="flex-[2] h-14 rounded-xl bg-forest-500 items-center justify-center active:opacity-80"
                >
                  <Text className="text-white font-bold uppercase tracking-wider text-base">✓ finalizar</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => { nextExercise(); timer.stop(); setLastPRMessage(null); }}
                  accessibilityLabel="Próximo exercício"
                  className="flex-[2] h-14 rounded-xl bg-forest-500 items-center justify-center active:opacity-80"
                >
                  <Text className="text-white font-bold uppercase tracking-wider text-base">próximo ►</Text>
                </Pressable>
              )}
            </HStack>
          </VStack>
        ) : (
          <Pressable
            onPress={handleOpenKeypad}
            accessibilityLabel={`Registrar série ${activeSetIndex}`}
            className="h-16 rounded-xl bg-forest-500 items-center justify-center flex-row gap-3 active:opacity-80"
          >
            <Text className="text-white font-bold uppercase tracking-wider text-base">
              ✓ REGISTRAR SÉRIE {activeSetIndex}
            </Text>
            {suggestion ? (
              <Text className="text-forest-100/70 text-sm font-medium">
                {suggestion.weight > 0 ? `${formatKg(suggestion.weight)}kg×` : ""}{suggestion.reps}
              </Text>
            ) : null}
          </Pressable>
        )}
      </View>

      <NumericKeypadSheet
        visible={keypadVisible}
        initial={{
          kg: suggestion?.weight ?? 0,
          reps: suggestion?.reps ?? planExercise.repRangeMin,
          rir: planExercise.targetRir,
        }}
        previous={
          doneSets.length
            ? (() => { const last = doneSets[doneSets.length - 1]!; return { kg: last.weight, reps: last.reps, rir: last.rir }; })()
            : null
        }
        onClose={() => setKeypadVisible(false)}
        onConfirm={handleConfirmSet}
      />
    </View>
  );
}

function prettyEquipment(eq: string): string {
  const map: Record<string, string> = {
    barbell: "barra",
    dumbbell: "halteres",
    machine: "máquina",
    cable: "cabo",
    bodyweight: "peso corporal",
    kettlebell: "kettlebell",
    smith: "smith",
  };
  return map[eq] ?? eq;
}

function formatKg(v: number): string {
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}
