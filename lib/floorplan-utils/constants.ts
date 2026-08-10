//UNITS
export const UNIT_MILLIMETER = 'mm' as const;
export const UNIT_CENTIMETER = 'cm' as const;
export const UNIT_METER = 'm' as const;
export const UNIT_INCH = 'in' as const;
export const UNIT_FOOT = 'ft' as const;
export const UNIT_MILE = 'mi' as const;

export const UNITS_LENGTH: readonly string[] = [
  UNIT_MILLIMETER,
  UNIT_CENTIMETER,
  UNIT_METER,
  UNIT_INCH,
  UNIT_FOOT,
  UNIT_MILE
];

export const EPSILON: number = 1e-6;
