import { useMemo } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import { cssInterop } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { Text, VStack } from "@ui/index";
import { colors } from "@theme/colors";
import type { Playback } from "../schema";

cssInterop(View, { className: "style" });

const PLAYER_HEIGHT = 220;

interface DemoPlayerProps {
  playback: Playback;
}

export function DemoPlayer({ playback }: DemoPlayerProps) {
  if (playback.kind === "youtube") return <YoutubePlayer embedUrl={playback.embedUrl} />;
  if (playback.kind === "file") return <FilePlayer url={playback.url} />;
  return <UnavailablePlayer reason={playback.reason} />;
}

function YoutubePlayer({ embedUrl }: { embedUrl: string }) {
  return (
    <View
      style={{ height: PLAYER_HEIGHT }}
      className="rounded-xl overflow-hidden bg-bg-sunken"
      accessibilityLabel="Player de vídeo do YouTube"
    >
      <WebView
        source={{ uri: embedUrl }}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        style={{ flex: 1, backgroundColor: "transparent" }}
      />
    </View>
  );
}

function FilePlayer({ url }: { url: string }) {
  const source = useMemo(() => ({ uri: url }), [url]);
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
  });

  return (
    <VideoView
      player={player}
      style={{ height: PLAYER_HEIGHT, borderRadius: 12, backgroundColor: colors.bg.sunken }}
      allowsFullscreen
      allowsPictureInPicture
      contentFit="contain"
      accessibilityLabel="Player de vídeo do exercício"
    />
  );
}

function UnavailablePlayer({ reason }: { reason: string }) {
  return (
    <View
      style={{ height: PLAYER_HEIGHT }}
      className="rounded-xl bg-bg-sunken items-center justify-center px-6"
    >
      <VStack space={2} align="center">
        <Ionicons name="videocam-off-outline" size={28} color={colors.text.tertiary} />
        <Text className="text-sm text-text-tertiary text-center">{reason}</Text>
      </VStack>
    </View>
  );
}
