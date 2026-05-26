/** @type {import('tailwindcss').Config} */

// Forest Minimalist (ver DESIGN.md): light-first, verde-floresta como marca,
// profundidade por contornos (não sombras). A escala `forest` é a cor de marca.
const forest = {
  50: "#EBF5EF",
  100: "#D8F3DC", // tint de destaque (chips, seleção)
  200: "#B7E4C7",
  300: "#86AF99",
  400: "#2D6A4F", // texto/ícone de acento sobre claro (contraste AA)
  500: "#1B4332", // PRIMARY — ações e marca (solid)
  600: "#143728", // pressed / hover
  700: "#0E2B1F",
  800: "#08231A",
  900: "#012D1D",
  950: "#01160E",
};

// Neutros (light). Escala convencional: índices baixos = claros, altos = escuros.
const neutral = {
  50: "#FFFFFF",
  100: "#F9FAFB",
  200: "#F3F4F5",
  300: "#EDEEEF",
  400: "#E1E3E4",
  500: "#C1C8C2",
  600: "#A8AFA9",
  700: "#717973",
  800: "#414844",
  900: "#191C1D",
  950: "#0B0F0E",
};

module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#F9FAFB", // fundo da tela / "wells"
          raised: "#FFFFFF", // cards sobre o fundo
          sunken: "#F3F4F5", // wells mais profundos
          overlay: "rgba(25,28,29,0.40)", // scrim de modais
        },
        surface: neutral,
        forest,
        success: { DEFAULT: "#2D6A4F", muted: "#D8F3DC", strong: "#1B4332" },
        warning: { DEFAULT: "#B45309", muted: "#FEF3C7", strong: "#92400E" },
        error: { DEFAULT: "#BA1A1A", muted: "#FFDAD6", strong: "#93000A" },
        info: { DEFAULT: "#2563EB", muted: "#DBEAFE", strong: "#1D4ED8" },
        text: {
          primary: "#191C1D", // on-surface
          secondary: "#414844", // on-surface-variant
          tertiary: "#717973", // outline
          disabled: "#A8AFA9",
          inverse: "#FFFFFF", // texto sobre primary/escuro
          accent: "#1B4332", // verde-floresta
        },
        border: {
          subtle: "#F0F1F2",
          DEFAULT: "#E5E7EB", // contorno padrão de cards/inputs
          strong: "#C1C8C2",
          accent: "#1B4332",
        },
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        // mono reservado a dados numéricos tabulares (carga/reps/timer)
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.04em" }],
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.02em" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em" }],
        "3xl": ["30px", { lineHeight: "36px", letterSpacing: "-0.02em" }],
        "4xl": ["36px", { lineHeight: "40px", letterSpacing: "-0.02em" }],
        "5xl": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em" }],
        metric: ["64px", { lineHeight: "64px", letterSpacing: "-0.03em", fontWeight: "800" }],
      },
      fontWeight: {
        regular: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        black: "900",
      },
      borderRadius: {
        none: "0px",
        xs: "4px", // inputs, checkboxes, botões (estética "ferramenta")
        sm: "8px", // cards e containers
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        pill: "999px",
      },
      boxShadow: {
        none: "none",
        // profundidade é por contorno; sombras são raras e difusas
        focus: "0 0 0 2px rgba(27,67,50,0.40)", // anel de foco verde
        lift: "0 1px 2px 0 rgba(17,24,39,0.06)",
        sheet: "0 -8px 32px -8px rgba(17,24,39,0.12)", // modais
      },
    },
  },
  plugins: [],
};
