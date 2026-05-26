import { View, type ViewProps } from "react-native";
import { cssInterop } from "nativewind";

cssInterop(View, { className: "style" });

type Spacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 16;
type Align = "start" | "center" | "end" | "stretch";
type Justify = "start" | "center" | "end" | "between" | "around";

// Static map required — NativeWind/Tailwind cannot process dynamic class strings like `gap-${n}`
const gapMap: Record<Spacing, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  7: "gap-7",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  16: "gap-16",
};

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
      className={`flex-col ${gapMap[space]} ${alignMap[align]} ${justifyMap[justify]} ${className}`}
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
      className={`flex-row ${gapMap[space]} ${alignMap[align]} ${justifyMap[justify]} ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
