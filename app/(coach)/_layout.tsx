import { Stack } from "expo-router";
import { colors } from "@theme/colors";

export default function CoachLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.DEFAULT },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="student/[id]" />
    </Stack>
  );
}
