import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createNoise2D } from "simplex-noise";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

const sceneBox = document.getElementById('scene-box');
sceneBox.appendChild(renderer.domElement);

// Plane
const planeGeometry = new THREE.PlaneGeometry(10,10,50,50);
planeGeometry.rotateX(30);
const planeMaterial = new THREE.MeshBasicMaterial({color: 0x22aa22});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

// Fog
const fogColor = "#000"
const fogNear = 2;
const fogFar = 8;
scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});