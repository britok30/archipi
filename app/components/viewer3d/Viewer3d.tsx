"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  SoftShadows,
  useHelper,
} from "@react-three/drei";
import { Vector2, Raycaster, Object3D } from "three";
import { parseData, updateScene } from "./scene-creator";
import diff from "immutablediff";
import ReactPlannerContext from "../../context/ReactPlannerContext";
import { usePrevious } from "@uidotdev/usehooks";

type Scene3DViewerProps = {
  state: any;
  width: number;
  height: number;
};

const Scene = ({ state, planData, projectActions }) => {
  const { scene, camera } = useThree();
  const spotLightRef = useRef(null);
  const directionalLightRef = useRef(null);
  const fillLightRef = useRef(null);
  // Initialize the spotlight target to avoid null references
  const spotLightTargetRef = useRef<Object3D>(new Object3D());

  // Ensure the spotlight target is added to the scene
  useEffect(() => {
    scene.add(spotLightTargetRef.current);
    return () => {
      scene.remove(spotLightTargetRef.current);
    };
  }, [scene]);

  useEffect(() => {
    // Enhance materials for the plan objects
    planData.plan.traverse((node: any) => {
      if (node.material) {
        if (node.material.map) {
          node.material.map.anisotropy = 16;
          node.material.map.needsUpdate = true;
        }
        node.material.shadowSide = true;
        node.material.envMapIntensity = 1.0;
        node.material.roughness = 0.8;
        node.material.metalness = 0.1;
        node.material.needsUpdate = true;
      }
    });

    scene.add(planData.plan);
    scene.add(planData.grid);

    return () => {
      scene.remove(planData.plan);
      scene.remove(planData.grid);
    };
  }, [planData, scene]);

  // Update spotlight position to follow the camera
  useFrame(({ camera }) => {
    if (spotLightRef.current) {
      spotLightRef.current.position.copy(camera.position);
    }
  });

  return (
    <>
      <SoftShadows size={2.5} samples={16} focus={0.5} />

      {/* Lighting Setup */}
      <ambientLight intensity={0.7} />
      <hemisphereLight args={[0xffffff, 0xffa07a, 0.5]} />

      <directionalLight
        ref={directionalLightRef}
        position={[1, 1.5, 1]}
        intensity={1.0}
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      <directionalLight
        ref={fillLightRef}
        position={[-1, 0.5, -1]}
        intensity={0.4}
        color={0xffd700}
      />

      <spotLight
        ref={spotLightRef}
        intensity={0.6}
        angle={Math.PI / 4}
        penumbra={0.2}
        decay={1.2}
        distance={2000}
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
        target={spotLightTargetRef.current}
      />

      {/* Environment */}
      <Environment preset="city" />
    </>
  );
};

const InteractionHandler = ({ projectActions, toIntersect }) => {
  const { camera, gl } = useThree();
  const raycaster = useRef(new Raycaster());
  const lastPointerPosition = useRef({ x: null, y: null });
  const clickThreshold = 2; // in pixels

  const handlePointerDown = (event: PointerEvent) => {
    lastPointerPosition.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerUp = (event: PointerEvent) => {
    const { x: startX, y: startY } = lastPointerPosition.current;
    if (startX === null || startY === null) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) > clickThreshold || Math.abs(dy) > clickThreshold) return;

    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.current.setFromCamera(mouse, camera);
    const intersects = raycaster.current.intersectObjects(toIntersect, true);
    if (intersects.length > 0 && !isNaN(intersects[0].distance)) {
      let object = intersects[0].object;
      let interactionFound = false;
      while (object) {
        if (object.interact && typeof object.interact === "function") {
          object.interact();
          interactionFound = true;
          break;
        }
        if (
          object.userData &&
          object.userData.interact &&
          typeof object.userData.interact === "function"
        ) {
          object.userData.interact();
          interactionFound = true;
          break;
        }
        object = object.parent;
      }
      if (!interactionFound) {
        projectActions.unselectAll();
      }
    } else {
      projectActions.unselectAll();
    }
  };

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
    };
  }, [camera, gl, projectActions]);

  return null;
};

const Viewer3D: React.FC<Scene3DViewerProps> = (props) => {
  const previousProps = usePrevious(props);
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const actions = useContext(ReactPlannerContext);
  const { projectActions, catalog } = actions;
  const [planData, setPlanData] = useState(null);
  const { width, height, state } = props;

  useEffect(() => {
    const data = parseData(state.scene, actions, catalog);
    setPlanData(data);
  }, [state.scene, actions, catalog]);

  useEffect(() => {
    if (
      previousProps &&
      planData &&
      props.state.scene !== previousProps.state.scene
    ) {
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
  }, [
    props.state.scene,
    previousProps?.state.scene,
    planData,
    actions,
    catalog,
  ]);

  if (!planData) return null;

  const { boundingBox } = planData;
  const cameraPosition = [
    -(boundingBox.max.x - boundingBox.min.x) / 2,
    ((boundingBox.max.y - boundingBox.min.y) / 2) * 10,
    (boundingBox.max.z - boundingBox.min.z) / 2,
  ];

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
      >
        <Scene
          state={state}
          planData={planData}
          projectActions={projectActions}
        />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={1000000}
          maxPolarAngle={Math.PI / 1.5}
        />
        <InteractionHandler
          projectActions={projectActions}
          toIntersect={[planData.plan]}
        />
      </Canvas>
    </div>
  );
};

export default Viewer3D;
