import { View } from "react-native";
import Svg, { Polygon, Rect } from "react-native-svg";
import { cssInterop } from "nativewind";

cssInterop(View, { className: "style" });

/**
 * Marca IronForge: tile verde-floresta (forest-500) com hexágono branco
 * envolvendo um halter. Identidade fixa — sem prop de cor. Tudo derivado de
 * `size` para escalar de 56dp (auth compacto) a 96dp+ (welcome) sem asset.
 */
export interface LogoProps {
  size?: number;
  className?: string;
}

const WHITE = "#FFFFFF";

function hexagonPoints(cx: number, cy: number, r: number): string {
  // pointy-top: vértices a -90°, -30°, 30°, 90°, 150°, 210°
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

export function Logo({ size = 96, className = "" }: LogoProps) {
  const c = size / 2;
  const radius = size * 0.4;
  const stroke = size * 0.072;
  const round = size * 0.208;

  // Halter (estilo "H"): barra horizontal + duas anilhas verticais
  const barW = size * 0.34;
  const barH = size * 0.085;
  const plateW = size * 0.085;
  const plateH = size * 0.26;
  const rx = size * 0.025;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="IronForge"
      className={`bg-forest-500 items-center justify-center ${className}`}
      style={{ width: size, height: size, borderRadius: round }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Polygon
          points={hexagonPoints(c, c, radius)}
          fill="none"
          stroke={WHITE}
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
        {/* barra central */}
        <Rect x={c - barW / 2} y={c - barH / 2} width={barW} height={barH} rx={rx} fill={WHITE} />
        {/* anilha esquerda */}
        <Rect x={c - barW / 2 - plateW / 2} y={c - plateH / 2} width={plateW} height={plateH} rx={rx} fill={WHITE} />
        {/* anilha direita */}
        <Rect x={c + barW / 2 - plateW / 2} y={c - plateH / 2} width={plateW} height={plateH} rx={rx} fill={WHITE} />
      </Svg>
    </View>
  );
}
