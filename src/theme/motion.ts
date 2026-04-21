import { Easing } from "react-native-reanimated";

export const motion = {
  duration: {
    instant: 80,
    fast: 160,
    base: 240,
    slow: 360,
    epic: 560,
  },
  easing: {
    iron: Easing.bezier(0.22, 1, 0.36, 1),
    forge: Easing.bezier(0.32, 0, 0.67, 0),
    anvil: Easing.bezier(0.65, 0, 0.35, 1),
  },
  spring: {
    gentle: { damping: 14, stiffness: 180, mass: 0.9 },
    bouncy: { damping: 10, stiffness: 220, mass: 0.8 },
    stiff: { damping: 20, stiffness: 280, mass: 1 },
  },
} as const;

export type MotionDuration = keyof typeof motion.duration;
export type MotionEasing = keyof typeof motion.easing;
