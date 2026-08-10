import { describe, it, expect, beforeEach } from 'vitest';
import { usePlannerStore } from '@/app/store/usePlannerStore';
import {
  MODE_IDLE,
  MODE_2D_PAN,
  MODE_2D_ZOOM_IN,
  MODE_2D_ZOOM_OUT,
  MODE_3D_VIEW,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_ITEM,
  MODE_DRAGGING_LINE,
  MODE_DRAGGING_VERTEX,
  MODE_ROTATING_ITEM,
  MODE_VIEWING_CATALOG,
  MODE_CONFIGURING_PROJECT,
} from '@/app/store/types';
import {
  LAYER,
  s,
  layer,
  drawSquare,
  drawRoom,
  drawWall,
  placeItem,
  placeHole,
  vertexAt,
  resetHistory,
} from './helpers';

beforeEach(() => {
  usePlannerStore.getState().newProject();
});

// ===========================================================================
// Layers
// ===========================================================================
describe('layer CRUD', () => {
  it('addLayer creates and selects a new layer with the given name/altitude', () => {
    s().addLayer('First floor', 300);

    const ids = Object.keys(s().scene.layers);
    expect(ids).toHaveLength(2);
    const newId = ids.find((id) => id !== LAYER)!;
    expect(s().scene.selectedLayer).toBe(newId);

    const newLayer = s().scene.layers[newId];
    expect(newLayer.name).toBe('First floor');
    expect(newLayer.altitude).toBe(300);
    expect(newLayer.order).toBe(1);
    expect(newLayer.lines).toEqual({});
  });

  it('selectLayer switches only to existing layers', () => {
    s().addLayer('Upper', 300);
    s().selectLayer(LAYER);
    expect(s().scene.selectedLayer).toBe(LAYER);

    s().selectLayer('no-such-layer');
    expect(s().scene.selectedLayer).toBe(LAYER);
  });

  it('removeLayer purges group references and falls back selectedLayer', () => {
    s().addLayer('Upper', 300);
    const upperId = Object.keys(s().scene.layers).find((id) => id !== LAYER)!;
    expect(s().scene.selectedLayer).toBe(upperId);

    s().addGroup();
    const groupId = Object.keys(s().scene.groups)[0];
    s().addToGroup(groupId, upperId, 'lines', 'some-line');
    s().addToGroup(groupId, LAYER, 'items', 'some-item');

    s().removeLayer(upperId);

    expect(s().scene.layers[upperId]).toBeUndefined();
    expect(s().scene.selectedLayer).toBe(LAYER);
    const group = s().scene.groups[groupId];
    expect(group.elements[upperId]).toBeUndefined();
    // Other layers' references survive
    expect(group.elements[LAYER].items).toEqual(['some-item']);
  });

  it('removeLayer refuses to delete the last remaining layer', () => {
    s().removeLayer(LAYER);
    expect(s().scene.layers[LAYER]).toBeDefined();
    expect(s().scene.selectedLayer).toBe(LAYER);
  });

  it('setLayerProperties patches the layer', () => {
    s().setLayerProperties(LAYER, { name: 'renamed', opacity: 0.4 });
    expect(layer().name).toBe('renamed');
    expect(layer().opacity).toBe(0.4);
  });
});

// ===========================================================================
// Guides
// ===========================================================================
describe('guides', () => {
  it('adds and removes horizontal, vertical and circular guides', () => {
    s().addHorizontalGuide(120);
    s().addVerticalGuide(340);
    s().addCircularGuide(50, 60, 70);

    const { horizontal, vertical, circular } = s().scene.guides;
    const [hId] = Object.keys(horizontal);
    const [vId] = Object.keys(vertical);
    const [cId] = Object.keys(circular);

    expect(horizontal[hId]).toEqual({ id: hId, y: 120 });
    expect(vertical[vId]).toEqual({ id: vId, x: 340 });
    expect(circular[cId]).toEqual({ id: cId, x: 50, y: 60, radius: 70 });

    s().removeHorizontalGuide(hId);
    s().removeVerticalGuide(vId);
    s().removeCircularGuide(cId);

    expect(s().scene.guides.horizontal).toEqual({});
    expect(s().scene.guides.vertical).toEqual({});
    expect(s().scene.guides.circular).toEqual({});
  });
});

// ===========================================================================
// Groups
// ===========================================================================
describe('groups', () => {
  it('addToGroup dedupes ids and removeFromGroup removes them', () => {
    const lineId = drawWall(0, 0, 400, 0);
    s().addGroup();
    const groupId = Object.keys(s().scene.groups)[0];

    s().addToGroup(groupId, LAYER, 'lines', lineId);
    s().addToGroup(groupId, LAYER, 'lines', lineId); // duplicate
    expect(s().scene.groups[groupId].elements[LAYER].lines).toEqual([lineId]);

    s().removeFromGroup(groupId, LAYER, 'lines', lineId);
    expect(s().scene.groups[groupId].elements[LAYER].lines).toEqual([]);
  });

  it('addGroupFromSelected captures the current selection', () => {
    const lineId = drawWall(0, 0, 400, 0);
    s().selectLine(LAYER, lineId);
    s().addGroupFromSelected();

    const groupId = Object.keys(s().scene.groups)[0];
    expect(s().scene.groups[groupId].elements[LAYER].lines).toEqual([lineId]);

    // Nothing selected -> no group created
    s().unselectAll();
    s().addGroupFromSelected();
    expect(Object.keys(s().scene.groups)).toHaveLength(1);
  });

  it('selectGroup marks the group selected and unselects elements', () => {
    const lineId = drawWall(0, 0, 400, 0);
    s().selectLine(LAYER, lineId);
    s().addGroup();
    const groupId = Object.keys(s().scene.groups)[0];

    s().selectGroup(groupId);
    expect(s().scene.groups[groupId].selected).toBe(true);
    expect(layer().lines[lineId].selected).toBe(false);
    expect(layer().selected.lines).toEqual([]);

    s().unselectGroup(groupId);
    expect(s().scene.groups[groupId].selected).toBe(false);
  });

  it('groupTranslate moves every member vertex and item by the delta', () => {
    const lineId = drawWall(100, 100, 300, 100);
    const itemId = placeItem(150, 150);
    s().addGroup();
    const groupId = Object.keys(s().scene.groups)[0];
    s().addToGroup(groupId, LAYER, 'lines', lineId);
    s().addToGroup(groupId, LAYER, 'items', itemId);

    // Group starts at (0, 0); translating to (50, 30) is a delta of (50, 30)
    s().groupTranslate(groupId, 50, 30);

    const [vA, vB] = layer().lines[lineId].vertices.map((id) => layer().vertices[id]);
    const xs = [vA, vB].map((v) => `${v.x},${v.y}`).sort();
    expect(xs).toEqual(['150,130', '350,130']);
    expect(layer().items[itemId].x).toBe(200);
    expect(layer().items[itemId].y).toBe(180);
    expect(s().scene.groups[groupId].x).toBe(50);
    expect(s().scene.groups[groupId].y).toBe(30);
  });

  it('groupRotate rotates vertices and items around the group barycenter', () => {
    const lineId = drawWall(0, 0, 100, 0);
    const itemId = placeItem(100, 0);
    s().addGroup();
    const groupId = Object.keys(s().scene.groups)[0];
    s().addToGroup(groupId, LAYER, 'lines', lineId);
    s().addToGroup(groupId, LAYER, 'items', itemId);
    s().setGroupBarycenter(groupId, 0, 0);

    s().groupRotate(groupId, 90);

    // (100, 0) rotated 90deg about origin -> (0, 100)
    const v = layer().lines[lineId].vertices
      .map((id) => layer().vertices[id])
      .find((vv) => Math.abs(vv.x) > 50 || Math.abs(vv.y) > 50)!;
    expect(v.x).toBeCloseTo(0, 6);
    expect(v.y).toBeCloseTo(100, 6);

    const item = layer().items[itemId];
    expect(item.x).toBeCloseTo(0, 6);
    expect(item.y).toBeCloseTo(100, 6);
    expect(item.rotation).toBeCloseTo(90, 6);
    expect(s().scene.groups[groupId].rotation).toBe(90);
  });

  it('removeGroup keeps the member elements in the scene', () => {
    const lineId = drawWall(0, 0, 400, 0);
    s().addGroup();
    const groupId = Object.keys(s().scene.groups)[0];
    s().addToGroup(groupId, LAYER, 'lines', lineId);

    s().removeGroup(groupId);

    expect(s().scene.groups[groupId]).toBeUndefined();
    expect(layer().lines[lineId]).toBeDefined();
  });
});

// ===========================================================================
// Item lifecycle
// ===========================================================================
describe('item lifecycle', () => {
  it('drawing an item places it at the rounded cursor position', () => {
    s().selectToolDrawingItem('sofa');
    expect(s().mode).toBe(MODE_DRAWING_ITEM);

    s().updateDrawingItem(LAYER, 150.4, 90.6);
    expect(s().drawingSupport.previewX).toBe(150);
    expect(s().drawingSupport.previewY).toBe(91);

    s().endDrawingItem(LAYER, 150.4, 90.6);
    const items = Object.values(layer().items);
    expect(items).toHaveLength(1);
    expect(items[0].x).toBe(150);
    expect(items[0].y).toBe(91);
    expect(items[0].rotation).toBe(0);
    expect(items[0].type).toBe('sofa');
    expect(s().mode).toBe(MODE_IDLE);
    expect(s().drawingSupport).toEqual({});
  });

  it('dragging an item moves it by the cursor delta from the original position', () => {
    const itemId = placeItem(100, 100);

    s().beginDraggingItem(LAYER, itemId, 110, 105);
    expect(s().mode).toBe(MODE_DRAGGING_ITEM);

    s().updateDraggingItem(160, 135); // delta (50, 30)
    expect(layer().items[itemId].x).toBe(150);
    expect(layer().items[itemId].y).toBe(130);

    // Deltas are measured from the ORIGINAL position, not cumulative
    s().updateDraggingItem(120, 115); // delta (10, 10)
    expect(layer().items[itemId].x).toBe(110);
    expect(layer().items[itemId].y).toBe(110);

    s().endDraggingItem(120, 115);
    expect(s().mode).toBe(MODE_IDLE);
    expect(s().draggingSupport).toEqual({});
    expect(layer().items[itemId].x).toBe(110);
    expect(layer().items[itemId].y).toBe(110);
  });

  it('rotating an item applies the angular delta around its center', () => {
    const itemId = placeItem(100, 100);

    // Start the gesture due east of the item, then move the cursor due north
    s().beginRotatingItem(LAYER, itemId, 200, 100);
    expect(s().mode).toBe(MODE_ROTATING_ITEM);

    s().updateRotatingItem(100, 200);
    expect(layer().items[itemId].rotation).toBeCloseTo(90, 6);

    s().endRotatingItem(100, 200);
    expect(s().mode).toBe(MODE_IDLE);
    expect(s().rotatingSupport).toEqual({});
    expect(layer().items[itemId].rotation).toBeCloseTo(90, 6);
  });
});

// ===========================================================================
// Vertex dragging
// ===========================================================================
describe('vertex dragging', () => {
  it('dragging a shared vertex of two rooms keeps both areas with updated coords', () => {
    // Two adjacent 200x200 rooms sharing the wall x=200
    drawSquare(0, 0, 200);
    drawRoom([
      [200, 0],
      [400, 0],
      [400, 200],
      [200, 200],
    ]);
    expect(Object.values(layer().areas)).toHaveLength(2);

    const sharedId = vertexAt(200, 0);
    // The shared corner belongs to three walls (both rooms + shared wall)
    expect(layer().vertices[sharedId].lines).toHaveLength(3);

    s().beginDraggingVertex(LAYER, sharedId, 200, 0);
    expect(s().mode).toBe(MODE_DRAGGING_VERTEX);
    s().updateDraggingVertex(230, -40);
    expect(layer().vertices[sharedId].x).toBe(230);
    expect(layer().vertices[sharedId].y).toBe(-40);

    s().endDraggingVertex(230, -40);
    expect(s().mode).toBe(MODE_IDLE);

    const vertex = layer().vertices[sharedId];
    expect(vertex.x).toBe(230);
    expect(vertex.y).toBe(-40);

    // Both rooms survive re-detection and both contain the moved vertex
    const areas = Object.values(layer().areas);
    expect(areas).toHaveLength(2);
    areas.forEach((area) => {
      expect(area.vertices).toContain(sharedId);
    });
  });

  it('dropping a vertex onto another one merges them', () => {
    const lineA = drawWall(0, 0, 400, 0);
    drawWall(600, 300, 900, 300);

    const dragged = vertexAt(400, 0);
    const target = vertexAt(600, 300);

    s().beginDraggingVertex(LAYER, dragged, 400, 0);
    s().updateDraggingVertex(595, 295);
    s().endDraggingVertex(595, 295); // within the 30cm merge threshold

    expect(layer().vertices[dragged]).toBeUndefined();
    expect(layer().lines[lineA].vertices).toContain(target);
    expect(layer().vertices[target].lines).toHaveLength(2);
  });
});

// ===========================================================================
// Line dragging
// ===========================================================================
describe('line dragging', () => {
  it('dragging a wall of a room moves both endpoints and the area survives', () => {
    drawSquare(0, 0, 200);
    // Bottom edge: (0,0)-(200,0)
    const bottom = Object.values(layer().lines).find((line) => {
      const [a, b] = line.vertices.map((id) => layer().vertices[id]);
      return a.y === 0 && b.y === 0;
    })!;

    s().beginDraggingLine(LAYER, bottom.id, 100, 0);
    expect(s().mode).toBe(MODE_DRAGGING_LINE);

    s().updateDraggingLine(110, -50); // delta (10, -50)
    s().endDraggingLine(110, -50);

    const [a, b] = layer().lines[bottom.id].vertices
      .map((id) => layer().vertices[id])
      .sort((v1, v2) => v1.x - v2.x);
    expect([a.x, a.y]).toEqual([10, -50]);
    expect([b.x, b.y]).toEqual([210, -50]);

    expect(s().mode).toBe(MODE_IDLE);
    // Room survives as a (distorted) quadrilateral
    const areas = Object.values(layer().areas);
    expect(areas).toHaveLength(1);
    expect(areas[0].vertices).toHaveLength(4);
  });
});

// ===========================================================================
// Clipboard
// ===========================================================================
describe('clipboard', () => {
  it('pasteProperties deep-clones onto targets and is undoable', () => {
    const lineId = drawWall(0, 0, 400, 0);
    resetHistory();

    const nested = { color: { name: 'red', hex: '#f00' } };
    s().copyProperties(nested);
    s().selectLine(LAYER, lineId);
    s().pasteProperties();

    expect(s().sceneHistory.past).toHaveLength(1);
    const pasted = layer().lines[lineId].properties.color as { name: string; hex: string };
    expect(pasted).toEqual({ name: 'red', hex: '#f00' });
    // Deep-clone semantics: the element holds its own copy, not a shared ref
    expect(pasted).not.toBe(s().clipboardProperties.color);

    s().undo();
    expect(layer().lines[lineId].properties.color).toBeUndefined();
    // Clipboard content survives the undo
    expect(s().clipboardProperties).toEqual(nested);
  });

  it('pasteProperties with an empty clipboard or selection is a no-op', () => {
    const lineId = drawWall(0, 0, 400, 0);
    resetHistory();

    // Non-empty clipboard, nothing selected
    s().copyProperties({ a: 1 });
    s().pasteProperties();
    expect(s().sceneHistory.past).toHaveLength(0);

    // Empty clipboard, line selected
    s().copyProperties({});
    s().selectLine(LAYER, lineId);
    s().pasteProperties();
    expect(s().sceneHistory.past).toHaveLength(0);
    expect(layer().lines[lineId].properties.a).toBeUndefined();
  });
});

// ===========================================================================
// Attribute setters
// ===========================================================================
describe('setProperties / attributes setters', () => {
  it('setProperties writes onto every selected element and pushes history', () => {
    const lineId = drawWall(0, 0, 400, 0);
    resetHistory();
    s().selectLine(LAYER, lineId);
    s().setProperties({ thickness: { length: 30 } });

    expect(s().sceneHistory.past).toHaveLength(1);
    expect(layer().lines[lineId].properties.thickness).toEqual({ length: 30 });
  });

  it('setItemsAttributes updates position/rotation of selected items', () => {
    const itemId = placeItem(10, 20);
    s().selectItem(LAYER, itemId);
    s().setItemsAttributes({ x: 55, y: 66, rotation: 45 });

    const item = layer().items[itemId];
    expect(item.x).toBe(55);
    expect(item.y).toBe(66);
    expect(item.rotation).toBe(45);
  });

  it('setLinesAttributes vertexOne/vertexTwo moves the real vertices', () => {
    const lineId = drawWall(0, 0, 400, 0);
    s().selectLine(LAYER, lineId);

    s().setLinesAttributes({
      vertexOne: { x: 10, y: 20 },
      vertexTwo: { x: 310, y: 20 },
    });

    const [v0, v1] = layer().lines[lineId].vertices.map((id) => layer().vertices[id]);
    expect([v0.x, v0.y]).toEqual([10, 20]);
    expect([v1.x, v1.y]).toEqual([310, 20]);
  });

  it('setLinesAttributes lineLength moves vertex 1 along the line direction', () => {
    const lineId = drawWall(0, 0, 300, 400); // length 500, direction (0.6, 0.8)
    s().selectLine(LAYER, lineId);

    s().setLinesAttributes({ lineLength: { length: 250, _unit: 'cm' } });

    const [v0, v1] = layer().lines[lineId].vertices.map((id) => layer().vertices[id]);
    expect([v0.x, v0.y]).toEqual([0, 0]); // anchor unchanged
    expect(v1.x).toBeCloseTo(150, 6);
    expect(v1.y).toBeCloseTo(200, 6);
    expect(layer().lines[lineId].misc._unitLength).toBe('cm');
  });

  it('setLinesAttributes leaves no junk editor keys on the Line object', () => {
    const lineId = drawWall(0, 0, 400, 0);
    s().selectLine(LAYER, lineId);
    const keysBefore = Object.keys(layer().lines[lineId]).sort();

    s().setLinesAttributes({
      vertexOne: { x: 5, y: 5 },
      vertexTwo: { x: 105, y: 5 },
      lineLength: { length: 100, _unit: 'cm' },
    });

    const line = layer().lines[lineId] as unknown as Record<string, unknown>;
    expect(Object.keys(line).sort()).toEqual(keysBefore);
    expect(line.vertexOne).toBeUndefined();
    expect(line.lineLength).toBeUndefined();
  });

  it('setHolesAttributes clamps offset to [0, 1] and keeps units', () => {
    drawWall(0, 0, 400, 0);
    const holeId = placeHole(100, 0);
    s().selectHole(LAYER, holeId);

    s().setHolesAttributes({ offset: 1.7 });
    expect(layer().holes[holeId].offset).toBe(1);

    s().setHolesAttributes({ offset: -0.4 });
    expect(layer().holes[holeId].offset).toBe(0);

    s().setHolesAttributes({ offset: 0.35, offsetA: { _unit: 'm' }, offsetB: { _unit: 'cm' } });
    expect(layer().holes[holeId].offset).toBe(0.35);
    expect(layer().holes[holeId].misc._unitA).toBe('m');
    expect(layer().holes[holeId].misc._unitB).toBe('cm');
    // Derived editor fields never land on the Hole
    expect((layer().holes[holeId] as unknown as Record<string, unknown>).offsetA).toBeUndefined();
  });
});

// ===========================================================================
// Zoom / pan / view state
// ===========================================================================
describe('viewer state', () => {
  it('updates zoom, mouse and camera view', () => {
    s().updateZoomScale(2.5);
    expect(s().zoom).toBe(2.5);

    s().updateMouseCoords({ x: 12, y: 34 });
    expect(s().mouse).toEqual({ x: 12, y: 34 });

    s().updateCameraView({ a: 1, d: 1, e: 250, f: -80 });
    expect(s().viewer2D).toEqual({ a: 1, d: 1, e: 250, f: -80 });
  });

  it('tool selection switches modes', () => {
    s().selectToolPan();
    expect(s().mode).toBe(MODE_2D_PAN);
    s().selectToolZoomIn();
    expect(s().mode).toBe(MODE_2D_ZOOM_IN);
    s().selectToolZoomOut();
    expect(s().mode).toBe(MODE_2D_ZOOM_OUT);
    s().selectTool3DView();
    expect(s().mode).toBe(MODE_3D_VIEW);
    s().openCatalog();
    expect(s().mode).toBe(MODE_VIEWING_CATALOG);
    s().openProjectConfigurator();
    expect(s().mode).toBe(MODE_CONFIGURING_PROJECT);
    s().selectToolEdit();
    expect(s().mode).toBe(MODE_IDLE);
  });
});

// ===========================================================================
// Mode transitions with mid-drawing cleanup
// ===========================================================================
describe('mid-drawing cleanup', () => {
  it('selectToolEdit during line drawing removes the trailing rubber-band line', () => {
    s().selectToolDrawingLine('wall');
    s().beginDrawingLine(LAYER, 0, 0);
    s().updateDrawingLine(200, 0);
    s().endDrawingLine(200, 0); // commits wall #1, starts trailing line #2
    s().updateDrawingLine(200, 150);

    // One committed wall + one trailing rubber-band line
    expect(Object.keys(layer().lines)).toHaveLength(2);

    s().selectToolEdit();

    expect(s().mode).toBe(MODE_IDLE);
    expect(s().drawingSupport).toEqual({});
    const lines = Object.values(layer().lines);
    expect(lines).toHaveLength(1);
    // The surviving wall is the committed one
    const coords = lines[0].vertices
      .map((id) => layer().vertices[id])
      .map((v) => `${v.x},${v.y}`)
      .sort();
    expect(coords).toEqual(['0,0', '200,0']);
    // No loose vertex left behind
    expect(Object.keys(layer().vertices)).toHaveLength(2);
  });

  it('switching to pan mid-drawing performs the same cleanup', () => {
    s().selectToolDrawingLine('wall');
    s().beginDrawingLine(LAYER, 0, 0);
    s().updateDrawingLine(300, 0);
    s().endDrawingLine(300, 0);
    s().selectToolPan();

    expect(s().mode).toBe(MODE_2D_PAN);
    expect(Object.values(layer().lines)).toHaveLength(1);
    expect(s().drawingSupport).toEqual({});
  });
});

// ===========================================================================
// Toggles, errors, warnings
// ===========================================================================
describe('toggles and notifications', () => {
  it('toggleSnap flips individual snap flags', () => {
    expect(s().snapMask.SNAP_GRID).toBe(false);
    s().toggleSnap('SNAP_GRID');
    expect(s().snapMask.SNAP_GRID).toBe(true);
    s().toggleSnap('SNAP_GRID');
    expect(s().snapMask.SNAP_GRID).toBe(false);

    expect(s().snapMask.SNAP_POINT).toBe(true);
    s().toggleSnap('SNAP_POINT');
    expect(s().snapMask.SNAP_POINT).toBe(false);
  });

  it('alterateState toggles the alterate flag', () => {
    expect(s().alterate).toBe(false);
    s().alterateState();
    expect(s().alterate).toBe(true);
    s().alterateState();
    expect(s().alterate).toBe(false);
  });

  it('throwError / throwWarning accumulate dated entries', () => {
    s().throwError('boom');
    s().throwWarning('careful');
    s().throwWarning('again');

    expect(s().errors).toHaveLength(1);
    expect(s().errors[0].message).toBe('boom');
    expect(s().errors[0].date).toBeInstanceOf(Date);
    expect(s().warnings.map((w) => w.message)).toEqual(['careful', 'again']);
  });

  it('catalog page navigation pushes and pops the path', () => {
    s().changeCatalogPage('furniture', 'root');
    expect(s().catalog.page).toBe('furniture');
    expect(s().catalog.path).toEqual(['root']);

    s().goBackToCatalogPage();
    expect(s().catalog.page).toBe('root');
    expect(s().catalog.path).toEqual([]);

    // With an empty path it falls back to root
    s().goBackToCatalogPage();
    expect(s().catalog.page).toBe('root');
  });
});
