import { View } from "react-native";
import { cssInterop } from "nativewind";
import { HStack, Text } from "@ui/index";

cssInterop(View, { className: "style" });

interface PasswordStrengthBarProps {
  password: string;
}

type Level = 0 | 1 | 2 | 3 | 4 | 5;

const LABELS: Record<Exclude<Level, 0>, string> = {
  1: "Fraca",
  2: "Regular",
  3: "Médio",
  4: "Forte",
  5: "Excelente",
};

// cor do dot preenchido por nível (NativeWind exige classes estáticas)
const FILL_CLASS: Record<Exclude<Level, 0>, string> = {
  1: "bg-error",
  2: "bg-warning",
  3: "bg-warning",
  4: "bg-success",
  5: "bg-forest-500",
};

function scorePassword(password: string): Level {
  const len = password.length;
  if (len === 0) return 0;
  if (len < 8) return 1;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (len >= 12 && hasUpper && hasNum && hasSpecial) return 5;
  if (hasUpper && hasNum) return 4;
  if (hasUpper || hasNum) return 3;
  return 2;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const level = scorePassword(password);
  if (level === 0) return null;

  const label = LABELS[level];
  const fill = FILL_CLASS[level];

  return (
    <HStack
      space={2}
      align="center"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Força da senha: ${label}`}
    >
      <HStack space={1} align="center">
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            className={`h-2 w-2 rounded-full ${i <= level ? fill : "bg-surface-400"}`}
          />
        ))}
      </HStack>
      <Text variant="caption" className="normal-case tracking-normal text-text-secondary">
        {label}
      </Text>
    </HStack>
  );
}
