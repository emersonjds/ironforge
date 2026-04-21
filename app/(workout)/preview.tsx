import { router } from "expo-router";
import { Screen, VStack, Text, Button, Card } from "@ui/index";

export default function WorkoutPreview() {
  return (
    <Screen>
      <VStack space={6} className="flex-1 py-8">
        <VStack space={1}>
          <Text variant="caption">PRÉVIA DA SESSÃO</Text>
          <Text variant="title">Push A</Text>
        </VStack>

        <Card variant="raised">
          <VStack space={3}>
            <Text variant="label">EXERCÍCIOS</Text>
            <Text variant="body">1. Supino reto   4×6-8</Text>
            <Text variant="body">2. Inclinado halteres   3×8-10</Text>
            <Text variant="body">3. Crossover   3×12-15</Text>
            <Text variant="body">4. Desenvolvimento máq.   3×10-12</Text>
            <Text variant="body">5. Elevação lateral   4×12-15</Text>
            <Text variant="body">6. Tríceps corda   3×12-15</Text>
          </VStack>
        </Card>

        <VStack space={3} className="mt-auto">
          <Button label="INICIAR" variant="solid" size="xl" fullWidth onPress={() => router.back()} />
          <Button label="Cancelar" variant="ghost" size="md" fullWidth onPress={() => router.back()} />
        </VStack>
      </VStack>
    </Screen>
  );
}
