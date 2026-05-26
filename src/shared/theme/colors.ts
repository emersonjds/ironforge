/**
 * Forest Minimalist (ver DESIGN.md) — light-first, verde-floresta como marca.
 * Espelha os tokens do tailwind.config.js para uso em JS (ex.: cor de ícone,
 * StatusBar). NativeWind className continua sendo a via principal.
 */
export const colors = {
  bg: {
    DEFAULT: "#F9FAFB",
    raised: "#FFFFFF",
    sunken: "#F3F4F5",
  },
  forest: {
    100: "#D8F3DC",
    400: "#2D6A4F",
    500: "#1B4332",
    600: "#143728",
  },
  neutral: {
    300: "#E1E3E4",
    500: "#C1C8C2",
    700: "#717973",
  },
  text: {
    primary: "#191C1D",
    secondary: "#414844",
    tertiary: "#717973",
    inverse: "#FFFFFF",
    accent: "#1B4332",
  },
  success: "#2D6A4F",
  warning: "#B45309",
  error: "#BA1A1A",
  border: {
    subtle: "#F0F1F2",
    DEFAULT: "#E5E7EB",
    accent: "#1B4332",
  },
} as const;
