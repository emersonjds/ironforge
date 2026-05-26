import { View } from "react-native";
import { Link } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Screen, VStack, Text, Button, Logo } from "@ui/index";
import { cssInterop } from "nativewind";

cssInterop(View, { className: "style" });
const AnimatedView = Animated.createAnimatedComponent(View);

export function WelcomeScreen() {
  return (
    <Screen>
      <VStack justify="between" className="flex-1 py-12">
        {/* Marca centralizada */}
        <AnimatedView
          entering={FadeIn.duration(480)}
          className="flex-1 items-center justify-center"
        >
          <VStack space={5} align="center">
            <Logo size={96} />

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

        {/* CTAs + legal */}
        <AnimatedView entering={FadeInDown.duration(360).delay(240)}>
          <VStack space={3}>
            <Link href="/(auth)/sign-up" asChild>
              <Button
                label="CRIAR CONTA"
                variant="solid"
                size="xl"
                fullWidth
                accessibilityLabel="Criar conta"
              />
            </Link>
            <Link href="/(auth)/sign-in" asChild>
              <Button
                label="JÁ TENHO CONTA"
                variant="outline"
                size="xl"
                fullWidth
                accessibilityLabel="Já tenho conta, entrar"
              />
            </Link>
            <Text variant="caption" className="text-center mt-2 px-4 normal-case tracking-normal">
              Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.
            </Text>
          </VStack>
        </AnimatedView>
      </VStack>
    </Screen>
  );
}
