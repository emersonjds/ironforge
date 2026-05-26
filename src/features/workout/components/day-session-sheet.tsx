import { Modal, Pressable, ScrollView, View } from "react-native";
import { cssInterop } from "nativewind";
import { VStack, HStack, Text } from "@ui/index";
import { SEED_MESOCYCLE } from "@features/plans/data/seed-plan";
import { getExercise } from "@features/exercises/data/catalog";
import { sessionTotalVolume, sessionDurationSeconds } from "@features/workout/lib/session-stats";
import { formatDuration } from "@lib/utils/format";
import type { StoredSession } from "@features/workout/hooks/use-last-finished-session";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(ScrollView, { className: "style" });

interface DaySessionSheetProps {
  visible: boolean;
  session: StoredSession | null;
  dateLabel: string;
  onClose: () => void;
}

export function DaySessionSheet({ visible, session, dateLabel, onClose }: DaySessionSheetProps) {
  if (!visible) return null;

  const planDay = session
    ? SEED_MESOCYCLE.days.find((d) => d.id === session.planDayId)
    : null;

  const totalVolume = session ? sessionTotalVolume(session) : 0;
  const durationS = session ? sessionDurationSeconds(session) : 0;

  // agrupa sets por exercício
  const exerciseGroups = planDay?.exercises.map((pe) => {
    const exercise = getExercise(pe.exerciseId);
    const sets = session?.sets.filter((s) => s.planExerciseId === pe.id) ?? [];
    return { pe, exercise, sets };
  }) ?? [];

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View className="flex-1" style={{ justifyContent: "flex-end" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <View
          className="bg-bg-raised rounded-t-2xl border-t border-border overflow-hidden"
          style={{ maxHeight: "80%" }}
        >
          {/* Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-border" />
          </View>

          {/* Header */}
          <View className="px-5 pt-3 pb-4 border-b border-border-subtle">
            <HStack justify="between" align="center">
              <VStack space={1}>
                <Text className="text-2xs text-text-tertiary uppercase tracking-widest">
                  {dateLabel}
                </Text>
                <Text className="text-lg font-bold text-text-primary">
                  {planDay?.name ?? "Treino"}
                </Text>
              </VStack>
              {session ? (
                <HStack space={4}>
                  <VStack space={0} className="items-end">
                    <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Duração</Text>
                    <Text className="text-sm font-mono font-bold text-text-primary">
                      {formatDuration(durationS)}
                    </Text>
                  </VStack>
                  <VStack space={0} className="items-end">
                    <Text className="text-2xs text-text-tertiary uppercase tracking-widest">Volume</Text>
                    <Text className="text-sm font-mono font-bold text-text-primary">
                      {totalVolume.toFixed(0)}kg
                    </Text>
                  </VStack>
                </HStack>
              ) : null}
            </HStack>
          </View>

          {/* Conteúdo */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 16 }}>
            {!session ? (
              <View className="py-10 items-center">
                <Text className="text-text-tertiary text-sm">Nenhum treino registrado neste dia.</Text>
              </View>
            ) : (
              exerciseGroups.map(({ pe, exercise, sets }) => (
                <View
                  key={pe.id}
                  className="bg-bg rounded-xl border border-border-subtle overflow-hidden"
                >
                  {/* Nome do exercício */}
                  <View className="px-4 py-3 border-b border-border-subtle">
                    <Text className="text-sm font-semibold text-text-primary">
                      {exercise?.name ?? pe.exerciseId}
                    </Text>
                  </View>

                  {/* Sets */}
                  {sets.length === 0 ? (
                    <View className="px-4 py-3">
                      <Text className="text-xs text-text-disabled">nenhuma série registrada</Text>
                    </View>
                  ) : (
                    <View className="px-4 py-2">
                      {/* Header */}
                      <HStack className="py-1 mb-1">
                        <Text className="text-2xs text-text-disabled uppercase tracking-widest w-6">#</Text>
                        <Text className="text-2xs text-text-disabled uppercase tracking-widest flex-1 text-center">kg</Text>
                        <Text className="text-2xs text-text-disabled uppercase tracking-widest flex-1 text-center">reps</Text>
                        <Text className="text-2xs text-text-disabled uppercase tracking-widest flex-1 text-center">rir</Text>
                      </HStack>
                      {sets.map((s, i) => (
                        <HStack key={s.id} className="py-2 border-t border-border-subtle">
                          <Text className="text-xs text-text-tertiary w-6">{i + 1}</Text>
                          <Text className="text-sm font-mono font-semibold text-text-primary flex-1 text-center">
                            {s.weight}
                          </Text>
                          <Text className="text-sm font-mono font-semibold text-text-primary flex-1 text-center">
                            {s.reps}
                          </Text>
                          <Text className="text-sm font-mono text-text-secondary flex-1 text-center">
                            {s.rir ?? "—"}
                          </Text>
                        </HStack>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
