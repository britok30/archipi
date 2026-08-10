// NOTE: lib/catalog/factories/wall-factory-3d.ts is deliberately NOT covered
// here: lib/catalog/** is being reworked concurrently. These tests cover the
// safe pure logic in lib/viewer3d (grid-creator + scene-creator) using a
// stubbed catalog, without importing any lib/catalog element definitions.
import { describe, it, expect, vi } from 'vitest';
import * as Three from 'three';
import createGrid from '@/lib/viewer3d/grid-creator';
import { parseData } from '@/lib/viewer3d/scene-creator';
import { makeDefaultScene } from '@/app/store/types';
import type { RuntimeCatalog, Scene } from '@/app/store/types';

const LAYER = 'layer-1';

/** A small scene so grid generation stays cheap. */
function smallScene(): Scene {
  const scene = makeDefaultScene();
  scene.width = 100;
  scene.height = 100;
  return scene;
}

/** Catalog stub whose every element renders a simple 10cm cube. */
function stubCatalog(): RuntimeCatalog {
  return {
    unit: 'cm',
    getElement: () => ({
      name: 'stub',
      prototype: 'items',
      info: { tag: [], description: '', image: '' },
      properties: {},
      render3D: async () =>
        new Three.Mesh(new Three.BoxGeometry(10, 10, 10), new Three.MeshBasicMaterial()),
    }),
    getCategory: () => ({ name: 'root', label: 'root', elements: [], categories: [] }),
    hasElement: () => true,
    hasCategory: () => false,
    getPropertyType: () => {
      throw new Error('not needed');
    },
  } as unknown as RuntimeCatalog;
}

const noopActions = {
  selectHole: vi.fn(),
  selectLine: vi.fn(),
  selectArea: vi.fn(),
  selectItem: vi.fn(),
};

describe('createGrid', () => {
  it('builds one streak per grid definition with the expected line count', () => {
    const grid = createGrid(smallScene());

    expect(grid.name).toBe('grid');
    expect(grid.position.y).toBe(-1);
    // Default scene declares one horizontal and one vertical streak
    expect(grid.children).toHaveLength(2);

    for (const streak of grid.children) {
      expect(streak.name).toBe('streak');
      // step=20 over extent 100 -> lines at 0,20,40,60,80,100
      const lineSegments = streak.children.filter(
        (c) => (c as Three.LineSegments).isLineSegments
      );
      expect(lineSegments).toHaveLength(6);
      // Measure labels every 5th line -> at 0 and 100
      const labels = streak.children.filter((c) => (c as Three.Mesh).isMesh);
      expect(labels).toHaveLength(2);
    }
  });

  it('spans the full scene width', () => {
    const grid = createGrid(smallScene());
    const box = new Three.Box3().setFromObject(grid);
    // Streak lines run from x=0 to x=width (labels sit slightly outside)
    expect(box.max.x).toBeGreaterThanOrEqual(100);
    expect(box.min.z).toBeLessThanOrEqual(-100); // z is -y in scene space
  });
});

describe('parseData', () => {
  function makeItemScene(): Scene {
    const scene = smallScene();
    scene.layers[LAYER].items['item-1'] = {
      id: 'item-1',
      type: 'sofa',
      prototype: 'items',
      name: 'sofa_1',
      x: 30,
      y: 40,
      rotation: 90,
      misc: {},
      selected: false,
      properties: {},
      visible: true,
    };
    return scene;
  }

  it('places item pivots at (x, altitude, -y) with degree->radian rotation', async () => {
    const scene = makeItemScene();
    scene.layers[LAYER].altitude = 55;

    const planData = await parseData(scene, noopActions, stubCatalog());

    const pivot = planData.sceneGraph.layers[LAYER].items['item-1'];
    expect(pivot).toBeDefined();
    expect(pivot.position.x).toBe(30);
    expect(pivot.position.y).toBe(55);
    expect(pivot.position.z).toBe(-40);
    expect(pivot.rotation.y).toBeCloseTo(Math.PI / 2, 10);

    expect(planData.sceneGraph.width).toBe(100);
    expect(planData.sceneGraph.height).toBe(100);
    expect(planData.plan.name).toBe('plan');
  });

  it('wires mesh interaction to the selectItem action', async () => {
    const selectItem = vi.fn();
    const planData = await parseData(
      makeItemScene(),
      { ...noopActions, selectItem },
      stubCatalog()
    );

    const pivot = planData.sceneGraph.layers[LAYER].items['item-1'];
    let interact: (() => void) | undefined;
    pivot.traverse((child) => {
      if ((child as Three.Mesh).isMesh) {
        interact = (child as unknown as { interact: () => void }).interact;
      }
    });

    expect(interact).toBeTypeOf('function');
    interact!();
    expect(selectItem).toHaveBeenCalledWith(LAYER, 'item-1');
  });

  it('skips invisible layers that are not selected', async () => {
    const scene = makeItemScene();
    scene.layers['layer-2'] = {
      ...JSON.parse(JSON.stringify(scene.layers[LAYER])),
      id: 'layer-2',
      visible: false,
    };

    const planData = await parseData(scene, noopActions, stubCatalog());

    expect(planData.sceneGraph.layers[LAYER]).toBeDefined();
    expect(planData.sceneGraph.layers['layer-2']).toBeUndefined();
  });

  it('caps mesh opacity at the layer opacity for unselected elements', async () => {
    const scene = makeItemScene();
    scene.layers[LAYER].opacity = 0.3;

    const planData = await parseData(scene, noopActions, stubCatalog());

    const pivot = planData.sceneGraph.layers[LAYER].items['item-1'];
    let material: Three.Material | undefined;
    pivot.traverse((child) => {
      const mesh = child as Three.Mesh;
      if (mesh.isMesh) material = mesh.material as Three.Material;
    });

    expect(material).toBeDefined();
    expect(material!.transparent).toBe(true);
    expect(material!.opacity).toBe(0.3);
  });
});
