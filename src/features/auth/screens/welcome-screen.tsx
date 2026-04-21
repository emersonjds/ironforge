import { View } from "react-native";
import { Link } from "expo-router";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Screen, VStack, Text, Button } from "@ui/index";
import { cssInterop } from "nativewind";

cssInterop(View, { className: "style" });
const AnimatedView = Animated.createAnimatedComponent(View);

/** Barbell minimalista em puro View — sem dependências */
function BarbellIcon() {
  const plateColor = "#FF5A1F";
  const barColor = "#27272A";
  const collarColor = "#3F3F46";

  return (
    <View style={{ width: 120, height: 40, flexDirection: "row", alignItems: "center" }}>
      {/* Placa esquerda grande */}
      <View style={{ width: 14, height: 36, backgroundColor: plateColor, borderRadius: 3 }} />
      {/* Placa esquerda pequena */}
      <View style={{ width: 9, height: 28, backgroundColor: plateColor, borderRadius: 2, marginLeft: 2 }} />
      {/* Collar esquerdo */}
      <View style={{ width: 5, height: 18, backgroundColor: collarColor, borderRadius: 1, marginLeft: 2 }} />
      {/* Barra central */}
      <View style={{ flex: 1, height: 6, backgroundColor: barColor, borderRadius: 3 }} />
      {/* Collar direito */}
      <View style={{ width: 5, height: 18, backgroundColor: collarColor, borderRadius: 1, marginRight: 2 }} />
      {/* Placa direita pequena */}
      <View style={{ width: 9, height: 28, backgroundColor: plateColor, borderRadius: 2, marginRight: 2 }} />
      {/* Placa direita grande */}
      <View style={{ width: 14, height: 36, backgroundColor: plateColor, borderRadius: 3 }} />
    </View>
  );
}

export function WelcomeScreen() {
  return (
    <Screen>
      <VStack space={8} justify="between" className="flex-1 py-16">
        <AnimatedView entering={FadeIn.duration(560)} className="flex-1 items-center justify-center">
          <VStack space={6} align="center">
            {/* Ícone barbell */}
            <BarbellIcon />

            {/* Logo / wordmark */}
            <View className="items-center" style={{ marginTop: 4 }}>
              <Text className="text-7xl font-black font-display tracking-tight leading-none">
                <Text className="text-ember-500">IRON</Text>
                <Text className="text-text-primary">FORGE</Text>
              </Text>
            </View>

            <View className="h-px w-16 bg-ember-500/40" />

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
