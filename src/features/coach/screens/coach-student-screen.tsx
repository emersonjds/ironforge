import { ScrollView, View, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, VStack, HStack, Text, Card, Button, EmptyState } from "@ui/index";
import { colors } from "@theme/colors";
import { getStudent } from "@shared/mocks";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

export function CoachStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const student = id ? getStudent(id) : undefined;

  return (
    <Screen edges={["top"]}>
      <VStack space={5} className="flex-1 pt-2">
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
              {/* Hero do aluno */}
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

              {/* Última sessão (leitura) */}
              <VStack space={3}>
                <Text variant="label">Última sessão</Text>
                {student.lastSession ? (
                  <Card variant="raised" padding="none">
                    <View className="px-5 py-4 border-b border-border-subtle">
                      <HStack justify="between" align="center">
                        <Text className="text-sm font-bold text-text-primary">
                          {student.lastSession.dayName}
                        </Text>
                        <Text variant="caption" className="normal-case tracking-normal">
                          {student.lastSession.whenLabel}
                        </Text>
                      </HStack>
                    </View>
                    {student.lastSession.logs.map((log, i) => (
                      <HStack
                        key={log.name}
                        justify="between"
                        align="center"
                        className={`px-5 py-3 ${i > 0 ? "border-t border-border-subtle" : ""}`}
                      >
                        <Text className="text-sm text-text-primary flex-1 mr-3">{log.name}</Text>
                        <Text className="text-sm font-mono text-text-secondary">{log.topSet}</Text>
                      </HStack>
                    ))}
                  </Card>
                ) : (
                  <Card variant="sunken" padding="lg">
                    <Text variant="bodySmall">Esse aluno ainda não registrou sessões.</Text>
                  </Card>
                )}
              </VStack>

              {/* Ação rápida (P1 — placeholder) */}
              <Button
                label="Enviar um retorno"
                variant="outline"
                size="md"
                fullWidth
                leading={
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.text.primary} />
                }
                onPress={() =>
                  Alert.alert("Retorno ao aluno", "Notas rápidas para o aluno chegam em breve.")
                }
              />
              <Text variant="caption" className="text-center normal-case tracking-normal -mt-2">
                Edição de treino e cópia em massa ficam no painel web.
              </Text>
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </Screen>
  );
}
