"use client";

import React, { useContext, useEffect, useRef } from "react";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Object3D,
  AmbientLight,
  SpotLight,
  Color,
  Vector3,
  Vector2,
  Raycaster,
  Object3DEventMap,
} from "three";
import { parseData, updateScene } from "./scene-creator";
import { disposeScene } from "./three-memory-cleaner";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import diff from "immutablediff";
import * as SharedStyle from "../../styles/shared-style";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { usePrevious } from "@uidotdev/usehooks";

type Scene3DViewerProps = {
  state: any;
  width: number;
  height: number;
};

interface InteractiveObject extends Object3D<Object3DEventMap> {
  interact?: () => void;
  userData: {
    interact?: () => void;
  };
}

const Viewer3D: React.FC<Scene3DViewerProps> = (props) => {
  const previousProps = usePrevious(props);
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const actions = useContext(ReactPlannerContext);
  const { projectActions, catalog } = actions;

  const rendererRef = useRef<WebGLRenderer>();
  const { width, height, state } = props;

  const cameraRef = useRef<PerspectiveCamera>();
  const sceneRef = useRef<Scene>();
  const planDataRef = useRef<any>();
  const orbitControlsRef = useRef<OrbitControls>();
  const renderingIDRef = useRef<number>();
  const lastMousePosition = useRef<{ x?: number; y?: number }>({});

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    if (renderingIDRef.current) {
      cancelAnimationFrame(renderingIDRef.current);
    }
    console.warn("WebGL context lost. Attempting to restore...");
  };

  const handleContextRestored = () => {
    console.log("WebGL context restored. Reinitializing scene...");
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (renderer && scene && camera) {
      renderer.setSize(width, height);
      renderer.setClearColor(new Color(SharedStyle.COLORS.white));
      startRenderLoop();
    }
  };

  const startRenderLoop = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const orbitControls = orbitControlsRef.current;
    const planData = planDataRef.current;

    if (!renderer || !scene || !camera || !orbitControls || !planData) return;

    const render = () => {
      if (!renderer.getContext()) return;

      orbitControls.update();

      const spotLight = scene.children.find(
        (child) => child instanceof SpotLight
      ) as SpotLight;
      const spotLightTarget = scene.getObjectByName("spotLightTarget");

      if (spotLight && spotLightTarget) {
        spotLight.position.copy(camera.position);
        spotLightTarget.position.copy(orbitControls.target);
      }

      camera.updateMatrixWorld();

      if (planData.sceneGraph && planData.sceneGraph.LODs) {
        for (const elemID in planData.sceneGraph.LODs) {
          planData.sceneGraph.LODs[elemID].update(camera);
        }
      }

      renderer.render(scene, camera);
      renderingIDRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const tryInteraction = (object: InteractiveObject): boolean => {
    if (typeof object.interact === "function") {
      object.interact();
      return true;
    }

    if (object.userData && typeof object.userData.interact === "function") {
      object.userData.interact();
      return true;
    }

    let parent = object.parent as InteractiveObject | null;
    while (parent) {
      if (typeof parent.interact === "function") {
        parent.interact();
        return true;
      }
      if (parent.userData && typeof parent.userData.interact === "function") {
        parent.userData.interact();
        return true;
      }
      parent = parent.parent as InteractiveObject | null;
    }

    return false;
  };

  useEffect(() => {
    // Clear existing canvas
    if (canvasWrapper.current) {
      while (canvasWrapper.current.firstChild) {
        canvasWrapper.current.removeChild(canvasWrapper.current.firstChild);
      }
    }

    // Initialize renderer
    const renderer = new WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    rendererRef.current = renderer;

    renderer.domElement.addEventListener(
      "webglcontextlost",
      handleContextLost,
      false
    );
    renderer.domElement.addEventListener(
      "webglcontextrestored",
      handleContextRestored,
      false
    );

    const scene3D = new Scene();
    sceneRef.current = scene3D;

    renderer.setClearColor(new Color(SharedStyle.COLORS.white));
    renderer.setSize(width, height);

    const planData = parseData(state.scene, actions, catalog);
    planDataRef.current = planData;

    scene3D.add(planData.plan);
    scene3D.add(planData.grid);

    const aspectRatio = width / height;
    const camera = new PerspectiveCamera(45, aspectRatio, 1, 300000);
    cameraRef.current = camera;
    scene3D.add(camera);

    const cameraPositionX =
      -(planData.boundingBox.max.x - planData.boundingBox.min.x) / 2;
    const cameraPositionY =
      ((planData.boundingBox.max.y - planData.boundingBox.min.y) / 2) * 10;
    const cameraPositionZ =
      (planData.boundingBox.max.z - planData.boundingBox.min.z) / 2;

    camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
    camera.up = new Vector3(0, 1, 0);

    const ambientLight = new AmbientLight(0xafafaf, Math.PI);
    scene3D.add(ambientLight);

    const spotLight = new SpotLight(SharedStyle.COLORS.white, 0.3);
    spotLight.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
    scene3D.add(spotLight);

    const toIntersect = [planData.plan];
    const mouse = new Vector2();
    const raycaster = new Raycaster();

    const handleMouseDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      lastMousePosition.current = { x, y };
    };

    const handleMouseUp = (event: MouseEvent) => {
      event.preventDefault();
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const lastMousePos = lastMousePosition.current;
      if (
        lastMousePos.x !== undefined &&
        lastMousePos.y !== undefined &&
        Math.abs(mouse.x - lastMousePos.x) <= 0.02 &&
        Math.abs(mouse.y - lastMousePos.y) <= 0.02
      ) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(toIntersect, true);

        if (intersects.length > 0 && !isNaN(intersects[0].distance)) {
          const object = intersects[0].object as InteractiveObject;
          const interactionFound = tryInteraction(object);

          if (!interactionFound) {
            projectActions.unselectAll();
          }
        } else {
          projectActions.unselectAll();
        }
      }
    };

    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    renderer.domElement.addEventListener("mouseup", handleMouseUp);
    renderer.domElement.style.display = "block";

    // Add renderer to DOM
    if (canvasWrapper.current) {
      canvasWrapper.current.appendChild(renderer.domElement);
    }

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControlsRef.current = orbitControls;

    const spotLightTarget = new Object3D();
    spotLightTarget.name = "spotLightTarget";
    spotLightTarget.position.copy(orbitControls.target);
    scene3D.add(spotLightTarget);
    spotLight.target = spotLightTarget;

    startRenderLoop();

    // Cleanup function
    return () => {
      if (renderingIDRef.current !== undefined) {
        cancelAnimationFrame(renderingIDRef.current);
      }

      if (orbitControls) {
        orbitControls.dispose();
      }

      renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      renderer.domElement.removeEventListener("mouseup", handleMouseUp);
      renderer.domElement.removeEventListener(
        "webglcontextlost",
        handleContextLost
      );
      renderer.domElement.removeEventListener(
        "webglcontextrestored",
        handleContextRestored
      );

      // Remove canvas from DOM
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      disposeScene(scene3D);
      scene3D.remove(planData.plan);
      scene3D.remove(planData.grid);

      renderer.renderLists.dispose();
      renderer.dispose();

      // Clear refs
      rendererRef.current = undefined;
      sceneRef.current = undefined;
      cameraRef.current = undefined;
      planDataRef.current = undefined;
      orbitControlsRef.current = undefined;
      renderingIDRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const planData = planDataRef.current;

    if (
      camera &&
      renderer &&
      (props.width !== previousProps?.width ||
        props.height !== previousProps?.height)
    ) {
      camera.aspect = props.width / props.height;
      camera.updateProjectionMatrix();
      renderer.setSize(props.width, props.height);
    }

    if (previousProps && props.state.scene !== previousProps.state.scene) {
      const changedValues = diff(previousProps.state.scene, props.state.scene);
      updateScene(
        planData,
        props.state.scene,
        previousProps.state.scene,
        changedValues.toJS(),
        actions,
        catalog
      );
    }
  }, [props.width, props.height, props.state.scene]);

  return <div className="saturate-[1.8] contrast-125" ref={canvasWrapper} />;
};

export default Viewer3D;
