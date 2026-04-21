import { View, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";

cssInterop(View, { className: "style" });

type Spacing = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
type Align = "start" | "center" | "end" | "stretch";
type Justify = "start" | "center" | "end" | "between" | "around";

const alignMap: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const justifyMap: Record<Justify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
};

export interface StackProps extends ViewProps {
  space?: Spacing;
  align?: Align;
  justify?: Justify;
  className?: string;
}

export function VStack({
  space = 0,
  align = "stretch",
  justify = "start",
  className = "",
  children,
  ...rest
}: StackProps) {
  return (
    <View
      className={`flex-col gap-${space} ${alignMap[align]} ${justifyMap[justify]} ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}

export function HStack({
  space = 0,
  align = "center",
  justify = "start",
  className = "",
  children,
  ...rest
}: StackProps) {
  return (
    <View
      className={`flex-row gap-${space} ${alignMap[align]} ${justifyMap[justify]} ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
