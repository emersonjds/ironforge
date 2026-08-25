import { View } from "react-native";
import { cssInterop } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { Text, VStack, HStack } from "@ui/index";
import { colors } from "@theme/colors";
import type { InstructionBlocks } from "../lib/parse-instructions";

cssInterop(View, { className: "style" });

interface ExerciseInstructionsProps extends InstructionBlocks {
  showLabel?: boolean;
}

export function ExerciseInstructions({ steps, warning, showLabel = true }: ExerciseInstructionsProps) {
  return (
    <VStack space={3}>
      {showLabel ? (
        <Text variant="label">Como executar</Text>
      ) : null}

      <VStack space={3} accessibilityRole="list">
        {steps.map((step, index) => (
          <HStack
            key={index}
            space={3}
            align="start"
            accessibilityLabel={`Passo ${index + 1} de ${steps.length}. ${step}`}
          >
            <Text className="text-xs font-mono text-text-disabled w-5 text-right">{index + 1}</Text>
            <Text className="flex-1 text-sm text-text-primary leading-relaxed">{step}</Text>
          </HStack>
        ))}
      </VStack>

      {warning ? (
        <HStack
          space={2}
          align="start"
          accessibilityLabel={`Erro comum: ${warning}`}
          className="p-3 rounded-lg bg-warning-muted border-l-[3px] border-warning"
        >
          <Ionicons name="alert-circle-outline" size={16} color={colors.warning} style={{ marginTop: 2 }} />
          <VStack space={1} className="flex-1">
            <Text variant="label" className="text-warning">Erro comum</Text>
            <Text className="text-sm text-text-primary leading-relaxed">{warning}</Text>
          </VStack>
        </HStack>
      ) : null}
    </VStack>
  );
}
