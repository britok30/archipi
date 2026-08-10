import { describe, it, expect } from 'vitest';
import * as Three from 'three';
import { OBJExporter } from '@/lib/OBJExporter';

/** Parse an OBJ "v x y z" line into numbers. */
function parseV(line: string): [number, number, number] {
  const [, x, y, z] = line.split(/\s+/);
  return [parseFloat(x), parseFloat(y), parseFloat(z)];
}

function linesOfType(obj: string, prefix: string): string[] {
  return obj.split('\n').filter((l) => l.startsWith(prefix + ' '));
}

describe('OBJExporter', () => {
  it('exports world-space vertex coordinates through nested transforms', () => {
    // 2x2x2 box centered on the mesh origin
    const mesh = new Three.Mesh(
      new Three.BoxGeometry(2, 2, 2),
      new Three.MeshBasicMaterial()
    );
    mesh.name = 'box';
    mesh.position.set(1, 2, 3);

    const group = new Three.Group();
    group.position.set(10, 20, 30);
    group.add(mesh);

    const scene = new Three.Scene();
    scene.add(group);
    scene.updateMatrixWorld(true);

    const obj = new OBJExporter().parse(scene);

    expect(obj).toContain('o box\n');

    const vLines = linesOfType(obj, 'v');
    // BoxGeometry: 4 vertices per face * 6 faces
    expect(vLines).toHaveLength(24);

    // Every exported vertex is a world-space corner: (11,22,33) +/- 1 on each axis
    for (const line of vLines) {
      const [x, y, z] = parseV(line);
      expect(Math.abs(x - 11)).toBeCloseTo(1, 10);
      expect(Math.abs(y - 22)).toBeCloseTo(1, 10);
      expect(Math.abs(z - 33)).toBeCloseTo(1, 10);
    }

    // Not origin-collapsed: no local-space corner leaks through
    expect(obj).not.toContain('v 1 1 1\n');
    expect(obj).toContain('v 12 23 34\n'); // the (+1,+1,+1) corner

    // Normals and uvs sections exist with matching counts
    expect(linesOfType(obj, 'vn')).toHaveLength(24);
    expect(linesOfType(obj, 'vt')).toHaveLength(24);

    // 12 triangles, each face referencing v/vt/vn triplets
    const fLines = linesOfType(obj, 'f');
    expect(fLines).toHaveLength(12);
    for (const line of fLines) {
      expect(line).toMatch(/^f \d+\/\d+\/\d+ \d+\/\d+\/\d+ \d+\/\d+\/\d+$/);
    }
  });

  it('rotates normals by the world matrix', () => {
    const mesh = new Three.Mesh(new Three.BoxGeometry(2, 2, 2));
    mesh.name = 'rotated';
    mesh.rotation.z = Math.PI / 2; // +X normal becomes +Y

    const scene = new Three.Scene();
    scene.add(mesh);
    scene.updateMatrixWorld(true);

    const obj = new OBJExporter().parse(scene);
    const vnLines = linesOfType(obj, 'vn').map(parseV);

    const pointing = (dir: [number, number, number]) =>
      vnLines.filter(
        ([x, y, z]) =>
          Math.abs(x - dir[0]) < 1e-6 &&
          Math.abs(y - dir[1]) < 1e-6 &&
          Math.abs(z - dir[2]) < 1e-6
      ).length;

    // A 90deg z rotation permutes the axis-aligned normals: +X -> +Y,
    // -Y -> +X, etc. Every normal must still be exactly axis-aligned
    // (i.e. actually transformed, not left as raw local values with drift)
    expect(pointing([0, 1, 0])).toBe(4); // former +X face
    expect(pointing([1, 0, 0])).toBe(4); // former -Y face
    expect(pointing([0, -1, 0])).toBe(4);
    expect(pointing([-1, 0, 0])).toBe(4);
    // z-axis faces are unaffected by a z rotation
    expect(pointing([0, 0, 1])).toBe(4);
    expect(pointing([0, 0, -1])).toBe(4);
  });

  it('offsets face indices across multiple meshes', () => {
    const scene = new Three.Scene();
    const a = new Three.Mesh(new Three.BoxGeometry(1, 1, 1));
    a.name = 'a';
    const b = new Three.Mesh(new Three.BoxGeometry(1, 1, 1));
    b.name = 'b';
    b.position.set(5, 0, 0);
    scene.add(a, b);
    scene.updateMatrixWorld(true);

    const obj = new OBJExporter().parse(scene);

    expect(linesOfType(obj, 'v')).toHaveLength(48);
    const fLines = linesOfType(obj, 'f');
    expect(fLines).toHaveLength(24);

    // Faces of the second mesh must reference vertices 25..48, never 1..24
    const secondMeshFaces = fLines.slice(12);
    const indices = secondMeshFaces.flatMap((line) =>
      line
        .split(' ')
        .slice(1)
        .map((tok) => parseInt(tok.split('/')[0], 10))
    );
    expect(Math.min(...indices)).toBe(25);
    expect(Math.max(...indices)).toBe(48);
  });

  it('exports Line objects with an l record in world space', () => {
    const geometry = new Three.BufferGeometry().setFromPoints([
      new Three.Vector3(0, 0, 0),
      new Three.Vector3(1, 0, 0),
      new Three.Vector3(1, 1, 0),
    ]);
    const line = new Three.Line(geometry, new Three.LineBasicMaterial());
    line.name = 'polyline';
    line.position.set(100, 0, 0);

    const scene = new Three.Scene();
    scene.add(line);
    scene.updateMatrixWorld(true);

    const obj = new OBJExporter().parse(scene);

    expect(obj).toContain('o polyline\n');
    expect(obj).toContain('v 100 0 0\n');
    expect(obj).toContain('v 101 0 0\n');
    expect(obj).toContain('v 101 1 0\n');
    expect(obj).toContain('l 1 2 3 \n');
  });
});
