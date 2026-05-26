---
name: Forest Minimalist
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#414844'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#2c694e'
  on-secondary: '#ffffff'
  secondary-container: '#aeeecb'
  on-secondary-container: '#316e52'
  tertiary: '#152b1c'
  on-tertiary: '#ffffff'
  tertiary-container: '#2a4131'
  on-tertiary-container: '#93ad98'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#b1f0ce'
  secondary-fixed-dim: '#95d4b3'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#0e5138'
  tertiary-fixed: '#cee9d3'
  tertiary-fixed-dim: '#b3cdb7'
  on-tertiary-fixed: '#092012'
  on-tertiary-fixed-variant: '#354c3b'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  2xl: 3rem
  gutter: 1rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
---

## Brand & Style
The brand personality is professional, functional, and disciplined. It targets fitness enthusiasts who value clarity and data-driven progress over flashy trends. The design style is **Modern Minimalism** with a focus on high-quality typography and intentional white space. The UI evokes a sense of calm focus, reliability, and precision, avoiding the over-stimulating visuals common in the fitness industry to foster a sustainable, long-term habit of health.

## Colors
This design system utilizes a high-contrast palette anchored by a deep forest green. 
- **Primary:** A sophisticated dark forest green (#1B4332) used for critical actions and brand identity.
- **Secondary:** A mid-tone green (#2D6A4F) for success states and secondary emphasis.
- **Backgrounds:** Primarily pure white (#FFFFFF) with #F9FAFB used for sectional grouping and container backgrounds to differentiate data blocks.
- **Accents:** A soft tint (#D8F3DC) is used for subtle highlight backgrounds in chips or active selection states.

## Typography
Inter is used exclusively to maintain a systematic and utilitarian feel. 
- **Scale:** Bold weights are reserved for data points and headers to ensure immediate scannability.
- **Hierarchy:** Display sizes are tight-tracked for impact, while body text uses standard tracking for maximum legibility during workouts.
- **Responsiveness:** Large headlines scale down significantly on mobile to prevent awkward line breaks in data-heavy views.

## Layout & Spacing
This design system follows an 8px grid system to ensure consistent alignment.
- **Layout Model:** A fluid grid for mobile and tablet, moving to a max-width container (1280px) for desktop to maintain legibility.
- **Mobile:** 4-column grid with 16px margins.
- **Desktop:** 12-column grid with 24px gutters.
- **Rhythm:** Vertical rhythm is driven by the 4px base unit. Component internal padding should default to 12px or 16px to maintain a spacious, breathable feel.

## Elevation & Depth
Depth is conveyed through **Low-contrast outlines** rather than shadows. 
- **Surface Strategy:** Use #F9FAFB to create "wells" or background sections, and #FFFFFF for the cards sitting within them.
- **Borders:** All interactive elements and cards use a 1px solid border (#E5E7EB).
- **Active State:** Instead of elevation, active states are indicated by a 2px border in the primary color or a subtle background color shift. 
- **Shadows:** Only used in rare cases for floating elements (e.g., Modals), using a highly diffused, 4% opacity neutral gray.

## Shapes
The shape language is **Soft**, utilizing small radii to maintain a professional and structured appearance. 
- **Default:** 0.25rem (4px) for small components like checkboxes and input fields.
- **Large:** 0.5rem (8px) for cards and containers.
- **Buttons:** 4px roundedness to maintain the "functional/tool" aesthetic rather than a "lifestyle/playful" one.

## Components
- **Buttons:** Primary buttons are solid #1B4332 with white text. Secondary buttons use a 1px border of #E5E7EB with primary text. 
- **Input Fields:** 1px #E5E7EB borders, #F9FAFB background on hover, and a 1px #1B4332 border on focus. No inner shadows.
- **Cards:** White backgrounds with 1px #E5E7EB borders. Card headers should use `label-md` for categorical titles.
- **Chips:** Used for workout tags (e.g., "Strength", "HIIT"). Use the #D8F3DC background with #1B4332 text for high legibility and a soft branded touch.
- **Lists:** Clean rows with 1px bottom borders. No chevron icons unless the row is navigable.
- **Progress Bars:** High contrast #1B4332 fill against a #E5E7EB track. Use squared-off ends (4px radius) to match the shape system.
- **Data Visualizations:** Use the primary green for primary metrics, and neutral grays for secondary grid lines or axes.