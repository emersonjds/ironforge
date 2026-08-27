import { useMemo } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { cssInterop } from "nativewind";
import { Screen, VStack, HStack, Text, Card, Button, EmptyState } from "@ui/index";
import { colors } from "@theme/colors";
import { useSessionsInfinite, sessionDurationSeconds, type Session } from "@entities/session";
import { formatDuration } from "@lib/utils/format";

cssInterop(View, { className: "style" });
cssInterop(ScrollView, { className: "style" });

function sessionDateLabel(startedAt: string): string {
  return new Date(startedAt).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function HistoryScreen() {
  const sessions = useSessionsInfinite();

  const finished: Session[] = useMemo(
    () => (sessions.data?.pages.flatMap((page) => page.items) ?? []).filter((s) => s.endedAt !== null),
    [sessions.data],
  );

  return (
    <Screen edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={8} className="flex-1 pt-8 pb-16">
          <VStack space={2}>
            <Text className="text-2xs text-text-tertiary uppercase tracking-widest">HISTÓRICO</Text>
            <Text variant="title">Sessões passadas</Text>
          </VStack>

          {sessions.isLoading ? (
            <View className="py-16 items-center">
              <ActivityIndicator color={colors.forest[500]} />
            </View>
          ) : sessions.isError ? (
            <EmptyState
              title="Não foi possível carregar seu histórico"
              description="Verifique sua conexão e tente de novo."
              actionLabel="Tentar de novo"
              onAction={() => sessions.refetch()}
            />
          ) : finished.length === 0 ? (
            <EmptyState
              title="Forja ainda fria"
              description="Complete seu primeiro treino pra começar a forjar o histórico."
            />
          ) : (
            <VStack space={4}>
              <VStack space={3}>
                {finished.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </VStack>

              {sessions.hasNextPage ? (
                <Button
                  label={sessions.isFetchingNextPage ? "Carregando…" : "Carregar mais"}
                  variant="outline"
                  size="md"
                  fullWidth
                  disabled={sessions.isFetchingNextPage}
                  onPress={() => sessions.fetchNextPage()}
                />
              ) : null}
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Screen>
  );
}

function SessionRow({ session }: { session: Session }) {
  const durationS = sessionDurationSeconds(session.startedAt, session.endedAt);

  return (
    <Card variant="raised" padding="lg">
      <HStack justify="between" align="center">
        <VStack space={1}>
          <Text className="text-sm font-semibold text-text-primary">
            {sessionDateLabel(session.startedAt)}
          </Text>
          <Text variant="caption" className="normal-case tracking-normal">
            Duração
          </Text>
        </VStack>
        <Text className="text-lg font-bold font-mono text-text-primary">
          {formatDuration(durationS)}
        </Text>
      </HStack>
    </Card>
  );
}
