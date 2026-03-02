// "use client";

// import React, { useEffect, useRef, useContext, useCallback } from "react";
// import {
//   WebGLRenderer,
//   Scene,
//   PerspectiveCamera,
//   AmbientLight,
//   Color,
//   Vector3,
//   DirectionalLight,
//   Box3,
//   HemisphereLight,
//   SRGBColorSpace,
//   PCFSoftShadowMap,
//   ReinhardToneMapping,
//   GridHelper,
//   Vector2,
//   MeshBasicMaterial,
//   BoxGeometry,
//   Mesh,
//   Object3D,
//   LineBasicMaterial,
//   BufferGeometry,
//   Line,
//   Raycaster,
// } from "three";
// import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
// import { parseData } from "./scene-creator"; // Ensure correct path
// import { disposeScene } from "./three-memory-cleaner"; // Ensure correct path
// import ReactPlannerContext from "../../context/ReactPlannerContext";

// type Viewer3DFirstPersonProps = {
//   state: any;
//   width: number;
//   height: number;
// };

// const Viewer3DFirstPerson: React.FC<Viewer3DFirstPersonProps> = ({
//   state,
//   width,
//   height,
// }) => {
//   // Refs for Three.js objects
//   const canvasWrapperRef = useRef<HTMLDivElement>(null);
//   const rendererRef = useRef<WebGLRenderer | null>(null);
//   const scene3DRef = useRef<Scene | null>(null);
//   const sceneOnTopRef = useRef<Scene | null>(null);
//   const cameraRef = useRef<PerspectiveCamera | null>(null);
//   const controlsRef = useRef<PointerLockControls | null>(null);
//   const animationFrameRef = useRef<number | null>(null);
//   const boundingBoxRef = useRef<Box3 | null>(null);
//   const pointerRef = useRef<Object3D | null>(null);
//   const planDataRef = useRef<any>(null);

//   // Context and actions
//   const actions = useContext(ReactPlannerContext);
//   const { catalog } = actions;

//   // Movement state refs
//   const moveForwardRef = useRef<boolean>(false);
//   const moveBackwardRef = useRef<boolean>(false);
//   const moveLeftRef = useRef<boolean>(false);
//   const moveRightRef = useRef<boolean>(false);
//   const canJumpRef = useRef<boolean>(false);
//   const velocityRef = useRef<Vector3>(new Vector3());
//   const directionRef = useRef<Vector3>(new Vector3());

//   // Movement speed settings
//   const MOVE_SPEED = 10; // Adjust as needed
//   const JUMP_FORCE = 10;
//   const eyeHeight = 1.7; // Human eye height in meters

//   // Initialize Three.js scenes and renderer
//   useEffect(() => {
//     // Initialize Scenes
//     const scene3D = new Scene();
//     scene3DRef.current = scene3D;
//     scene3D.background = new Color(0xf5f5f5); // Light background

//     const sceneOnTop = new Scene();
//     sceneOnTopRef.current = sceneOnTop;

//     // Add Grid Helper to scene3D
//     const grid = new GridHelper(100, 100, 0x888888, 0x888888);
//     scene3D.add(grid);

//     // Initialize Renderer
//     const renderer = new WebGLRenderer({
//       antialias: true,
//       powerPreference: "high-performance",
//       alpha: true, // Allow transparency for overlays
//     });
//     rendererRef.current = renderer;
//     renderer.setSize(width, height);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type = PCFSoftShadowMap;
//     renderer.outputColorSpace = SRGBColorSpace;
//     renderer.toneMapping = ReinhardToneMapping;
//     renderer.toneMappingExposure = 1.3;

//     // Append Renderer to DOM
//     if (canvasWrapperRef.current) {
//       canvasWrapperRef.current.innerHTML = "";
//       canvasWrapperRef.current.appendChild(renderer.domElement);
//     }

//     // Parse Scene Data and Add to scene3D
//     const planData = parseData(state.scene, actions, catalog);
//     planDataRef.current = planData;

//     if (planData && planData.plan) {
//       scene3D.add(planData.plan);
//     } else {
//       console.warn(
//         "parseData did not return a valid plan. Adding default cube for debugging."
//       );

//       // Add a Default Cube for Debugging
//       const geometry = new BoxGeometry(1, 1, 1);
//       const material = new MeshBasicMaterial({ color: 0x00ff00 });
//       const cube = new Mesh(geometry, material);
//       scene3D.add(cube);
//     }

//     // Calculate Scene Bounds
//     const boundingBox = new Box3().setFromObject(planData?.plan || scene3D);
//     boundingBoxRef.current = boundingBox;
//     const center = boundingBox.getCenter(new Vector3());
//     const size = boundingBox.getSize(new Vector3());

//     // Initialize Camera
//     const camera = new PerspectiveCamera(70, width / height, 0.1, 1000);
//     cameraRef.current = camera;

//     // Initialize PointerLockControls
//     const controls = new PointerLockControls(camera, renderer.domElement);
//     controlsRef.current = controls;

//     // Position Camera at a Starting Point
//     camera.position.set(
//       center.x,
//       boundingBox.min.y + eyeHeight,
//       center.z + (size.z / 2 || 5) // Default to 5 if size.z is 0
//     );
//     camera.lookAt(center); // Ensure camera looks at the center

//     // Add Lighting to scene3D
//     const ambientLight = new AmbientLight(0xffffff, 0.7);
//     scene3D.add(ambientLight);

//     const hemisphereLight = new HemisphereLight(0xffffff, 0xffa07a, 0.5);
//     scene3D.add(hemisphereLight);

//     const mainLight = new DirectionalLight(0xffffff, 1.0);
//     mainLight.position.set(1, 1.5, 1);
//     mainLight.castShadow = true;
//     mainLight.shadow.mapSize.set(2048, 2048);
//     mainLight.shadow.bias = -0.0001;
//     mainLight.name = "mainLight"; // Assign a name for easy access
//     scene3D.add(mainLight);

//     const fillLight = new DirectionalLight(0xffd700, 0.4);
//     fillLight.position.set(-1, 0.5, -1);
//     fillLight.name = "fillLight"; // Assign a name for easy access
//     scene3D.add(fillLight);

//     // Add Pointer (Crosshair) to the Camera
//     const pointer = new Object3D();
//     pointer.name = "pointer";

//     // Create materials for pointer lines
//     const pointerMaterial = new LineBasicMaterial({
//       depthTest: false,
//       depthWrite: false,
//       color: 0x000000,
//     });

//     // Horizontal Line
//     const points1 = [new Vector3(-10, 0, 0), new Vector3(10, 0, 0)];
//     const pointerGeometry1 = new BufferGeometry().setFromPoints(points1);
//     const linePointer1 = new Line(pointerGeometry1, pointerMaterial);

//     // Vertical Line
//     const points2 = [new Vector3(0, 10, 0), new Vector3(0, -10, 0)];
//     const pointerGeometry2 = new BufferGeometry().setFromPoints(points2);
//     const linePointer2 = new Line(pointerGeometry2, pointerMaterial);

//     // Square Pointer
//     const points3 = [
//       new Vector3(-1, 1, 0),
//       new Vector3(1, 1, 0),
//       new Vector3(1, -1, 0),
//       new Vector3(-1, -1, 0),
//       new Vector3(-1, 1, 0),
//     ];
//     const pointerGeometry3 = new BufferGeometry().setFromPoints(points3);
//     const linePointer3 = new Line(pointerGeometry3, pointerMaterial);

//     // Add Lines to Pointer Object
//     pointer.add(linePointer1);
//     pointer.add(linePointer2);
//     pointer.add(linePointer3);

//     // Add Pointer to Camera
//     camera.add(pointer);
//     pointerRef.current = pointer;

//     // Function to Handle Mouse Down (Object Picking)
//     const handleMouseDown = (event: MouseEvent) => {
//       if (controls.isLocked) {
//         event.preventDefault();

//         // Set up Raycaster
//         const raycaster = new Raycaster();
//         const mouse = new Vector2(0, 0); // Since we're using pointer lock, mouse vector is centered
//         raycaster.setFromCamera(mouse, camera);

//         // Define objects to intersect
//         const toIntersect = [planDataRef.current?.plan].filter(
//           Boolean
//         ) as Object3D[];

//         const intersects = raycaster.intersectObjects(toIntersect, true);

//         if (intersects.length > 0 && !isNaN(intersects[0].distance)) {
//           const intersectedObject = intersects[0].object as any;
//           if (
//             intersectedObject.interact &&
//             typeof intersectedObject.interact === "function"
//           ) {
//             intersectedObject.interact();
//           }
//         } else {
//           actions.projectActions.unselectAll();
//         }
//       }
//     };

//     // Add Mouse Down Event Listener
//     renderer.domElement.addEventListener("mousedown", handleMouseDown, false);

//     // Initialize Pointer Lock on Click
//     const handleClick = () => {
//       controls.lock();
//     };
//     renderer.domElement.addEventListener("click", handleClick);

//     // Instructions Overlay
//     const instructions = document.createElement("div");
//     instructions.style.position = "absolute";
//     instructions.style.top = "10px";
//     instructions.style.left = "10px";
//     instructions.style.background = "rgba(255, 255, 255, 0.7)";
//     instructions.style.padding = "10px";
//     instructions.style.borderRadius = "5px";
//     instructions.style.fontFamily = "sans-serif";
//     instructions.style.pointerEvents = "none";
//     instructions.style.color = "#000";
//     instructions.style.zIndex = "1"; // Ensure it stays on top
//     instructions.innerHTML = `
//       Click to start
//       <br />
//       WASD / Arrow Keys - Move
//       <br />
//       Mouse - Look around
//       <br />
//       Space - Jump
//       <br />
//       ESC - Exit
//     `;
//     canvasWrapperRef.current?.appendChild(instructions);

//     // Event Handlers for Keyboard Input
//     const onKeyDown = (event: KeyboardEvent) => {
//       switch (event.code) {
//         case "ArrowUp":
//         case "KeyW":
//           moveForwardRef.current = true;
//           break;
//         case "ArrowDown":
//         case "KeyS":
//           moveBackwardRef.current = true;
//           break;
//         case "ArrowLeft":
//         case "KeyA":
//           moveLeftRef.current = true;
//           break;
//         case "ArrowRight":
//         case "KeyD":
//           moveRightRef.current = true;
//           break;
//         case "Space":
//           if (canJumpRef.current === true) {
//             velocityRef.current.y += JUMP_FORCE;
//             canJumpRef.current = false;
//           }
//           break;
//         default:
//           break;
//       }
//     };

//     const onKeyUp = (event: KeyboardEvent) => {
//       switch (event.code) {
//         case "ArrowUp":
//         case "KeyW":
//           moveForwardRef.current = false;
//           break;
//         case "ArrowDown":
//         case "KeyS":
//           moveBackwardRef.current = false;
//           break;
//         case "ArrowLeft":
//         case "KeyA":
//           moveLeftRef.current = false;
//           break;
//         case "ArrowRight":
//         case "KeyD":
//           moveRightRef.current = false;
//           break;
//         default:
//           break;
//       }
//     };

//     // Add Keyboard Event Listeners
//     document.addEventListener("keydown", onKeyDown);
//     document.addEventListener("keyup", onKeyUp);

//     // Initialize previous time
//     let prevTime = performance.now();

//     // Animation Loop
//     const animate = () => {
//       animationFrameRef.current = requestAnimationFrame(animate);

//       const time = performance.now();
//       const delta = (time - prevTime) / 1000; // Convert to seconds

//       if (controls.isLocked) {
//         // Apply gravity
//         velocityRef.current.y -= 9.8 * 10.0 * delta; // Gravity acceleration

//         // Apply friction
//         velocityRef.current.x -= velocityRef.current.x * 10.0 * delta;
//         velocityRef.current.z -= velocityRef.current.z * 10.0 * delta;

//         // Calculate direction
//         directionRef.current.z =
//           Number(moveForwardRef.current) - Number(moveBackwardRef.current);
//         directionRef.current.x =
//           Number(moveLeftRef.current) - Number(moveRightRef.current);
//         directionRef.current.normalize(); // Ensures consistent movement

//         if (moveForwardRef.current || moveBackwardRef.current)
//           velocityRef.current.z -= directionRef.current.z * MOVE_SPEED * delta;
//         if (moveLeftRef.current || moveRightRef.current)
//           velocityRef.current.x -= directionRef.current.x * MOVE_SPEED * delta;

//         // Move the camera
//         controls.moveForward(-velocityRef.current.z * delta);
//         controls.moveRight(-velocityRef.current.x * delta);
//         camera.position.y += velocityRef.current.y * delta;

//         // Floor collision detection
//         const floorHeight = boundingBoxRef.current?.min.y ?? 0;
//         if (camera.position.y < floorHeight + eyeHeight) {
//           velocityRef.current.y = 0;
//           camera.position.y = floorHeight + eyeHeight;
//           canJumpRef.current = true;
//         }

//         // Constrain camera within scene bounds
//         if (boundingBoxRef.current) {
//           const margin = 1; // Distance from walls
//           const box = boundingBoxRef.current;

//           camera.position.x = Math.max(
//             box.min.x + margin,
//             Math.min(box.max.x - margin, camera.position.x)
//           );
//           camera.position.z = Math.max(
//             box.min.z + margin,
//             Math.min(box.max.z - margin, camera.position.z)
//           );
//         }

//         // Update light position to follow the camera
//         const mainLight = scene3D.getObjectByName(
//           "mainLight"
//         ) as DirectionalLight;
//         if (mainLight) {
//           mainLight.position.set(
//             camera.position.x,
//             camera.position.y + 10,
//             camera.position.z + 10
//           );
//         }

//         const fillLight = scene3D.getObjectByName(
//           "fillLight"
//         ) as DirectionalLight;
//         if (fillLight) {
//           fillLight.position.set(
//             camera.position.x - 1,
//             camera.position.y + 5,
//             camera.position.z - 1
//           );
//         }
//       }

//       prevTime = time;

//       // Render scene3D
//       renderer.clear(); // Clear color and depth buffers
//       renderer.render(scene3D, camera);

//       // Render sceneOnTop
//       renderer.clearDepth(); // Clear depth buffer so sceneOnTop renders over scene3D
//       renderer.render(sceneOnTop, camera);
//     };

//     animate(); // Start the animation loop

//     // Cleanup Function
//     return () => {
//       // Stop the animation loop
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current);
//       }

//       // Remove event listeners
//       document.removeEventListener("keydown", onKeyDown);
//       document.removeEventListener("keyup", onKeyUp);
//       renderer.domElement.removeEventListener("mousedown", handleMouseDown);
//       renderer.domElement.removeEventListener("click", handleClick);

//       // Dispose of controls
//       if (controlsRef.current) {
//         controlsRef.current.dispose();
//       }

//       // Dispose of renderer
//       renderer.dispose();

//       // Dispose of scenes
//       if (scene3DRef.current) disposeScene(scene3DRef.current);
//       if (sceneOnTopRef.current) disposeScene(sceneOnTopRef.current);

//       // Remove renderer from DOM
//       if (canvasWrapperRef.current) {
//         canvasWrapperRef.current.innerHTML = "";
//       }

//       // Remove instructions overlay
//       if (canvasWrapperRef.current?.contains(instructions)) {
//         canvasWrapperRef.current.removeChild(instructions);
//       }
//     };
//   }, [state.scene, actions, catalog, width, height, MOVE_SPEED, JUMP_FORCE]);

//   return (
//     <div
//       ref={canvasWrapperRef}
//       style={{
//         width: `${width}px`,
//         height: `${height}px`,
//         position: "relative",
//         overflow: "hidden", // Prevent overflow
//         background: "#000", // Black background for contrast
//       }}
//     ></div>
//   );
// };

// export default Viewer3DFirstPerson;
