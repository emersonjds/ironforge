import { ScrollView, View, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Card, AppHeader } from "@ui/index";
import { colors } from "@theme/colors";
import { useAuthStore } from "@features/auth/store";
import { mockCoachName, mockStudents, type CoachStudent } from "@shared/mocks";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

export function CoachHomeScreen() {
  const signOut = useAuthStore((s) => s.signOut);
  const trainedToday = mockStudents.filter((s) => s.daysSinceLastSession === 0).length;
  const inactive = mockStudents.filter((s) => s.daysSinceLastSession >= 3).length;

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
      <AppHeader hasNotifications onPressBell={confirmSignOut} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-1 pb-12">
          <VStack space={5}>
            <VStack space={1}>
              <Text variant="title">Olá, {mockCoachName}</Text>
              <Text variant="bodySmall">
                {mockStudents.length} alunos · {trainedToday} treinaram hoje
                {inactive > 0 ? ` · ${inactive} sumido${inactive > 1 ? "s" : ""}` : ""}
              </Text>
            </VStack>

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
              <Text className="text-base font-bold text-text-primary">{student.name}</Text>
              {inactive ? (
                <View className="bg-warning/15 rounded-pill px-2 py-0.5">
                  <Text className="text-2xs font-bold text-warning">
                    {student.daysSinceLastSession}d sem treinar
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
