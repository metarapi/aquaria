import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gerstnerWave } from "./util.js";
import { GUI } from "dat.gui";
import { setIntervalID } from "./intervalManager";

export function initScene3(container, setGUI) {
  // Clear previous scene if any
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // This three.js scene holds a plane mesh which is oscillating with Gerstner waves

  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

  camera.position.z = 5;
  camera.position.y = -7;
  camera.rotation.x = 1;

  const renderer = new THREE.WebGLRenderer( { antialias: true} );
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Add OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);

  // Define the dimensions of the noise array
  const xSize = 100;
  const ySize = 100;

  // Create a plane geometry
  const geometry = new THREE.PlaneGeometry(10, 10, xSize - 1, ySize - 1);

  // Create a material and mesh
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  });
  const mesh = new THREE.Mesh(geometry, material);

  // Add the mesh to the scene
  scene.add(mesh);

  // Gerstner wave parameters
  const waves = [
    { amplitude: 0.2, wavelength: 3, speed: 1, directionX: 1, directionY: 0 },
    { amplitude: 0.1, wavelength: 5, speed: 1.5, directionX: 0, directionY: 1 },
    {
      amplitude: 0.06,
      wavelength: 7,
      speed: 0.8,
      directionX: 1,
      directionY: 1,
    },
    {
      amplitude: 0.02,
      wavelength: 15,
      speed: 0.4,
      directionX: 0,
      directionY: 1,
    },
    {
      amplitude: 0.14,
      wavelength: 9,
      speed: 1,
      directionX: 0.5,
      directionY: 1,
    },
  ];

  // Function to update Gerstner waves
  function updateGerstnerWaves(time) {
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      let waveHeight = 0;

      for (const wave of waves) {
        const result = gerstnerWave(
          x,
          y,
          time,
          wave.amplitude,
          wave.wavelength,
          wave.speed,
          { x: wave.directionX, y: wave.directionY }
        );
        waveHeight += result.waveHeight;
      }

      positions[i + 2] = waveHeight; // Update Z value for wave height
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  }

  // Create the GUI
  const gui = new GUI(); // Initialize the new GUI instance
  setGUI(gui); // Pass the GUI instance to the callback
  waves.forEach((wave, index) => {
    const waveFolder = gui.addFolder(`Wave ${index + 1}`);
    waveFolder.add(wave, "amplitude", 0, 1).name("Amplitude");
    waveFolder.add(wave, "wavelength", 1, 20).name("Wavelength");
    waveFolder.add(wave, "speed", 0, 2).name("Speed");
    waveFolder.add(wave, "directionX", -1, 1).name("Direction X");
    waveFolder.add(wave, "directionY", -1, 1).name("Direction Y");
    waveFolder.open();
  });

  // Move the GUI down
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

  // Update Gerstner waves at a fixed interval (e.g., 30 times per second)
  const intervalID = setInterval(() => {
    const time = performance.now() / 1000; // Convert to seconds
    updateGerstnerWaves(time);
  }, 1000 / 30); // 30 updates per second

  // Store the interval ID using the shared interval manager
  setIntervalID(intervalID);
}
