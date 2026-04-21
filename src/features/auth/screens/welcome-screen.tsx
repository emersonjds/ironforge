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
      <VStack space={8} justify="between" className="flex-1 py-16">
        <AnimatedView entering={FadeIn.duration(560)} className="flex-1 items-center justify-center">
          <VStack space={4} align="center">
            {/* Logo / wordmark */}
            <View className="items-center">
              <Text className="text-5xl font-black font-display tracking-tight text-ember-500 leading-none">
                IRON
              </Text>
              <Text className="text-5xl font-black font-display tracking-tight text-text-primary leading-none">
                FORGE
              </Text>
            </View>

            <View className="h-px w-12 bg-ember-500/50 mt-2 mb-2" />

            <Text className="text-sm text-text-tertiary text-center tracking-widest uppercase max-w-[240px]">
              semana a semana · série a série
            </Text>
          </VStack>
        </AnimatedView>

        <AnimatedView entering={FadeInDown.duration(360).delay(280)}>
          <VStack space={3}>
            <Link href="/(auth)/sign-up" asChild>
              <Button label="COMEÇAR AGORA" variant="solid" size="xl" fullWidth />
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
