import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { psrdnoise2 } from "./util.js";
import { GUI } from "dat.gui";
import { setIntervalID } from "./intervalManager";

export function initScene2(container, setGUI) {
  // Clear previous scene if any
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Set up scene, camera, and renderer
  const width = container.clientWidth;
  const height = container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  camera.position.z = 5;
  camera.position.y = -7;
  camera.rotation.x = 1;

  // Add OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);

  // Define the dimensions of the noise array
  const xSize = 100;
  const ySize = 100;

  // Create a plane geometry
  const geometry = new THREE.PlaneGeometry(10, 10, xSize - 1, ySize - 1);

  // Create a material and mesh
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // Simplex noise parameters
  const noiseParams = {
    frequency: 0.1,
    amplitude: 0.2,
    timeSpeed: 1.0,
  };

  // Function to update mesh vertices using Simplex noise
  function updateSimplexNoise(time) {
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = (i / 3) % xSize;
      const y = Math.floor(i / 3 / xSize);
      const noiseValue = psrdnoise2(
        [x * noiseParams.frequency, y * noiseParams.frequency],
        [50, 50],
        time * noiseParams.timeSpeed
      ).value;

      positions[i + 2] = noiseParams.amplitude * noiseValue; // Set the Z value to the noise value
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  }

  // Create the GUI
  const gui = new GUI();
  setGUI(gui);
  gui.add(noiseParams, "frequency", 0.01, 0.5).name("Frequency");
  gui.add(noiseParams, "amplitude", 0, 1).name("Amplitude");
  gui.add(noiseParams, "timeSpeed", 0.1, 3).name("Time Speed");

  // Adjust GUI position
  const style = document.createElement("style");
  style.innerHTML = `
    .dg {
      top: 60px !important; /* Adjust this value to move the GUI down */
    }
  `;
  document.head.appendChild(style);

  // Handle window resize
  window.addEventListener("resize", onWindowResize, false);
  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  // Render the scene
  function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
  }

  // Start the rendering loop
  render();

  // Update Simplex noise at a fixed interval (e.g., 30 times per second)
  const intervalID = setInterval(() => {
    const time = performance.now() / 1000; // Convert to seconds
    updateSimplexNoise(time);
  }, 1000 / 30); // 30 updates per second

  // Store the interval ID using the shared interval manager
  setIntervalID(intervalID);
}
