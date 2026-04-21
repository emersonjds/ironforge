import { View } from "react-native";
import { Link } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Screen, VStack, Text, Button } from "@ui/index";
import { cssInterop } from "nativewind";

cssInterop(View, { className: "style" });
const AnimatedView = Animated.createAnimatedComponent(View);

export function WelcomeScreen() {
  return (
    <Screen>
      <VStack space={8} justify="between" className="flex-1 py-12">
        <AnimatedView entering={FadeIn.duration(560)} className="flex-1 items-center justify-center">
          <VStack space={6} align="center">
            <Text variant="display" className="text-6xl text-ember-500">
              IRONFORGE
            </Text>
            <Text variant="bodySmall" className="text-center max-w-xs">
              forje o físico. semana a semana, série a série.
            </Text>
          </VStack>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(360).delay(200)}>
          <VStack space={3}>
            <Link href="/(auth)/sign-up" asChild>
              <Button label="Criar conta" variant="solid" size="xl" fullWidth />
            </Link>
            <Link href="/(auth)/sign-in" asChild>
              <Button label="Já tenho conta" variant="ghost" size="lg" fullWidth />
            </Link>
          </VStack>
        </AnimatedView>
      </VStack>
    </Screen>
  );
}
