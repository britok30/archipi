"use client";

import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, SoftShadows } from "@react-three/drei";
import { Object3D } from "three";

const SceneLighting: React.FC = () => {
  const { scene: threeScene } = useThree();
  const spotLightRef = useRef<any>(null);
  const spotLightTargetRef = useRef<Object3D>(new Object3D());

  useEffect(() => {
    threeScene.add(spotLightTargetRef.current);
    return () => {
      threeScene.remove(spotLightTargetRef.current);
    };
  }, [threeScene]);

  useFrame(({ camera }) => {
    if (spotLightRef.current) {
      spotLightRef.current.position.copy(camera.position);
    }
  });

  return (
    <>
      <SoftShadows size={2.5} samples={16} focus={0.5} />

      <ambientLight intensity={0.7} />
      <hemisphereLight args={[0xffffff, 0xffa07a, 0.5]} />

      <directionalLight
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

      <Environment preset="city" />
    </>
  );
};

export default SceneLighting;
