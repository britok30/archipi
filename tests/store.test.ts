import { describe, it, expect, beforeEach } from 'vitest';
import { usePlannerStore } from '@/app/store/usePlannerStore';
import { normalizeScene, makeDefaultScene, MODE_IDLE, MODE_DRAWING_HOLE } from '@/app/store/types';
import type { Layer, Scene } from '@/app/store/types';

const LAYER = 'layer-1';

const s = () => usePlannerStore.getState();
const layer = (): Layer => s().scene.layers[LAYER];

/** Draw a closed square room through the real drawing actions. */
function drawSquare(offsetX = 0, offsetY = 0, size = 200): void {
  s().selectToolDrawingLine('wall');
  s().beginDrawingLine(LAYER, offsetX, offsetY);
  s().updateDrawingLine(offsetX + size, offsetY);
  s().endDrawingLine(offsetX + size, offsetY);
  s().endDrawingLine(offsetX + size, offsetY + size);
  s().endDrawingLine(offsetX, offsetY + size);
  s().endDrawingLine(offsetX, offsetY); // closes the loop (merges into start vertex)
  s().stopDrawingLine();
}

/** Draw a single standalone wall from (x0,y0) to (x1,y1). */
function drawWall(x0: number, y0: number, x1: number, y1: number): string {
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

/** Assert every cross-reference in the layer points at an existing entity. */
function assertLayerIntegrity(l: Layer): void {
  for (const area of Object.values(l.areas)) {
    for (const holeAreaId of area.holes) {
      expect(l.areas[holeAreaId], `area ${area.id} references missing hole-area ${holeAreaId}`).toBeDefined();
    }
    for (const vId of area.vertices) {
      expect(l.vertices[vId], `area ${area.id} references missing vertex ${vId}`).toBeDefined();
    }
  }
  for (const vertex of Object.values(l.vertices)) {
    for (const lineId of vertex.lines) {
      expect(l.lines[lineId], `vertex ${vertex.id} references missing line ${lineId}`).toBeDefined();
    }
    for (const areaId of vertex.areas) {
      expect(l.areas[areaId], `vertex ${vertex.id} references missing area ${areaId}`).toBeDefined();
    }
  }
  for (const line of Object.values(l.lines)) {
    for (const vId of line.vertices) {
      expect(l.vertices[vId], `line ${line.id} references missing vertex ${vId}`).toBeDefined();
    }
    for (const hId of line.holes) {
      expect(l.holes[hId], `line ${line.id} references missing hole ${hId}`).toBeDefined();
    }
  }
  for (const hole of Object.values(l.holes)) {
    expect(l.lines[hole.line], `hole ${hole.id} references missing line ${hole.line}`).toBeDefined();
  }
}

beforeEach(() => {
  usePlannerStore.getState().newProject();
});

describe('history', () => {
  it('editing actions push history and set isDirty', () => {
    const lineId = drawWall(0, 0, 400, 0);
    // Reset history/dirty accumulated while drawing
    usePlannerStore.setState({ sceneHistory: { past: [], future: [] }, isDirty: false });

    s().selectLine(LAYER, lineId);
    s().setProperties({ testProp: 'red' });

    expect(s().isDirty).toBe(true);
    expect(s().sceneHistory.past).toHaveLength(1);
    expect(layer().lines[lineId].properties.testProp).toBe('red');
  });

  it('past never exceeds 50 entries after 60+ pushes', () => {
    for (let i = 0; i < 65; i++) {
      s().saveProjectToHistory();
    }
    expect(s().sceneHistory.past).toHaveLength(50);
  });

  it('undo restores the prior scene and redo re-applies', () => {
    const originalWidth = s().scene.width;
    s().setProjectProperties({ width: 5555 });
    expect(s().scene.width).toBe(5555);

    s().undo();
    expect(s().scene.width).toBe(originalWidth);
    expect(s().sceneHistory.future).toHaveLength(1);

    s().redo();
    expect(s().scene.width).toBe(5555);
    expect(s().sceneHistory.future).toHaveLength(0);
  });

  it('undo and redo clear drawing/dragging/rotating supports', () => {
    s().setProjectProperties({ width: 4000 });
    usePlannerStore.setState({
      drawingSupport: { type: 'wall' },
      draggingSupport: { layerID: LAYER },
      rotatingSupport: { layerID: LAYER },
    });
    s().undo();
    expect(s().drawingSupport).toEqual({});
    expect(s().draggingSupport).toEqual({});
    expect(s().rotatingSupport).toEqual({});
    expect(s().mode).toBe(MODE_IDLE);

    usePlannerStore.setState({
      drawingSupport: { type: 'wall' },
      draggingSupport: { layerID: LAYER },
      rotatingSupport: { layerID: LAYER },
    });
    s().redo();
    expect(s().drawingSupport).toEqual({});
    expect(s().draggingSupport).toEqual({});
    expect(s().rotatingSupport).toEqual({});
  });

  it('rollback pops the history entry it restores', () => {
    const lineId = drawWall(0, 0, 400, 0);
    const pastBeforeDrag = s().sceneHistory.past.length;
    const sceneBeforeDrag = JSON.parse(JSON.stringify(s().scene));

    s().beginDraggingLine(LAYER, lineId, 10, 0);
    expect(s().sceneHistory.past).toHaveLength(pastBeforeDrag + 1);
    s().updateDraggingLine(150, 90);

    s().rollback();
    expect(s().sceneHistory.past).toHaveLength(pastBeforeDrag);
    expect(s().mode).toBe(MODE_IDLE);
    expect(s().draggingSupport).toEqual({});
    expect(s().scene).toEqual(sceneBeforeDrag);
  });

  it('cancelDrawing resets mode and drawingSupport without touching history', () => {
    s().selectToolDrawingHole('door');
    expect(s().mode).toBe(MODE_DRAWING_HOLE);
    const pastLength = s().sceneHistory.past.length;

    s().cancelDrawing();
    expect(s().mode).toBe(MODE_IDLE);
    expect(s().drawingSupport).toEqual({});
    expect(s().sceneHistory.past).toHaveLength(pastLength);
  });
});

describe('line drawing', () => {
  it('drawing a closed square produces exactly one area with 4 vertices', () => {
    drawSquare();

    const l = layer();
    expect(Object.keys(l.lines)).toHaveLength(4);
    expect(Object.keys(l.vertices)).toHaveLength(4);

    const areas = Object.values(l.areas);
    expect(areas).toHaveLength(1);
    expect(areas[0].vertices).toHaveLength(4);
    assertLayerIntegrity(l);
  });

  it('drawing a duplicate wall over an existing one does not create a second line', () => {
    drawSquare();
    expect(Object.keys(layer().lines)).toHaveLength(4);

    // Redraw the bottom edge on top of itself
    s().selectToolDrawingLine('wall');
    s().beginDrawingLine(LAYER, 0, 0); // reuses corner vertex
    s().updateDrawingLine(200, 0);
    s().endDrawingLine(200, 0); // merges into the other corner, dedupes
    s().stopDrawingLine();

    const l = layer();
    expect(Object.keys(l.lines)).toHaveLength(4);
    expect(Object.keys(l.vertices)).toHaveLength(4);

    // No two lines share the same unordered vertex pair
    const pairs = Object.values(l.lines).map((line) => [...line.vertices].sort().join('|'));
    expect(new Set(pairs).size).toBe(pairs.length);

    expect(Object.values(l.areas)).toHaveLength(1);
    assertLayerIntegrity(l);
  });
});

describe('remove', () => {
  it('deletes a selected line, its orphan vertices, and group references', () => {
    const lineId = drawWall(0, 0, 400, 0);

    s().addGroup();
    const groupId = Object.keys(s().scene.groups)[0];
    s().addToGroup(groupId, LAYER, 'lines', lineId);
    expect(s().scene.groups[groupId].elements[LAYER].lines).toContain(lineId);

    s().selectLine(LAYER, lineId);
    s().remove();

    const l = layer();
    expect(l.lines[lineId]).toBeUndefined();
    expect(Object.keys(l.vertices)).toHaveLength(0); // orphan vertices swept
    expect(s().scene.groups[groupId].elements[LAYER].lines).not.toContain(lineId);
    expect(s().mode).toBe(MODE_IDLE);
  });

  it('pushes no history entry when nothing is selected', () => {
    drawWall(0, 0, 400, 0);
    const pastLength = s().sceneHistory.past.length;
    s().remove();
    expect(s().sceneHistory.past).toHaveLength(pastLength);
  });
});

describe('removeGroupAndDeleteElements', () => {
  it('deletes grouped lines and leaves no dangling references', () => {
    // Two adjacent rooms sharing the wall x=200
    drawSquare(0, 0, 200);
    const linesAfterRoom1 = new Set(Object.keys(layer().lines));

    s().selectToolDrawingLine('wall');
    s().beginDrawingLine(LAYER, 200, 0);
    s().updateDrawingLine(400, 0);
    s().endDrawingLine(400, 0);
    s().endDrawingLine(400, 200);
    s().endDrawingLine(200, 200);
    s().stopDrawingLine();

    expect(Object.values(layer().areas)).toHaveLength(2);
    const room2Lines = Object.keys(layer().lines).filter((id) => !linesAfterRoom1.has(id));
    expect(room2Lines).toHaveLength(3);

    s().addGroup();
    const groupId = Object.keys(s().scene.groups)[0];
    for (const id of room2Lines) {
      s().addToGroup(groupId, LAYER, 'lines', id);
    }

    s().removeGroupAndDeleteElements(groupId);

    const l = layer();
    expect(s().scene.groups[groupId]).toBeUndefined();
    for (const id of room2Lines) {
      expect(l.lines[id]).toBeUndefined();
    }
    // Room 1 survives intact
    expect(Object.keys(l.lines)).toHaveLength(4);
    expect(Object.values(l.areas)).toHaveLength(1);
    assertLayerIntegrity(l);
  });
});

describe('normalizeScene', () => {
  it('returns a usable scene for a valid scene', () => {
    const scene = makeDefaultScene();
    const normalized = normalizeScene(scene);
    expect(normalized).not.toBeNull();
    expect(normalized!.selectedLayer).toBe(LAYER);
    expect(Object.keys(normalized!.layers)).toEqual([LAYER]);
  });

  it('fills missing guides and groups', () => {
    const scene = makeDefaultScene() as Partial<Scene> & Record<string, unknown>;
    delete scene.guides;
    delete scene.groups;
    const normalized = normalizeScene(scene);
    expect(normalized).not.toBeNull();
    expect(normalized!.guides).toEqual({ horizontal: {}, vertical: {}, circular: {} });
    expect(normalized!.groups).toEqual({});
  });

  it('falls back selectedLayer to the first layer when invalid', () => {
    const scene = makeDefaultScene();
    scene.selectedLayer = 'no-such-layer';
    const normalized = normalizeScene(scene);
    expect(normalized).not.toBeNull();
    expect(normalized!.selectedLayer).toBe(LAYER);
  });

  it('returns null for garbage input', () => {
    expect(normalizeScene({})).toBeNull();
    expect(normalizeScene(null)).toBeNull();
    expect(normalizeScene(undefined)).toBeNull();
    expect(normalizeScene([])).toBeNull();
    expect(normalizeScene('scene')).toBeNull();
    expect(normalizeScene({ layers: {} })).toBeNull();
  });
});

describe('hole placement', () => {
  it('places a hole at the previewed offset, not the midpoint', () => {
    const lineId = drawWall(0, 0, 400, 0);

    s().selectToolDrawingHole('door');
    s().updateDrawingHole(LAYER, 100, 0); // 25% along the wall
    expect(s().drawingSupport.previewLineId).toBe(lineId);
    expect(s().drawingSupport.previewOffset).toBeCloseTo(0.25);

    s().endDrawingHole(LAYER, 100, 0);

    const holes = Object.values(layer().holes);
    expect(holes).toHaveLength(1);
    expect(holes[0].line).toBe(lineId);
    expect(holes[0].offset).toBeCloseTo(0.25);
    expect(layer().lines[lineId].holes).toContain(holes[0].id);
    expect(s().mode).toBe(MODE_IDLE);
    expect(s().drawingSupport).toEqual({});
  });
});
