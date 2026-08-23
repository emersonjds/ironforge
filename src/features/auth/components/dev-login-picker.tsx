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
  const signIn = useAuthStore((s) => s.signIn);

  if (!__DEV__) return null;

  function enterAs(account: DevAccount) {
    signIn(account.user, `dev-token-${account.id}`, account.athleteProfile, account.role);
    router.replace("/");
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
              accessibilityRole="button"
              accessibilityLabel={`Entrar como ${account.label}`}
              className="bg-bg-sunken border border-border rounded-lg px-4 py-3 active:opacity-70"
            >
              <Text className="text-text-primary text-sm font-semibold">{account.label}</Text>
              <Text variant="caption" className="normal-case tracking-normal">
                {account.hint}
              </Text>
            </Pressable>
          ))}
        </VStack>
      ) : null}
    </VStack>
  );
}
