import { forwardRef, useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { cssInterop } from "nativewind";
import { Text } from "./text";

cssInterop(TextInput, { className: "style" });
cssInterop(View, { className: "style" });

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, className = "", onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? "border-error"
    : focused
      ? "border-ember-500"
      : "border-border";

  return (
    <View className="w-full gap-2">
      {label ? <Text variant="label">{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#71717A"
        className={`
          h-12 px-4 rounded-lg bg-bg-sunken
          border ${borderClass}
          text-text-primary text-base font-sans
          ${className}
        `}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? (
        <Text variant="caption" className="text-error">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
});
