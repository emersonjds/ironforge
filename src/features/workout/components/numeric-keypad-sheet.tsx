import { useEffect, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { cssInterop } from "nativewind";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { Text } from "@ui/text";
import { haptics } from "@lib/haptics";

cssInterop(Pressable, { className: "style" });
cssInterop(View, { className: "style" });

type Field = "kg" | "reps" | "rir";

export interface KeypadValues {
  kg: number;
  reps: number;
  rir: number | null;
}

export interface KeypadPrevious {
  kg: number;
  reps: number;
  rir: number | null;
}

export interface KeypadSuggestion {
  weight: number;
  reps: number;
  note: string;
}

export interface NumericKeypadSheetProps {
  visible: boolean;
  initial: KeypadValues;
  previous: KeypadPrevious | null;
  suggestion?: KeypadSuggestion | null;
  onClose: () => void;
  onConfirm: (values: KeypadValues) => void;
}

export function NumericKeypadSheet({
  visible,
  initial,
  previous,
  suggestion,
  onClose,
  onConfirm,
}: NumericKeypadSheetProps) {
  const [field, setField] = useState<Field>("kg");
  const [kg, setKg] = useState(initial.kg);
  const [reps, setReps] = useState(initial.reps);
  const [rir, setRir] = useState<number | null>(initial.rir);
  const [buffer, setBuffer] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setField("kg");
      setKg(initial.kg);
      setReps(initial.reps);
      setRir(initial.rir);
      setBuffer(null);
    }
  }, [visible, initial.kg, initial.reps, initial.rir]);

  const displayValue = (() => {
    if (buffer !== null) return buffer;
    if (field === "kg") return formatKg(kg);
    if (field === "reps") return String(reps);
    return rir === null ? "—" : String(rir);
  })();

  function commitBuffer(): { kg: number; reps: number; rir: number | null } {
    let k = kg;
    let r = reps;
    let rr = rir;
    if (buffer !== null) {
      const parsed = buffer === "" || buffer === "." ? NaN : Number(buffer);
      if (!Number.isNaN(parsed)) {
        if (field === "kg") k = roundHalf(parsed);
        else if (field === "reps") r = Math.max(0, Math.floor(parsed));
        else rr = clamp(Math.floor(parsed), 0, 5);
      }
    }
    setKg(k);
    setReps(r);
    setRir(rr);
    setBuffer(null);
    return { kg: k, reps: r, rir: rr };
  }

  function advanceField() {
    const values = commitBuffer();
    haptics.tap();
    if (field === "kg") setField("reps");
    else if (field === "reps") setField("rir");
    else onConfirm(values);
  }

  function tapDigit(d: string) {
    haptics.tap();
    setBuffer((prev) => {
      const base = prev ?? (field === "kg" ? String(kg) : field === "reps" ? String(reps) : rir === null ? "" : String(rir));
      if (d === "." && base.includes(".")) return base;
      if (field !== "kg" && d === ".") return base;
      if (base === "0" && d !== ".") return d;
      const next = base + d;
      return next.length > 6 ? base : next;
    });
  }

  function tapBackspace() {
    haptics.tap();
    setBuffer((prev) => {
      if (prev === null) return "";
      return prev.slice(0, -1);
    });
  }

  function tapIncrement(delta: number) {
    haptics.tap();
    if (field === "kg") setKg((k) => Math.max(0, roundHalf(k + delta)));
    else if (field === "reps") setReps((r) => Math.max(0, r + Math.sign(delta)));
    else setRir((r) => clamp((r ?? 0) + Math.sign(delta), 0, 5));
    setBuffer(null);
  }

  function tapSameAsPrevious() {
    if (!previous) return;
    haptics.setLogged();
    setKg(previous.kg);
    setReps(previous.reps);
    setRir(previous.rir);
    setBuffer(null);
    onConfirm({ kg: previous.kg, reps: previous.reps, rir: previous.rir });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end bg-bg-overlay">
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(160)} style={{ position: "absolute", inset: 0 }}>
          <Pressable onPress={onClose} className="flex-1" />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.duration(240)}
          exiting={SlideOutDown.duration(200)}
          className="bg-bg-raised border-t border-border rounded-t-2xl pt-3 pb-safe-bottom"
        >
          {/* Drag handle */}
          <View className="w-10 h-1 rounded-full bg-border self-center mb-4" />

          {/* "= anterior" — botão primário, topo, fullwidth (§6.4) */}
          {previous ? (
            <View className="px-4 mb-4">
              <Pressable
                onPress={tapSameAsPrevious}
                className="w-full rounded-xl bg-forest-500/20 border border-forest-500 items-center justify-center flex-row gap-3 active:bg-forest-500/30 px-4 py-3"
              >
                <Text className="text-forest-300 font-bold uppercase tracking-widest text-sm">
                  = ANTERIOR
                </Text>
                <View className="w-px h-4 bg-forest-500/50" />
                <View className="flex-1 items-start">
                  <Text className="text-forest-400 text-base font-semibold font-mono">
                    {formatKg(previous.kg)}kg × {previous.reps}
                    {previous.rir !== null ? `  RIR ${previous.rir}` : ""}
                  </Text>
                  {suggestion && (suggestion.weight !== previous.kg || suggestion.reps !== previous.reps) ? (
                    <Text className="text-forest-300/70 text-xs mt-0.5 italic" numberOfLines={1}>
                      {suggestion.note}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            </View>
          ) : null}

          {/* Segmented field selector */}
          <View className="flex-row justify-center gap-2 px-4 mb-1">
            {(["kg", "reps", "rir"] as Field[]).map((f) => (
              <Pressable
                key={f}
                onPress={() => {
                  commitBuffer();
                  setField(f);
                  haptics.tap();
                }}
                className={`flex-1 h-11 rounded-lg items-center justify-center ${
                  field === f ? "bg-forest-500" : "bg-bg-sunken border border-border"
                }`}
              >
                <Text className={`font-bold uppercase tracking-widest text-xs ${field === f ? "text-white" : "text-text-secondary"}`}>
                  {f === "rir" ? "RIR" : f.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Display do valor atual */}
          <View className="items-center py-3">
            <View className="flex-row items-baseline gap-1">
              <Text className="text-5xl font-black font-display text-text-primary tracking-tight leading-none">
                {displayValue}
              </Text>
              {field === "kg" ? (
                <Text className="text-xl font-semibold text-text-tertiary ml-1">kg</Text>
              ) : null}
            </View>
            {field === "rir" ? (
              <Text className="text-xs text-text-tertiary mt-1 normal-case">
                quantas reps ainda sobravam · 0 = foi até a falha
              </Text>
            ) : null}
          </View>

          <View className="flex-row px-4 pb-3 gap-2">
            <View className="flex-1">
              <KeyRow>
                <NumKey onPress={() => tapDigit("7")} label="7" />
                <NumKey onPress={() => tapDigit("8")} label="8" />
                <NumKey onPress={() => tapDigit("9")} label="9" />
              </KeyRow>
              <KeyRow>
                <NumKey onPress={() => tapDigit("4")} label="4" />
                <NumKey onPress={() => tapDigit("5")} label="5" />
                <NumKey onPress={() => tapDigit("6")} label="6" />
              </KeyRow>
              <KeyRow>
                <NumKey onPress={() => tapDigit("1")} label="1" />
                <NumKey onPress={() => tapDigit("2")} label="2" />
                <NumKey onPress={() => tapDigit("3")} label="3" />
              </KeyRow>
              <KeyRow>
                <NumKey onPress={() => tapDigit(".")} label="." disabled={field !== "kg"} />
                <NumKey onPress={() => tapDigit("0")} label="0" />
                <NumKey onPress={tapBackspace} label="⌫" />
              </KeyRow>
            </View>

            <View className="w-32 gap-2">
              {field === "kg" ? (
                <>
                  <QuickKey onPress={() => tapIncrement(2.5)} label="+2.5" />
                  <QuickKey onPress={() => tapIncrement(5)} label="+5" />
                  <QuickKey onPress={() => tapIncrement(-2.5)} label="-2.5" />
                  <QuickKey onPress={() => tapIncrement(-5)} label="-5" />
                </>
              ) : (
                <>
                  <QuickKey onPress={() => tapIncrement(1)} label="+1" />
                  <QuickKey onPress={() => tapIncrement(-1)} label="-1" />
                  <View className="flex-1" />
                </>
              )}
            </View>
          </View>

          <View className="px-4 pb-3">
            <Pressable
              onPress={advanceField}
              className="h-14 rounded-xl bg-forest-500 items-center justify-center flex-row gap-2 active:bg-forest-600"
            >
              <Text style={{ color: "#FFFFFF" }} className="font-bold uppercase tracking-wider text-base">
                {field === "rir" ? "✓ confirmar série" : "próximo →"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function KeyRow({ children }: { children: React.ReactNode }) {
  return <View className="flex-row gap-2 mb-2">{children}</View>;
}

function NumKey({ onPress, label, disabled }: { onPress: () => void; label: string; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-1 h-14 rounded-lg bg-bg-sunken border border-border-subtle items-center justify-center active:bg-surface-300 ${disabled ? "opacity-30" : ""}`}
    >
      <Text className="text-text-primary text-2xl font-semibold">{label}</Text>
    </Pressable>
  );
}

function QuickKey({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      className="h-14 rounded-lg bg-bg-sunken border border-border items-center justify-center active:bg-surface-300"
    >
      <Text className="text-text-secondary text-base font-semibold">{label}</Text>
    </Pressable>
  );
}

function formatKg(v: number): string {
  return v % 1 === 0 ? String(v) : v.toFixed(1);
}

function roundHalf(v: number): number {
  return Math.round(v * 2) / 2;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
