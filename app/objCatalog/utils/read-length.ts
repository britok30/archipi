import convert from "convert-units";

/**
 * Read a length-measure property off a placed element, converted to the
 * scene's unit. Elements saved before an item gained width/depth/height
 * properties (or hand-edited JSON) may lack them entirely — fall back to the
 * item's default (in cm) instead of letting convert-units throw on an
 * undefined unit.
 */
export function readItemLength(
  prop: { length?: number; unit?: string } | undefined,
  scene: { unit: string },
  fallbackCm: number
): number {
  const length = prop?.length;
  const unit = prop?.unit;
  if (typeof length !== "number" || !isFinite(length) || !unit) {
    return convert(fallbackCm).from("cm").to(scene.unit as any);
  }
  try {
    return convert(length).from(unit as any).to(scene.unit as any);
  } catch {
    return convert(fallbackCm).from("cm").to(scene.unit as any);
  }
}
