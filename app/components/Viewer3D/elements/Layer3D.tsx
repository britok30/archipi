"use client";

import React from "react";
import LineElement3D from "./LineElement3D";
import HoleElement3D from "./HoleElement3D";
import AreaElement3D from "./AreaElement3D";
import ItemElement3D from "./ItemElement3D";
import type { RuntimeCatalog, Scene, Layer } from "../../../store/types";

interface Layer3DActions {
  selectLine: (layerId: string, lineId: string) => void;
  selectHole: (layerId: string, holeId: string) => void;
  selectArea: (layerId: string, areaId: string) => void;
  selectItem: (layerId: string, itemId: string) => void;
}

interface Layer3DProps {
  layer: Layer;
  scene: Scene;
  catalog: RuntimeCatalog;
  actions: Layer3DActions;
}

const Layer3D: React.FC<Layer3DProps> = ({ layer, scene, catalog, actions }) => {
  // Collect all holes from all lines
  const holes: { holeId: string }[] = [];
  Object.values(layer.lines).forEach((line) => {
    line.holes.forEach((holeId) => {
      holes.push({ holeId });
    });
  });

  return (
    <group visible={layer.visible}>
      {Object.values(layer.lines).map((line) => (
        <LineElement3D
          key={line.id}
          line={line}
          layer={layer}
          scene={scene}
          catalog={catalog}
          onSelect={() => actions.selectLine(layer.id, line.id)}
        />
      ))}
      {holes.map(({ holeId }) => {
        const hole = layer.holes[holeId];
        if (!hole) return null;
        return (
          <HoleElement3D
            key={hole.id}
            hole={hole}
            layer={layer}
            scene={scene}
            catalog={catalog}
            onSelect={() => actions.selectHole(layer.id, hole.id)}
          />
        );
      })}
      {Object.values(layer.areas).map((area) => (
        <AreaElement3D
          key={area.id}
          area={area}
          layer={layer}
          scene={scene}
          catalog={catalog}
          onSelect={() => actions.selectArea(layer.id, area.id)}
        />
      ))}
      {Object.values(layer.items).map((item) => (
        <ItemElement3D
          key={item.id}
          item={item}
          layer={layer}
          scene={scene}
          catalog={catalog}
          onSelect={() => actions.selectItem(layer.id, item.id)}
        />
      ))}
    </group>
  );
};

export default Layer3D;
