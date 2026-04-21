import { Screen, VStack, Text, Button, Card } from "@ui/index";
import { useAuthStore } from "@features/auth/store";
import { router } from "expo-router";

export default function TodayScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <Screen>
      <VStack space={6} className="flex-1 py-8">
        <VStack space={1}>
          <Text variant="caption">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })}
          </Text>
          <Text variant="title">Bom treino, {user?.displayName ?? "lifter"}</Text>
        </VStack>

        <Card variant="accent" padding="lg">
          <VStack space={4}>
            <Text variant="label">PRÓXIMO TREINO</Text>
            <VStack space={1}>
              <Text variant="display">PUSH A</Text>
              <Text variant="bodySmall">peito · ombro · tríceps</Text>
            </VStack>
            <Text variant="bodySmall">6 exercícios · ~58 min</Text>
            <Button
              label="► COMEÇAR TREINO"
              variant="solid"
              size="xl"
              fullWidth
              onPress={() => router.push("/(workout)/preview")}
            />
          </VStack>
        </Card>

        <Button label="Sair" variant="ghost" size="sm" onPress={signOut} />
      </VStack>
    </Screen>
  );
}
