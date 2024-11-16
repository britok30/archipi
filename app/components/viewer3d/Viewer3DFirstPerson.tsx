"use client";

import React, { useEffect, useRef, useContext } from "react";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  PointLight,
  Color,
  Vector3,
  Vector2,
  Raycaster,
  Object3D,
  MeshBasicMaterial,
  Line,
  BufferGeometry,
  LineBasicMaterial,
  BufferAttribute,
} from "three";
import { parseData, updateScene } from "./scene-creator";
import { disposeScene } from "./three-memory-cleaner";
import { initPointerLock } from "./pointer-lock-navigation";
import {
  firstPersonOnKeyDown,
  firstPersonOnKeyUp,
} from "./libs/first-person-controls";
import * as SharedStyle from "../../styles/shared-style";
import ReactPlannerContext from "../../context/ReactPlannerContext";

type Viewer3DFirstPersonProps = {
  state: any;
  width: number;
  height: number;
};

const Viewer3DFirstPerson: React.FC<Viewer3DFirstPersonProps> = ({
  state,
  width,
  height,
}) => {
  const canvasWrapper = useRef<HTMLDivElement>(null);
  const actions = useContext(ReactPlannerContext);
  const {
    areaActions,
    holesActions,
    itemsActions,
    linesActions,
    projectActions,
    catalog,
  } = actions;

  const rendererRef = useRef<WebGLRenderer>(
    new WebGLRenderer({ preserveDrawingBuffer: true })
  );
  const renderer = rendererRef.current;

  const scene3DRef = useRef<Scene>(new Scene());
  const sceneOnTopRef = useRef<Scene>(new Scene());
  const cameraRef = useRef<PerspectiveCamera>(
    new PerspectiveCamera(45, width / height, 0.1, 300000)
  );
  const planDataRef = useRef<any>(parseData(state.scene, actions, catalog));
  const stopRenderingRef = useRef<boolean>(false);

  useEffect(() => {
    const scene3D = scene3DRef.current;
    const sceneOnTop = sceneOnTopRef.current;
    const camera = cameraRef.current;
    const planData = planDataRef.current;

    // Renderer setup
    renderer.setClearColor(new Color(SharedStyle.COLORS.white));
    renderer.setSize(width, height);
    renderer.autoClear = false;

    // Append renderer to the DOM
    renderer.domElement.style.display = "block";
    canvasWrapper.current?.appendChild(renderer.domElement);

    // Load data
    scene3D.add(planData.plan);

    // Camera setup
    camera.up = new Vector3(0, 1, 0);
    sceneOnTop.add(camera); // Pointer is on the camera, rendered above all

    // Lights
    const ambientLight = new AmbientLight(0xafafaf);
    scene3D.add(ambientLight);

    const pointLight = new PointLight(SharedStyle.COLORS.white, 0.4, 1000);
    scene3D.add(pointLight);

    // Pointer Lock Controls
    const { controls, pointerlockChangeEvent, requestPointerLockEvent } =
      initPointerLock(camera, renderer.domElement);

    // Initial Position
    const humanHeight = 170; // in cm
    const yInitialPosition =
      planData.boundingBox.min.y +
      (planData.boundingBox.min.y - planData.boundingBox.max.y) / 2 +
      humanHeight;

    controls.getObject().position.set(-50, yInitialPosition, -100);
    sceneOnTop.add(controls.getObject());

    // Movement variables
    let prevTime = performance.now();
    const velocity = new Vector3();
    const direction = new Vector3();
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;
    let canJump = false;

    // Event Handlers
    const keyDownEvent = (event: KeyboardEvent) => {
      const moveResult = firstPersonOnKeyDown(
        event,
        moveForward,
        moveLeft,
        moveBackward,
        moveRight,
        canJump,
        velocity
      );
      moveForward = moveResult.moveForward;
      moveLeft = moveResult.moveLeft;
      moveBackward = moveResult.moveBackward;
      moveRight = moveResult.moveRight;
      canJump = moveResult.canJump;
    };

    const keyUpEvent = (event: KeyboardEvent) => {
      const moveResult = firstPersonOnKeyUp(
        event,
        moveForward,
        moveLeft,
        moveBackward,
        moveRight,
        canJump
      );
      moveForward = moveResult.moveForward;
      moveLeft = moveResult.moveLeft;
      moveBackward = moveResult.moveBackward;
      moveRight = moveResult.moveRight;
      canJump = moveResult.canJump;
    };

    const firstPersonMouseDown = (event: MouseEvent) => {
      if (controls.enabled) {
        event.preventDefault();

        const mouseVector = new Vector2(0, 0);
        const raycaster = new Raycaster();

        raycaster.setFromCamera(mouseVector, camera);

        const intersects = raycaster.intersectObjects([planData.plan], true);

        if (intersects.length > 0 && !isNaN(intersects[0].distance)) {
          intersects[0].object.userData.interact &&
            intersects[0].object.userData.interact();
        } else {
          projectActions.unselectAll();
        }
      }
    };

    // Pointer setup
    const pointer = createPointer();
    camera.add(pointer);

    // Event Listeners
    document.addEventListener("keydown", keyDownEvent);
    document.addEventListener("keyup", keyUpEvent);
    document.addEventListener("mousedown", firstPersonMouseDown);
    document.addEventListener("pointerlockchange", pointerlockChangeEvent);
    renderer.domElement.addEventListener("click", requestPointerLockEvent);

    // Render Loop
    const render = () => {
      if (!stopRenderingRef.current) {
        const time = performance.now();
        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // Gravity effect

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        direction.normalize();

        if (moveForward || moveBackward)
          velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.getObject().position.addScaledVector(velocity, delta);

        if (controls.getObject().position.y < yInitialPosition) {
          velocity.y = 0;
          controls.getObject().position.y = yInitialPosition;
          canJump = true;
        }

        prevTime = time;

        // Update point light position
        const controlObjectPosition = controls.getObject().position;
        pointLight.position.copy(controlObjectPosition);

        // Update LODs
        for (const elemID in planData.sceneGraph.LODs) {
          planData.sceneGraph.LODs[elemID].update(camera);
        }

        renderer.clear();
        renderer.render(scene3D, camera);
        renderer.clearDepth();
        renderer.render(sceneOnTop, camera);

        requestAnimationFrame(render);
      }
    };

    render();

    // Cleanup
    return () => {
      stopRenderingRef.current = true;

      renderer.autoClear = true;
      document.removeEventListener("keydown", keyDownEvent);
      document.removeEventListener("keyup", keyUpEvent);
      document.removeEventListener("mousedown", firstPersonMouseDown);
      document.removeEventListener("pointerlockchange", pointerlockChangeEvent);
      renderer.domElement.removeEventListener("click", requestPointerLockEvent);

      disposeScene(scene3D);
      scene3D.remove(planData.plan);
      renderer.renderLists.dispose();
      renderer.dispose();
    };
  }, [actions, catalog, state.scene, width, height]);

  return <div ref={canvasWrapper} />;
};

export default Viewer3DFirstPerson;

// Helper function to create the pointer
function createPointer(): Object3D {
  const pointer = new Object3D();
  pointer.name = "pointer";

  const pointerMaterial = new LineBasicMaterial({
    depthTest: false,
    depthWrite: false,
    color: SharedStyle.COLORS.black,
  });

  const lineGeometry1 = new BufferGeometry().setAttribute(
    "position",
    new BufferAttribute(new Float32Array([-10, 0, 0, 10, 0, 0]), 3)
  );
  const linePointer1 = new Line(lineGeometry1, pointerMaterial);
  linePointer1.position.z -= 100;

  const lineGeometry2 = new BufferGeometry().setAttribute(
    "position",
    new BufferAttribute(new Float32Array([0, 10, 0, 0, -10, 0]), 3)
  );
  const linePointer2 = new Line(lineGeometry2, pointerMaterial);
  linePointer2.position.z -= 100;

  const lineGeometry3 = new BufferGeometry().setAttribute(
    "position",
    new BufferAttribute(
      new Float32Array([-1, 1, 0, 1, 1, 0, 1, -1, 0, -1, -1, 0, -1, 1, 0]),
      3
    )
  );
  const linePointer3 = new Line(lineGeometry3, pointerMaterial);
  linePointer3.position.z -= 100;

  pointer.add(linePointer1, linePointer2, linePointer3);

  return pointer;
}
