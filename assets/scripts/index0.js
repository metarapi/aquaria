window.htmx = require('htmx.org');
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createNoise2D } from 'simplex-noise';
import { psrdnoise2 } from './util.js';

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

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

sceneBox.appendChild(renderer.domElement);

// Plane
const planeGeometry = new THREE.PlaneGeometry(50,50,250,250);

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
    color: 0x22aa22,
    roughness: 0.5,
    metalness: 0.5
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);
  
  // Add a light source to see the effects of the material
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5).normalize();
  scene.add(light);

// Fog
// const fogColor = "#000"
// const fogNear = 1;
// const fogFar = 16;
// scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

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