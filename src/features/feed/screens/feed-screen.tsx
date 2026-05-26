import { useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { Screen, VStack, HStack, Text, AppHeader } from "@ui/index";
import { colors } from "@theme/colors";
import { mockUser, mockFeed, type FeedPost } from "@shared/mocks";
import { haptics } from "@lib/haptics";
import { router } from "expo-router";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

export function FeedScreen() {
  const [posts, setPosts] = useState<FeedPost[]>(mockFeed);

  function toggleLike(id: string) {
    haptics.tap();
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
          : p,
      ),
    );
  }

  return (
    <Screen edges={["top"]} padded={false}>
      <AppHeader
        avatarUrl={mockUser.avatarUrl}
        hasNotifications
        onPressBell={() => router.push("/(app)/notifications")}
        onPressAvatar={() => router.push("/(app)/profile")}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-1 pb-28">
          <VStack space={5}>
            <VStack space={1}>
              <Text variant="title">Comunidade</Text>
              <Text variant="bodySmall">Veja os treinos de quem treina junto com você.</Text>
            </VStack>

            <VStack space={5}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onToggleLike={() => toggleLike(post.id)} />
              ))}
            </VStack>
          </VStack>
        </View>
      </ScrollView>
    </Screen>
  );
}

function PostCard({ post, onToggleLike }: { post: FeedPost; onToggleLike: () => void }) {
  const initials = post.authorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View className="rounded-xl bg-bg-raised border border-border overflow-hidden">
      {/* header */}
      <HStack space={3} align="center" className="px-4 py-3">
        {post.authorAvatar ? (
          <Image
            source={{ uri: post.authorAvatar }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
            contentFit="cover"
          />
        ) : (
          <View className="h-9 w-9 rounded-full bg-forest-100 items-center justify-center">
            <Text className="text-2xs font-bold text-forest-600">{initials}</Text>
          </View>
        )}
        <VStack space={1} className="flex-1">
          <Text className="text-sm font-bold text-text-primary">{post.authorName}</Text>
          <Text variant="caption" className="normal-case tracking-normal">
            {post.timeAgo}
          </Text>
        </VStack>
        <View className="bg-forest-100 rounded-pill px-2.5 py-1">
          <Text className="text-2xs font-bold text-forest-600">{post.workoutTag}</Text>
        </View>
      </HStack>

      {/* mídia */}
      <View>
        <Image
          source={{ uri: post.mediaUrl }}
          style={{ width: "100%", aspectRatio: 4 / 5 }}
          contentFit="cover"
        />
        {post.type === "video" ? (
          <View className="absolute inset-0 items-center justify-center">
            <View className="h-14 w-14 rounded-full bg-forest-900/60 items-center justify-center">
              <Ionicons name="play" size={26} color="#FFFFFF" />
            </View>
          </View>
        ) : null}
      </View>

      {/* ações */}
      <VStack space={2} className="px-4 py-3">
        <HStack space={5} align="center">
          <Pressable
            onPress={onToggleLike}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={post.liked ? "Descurtir" : "Curtir"}
            className="flex-row items-center gap-1.5 active:opacity-70"
          >
            <Ionicons
              name={post.liked ? "heart" : "heart-outline"}
              size={24}
              color={post.liked ? colors.error : colors.text.primary}
            />
            <Text className="text-sm font-semibold text-text-primary">{post.likes}</Text>
          </Pressable>
          <HStack space={1} align="center">
            <Ionicons name="chatbubble-outline" size={22} color={colors.text.primary} />
            <Text className="text-sm font-semibold text-text-primary">{post.comments}</Text>
          </HStack>
        </HStack>
        <Text variant="bodySmall" className="text-text-primary leading-snug">
          <Text className="font-bold">{post.authorName.split(" ")[0]} </Text>
          {post.caption}
        </Text>
      </VStack>
    </View>
  );
}
