import { ScrollView, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Card, AppHeader } from "@ui/index";
import { colors } from "@theme/colors";
import { mockCoachName, mockStudents, type CoachStudent } from "@shared/mocks";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

export function CoachHomeScreen() {
  const trainedToday = mockStudents.filter((s) => s.daysSinceLastSession === 0).length;
  const inactive = mockStudents.filter((s) => s.daysSinceLastSession >= 3).length;
  const active = mockStudents.length - inactive;

  return (
    <Screen edges={["top"]} padded={false}>
      <AppHeader showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-1 pb-28">
          <VStack space={5}>
            <VStack space={1}>
              <Text variant="title">Olá, {mockCoachName}</Text>
              <Text variant="bodySmall">Acompanhe sua turma de relance.</Text>
            </VStack>

            {/* Visão geral da turma */}
            <HStack space={3}>
              <OverviewStat label="Ativos" value={String(active)} icon="flame-outline" tone="forest" />
              <OverviewStat label="Treinaram hoje" value={String(trainedToday)} icon="checkmark-circle-outline" tone="forest" />
              <OverviewStat
                label="Sumidos"
                value={String(inactive)}
                icon="alert-circle-outline"
                tone={inactive > 0 ? "warning" : "forest"}
              />
            </HStack>

            <Pressable
              onPress={() => router.push("/(coach)/exercise-videos")}
              accessibilityRole="button"
              accessibilityLabel="Gerenciar vídeos de demonstração dos exercícios"
            >
              <Card variant="raised" padding="md">
                <HStack space={3} align="center">
                  <View className="w-10 h-10 rounded-lg bg-forest-100 items-center justify-center">
                    <Ionicons name="videocam-outline" size={20} color={colors.forest[500]} />
                  </View>
                  <VStack space={1} className="flex-1">
                    <Text className="text-sm font-semibold text-text-primary">Vídeos de exercícios</Text>
                    <Text variant="caption" className="normal-case tracking-normal">
                      Envie ou vincule demonstrações para seus alunos
                    </Text>
                  </VStack>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                </HStack>
              </Card>
            </Pressable>

            <VStack space={3}>
              <Text variant="label">Seus alunos</Text>
              {mockStudents.map((s) => (
                <StudentRow key={s.id} student={s} />
              ))}
            </VStack>
          </VStack>
        </View>
      </ScrollView>
    </Screen>
  );
}

function OverviewStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: "forest" | "warning";
}) {
  const color = tone === "warning" ? colors.warning : colors.forest[500];
  return (
    <Card variant="sunken" padding="md" className="flex-1">
      <VStack space={2}>
        <Ionicons name={icon} size={18} color={color} />
        <Text className="font-display text-2xl font-black text-text-primary leading-none">{value}</Text>
        <Text variant="caption" className="normal-case tracking-normal">{label}</Text>
      </VStack>
    </Card>
  );
}

function StudentRow({ student }: { student: CoachStudent }) {
  const inactive = student.daysSinceLastSession >= 3;
  const adherence = Math.min(student.sessionsThisWeek / student.weeklyGoal, 1);
  const initials = student.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Pressable
      onPress={() => router.push(`/(coach)/student/${student.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Aluno ${student.name}`}
      className="active:opacity-80"
    >
      <Card variant="raised" padding="md">
        <HStack space={4} align="center">
          {student.avatarUrl ? (
            <Image
              source={{ uri: student.avatarUrl }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
              contentFit="cover"
            />
          ) : (
            <View className="h-12 w-12 rounded-full bg-forest-100 items-center justify-center">
              <Text className="text-sm font-bold text-forest-600">{initials}</Text>
            </View>
          )}

          <VStack space={1} className="flex-1">
            <HStack justify="between" align="center">
              <Text
                className="text-base font-bold text-text-primary flex-shrink mr-2"
                numberOfLines={1}
              >
                {student.name}
              </Text>
              {inactive ? (
                <View className="flex-row items-center gap-1 bg-warning/15 rounded-pill px-2 py-0.5 flex-shrink-0">
                  <Ionicons name="alert-circle" size={11} color={colors.warning} />
                  <Text className="text-[10px] font-semibold text-warning leading-none">
                    {student.daysSinceLastSession}d parado
                  </Text>
                </View>
              ) : null}
            </HStack>
            <Text variant="caption" className="normal-case tracking-normal">
              {student.planName}
            </Text>
            <HStack space={2} align="center" className="mt-1">
              <View className="flex-1 h-1.5 rounded-full bg-surface-300 overflow-hidden">
                <View
                  className={`h-1.5 rounded-full ${inactive ? "bg-warning" : "bg-forest-500"}`}
                  style={{ width: `${Math.max(adherence * 100, 4)}%` }}
                />
              </View>
              <Text variant="caption" className="normal-case tracking-normal">
                {student.sessionsThisWeek}/{student.weeklyGoal}
              </Text>
            </HStack>
          </VStack>

          <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
        </HStack>
      </Card>
    </Pressable>
  );
}
