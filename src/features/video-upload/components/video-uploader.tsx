import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { cssInterop } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import { Text, VStack, HStack, Button, Input, Card } from "@ui/index";
import { colors } from "@theme/colors";
import { useVideoUpload } from "../hooks/use-video-upload";
import { createYoutubeVideo, linkExerciseDemo } from "../api";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

interface VideoUploaderProps {
  exerciseId: string;
  exerciseName: string;
  onLinked: () => void;
}

type Mode = "gallery" | "youtube";

export function VideoUploader({ exerciseId, exerciseName, onLinked }: VideoUploaderProps) {
  const [mode, setMode] = useState<Mode>("gallery");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const { state, upload, cancel, reset } = useVideoUpload();

  async function pickAndUpload() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Autorize o acesso à galeria para escolher um vídeo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const info = await FileSystemLegacy.getInfoAsync(asset.uri);
    const sizeBytes = info.exists && "size" in info ? info.size : (asset.fileSize ?? 0);

    await upload({
      title: exerciseName,
      fileUri: asset.uri,
      contentType: asset.mimeType ?? "video/mp4",
      sizeBytes,
    });
  }

  async function linkYoutube() {
    const url = youtubeUrl.trim();
    if (!url) return;
    setIsLinking(true);
    try {
      const video = await createYoutubeVideo({ url, title: exerciseName });
      await linkExerciseDemo(exerciseId, { videoId: video.id });
      setYoutubeUrl("");
      onLinked();
    } catch {
      Alert.alert("Não foi possível vincular", "Confira o link do YouTube e tente novamente.");
    } finally {
      setIsLinking(false);
    }
  }

  if (state.status === "completing" || state.status === "requesting-url") {
    return (
      <Card variant="raised" padding="md">
        <HStack space={3} align="center">
          <Ionicons name="cloud-upload-outline" size={20} color={colors.forest[500]} />
          <Text className="text-sm text-text-secondary">Preparando envio…</Text>
        </HStack>
      </Card>
    );
  }

  if (state.status === "uploading") {
    return (
      <Card variant="raised" padding="md">
        <VStack space={3}>
          <HStack justify="between" align="center">
            <Text className="text-sm font-semibold text-text-primary">Enviando vídeo…</Text>
            <Text className="text-sm font-mono text-text-secondary">{Math.round(state.progress * 100)}%</Text>
          </HStack>
          <View className="h-2 rounded-full bg-bg-sunken overflow-hidden">
            <View
              className="h-full rounded-full bg-forest-500"
              style={{ width: `${Math.round(state.progress * 100)}%` }}
            />
          </View>
          <Button
            label="Cancelar envio"
            variant="outline"
            size="sm"
            fullWidth
            onPress={cancel}
            accessibilityLabel="Cancelar envio do vídeo"
          />
        </VStack>
      </Card>
    );
  }

  if (state.status === "done") {
    return (
      <Card variant="accent" padding="md">
        <HStack space={3} align="center">
          <Ionicons name="checkmark-circle" size={20} color={colors.forest[500]} />
          <Text className="text-sm text-text-primary flex-1">Vídeo enviado. Vincule ao exercício.</Text>
        </HStack>
        <View className="mt-3">
          <Button
            label="Vincular ao exercício"
            variant="solid"
            size="md"
            fullWidth
            onPress={async () => {
              await linkExerciseDemo(exerciseId, { videoId: state.videoId });
              reset();
              onLinked();
            }}
          />
        </View>
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card variant="raised" padding="md">
        <VStack space={3}>
          <HStack space={2} align="center">
            <Ionicons name="warning-outline" size={20} color={colors.error} />
            <Text className="text-sm text-text-primary flex-1">{state.message}</Text>
          </HStack>
          <HStack space={3}>
            <View className="flex-1">
              <Button label="Tentar de novo" variant="solid" size="sm" fullWidth onPress={pickAndUpload} />
            </View>
            <View className="flex-1">
              <Button label="Usar YouTube" variant="outline" size="sm" fullWidth onPress={() => { reset(); setMode("youtube"); }} />
            </View>
          </HStack>
        </VStack>
      </Card>
    );
  }

  return (
    <VStack space={3}>
      <HStack space={2}>
        <Pressable
          onPress={() => setMode("gallery")}
          accessibilityRole="button"
          accessibilityLabel="Enviar vídeo da galeria"
          className={`flex-1 h-11 rounded-lg items-center justify-center border ${mode === "gallery" ? "border-forest-500 bg-forest-100/40" : "border-border"}`}
        >
          <Text className={`text-sm font-semibold ${mode === "gallery" ? "text-forest-500" : "text-text-secondary"}`}>
            Enviar vídeo
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("youtube")}
          accessibilityRole="button"
          accessibilityLabel="Colar link do YouTube"
          className={`flex-1 h-11 rounded-lg items-center justify-center border ${mode === "youtube" ? "border-forest-500 bg-forest-100/40" : "border-border"}`}
        >
          <Text className={`text-sm font-semibold ${mode === "youtube" ? "text-forest-500" : "text-text-secondary"}`}>
            Link do YouTube
          </Text>
        </Pressable>
      </HStack>

      {mode === "gallery" ? (
        <Button label="Escolher vídeo da galeria" variant="solid" size="md" fullWidth onPress={pickAndUpload} />
      ) : (
        <VStack space={2}>
          <Input
            placeholder="https://youtube.com/watch?v=..."
            value={youtubeUrl}
            onChangeText={setYoutubeUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Button
            label="Vincular link"
            variant="solid"
            size="md"
            fullWidth
            disabled={!youtubeUrl.trim() || isLinking}
            onPress={linkYoutube}
          />
        </VStack>
      )}
    </VStack>
  );
}
