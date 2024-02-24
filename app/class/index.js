import { List } from "immutable";
import { Map, fromJS } from "immutable";
import {
  GraphInnerCycles,
  GeometryUtils,
  ObjectUtils,
  IDBroker,
  NameGenerator,
  history,
  SnapUtils,
  SnapSceneUtils,
} from "../utils/export";
import {
  MODE_IDLE,
  MODE_DRAWING_ITEM,
  MODE_DRAGGING_ITEM,
  MODE_ROTATING_ITEM,
  MODE_WAITING_DRAWING_LINE,
  MODE_DRAWING_LINE,
  MODE_DRAGGING_LINE,
  MODE_VIEWING_CATALOG,
  MODE_CONFIGURING_PROJECT,
  MODE_DRAWING_HOLE,
  MODE_DRAGGING_HOLE,
  MODE_DRAGGING_VERTEX,
} from "../utils/constants";
import { nearestSnap, addLineSegmentSnap } from "../utils/snap";
import {
  Layer as LayerModel,
  State,
  Catalog,
  Group as GroupModel,
  Vertex as VertexModel,
} from "../models/models";

class Layer {
  static create(state, name, altitude) {
    let layerID = IDBroker.acquireID();
    name = name || `layer ${layerID}`;
    altitude = altitude || 0;

    let layer = new LayerModel({ id: layerID, name, altitude });

    state = state.setIn(["scene", "selectedLayer"], layerID);
    state = state.setIn(["scene", "layers", layerID], layer);

    return { updatedState: state };
  }

  static select(state, layerID) {
    if (!state.get("alterate")) state = Project.unselectAll(state).updatedState;
    state = state.setIn(["scene", "selectedLayer"], layerID);

    return { updatedState: state };
  }

  static selectElement(state, layerID, elementPrototype, elementID) {
    state = state.setIn(
      ["scene", "layers", layerID, elementPrototype, elementID, "selected"],
      true
    );
    state = state.updateIn(
      ["scene", "layers", layerID, "selected", elementPrototype],
      (elems) => elems.push(elementID)
    );

    return { updatedState: state };
  }

  static unselect(state, layerID, elementPrototype, elementID) {
    state = state.setIn(
      ["scene", "layers", layerID, elementPrototype, elementID, "selected"],
      false
    );
    state = state.updateIn(
      ["scene", "layers", layerID, "selected", elementPrototype],
      (elems) => elems.filter((el) => el.id === elementID)
    );
    return { updatedState: state };
  }

  static unselectAll(state, layerID) {
    let { lines, holes, items, areas } = state.getIn([
      "scene",
      "layers",
      layerID,
    ]);

    if (lines)
      lines.forEach((line) => {
        state = Line.unselect(state, layerID, line.id).updatedState;
      });
    if (holes)
      holes.forEach((hole) => {
        state = Hole.unselect(state, layerID, hole.id).updatedState;
      });
    if (items)
      items.forEach((item) => {
        state = Item.unselect(state, layerID, item.id).updatedState;
      });
    if (areas)
      areas.forEach((area) => {
        state = Area.unselect(state, layerID, area.id).updatedState;
      });

    return { updatedState: state };
  }

  static setProperties(state, layerID, properties) {
    state = state.mergeIn(["scene", "layers", layerID], properties);
    state = state.updateIn(["scene", "layers"], (layers) =>
      layers.sort((a, b) =>
        a.altitude !== b.altitude ? a.altitude - b.altitude : a.order - b.order
      )
    );

    return { updatedState: state };
  }

  static remove(state, layerID) {
    state = state.removeIn(["scene", "layers", layerID]);

    state = state.setIn(
      ["scene", "selectedLayer"],
      state.scene.selectedLayer !== layerID
        ? state.scene.selectedLayer
        : state.scene.layers.first().id
    );

    return { updatedState: state };
  }

  static removeElement(state, layerID, elementPrototype, elementID) {
    state = state.deleteIn([
      "scene",
      "layers",
      layerID,
      elementPrototype,
      elementID,
    ]);

    return { updatedState: state };
  }

  static detectAndUpdateAreas(state, layerID) {
    let verticesArray = []; //array with vertices coords
    let linesArray; //array with edges

    let vertexID_to_verticesArrayIndex = {};
    let verticesArrayIndex_to_vertexID = {};

    state.getIn(["scene", "layers", layerID, "vertices"]).forEach((vertex) => {
      let verticesCount = verticesArray.push([vertex.x, vertex.y]);
      let latestVertexIndex = verticesCount - 1;
      vertexID_to_verticesArrayIndex[vertex.id] = latestVertexIndex;
      verticesArrayIndex_to_vertexID[latestVertexIndex] = vertex.id;
    });

    linesArray = state
      .getIn(["scene", "layers", layerID, "lines"])
      .map((line) =>
        line.vertices
          .map((vertexID) => vertexID_to_verticesArrayIndex[vertexID])
          .toArray()
      );

    let innerCyclesByVerticesArrayIndex = GraphInnerCycles.calculateInnerCycles(
      verticesArray,
      linesArray
    );

    let innerCyclesByVerticesID = new List(innerCyclesByVerticesArrayIndex).map(
      (cycle) =>
        new List(
          cycle.map(
            (vertexIndex) => verticesArrayIndex_to_vertexID[vertexIndex]
          )
        )
    );

    // All area vertices should be ordered in counterclockwise order
    innerCyclesByVerticesID = innerCyclesByVerticesID.map((area) =>
      GraphInnerCycles.isClockWiseOrder(
        area.map((vertexID) =>
          state.getIn(["scene", "layers", layerID, "vertices", vertexID])
        )
      )
        ? area.reverse()
        : area
    );

    let areaIDs = [];

    //remove areas
    state.getIn(["scene", "layers", layerID, "areas"]).forEach((area) => {
      let areaInUse = innerCyclesByVerticesID.some((vertices) =>
        ObjectUtils.sameSet(vertices, area.vertices)
      );
      if (!areaInUse) {
        state = Area.remove(state, layerID, area.id).updatedState;
      }
    });

    //add new areas
    innerCyclesByVerticesID.forEach((cycle, ind) => {
      let areaInUse = state
        .getIn(["scene", "layers", layerID, "areas"])
        .find((area) => ObjectUtils.sameSet(area.vertices, cycle));

      if (areaInUse) {
        areaIDs[ind] = areaInUse.id;
        state = state.setIn(
          ["scene", "layers", layerID, "areas", areaIDs[ind], "holes"],
          new List()
        );
      } else {
        let areaVerticesCoords = cycle.map((vertexID) =>
          state.getIn(["scene", "layers", layerID, "vertices", vertexID])
        );
        let resultAdd = Area.add(
          state,
          layerID,
          "area",
          areaVerticesCoords,
          state.catalog
        );

        areaIDs[ind] = resultAdd.area.id;
        state = resultAdd.updatedState;
      }
    });

    // Build a relationship between areas and their coordinates
    let verticesCoordsForArea = areaIDs.map((id) => {
      let vertices = state
        .getIn(["scene", "layers", layerID, "areas", id])
        .vertices.map((vertexID) => {
          let { x, y } = state.getIn([
            "scene",
            "layers",
            layerID,
            "vertices",
            vertexID,
          ]);
          return new List([x, y]);
        });
      return { id, vertices };
    });

    // Find all holes for an area
    let i, j;
    for (i = 0; i < verticesCoordsForArea.length; i++) {
      let holesList = new List(); // The holes for this area
      let areaVerticesList = verticesCoordsForArea[i].vertices
        .flatten()
        .toArray();
      for (j = 0; j < verticesCoordsForArea.length; j++) {
        if (i !== j) {
          let isHole = GeometryUtils.ContainsPoint(
            areaVerticesList,
            verticesCoordsForArea[j].vertices.get(0).get(0),
            verticesCoordsForArea[j].vertices.get(0).get(1)
          );
          if (isHole) {
            holesList = holesList.push(verticesCoordsForArea[j].id);
          }
        }
      }
      state = state.setIn(
        [
          "scene",
          "layers",
          layerID,
          "areas",
          verticesCoordsForArea[i].id,
          "holes",
        ],
        holesList
      );
    }

    // Remove holes which are already holes for other areas
    areaIDs.forEach((areaID) => {
      let doubleHoles = new Set();
      let areaHoles = state.getIn([
        "scene",
        "layers",
        layerID,
        "areas",
        areaID,
        "holes",
      ]);
      areaHoles.forEach((areaHoleID) => {
        let holesOfholes = state.getIn([
          "scene",
          "layers",
          layerID,
          "areas",
          areaHoleID,
          "holes",
        ]);
        holesOfholes.forEach((holeID) => {
          if (areaHoles.indexOf(holeID) !== -1) doubleHoles.add(holeID);
        });
      });
      doubleHoles.forEach((doubleHoleID) => {
        areaHoles = areaHoles.remove(areaHoles.indexOf(doubleHoleID));
      });
      state = state.setIn(
        ["scene", "layers", layerID, "areas", areaID, "holes"],
        areaHoles
      );
    });

    return { updatedState: state };
  }

  static removeZeroLengthLines(state, layerID) {
    let updatedState = state
      .getIn(["scene", "layers", layerID, "lines"])
      .reduce((newState, line) => {
        let v_id0 = line.getIn(["vertices", 0]);
        let v_id1 = line.getIn(["vertices", 1]);

        let v0 = newState.getIn([
          "scene",
          "layers",
          layerID,
          "vertices",
          v_id0,
        ]);
        let v1 = newState.getIn([
          "scene",
          "layers",
          layerID,
          "vertices",
          v_id1,
        ]);

        if (GeometryUtils.verticesDistance(v0, v1) === 0) {
          newState = Line.remove(newState, layerID, line.id).updatedState;
        }

        return newState;
      }, state);

    return { updatedState };
  }

  static mergeEqualsVertices(state, layerID, vertexID) {
    //1. find vertices to remove
    let vertex = state.getIn([
      "scene",
      "layers",
      layerID,
      "vertices",
      vertexID,
    ]);

    let doubleVertices = state
      .getIn(["scene", "layers", layerID, "vertices"])
      .filter((v) => {
        return (
          v.id !== vertexID && GeometryUtils.samePoints(vertex, v) // &&
          //!v.lines.contains( vertexID ) &&
          //!v.areas.contains( vertexID )
        );
      });

    if (doubleVertices.isEmpty()) return { updatedState: state };

    doubleVertices.forEach((doubleVertex) => {
      let reduced = doubleVertex.lines.reduce((reducedState, lineID) => {
        reducedState = reducedState.updateIn(
          ["scene", "layers", layerID, "lines", lineID, "vertices"],
          (vertices) => {
            if (vertices) {
              return vertices.map((v) =>
                v === doubleVertex.id ? vertexID : v
              );
            }
          }
        );
        reducedState = Vertex.addElement(
          reducedState,
          layerID,
          vertexID,
          "lines",
          lineID
        ).updatedState;

        return reducedState;
      }, state);

      let biReduced = doubleVertex.areas.reduce((reducedState, areaID) => {
        reducedState = reducedState.updateIn(
          ["scene", "layers", layerID, "areas", areaID, "vertices"],
          (vertices) => {
            if (vertices)
              return vertices.map((v) =>
                v === doubleVertex.id ? vertexID : v
              );
          }
        );
        reducedState = Vertex.addElement(
          reducedState,
          layerID,
          vertexID,
          "areas",
          areaID
        ).updatedState;

        return reducedState;
      }, reduced);

      state = Vertex.remove(
        biReduced,
        layerID,
        doubleVertex.id,
        null,
        null,
        true
      ).updatedState;
    });

    return { updatedState: state };
  }

  static setPropertiesOnSelected(state, layerID, properties) {
    let selected = state.getIn(["scene", "layers", layerID, "selected"]);

    selected.lines.forEach(
      (lineID) =>
        (state = Line.setProperties(
          state,
          layerID,
          lineID,
          properties
        ).updatedState)
    );
    selected.holes.forEach(
      (holeID) =>
        (state = Hole.setProperties(
          state,
          layerID,
          holeID,
          properties
        ).updatedState)
    );
    selected.areas.forEach(
      (areaID) =>
        (state = Area.setProperties(
          state,
          layerID,
          areaID,
          properties
        ).updatedState)
    );
    selected.items.forEach(
      (itemID) =>
        (state = Item.setProperties(
          state,
          layerID,
          itemID,
          properties
        ).updatedState)
    );

    return { updatedState: state };
  }

  static updatePropertiesOnSelected(state, layerID, properties) {
    let selected = state.getIn(["scene", "layers", layerID, "selected"]);

    selected.lines.forEach(
      (lineID) =>
        (state = Line.updateProperties(
          state,
          layerID,
          lineID,
          properties
        ).updatedState)
    );
    selected.holes.forEach(
      (holeID) =>
        (state = Hole.updateProperties(
          state,
          layerID,
          holeID,
          properties
        ).updatedState)
    );
    selected.areas.forEach(
      (areaID) =>
        (state = Area.updateProperties(
          state,
          layerID,
          areaID,
          properties
        ).updatedState)
    );
    selected.items.forEach(
      (itemID) =>
        (state = Item.updateProperties(
          state,
          layerID,
          itemID,
          properties
        ).updatedState)
    );

    return { updatedState: state };
  }

  static setAttributesOnSelected(state, layerID, attributes) {
    let selected = state.getIn(["scene", "layers", layerID, "selected"]);

    selected.lines.forEach(
      (lineID) =>
        (state = Line.setAttributes(
          state,
          layerID,
          lineID,
          attributes
        ).updatedState)
    );
    selected.holes.forEach(
      (holeID) =>
        (state = Hole.setAttributes(
          state,
          layerID,
          holeID,
          attributes
        ).updatedState)
    );
    selected.items.forEach(
      (itemID) =>
        (state = Item.setAttributes(
          state,
          layerID,
          itemID,
          attributes
        ).updatedState)
    );
    selected.areas.forEach(
      (areaID) =>
        (state = Area.setAttributes(
          state,
          layerID,
          areaID,
          attributes
        ).updatedState)
    );

    return { updatedState: state };
  }
}

class Area {
  static add(state, layerID, type, verticesCoords, catalog) {
    let area;

    let layer = state.getIn(["scene", "layers", layerID]);

    layer = layer.withMutations((layer) => {
      let areaID = IDBroker.acquireID();

      let vertices = verticesCoords.map(
        (v) => Vertex.add(state, layerID, v.x, v.y, "areas", areaID).vertex.id
      );

      area = catalog.factoryElement(type, {
        id: areaID,
        name: NameGenerator.generateName(
          "areas",
          catalog.getIn(["elements", type, "info", "title"])
        ),
        type,
        prototype: "areas",
        vertices,
      });

      layer.setIn(["areas", areaID], area);
    });

    state = state.setIn(["scene", "layers", layerID], layer);

    return { updatedState: state, area };
  }

  static select(state, layerID, areaID) {
    state = Layer.select(state, layerID).updatedState;
    state = Layer.selectElement(state, layerID, "areas", areaID).updatedState;

    return { updatedState: state };
  }

  static remove(state, layerID, areaID) {
    let area = state.getIn(["scene", "layers", layerID, "areas", areaID]);

    if (area.get("selected") === true)
      state = this.unselect(state, layerID, areaID).updatedState;

    area.vertices.forEach((vertexID) => {
      state = Vertex.remove(
        state,
        layerID,
        vertexID,
        "areas",
        areaID
      ).updatedState;
    });

    state = state.deleteIn(["scene", "layers", layerID, "areas", areaID]);

    state
      .getIn(["scene", "groups"])
      .forEach(
        (group) =>
          (state = Group.removeElement(
            state,
            group.id,
            layerID,
            "areas",
            areaID
          ).updatedState)
      );

    return { updatedState: state };
  }

  static unselect(state, layerID, areaID) {
    state = Layer.unselect(state, layerID, "areas", areaID).updatedState;

    return { updatedState: state };
  }

  static setProperties(state, layerID, areaID, properties) {
    state = state.mergeIn(
      ["scene", "layers", layerID, "areas", areaID, "properties"],
      properties
    );

    return { updatedState: state };
  }

  static setJsProperties(state, layerID, areaID, properties) {
    return this.setProperties(state, layerID, areaID, fromJS(properties));
  }

  static updateProperties(state, layerID, areaID, properties) {
    properties.forEach((v, k) => {
      if (
        state.hasIn([
          "scene",
          "layers",
          layerID,
          "areas",
          areaID,
          "properties",
          k,
        ])
      )
        state = state.mergeIn(
          ["scene", "layers", layerID, "areas", areaID, "properties", k],
          v
        );
    });

    return { updatedState: state };
  }

  static updateJsProperties(state, layerID, areaID, properties) {
    return this.updateProperties(state, layerID, areaID, fromJS(properties));
  }

  static setAttributes(state, layerID, areaID, areaAttributes) {
    state = state.mergeIn(
      ["scene", "layers", layerID, "areas", areaID],
      areaAttributes
    );

    return { updatedState: state };
  }
}

class Group {
  static select(state, groupID) {
    let layerList = state.getIn(["scene", "groups", groupID, "elements"]);

    state = Project.setAlterate(state).updatedState;

    layerList.entrySeq().forEach(([groupLayerID, groupLayerElements]) => {
      state = Layer.unselectAll(state, groupLayerID).updatedState;

      let lines = groupLayerElements.get("lines");
      let holes = groupLayerElements.get("holes");
      let items = groupLayerElements.get("items");
      let areas = groupLayerElements.get("areas");

      if (lines)
        lines.forEach((lineID) => {
          state = Line.select(state, groupLayerID, lineID).updatedState;
        });
      if (holes)
        holes.forEach((holeID) => {
          state = Hole.select(state, groupLayerID, holeID).updatedState;
        });
      if (items)
        items.forEach((itemID) => {
          state = Item.select(state, groupLayerID, itemID).updatedState;
        });
      if (areas)
        areas.forEach((areaID) => {
          state = Area.select(state, groupLayerID, areaID).updatedState;
        });
    });

    state = Project.setAlterate(state).updatedState;

    let groups = state
      .getIn(["scene", "groups"])
      .map((g) => g.set("selected", false));

    state = state
      .setIn(["scene", "groups"], groups)
      .setIn(["scene", "groups", groupID, "selected"], true);

    return { updatedState: state };
  }

  static unselect(state, groupID) {
    let layerList = state.getIn(["scene", "groups", groupID, "elements"]);
    let reduced = layerList.reduce(
      (newState, layer, layerID) =>
        Layer.unselectAll(newState, layerID).updatedState,
      state
    );
    state = reduced.setIn(["scene", "groups", groupID, "selected"], false);

    return { updatedState: state };
  }

  static create(state) {
    let groupID = IDBroker.acquireID();

    state = state.setIn(
      ["scene", "groups", groupID],
      new GroupModel({ id: groupID, name: groupID })
    );

    return { updatedState: state };
  }

  static createFromSelectedElements(state) {
    let groupID = IDBroker.acquireID();

    state = state.setIn(
      ["scene", "groups", groupID],
      new GroupModel({ id: groupID, name: groupID })
    );

    function filterSelectedElements(layer, elementType) {
      return layer
        .get(elementType)
        .filter((element) => element.get("selected"));
    }

    // Main logic
    state.getIn(["scene", "layers"]).forEach((layer) => {
      const layerID = layer.get("id");
      // Define the element types to be processed
      const elementTypes = ["lines", "items", "holes", "areas"];

      // Iterate over each element type
      elementTypes.forEach((elementType) => {
        // Filter the selected elements of the current type
        const selectedElements = filterSelectedElements(layer, elementType);

        // Process each selected element
        selectedElements.forEach((element) => {
          // Update the state for each selected element
          // Note: Ensure this.addElement returns the new state without side-effects
          state = this.addElement(
            state,
            groupID, // Assuming groupID is defined elsewhere in your code
            layerID,
            elementType,
            element.get("id")
          ).updatedState;
        });
      });
    });

    return { updatedState: state };
  }

  static addElement(state, groupID, layerID, elementPrototype, elementID) {
    let actualList =
      state.getIn([
        "scene",
        "groups",
        groupID,
        "elements",
        layerID,
        elementPrototype,
      ]) || new List();

    if (!actualList.contains(elementID)) {
      state = state.setIn(
        ["scene", "groups", groupID, "elements", layerID, elementPrototype],
        actualList.push(elementID)
      );

      state = this.reloadBaricenter(state, groupID).updatedState;
    }

    return { updatedState: state };
  }

  static setBarycenter(state, groupID, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    if (typeof x !== "undefined")
      state = state.setIn(["scene", "groups", groupID, "x"], x);
    if (typeof y !== "undefined")
      state = state.setIn(["scene", "groups", groupID, "y"], y);

    return { updatedState: state };
  }

  static reloadBaricenter(state, groupID) {
    let layerList = state.getIn(["scene", "groups", groupID, "elements"]);

    let { a, b, c, d, e, f, SVGHeight } = state.get("viewer2D").toJS();

    let m1 = [
      [a, b, c],
      [d, e, f],
      [0, 0, 1],
    ];

    let xBar = 0;
    let yBar = 0;
    let elementCount = 0;

    layerList.entrySeq().forEach(([groupLayerID, groupLayerElements]) => {
      state = Layer.unselectAll(state, groupLayerID).updatedState;

      let lines = groupLayerElements.get("lines");
      let holes = groupLayerElements.get("holes");
      let items = groupLayerElements.get("items");
      let areas = groupLayerElements.get("areas");

      if (lines)
        lines.forEach((lineID) => {
          let vertices = state
            .getIn([
              "scene",
              "layers",
              groupLayerID,
              "lines",
              lineID,
              "vertices",
            ])
            .map((vID) =>
              state.getIn(["scene", "layers", groupLayerID, "vertices", vID])
            );

          let { x: x1, y: y1 } = vertices.get(0);
          let { x: x2, y: y2 } = vertices.get(1);
          let { x: xM, y: yM } = GeometryUtils.midPoint(x1, y1, x2, y2);

          xBar += xM;
          yBar += yM;
          elementCount++;
        });

      if (holes)
        holes.forEach((holeID) => {
          let hole = state.getIn([
            "scene",
            "layers",
            groupLayerID,
            "holes",
            holeID,
          ]);
          let lineVertices = state
            .getIn([
              "scene",
              "layers",
              groupLayerID,
              "lines",
              hole.line,
              "vertices",
            ])
            .map((vID) =>
              state.getIn(["scene", "layers", groupLayerID, "vertices", vID])
            );
          let { x: x1, y: y1 } = lineVertices.get(0);
          let { x: x2, y: y2 } = lineVertices.get(1);
          let { x, y } = GeometryUtils.extendLine(
            x1,
            y1,
            x2,
            y2,
            hole.offset * GeometryUtils.pointsDistance(x1, y1, x2, y2)
          );

          xBar += x;
          yBar += y;
          elementCount++;
        });

      if (items)
        items.forEach((itemID) => {
          let { x, y } = state.getIn([
            "scene",
            "layers",
            groupLayerID,
            "items",
            itemID,
          ]);

          xBar += x;
          yBar += y;
          elementCount++;
        });

      if (areas)
        areas.forEach((areaID) => {
          let areaVertices = state
            .getIn([
              "scene",
              "layers",
              groupLayerID,
              "areas",
              areaID,
              "vertices",
            ])
            .map((vID) =>
              state.getIn(["scene", "layers", groupLayerID, "vertices", vID])
            )
            .toJS();
          let { x, y } = GeometryUtils.verticesMidPoint(areaVertices);

          xBar += x;
          yBar += y;
          elementCount++;
        });
    });

    if (elementCount) {
      state = this.setBarycenter(
        state,
        groupID,
        xBar / elementCount,
        yBar / elementCount
      ).updatedState;
    }

    return { updatedState: state };
  }

  static removeElement(state, groupID, layerID, elementPrototype, elementID) {
    let actualList = state.getIn([
      "scene",
      "groups",
      groupID,
      "elements",
      layerID,
      elementPrototype,
    ]);

    if (!actualList || !actualList.contains(elementID)) {
      return { updatedState: state };
    }

    state = state.setIn(
      ["scene", "groups", groupID, "elements", layerID, elementPrototype],
      actualList.filterNot((el) => el === elementID)
    );

    return { updatedState: state };
  }

  static setAttributes(state, groupID, attributes) {
    state = state.mergeIn(["scene", "groups", groupID], attributes);

    return { updatedState: state };
  }

  static setProperties(state, groupID, properties) {
    state = state.mergeIn(
      ["scene", "groups", groupID, "properties"],
      properties
    );

    return { updatedState: state };
  }

  static remove(state, groupID) {
    state = state.removeIn(["scene", "groups", groupID]);

    return { updatedState: state };
  }

  static removeAndDeleteElements(state, groupID) {
    let layerList = state.getIn(["scene", "groups", groupID, "elements"]);

    layerList.entrySeq().forEach(([groupLayerID, groupLayerElements]) => {
      state = Layer.unselectAll(state, groupLayerID).updatedState;

      let lines = groupLayerElements.get("lines");
      let holes = groupLayerElements.get("holes");
      let items = groupLayerElements.get("items");
      let areas = groupLayerElements.get("areas");

      if (lines) {
        lines.forEach((lineID) => {
          state = Line.remove(state, groupLayerID, lineID).updatedState;
          state = Layer.detectAndUpdateAreas(state, groupLayerID).updatedState;
        });
      }

      if (holes)
        holes.forEach((holeID) => {
          state = Hole.remove(state, groupLayerID, holeID).updatedState;
        });
      if (items)
        items.forEach((itemID) => {
          state = Item.remove(state, groupLayerID, itemID).updatedState;
        });
      //( actually ) no effect by area's destruction
      if (false && areas)
        areas.forEach((areaID) => {
          state = Area.remove(state, groupLayerID, areaID).updatedState;
        });
    });

    state = state.deleteIn(["scene", "groups", groupID]);

    return { updatedState: state };
  }

  static translate(state, groupID, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let deltaX = x - state.getIn(["scene", "groups", groupID, "x"]);
    let deltaY = y - state.getIn(["scene", "groups", groupID, "y"]);

    let layerList = state.getIn(["scene", "groups", groupID, "elements"]);

    layerList.entrySeq().forEach(([groupLayerID, groupLayerElements]) => {
      let lines = groupLayerElements.get("lines");
      //let holes = groupLayerElements.get('holes');
      let items = groupLayerElements.get("items");
      //let areas = groupLayerElements.get('areas');

      //move vertices instead lines avoiding multiple vertex translation
      if (lines) {
        let vertices = {};
        lines.forEach((lineID) => {
          let line = state.getIn([
            "scene",
            "layers",
            groupLayerID,
            "lines",
            lineID,
          ]);
          if (!vertices[line.vertices.get(0)])
            vertices[line.vertices.get(0)] = state.getIn([
              "scene",
              "layers",
              groupLayerID,
              "vertices",
              line.vertices.get(0),
            ]);
          if (!vertices[line.vertices.get(1)])
            vertices[line.vertices.get(1)] = state.getIn([
              "scene",
              "layers",
              groupLayerID,
              "vertices",
              line.vertices.get(1),
            ]);
        });

        for (let vertexID in vertices) {
          let { x: xV, y: yV } = vertices[vertexID];
          state = Vertex.setAttributes(
            state,
            groupLayerID,
            vertexID,
            new Map({ x: xV + deltaX, y: yV + deltaY })
          ).updatedState;
        }

        //need to be separated from setAttributes cycle
        for (let vertexID in vertices) {
          state = Vertex.beginDraggingVertex(
            state,
            groupLayerID,
            vertexID
          ).updatedState;
          state = Vertex.endDraggingVertex(state).updatedState;
        }
      }

      if (items)
        state = items
          .map((itemID) =>
            state.getIn(["scene", "layers", groupLayerID, "items", itemID])
          )
          .reduce((newState, item) => {
            let { x: xI, y: yI } = item;
            return Item.setAttributes(
              newState,
              groupLayerID,
              item.id,
              new Map({ x: xI + deltaX, y: yI + deltaY })
            ).updatedState;
          }, state);

      //translation of holes and areas should not take any effect
      //if( holes ) holes.forEach( holeID => { state = Hole.select( state, groupLayerID, holeID ).updatedState; });
      //if( areas ) areas.forEach( areaID => { state = Area.select( state, groupLayerID, areaID ).updatedState; });

      state = Layer.detectAndUpdateAreas(state, groupLayerID).updatedState;
    });

    state = this.setBarycenter(state, groupID, x, y).updatedState;

    state = Group.select(state, groupID).updatedState;

    return { updatedState: state };
  }

  static rotate(state, groupID, newAlpha) {
    let {
      x: barX,
      y: barY,
      rotation,
    } = state.getIn(["scene", "groups", groupID]);

    let alpha = newAlpha - rotation;

    state = Group.setAttributes(
      state,
      groupID,
      new Map({ rotation: newAlpha })
    ).updatedState;

    let layerList = state.getIn(["scene", "groups", groupID, "elements"]);

    layerList.entrySeq().forEach(([groupLayerID, groupLayerElements]) => {
      let lines = groupLayerElements.get("lines");
      let holes = groupLayerElements.get("holes");
      let items = groupLayerElements.get("items");
      let areas = groupLayerElements.get("areas");

      //move vertices instead lines avoiding multiple vertex translation
      if (lines) {
        let vertices = {};
        lines.forEach((lineID) => {
          let line = state.getIn([
            "scene",
            "layers",
            groupLayerID,
            "lines",
            lineID,
          ]);
          if (!vertices[line.vertices.get(0)])
            vertices[line.vertices.get(0)] = state.getIn([
              "scene",
              "layers",
              groupLayerID,
              "vertices",
              line.vertices.get(0),
            ]);
          if (!vertices[line.vertices.get(1)])
            vertices[line.vertices.get(1)] = state.getIn([
              "scene",
              "layers",
              groupLayerID,
              "vertices",
              line.vertices.get(1),
            ]);
        });

        for (let vertexID in vertices) {
          let { x: xV, y: yV } = vertices[vertexID];
          let { x: newX, y: newY } = GeometryUtils.rotatePointAroundPoint(
            xV,
            yV,
            barX,
            barY,
            alpha
          );
          state = Vertex.setAttributes(
            state,
            groupLayerID,
            vertexID,
            new Map({ x: newX, y: newY })
          ).updatedState;
        }
        //need to be separated from setAttributes cycle
        for (let vertexID in vertices) {
          state = Vertex.beginDraggingVertex(
            state,
            groupLayerID,
            vertexID
          ).updatedState;
          state = Vertex.endDraggingVertex(state).updatedState;
        }
      }

      if (items)
        state = items
          .map((itemID) =>
            state.getIn(["scene", "layers", groupLayerID, "items", itemID])
          )
          .reduce((newState, item) => {
            let { x: xI, y: yI, rotation: rI } = item;

            let { x: newX, y: newY } = GeometryUtils.rotatePointAroundPoint(
              xI,
              yI,
              barX,
              barY,
              alpha
            );

            return Item.setAttributes(
              newState,
              groupLayerID,
              item.id,
              new Map({ x: newX, y: newY, rotation: rI + alpha })
            ).updatedState;
          }, state);

      //rotation of holes and areas should not take any effect
      //if( holes ) holes.forEach( holeID => { state = Hole.select( state, groupLayerID, holeID ).updatedState; });
      //if( areas ) areas.forEach( areaID => { state = Area.select( state, groupLayerID, areaID ).updatedState; });

      state = Layer.detectAndUpdateAreas(state, groupLayerID).updatedState;
    });

    state = Group.select(state, groupID).updatedState;

    return { updatedState: state };
  }
}

class HorizontalGuide {
  static create(state, coordinate) {
    let hGuideID = IDBroker.acquireID();
    state = state.setIn(
      ["scene", "guides", "horizontal", hGuideID],
      coordinate
    );

    return { updatedState: state };
  }

  static remove(state, hGuideID) {
    state = state.deleteIn(["scene", "guides", "horizontal", hGuideID]);

    return { updatedState: state };
  }
}

class VerticalGuide {
  static create(state, coordinate) {
    let vGuideID = IDBroker.acquireID();
    state = state.setIn(["scene", "guides", "vertical", vGuideID], coordinate);

    return { updatedState: state };
  }

  static remove(state, vGuideID) {
    state = state.deleteIn(["scene", "guides", "vertical", vGuideID]);

    return { updatedState: state };
  }
}

class CircularGuide {}

class Hole {
  static create(state, layerID, type, lineID, offset, properties) {
    let holeID = IDBroker.acquireID();

    let hole = state.catalog.factoryElement(
      type,
      {
        id: holeID,
        name: NameGenerator.generateName(
          "holes",
          state.catalog.getIn(["elements", type, "info", "title"])
        ),
        type,
        offset,
        line: lineID,
      },
      properties
    );

    state = state.setIn(["scene", "layers", layerID, "holes", holeID], hole);
    state = state.updateIn(
      ["scene", "layers", layerID, "lines", lineID, "holes"],
      (holes) => holes.push(holeID)
    );

    return { updatedState: state, hole };
  }

  static select(state, layerID, holeID) {
    state = Layer.select(state, layerID).updatedState;
    state = Layer.selectElement(state, layerID, "holes", holeID).updatedState;

    return { updatedState: state };
  }

  static remove(state, layerID, holeID) {
    let hole = state.getIn(["scene", "layers", layerID, "holes", holeID]);
    state = this.unselect(state, layerID, holeID).updatedState;
    state = Layer.removeElement(state, layerID, "holes", holeID).updatedState;

    state = state.updateIn(
      ["scene", "layers", layerID, "lines", hole.line, "holes"],
      (holes) => {
        let index = holes.findIndex((ID) => holeID === ID);
        return index !== -1 ? holes.remove(index) : holes;
      }
    );

    state
      .getIn(["scene", "groups"])
      .forEach(
        (group) =>
          (state = Group.removeElement(
            state,
            group.id,
            layerID,
            "holes",
            holeID
          ).updatedState)
      );

    return { updatedState: state };
  }

  static unselect(state, layerID, holeID) {
    state = Layer.unselect(state, layerID, "holes", holeID).updatedState;

    return { updatedState: state };
  }

  static selectToolDrawingHole(state, sceneComponentType) {
    let snapElements = new List().withMutations((snapElements) => {
      let { lines, vertices } = state.getIn([
        "scene",
        "layers",
        state.scene.selectedLayer,
      ]);

      lines.forEach((line) => {
        let { x: x1, y: y1 } = vertices.get(line.vertices.get(0));
        let { x: x2, y: y2 } = vertices.get(line.vertices.get(1));

        addLineSegmentSnap(snapElements, x1, y1, x2, y2, 20, 1, line.id);
      });
    });

    state = state.merge({
      mode: MODE_DRAWING_HOLE,
      snapElements,
      drawingSupport: Map({
        type: sceneComponentType,
      }),
    });

    return { updatedState: state };
  }

  static updateDrawingHole(state, layerID, x, y) {
    let catalog = state.catalog;
    x = Math.round(x);
    y = Math.round(y);

    //calculate snap and overwrite coords if needed
    //force snap to segment
    let snap = nearestSnap(
      state.snapElements,
      x,
      y,
      state.snapMask.merge({ SNAP_SEGMENT: true })
    );
    if (snap) ({ x, y } = snap.point);

    let selectedHole = state
      .getIn(["scene", "layers", layerID, "selected", "holes"])
      .first();

    if (snap) {
      let lineID = snap.snap.related.get(0);

      let vertices = state.getIn([
        "scene",
        "layers",
        layerID,
        "lines",
        lineID,
        "vertices",
      ]);
      let { x: x1, y: y1 } = state.getIn([
        "scene",
        "layers",
        layerID,
        "vertices",
        vertices.get(0),
      ]);
      let { x: x2, y: y2 } = state.getIn([
        "scene",
        "layers",
        layerID,
        "vertices",
        vertices.get(1),
      ]);

      // I need min and max vertices on this line segment
      let minVertex = GeometryUtils.minVertex(
        { x: x1, y: y1 },
        { x: x2, y: y2 }
      );
      let maxVertex = GeometryUtils.maxVertex(
        { x: x1, y: y1 },
        { x: x2, y: y2 }
      );
      let width = catalog
        .factoryElement(state.drawingSupport.get("type"))
        .properties.getIn(["width", "length"]);

      // Now I need min and max possible coordinates for the hole on the line. They depend on the width of the hole
      let lineLength = GeometryUtils.pointsDistance(x1, y1, x2, y2);
      let alpha = GeometryUtils.absAngleBetweenTwoPoints(x1, y1, x2, y2);

      let cosAlpha = GeometryUtils.cosWithThreshold(alpha, 0.0000001);
      let sinAlpha = GeometryUtils.sinWithThreshold(alpha, 0.0000001);

      let minLeftVertexHole = {
        x: minVertex.x + (width / 2) * cosAlpha,
        y: minVertex.y + (width / 2) * sinAlpha,
      };

      let maxRightVertexHole = {
        x: minVertex.x + lineLength * cosAlpha - (width / 2) * cosAlpha,
        y: minVertex.y + lineLength * sinAlpha - (width / 2) * sinAlpha,
      };

      let offset;
      if (x < minLeftVertexHole.x) {
        offset = GeometryUtils.pointPositionOnLineSegment(
          minVertex.x,
          minVertex.y,
          maxVertex.x,
          maxVertex.y,
          minLeftVertexHole.x,
          minLeftVertexHole.y
        );
      } else if (x > maxRightVertexHole.x) {
        offset = GeometryUtils.pointPositionOnLineSegment(
          minVertex.x,
          minVertex.y,
          maxVertex.x,
          maxVertex.y,
          maxRightVertexHole.x,
          maxRightVertexHole.y
        );
      } else {
        if (x === minLeftVertexHole.x && x === maxRightVertexHole.x) {
          if (y < minLeftVertexHole.y) {
            offset = GeometryUtils.pointPositionOnLineSegment(
              minVertex.x,
              minVertex.y,
              maxVertex.x,
              maxVertex.y,
              minLeftVertexHole.x,
              minLeftVertexHole.y
            );
            offset =
              minVertex.x === x1 && minVertex.y === y1 ? offset : 1 - offset;
          } else if (y > maxRightVertexHole.y) {
            offset = GeometryUtils.pointPositionOnLineSegment(
              minVertex.x,
              minVertex.y,
              maxVertex.x,
              maxVertex.y,
              maxRightVertexHole.x,
              maxRightVertexHole.y
            );
            offset =
              minVertex.x === x1 && minVertex.y === y1 ? offset : 1 - offset;
          } else {
            offset = GeometryUtils.pointPositionOnLineSegment(
              x1,
              y1,
              x2,
              y2,
              x,
              y
            );
          }
        } else {
          offset = GeometryUtils.pointPositionOnLineSegment(
            x1,
            y1,
            x2,
            y2,
            x,
            y
          );
        }
      }

      //if hole does exist, update
      if (selectedHole && snap) {
        state = state.mergeIn(
          ["scene", "layers", layerID, "holes", selectedHole],
          { offset, line: lineID }
        );

        //remove from old line ( if present )
        let index = state
          .getIn(["scene", "layers", layerID, "lines"])
          .findEntry((line) => {
            return (
              line.id !== lineID && line.get("holes").contains(selectedHole)
            );
          });

        if (index) {
          let removed = index[1]
            .get("holes")
            .filter((hl) => hl !== selectedHole);
          state = state.setIn(
            ["scene", "layers", layerID, "lines", index[0], "holes"],
            removed
          );
        }

        //add to line
        let line_holes = state.getIn([
          "scene",
          "layers",
          layerID,
          "lines",
          lineID,
          "holes",
        ]);
        if (!line_holes.contains(selectedHole)) {
          state = state.setIn(
            ["scene", "layers", layerID, "lines", lineID, "holes"],
            line_holes.push(selectedHole)
          );
        }
      } else if (!selectedHole && snap) {
        //if hole does not exist, create
        let { updatedState: stateH, hole } = this.create(
          state,
          layerID,
          state.drawingSupport.get("type"),
          lineID,
          offset
        );
        state = Hole.select(stateH, layerID, hole.id).updatedState;
      }
    }
    //i've lost the snap while trying to drop the hole
    else if (false && selectedHole) {
      //think if enable
      state = Hole.remove(state, layerID, selectedHole).updatedState;
    }

    return { updatedState: state };
  }

  static endDrawingHole(state, layerID, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    state = this.updateDrawingHole(state, layerID, x, y).updatedState;
    state = Layer.unselectAll(state, layerID).updatedState;

    return { updatedState: state };
  }

  static beginDraggingHole(state, layerID, holeID, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let layer = state.getIn(["scene", "layers", layerID]);
    let hole = layer.getIn(["holes", holeID]);
    let line = layer.getIn(["lines", hole.line]);
    let v0 = layer.getIn(["vertices", line.vertices.get(0)]);
    let v1 = layer.getIn(["vertices", line.vertices.get(1)]);

    let snapElements = addLineSegmentSnap(
      List(),
      v0.x,
      v0.y,
      v1.x,
      v1.y,
      9999999,
      1,
      null
    );

    state = state.merge({
      mode: MODE_DRAGGING_HOLE,
      snapElements,
      draggingSupport: Map({
        layerID,
        holeID,
        startPointX: x,
        startPointY: y,
      }),
    });

    return { updatedState: state };
  }

  static updateDraggingHole(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    //calculate snap and overwrite coords if needed
    //force snap to segment
    let snap = nearestSnap(
      state.snapElements,
      x,
      y,
      state.snapMask.merge({ SNAP_SEGMENT: true })
    );
    if (!snap) return state;

    let { draggingSupport, scene } = state;

    let layerID = draggingSupport.get("layerID");
    let holeID = draggingSupport.get("holeID");
    let startPointX = draggingSupport.get("startPointX");
    let startPointY = draggingSupport.get("startPointY");

    let layer = state.getIn(["scene", "layers", layerID]);
    let hole = layer.getIn(["holes", holeID]);
    let line = layer.getIn(["lines", hole.line]);
    let v0 = layer.getIn(["vertices", line.vertices.get(0)]);
    let v1 = layer.getIn(["vertices", line.vertices.get(1)]);

    ({ x, y } = snap.point);

    // I need min and max vertices on this line segment
    let minVertex = GeometryUtils.minVertex(v0, v1);
    let maxVertex = GeometryUtils.maxVertex(v0, v1);

    // Now I need min and max possible coordinates for the hole on the line. They depend on the width of the hole

    let width = hole.properties.get("width").get("length");
    let lineLength = GeometryUtils.pointsDistance(v0.x, v0.y, v1.x, v1.y);
    let alpha = Math.atan2(Math.abs(v1.y - v0.y), Math.abs(v1.x - v0.x));

    let cosWithThreshold = (alpha) => {
      let cos = Math.cos(alpha);
      return cos < 0.0000001 ? 0 : cos;
    };

    let sinWithThreshold = (alpha) => {
      let sin = Math.sin(alpha);
      return sin < 0.0000001 ? 0 : sin;
    };

    let cosAlpha = cosWithThreshold(alpha);
    let sinAlpha = sinWithThreshold(alpha);

    let minLeftVertexHole = {
      x: minVertex.x + (width / 2) * cosAlpha,
      y: minVertex.y + (width / 2) * sinAlpha,
    };

    let maxRightVertexHole = {
      x: minVertex.x + lineLength * cosAlpha - (width / 2) * cosAlpha,
      y: minVertex.y + lineLength * sinAlpha - (width / 2) * sinAlpha,
    };

    // Now I need to verify if the snap vertex (with coordinates x and y) is on the line segment

    let offset;

    if (x < minLeftVertexHole.x) {
      // Snap point is previous the the line
      offset = GeometryUtils.pointPositionOnLineSegment(
        minVertex.x,
        minVertex.y,
        maxVertex.x,
        maxVertex.y,
        minLeftVertexHole.x,
        minLeftVertexHole.y
      );
    } else {
      // Snap point is after the line or on the line
      if (x > maxRightVertexHole.x) {
        offset = GeometryUtils.pointPositionOnLineSegment(
          minVertex.x,
          minVertex.y,
          maxVertex.x,
          maxVertex.y,
          maxRightVertexHole.x,
          maxRightVertexHole.y
        );
      } else if (x === minLeftVertexHole.x && x === maxRightVertexHole.x) {
        // I am on a vertical line, I need to check y coordinates
        if (y < minLeftVertexHole.y) {
          offset = GeometryUtils.pointPositionOnLineSegment(
            minVertex.x,
            minVertex.y,
            maxVertex.x,
            maxVertex.y,
            minLeftVertexHole.x,
            minLeftVertexHole.y
          );

          offset = minVertex === v0 ? offset : 1 - offset;
        } else if (y > maxRightVertexHole.y) {
          offset = GeometryUtils.pointPositionOnLineSegment(
            minVertex.x,
            minVertex.y,
            maxVertex.x,
            maxVertex.y,
            maxRightVertexHole.x,
            maxRightVertexHole.y
          );

          offset = minVertex === v0 ? offset : 1 - offset;
        } else {
          offset = GeometryUtils.pointPositionOnLineSegment(
            minVertex.x,
            minVertex.y,
            maxVertex.x,
            maxVertex.y,
            x,
            y
          );

          offset = minVertex === v0 ? offset : 1 - offset;
        }
      } else {
        offset = GeometryUtils.pointPositionOnLineSegment(
          minVertex.x,
          minVertex.y,
          maxVertex.x,
          maxVertex.y,
          x,
          y
        );
      }
    }

    hole = hole.set("offset", offset);

    state = state.merge({
      scene: scene.mergeIn(["layers", layerID, "holes", holeID], hole),
    });

    return { updatedState: state };
  }

  static endDraggingHole(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    state = this.updateDraggingHole(state, x, y).updatedState;
    state = state.merge({ mode: MODE_IDLE });

    return { updatedState: state };
  }

  static setProperties(state, layerID, holeID, properties) {
    state = state.setIn(
      ["scene", "layers", layerID, "holes", holeID, "properties"],
      properties
    );

    return { updatedState: state };
  }

  static setJsProperties(state, layerID, holeID, properties) {
    return this.setProperties(state, layerID, holeID, fromJS(properties));
  }

  static updateProperties(state, layerID, holeID, properties) {
    properties.forEach((v, k) => {
      if (
        state.hasIn([
          "scene",
          "layers",
          layerID,
          "holes",
          holeID,
          "properties",
          k,
        ])
      )
        state = state.mergeIn(
          ["scene", "layers", layerID, "holes", holeID, "properties", k],
          v
        );
    });

    return { updatedState: state };
  }

  static updateJsProperties(state, layerID, holeID, properties) {
    return this.updateProperties(state, layerID, holeID, fromJS(properties));
  }

  static setAttributes(state, layerID, holeID, holesAttributes) {
    let hAttr = holesAttributes.toJS();
    let { offsetA, offsetB, offset } = hAttr;

    delete hAttr["offsetA"];
    delete hAttr["offsetB"];
    delete hAttr["offset"];

    let misc = new Map({ _unitA: offsetA._unit, _unitB: offsetB._unit });

    state = state
      .mergeIn(["scene", "layers", layerID, "holes", holeID], fromJS(hAttr))
      .mergeDeepIn(
        ["scene", "layers", layerID, "holes", holeID],
        new Map({ offset, misc })
      );

    return { updatedState: state };
  }
}

class Item {
  static create(state, layerID, type, x, y, width, height, rotation) {
    x = Math.round(x);
    y = Math.round(y);

    let itemID = IDBroker.acquireID();

    let item = state.catalog.factoryElement(type, {
      id: itemID,
      name: NameGenerator.generateName(
        "items",
        state.catalog.getIn(["elements", type, "info", "title"])
      ),
      type,
      height,
      width,
      x,
      y,
      rotation,
    });

    state = state.setIn(["scene", "layers", layerID, "items", itemID], item);

    return { updatedState: state, item };
  }

  static select(state, layerID, itemID) {
    state = Layer.select(state, layerID).updatedState;
    state = Layer.selectElement(state, layerID, "items", itemID).updatedState;

    return { updatedState: state };
  }

  static remove(state, layerID, itemID) {
    state = this.unselect(state, layerID, itemID).updatedState;
    state = Layer.removeElement(state, layerID, "items", itemID).updatedState;

    state
      .getIn(["scene", "groups"])
      .forEach(
        (group) =>
          (state = Group.removeElement(
            state,
            group.id,
            layerID,
            "items",
            itemID
          ).updatedState)
      );

    return { updatedState: state };
  }

  static unselect(state, layerID, itemID) {
    state = Layer.unselect(state, layerID, "items", itemID).updatedState;

    return { updatedState: state };
  }

  static selectToolDrawingItem(state, sceneComponentType) {
    state = state.merge({
      mode: MODE_DRAWING_ITEM,
      drawingSupport: new Map({
        type: sceneComponentType,
      }),
    });

    return { updatedState: state };
  }

  static updateDrawingItem(state, layerID, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    if (state.hasIn(["drawingSupport", "currentID"])) {
      state = state.updateIn(
        [
          "scene",
          "layers",
          layerID,
          "items",
          state.getIn(["drawingSupport", "currentID"]),
        ],
        (item) => item.merge({ x, y })
      );
    } else {
      let { updatedState: stateI, item } = this.create(
        state,
        layerID,
        state.getIn(["drawingSupport", "type"]),
        x,
        y,
        200,
        100,
        0
      );
      state = Item.select(stateI, layerID, item.id).updatedState;
      state = state.setIn(["drawingSupport", "currentID"], item.id);
    }

    return { updatedState: state };
  }

  static endDrawingItem(state, layerID, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let catalog = state.catalog;
    state = this.updateDrawingItem(state, layerID, x, y, catalog).updatedState;
    state = Layer.unselectAll(state, layerID).updatedState;
    state = state.merge({
      drawingSupport: Map({
        type: state.drawingSupport.get("type"),
      }),
    });

    return { updatedState: state };
  }

  static beginDraggingItem(state, layerID, itemID, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let item = state.getIn(["scene", "layers", layerID, "items", itemID]);

    state = state.merge({
      mode: MODE_DRAGGING_ITEM,
      draggingSupport: Map({
        layerID,
        itemID,
        startPointX: x,
        startPointY: y,
        originalX: item.x,
        originalY: item.y,
      }),
    });

    return { updatedState: state };
  }

  static updateDraggingItem(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let { draggingSupport, scene } = state;

    let layerID = draggingSupport.get("layerID");
    let itemID = draggingSupport.get("itemID");
    let startPointX = draggingSupport.get("startPointX");
    let startPointY = draggingSupport.get("startPointY");
    let originalX = draggingSupport.get("originalX");
    let originalY = draggingSupport.get("originalY");

    let diffX = startPointX - x;
    let diffY = startPointY - y;

    let item = scene.getIn(["layers", layerID, "items", itemID]);
    item = item.merge({
      x: originalX - diffX,
      y: originalY - diffY,
    });

    state = state.merge({
      scene: scene.mergeIn(["layers", layerID, "items", itemID], item),
    });

    return { updatedState: state };
  }

  static endDraggingItem(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    state = this.updateDraggingItem(state, x, y).updatedState;
    state = state.merge({ mode: MODE_IDLE });

    return { updatedState: state };
  }

  static beginRotatingItem(state, layerID, itemID, x, y) {
    state = state.merge({
      mode: MODE_ROTATING_ITEM,
      rotatingSupport: Map({
        layerID,
        itemID,
      }),
    });

    return { updatedState: state };
  }

  static updateRotatingItem(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let { rotatingSupport, scene } = state;

    let layerID = rotatingSupport.get("layerID");
    let itemID = rotatingSupport.get("itemID");
    let item = state.getIn(["scene", "layers", layerID, "items", itemID]);

    let deltaX = x - item.x;
    let deltaY = y - item.y;
    let rotation = (Math.atan2(deltaY, deltaX) * 180) / Math.PI - 90;

    if (-5 < rotation && rotation < 5) rotation = 0;
    if (-95 < rotation && rotation < -85) rotation = -90;
    if (-185 < rotation && rotation < -175) rotation = -180;
    if (85 < rotation && rotation < 90) rotation = 90;
    if (-270 < rotation && rotation < -265) rotation = 90;

    item = item.merge({
      rotation,
    });

    state = state.merge({
      scene: scene.mergeIn(["layers", layerID, "items", itemID], item),
    });

    return { updatedState: state };
  }

  static endRotatingItem(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    state = this.updateRotatingItem(state, x, y).updatedState;
    state = state.merge({ mode: MODE_IDLE });

    return { updatedState: state };
  }

  static setProperties(state, layerID, itemID, properties) {
    state = state.mergeIn(
      ["scene", "layers", layerID, "items", itemID, "properties"],
      properties
    );

    return { updatedState: state };
  }

  static setJsProperties(state, layerID, itemID, properties) {
    return this.setProperties(state, layerID, itemID, fromJS(properties));
  }

  static updateProperties(state, layerID, itemID, properties) {
    properties.forEach((v, k) => {
      if (
        state.hasIn([
          "scene",
          "layers",
          layerID,
          "items",
          itemID,
          "properties",
          k,
        ])
      )
        state = state.mergeIn(
          ["scene", "layers", layerID, "items", itemID, "properties", k],
          v
        );
    });

    return { updatedState: state };
  }

  static updateJsProperties(state, layerID, itemID, properties) {
    return this.updateProperties(state, layerID, itemID, fromJS(properties));
  }

  static setAttributes(state, layerID, itemID, itemAttributes) {
    state = state.mergeIn(
      ["scene", "layers", layerID, "items", itemID],
      itemAttributes
    );
    return { updatedState: state };
  }

  static setJsAttributes(state, layerID, itemID, itemAttributes) {
    itemAttributes = fromJS(itemAttributes);
    return this.setAttributes(state, layerID, itemID, itemAttributes);
  }
}

class Line {
  static create(state, layerID, type, x0, y0, x1, y1, properties) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    let lineID = IDBroker.acquireID();

    let { updatedState: stateV0, vertex: v0 } = Vertex.add(
      state,
      layerID,
      x0,
      y0,
      "lines",
      lineID
    );
    let { updatedState: stateV1, vertex: v1 } = Vertex.add(
      stateV0,
      layerID,
      x1,
      y1,
      "lines",
      lineID
    );
    state = stateV1;

    let line = state.catalog.factoryElement(
      type,
      {
        id: lineID,
        name: NameGenerator.generateName(
          "lines",
          state.catalog.getIn(["elements", type, "info", "title"])
        ),
        vertices: new List([v0.id, v1.id]),
        type,
      },
      properties
    );

    state = state.setIn(["scene", "layers", layerID, "lines", lineID], line);

    return { updatedState: state, line };
  }

  static select(state, layerID, lineID) {
    state = Layer.select(state, layerID).updatedState;

    let line = state.getIn(["scene", "layers", layerID, "lines", lineID]);

    state = Layer.selectElement(state, layerID, "lines", lineID).updatedState;
    state = Layer.selectElement(
      state,
      layerID,
      "vertices",
      line.vertices.get(0)
    ).updatedState;
    state = Layer.selectElement(
      state,
      layerID,
      "vertices",
      line.vertices.get(1)
    ).updatedState;

    return { updatedState: state };
  }

  static remove(state, layerID, lineID) {
    let line = state.getIn(["scene", "layers", layerID, "lines", lineID]);

    if (line) {
      const v0 = line.vertices.get(0);
      const v1 = line.vertices.get(1);

      state = this.unselect(state, layerID, lineID).updatedState;
      line.holes.forEach(
        (holeID) => (state = Hole.remove(state, layerID, holeID).updatedState)
      );
      state = Layer.removeElement(state, layerID, "lines", lineID).updatedState;

      line.vertices.forEach(
        (vertexID) =>
          (state = Vertex.remove(
            state,
            layerID,
            vertexID,
            "lines",
            lineID
          ).updatedState)
      );

      state
        .getIn(["scene", "groups"])
        .forEach(
          (group) =>
            (state = Group.removeElement(
              state,
              group.id,
              layerID,
              "lines",
              lineID
            ).updatedState)
        );
    }

    return { updatedState: state };
  }

  static unselect(state, layerID, lineID) {
    let line = state.getIn(["scene", "layers", layerID, "lines", lineID]);

    if (line) {
      state = Layer.unselect(
        state,
        layerID,
        "vertices",
        line.vertices.get(0)
      ).updatedState;
      state = Layer.unselect(
        state,
        layerID,
        "vertices",
        line.vertices.get(1)
      ).updatedState;
      state = Layer.unselect(state, layerID, "lines", lineID).updatedState;
    }

    return { updatedState: state };
  }

  static split(state, layerID, lineID, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let line = state.getIn(["scene", "layers", layerID, "lines", lineID]);
    let v0 = state.getIn([
      "scene",
      "layers",
      layerID,
      "vertices",
      line.vertices.get(0),
    ]);
    let v1 = state.getIn([
      "scene",
      "layers",
      layerID,
      "vertices",
      line.vertices.get(1),
    ]);
    let { x: x0, y: y0 } = v0;
    let { x: x1, y: y1 } = v1;

    let { updatedState: stateL1, line: line0 } = Line.create(
      state,
      layerID,
      line.type,
      x0,
      y0,
      x,
      y,
      line.get("properties")
    );
    let { updatedState: stateL2, line: line1 } = Line.create(
      stateL1,
      layerID,
      line.type,
      x1,
      y1,
      x,
      y,
      line.get("properties")
    );
    state = stateL2;

    let splitPointOffset = GeometryUtils.pointPositionOnLineSegment(
      x0,
      y0,
      x1,
      y1,
      x,
      y
    );
    let minVertex = GeometryUtils.minVertex(v0, v1);

    line.holes.forEach((holeID) => {
      let hole = state.getIn(["scene", "layers", layerID, "holes", holeID]);

      let holeOffset = hole.offset;
      if (minVertex.x === x1 && minVertex.y === y1) {
        splitPointOffset = 1 - splitPointOffset;
        holeOffset = 1 - hole.offset;
      }

      if (holeOffset < splitPointOffset) {
        let offset = holeOffset / splitPointOffset;
        if (minVertex.x === x1 && minVertex.y === y1) {
          offset = 1 - offset;
        }
        state = Hole.create(
          state,
          layerID,
          hole.type,
          line0.id,
          offset,
          hole.properties
        ).updatedState;
      } else {
        let offset = (holeOffset - splitPointOffset) / (1 - splitPointOffset);
        if (minVertex.x === x1 && minVertex.y === y1) {
          offset = 1 - offset;
        }
        state = Hole.create(
          state,
          layerID,
          hole.type,
          line1.id,
          offset,
          hole.properties
        ).updatedState;
      }
    });

    //add splitted lines to the original line's group
    let lineGroups = state.getIn(["scene", "groups"]).filter((group) => {
      const lines = group.getIn(["elements", layerID, "lines"]);
      return lines && lines.contains(lineID);
    });

    lineGroups.forEach((group) => {
      state = Group.addElement(
        state,
        group.id,
        layerID,
        "lines",
        line0.id
      ).updatedState;
      state = Group.addElement(
        state,
        group.id,
        layerID,
        "lines",
        line1.id
      ).updatedState;
    });

    state = Line.remove(state, layerID, lineID).updatedState;

    return { updatedState: state, lines: new List([line0, line1]) };
  }

  static addFromPoints(state, layerID, type, points, properties, holes) {
    points = new List(points).sort(({ x: x1, y: y1 }, { x: x2, y: y2 }) =>
      x1 === x2 ? y1 - y2 : x1 - x2
    );

    let pointsPair = points
      .zip(points.skip(1))
      .filterNot(
        ([{ x: x1, y: y1 }, { x: x2, y: y2 }]) => x1 === x2 && y1 === y2
      );

    let lines = [];

    pointsPair.forEach(([{ x: x1, y: y1 }, { x: x2, y: y2 }]) => {
      x1 = Math.round(x1);
      y1 = Math.round(y1);
      x2 = Math.round(x2);
      y2 = Math.round(y2);

      let { updatedState: stateL, line } = this.create(
        state,
        layerID,
        type,
        x1,
        y1,
        x2,
        y2,
        properties
      );
      state = stateL;

      if (holes) {
        holes.forEach((holeWithOffsetPoint) => {
          let { x: xp, y: yp } = holeWithOffsetPoint.offsetPosition;

          if (GeometryUtils.isPointOnLineSegment(x1, y1, x2, y2, xp, yp)) {
            let newOffset = GeometryUtils.pointPositionOnLineSegment(
              x1,
              y1,
              x2,
              y2,
              xp,
              yp
            );

            if (newOffset >= 0 && newOffset <= 1) {
              state = Hole.create(
                state,
                layerID,
                holeWithOffsetPoint.hole.type,
                line.id,
                newOffset,
                holeWithOffsetPoint.hole.properties
              ).updatedState;
            }
          }
        });
      }

      lines.push(line);
    });

    return { updatedState: state, lines: new List(lines) };
  }

  static createAvoidingIntersections(
    state,
    layerID,
    type,
    x0,
    y0,
    x1,
    y1,
    oldProperties,
    oldHoles
  ) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    let initialPoints = [
      { x: x0, y: y0 },
      { x: x1, y: y1 },
    ];
    let points = [
      { x: x0, y: y0 },
      { x: x1, y: y1 },
    ];

    state = state
      .getIn(["scene", "layers", layerID, "lines"])
      .reduce((reducedState, line) => {
        let [v0, v1] = line.vertices
          .map((vertexID) =>
            reducedState
              .getIn(["scene", "layers", layerID, "vertices"])
              .get(vertexID)
          )
          .toArray();

        let hasCommonEndpoint =
          GeometryUtils.samePoints(v0, initialPoints[0]) ||
          GeometryUtils.samePoints(v0, initialPoints[1]) ||
          GeometryUtils.samePoints(v1, initialPoints[0]) ||
          GeometryUtils.samePoints(v1, initialPoints[1]);

        let intersection = GeometryUtils.twoLineSegmentsIntersection(
          initialPoints[0],
          initialPoints[1],
          v0,
          v1
        );

        if (intersection.type === "colinear") {
          if (!oldHoles) {
            oldHoles = [];
          }

          let orderedVertices = GeometryUtils.orderVertices(initialPoints);

          reducedState
            .getIn(["scene", "layers", layerID, "lines", line.id, "holes"])
            .forEach((holeID) => {
              let hole = reducedState.getIn([
                "scene",
                "layers",
                layerID,
                "holes",
                holeID,
              ]);
              let oldLineLength = GeometryUtils.pointsDistance(
                v0.x,
                v0.y,
                v1.x,
                v1.y
              );
              let offset = GeometryUtils.samePoints(
                orderedVertices[1],
                line.vertices.get(1)
              )
                ? 1 - hole.offset
                : hole.offset;
              let offsetPosition = GeometryUtils.extendLine(
                v0.x,
                v0.y,
                v1.x,
                v1.y,
                oldLineLength * offset
              );

              oldHoles.push({ hole, offsetPosition });
            });

          reducedState = this.remove(
            reducedState,
            layerID,
            line.id
          ).updatedState;

          points.push(v0, v1);
        }

        if (intersection.type === "intersecting" && !hasCommonEndpoint) {
          reducedState = this.split(
            reducedState,
            layerID,
            line.id,
            intersection.point.x,
            intersection.point.y
          ).updatedState;
          points.push(intersection.point);
        }

        return reducedState;
      }, state);

    let { updatedState, lines } = Line.addFromPoints(
      state,
      layerID,
      type,
      points,
      oldProperties,
      oldHoles
    );

    return { updatedState, lines };
  }

  static replaceVertex(state, layerID, lineID, vertexIndex, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let vertexID = state.getIn([
      "scene",
      "layers",
      layerID,
      "lines",
      lineID,
      "vertices",
      vertexIndex,
    ]);

    state = Vertex.remove(
      state,
      layerID,
      vertexID,
      "lines",
      lineID
    ).updatedState;
    let { updatedState: stateV, vertex } = Vertex.add(
      state,
      layerID,
      x,
      y,
      "lines",
      lineID
    );
    state = stateV;

    state = state.setIn(
      ["scene", "layers", layerID, "lines", lineID, "vertices", vertexIndex],
      vertex.id
    );
    state = state.setIn(
      ["scene", "layers", layerID, "lines", lineID],
      state.getIn(["scene", "layers", layerID, "lines", lineID])
    );

    return {
      updatedState: state,
      line: state.getIn(["scene", "layers", layerID, "lines", lineID]),
      vertex,
    };
  }

  static selectToolDrawingLine(state, sceneComponentType) {
    state = state.merge({
      mode: MODE_WAITING_DRAWING_LINE,
      drawingSupport: new Map({
        type: sceneComponentType,
      }),
    });

    return { updatedState: state };
  }

  static beginDrawingLine(state, layerID, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let snapElements = SnapSceneUtils.sceneSnapElements(
      state.scene,
      new List(),
      state.snapMask
    );
    let snap = null;

    if (state.snapMask && !state.snapMask.isEmpty()) {
      snap = SnapUtils.nearestSnap(snapElements, x, y, state.snapMask);
      if (snap) ({ x, y } = snap.point);

      snapElements = snapElements.withMutations((snapElements) => {
        let a, b, c;
        ({ a, b, c } = GeometryUtils.horizontalLine(y));
        SnapUtils.addLineSnap(snapElements, a, b, c, 10, 3, null);
        ({ a, b, c } = GeometryUtils.verticalLine(x));
        SnapUtils.addLineSnap(snapElements, a, b, c, 10, 3, null);
      });
    }

    let drawingSupport = state.get("drawingSupport").set("layerID", layerID);

    state = Layer.unselectAll(state, layerID).updatedState;

    let { updatedState: stateL, line } = Line.create(
      state,
      layerID,
      drawingSupport.get("type"),
      x,
      y,
      x,
      y
    );
    state = Line.select(stateL, layerID, line.id).updatedState;

    state = state.merge({
      mode: MODE_DRAWING_LINE,
      snapElements,
      activeSnapElement: snap ? snap.snap : null,
      drawingSupport,
    });

    return { updatedState: state };
  }

  static updateDrawingLine(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let snap = null;
    if (state.snapMask && !state.snapMask.isEmpty()) {
      snap = SnapUtils.nearestSnap(state.snapElements, x, y, state.snapMask);
      if (snap) ({ x, y } = snap.point);
    }

    let layerID = state.getIn(["drawingSupport", "layerID"]);
    let lineID = state
      .getIn(["scene", "layers", layerID, "selected", "lines"])
      .first();

    let { updatedState: stateLV, vertex } = Line.replaceVertex(
      state,
      layerID,
      lineID,
      1,
      x,
      y
    );
    state = stateLV;

    state = this.select(state, layerID, lineID).updatedState;
    state = state.merge({ activeSnapElement: snap ? snap.snap : null });

    return { updatedState: state };
  }

  static endDrawingLine(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    if (state.snapMask && !state.snapMask.isEmpty()) {
      let snap = SnapUtils.nearestSnap(
        state.snapElements,
        x,
        y,
        state.snapMask
      );
      if (snap) ({ x, y } = snap.point);
    }

    let layerID = state.getIn(["drawingSupport", "layerID"]);
    let layer = state.getIn(["scene", "layers", layerID]);

    let lineID = state
      .getIn(["scene", "layers", layerID, "selected", "lines"])
      .first();
    let line = state.getIn(["scene", "layers", layerID, "lines", lineID]);

    let v0 = layer.vertices.get(line.vertices.get(0));

    state = Layer.removeZeroLengthLines(state, layerID).updatedState;
    // state = Layer.mergeEqualsVertices( state, layerID, v0.id ).updatedState;
    state = Line.remove(state, layerID, lineID).updatedState;
    state = Line.createAvoidingIntersections(
      state,
      layerID,
      line.type,
      v0.x,
      v0.y,
      x,
      y
    ).updatedState;
    state = Layer.detectAndUpdateAreas(state, layerID).updatedState;

    state = state.merge({
      mode: MODE_WAITING_DRAWING_LINE,
      snapElements: new List(),
      activeSnapElement: null,
    });

    return { updatedState: state };
  }

  static beginDraggingLine(state, layerID, lineID, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let snapElements = SnapSceneUtils.sceneSnapElements(
      state.scene,
      new List(),
      state.snapMask
    );

    let layer = state.scene.layers.get(layerID);
    let line = layer.lines.get(lineID);

    let vertex0 = layer.vertices.get(line.vertices.get(0));
    let vertex1 = layer.vertices.get(line.vertices.get(1));

    state = state.merge({
      mode: MODE_DRAGGING_LINE,
      snapElements,
      draggingSupport: Map({
        layerID,
        lineID,
        startPointX: x,
        startPointY: y,
        startVertex0X: vertex0.x,
        startVertex0Y: vertex0.y,
        startVertex1X: vertex1.x,
        startVertex1Y: vertex1.y,
      }),
    });

    return { updatedState: state };
  }

  static updateDraggingLine(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let draggingSupport = state.draggingSupport;
    let snapElements = state.snapElements;

    let layerID = draggingSupport.get("layerID");
    let lineID = draggingSupport.get("lineID");
    let diffX = x - draggingSupport.get("startPointX");
    let diffY = y - draggingSupport.get("startPointY");
    let newVertex0X = draggingSupport.get("startVertex0X") + diffX;
    let newVertex0Y = draggingSupport.get("startVertex0Y") + diffY;
    let newVertex1X = draggingSupport.get("startVertex1X") + diffX;
    let newVertex1Y = draggingSupport.get("startVertex1Y") + diffY;

    let activeSnapElement = null;
    let curSnap0 = null,
      curSnap1 = null;
    if (state.snapMask && !state.snapMask.isEmpty()) {
      curSnap0 = SnapUtils.nearestSnap(
        snapElements,
        newVertex0X,
        newVertex0Y,
        state.snapMask
      );
      curSnap1 = SnapUtils.nearestSnap(
        snapElements,
        newVertex1X,
        newVertex1Y,
        state.snapMask
      );
    }

    let deltaX = 0,
      deltaY = 0;
    if (curSnap0 && curSnap1) {
      if (curSnap0.point.distance < curSnap1.point.distance) {
        deltaX = curSnap0.point.x - newVertex0X;
        deltaY = curSnap0.point.y - newVertex0Y;
        activeSnapElement = curSnap0.snap;
      } else {
        deltaX = curSnap1.point.x - newVertex1X;
        deltaY = curSnap1.point.y - newVertex1Y;
        activeSnapElement = curSnap1.snap;
      }
    } else {
      if (curSnap0) {
        deltaX = curSnap0.point.x - newVertex0X;
        deltaY = curSnap0.point.y - newVertex0Y;
        activeSnapElement = curSnap0.snap;
      }
      if (curSnap1) {
        deltaX = curSnap1.point.x - newVertex1X;
        deltaY = curSnap1.point.y - newVertex1Y;
        activeSnapElement = curSnap1.snap;
      }
    }

    newVertex0X += deltaX;
    newVertex0Y += deltaY;
    newVertex1X += deltaX;
    newVertex1Y += deltaY;

    state = state.merge({
      activeSnapElement,
      scene: state.scene.updateIn(["layers", layerID], (layer) =>
        layer.withMutations((layer) => {
          let lineVertices = layer.getIn(["lines", lineID, "vertices"]);
          layer.updateIn(["vertices", lineVertices.get(0)], (vertex) =>
            vertex.merge({ x: newVertex0X, y: newVertex0Y })
          );
          layer.updateIn(["vertices", lineVertices.get(1)], (vertex) =>
            vertex.merge({ x: newVertex1X, y: newVertex1Y })
          );
          return layer;
        })
      ),
    });

    return { updatedState: state };
  }

  static endDraggingLine(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let { draggingSupport } = state;
    let layerID = draggingSupport.get("layerID");
    let layer = state.scene.layers.get(layerID);
    let lineID = draggingSupport.get("lineID");
    let line = layer.lines.get(lineID);

    let vertex0 = layer.vertices.get(line.vertices.get(0));
    let vertex1 = layer.vertices.get(line.vertices.get(1));

    let maxV = GeometryUtils.maxVertex(vertex0, vertex1);
    let minV = GeometryUtils.minVertex(vertex0, vertex1);

    let lineLength = GeometryUtils.verticesDistance(minV, maxV);
    let alpha = Math.atan2(maxV.y - minV.y, maxV.x - minV.x);

    let holesWithOffsetPosition = [];
    layer.lines.get(lineID).holes.forEach((holeID) => {
      let hole = layer.holes.get(holeID);
      let pointOnLine = lineLength * hole.offset;

      let offsetPosition = {
        x: pointOnLine * Math.cos(alpha) + minV.x,
        y: pointOnLine * Math.sin(alpha) + minV.y,
      };

      holesWithOffsetPosition.push({ hole, offsetPosition });
    });

    let diffX = x - draggingSupport.get("startPointX");
    let diffY = y - draggingSupport.get("startPointY");
    let newVertex0X = draggingSupport.get("startVertex0X") + diffX;
    let newVertex0Y = draggingSupport.get("startVertex0Y") + diffY;
    let newVertex1X = draggingSupport.get("startVertex1X") + diffX;
    let newVertex1Y = draggingSupport.get("startVertex1Y") + diffY;

    if (state.snapMask && !state.snapMask.isEmpty()) {
      let curSnap0 = SnapUtils.nearestSnap(
        state.snapElements,
        newVertex0X,
        newVertex0Y,
        state.snapMask
      );
      let curSnap1 = SnapUtils.nearestSnap(
        state.snapElements,
        newVertex1X,
        newVertex1Y,
        state.snapMask
      );

      let deltaX = 0,
        deltaY = 0;
      if (curSnap0 && curSnap1) {
        if (curSnap0.point.distance < curSnap1.point.distance) {
          deltaX = curSnap0.point.x - newVertex0X;
          deltaY = curSnap0.point.y - newVertex0Y;
        } else {
          deltaX = curSnap1.point.x - newVertex1X;
          deltaY = curSnap1.point.y - newVertex1Y;
        }
      } else {
        if (curSnap0) {
          deltaX = curSnap0.point.x - newVertex0X;
          deltaY = curSnap0.point.y - newVertex0Y;
        }
        if (curSnap1) {
          deltaX = curSnap1.point.x - newVertex1X;
          deltaY = curSnap1.point.y - newVertex1Y;
        }
      }

      newVertex0X += deltaX;
      newVertex0Y += deltaY;
      newVertex1X += deltaX;
      newVertex1Y += deltaY;
    }

    let lineGroups = state //get groups membership if present
      .getIn(["scene", "groups"])
      .filter((group) => {
        const lines = group.getIn(["elements", layerID, "lines"]);
        return lines && lines.contains(lineID);
      });

    state = Layer.mergeEqualsVertices(
      state,
      layerID,
      line.vertices.get(0)
    ).updatedState;
    state = Layer.mergeEqualsVertices(
      state,
      layerID,
      line.vertices.get(1)
    ).updatedState;

    state = Line.remove(state, layerID, lineID).updatedState;

    if (
      !GeometryUtils.samePoints(
        { newVertex0X, newVertex0Y },
        { newVertex1X, newVertex1Y }
      )
    ) {
      let ret = Line.createAvoidingIntersections(
        state,
        layerID,
        line.type,
        newVertex0X,
        newVertex0Y,
        newVertex1X,
        newVertex1Y,
        line.properties,
        holesWithOffsetPosition
      );

      state = ret.updatedState;

      //re-add to old line's groups if present
      ret.lines.forEach((addedLine) => {
        lineGroups.forEach((oldLineGroup) => {
          state = Group.addElement(
            state,
            oldLineGroup.id,
            layerID,
            "lines",
            addedLine.id
          ).updatedState;
        });
      });
    }

    state = Layer.detectAndUpdateAreas(state, layerID).updatedState;

    state = state.merge({
      mode: MODE_IDLE,
      draggingSupport: null,
      activeSnapElement: null,
      snapElements: new List(),
    });

    return { updatedState: state };
  }

  static setProperties(state, layerID, lineID, properties) {
    state = state.mergeIn(
      ["scene", "layers", layerID, "lines", lineID, "properties"],
      properties
    );

    return { updatedState: state };
  }

  static setJsProperties(state, layerID, lineID, properties) {
    return this.setProperties(state, layerID, lineID, fromJS(properties));
  }

  static updateProperties(state, layerID, lineID, properties) {
    properties.forEach((v, k) => {
      if (
        state.hasIn([
          "scene",
          "layers",
          layerID,
          "lines",
          lineID,
          "properties",
          k,
        ])
      )
        state = state.mergeIn(
          ["scene", "layers", layerID, "lines", lineID, "properties", k],
          v
        );
    });

    return { updatedState: state };
  }

  static updateJsProperties(state, layerID, lineID, properties) {
    return this.updateProperties(state, layerID, lineID, fromJS(properties));
  }

  static setAttributes(state, layerID, lineID, lineAttributes) {
    let lAttr = lineAttributes.toJS();
    let { vertexOne, vertexTwo, lineLength } = lAttr;

    delete lAttr["vertexOne"];
    delete lAttr["vertexTwo"];
    delete lAttr["lineLength"];

    state = state
      .mergeIn(["scene", "layers", layerID, "lines", lineID], fromJS(lAttr))
      .mergeIn(["scene", "layers", layerID, "vertices", vertexOne.id], {
        x: vertexOne.x,
        y: vertexOne.y,
      })
      .mergeIn(["scene", "layers", layerID, "vertices", vertexTwo.id], {
        x: vertexTwo.x,
        y: vertexTwo.y,
      })
      .mergeIn(
        ["scene", "layers", layerID, "lines", lineID, "misc"],
        new Map({ _unitLength: lineLength._unit })
      );

    state = Layer.mergeEqualsVertices(
      state,
      layerID,
      vertexOne.id
    ).updatedState;

    if (vertexOne.x !== vertexTwo.x && vertexOne.y !== vertexTwo.y) {
      state = Layer.mergeEqualsVertices(
        state,
        layerID,
        vertexTwo.id
      ).updatedState;
    }

    state = Layer.detectAndUpdateAreas(state, layerID).updatedState;

    return { updatedState: state };
  }

  static setVerticesCoords(state, layerID, lineID, x1, y1, x2, y2) {
    let line = state.getIn(["scene", "layers", layerID, "lines", lineID]);
    state = Vertex.setAttributes(
      state,
      layerID,
      line.vertices.get(0),
      new Map({ x: x1, y: y1 })
    ).updatedState;
    state = Vertex.setAttributes(
      state,
      layerID,
      line.vertices.get(1),
      new Map({ x: x2, y: y2 })
    ).updatedState;

    return { updatedState: state };
  }
}

class Project {
  static setAlterate(state) {
    return { updatedState: state.set("alterate", !state.alterate) };
  }

  static openCatalog(state) {
    state = this.setMode(state, MODE_VIEWING_CATALOG).updatedState;

    return { updatedState: state };
  }

  static newProject(state) {
    state = new State({ viewer2D: state.get("viewer2D") });

    return { updatedState: state };
  }

  static loadProject(state, sceneJSON) {
    state = new State({ scene: sceneJSON, catalog: state.catalog.toJS() });

    return { updatedState: state };
  }

  static setProperties(state, layerID, properties) {
    state = Layer.setPropertiesOnSelected(
      state,
      layerID,
      properties
    ).updatedState;

    return { updatedState: state };
  }

  static updateProperties(state, layerID, properties) {
    state = Layer.updatePropertiesOnSelected(
      state,
      layerID,
      properties
    ).updatedState;

    return { updatedState: state };
  }

  static setItemsAttributes(state, attributes) {
    //TODO apply only to items
    state.getIn(["scene", "layers"]).forEach((layer) => {
      state = Layer.setAttributesOnSelected(
        state,
        layer.id,
        attributes
      ).updatedState;
    });

    return { updatedState: state };
  }

  static setLinesAttributes(state, attributes) {
    //TODO apply only to lines
    state.getIn(["scene", "layers"]).forEach((layer) => {
      state = Layer.setAttributesOnSelected(
        state,
        layer.id,
        attributes
      ).updatedState;
    });

    return { updatedState: state };
  }

  static setHolesAttributes(state, attributes) {
    //TODO apply only to holes
    state.getIn(["scene", "layers"]).forEach((layer) => {
      state = Layer.setAttributesOnSelected(
        state,
        layer.id,
        attributes
      ).updatedState;
    });

    return { updatedState: state };
  }

  static unselectAll(state) {
    state.getIn(["scene", "layers"]).forEach(({ id: layerID }) => {
      state = Layer.unselectAll(state, layerID).updatedState;
    });
    state.getIn(["scene", "groups"]).forEach((group) => {
      state = Group.unselect(state, group.get("id")).updatedState;
    });

    return { updatedState: state };
  }

  static remove(state) {
    let selectedLayer = state.getIn(["scene", "selectedLayer"]);
    let {
      lines: selectedLines,
      holes: selectedHoles,
      items: selectedItems,
    } = state.getIn(["scene", "layers", selectedLayer, "selected"]);

    state = Layer.unselectAll(state, selectedLayer).updatedState;

    selectedLines.forEach((lineID) => {
      state = Line.remove(state, selectedLayer, lineID).updatedState;
    });
    selectedHoles.forEach((holeID) => {
      state = Hole.remove(state, selectedLayer, holeID).updatedState;
    });
    selectedItems.forEach((itemID) => {
      state = Item.remove(state, selectedLayer, itemID).updatedState;
    });

    state = Layer.detectAndUpdateAreas(state, selectedLayer).updatedState;

    return { updatedState: state };
  }

  static undo(state) {
    let sceneHistory = state.sceneHistory;
    if (state.scene === sceneHistory.last && sceneHistory.undoList.size > 1) {
      // Push the current state onto redoList before popping from history
      sceneHistory = history.historyPop(sceneHistory);
    }
    // Update the current state
    state = state.merge({
      mode: MODE_IDLE,
      scene: sceneHistory.last,
      sceneHistory: sceneHistory,
    });

    return { updatedState: state };
  }

  static redo(state) {
    let sceneHistory = state.sceneHistory;
    // Check if we can redo
    if (sceneHistory.redoList && sceneHistory.redoList.size > 0) {
      // Use historyRedo function to handle the redo operation
      sceneHistory = history.historyRedo(sceneHistory);

      // Update the current state
      state = state.merge({
        mode: MODE_IDLE,
        scene: sceneHistory.last,
        sceneHistory: sceneHistory,
      });
    }
    return { updatedState: state };
  }

  static rollback(state) {
    let sceneHistory = state.sceneHistory;

    if (!sceneHistory.last && sceneHistory.undoList.isEmpty()) {
      return { updatedState: state };
    }

    state = this.unselectAll(state).updatedState;

    state = state.merge({
      mode: MODE_IDLE,
      scene: sceneHistory.last,
      sceneHistory: history.historyPush(sceneHistory, sceneHistory.last),
      snapElements: new List(),
      activeSnapElement: null,
      drawingSupport: new Map(),
      draggingSupport: new Map(),
      rotatingSupport: new Map(),
    });

    return { updatedState: state };
  }

  static setProjectProperties(state, properties) {
    let scene = state.scene.merge(properties);
    state = state.merge({
      mode: MODE_IDLE,
      scene,
    });

    return { updatedState: state };
  }

  static openProjectConfigurator(state) {
    state = state.merge({
      mode: MODE_CONFIGURING_PROJECT,
    });

    return { updatedState: state };
  }

  static initCatalog(state, catalog) {
    state = state.set("catalog", new Catalog(catalog));

    return { updatedState: state };
  }

  static updateMouseCoord(state, coords) {
    state = state.set("mouse", new Map(coords));

    return { updatedState: state };
  }

  static updateZoomScale(state, scale) {
    state = state.set("zoom", scale);

    return { updatedState: state };
  }

  static toggleSnap(state, mask) {
    state = state.set("snapMask", mask);
    return { updatedState: state };
  }

  static throwError(state, error) {
    state = state.set(
      "errors",
      state.get("errors").push({
        date: Date.now(),
        error,
      })
    );

    return { updatedState: state };
  }

  static throwWarning(state, warning) {
    state = state.set(
      "warnings",
      state.get("warnings").push({
        date: Date.now(),
        warning,
      })
    );

    return { updatedState: state };
  }

  static copyProperties(state, properties) {
    state = state.set("clipboardProperties", properties);

    return { updatedState: state };
  }

  static pasteProperties(state) {
    state = this.updateProperties(
      state,
      state.getIn(["scene", "selectedLayer"]),
      state.get("clipboardProperties")
    ).updatedState;

    return { updatedState: state };
  }

  static pushLastSelectedCatalogElementToHistory(state, element) {
    let currHistory = state.selectedElementsHistory;

    let previousPosition = currHistory.findIndex(
      (el) => el.name === element.name
    );
    if (previousPosition !== -1) {
      currHistory = currHistory.splice(previousPosition, 1);
    }
    currHistory = currHistory.splice(0, 0, element);

    state = state.set("selectedElementsHistory", currHistory);
    return { updatedState: state };
  }

  static changeCatalogPage(state, oldPage, newPage) {
    state = state
      .setIn(["catalog", "page"], newPage)
      .updateIn(["catalog", "path"], (path) => path.push(oldPage));

    return { updatedState: state };
  }

  static goBackToCatalogPage(state, newPage) {
    let pageIndex = state.catalog.path.findIndex((page) => page === newPage);
    state = state
      .setIn(["catalog", "page"], newPage)
      .updateIn(["catalog", "path"], (path) => path.take(pageIndex));

    return { updatedState: state };
  }

  static setMode(state, mode) {
    state = state.set("mode", mode);
    return { updatedState: state };
  }

  static addHorizontalGuide(state, coordinate) {
    state = HorizontalGuide.create(state, coordinate).updatedState;

    return { updatedState: state };
  }

  static addVerticalGuide(state, coordinate) {
    state = VerticalGuide.create(state, coordinate).updatedState;

    return { updatedState: state };
  }

  static addCircularGuide(state, x, y, radius) {
    console.log("TODO: adding circular guide at", x, y, radius);

    return { updatedState: state };
  }

  static removeHorizontalGuide(state, guideID) {
    state = HorizontalGuide.remove(state, guideID).updatedState;

    return { updatedState: state };
  }

  static removeVerticalGuide(state, guideID) {
    state = VerticalGuide.remove(state, guideID).updatedState;

    return { updatedState: state };
  }

  static removeCircularGuide(state, guideID) {
    console.log("TODO: removing circular guide ", guideID);

    return { updatedState: state };
  }
}

class Vertex {
  static add(state, layerID, x, y, relatedPrototype, relatedID) {
    x = Math.round(x);
    y = Math.round(y);

    let vertex = state
      .getIn(["scene", "layers", layerID, "vertices"])
      .find((vertex) => GeometryUtils.samePoints(vertex, { x, y }));

    if (vertex) {
      vertex = vertex.update(relatedPrototype, (related) =>
        related.push(relatedID)
      );
    } else {
      vertex = new VertexModel({
        id: IDBroker.acquireID(),
        name: "Vertex",
        x,
        y,
        [relatedPrototype]: new List([relatedID]),
      });
    }

    state = state.setIn(
      ["scene", "layers", layerID, "vertices", vertex.id],
      vertex
    );

    return { updatedState: state, vertex };
  }

  static setAttributes(state, layerID, vertexID, vertexAttributes) {
    state = state.mergeIn(
      ["scene", "layers", layerID, "vertices", vertexID],
      vertexAttributes
    );

    return { updatedState: state };
  }

  static addElement(state, layerID, vertexID, elementPrototype, elementID) {
    state = state.updateIn(
      ["scene", "layers", layerID, "vertices", vertexID, elementPrototype],
      (list) => list.push(elementID)
    );
    return { updatedState: state };
  }

  static removeElement(state, layerID, vertexID, elementPrototype, elementID) {
    let elementIndex = state
      .getIn([
        "scene",
        "layers",
        layerID,
        "vertices",
        vertexID,
        elementPrototype,
      ])
      .findIndex((el) => el === elementID);
    if (elementIndex !== -1) {
      state = state.updateIn(
        ["scene", "layers", layerID, "vertices", vertexID, elementPrototype],
        (list) => list.remove(elementIndex)
      );
    }
    return { updatedState: state };
  }

  static select(state, layerID, vertexID) {
    state = state.setIn(
      ["scene", "layers", layerID, "vertices", vertexID, "selected"],
      true
    );
    state = state.updateIn(
      ["scene", "layers", layerID, "selected", "vertices"],
      (elems) => elems.push(vertexID)
    );

    return { updatedState: state };
  }

  static unselect(state, layerID, vertexID) {
    state = state.setIn(
      ["scene", "layers", layerID, "vertices", vertexID, "selected"],
      false
    );
    state = state.updateIn(
      ["scene", "layers", layerID, "selected", "vertices"],
      (elems) => elems.filter((el) => el.id !== vertexID)
    );

    return { updatedState: state };
  }

  static remove(
    state,
    layerID,
    vertexID,
    relatedPrototype,
    relatedID,
    forceRemove
  ) {
    let vertex = state.getIn([
      "scene",
      "layers",
      layerID,
      "vertices",
      vertexID,
    ]);

    if (vertex) {
      if (relatedPrototype && relatedID)
        vertex = vertex.update(relatedPrototype, (related) => {
          let index = related.findIndex((ID) => relatedID === ID);
          return related.delete(index);
        });

      let inUse = vertex.areas.size || vertex.lines.size;

      if (inUse && !forceRemove) {
        state = state.setIn(
          ["scene", "layers", layerID, "vertices", vertexID],
          vertex
        );
      } else {
        state = state.deleteIn([
          "scene",
          "layers",
          layerID,
          "vertices",
          vertexID,
        ]);
      }
    }

    return { updatedState: state };
  }

  static beginDraggingVertex(state, layerID, vertexID, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let snapElements = SnapSceneUtils.sceneSnapElements(
      state.scene,
      new List(),
      state.snapMask
    );

    state = state.merge({
      mode: MODE_DRAGGING_VERTEX,
      snapElements,
      draggingSupport: Map({
        layerID,
        vertexID,
        previousMode: state.get("mode"),
      }),
    });

    return { updatedState: state };
  }

  static updateDraggingVertex(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let { draggingSupport, snapElements, scene } = state;

    let snap = null;
    if (state.snapMask && !state.snapMask.isEmpty()) {
      snap = SnapUtils.nearestSnap(snapElements, x, y, state.snapMask);
      if (snap) ({ x, y } = snap.point);
    }

    let layerID = draggingSupport.get("layerID");
    let vertexID = draggingSupport.get("vertexID");
    state = state.merge({
      activeSnapElement: snap ? snap.snap : null,
      scene: scene.mergeIn(["layers", layerID, "vertices", vertexID], { x, y }),
    });

    return { updatedState: state };
  }

  static endDraggingVertex(state, x, y) {
    x = Math.round(x);
    y = Math.round(y);

    let { draggingSupport } = state;
    let layerID = draggingSupport.get("layerID");
    let vertexID = draggingSupport.get("vertexID");
    let lines = state.getIn([
      "scene",
      "layers",
      layerID,
      "vertices",
      vertexID,
      "lines",
    ]);

    if (lines) {
      state = lines.reduce((reducedState, lineID) => {
        if (!reducedState.getIn(["scene", "layers", layerID, "lines", lineID]))
          return reducedState;

        let v_id0 = reducedState.getIn([
          "scene",
          "layers",
          layerID,
          "lines",
          lineID,
          "vertices",
          0,
        ]);
        let v_id1 = reducedState.getIn([
          "scene",
          "layers",
          layerID,
          "lines",
          lineID,
          "vertices",
          1,
        ]);
        let oldVertexID = v_id0 === vertexID ? v_id1 : v_id0;

        let oldVertex = reducedState.getIn([
          "scene",
          "layers",
          layerID,
          "vertices",
          oldVertexID,
        ]);
        let vertex = reducedState.getIn([
          "scene",
          "layers",
          layerID,
          "vertices",
          vertexID,
        ]);

        let oldHoles = [];

        let orderedVertices = GeometryUtils.orderVertices([oldVertex, vertex]);

        let holes = reducedState
          .getIn(["scene", "layers", layerID, "lines", lineID, "holes"])
          .forEach((holeID) => {
            let hole = reducedState.getIn([
              "scene",
              "layers",
              layerID,
              "holes",
              holeID,
            ]);
            let oldLineLength = GeometryUtils.pointsDistance(
              oldVertex.x,
              oldVertex.y,
              vertex.x,
              vertex.y
            );
            let offset = GeometryUtils.samePoints(
              orderedVertices[1],
              reducedState.getIn([
                "scene",
                "layers",
                layerID,
                "lines",
                lineID,
                "vertices",
                1,
              ])
            )
              ? 1 - hole.offset
              : hole.offset;
            let offsetPosition = GeometryUtils.extendLine(
              oldVertex.x,
              oldVertex.y,
              vertex.x,
              vertex.y,
              oldLineLength * offset
            );

            oldHoles.push({ hole, offsetPosition });
          });

        let lineType = reducedState.getIn([
          "scene",
          "layers",
          layerID,
          "lines",
          lineID,
          "type",
        ]);
        let lineProps = reducedState.getIn([
          "scene",
          "layers",
          layerID,
          "lines",
          lineID,
          "properties",
        ]);
        let lineGroups = reducedState //get groups membership if present
          .getIn(["scene", "groups"])
          .filter((group) => {
            const lines = group.getIn(["elements", layerID, "lines"]);
            return lines && lines.contains(lineID);
          });

        reducedState = Layer.removeZeroLengthLines(
          reducedState,
          layerID
        ).updatedState;
        reducedState = Layer.mergeEqualsVertices(
          reducedState,
          layerID,
          vertexID
        ).updatedState;
        reducedState = Line.remove(reducedState, layerID, lineID).updatedState;

        if (!GeometryUtils.samePoints(oldVertex, vertex)) {
          let ret = Line.createAvoidingIntersections(
            reducedState,
            layerID,
            lineType,
            oldVertex.x,
            oldVertex.y,
            vertex.x,
            vertex.y,
            lineProps,
            oldHoles
          );

          reducedState = ret.updatedState;

          //re-add to old line's groups if present
          ret.lines.forEach((addedLine) => {
            lineGroups.forEach((oldLineGroup) => {
              reducedState = Group.addElement(
                reducedState,
                oldLineGroup.id,
                layerID,
                "lines",
                addedLine.id
              ).updatedState;
            });
          });
        }

        return reducedState;
      }, state);
    }

    state = Layer.detectAndUpdateAreas(state, layerID).updatedState;

    state = state.merge({
      mode: draggingSupport.get("previousMode"),
      draggingSupport: null,
      activeSnapElement: null,
      snapElements: new List(),
    });

    return { updatedState: state };
  }
}

export {
  Layer,
  Area,
  Group,
  VerticalGuide,
  HorizontalGuide,
  CircularGuide,
  Hole,
  Item,
  Line,
  Project,
  Vertex,
};
