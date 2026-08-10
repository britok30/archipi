import { expect } from 'vitest';
import { usePlannerStore } from '@/app/store/usePlannerStore';
import type { Layer } from '@/app/store/types';

export const LAYER = 'layer-1';

/** Fresh read of the store state. */
export const s = () => usePlannerStore.getState();

/** The default layer of the current scene. */
export const layer = (): Layer => s().scene.layers[LAYER];

/**
 * Draw a closed room through the real drawing actions. `coords` is the list
 * of corners in order; the loop is closed back to the first corner.
 */
export function drawRoom(coords: [number, number][]): void {
  if (coords.length < 3) throw new Error('drawRoom needs at least 3 corners');
  s().selectToolDrawingLine('wall');
  s().beginDrawingLine(LAYER, coords[0][0], coords[0][1]);
  for (let i = 1; i < coords.length; i++) {
    s().updateDrawingLine(coords[i][0], coords[i][1]);
    s().endDrawingLine(coords[i][0], coords[i][1]);
  }
  s().endDrawingLine(coords[0][0], coords[0][1]); // close the loop
  s().stopDrawingLine();
}

/** Draw an axis-aligned square room with its top-left corner at (x, y). */
export function drawSquare(offsetX = 0, offsetY = 0, size = 200): void {
  drawRoom([
    [offsetX, offsetY],
    [offsetX + size, offsetY],
    [offsetX + size, offsetY + size],
    [offsetX, offsetY + size],
  ]);
}

/** Draw a single standalone wall and return its line id. */
export function drawWall(x0: number, y0: number, x1: number, y1: number): string {
  const before = new Set(Object.keys(layer().lines));
  s().selectToolDrawingLine('wall');
  s().beginDrawingLine(LAYER, x0, y0);
  s().updateDrawingLine(x1, y1);
  s().endDrawingLine(x1, y1);
  s().stopDrawingLine();
  const added = Object.keys(layer().lines).filter((id) => !before.has(id));
  expect(added).toHaveLength(1);
  return added[0];
}

/** Place an item of `type` at (x, y) through the real drawing actions. */
export function placeItem(x: number, y: number, type = 'sofa'): string {
  const before = new Set(Object.keys(layer().items));
  s().selectToolDrawingItem(type);
  s().updateDrawingItem(LAYER, x, y);
  s().endDrawingItem(LAYER, x, y);
  const added = Object.keys(layer().items).filter((id) => !before.has(id));
  expect(added).toHaveLength(1);
  return added[0];
}

/** Place a hole (door/window) on the wall nearest to (x, y). */
export function placeHole(x: number, y: number, type = 'door'): string {
  const before = new Set(Object.keys(layer().holes));
  s().selectToolDrawingHole(type);
  s().updateDrawingHole(LAYER, x, y);
  s().endDrawingHole(LAYER, x, y);
  const added = Object.keys(layer().holes).filter((id) => !before.has(id));
  expect(added).toHaveLength(1);
  return added[0];
}

/** Find the id of the vertex at exactly (x, y). */
export function vertexAt(x: number, y: number): string {
  const found = Object.values(layer().vertices).find((v) => v.x === x && v.y === y);
  if (!found) throw new Error(`no vertex at (${x}, ${y})`);
  return found.id;
}

/** Reset undo history / dirty flag accumulated by scene-building helpers. */
export function resetHistory(): void {
  usePlannerStore.setState({ sceneHistory: { past: [], future: [] }, isDirty: false });
}
