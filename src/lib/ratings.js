import { SCALES } from "@/data/scales";

export function averageProfile(ratings) {
  if (ratings.length === 0) return null;
  return SCALES.map(
    (_, i) => ratings.reduce((sum, r) => sum + r.values[i], 0) / ratings.length,
  );
}
