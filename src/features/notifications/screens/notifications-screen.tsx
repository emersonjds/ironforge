import { useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { Screen, VStack, HStack, Text, EmptyState } from "@ui/index";
import { colors } from "@theme/colors";
import { mockNotifications, type AppNotification, type NotificationType } from "@shared/mocks";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

const ICON: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  plan_change: "create-outline",
  workout_change: "swap-horizontal",
  message: "chatbubble-ellipses-outline",
  achievement: "trophy-outline",
};

export function NotificationsScreen() {
  const [items, setItems] = useState<AppNotification[]>(mockNotifications);
  const unread = items.filter((n) => !n.read).length;

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }
  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <Screen edges={["top"]}>
      <VStack space={5} className="flex-1 pt-2">
        <HStack justify="between" align="center">
          <HStack space={3} align="center">
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/(app)"))}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              className="h-9 w-9 -ml-1 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </Pressable>
            <Text variant="title">Notificações</Text>
          </HStack>
          {unread > 0 ? (
            <Pressable onPress={markAllRead} hitSlop={8} accessibilityRole="button">
              <Text className="text-xs font-semibold text-forest-500">Marcar lidas</Text>
            </Pressable>
          ) : null}
        </HStack>

        {items.length === 0 ? (
          <EmptyState title="Tudo limpo" description="Você não tem notificações no momento." />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={3} className="pb-8">
              {items.map((n) => (
                <Pressable
                  key={n.id}
                  onPress={() => markRead(n.id)}
                  accessibilityRole="button"
                  accessibilityLabel={n.title}
                  className={`flex-row gap-3 rounded-xl p-4 active:opacity-80 border ${
                    n.read ? "bg-bg-raised border-border-subtle" : "bg-forest-100/40 border-forest-500/30"
                  }`}
                >
                  <View className="h-10 w-10 rounded-full bg-forest-100 items-center justify-center">
                    <Ionicons name={ICON[n.type]} size={20} color={colors.forest[500]} />
                  </View>
                  <VStack space={1} className="flex-1">
                    <HStack justify="between" align="center">
                      <Text className="text-sm font-bold text-text-primary flex-1 mr-2">
                        {n.title}
                      </Text>
                      <Text variant="caption" className="normal-case tracking-normal">
                        {n.timeAgo}
                      </Text>
                    </HStack>
                    <Text variant="bodySmall" className="leading-snug">
                      {n.body}
                    </Text>
                  </VStack>
                  {!n.read ? <View className="h-2 w-2 rounded-full bg-forest-500 mt-1" /> : null}
                </Pressable>
              ))}
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </Screen>
  );
}
