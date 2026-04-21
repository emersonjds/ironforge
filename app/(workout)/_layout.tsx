import { Stack } from "expo-router";

export default function WorkoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: "#0A0A0B" },
      }}
    >
      <Stack.Screen name="preview" />
    </Stack>
  );
}
