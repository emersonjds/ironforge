import { View } from "react-native";
import { cssInterop } from "nativewind";
import { Text } from "./text";
import { Button } from "./button";
import { VStack } from "./stack";

cssInterop(View, { className: "style" });

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <VStack space={3} align="center" justify="center" className="py-16 px-8">
      {icon ? (
        <View className="mb-4 opacity-50">{icon}</View>
      ) : (
        <View className="mb-4 opacity-30">
          <Text className="text-5xl">⬡</Text>
        </View>
      )}
      <Text variant="title" className="text-center text-2xl">
        {title}
      </Text>
      {description ? (
        <Text variant="bodySmall" className="text-center max-w-xs leading-relaxed text-text-tertiary">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-2">
          <Button label={actionLabel} onPress={onAction} variant="solid" size="lg" />
        </View>
      ) : null}
    </VStack>
  );
}
