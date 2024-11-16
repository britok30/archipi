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

const Viewer3D: React.FC<Scene3DViewerProps> = (props) => {
  const previousProps = usePrevious(props);
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const actions = useContext(ReactPlannerContext);
  const { projectActions, catalog } = actions;

  const rendererRef = useRef<WebGLRenderer>(
    new WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
      powerPreference: "high-performance",
    })
  );
  const renderer = rendererRef.current;

  const { width, height, state } = props;

  const cameraRef = useRef<PerspectiveCamera>();
  const sceneRef = useRef<Scene>();
  const planDataRef = useRef<any>();
  const orbitControlsRef = useRef<OrbitControls>();
  const renderingIDRef = useRef<number>();
  const lastMousePosition = useRef<{ x?: number; y?: number }>({});
  const mouseDownEventRef = useRef<(event: MouseEvent) => void>();
  const mouseUpEventRef = useRef<(event: MouseEvent) => void>();

  useEffect(() => {
    const scene3D = new Scene();
    sceneRef.current = scene3D;

    // Renderer
    renderer.setClearColor(new Color(SharedStyle.COLORS.white));
    renderer.setSize(width, height);

    // Load Data
    const planData = parseData(state.scene, actions, catalog);
    planDataRef.current = planData;

    scene3D.add(planData.plan);
    scene3D.add(planData.grid);

    const aspectRatio = width / height;
    const camera = new PerspectiveCamera(45, aspectRatio, 300, 300000);
    cameraRef.current = camera;
    scene3D.add(camera);

    // Set Camera Position
    const cameraPositionX =
      -(planData.boundingBox.max.x - planData.boundingBox.min.x) / 2;
    const cameraPositionY =
      ((planData.boundingBox.max.y - planData.boundingBox.min.y) / 2) * 10;
    const cameraPositionZ =
      (planData.boundingBox.max.z - planData.boundingBox.min.z) / 2;

    camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
    camera.up = new Vector3(0, 1, 0);

    // Lights
    const ambientLight = new AmbientLight(0xafafaf, Math.PI);
    scene3D.add(ambientLight);

    const spotLight = new SpotLight(SharedStyle.COLORS.white, 0.3);
    spotLight.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
    scene3D.add(spotLight);

    // Object Picking
    const toIntersect = [planData.plan];
    const mouse = new Vector2();
    const raycaster = new Raycaster();

    // Mouse Events
    const mouseDownEvent = (event: MouseEvent) => {
      const rect = (event.target as Element).getBoundingClientRect();
      const x = ((event.clientX - rect.left) / width) * 2 - 1;
      const y = -((event.clientY - rect.top) / height) * 2 + 1;
      lastMousePosition.current = { x, y };
    };

    const mouseUpEvent = (event: MouseEvent) => {
      event.preventDefault();
      const rect = (event.target as Element).getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;

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
          intersects[0].object.userData.interact &&
            intersects[0].object.userData.interact();
        } else {
          projectActions.unselectAll();
        }
      }
    };

    mouseDownEventRef.current = mouseDownEvent;
    mouseUpEventRef.current = mouseUpEvent;

    renderer.domElement.addEventListener("mousedown", mouseDownEvent);
    renderer.domElement.addEventListener("mouseup", mouseUpEvent);
    renderer.domElement.style.display = "block";

    canvasWrapper.current?.appendChild(renderer.domElement);

    // Orbit Controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControlsRef.current = orbitControls;

    const spotLightTarget = new Object3D();
    spotLightTarget.name = "spotLightTarget";
    spotLightTarget.position.copy(orbitControls.target);
    scene3D.add(spotLightTarget);
    spotLight.target = spotLightTarget;

    const render = () => {
      orbitControls.update();
      spotLight.position.copy(camera.position);
      spotLightTarget.position.copy(orbitControls.target);

      camera.updateMatrixWorld();

      for (const elemID in planData.sceneGraph.LODs) {
        planData.sceneGraph.LODs[elemID].update(camera);
      }

      renderer.render(scene3D, camera);
      renderingIDRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (renderingIDRef.current !== undefined) {
        cancelAnimationFrame(renderingIDRef.current);
      }
      orbitControls.dispose();

      renderer.domElement.removeEventListener("mousedown", mouseDownEvent);
      renderer.domElement.removeEventListener("mouseup", mouseUpEvent);

      disposeScene(scene3D);
      scene3D.remove(planData.plan);
      scene3D.remove(planData.grid);

      renderer.renderLists.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const planData = planDataRef.current;

    if (
      camera &&
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
