import { useEffect, useMemo, useState } from "react";
import { InteractionManager, Linking, Pressable, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import YoutubePlayerIframe from "react-native-youtube-iframe";
import { useVideoPlayer, VideoView } from "expo-video";
import { cssInterop } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { Text, VStack } from "@ui/index";
import { colors } from "@theme/colors";
import type { Playback } from "../schema";

cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

const PLAYER_HEIGHT = 220;

interface DemoPlayerProps {
  playback: Playback;
  width?: number;
  /** Adia a montagem do player nativo até depois da transição de entrada, exibindo o poster. */
  deferMount?: boolean;
}

export function DemoPlayer({ playback, width, deferMount = false }: DemoPlayerProps) {
  if (playback.kind === "youtube") {
    return (
      <YoutubePlayer
        videoId={playback.youtubeVideoId}
        watchUrl={playback.watchUrl}
        posterUrl={playback.thumbnailUrl}
        width={width}
        deferMount={deferMount}
      />
    );
  }
  if (playback.kind === "file") return <FilePlayer url={playback.url} width={width} />;
  return <UnavailablePlayer reason={playback.reason} width={width} />;
}

function usePlayerHeight(width?: number): number {
  const { width: windowWidth } = useWindowDimensions();
  return useMemo(() => ((width ?? windowWidth) * 9) / 16, [width, windowWidth]);
}

function YoutubePlayer({
  videoId,
  watchUrl,
  posterUrl,
  width,
  deferMount,
}: {
  videoId: string;
  watchUrl: string;
  posterUrl: string;
  width?: number;
  deferMount: boolean;
}) {
  const height = usePlayerHeight(width);
  const [failed, setFailed] = useState(false);
  // ponytail: alguns vídeos monetizados recusam autoplay embutido quando mudo
  // (YouTube mostra "Watch on YouTube" em vez de tocar); iOS já permite play()
  // programático sem gesto porque a WebView desativa mediaTypesRequiringUserActionForPlayback,
  // então começar sem mudo é o que reproduz de forma confiável. O botão de som cobre o resto.
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(!deferMount);

  useEffect(() => {
    if (!deferMount) return;
    const task = InteractionManager.runAfterInteractions(() => setMounted(true));
    return () => task.cancel();
  }, [deferMount]);

  if (failed) {
    return (
      <View style={{ height }} className="rounded-xl overflow-hidden bg-bg-sunken">
        <Image source={{ uri: posterUrl }} style={{ ...styleFill, opacity: 0.5 }} contentFit="cover" />
        <View className="absolute inset-0 items-center justify-center px-6">
          <VStack space={3} align="center">
            <Text
              className="text-sm text-white text-center font-medium"
              accessibilityRole="text"
            >
              Este vídeo não abre aqui.
            </Text>
            <Pressable
              onPress={() => Linking.openURL(watchUrl)}
              accessibilityRole="link"
              accessibilityLabel="Assistir no YouTube, abre outro aplicativo"
              className="min-h-11 px-4 items-center justify-center flex-row gap-2"
            >
              <Text className="text-xs font-semibold text-white underline">Assistir no YouTube ↗</Text>
            </Pressable>
          </VStack>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{ height, borderRadius: 12, overflow: "hidden", backgroundColor: colors.bg.sunken }}
      accessibilityLabel="Player de vídeo do YouTube"
    >
      {!mounted ? (
        <Image source={{ uri: posterUrl }} style={styleFill} contentFit="cover" transition={0} />
      ) : (
        <>
          <YoutubePlayerIframe
            height={height}
            videoId={videoId}
            play
            mute={muted}
            initialPlayerParams={{ loop: true, modestbranding: true, rel: false }}
            onError={() => setFailed(true)}
          />
          <Pressable
            onPress={() => setMuted((m) => !m)}
            accessibilityRole="button"
            accessibilityLabel={muted ? "Ativar som" : "Silenciar vídeo"}
            hitSlop={8}
            className="absolute bottom-2 right-2 h-11 w-11 rounded-full bg-black/60 items-center justify-center"
          >
            <Ionicons name={muted ? "volume-mute" : "volume-high"} size={18} color="#fff" />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styleFill = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };

function FilePlayer({ url, width }: { url: string; width?: number }) {
  const height = usePlayerHeight(width);
  const source = useMemo(() => ({ uri: url }), [url]);
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
  });

  return (
    <VideoView
      player={player}
      style={{ height: height || PLAYER_HEIGHT, borderRadius: 12, backgroundColor: colors.bg.sunken }}
      allowsFullscreen
      allowsPictureInPicture
      contentFit="contain"
      accessibilityLabel="Player de vídeo do exercício"
    />
  );
}

function UnavailablePlayer({ reason, width }: { reason: string; width?: number }) {
  const height = usePlayerHeight(width);
  return (
    <View
      style={{ height: height || PLAYER_HEIGHT }}
      className="rounded-xl bg-bg-sunken items-center justify-center px-6"
    >
      <VStack space={2} align="center">
        <Ionicons name="videocam-off-outline" size={28} color={colors.text.tertiary} />
        <Text className="text-sm text-text-tertiary text-center" accessibilityRole="text">
          {reason}
        </Text>
      </VStack>
    </View>
  );
}
