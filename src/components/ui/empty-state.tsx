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
    <VStack space={4} align="center" justify="center" className="py-12 px-6">
      {icon ? <View className="mb-2 opacity-60">{icon}</View> : null}
      <Text variant="heading" className="text-center">
        {title}
      </Text>
      {description ? (
        <Text variant="bodySmall" className="text-center max-w-xs">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="solid" size="lg" />
      ) : null}
    </VStack>
  );
}
