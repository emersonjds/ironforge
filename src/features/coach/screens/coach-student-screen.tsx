import { useState } from "react";
import { ScrollView, View, Pressable, Alert, Modal } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, VStack, HStack, Text, Card, Button, Input, EmptyState } from "@ui/index";
import { colors } from "@theme/colors";
import { getStudent, type SwapRequest } from "@shared/mocks";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

export function CoachStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const student = id ? getStudent(id) : undefined;

  const [swap, setSwap] = useState<SwapRequest | null>(student?.pendingSwap ?? null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteTarget, setNoteTarget] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function openNote(exercise: string) {
    setNoteTarget(exercise);
    setDraft(notes[exercise] ?? "");
  }
  function saveNote() {
    if (noteTarget) {
      const text = draft.trim();
      setNotes((prev) => {
        const next = { ...prev };
        if (text) next[noteTarget] = text;
        else delete next[noteTarget];
        return next;
      });
    }
    setNoteTarget(null);
  }
  function resolveSwap(approved: boolean) {
    setSwap(null);
    Alert.alert(
      approved ? "Troca aprovada" : "Troca recusada",
      approved
        ? "O aluno foi avisado e o plano será atualizado."
        : "O aluno foi avisado da decisão.",
    );
  }

  return (
    <Screen edges={["top"]}>
      <VStack space={4} className="flex-1 pt-2">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(coach)"))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="h-9 w-9 -ml-1 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>

        {!student ? (
          <EmptyState title="Aluno não encontrado" />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={5} className="pb-10">
              {/* Hero */}
              <Card variant="raised" padding="lg">
                <HStack space={4} align="center">
                  {student.avatarUrl ? (
                    <Image
                      source={{ uri: student.avatarUrl }}
                      style={{ width: 64, height: 64, borderRadius: 32 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="h-16 w-16 rounded-full bg-forest-100 items-center justify-center">
                      <Ionicons name="person" size={28} color={colors.forest[500]} />
                    </View>
                  )}
                  <VStack space={1} className="flex-1">
                    <Text className="text-lg font-bold text-text-primary">{student.name}</Text>
                    <Text variant="bodySmall">{student.planName}</Text>
                    <Text variant="caption" className="normal-case tracking-normal mt-1">
                      {student.sessionsThisWeek}/{student.weeklyGoal} sessões esta semana
                    </Text>
                  </VStack>
                </HStack>
              </Card>

              {/* Adesão */}
              <Card variant="raised" padding="lg">
                <VStack space={3}>
                  <Text variant="label">Adesão · últimas 6 semanas</Text>
                  <AdherenceBars weeks={student.adherenceWeeks} goal={student.weeklyGoal} />
                </VStack>
              </Card>

              {/* Solicitação pendente (P1) */}
              {swap ? (
                <Card variant="accent" padding="lg">
                  <VStack space={3}>
                    <HStack space={2} align="center">
                      <Ionicons name="swap-horizontal" size={16} color={colors.forest[500]} />
                      <Text variant="label">Pedido de troca de exercício</Text>
                    </HStack>
                    <Text className="text-sm text-text-primary">
                      Trocar <Text className="font-bold">{swap.fromExercise}</Text> por{" "}
                      <Text className="font-bold">{swap.toExercise}</Text>
                    </Text>
                    <Text variant="bodySmall" className="italic">“{swap.reason}”</Text>
                    <HStack space={3}>
                      <View className="flex-1">
                        <Button label="Aprovar" variant="solid" size="md" fullWidth onPress={() => resolveSwap(true)} />
                      </View>
                      <View className="flex-1">
                        <Button label="Recusar" variant="outline" size="md" fullWidth onPress={() => resolveSwap(false)} />
                      </View>
                    </HStack>
                  </VStack>
                </Card>
              ) : null}

              {/* Plano atual + nota rápida (P1) */}
              <VStack space={3}>
                <Text variant="label">Plano atual</Text>
                <Card variant="raised" padding="none">
                  {student.plan.map((day, di) => (
                    <View key={day.label} className={di > 0 ? "border-t border-border" : ""}>
                      <HStack space={2} align="center" className="px-4 pt-4 pb-2">
                        <View className="h-7 w-7 rounded-lg bg-forest-500 items-center justify-center">
                          <Text className="text-2xs font-black text-white leading-none">{day.label}</Text>
                        </View>
                        <Text className="text-sm font-bold text-text-primary">{day.name}</Text>
                      </HStack>
                      {day.exercises.map((ex) => (
                        <View key={ex} className="px-4 py-2">
                          <HStack justify="between" align="center">
                            <Text className="text-sm text-text-primary flex-1 mr-2">{ex}</Text>
                            <Pressable
                              onPress={() => openNote(ex)}
                              hitSlop={8}
                              accessibilityRole="button"
                              accessibilityLabel={`Nota para ${ex}`}
                              className="flex-row items-center gap-1 active:opacity-70"
                            >
                              <Ionicons
                                name={notes[ex] ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
                                size={18}
                                color={notes[ex] ? colors.forest[500] : colors.text.tertiary}
                              />
                              <Text className={`text-xs font-semibold ${notes[ex] ? "text-forest-500" : "text-text-tertiary"}`}>
                                Nota
                              </Text>
                            </Pressable>
                          </HStack>
                          {notes[ex] ? (
                            <View className="mt-2 bg-forest-100/50 rounded-md px-3 py-2">
                              <Text variant="bodySmall" className="text-text-secondary">{notes[ex]}</Text>
                            </View>
                          ) : null}
                        </View>
                      ))}
                    </View>
                  ))}
                </Card>
              </VStack>

              {/* Histórico */}
              <VStack space={3}>
                <Text variant="label">Histórico recente</Text>
                <Card variant="raised" padding="none">
                  {student.history.map((h, i) => (
                    <HStack
                      key={`${h.whenLabel}-${i}`}
                      justify="between"
                      align="center"
                      className={`px-4 py-3 ${i > 0 ? "border-t border-border-subtle" : ""}`}
                    >
                      <VStack space={1} className="flex-1">
                        <Text className="text-sm font-semibold text-text-primary">{h.dayName}</Text>
                        <Text variant="caption" className="normal-case tracking-normal">{h.whenLabel}</Text>
                      </VStack>
                      <Text className="text-xs font-mono text-text-secondary">{h.topSet}</Text>
                    </HStack>
                  ))}
                </Card>
              </VStack>

              <Text variant="caption" className="text-center normal-case tracking-normal">
                Edição de treino e cópia em massa ficam no painel web.
              </Text>
            </VStack>
          </ScrollView>
        )}
      </VStack>

      {/* Modal de nota rápida */}
      <Modal visible={noteTarget !== null} transparent animationType="fade" onRequestClose={() => setNoteTarget(null)}>
        <Pressable className="flex-1 bg-forest-900/40 justify-end" onPress={() => setNoteTarget(null)}>
          <Pressable className="bg-bg-raised rounded-t-2xl p-5" onPress={() => {}}>
            <VStack space={4}>
              <Text variant="heading" className="text-lg">Nota para {noteTarget}</Text>
              <Input
                placeholder="Ex.: abaixa mais no agachamento, controla a descida…"
                multiline
                value={draft}
                onChangeText={setDraft}
                className="h-24 py-3"
                textAlignVertical="top"
                autoFocus
              />
              <HStack space={3}>
                <View className="flex-1">
                  <Button label="Cancelar" variant="outline" size="md" fullWidth onPress={() => setNoteTarget(null)} />
                </View>
                <View className="flex-1">
                  <Button label="Salvar nota" variant="solid" size="md" fullWidth onPress={saveNote} />
                </View>
              </HStack>
            </VStack>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function AdherenceBars({ weeks, goal }: { weeks: number[]; goal: number }) {
  const max = Math.max(goal, ...weeks, 1);
  return (
    <HStack space={2} align="end" className="h-24">
      {weeks.map((w, i) => {
        const pct = (w / max) * 100;
        const hit = w >= goal;
        const isLast = i === weeks.length - 1;
        return (
          <VStack key={i} space={2} align="center" className="flex-1">
            <View className="w-full justify-end items-center" style={{ height: 80 }}>
              <View
                className={`w-full rounded-md ${hit ? "bg-forest-500" : isLast ? "bg-warning" : "bg-forest-100"}`}
                style={{ height: `${Math.max(pct, 6)}%` }}
              />
            </View>
            <Text className="text-2xs text-text-tertiary">{w}</Text>
          </VStack>
        );
      })}
    </HStack>
  );
}
