import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

export function initScene1(container) {
  // Clear previous scene if any
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  camera.position.x = 76.44;
  camera.position.y = -39.98;
  camera.position.z = 83.50;
  camera.rotation.x = 1.10;
  camera.rotation.y = .96;
  camera.rotation.z = -1.02;

  // Add OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  //controls.enableDamping = true;

  // Lorenz attractor parameters
  const dt = 0.01;
  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;
  let x = 1;
  let y = 1;
  let z = 1;

  // Maximum number of segments
  const maxSegments = 2000;
  const segments = [];

  // Create the dot
  const dotGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const dotMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const dot = new THREE.Mesh(dotGeometry, dotMaterial);
  scene.add(dot);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 10); // Color and intensity
  scene.add(ambientLight);

  // Speed control variable
  let speed = 1; // Default speed

  // Function to update the Lorenz attractor position
  function lorenzAttractor() {
    const adjustedDt = dt * speed; // Keep the time step constant
    const dx = sigma * (y - x) * adjustedDt;
    const dy = (x * (rho - z) - y) * adjustedDt;
    const dz = (x * y - beta * z) * adjustedDt;
    x += dx;
    y += dy;
    z += dz;
    return new THREE.Vector3(x, y, z);
  }

  // Function to create a line segment as a thin cylinder
  function createLineSegment(start, end) {
    const radius = 0.05; // Adjust the radius to make the cylinder thin
    const height = Math.sqrt(
      Math.pow(end.x - start.x, 2) +
        Math.pow(end.y - start.y, 2) +
        Math.pow(end.z - start.z, 2)
    );

    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x0000ff,
      metalness: 0.5,
      roughness: 0.0,
      transmission: 1,
      thickness: 0.5,
    });

    const cylinder = new THREE.Mesh(geometry, material);

    // Position the cylinder at the midpoint between start and end
    const midpoint = {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
      z: (start.z + end.z) / 2,
    };
    cylinder.position.set(midpoint.x, midpoint.y, midpoint.z);

    // Calculate the rotation to align the cylinder with the start and end points
    const direction = new THREE.Vector3(
      end.x - start.x,
      end.y - start.y,
      end.z - start.z
    );
    const axis = new THREE.Vector3(0, 1, 0); // Y-axis
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      axis.normalize(),
      direction.normalize()
    );
    cylinder.quaternion.copy(quaternion);

    return cylinder;
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Update the Lorenz attractor position
    const newPoint = lorenzAttractor();

    // Get the last point to create a segment
    const lastPoint = segments.length
      ? segments[segments.length - 1].end
      : newPoint;

    // Create a new line segment
    const lineSegment = createLineSegment(lastPoint, newPoint);
    lineSegment.start = lastPoint;
    lineSegment.end = newPoint;
    segments.push(lineSegment);
    scene.add(lineSegment);

    // Update the properties of all segments
    segments.forEach((segment, index) => {
      const age = segments.length - index;
      segment.material.metalness = Math.max(age / maxSegments, 0);
      segment.material.transmission = Math.max(
        (segments.length - age) / maxSegments,
        0
      );
    });

    // Remove the oldest segment if we exceed the maximum number
    if (segments.length > maxSegments) {
      const oldestSegment = segments.shift();
      scene.remove(oldestSegment);
    }

    // Update the dot position
    dot.position.copy(newPoint);

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
