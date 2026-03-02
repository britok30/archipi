/** @description Return float fixed to desired precision
 *  @param num Float to fix
 *  @param precision Desired precision, or 6 if not specified
 *  @return The fixed float value
 */
export function toFixedFloat(num: number, precision: number = 6): number {
  if (num && precision) {
    return parseFloat(parseFloat(String(num)).toFixed(precision));
  }
  return 0;
}

/** @description Return absolute value of a number */
export const fAbs = Math.abs;
