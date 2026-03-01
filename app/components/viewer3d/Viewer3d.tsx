"use client";

import React, { useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SceneLighting from "./SceneLighting";
import Grid3D from "./Grid3D";
import LODUpdater from "./LODUpdater";
import Layer3D from "./elements/Layer3D";
import { usePlannerStore } from "../../store";
import { useCatalogContext } from "../../context/ReactPlannerContext";

type Scene3DViewerProps = {
  width: number;
  height: number;
};

const Viewer3D: React.FC<Scene3DViewerProps> = ({ width, height }) => {
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const { catalog } = useCatalogContext();
  const scene = usePlannerStore((state) => state.scene);
  const unselectAll = usePlannerStore((state) => state.unselectAll);

  const actions = useMemo(
    () => ({
      selectLine: usePlannerStore.getState().selectLine,
      selectHole: usePlannerStore.getState().selectHole,
      selectItem: usePlannerStore.getState().selectItem,
      selectArea: usePlannerStore.getState().selectArea,
    }),
    []
  );

  if (!catalog) return null;

  // Scene center in 3D coords: elements span x=[0..width], z=[0..-height]
  const centerX = scene.width / 2;
  const centerZ = -scene.height / 2;

  // Camera: offset from center, elevated for a good viewing angle
  const cameraDistance = Math.max(scene.width, scene.height) * 1.5;
  const cameraPosition: [number, number, number] = [
    centerX - cameraDistance * 0.3,
    cameraDistance,
    centerZ + cameraDistance * 0.3,
  ];
  const orbitTarget: [number, number, number] = [centerX, 0, centerZ];

  // Visible layers: selected layer + any layer with visible=true
  const visibleLayers = Object.values(scene.layers).filter(
    (layer) => layer.id === scene.selectedLayer || layer.visible
  );

  return (
    <div className="saturate-[1.6] contrast-125" ref={canvasWrapper}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          logarithmicDepthBuffer: true,
        }}
        style={{ width, height }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 1000000,
          position: cameraPosition,
          up: [0, 1, 0],
        }}
        onPointerMissed={() => unselectAll()}
      >
        <SceneLighting />
        <Grid3D scene={scene} />
        {visibleLayers.map((layer) => (
          <Layer3D
            key={layer.id}
            layer={layer}
            scene={scene}
            catalog={catalog}
            actions={actions}
          />
        ))}
        <LODUpdater />
        <OrbitControls
          target={orbitTarget}
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={1000000}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

export default Viewer3D;
