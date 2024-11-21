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
  PCFSoftShadowMap,
  LinearMipMapLinearFilter,
  LinearFilter,
  DirectionalLight,
  ACESFilmicToneMapping,
  HemisphereLight,
  SRGBColorSpace,
  ReinhardToneMapping,
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
      logarithmicDepthBuffer: true,
    });

    rendererRef.current = renderer;

    // Improve texture handling
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ReinhardToneMapping;
    renderer.toneMappingExposure = 1.3;

    // Get max anisotropy for better texture quality at angles
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

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
    scene3D.background = new Color(0xf5f5f5);

    renderer.setClearColor(new Color(SharedStyle.COLORS.white));
    renderer.setSize(width, height);

    const planData = parseData(state.scene, actions, catalog);
    planDataRef.current = planData;

    // Apply enhanced material settings
    planData.plan.traverse((node: any) => {
      if (node.material) {
        if (node.material.map) {
          node.material.map.anisotropy =
            renderer.capabilities.getMaxAnisotropy();
          node.material.map.minFilter = LinearMipMapLinearFilter;
          node.material.map.magFilter = LinearFilter;

          // Enhance texture contrast
          node.material.map.encoding = SRGBColorSpace;
          node.material.map.needsUpdate = true;
        }

        // Enhance material settings
        node.material.shadowSide = true;
        node.material.envMapIntensity = 1.0; // Increased from 0.8
        node.material.roughness = 0.8; // Adjust if materials look too glossy
        node.material.metalness = 0.1; // Slight metallic feel for better light interaction
        node.material.needsUpdate = true;
      }
    });
    scene3D.add(planData.plan);
    scene3D.add(planData.grid);

    const aspectRatio = width / height;
    const camera = new PerspectiveCamera(45, width / height, 0.1, 1000000);
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

    const ambientLight = new AmbientLight(0xffffff, 0.7);
    scene3D.add(ambientLight);

    // Warmer hemisphere light
    const hemisphereLight = new HemisphereLight(
      0xffffff, // Sky color
      0xffa07a, // Ground color - warmer tone
      0.5
    );
    scene3D.add(hemisphereLight);

    // Main directional light with increased intensity
    const mainLight = new DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(1, 1.5, 1);
    mainLight.castShadow = true;
    mainLight.shadow.bias = -0.0001;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene3D.add(mainLight);

    // Secondary fill light with warm color
    const fillLight = new DirectionalLight(0xffd700, 0.4); // Golden color for warmth
    fillLight.position.set(-1, 0.5, -1);
    scene3D.add(fillLight);

    // Enhanced spot light
    const spotLight = new SpotLight(0xffffff, 0.6); // Increased intensity
    spotLight.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.2;
    spotLight.decay = 1.2;
    spotLight.distance = 2000;
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
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

    // Configure OrbitControls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControlsRef.current = orbitControls;
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 1000000;
    orbitControls.maxPolarAngle = Math.PI / 1.5;
    orbitControls.update();

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

  return <div className="saturate-[1.5] contrast-125" ref={canvasWrapper} />;
};

export default Viewer3D;
