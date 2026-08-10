import fs from "node:fs";

/**
 * Minimal pure-node GLB bounding-box reader (no three.js). Reads the JSON
 * chunk of a .glb, walks the default scene's node hierarchy applying each
 * node's matrix/TRS transform, and unions every mesh primitive's POSITION
 * accessor min/max corners into a world-space bounding box.
 */

type Mat4 = number[]; // column-major, length 16

function matIdentity(): Mat4 {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

function matMul(a: Mat4, b: Mat4): Mat4 {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}

function matFromNode(node: any): Mat4 {
  if (node.matrix) return node.matrix;
  const [tx, ty, tz] = node.translation || [0, 0, 0];
  const [qx, qy, qz, qw] = node.rotation || [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale || [1, 1, 1];
  const x2 = qx + qx, y2 = qy + qy, z2 = qz + qz;
  const xx = qx * x2, xy = qx * y2, xz = qx * z2;
  const yy = qy * y2, yz = qy * z2, zz = qz * z2;
  const wx = qw * x2, wy = qw * y2, wz = qw * z2;
  return [
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    tx, ty, tz, 1,
  ];
}

function xform(m: Mat4, v: [number, number, number]): [number, number, number] {
  return [
    m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
    m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
    m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14],
  ];
}

export function parseGlbJson(file: string): any {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error(`not a GLB file: ${file}`);
  const jsonLen = buf.readUInt32LE(12);
  return JSON.parse(buf.toString("utf8", 20, 20 + jsonLen));
}

export function glbBBox(file: string): { x: number; y: number; z: number } {
  const g = parseGlbJson(file);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  const visit = (nodeIdx: number, parent: Mat4): void => {
    const node = g.nodes[nodeIdx];
    const m = matMul(parent, matFromNode(node));
    if (node.mesh !== undefined) {
      for (const prim of g.meshes[node.mesh].primitives || []) {
        const acc = g.accessors?.[prim.attributes?.POSITION];
        if (!acc?.min || !acc?.max) continue;
        for (const cx of [acc.min[0], acc.max[0]])
          for (const cy of [acc.min[1], acc.max[1]])
            for (const cz of [acc.min[2], acc.max[2]]) {
              const p = xform(m, [cx, cy, cz]);
              for (let i = 0; i < 3; i++) {
                if (p[i] < min[i]) min[i] = p[i];
                if (p[i] > max[i]) max[i] = p[i];
              }
            }
      }
    }
    for (const c of node.children || []) visit(c, m);
  };

  const sceneIdx = g.scene ?? 0;
  const roots: number[] = g.scenes?.[sceneIdx]?.nodes ?? g.nodes.map((_: any, i: number) => i);
  for (const r of roots) visit(r, matIdentity());

  return { x: max[0] - min[0], y: max[1] - min[1], z: max[2] - min[2] };
}
