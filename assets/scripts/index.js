window.htmx = require("htmx.org");
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createNoise2D } from "simplex-noise";
import { psrdnoise2 } from "./util.js";
const sceneData = require("./Scene.json");

console.log('HTMX is loaded!');
console.log('Three.js is loaded!');

const sceneBox = document.getElementById('scene-box');
const width = sceneBox.clientWidth;
const height = sceneBox.clientHeight;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

// Load the exported scene JSON file
const loader = new THREE.ObjectLoader();
const loadedScene = loader.parse(sceneData);
scene.add(loadedScene);

// Variables to store references
const meshes = [];
const lights = [];

// Access elements in the loaded scene
loadedScene.traverse(function (object) {
  if (object.isMesh) {
    meshes.push(object); // Store the mesh reference
  }
  if (object.isLight) {
    lights.push(object); // Store the light reference
  }
});

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

sceneBox.appendChild(renderer.domElement);

// Plane
const planeGeometry = new THREE.PlaneGeometry(250,250,1000,1000);

// Add noise to the plane
const noise2D = createNoise2D();
const noiseScale = .1; // Adjust noise scale to control the magnitude of noise
const noiseAmplitude = 1; // Adjust noise amplitude to control the height of noise

const vertices = planeGeometry.attributes.position.array;
for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];

    // Apply noise to the z-coordinate
    const noiseValue = noise2D(x * noiseScale, y * noiseScale);
    vertices[i + 2] = noiseValue * noiseAmplitude;
}

// Update the vertex normals to reflect the changes
planeGeometry.computeVertexNormals();

planeGeometry.rotateX(30);

const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xC2B280, // Sandy color
  roughness: 0.8, // Adjust roughness to make it look more like sand
  metalness: 0.2, // Adjust metalness
  side: THREE.DoubleSide, // Render both sides of the surface
});
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);
  
  // Add a light source to see the effects of the material
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5).normalize();
  scene.add(light);

function gerstnerWave(x, y, time, amplitude, wavelength, speed, direction) {
  const k = (2 * Math.PI) / wavelength;
  const d = new THREE.Vector2(direction.x, direction.y).normalize();
  const f = k * (d.x * x + d.y * y) + speed * time;
  const waveHeight = amplitude * Math.sin(f);
  return { waveHeight };
}

// Function to retrieve vertices from a THREE.js mesh
function getVertices(mesh) {
  const positions = mesh.geometry.attributes.position.array;
  const vertices = [];
  for (let i = 0; i < positions.length; i += 3) {
    vertices.push({
      x: positions[i],
      y: positions[i + 1],
      z: positions[i + 2],
    });
  }
  return vertices;
}

// Function to find min and max height values
function findMinMaxHeight(vertices) {
  let minHeight = Infinity;
  let maxHeight = -Infinity;
  vertices.forEach((vertex) => {
    if (vertex.y < minHeight) minHeight = vertex.y; // Adjusted to Y-axis
    if (vertex.y > maxHeight) maxHeight = vertex.y; // Adjusted to Y-axis
  });
  return { minHeight, maxHeight };
}

// Function to normalize heights
function normalizeHeights(vertices, minHeight, maxHeight) {
  return vertices.map((vertex) => ({
    ...vertex,
    normalizedHeight: (vertex.y - minHeight) / (maxHeight - minHeight), // Adjusted to Y-axis
  }));
}

// Wave properties array
const waveProperties = [
  {
    amplitudeFactor: 0.01,
    wavelength: 10,
    speed: 1,
    direction: { x: 1, y: 0 },
  },
  {
    amplitudeFactor: 0.02,
    wavelength: 15,
    speed: 0.8,
    direction: { x: -1, y: 0.5 },
  },
  {
    amplitudeFactor: 0.015,
    wavelength: 12,
    speed: 1.2,
    direction: { x: 0.5, y: -1 },
  },
  {
    amplitudeFactor: 0.03,
    wavelength: 8,
    speed: 1.5,
    direction: { x: -0.5, y: -0.5 },
  },
  {
    amplitudeFactor: 0.02,
    wavelength: 20,
    speed: 0.5,
    direction: { x: 1, y: 1 },
  },
];

// Global wave height multiplier
let waveHeightMultiplier = 0.33;

// Function to update Gerstner waves
function updateGerstnerWaves(time) {
  meshes.forEach((mesh) => {
    const vertices = getVertices(mesh);
    const { minHeight, maxHeight } = findMinMaxHeight(vertices);
    const normalizedVertices = normalizeHeights(vertices, minHeight, maxHeight);

    normalizedVertices.forEach((vertex, index) => {
      let waveHeight = 0;
      waveProperties.forEach((wave) => {
        const waveResult = gerstnerWave(
          vertex.x,
          vertex.z, // Adjusted to Z-axis for wave direction
          time,
          wave.amplitudeFactor * vertex.normalizedHeight, // Use normalized height as weight
          wave.wavelength,
          wave.speed,
          wave.direction
        );
        waveHeight += waveResult.waveHeight;
      });
      mesh.geometry.attributes.position.array[index * 3 + 1] =
        vertex.y + waveHeight * waveHeightMultiplier; // Adjusted to Y-axis
    });

    // Update geometry
    mesh.geometry.attributes.position.needsUpdate = true;
  });
}

// Fog
const fogColor = "#112266"
const fogNear = 1;
const fogFar = 75;
scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  const width = sceneBox.clientWidth;
  const height = sceneBox.clientHeight
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});


// Update Gerstner waves at a fixed interval (e.g., 30 times per second)
setInterval(() => {
  const time = performance.now() / 1000; // Convert to seconds
  updateGerstnerWaves(time);
}, 1000 / 30); // 30 updates per second