import { ScrollView, View, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, Card, Button, Divider, AppHeader } from "@ui/index";
import { colors } from "@theme/colors";
import { useAuthStore } from "@features/auth/store";
import { mockCoach, mockStudents } from "@shared/mocks";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });

export function CoachProfileScreen() {
  const signOut = useAuthStore((s) => s.signOut);

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

  const active = mockStudents.filter((s) => s.daysSinceLastSession < 3).length;

  return (
    <Screen edges={["top"]} padded={false}>
      <AppHeader showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-1 pb-12">
          <VStack space={5}>
            <Text variant="title">Perfil</Text>

            <Card variant="raised" padding="lg">
              <HStack space={4} align="center">
                {mockCoach.avatarUrl ? (
                  <Image
                    source={{ uri: mockCoach.avatarUrl }}
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                    contentFit="cover"
                  />
                ) : null}
                <VStack space={1} className="flex-1">
                  <Text className="text-lg font-bold text-text-primary">{mockCoach.name}</Text>
                  <Text variant="bodySmall">Personal trainer</Text>
                  <Text variant="caption" className="normal-case tracking-normal mt-1">
                    {mockStudents.length} alunos · {active} ativos
                  </Text>
                </VStack>
              </HStack>
            </Card>

            {/* Plano da plataforma (SaaS) */}
            <Card variant="accent" padding="lg">
              <HStack space={3} align="center">
                <View className="h-10 w-10 rounded-xl bg-forest-100 items-center justify-center">
                  <Ionicons name="ribbon-outline" size={20} color={colors.forest[500]} />
                </View>
                <VStack space={1} className="flex-1">
                  <Text className="text-sm font-bold text-text-primary">IronForge Pro</Text>
                  <Text variant="caption" className="normal-case tracking-normal">
                    Até 50 alunos · renova em 12/06
                  </Text>
                </VStack>
                <Button
                  label="Gerenciar"
                  variant="outline"
                  size="sm"
                  onPress={() => Alert.alert("Plano", "Gerenciamento de assinatura no painel web.")}
                />
              </HStack>
            </Card>

            <Card variant="raised" padding="none">
              <View className="px-5 pt-5 pb-3">
                <Text variant="label" className="mb-3">Conta</Text>
                <Row label="Notificações" value="em breve" disabled />
                <Divider className="my-2" />
                <Row label="Sobre" value="IronForge v0.1" />
              </View>
            </Card>

            <Button label="Sair da conta" variant="outline" size="md" fullWidth onPress={confirmSignOut} />
          </VStack>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, disabled }: { label: string; value: string; disabled?: boolean }) {
  return (
    <HStack justify="between" align="center" className="py-3">
      <Text variant="body" className={disabled ? "text-text-tertiary" : "text-text-primary"}>
        {label}
      </Text>
      <Text variant="bodySmall" className={disabled ? "text-text-tertiary" : "text-text-secondary"}>
        {value}
      </Text>
    </HStack>
  );
}
