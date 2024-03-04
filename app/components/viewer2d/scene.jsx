"use client";

import React, { memo } from "react";
import PropTypes from "prop-types";
import { Layer } from "./layer";
import { Grids } from "./grids/grids";

const shouldUpdate = (prevProps, nextProps) => {
  return prevProps.scene.hashCode() === nextProps.scene.hashCode();
};

export const Scene = memo(({ scene, catalog }) => {
  const { layers } = scene;
  const selectedLayer = layers.get(scene.selectedLayer);

  return (
    <g>
      <Grids scene={scene} />

      <g style={{ pointerEvents: "none" }}>
        {layers
          .entrySeq()
          .filter(
            ([layerID, layer]) =>
              layerID !== scene.selectedLayer && layer.visible
          )
          .map(([layerID, layer]) => (
            <Layer
              key={layerID}
              layer={layer}
              scene={scene}
              catalog={catalog}
            />
          ))}
      </g>

      <Layer
        key={selectedLayer.id}
        layer={selectedLayer}
        scene={scene}
        catalog={catalog}
      />
    </g>
  );
}, shouldUpdate);

// Explicitly setting the display name for the component
Scene.displayName = "Scene";

Scene.propTypes = {
  scene: PropTypes.object.isRequired,
  catalog: PropTypes.object.isRequired,
};
