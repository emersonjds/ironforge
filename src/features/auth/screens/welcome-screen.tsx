import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Screen, VStack, Text, Logo } from "@ui/index";
import { colors } from "@theme/colors";
import { DevLoginPicker } from "../components/dev-login-picker";
import { cssInterop } from "nativewind";

cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });
const AnimatedView = Animated.createAnimatedComponent(View);

export function WelcomeScreen() {
  return (
    <Screen>
      <VStack justify="between" className="flex-1 py-12">
        <AnimatedView
          entering={FadeIn.duration(480)}
          className="flex-1 items-center justify-center"
        >
          <VStack space={5} align="center">
            <Logo size={88} />
            <VStack space={2} align="center" className="mt-2">
              <Text variant="display" className="text-center tracking-tight">
                IRONFORGE
              </Text>
              <Text variant="bodySmall" className="text-center text-text-secondary px-6">
                Sua evolução, sua responsabilidade.
              </Text>
            </VStack>
          </VStack>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(360).delay(220)}>
          <VStack space={3}>
            <Text variant="label" className="text-center">
              Como você usa o IronForge?
            </Text>
            <RoleCard
              icon="barbell"
              title="Sou Aluno"
              subtitle="Treinar e acompanhar minha evolução"
              onPress={() =>
                router.push({ pathname: "/(auth)/sign-in", params: { role: "athlete" } })
              }
            />
            <RoleCard
              icon="clipboard"
              title="Sou Professor"
              subtitle="Acompanhar e orientar meus alunos"
              onPress={() =>
                router.push({ pathname: "/(auth)/sign-in", params: { role: "coach" } })
              }
            />
            <Text variant="caption" className="text-center mt-2 px-4 normal-case tracking-normal">
              Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.
            </Text>
            <DevLoginPicker />
          </VStack>
        </AnimatedView>
      </VStack>
    </Screen>
  );
}

function RoleCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-row items-center gap-4 rounded-xl bg-bg-raised border border-border p-4 active:opacity-80"
    >
      <View className="h-12 w-12 rounded-xl bg-forest-100 items-center justify-center">
        <Ionicons name={icon} size={24} color={colors.forest[500]} />
      </View>
      <VStack space={1} className="flex-1">
        <Text className="text-base font-bold text-text-primary">{title}</Text>
        <Text variant="bodySmall">{subtitle}</Text>
      </VStack>
      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    </Pressable>
  );
}
