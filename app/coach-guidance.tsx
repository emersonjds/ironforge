import { Alert, Linking, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { Screen, VStack, Text, Button, Logo } from "@ui/index";
import { colors } from "@theme/colors";
import { useAuthStore } from "@features/auth/store";
import { WEB_PANEL_URL } from "@shared/config/web-panel";

cssInterop(View, { className: "style" });

export default function CoachGuidanceScreen() {
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

  return (
    <Screen>
      <VStack justify="between" className="flex-1 py-12">
        <VStack space={5} align="center" className="flex-1 items-center justify-center">
          <Logo size={64} />
          <View className="h-14 w-14 rounded-full bg-forest-100 items-center justify-center">
            <Ionicons name="desktop-outline" size={28} color={colors.forest[500]} />
          </View>
          <VStack space={2} align="center" className="px-4">
            <Text variant="title" className="text-center text-2xl">
              Acompanhamento no painel web
            </Text>
            <Text variant="bodySmall" className="text-center text-text-secondary">
              O IronForge para personal trainers é feito pelo painel web. Lá você acompanha
              seus alunos, ajusta planos e gerencia a assinatura.
            </Text>
            <Text
              variant="bodySmall"
              className="text-center text-text-tertiary"
              accessibilityLabel={`Endereço do painel web: ${WEB_PANEL_URL}`}
            >
              {WEB_PANEL_URL}
            </Text>
          </VStack>
        </VStack>

        <VStack space={3} className="px-4">
          <Button
            label="Abrir painel web"
            variant="solid"
            size="lg"
            fullWidth
            accessibilityLabel="Abrir painel web no navegador"
            onPress={() => Linking.openURL(WEB_PANEL_URL)}
          />
          <Button
            label="Sair da conta"
            variant="outline"
            size="md"
            fullWidth
            accessibilityLabel="Sair da conta"
            onPress={confirmSignOut}
          />
        </VStack>
      </VStack>
    </Screen>
  );
}
