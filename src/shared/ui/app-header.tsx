import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { Logo } from "./logo";
import { Text } from "./text";
import { colors } from "@theme/colors";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

export interface AppHeaderProps {
  avatarUrl?: string | null;
  hasNotifications?: boolean;
  onPressBell?: () => void;
}

/** Cabeçalho da plataforma: logo + wordmark à esquerda, sino (+ avatar) à direita. */
export function AppHeader({ avatarUrl, hasNotifications, onPressBell }: AppHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 pt-2 pb-3">
      <View className="flex-row items-center gap-2">
        <Logo size={30} />
        <Text className="font-display text-lg font-bold text-text-primary tracking-tight">
          IRONFORGE
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onPressBell}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notificações"
          className="h-9 w-9 items-center justify-center"
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text.primary} />
          {hasNotifications ? (
            <View className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-forest-500 border border-bg-raised" />
          ) : null}
        </Pressable>

        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
            contentFit="cover"
            accessibilityLabel="Foto de perfil"
          />
        ) : null}
      </View>
    </View>
  );
}
