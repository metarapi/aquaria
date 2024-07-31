// Lorenz curve backup

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { setIntervalID } from "./intervalManager";

export function initScene1(container) {
  // Clear previous scene if any
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  camera.position.z = 5;
  camera.position.y = -100;
  camera.rotation.x = 1;

  // Add OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);

  // Set camera position
  camera.position.z = 50;

  // Lorenz attractor parameters
  const dt = 0.01;
  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;
  let x = 1;
  let y = 1;
  let z = 1;

  // Number of points in the trail
  const trailLength = 1000;

  // Create geometry and material for the trail
  const trailGeometry = new THREE.BufferGeometry();
  const trailVertices = new Float32Array(trailLength * 3);
  const trailColors = new Float32Array(trailLength * 4); // RGBA for each vertex

  // Initialize the trail vertices and colors
  for (let i = 0; i < trailLength; i++) {
    trailVertices[i * 3] = 0;
    trailVertices[i * 3 + 1] = 0;
    trailVertices[i * 3 + 2] = 0;
    trailColors[i * 4] = 0;
    trailColors[i * 4 + 1] = 0;
    trailColors[i * 4 + 2] = 1; // Blue color
    trailColors[i * 4 + 3] = i / trailLength; // Alpha value
  }

  trailGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(trailVertices, 3)
  );
  trailGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(trailColors, 4)
  );

  const trailMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
  });
  const trail = new THREE.Line(trailGeometry, trailMaterial);
  scene.add(trail);

  // Create the dot
  const dotGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const dot = new THREE.Mesh(dotGeometry, dotMaterial);
  scene.add(dot);

  // Speed control variable
  let speed = 1; // Default speed
  let animationSpeed = 1000 / 60; // Default to 60 FPS

  // Function to update the Lorenz attractor position
  function lorenzAttractor() {
    const adjustedDt = dt * speed; // Keep the time step constant
    console.log("Adjusted dt:", adjustedDt);
    const dx = sigma * (y - x) * adjustedDt;
    const dy = (x * (rho - z) - y) * adjustedDt;
    const dz = (x * y - beta * z) * adjustedDt;
    x += dx;
    y += dy;
    z += dz;
    return new THREE.Vector3(x, y, z);
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Update the Lorenz attractor position
    const point = lorenzAttractor();

    // Update the trail vertices and colors
    for (let i = trailLength - 1; i > 0; i--) {
      trailVertices[i * 3] = trailVertices[(i - 1) * 3];
      trailVertices[i * 3 + 1] = trailVertices[(i - 1) * 3 + 1];
      trailVertices[i * 3 + 2] = trailVertices[(i - 1) * 3 + 2];
      trailColors[i * 4 + 3] = trailColors[(i - 1) * 4 + 3] * 0.999; // Gradually fade out
    }

    // Set the new position and color for the first vertex
    trailVertices[0] = point.x;
    trailVertices[1] = point.y;
    trailVertices[2] = point.z;
    trailColors[0] = 0;
    trailColors[1] = 0;
    trailColors[2] = 1;
    trailColors[3] = 1; // Full opacity

    // Update the trail geometry
    trailGeometry.attributes.position.needsUpdate = true;
    trailGeometry.attributes.color.needsUpdate = true;

    // Update the dot position
    dot.position.copy(point);

    // Render the scene
    renderer.render(scene, camera);
  }

  // Start the animation
  animate();

  // Event listener to adjust speed with range input
  const speedControl = document.getElementById("lorenz-speed");
  speedControl.addEventListener("input", (event) => {
    speed = parseFloat(event.target.value);
    console.log("Speed:", speed);
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
