"use client";

import React from "react";
import { Layer } from "./Layer";
import { Grids } from "./grids/Grids";
import type { Scene as SceneType, RuntimeCatalog } from "../../store/types";

interface SceneProps {
  scene: SceneType;
  catalog: RuntimeCatalog | null;
}

export const Scene: React.FC<SceneProps> = ({ scene, catalog }) => {
  const { layers, selectedLayer: selectedLayerId } = scene;

  const selectedLayer = selectedLayerId ? layers[selectedLayerId] : null;

  return (
    <g>
      <Grids scene={scene} />

      <g className="pointer-events-none">
        {Object.entries(layers)
          .filter(
            ([layerId, layer]) =>
              layerId !== selectedLayerId && layer.visible
          )
          .map(([layerId, layer]) => (
            <Layer
              key={layerId}
              layer={layer}
              scene={scene}
              catalog={catalog}
            />
          ))}
      </g>

      {selectedLayer && (
        <Layer
          key={selectedLayer.id}
          layer={selectedLayer}
          scene={scene}
          catalog={catalog}
        />
      )}
    </g>
  );
};

export default Scene;
