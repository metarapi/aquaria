window.htmx = require("htmx.org");

// Import scene initialization functions
import { initScene1 } from "./scene1";
import { initScene2 } from "./scene2";
import { initScene3 } from "./scene3";
import { clearExistingInterval } from "./intervalManager";

// Define routes mapping hash fragments to scene initialization functions
const routes = {
  "/scene1": initScene1,
  "/scene2": initScene2,
  "/scene3": initScene3,
};

// Global reference to the current GUI
let currentGUI = null;

// Router function to handle hash-based navigation
function router() {
  const hash = window.location.hash || "#/scene1"; // Get current hash or default to #/scene1
  const route = routes[hash.slice(1)]; // Look up the route function
  if (route) {
    const container = document.getElementById("scene-box"); // Get the container element

    // Clear any existing interval
    clearExistingInterval();

    // Destroy the previous GUI if it exists
    if (currentGUI) {
      currentGUI.destroy();
      currentGUI = null;
    }

    // Call the route function with the container and set currentGUI
    route(container, (gui) => {
      currentGUI = gui; // Store the reference to the new GUI
    });
  }

  // Show or hide the range element based on the current scene
  const lorenzSpeedContainer = document.getElementById(
    "lorenz-speed-container"
  );
  if (hash === "#/scene1") {
    lorenzSpeedContainer.style.display = "block";
  } else {
    lorenzSpeedContainer.style.display = "none";
  }

  console.log(document.getElementById("scene-label"));

  // Update the scene label
  const sceneLabel = document.getElementById("scene-label");
  if (hash === "#/scene1") {
    sceneLabel.textContent = "Lorenz Attractor";
  } else if (hash === "#/scene2") {
    sceneLabel.textContent = "Periodic Simplex Noise"
    } else if (hash === "#/scene3") {
    sceneLabel.textContent = "Gerstner Waves";
}

  // Update active class on pagination items
  const pageItems = document.querySelectorAll(".pagination .page-item");
  pageItems.forEach((item) => {
    item.classList.remove("active"); // Remove active class from all items
  });
  const activeItem = document.querySelector(
    `.pagination .page-item a[href="${hash}"]`
  );
  if (activeItem) {
    activeItem.parentElement.classList.add("active"); // Add active class to the current item
  }
}

// Add event listeners to handle hash changes and initial page load
window.addEventListener("hashchange", router);
window.addEventListener("load", router);
