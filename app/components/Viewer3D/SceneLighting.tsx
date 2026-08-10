"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { Object3D, Vector3 } from "three";
import { usePlannerStore } from "../../store";

const SceneLighting: React.FC = () => {
  const { scene: threeScene } = useThree();
  const spotLightRef = useRef<any>(null);
  const spotLightTargetRef = useRef<Object3D>(new Object3D());
  const dirLightTargetRef = useRef<Object3D>(new Object3D());
  const cameraDirectionRef = useRef(new Vector3());

  const sceneWidth = usePlannerStore((state) => state.scene.width);
  const sceneHeight = usePlannerStore((state) => state.scene.height);

  // Scene center in 3D coords: elements span x=[0..width], z=[0..-height]
  const centerX = sceneWidth / 2;
  const centerZ = -sceneHeight / 2;
  // Radius that comfortably covers the whole plan
  const radius = Math.max(sceneWidth, sceneHeight) * 0.75;

  useEffect(() => {
    const spotTarget = spotLightTargetRef.current;
    const dirTarget = dirLightTargetRef.current;
    dirTarget.position.set(centerX, 0, centerZ);
    dirTarget.updateMatrixWorld();
    threeScene.add(spotTarget, dirTarget);
    return () => {
      threeScene.remove(spotTarget, dirTarget);
    };
  }, [threeScene, centerX, centerZ]);

  useFrame(({ camera }) => {
    if (spotLightRef.current) {
      spotLightRef.current.position.copy(camera.position);
      // Aim the spotlight along the camera's view direction
      const direction = cameraDirectionRef.current;
      camera.getWorldDirection(direction);
      spotLightTargetRef.current.position
        .copy(camera.position)
        .addScaledVector(direction, 100);
      spotLightTargetRef.current.updateMatrixWorld();
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <hemisphereLight args={[0xffffff, 0xffa07a, 0.3]} />

      <directionalLight
        position={[centerX + radius * 0.6, radius, centerZ + radius * 0.6]}
        target={dirLightTargetRef.current}
        intensity={1.4}
        castShadow
        shadow-bias={-0.0001}
        shadow-radius={2.5}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-radius}
        shadow-camera-right={radius}
        shadow-camera-top={radius}
        shadow-camera-bottom={-radius}
        shadow-camera-near={0.1}
        shadow-camera-far={radius * 4}
      />

      <directionalLight
        position={[centerX - radius * 0.6, radius * 0.5, centerZ - radius * 0.6]}
        target={dirLightTargetRef.current}
        intensity={0.3}
        color={0xffd700}
      />

      <spotLight
        ref={spotLightRef}
        intensity={0.5}
        angle={Math.PI / 4}
        penumbra={0.2}
        decay={1.2}
        distance={2000}
        castShadow={false}
        target={spotLightTargetRef.current}
      />

      {/* No <Environment> IBL: drei presets fetch an HDR from a third-party
          CDN and suspend the entire Canvas until it arrives — on slow or
          blocked networks the 3D view stays black indefinitely. The light rig
          above is tuned to carry the scene on its own. */}
    </>
  );
};

export default SceneLighting;
