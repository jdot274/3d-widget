import * as THREE from 'three';
import Grid from './components/Grid.js';
import config from './scene.config.json';

// Initialize variables
let scene, camera, renderer, grid;
let animationFrameId = null;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let hoveredChip = null;
let clock = new THREE.Clock();
let envMap;

// Setup and start the 3D scene
function init() {
  console.log("Initializing 3D scene");
  
  // Create scene with transparent background
  scene = new THREE.Scene();
  scene.background = null; // Crucial for true transparency
  
  // Create camera - premium perspective
  camera = new THREE.PerspectiveCamera(
    40, // Lower FOV for less distortion - premium look
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
  );
  camera.position.z = 7; // Slightly closer for better detail
  camera.position.y = 1.5; // Less elevation for more straight-on view
  camera.lookAt(0, 0, 0);
  
  // Setup renderer with high quality settings for premium glass
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    precision: 'highp'
  });
  
  // Configure renderer for premium style with transparency
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // Transparent background
  renderer.setClearAlpha(0); // Crucial for transparency
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Enable physically correct lighting
  if (renderer.physicallyCorrectLights !== undefined) {
    renderer.physicallyCorrectLights = true;
  }
  
  // Set output encoding for proper color reproduction
  if (THREE.sRGBEncoding !== undefined) {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  
  // Add tone mapping with higher contrast - premium dark look
  if (THREE.ACESFilmicToneMapping !== undefined) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9; // Slightly darker for premium contrast
  }
  
  // Create environment map for glass reflections
  createEnvironmentMap();
  
  // Make renderer available to components
  scene.renderer = renderer;
  scene.envMap = envMap;
  
  // Add renderer to DOM
  const app = document.getElementById('app');
  app.appendChild(renderer.domElement);
  
  // Set up lighting for premium glass style with dark spheres
  setupLighting();
  
  // Create grid of chips
  grid = new Grid(scene);
  console.log("Grid created:", grid);
  
  // Add event listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('click', onClick);
  
  // Start animation loop
  animate();
}

// Create environment map optimized for premium glass
function createEnvironmentMap() {
  try {
    // Create a PMREM generator
    if (renderer && THREE.PMREMGenerator) {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();
      
      // Create a dark, premium environment for contrasting glass panels
      const envTexture = createPremiumEnvironmentTexture();
      
      // Process the environment map for PBR materials
      envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
      
      // Clean up
      pmremGenerator.dispose();
      envTexture.dispose();
    }
  } catch (e) {
    console.warn('Error creating environment map:', e);
  }
}

// Create a premium environment texture that works with transparency
function createPremiumEnvironmentTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  
  const ctx = canvas.getContext('2d');
  
  // Start with transparency for background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Create a very subtle gradient that allows transparency
  const gradient = ctx.createRadialGradient(
    canvas.width/2, canvas.height/2, 0,
    canvas.width/2, canvas.height/2, canvas.height * 0.8
  );
  
  // Use very subtle colors that work with transparency
  gradient.addColorStop(0, 'rgba(30, 30, 30, 0.1)');     // Very subtle dark center
  gradient.addColorStop(0.3, 'rgba(20, 20, 20, 0.05)');  // Extremely subtle
  gradient.addColorStop(0.6, 'rgba(10, 10, 10, 0.03)');  // Nearly invisible
  gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0)');        // Fully transparent at edges
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add subtle glow spots for glass reflections
  ctx.globalCompositeOperation = 'lighter';
  
  // Add distant, subtle light sources but make them very subtle
  for (let i = 0; i < 10; i++) { 
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 60 + Math.random() * 100;
    const gradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, radius
    );
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)'); // Very subtle center
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.03)'); // Even faster falloff
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';
  
  // Create a texture from the canvas
  const texture = new THREE.CanvasTexture(canvas);
  
  // Configure for proper environment mapping
  if (THREE.EquirectangularReflectionMapping) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
  }
  
  return texture;
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse movement for hover effects
function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Update the raycaster
  raycaster.setFromCamera(mouse, camera);
  
  // Check for intersections with chips
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  // Reset previously hovered chip
  if (hoveredChip && (!intersects.length || intersects[0].object.userData.chip !== hoveredChip)) {
    hoveredChip.onHover(false);
    hoveredChip = null;
  }
  
  // Set new hovered chip
  if (intersects.length > 0) {
    const chip = intersects[0].object.userData.chip;
    if (chip && chip !== hoveredChip) {
      hoveredChip = chip;
      hoveredChip.onHover(true);
    }
  }
}

// Handle click events
function onClick() {
  if (hoveredChip) {
    hoveredChip.onClick();
  }
}

// Animation loop - modify for premium animation style
function animate() {
  animationFrameId = requestAnimationFrame(animate);
  
  // Get animation time
  const time = clock.getElapsedTime();
  
  // Update grid
  if (grid && grid.chips) {
    for (const chip of grid.chips) {
      chip.update(time);
    }
  }
  
  // Extremely subtle camera movement - premium UI has minimal movement
  const camX = Math.sin(time * 0.07) * 0.03; // Very subtle x movement
  const camY = Math.cos(time * 0.05) * 0.03 + 1.5; // Maintain near-stable position
  camera.position.x = camX;
  camera.position.y = camY;
  camera.position.z = 7; // Keep z stable for premium look
  camera.lookAt(0, 0, 0);
  
  // Clear with transparency
  renderer.setClearColor(0x000000, 0);
  renderer.setClearAlpha(0);
  renderer.clear();
  
  // Render scene
  renderer.render(scene, camera);
}

// Clean up resources
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
}

// Carefully designed lighting setup optimized for premium glassmorphism with transparency
function setupLighting() {
  // Subtle ambient light for premium glass with transparency
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Moderate ambient for transparency
  scene.add(ambientLight);
  
  // Main key light - subtle highlights for glass edges with transparency
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.6); // Slightly reduced for transparency
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);
  
  // Secondary key light for balance
  const keyLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
  keyLight2.position.set(-4, 3, 4);
  scene.add(keyLight2);
  
  // Rim light - subtle edge definition
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.2); // Reduced for transparency
  rimLight.position.set(0, -4, 2);
  scene.add(rimLight);
  
  // Add subtle point lights for specular highlights on glass and spheres
  const pointLight1 = new THREE.PointLight(0xffffff, 0.2, 10); // Reduced for transparency
  pointLight1.position.set(2, 3, 4);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0xffffff, 0.15, 8); // Reduced for transparency
  pointLight2.position.set(-3, -2, 3);
  scene.add(pointLight2);
}

// Initialize
init();

// Handle cleanup when window is closed
window.addEventListener('beforeunload', cleanup); 