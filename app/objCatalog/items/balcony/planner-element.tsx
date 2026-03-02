"use client";

import * as THREE from "three";
import { loadTexture } from "../../utils/load-texture";

// Constants
const PI_2 = Math.PI / 2;
const TEXTURE_PATHS = {
  painted: "/images/textures/painted.jpg",
  brick: "/images/textures/bricks.jpg",
} as const;

const SCALE = 100;

// Types
type TextureKey = keyof typeof TEXTURE_PATHS;

interface MaterialProps {
  width: number;
  height: number;
  textureKey: TextureKey;
  repeatX?: number;
  repeatY?: number;
}

interface BalconyProps {
  width: number;
  height: number;
  depth: number;
}

interface Element2DProps {
  properties: Record<string, any>;
  selected: boolean;
  rotation: number;
  name: string;
}

interface Element3DProps extends Element2DProps {
  layer: any;
  scene: THREE.Scene;
}

// Material factory
const createMaterial = ({
  width,
  height,
  textureKey,
  repeatX,
  repeatY,
}: MaterialProps): THREE.Material => {
  const texture = loadTexture(TEXTURE_PATHS[textureKey]);

  if (texture && (repeatX || repeatY)) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(
      repeatX ?? ~~(width / SCALE),
      repeatY ?? ~~(height / SCALE)
    );
  }

  return new THREE.MeshLambertMaterial({ ...(texture ? { map: texture } : {}) });
};

// Balcony mesh factory
const createBalconyMesh = ({
  width,
  height,
  depth,
}: BalconyProps): THREE.Object3D => {
  const balcony = new THREE.Object3D();

  const paintedMaterial = createMaterial({ width, height, textureKey: "painted" });
  const brickMaterial = createMaterial({ width, height, textureKey: "brick" });
  const brickRepeatMaterial = createMaterial({
    width,
    height,
    textureKey: "brick",
    repeatX: ~~(width / SCALE),
    repeatY: ~~(height / SCALE),
  });

  // Geometries
  const baseGeometry = new THREE.BoxGeometry(width, height / 10, depth);
  const sideGeometry = new THREE.BoxGeometry(depth, height / 10, depth);
  const topGeometry = new THREE.BoxGeometry(
    width + height / 5,
    height / 5,
    depth / 10
  );
  const topSideGeometry = new THREE.BoxGeometry(depth, height / 5, depth / 10);

  // Base
  const base = new THREE.Mesh(baseGeometry, paintedMaterial);

  // Front
  const front = new THREE.Mesh(baseGeometry.clone(), brickRepeatMaterial);
  front.position.set(0, height / 2, depth / 2);
  front.rotation.x = PI_2;

  // Sides
  const rightSide = new THREE.Mesh(sideGeometry, brickMaterial);
  rightSide.position.set(width / 2, height / 2, 0);
  rightSide.rotation.set(PI_2, 0, PI_2);

  const leftSide = rightSide.clone();
  leftSide.position.set(-width / 2, height / 2, 0);

  // Top pieces
  const topFront = new THREE.Mesh(topGeometry, paintedMaterial);
  topFront.position.set(0, height + height / 32, depth / 2);
  topFront.rotation.x = PI_2;

  const topRight = new THREE.Mesh(topSideGeometry, paintedMaterial);
  topRight.position.set(width / 2, height + height / 32, 0);
  topRight.rotation.set(PI_2, 0, PI_2);

  const topLeft = topRight.clone();
  topLeft.position.set(-width / 2, height + height / 32, 0);

  balcony.add(base, front, rightSide, leftSide, topFront, topRight, topLeft);

  return balcony;
};

// Main element export
const BalconyElement = {
  name: "balcony",
  prototype: "items",

  info: {
    tag: ["furnishings", "metal"],
    title: "balcony",
    description: "balcony",
    image: "/images/balcony.png",
  },

  properties: {
    width: {
      label: "width",
      type: "length-measure",
      defaultValue: {
        length: 500,
        unit: "cm",
      },
    },
    depth: {
      label: "depth",
      type: "length-measure",
      defaultValue: {
        length: 100,
        unit: "cm",
      },
    },
    height: {
      label: "height",
      type: "length-measure",
      defaultValue: {
        length: 100,
        unit: "cm",
      },
    },
    altitude: {
      label: "altitude",
      type: "length-measure",
      defaultValue: {
        length: 0,
        unit: "cm",
      },
    },
    patternColor: {
      label: "2D color",
      type: "color",
      defaultValue: "#f5f4f4",
    },
  },

  render2D: (element: Element2DProps) => {
    const width = element.properties?.width?.length;
    const depth = element.properties?.depth?.length;
    const fillColor = element.selected
      ? "#99c3fb"
      : element.properties?.patternColor;
    const angle = element.rotation + 90;

    const textRotation = Math.sin((angle * Math.PI) / 180) < 0 ? 180 : 0;

    return (
      <g transform={`translate(${-width / 2},${-depth / 2})`}>
        <rect
          x="0"
          y="0"
          width={width}
          height={depth}
          style={{
            stroke: element.selected ? "#0096fd" : "#000",
            strokeWidth: "2px",
            fill: fillColor,
          }}
        />
        <text
          x={width / 2}
          y={depth / 2}
          transform={`scale(1,-1) rotate(${textRotation})`}
          style={{
            textAnchor: "middle" as const,
            fontSize: "11px",
            dominantBaseline: "middle",
          }}
        >
          {element.name}
        </text>
      </g>
    );
  },

  render3D: (element: Element3DProps) => {
    const width = element.properties?.width?.length;
    const depth = element.properties?.depth?.length;
    const height = element.properties?.height?.length;
    const altitude = element.properties?.altitude?.length;

    const balcony = createBalconyMesh({ width, height, depth });

    if (element.selected) {
      const bbox = new THREE.BoxHelper(balcony, 0x99c3fb);
      bbox.material.linewidth = 5;
      bbox.renderOrder = 1000;
      bbox.material.depthTest = false;
      balcony.add(bbox);
    }

    balcony.position.y += height / 10 + altitude;
    return Promise.resolve(balcony);
  },
};

export default BalconyElement;
