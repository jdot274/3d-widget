"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var THREE = _interopRequireWildcard(require("three"));

var _Grid = _interopRequireDefault(require("./components/Grid.js"));

var _sceneConfig = _interopRequireDefault(require("./scene.config.json"));

var _RGBELoader = require("three/examples/jsm/loaders/RGBELoader.js");

require("/styles/global.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// App state
var animationFrameId = null;
var scene, camera, renderer, grid;
var clock = new THREE.Clock(); // Initialize the app

function init() {
  var app, ambientLight, directionalLight, envMap;
  return regeneratorRuntime.async(function init$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('Initializing app with simplified approach...'); // Prepare DOM with transparent background

          document.body.style.backgroundColor = 'transparent';
          document.documentElement.style.backgroundColor = 'transparent'; // Create scene with transparent background

          scene = new THREE.Scene();
          scene.background = null; // CRITICAL for transparency
          // Create camera - EXACTLY like silver-3d-rectangle

          camera = new THREE.PerspectiveCamera(45, // FOV
          window.innerWidth / window.innerHeight, 0.1, 1000);
          camera.position.set(0, 0, 5); // Create renderer - EXACTLY like silver-3d-rectangle

          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            premultipliedAlpha: false,
            preserveDrawingBuffer: true
          });
          renderer.setSize(window.innerWidth, window.innerHeight);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.setClearColor(0x000000, 0);
          renderer.setClearAlpha(0); // Add to DOM with transparent background

          app = document.getElementById('app');
          app.style.backgroundColor = 'transparent';
          app.appendChild(renderer.domElement); // Add a simple cube that will definitely be visible

          addVisibilityCube(); // Essential lighting - exactly like silver-3d-rectangle

          ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
          scene.add(ambientLight); // Add a strong directional light

          directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
          directionalLight.position.set(5, 5, 5);
          scene.add(directionalLight); // Create grid with simplified approach

          grid = new _Grid["default"](scene); // Load environment map - crucial for reflections

          _context.next = 24;
          return regeneratorRuntime.awrap(loadEnvironmentMap());

        case 24:
          envMap = _context.sent;
          scene.environment = envMap; // Add event listeners

          window.addEventListener('resize', onWindowResize); // Start animation loop

          animate();
          console.log('Animation loop started');

        case 29:
        case "end":
          return _context.stop();
      }
    }
  });
} // Add a simple, obvious cube that will definitely be visible


function addVisibilityCube() {
  // Create a large, bright red cube that should be unmissable
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
    metalness: 0.7,
    roughness: 0.2
  });
  var cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, 0);
  scene.add(cube);
  console.log('Visibility cube added');
} // Load environment map for better reflections


function loadEnvironmentMap() {
  var pmremGenerator, rgbeLoader, texture, envMap, cubeRenderTarget, _envMap;

  return regeneratorRuntime.async(function loadEnvironmentMap$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log('Loading environment map...');
          pmremGenerator = new THREE.PMREMGenerator(renderer);
          pmremGenerator.compileEquirectangularShader();
          _context2.prev = 3;
          // Use the exact same HDR as silver-3d-rectangle
          rgbeLoader = new _RGBELoader.RGBELoader();
          _context2.next = 7;
          return regeneratorRuntime.awrap(new Promise(function (resolve, reject) {
            rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr', function (texture) {
              console.log('HDR texture loaded successfully');
              texture.mapping = THREE.EquirectangularReflectionMapping;
              resolve(texture);
            }, undefined, function (error) {
              console.error('Failed to load HDR texture:', error);
              reject(error);
            });
          }));

        case 7:
          texture = _context2.sent;
          envMap = pmremGenerator.fromEquirectangular(texture).texture; // Clean up

          texture.dispose();
          pmremGenerator.dispose();
          console.log('Environment map loaded');
          return _context2.abrupt("return", envMap);

        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](3);
          console.error('Error loading environment map:', _context2.t0); // Create a basic environment map as fallback

          cubeRenderTarget = pmremGenerator.fromScene(new THREE.Scene());
          _envMap = cubeRenderTarget.texture;
          pmremGenerator.dispose();
          cubeRenderTarget.dispose();
          return _context2.abrupt("return", _envMap);

        case 23:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[3, 15]]);
} // Handle window resize


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
} // Animation loop - EXACTLY like silver-3d-rectangle


function animate() {
  animationFrameId = requestAnimationFrame(animate); // Get time for animations

  var time = clock.getElapsedTime(); // CRITICAL: Proper transparency rendering sequence

  renderer.setClearColor(0x000000, 0);
  renderer.setClearAlpha(0);
  renderer.autoClear = false;
  renderer.clear(true, true, true); // Update grid with time parameter

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
  } // Render scene


  renderer.render(scene, camera);
} // Initialize the app


init()["catch"](function (error) {
  console.error('Initialization error:', error); // Add fallback rendering if initialization fails

  var app = document.getElementById('app');

  if (app) {
    app.innerHTML = "<div style=\"color: red; padding: 20px; font-size: 24px; background: rgba(0,0,0,0.7);\">\n      Error initializing 3D scene. See console for details.\n    </div>";
  }
});
//# sourceMappingURL=main.dev.js.map
