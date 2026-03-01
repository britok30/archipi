/** Matrix type: a 2D array of numbers */
type Matrix = number[][];

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

/** @description Return absolute value of a number
 *  @param n Number of which to get value without sign
 *  @return The absolute value
 */
export const fAbs = (n: number): number => { let x = n; (x < 0) && (x = ~x + 1); return x; };

/** @description Multiply two matrices
 *  @param m1 Matrix 1
 *  @param m2 Matrix 2
 *  @return The resulting matrix product
 */
export const multiplyMatrices = (m1: Matrix, m2: Matrix): Matrix => {
  const result: Matrix = [];
  for (let i = 0; i < m1.length; i++) {
    result[i] = [];
    for (let j = 0; j < m2[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < m1[0].length; k++) {
        sum += m1[i][k] * m2[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
};
