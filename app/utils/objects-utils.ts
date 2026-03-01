export function objectsMap<T>(
  object: Record<string, T>,
  func: (key: string, value: T) => T
): Record<string, T> {
  const mappedObject: Record<string, T> = {};
  for (const key in object) {
    mappedObject[key] = func(key, mappedObject[key]);
  }
  return mappedObject;
}

export function objectsCompare(x: unknown, y: unknown): boolean {
  if (x === y) return true;
  if (!(x instanceof Object) || !(y instanceof Object)) return false;
  if ((x as object).constructor !== (y as object).constructor) return false;

  const xObj = x as Record<string, unknown>;
  const yObj = y as Record<string, unknown>;

  for (const p in xObj) {
    if (!xObj.hasOwnProperty(p)) continue;
    if (!yObj.hasOwnProperty(p)) return false;
    if (xObj[p] === yObj[p]) continue;
    if (typeof xObj[p] !== 'object') return false;
    if (!objectsCompare(xObj[p], yObj[p])) return false;
  }

  for (const p in yObj) {
    if (yObj.hasOwnProperty(p) && !xObj.hasOwnProperty(p)) return false;
  }

  return true;
}

export function sameSet<T>(set1: Set<T>, set2: Set<T>): boolean {
  if (set1.size !== set2.size) return false;
  for (const item of set1) {
    if (!set2.has(item)) return false;
  }
  return true;
}
