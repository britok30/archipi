"use client";

import React, { useContext } from "react";
import Panel from "./Panel";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { Seq, Map } from "immutable";
import ElementEditor from "./ElementEditor";

const PanelElementEditor: React.FC<{ state: any }> = ({ state }) => {
  const { translator } = useContext(ReactPlannerContext);

  const { scene, mode } = state;

  const componentRenderer = (element: any, layer: any) => (
    <Panel
      key={element.id}
      name={translator.t("Properties: [{0}] {1}", element.type, element.id)}
      opened={true}
    >
      <div style={{ padding: "5px 15px" }}>
        <ElementEditor element={element} layer={layer} state={state} />
      </div>
    </Panel>
  );

  const layerRenderer = (layer: any) =>
    Seq()
      .concat(
        layer.get("lines") || Map(),
        layer.get("holes") || Map(),
        layer.get("areas") || Map(),
        layer.get("items") || Map()
      )
      .filter((element: any) => element.get("selected"))
      .map((element: any) => componentRenderer(element, layer))
      .valueSeq();

  return <div>{scene.get("layers").valueSeq().map(layerRenderer)}</div>;
};

export default PanelElementEditor;
