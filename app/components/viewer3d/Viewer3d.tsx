"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  SoftShadows,
} from "@react-three/drei";
import { Vector2, Raycaster, Object3D, Object3DEventMap } from "three";
import { parseData } from "./scene-creator";
import { usePlannerStore } from "../../store";
import { useCatalogContext } from "../../context/ReactPlannerContext";

type Scene3DViewerProps = {
  width: number;
  height: number;
};

interface InteractiveObject extends Object3D<Object3DEventMap> {
  interact?: () => void;
  userData: {
    interact?: () => void;
    [key: string]: any;
  };
}

const Scene = ({ planData }: { planData: any }) => {
  const { scene: threeScene } = useThree();
  const spotLightRef = useRef<any>(null);
  const directionalLightRef = useRef<any>(null);
  const fillLightRef = useRef<any>(null);
  // Initialize the spotlight target to avoid null references
  const spotLightTargetRef = useRef<Object3D>(new Object3D());

  // Ensure the spotlight target is added to the scene
  useEffect(() => {
    threeScene.add(spotLightTargetRef.current);
    return () => {
      threeScene.remove(spotLightTargetRef.current);
    };
  }, [threeScene]);

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

    threeScene.add(planData.plan);
    threeScene.add(planData.grid);

    return () => {
      threeScene.remove(planData.plan);
      threeScene.remove(planData.grid);
    };
  }, [planData, threeScene]);

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

const InteractionHandler = ({ toIntersect }: { toIntersect: Object3D[] }) => {
  const { camera, gl } = useThree();
  const unselectAll = usePlannerStore((state) => state.unselectAll);
  const raycaster = useRef(new Raycaster());
  const lastPointerPosition = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const clickThreshold = 2; // in pixels

  useEffect(() => {
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
        // Cast the intersected object to InteractiveObject
        let object = intersects[0].object as InteractiveObject;
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
          object = object.parent as InteractiveObject;
        }
        if (!interactionFound) {
          unselectAll();
        }
      } else {
        unselectAll();
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
    };
  }, [camera, gl, unselectAll, toIntersect]);

  return null;
};

const Viewer3D: React.FC<Scene3DViewerProps> = ({ width, height }) => {
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const { catalog } = useCatalogContext();
  const scene = usePlannerStore((state) => state.scene);
  const [planData, setPlanData] = useState<any>(null);

  const actions = {
    selectLine: usePlannerStore.getState().selectLine,
    selectHole: usePlannerStore.getState().selectHole,
    selectItem: usePlannerStore.getState().selectItem,
    selectArea: usePlannerStore.getState().selectArea,
  };

  useEffect(() => {
    if (catalog) {
      const data = parseData(scene, actions, catalog);
      setPlanData(data);
    }
  }, [scene, catalog]);

  if (!planData) return null;

  const { boundingBox } = planData;
  const cameraPosition: [number, number, number] = [
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
        <Scene planData={planData} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={1000000}
          maxPolarAngle={Math.PI / 1.5}
        />
        <InteractionHandler toIntersect={[planData.plan]} />
      </Canvas>
    </div>
  );
};

export default Viewer3D;
