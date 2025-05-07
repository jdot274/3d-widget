"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var THREE = _interopRequireWildcard(require("three"));

var _Grid = _interopRequireDefault(require("./components/Grid.js"));

var _sceneConfig = _interopRequireDefault(require("./scene.config.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Initialize variables
var scene, camera, renderer, grid;
var animationFrameId = null;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var hoveredChip = null;
var clock = new THREE.Clock();
var envMap; // Setup and start the 3D scene

function init() {
  console.log("Initializing 3D scene"); // Create scene with transparent background

  scene = new THREE.Scene();
  scene.background = null; // Crucial for true transparency
  // Create camera - premium perspective

  camera = new THREE.PerspectiveCamera(40, // Lower FOV for less distortion - premium look
  window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 7; // Slightly closer for better detail

  camera.position.y = 1.5; // Less elevation for more straight-on view

  camera.lookAt(0, 0, 0); // Setup renderer with high quality settings for premium glass

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    precision: 'highp'
  }); // Configure renderer for premium style with transparency

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background

  renderer.setClearAlpha(0); // Crucial for transparency

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Enable physically correct lighting

  if (renderer.physicallyCorrectLights !== undefined) {
    renderer.physicallyCorrectLights = true;
  } // Set output encoding for proper color reproduction


  if (THREE.sRGBEncoding !== undefined) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  } // Add tone mapping with higher contrast - premium dark look


  if (THREE.ACESFilmicToneMapping !== undefined) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9; // Slightly darker for premium contrast
  } // Create environment map for glass reflections


  createEnvironmentMap(); // Make renderer available to components

  scene.renderer = renderer;
  scene.envMap = envMap; // Add renderer to DOM

  var app = document.getElementById('app');
  app.appendChild(renderer.domElement); // Set up lighting for premium glass style with dark spheres

  setupLighting(); // Create grid of chips

  grid = new _Grid["default"](scene);
  console.log("Grid created:", grid); // Add event listeners

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('click', onClick); // Start animation loop

  animate();
} // Create environment map optimized for premium glass


function createEnvironmentMap() {
  try {
    // Create a PMREM generator
    if (renderer && THREE.PMREMGenerator) {
      var pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader(); // Create a dark, premium environment for contrasting glass panels

      var envTexture = createPremiumEnvironmentTexture(); // Process the environment map for PBR materials

      envMap = pmremGenerator.fromEquirectangular(envTexture).texture; // Clean up

      pmremGenerator.dispose();
      envTexture.dispose();
    }
  } catch (e) {
    console.warn('Error creating environment map:', e);
  }
} // Create a premium environment texture that works with transparency


function createPremiumEnvironmentTexture() {
  var canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  var ctx = canvas.getContext('2d'); // Start with transparency for background

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Create a very subtle gradient that allows transparency

  var gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.height * 0.8); // Use very subtle colors that work with transparency

  gradient.addColorStop(0, 'rgba(30, 30, 30, 0.1)'); // Very subtle dark center

  gradient.addColorStop(0.3, 'rgba(20, 20, 20, 0.05)'); // Extremely subtle

  gradient.addColorStop(0.6, 'rgba(10, 10, 10, 0.03)'); // Nearly invisible

  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)'); // Fully transparent at edges

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Add subtle glow spots for glass reflections

  ctx.globalCompositeOperation = 'lighter'; // Add distant, subtle light sources but make them very subtle

  for (var i = 0; i < 10; i++) {
    var x = Math.random() * canvas.width;
    var y = Math.random() * canvas.height;
    var radius = 60 + Math.random() * 100;

    var _gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

    _gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)'); // Very subtle center


    _gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.03)'); // Even faster falloff


    _gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = _gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  } // Reset composite operation


  ctx.globalCompositeOperation = 'source-over'; // Create a texture from the canvas

  var texture = new THREE.CanvasTexture(canvas); // Configure for proper environment mapping

  if (THREE.EquirectangularReflectionMapping) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
  }

  return texture;
} // Handle window resize


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
} // Handle mouse movement for hover effects


function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = event.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; // Update the raycaster

  raycaster.setFromCamera(mouse, camera); // Check for intersections with chips

  var intersects = raycaster.intersectObjects(scene.children, true); // Reset previously hovered chip

  if (hoveredChip && (!intersects.length || intersects[0].object.userData.chip !== hoveredChip)) {
    hoveredChip.onHover(false);
    hoveredChip = null;
  } // Set new hovered chip


  if (intersects.length > 0) {
    var chip = intersects[0].object.userData.chip;

    if (chip && chip !== hoveredChip) {
      hoveredChip = chip;
      hoveredChip.onHover(true);
    }
  }
} // Handle click events


function onClick() {
  if (hoveredChip) {
    hoveredChip.onClick();
  }
} // Animation loop - modify for premium animation style


function animate() {
  animationFrameId = requestAnimationFrame(animate); // Get animation time

  var time = clock.getElapsedTime(); // Update grid

  if (grid && grid.chips) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = grid.chips[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var chip = _step.value;
        chip.update(time);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator["return"] != null) {
          _iterator["return"]();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  } // Extremely subtle camera movement - premium UI has minimal movement


  var camX = Math.sin(time * 0.07) * 0.03; // Very subtle x movement

  var camY = Math.cos(time * 0.05) * 0.03 + 1.5; // Maintain near-stable position

  camera.position.x = camX;
  camera.position.y = camY;
  camera.position.z = 7; // Keep z stable for premium look

  camera.lookAt(0, 0, 0); // Clear with transparency

  renderer.setClearColor(0x000000, 0);
  renderer.setClearAlpha(0);
  renderer.clear(); // Render scene

  renderer.render(scene, camera);
} // Clean up resources


function cleanup() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  window.removeEventListener('resize', onWindowResize);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('click', onClick);

  if (grid) {
    grid.dispose();
  }

  if (renderer) {
    renderer.dispose();
  }

  if (envMap) {
    envMap.dispose();
  }
} // Carefully designed lighting setup optimized for premium glassmorphism with transparency


function setupLighting() {
  // Subtle ambient light for premium glass with transparency
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Moderate ambient for transparency

  scene.add(ambientLight); // Main key light - subtle highlights for glass edges with transparency

  var keyLight = new THREE.DirectionalLight(0xffffff, 0.6); // Slightly reduced for transparency

  keyLight.position.set(3, 5, 4);
  scene.add(keyLight); // Secondary key light for balance

  var keyLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  keyLight2.position.set(-4, 3, 4);
  scene.add(keyLight2); // Rim light - subtle edge definition

  var rimLight = new THREE.DirectionalLight(0xffffff, 0.2); // Reduced for transparency

  rimLight.position.set(0, -4, 2);
  scene.add(rimLight); // Add subtle point lights for specular highlights on glass and spheres

  var pointLight1 = new THREE.PointLight(0xffffff, 0.2, 10); // Reduced for transparency

  pointLight1.position.set(2, 3, 4);
  scene.add(pointLight1);
  var pointLight2 = new THREE.PointLight(0xffffff, 0.15, 8); // Reduced for transparency

  pointLight2.position.set(-3, -2, 3);
  scene.add(pointLight2);
} // Initialize


init(); // Handle cleanup when window is closed

window.addEventListener('beforeunload', cleanup);
//# sourceMappingURL=new-main.dev.js.map
