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
      <Stack.Screen name="logger" />
      <Stack.Screen name="summary" />
      <Stack.Screen
        name="exercise/[planExerciseId]"
        options={{ presentation: "fullScreenModal", animation: "slide_from_bottom", gestureEnabled: true }}
      />
    </Stack>
  );
}
