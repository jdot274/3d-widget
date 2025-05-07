import * as THREE from 'three';
import Grid from './components/Grid.js';
import config from './scene.config.json';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import '/styles/global.css';

// App state
let animationFrameId = null;
let scene, camera, renderer, grid;
let clock = new THREE.Clock();

// Initialize the app
async function init() {
  console.log('Initializing app with simplified approach...');
  
  // Prepare DOM with transparent background
  document.body.style.backgroundColor = 'transparent';
  document.documentElement.style.backgroundColor = 'transparent';
  
  // Create scene with transparent background
  scene = new THREE.Scene();
  scene.background = null; // CRITICAL for transparency
  
  // Create camera - EXACTLY like silver-3d-rectangle
  camera = new THREE.PerspectiveCamera(
    45, // FOV
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  camera.position.set(0, 0, 5);
  
  // Create renderer - EXACTLY like silver-3d-rectangle
  renderer = new THREE.WebGLRenderer({ 
    alpha: true, 
    antialias: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.setClearAlpha(0);
  
  // Add to DOM with transparent background
  const app = document.getElementById('app');
  app.style.backgroundColor = 'transparent';
  app.appendChild(renderer.domElement);
  
  // Add a simple cube that will definitely be visible
  addVisibilityCube();
  
  // Essential lighting - exactly like silver-3d-rectangle
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);
  
  // Add a strong directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Create grid with simplified approach
  grid = new Grid(scene);
  
  // Load environment map - crucial for reflections
  const envMap = await loadEnvironmentMap();
  scene.environment = envMap;
  
  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  
  // Start animation loop
  animate();
  console.log('Animation loop started');
}

// Add a simple, obvious cube that will definitely be visible
function addVisibilityCube() {
  // Create a large, bright red cube that should be unmissable
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
    metalness: 0.7,
    roughness: 0.2
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0, 0);
  scene.add(cube);
  console.log('Visibility cube added');
}

// Load environment map for better reflections
async function loadEnvironmentMap() {
  console.log('Loading environment map...');
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  
  try {
    // Use the exact same HDR as silver-3d-rectangle
    const rgbeLoader = new RGBELoader();
    const texture = await new Promise((resolve, reject) => {
      rgbeLoader.load(
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr',
        (texture) => {
          console.log('HDR texture loaded successfully');
          texture.mapping = THREE.EquirectangularReflectionMapping;
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error('Failed to load HDR texture:', error);
          reject(error);
        }
      );
    });
    
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    
    // Clean up
    texture.dispose();
    pmremGenerator.dispose();
    console.log('Environment map loaded');
    return envMap;
  } catch (error) {
    console.error('Error loading environment map:', error);
    // Create a basic environment map as fallback
    const cubeRenderTarget = pmremGenerator.fromScene(new THREE.Scene());
    const envMap = cubeRenderTarget.texture;
    pmremGenerator.dispose();
    cubeRenderTarget.dispose();
    return envMap;
  }
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop - EXACTLY like silver-3d-rectangle
function animate() {
  animationFrameId = requestAnimationFrame(animate);
  
  // Get time for animations
  const time = clock.getElapsedTime();
  
  // CRITICAL: Proper transparency rendering sequence
  renderer.setClearColor(0x000000, 0);
  renderer.setClearAlpha(0);
  renderer.autoClear = false;
  renderer.clear(true, true, true);
  
  // Update grid with time parameter
  if (grid && grid.chips) {
    for (const chip of grid.chips) {
      chip.update(time);
    }
  }
  
  // Render scene
  renderer.render(scene, camera);
}

// Initialize the app
init().catch(error => {
  console.error('Initialization error:', error);
  // Add fallback rendering if initialization fails
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div style="color: red; padding: 20px; font-size: 24px; background: rgba(0,0,0,0.7);">
      Error initializing 3D scene. See console for details.
    </div>`;
  }
}); 