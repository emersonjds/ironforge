import { useState } from "react";
import { View, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { cssInterop } from "nativewind";
import { Card, VStack, HStack, Text, EmptyState } from "@ui/index";
import { colors } from "@theme/colors";
import {
  useMeasurements,
  useMeasurementPhotos,
  comparisonPair,
  photoForAngle,
  hasAnyPhoto,
  ANGLE_LABEL,
  PHOTO_ANGLES,
  type Measurement,
  type PhotoAngle,
  type ProgressPhoto,
} from "@entities/athlete";

cssInterop(View, { className: "style" });

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function PhotoSlot({ photo, label }: { photo: ProgressPhoto | null; label: string }) {
  const isProcessing = photo !== null && photo.url === null;

  return (
    <VStack space={1} className="flex-1">
      <View className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface-muted items-center justify-center">
        {photo?.url ? (
          <Image
            source={{ uri: photo.url }}
            // A URL é assinada e vale 5 minutos: guardar em disco deixaria a foto
            // no aparelho depois que o acesso já expirou.
            cachePolicy="none"
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            accessibilityLabel={`Foto de progresso — ${label}`}
          />
        ) : (
          <Text className="text-2xs text-text-muted">
            {isProcessing ? "Processando…" : "Sem foto"}
          </Text>
        )}
      </View>
      <Text className="text-2xs text-text-muted text-center">{label}</Text>
    </VStack>
  );
}

function AngleTabs({
  selected,
  onSelect,
}: {
  selected: PhotoAngle;
  onSelect: (angle: PhotoAngle) => void;
}) {
  return (
    <HStack space={2}>
      {PHOTO_ANGLES.map((angle) => {
        const isSelected = angle === selected;

        return (
          <Pressable
            key={angle}
            onPress={() => onSelect(angle)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`Ver ${ANGLE_LABEL[angle]}`}
            className={`min-h-11 flex-1 items-center justify-center rounded-pill px-3 ${
              isSelected ? "bg-forest-500" : "bg-surface-muted"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${isSelected ? "text-white" : "text-text-muted"}`}
            >
              {ANGLE_LABEL[angle]}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}

function Comparison({ before, after }: { before: Measurement; after: Measurement }) {
  const [angle, setAngle] = useState<PhotoAngle>("front");
  const beforePhotos = useMeasurementPhotos(before.id);
  const afterPhotos = useMeasurementPhotos(after.id);

  const isLoading = beforePhotos.isLoading || afterPhotos.isLoading;
  const isError = beforePhotos.isError || afterPhotos.isError;

  if (isLoading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator color={colors.forest[500]} />
      </View>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Não foi possível carregar suas fotos"
        description="Verifique sua conexão e tente de novo."
        actionLabel="Tentar de novo"
        onAction={() => {
          void beforePhotos.refetch();
          void afterPhotos.refetch();
        }}
      />
    );
  }

  const beforeList = beforePhotos.data ?? [];
  const afterList = afterPhotos.data ?? [];

  if (!hasAnyPhoto(beforeList, afterList)) {
    return (
      <EmptyState
        title="Sem fotos ainda"
        description="Peça pro seu personal registrar suas fotos de progresso pra acompanhar a evolução por aqui."
      />
    );
  }

  return (
    <VStack space={3}>
      <AngleTabs selected={angle} onSelect={setAngle} />
      <HStack space={3}>
        <PhotoSlot photo={photoForAngle(beforeList, angle)} label={shortDate(before.measuredAt)} />
        <PhotoSlot photo={photoForAngle(afterList, angle)} label={shortDate(after.measuredAt)} />
      </HStack>
    </VStack>
  );
}

export function ProgressPhotosCard() {
  const measurements = useMeasurements();
  const pair = comparisonPair(measurements.data ?? []);

  if (measurements.isLoading || measurements.isError || pair === null) return null;

  return (
    <Card variant="raised" padding="lg">
      <VStack space={4}>
        <HStack justify="between" align="center">
          <Text variant="label">Fotos de Progresso</Text>
          <View className="bg-forest-100 rounded-pill px-3 py-1">
            <Text className="text-2xs font-bold text-forest-600">ANTES · DEPOIS</Text>
          </View>
        </HStack>

        <Comparison before={pair.before} after={pair.after} />
      </VStack>
    </Card>
  );
}
