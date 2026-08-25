import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { cssInterop } from "nativewind";
import { VStack, HStack, Text } from "@ui/index";
import { DEV_ACCOUNTS, type DevAccount } from "../dev-accounts";
import { useAuthStore } from "../store";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

/**
 * Atalho de login para desenvolvimento: entra direto como uma conta de teste,
 * sem digitar credenciais. Só renderiza sob `__DEV__`.
 */
export function DevLoginPicker() {
  const [open, setOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loginWithPassword = useAuthStore((s) => s.loginWithPassword);

  if (!__DEV__) return null;

  async function enterAs(account: DevAccount) {
    setLoadingId(account.id);
    setError(null);
    try {
      await loginWithPassword(account.email, account.password, account.role);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar agora.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <VStack space={2} className="border-t border-border pt-4">
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel="Atalhos de login de desenvolvimento"
        accessibilityState={{ expanded: open }}
        className="h-11 justify-center"
      >
        <HStack space={2} align="center" justify="center">
          <Text variant="label" className="text-text-secondary">
            DEV · entrar como
          </Text>
          <Text className="text-text-secondary text-xs">{open ? "▲" : "▼"}</Text>
        </HStack>
      </Pressable>

      {open ? (
        <VStack space={2}>
          {DEV_ACCOUNTS.map((account) => (
            <Pressable
              key={account.id}
              onPress={() => enterAs(account)}
              disabled={loadingId !== null}
              accessibilityRole="button"
              accessibilityLabel={`Entrar como ${account.label}`}
              className="bg-bg-sunken border border-border rounded-lg px-4 py-3 active:opacity-70"
            >
              <Text className="text-text-primary text-sm font-semibold">
                {loadingId === account.id ? "Entrando..." : account.label}
              </Text>
              <Text variant="caption" className="normal-case tracking-normal">
                {account.hint}
              </Text>
            </Pressable>
          ))}
          {error ? (
            <Text className="text-error text-xs" accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
        </VStack>
      ) : null}
    </VStack>
  );
}
