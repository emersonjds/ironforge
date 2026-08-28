import type { Measurement, PhotoAngle, ProgressPhoto } from "../api";

export const PHOTO_ANGLES: PhotoAngle[] = ["front", "back", "side"];

export const ANGLE_LABEL: Record<PhotoAngle, string> = {
  front: "Frente",
  back: "Costas",
  side: "Lado",
};

/**
 * The oldest and the newest measurement, which is the comparison worth showing:
 * a photo next to the one from three months ago says more than a gallery.
 * Returns null when there is nothing to compare against.
 */
export function comparisonPair(
  measurements: Measurement[],
): { before: Measurement; after: Measurement } | null {
  if (measurements.length < 2) return null;

  const sorted = [...measurements].sort(
    (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime(),
  );

  return { before: sorted[0]!, after: sorted[sorted.length - 1]! };
}

export function photoForAngle(photos: ProgressPhoto[], angle: PhotoAngle): ProgressPhoto | null {
  return photos.find((photo) => photo.angle === angle) ?? null;
}

export function hasAnyPhoto(...groups: ProgressPhoto[][]): boolean {
  return groups.some((photos) => photos.length > 0);
}
