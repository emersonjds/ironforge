import type { Muscle } from "@/types/enums";

export const MUSCLE_LABEL: Record<Muscle, string> = {
  chest: "Peitoral",
  back_lats: "Latíssimo",
  back_upper: "Trapézio/Rombóides",
  back_lower: "Lombar",
  quads: "Quadríceps",
  hamstrings: "Posterior de coxa",
  glutes: "Glúteos",
  calves: "Panturrilha",
  shoulders_front: "Deltóide anterior",
  shoulders_side: "Deltóide lateral",
  shoulders_rear: "Deltóide posterior",
  biceps: "Bíceps",
  triceps: "Tríceps",
  forearms: "Antebraço",
  core: "Core",
};

export function muscleLabel(m: Muscle): string {
  return MUSCLE_LABEL[m] ?? m;
}
