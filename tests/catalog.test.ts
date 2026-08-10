import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import * as catalogItems from "@/app/objCatalog/items";
import { glbBBox } from "./glb-bbox";

const ROOT = process.cwd();
const ITEMS_DIR = path.join(ROOT, "app", "objCatalog", "items");
const HOLES_DIR = path.join(ROOT, "app", "objCatalog", "holes");
const PUBLIC_DIR = path.join(ROOT, "public");

interface CatalogItem {
  name: string;
  prototype: string;
  info: { title?: string; image?: string };
  properties: Record<string, any>;
  render2D: (element: any, layer: any, scene: any) => any;
}

const items = Object.values(catalogItems) as CatalogItem[];

/** Directories under app/objCatalog/items that contain a planner-element. */
const itemDirs = fs
  .readdirSync(ITEMS_DIR)
  .filter((d) => fs.existsSync(path.join(ITEMS_DIR, d, "planner-element.tsx")));

/** Source text of an item's planner-element, keyed by dir name. */
const sourceByDir = new Map<string, string>(
  itemDirs.map((d) => [
    d,
    fs.readFileSync(path.join(ITEMS_DIR, d, "planner-element.tsx"), "utf8"),
  ])
);

/** All '/models/*.glb' urls referenced in an item's source. */
function modelUrls(dir: string): string[] {
  const src = sourceByDir.get(dir)!;
  return [...src.matchAll(/"(\/models\/[^"]+\.glb)"/g)].map((m) => m[1]);
}

/** Default length (cm) of a length-measure property, or undefined. */
function defaultLength(item: CatalogItem, key: string): number | undefined {
  return item.properties?.[key]?.defaultValue?.length;
}

/** Build element.properties filled with every default value. */
function defaultProperties(item: CatalogItem): Record<string, any> {
  const props: Record<string, any> = {};
  for (const [key, def] of Object.entries(item.properties ?? {})) {
    props[key] = structuredClone((def as any).defaultValue);
  }
  return props;
}

const SCENE = { unit: "cm", width: 3000, height: 2000 };
const LAYER_STUB = {};

/** Depth-first collect of props for every element of a given tag name. */
function collectByTag(node: any, tag: string, out: any[] = []): any[] {
  if (!node) return out;
  if (Array.isArray(node)) {
    for (const child of node) collectByTag(child, tag, out);
    return out;
  }
  if (typeof node !== "object") return out;
  if (node.type === tag) out.push(node.props);
  collectByTag(node.props?.children, tag, out);
  return out;
}

const isGlbItem = (dir: string) => modelUrls(dir).length > 0;

describe("catalog registry integrity", () => {
  it("every item dir exports a planner-element whose name matches the dir", () => {
    const names = new Set(items.map((i) => i.name));
    const missing = itemDirs.filter((d) => !names.has(d));
    expect(missing).toEqual([]);
  });

  it("index.ts exports exactly the item dirs (no extras, no dangling)", () => {
    const indexSrc = fs.readFileSync(path.join(ITEMS_DIR, "index.ts"), "utf8");
    const exported = [...indexSrc.matchAll(/from\s*"\.\/([^/]+)\/planner-element"/g)].map(
      (m) => m[1]
    );
    expect([...exported].sort()).toEqual([...itemDirs].sort());
    expect(items).toHaveLength(itemDirs.length);
  });

  it("item names are unique", () => {
    const seen = new Set<string>();
    const dupes = items.map((i) => i.name).filter((n) => (seen.has(n) ? true : (seen.add(n), false)));
    expect(dupes).toEqual([]);
  });

  it("item thumbnails are unique across items", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const item of items) {
      const img = item.info?.image ?? "";
      if (seen.has(img)) dupes.push(`${item.name} shares ${img} with ${seen.get(img)}`);
      else seen.set(img, item.name);
    }
    expect(dupes).toEqual([]);
  });

  it("every item has a non-empty title and prototype 'items'", () => {
    const bad = items
      .filter((i) => !i.info?.title || i.prototype !== "items")
      .map((i) => i.name);
    expect(bad).toEqual([]);
  });
});

describe("catalog asset existence", () => {
  it("every info.image exists under public/", () => {
    const missing = items
      .filter((i) => !i.info?.image || !fs.existsSync(path.join(PUBLIC_DIR, i.info.image)))
      .map((i) => `${i.name}: ${i.info?.image}`);
    expect(missing).toEqual([]);
  });

  it("every referenced /models/*.glb exists under public/models", () => {
    const missing: string[] = [];
    for (const dir of itemDirs) {
      for (const url of modelUrls(dir)) {
        if (!fs.existsSync(path.join(PUBLIC_DIR, url))) missing.push(`${dir}: ${url}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("no raw convert(element.properties...) reads remain in any item", () => {
    const offenders = itemDirs.filter((d) =>
      /convert\(element\.properties/.test(sourceByDir.get(d)!)
    );
    expect(offenders).toEqual([]);
  });
});

describe("hole catalog asset existence", () => {
  // Source-based (not imported): some hole planner-elements require() image
  // assets, which vitest cannot import directly.
  const holeDirs = fs
    .readdirSync(HOLES_DIR)
    .filter((d) => fs.existsSync(path.join(HOLES_DIR, d, "planner-element.tsx")));
  const holeSourceByDir = new Map<string, string>(
    holeDirs.map((d) => [
      d,
      fs.readFileSync(path.join(HOLES_DIR, d, "planner-element.tsx"), "utf8"),
    ])
  );

  it("every hole info.image (public path) exists under public/", () => {
    const missing: string[] = [];
    for (const dir of holeDirs) {
      const src = holeSourceByDir.get(dir)!;
      for (const m of src.matchAll(/image:\s*"(\/[^"]+)"/g)) {
        if (!fs.existsSync(path.join(PUBLIC_DIR, m[1]))) missing.push(`${dir}: ${m[1]}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("every model/obj/mtl asset referenced by holes exists under public/", () => {
    const missing: string[] = [];
    for (const dir of holeDirs) {
      const src = holeSourceByDir.get(dir)!;
      const urls = [
        ...src.matchAll(/"(\/(?:models|obj|mtl)\/[^"]+\.(?:glb|obj|mtl))"/g),
      ].map((m) => m[1]);
      for (const url of urls) {
        if (!fs.existsSync(path.join(PUBLIC_DIR, url))) missing.push(`${dir}: ${url}`);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe("render2D robustness", () => {
  it("render2D with full default properties does not throw and rect matches width/depth", () => {
    const failures: string[] = [];
    for (const item of items) {
      const element = {
        type: item.name,
        rotation: 0,
        selected: false,
        properties: defaultProperties(item),
      };
      let rendered: any;
      try {
        rendered = item.render2D(element, LAYER_STUB, SCENE);
      } catch (err) {
        failures.push(`${item.name} threw: ${err}`);
        continue;
      }
      const width = defaultLength(item, "width");
      const depth = defaultLength(item, "depth");
      if (width !== undefined && depth !== undefined) {
        const rects = collectByTag(rendered, "rect");
        if (rects.length > 0) {
          const match = rects.some(
            (r) => Number(r.width) === width && Number(r.height) === depth
          );
          if (!match) {
            failures.push(
              `${item.name}: no rect of ${width}x${depth}, got ${rects
                .map((r) => `${r.width}x${r.height}`)
                .join(", ")}`
            );
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("render2D survives a legacy element with empty properties", () => {
    const failures: string[] = [];
    for (const item of items) {
      const legacy = { type: item.name, rotation: 0, selected: false, properties: {} };
      try {
        item.render2D(legacy, LAYER_STUB, SCENE);
      } catch (err) {
        failures.push(`${item.name} threw: ${err}`);
      }
    }
    expect(failures).toEqual([]);
  });
});

describe("dimension sanity", () => {
  it("GLB item defaults are physically plausible (cm)", () => {
    const failures: string[] = [];
    for (const item of items) {
      if (!isGlbItem(item.name)) continue;
      const width = defaultLength(item, "width");
      const depth = defaultLength(item, "depth");
      const height = defaultLength(item, "height");
      const altitude = defaultLength(item, "altitude");
      if (width === undefined || depth === undefined || height === undefined) {
        failures.push(`${item.name}: missing width/depth/height defaults`);
        continue;
      }
      if (width < 5 || width > 500) failures.push(`${item.name}: width ${width}`);
      if (depth < 5 || depth > 500) failures.push(`${item.name}: depth ${depth}`);
      // Flat/low items (rugs, keyboards) may drop below 5, but never below 1.
      if (height < 1 || height > 500) failures.push(`${item.name}: height ${height}`);
      if (altitude === undefined || altitude < 0)
        failures.push(`${item.name}: altitude ${altitude}`);
    }
    expect(failures).toEqual([]);
  });
});

describe("GLB native proportions vs defaults (stairs-class axis bug)", () => {
  it("native X:Z aspect (after any rotation wrapper) agrees with width:depth within 2.5x", () => {
    const failures: string[] = [];
    for (const item of items) {
      const dir = item.name;
      const urls = modelUrls(dir);
      if (urls.length === 0) continue;
      const width = defaultLength(item, "width");
      const depth = defaultLength(item, "depth");
      if (!width || !depth) continue;

      const src = sourceByDir.get(dir)!;
      const quarterTurn = /\.rotation\.y\s*=\s*-?\s*Math\.PI\s*\/\s*2/.test(src);

      const bb = glbBBox(path.join(PUBLIC_DIR, urls[0]));
      let nx = bb.x;
      let nz = bb.z;
      if (quarterTurn) [nx, nz] = [nz, nx];
      if (nx < 1e-6 || nz < 1e-6) continue;

      const nativeRatio = nx / nz;
      const itemRatio = width / depth;
      const factor =
        nativeRatio > itemRatio ? nativeRatio / itemRatio : itemRatio / nativeRatio;
      if (factor > 2.5) {
        failures.push(
          `${dir}: native X:Z ${nativeRatio.toFixed(2)} vs default ${itemRatio.toFixed(
            2
          )} (off by ${factor.toFixed(2)}x, bbox ${bb.x.toFixed(2)}x${bb.y.toFixed(
            2
          )}x${bb.z.toFixed(2)}, defaults ${width}x${depth})`
        );
      }
    }
    expect(failures).toEqual([]);
  });
});

describe("thumbnail-model pairing", () => {
  it("no thumbnail is shared between items referencing different models", () => {
    const imageToModels = new Map<string, { item: string; models: string }>();
    const clashes: string[] = [];
    for (const item of items) {
      const models = modelUrls(item.name).join(",");
      if (!models) continue;
      const img = item.info?.image ?? "";
      const prev = imageToModels.get(img);
      if (prev && prev.models !== models) {
        clashes.push(`${img} used by ${prev.item} (${prev.models}) and ${item.name} (${models})`);
      } else if (!prev) {
        imageToModels.set(img, { item: item.name, models });
      }
    }
    expect(clashes).toEqual([]);
  });
});
