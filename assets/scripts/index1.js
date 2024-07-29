window.htmx = require("htmx.org");
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createNoise2D } from "simplex-noise";
import { psrdnoise2 } from "./util.js";

console.log("HTMX is loaded!");
console.log("Three.js is loaded!");

const sceneBox = document.getElementById("scene-box");
const width = sceneBox.clientWidth;
const height = sceneBox.clientHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 1, 0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
sceneBox.appendChild(renderer.domElement);

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

// // Function to update noise values
// function updateNoise(time) {
//     const positions = geometry.attributes.position.array;
//     for (let i = 0; i < positions.length; i += 3) {
//         const x = (i / 3) % xSize;
//         const y = Math.floor((i / 3) / xSize);
//         const noiseValue = psrdnoise2([x / 10, y / 10], [50, 50], time / 1000).value; // Include time component
//         if (isNaN(noiseValue)) {
//             console.error(`NaN value detected at (${x}, ${y})`);
//         }
//         positions[i + 2] = noiseValue/4; // Set the Z value to the noise value
//     }
//     geometry.attributes.position.needsUpdate = true;
//     geometry.computeVertexNormals();
//     geometry.computeBoundingSphere();
// }

function gerstnerWave(x, y, time, amplitude, wavelength, speed, direction) {
  const k = (2 * Math.PI) / wavelength;
  const d = new THREE.Vector2(direction.x, direction.y).normalize();
  const f = k * (d.x * x + d.y * y) + speed * time;
  const waveHeight = amplitude * Math.sin(f);
  return { waveHeight};
}

function updateGerstnerWaves(time, amplitudeFactor = 0.2) {
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    let waveHeight = 0;

    // Apply multiple Gerstner waves
    const waves = [
      { amplitude: 1*amplitudeFactor, wavelength: 10, speed: 1, direction: { x: 1, y: 0 } },
      { amplitude: 0.5*amplitudeFactor, wavelength: 5, speed: 1.5, direction: { x: 0, y: 1 } },
      { amplitude: 0.3*amplitudeFactor, wavelength: 7, speed: 0.8, direction: { x: 1, y: 1 } },
      { amplitude: 0.1*amplitudeFactor, wavelength: 15, speed: 0.4, direction: { x: 0, y: 1 } },
      { amplitude: 0.7*amplitudeFactor, wavelength: 9, speed: 1, direction: { x: 0.5, y: 1 } },
    ];

    for (const wave of waves) {
      const result = gerstnerWave(
        x,
        y,
        time,
        wave.amplitude,
        wave.wavelength,
        wave.speed,
        wave.direction
      );
      waveHeight += result.waveHeight;
    }

    positions[i + 2] = waveHeight; // Update Z value for wave height
  }
  geometry.attributes.position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
}

// Render the scene
function render() {
  requestAnimationFrame(render);
  controls.update();
  renderer.render(scene, camera);
}

// Start the rendering loop
render();

// // Update noise values at a fixed interval (e.g., 30 times per second)
// setInterval(() => {
//     const time = performance.now();
//     updateNoise(time);
// }, 1000 / 30); // 30 updates per second

// Update Gerstner waves at a fixed interval (e.g., 30 times per second)
setInterval(() => {
  const time = performance.now() / 1000; // Convert to seconds
  updateGerstnerWaves(time);
}, 1000 / 30); // 30 updates per second
