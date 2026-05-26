import { ScrollView, View, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { Screen, VStack, HStack, Text, Card, Button, AppHeader } from "@ui/index";
import { colors } from "@theme/colors";
import {
  mockCoachBalance,
  mockStudentCharges,
  mockReceivableSchedule,
  mockAnticipationOffer,
  formatBRL,
  type StudentCharge,
} from "@shared/mocks";

cssInterop(ScrollView, { className: "style" });
cssInterop(View, { className: "style" });
cssInterop(Pressable, { className: "style" });

const METHOD_ICON: Record<StudentCharge["method"], keyof typeof Ionicons.glyphMap> = {
  pix: "qr-code-outline",
  credit_card: "card-outline",
  boleto: "barcode-outline",
};

const STATUS_STYLE: Record<StudentCharge["status"], { bg: string; text: string; label: string }> = {
  paid: { bg: "bg-forest-100", text: "text-forest-600", label: "Pago" },
  pending: { bg: "bg-warning/15", text: "text-warning", label: "A vencer" },
  overdue: { bg: "bg-error/15", text: "text-error", label: "Atrasado" },
};

export function CoachFinanceScreen() {
  const soon = () => Alert.alert("Em breve", "Disponível quando o gateway de pagamento for ativado.");

  return (
    <Screen edges={["top"]} padded={false}>
      <AppHeader showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-1 pb-28">
          <VStack space={5}>
            <Text variant="title">Financeiro</Text>

            {/* Saldo */}
            <Card variant="raised" padding="lg">
              <VStack space={4}>
                <VStack space={1}>
                  <Text variant="label">Saldo disponível</Text>
                  <View className="flex-row items-baseline gap-1.5">
                    <Text className="font-display text-4xl font-black text-text-primary leading-none">
                      {formatBRL(mockCoachBalance.availableCents)}
                    </Text>
                  </View>
                </VStack>
                <HStack space={3}>
                  <View className="flex-1">
                    <Button label="Sacar via Pix" variant="solid" size="md" fullWidth onPress={soon} />
                  </View>
                </HStack>
                <HStack space={3} className="border-t border-border-subtle pt-3">
                  <VStack space={1} className="flex-1">
                    <Text variant="caption" className="normal-case tracking-normal">A receber</Text>
                    <Text className="text-base font-bold text-text-primary">
                      {formatBRL(mockCoachBalance.pendingCents)}
                    </Text>
                  </VStack>
                  <View className="w-px bg-border-subtle" />
                  <VStack space={1} className="flex-1">
                    <Text variant="caption" className="normal-case tracking-normal">Recebido no mês</Text>
                    <Text className="text-base font-bold text-text-primary">
                      {formatBRL(mockCoachBalance.receivedThisMonthCents)}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </Card>

            {/* Adiantamento de recebíveis */}
            <Card variant="accent" padding="lg">
              <VStack space={3}>
                <HStack space={2} align="center">
                  <Ionicons name="flash-outline" size={16} color={colors.forest[500]} />
                  <Text variant="label">Antecipe seus recebíveis</Text>
                </HStack>
                <Text variant="bodySmall">
                  Receba hoje {formatBRL(mockAnticipationOffer.eligibleCents)} que cairiam ao longo do mês.
                </Text>
                <HStack space={3} align="center" className="border-t border-border-subtle pt-3">
                  <VStack space={1} className="flex-1">
                    <Text variant="caption" className="normal-case tracking-normal">Taxa</Text>
                    <Text className="text-sm font-semibold text-text-secondary">
                      {formatBRL(mockAnticipationOffer.feeCents)}
                    </Text>
                  </VStack>
                  <VStack space={1} className="flex-1">
                    <Text variant="caption" className="normal-case tracking-normal">Você recebe</Text>
                    <Text className="text-sm font-bold text-forest-500">
                      {formatBRL(mockAnticipationOffer.netCents)}
                    </Text>
                  </VStack>
                  <Button label="Antecipar" variant="solid" size="sm" onPress={soon} />
                </HStack>
              </VStack>
            </Card>

            {/* Provisionamento / agenda de recebíveis */}
            <Card variant="raised" padding="lg">
              <VStack space={3}>
                <Text variant="label">Provisão de recebimentos</Text>
                {mockReceivableSchedule.map((b, i) => (
                  <HStack
                    key={b.label}
                    justify="between"
                    align="center"
                    className={i > 0 ? "border-t border-border-subtle pt-3" : ""}
                  >
                    <Text variant="bodySmall" className="text-text-primary">{b.label}</Text>
                    <Text className="text-sm font-bold text-text-primary">{formatBRL(b.amountCents)}</Text>
                  </HStack>
                ))}
              </VStack>
            </Card>

            {/* Cobranças por aluno / próximos vencimentos */}
            <VStack space={3}>
              <HStack justify="between" align="center">
                <Text variant="label">Cobranças</Text>
                <Pressable onPress={soon} hitSlop={8}>
                  <Text className="text-xs font-semibold text-forest-500">+ Gerar cobrança</Text>
                </Pressable>
              </HStack>
              <Card variant="raised" padding="none">
                {mockStudentCharges.map((c, i) => (
                  <ChargeRow key={c.id} charge={c} first={i === 0} />
                ))}
              </Card>
            </VStack>
          </VStack>
        </View>
      </ScrollView>
    </Screen>
  );
}

function ChargeRow({ charge, first }: { charge: StudentCharge; first: boolean }) {
  const st = STATUS_STYLE[charge.status];
  const initials = charge.studentName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <HStack
      space={3}
      align="center"
      className={`px-4 py-3 ${first ? "" : "border-t border-border-subtle"}`}
    >
      {charge.studentAvatar ? (
        <Image
          source={{ uri: charge.studentAvatar }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
          contentFit="cover"
        />
      ) : (
        <View className="h-10 w-10 rounded-full bg-forest-100 items-center justify-center">
          <Text className="text-2xs font-bold text-forest-600">{initials}</Text>
        </View>
      )}
      <VStack space={1} className="flex-1">
        <Text className="text-sm font-semibold text-text-primary">{charge.studentName}</Text>
        <HStack space={1} align="center">
          <Ionicons name={METHOD_ICON[charge.method]} size={12} color={colors.text.tertiary} />
          <Text variant="caption" className="normal-case tracking-normal">{charge.dueLabel}</Text>
        </HStack>
      </VStack>
      <VStack space={1} align="end">
        <Text className="text-sm font-bold text-text-primary">{formatBRL(charge.amountCents)}</Text>
        <View className={`rounded-pill px-2 py-0.5 ${st.bg}`}>
          <Text className={`text-[10px] font-bold ${st.text}`}>{st.label}</Text>
        </View>
      </VStack>
    </HStack>
  );
}
