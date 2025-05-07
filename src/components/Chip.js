import * as THREE from 'three';
import config from '../scene.config.json';
// Import with proper fallbacks - using synchronous imports for guaranteed loading
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MeshBeveledBoxGeometry } from './geometries/MeshBeveledBoxGeometry.js';

class Chip {
  constructor(row, col, scene) {
    this.row = row;
    this.col = col;
    this.scene = scene;
    this.isHovered = false;
    this.isAccented = false;
    this.initialPosition = new THREE.Vector3(0, 0, 0);
    this.hoverPosition = new THREE.Vector3(0, 0, config.hoverLift * 2);
    this.originalScale = new THREE.Vector3(1, 1, 1);
    this.hoverScale = new THREE.Vector3(1.1, 1.1, 1.1);
    
    // Create mesh with appropriate geometry and material
    this.createMesh();
    
    // Position the mesh in the scene
    this.updatePosition();
    
    // Save original position for animations
    this.mesh.userData.chip = this;
    this.mesh.userData.originalPosition = this.mesh.position.clone();
    
    // Add to scene
    scene.add(this.mesh);
  }

  /*
  loadMatcap() {
    // Use a matcap texture for more realistic metal
    try {
      const textureLoader = new THREE.TextureLoader();
      this.matcapTexture = this.createMatcapTexture(); // Start with the local version
      
      // Try to load a remote texture but don't fail if it doesn't work
      textureLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr', 
        // Success callback
        (texture) => {
          this.matcapTexture = texture;
          if (this.material) {
            this.material.envMap = texture;
            this.material.needsUpdate = true;
          }
        },
        // Progress callback
        undefined,
        // Error callback
        (err) => {
          console.warn('Failed to load external texture, using local fallback');
        }
      );
    } catch (e) {
      console.warn('Error in loadMatcap:', e);
      this.matcapTexture = this.createMatcapTexture();
    }
  }
  
  createMatcapTexture() {
    // Create a custom matcap texture for brushed metal
    try {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Create a radial gradient for a silver matcap
      const gradient = ctx.createRadialGradient(
        size * 0.4, size * 0.4, 0,
        size * 0.5, size * 0.5, size * 0.7
      );
      
      // Silver matcap with highlight
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.2, '#f0f0f0');
      gradient.addColorStop(0.4, '#d0d0d0');
      gradient.addColorStop(0.7, '#a0a0a0');
      gradient.addColorStop(1, '#808080');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Add brushed metal texture using noise lines
      this.addBrushedMetalTexture(canvas, ctx, 0.1);
      
      // Create a texture from the canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      return texture;
    } catch (e) {
      console.warn('Error in createMatcapTexture:', e);
      return null;
    }
  }
  
  addBrushedMetalTexture(canvas, ctx, intensity) {
    try {
      const size = canvas.width;
      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;
      
      // Create brushed metal effect with horizontal lines
      for (let y = 0; y < size; y++) {
        // Vary the intensity slightly per line for more natural look
        const lineIntensity = intensity * (0.8 + Math.random() * 0.4);
        
        // Create a noise pattern for this line
        const noisePattern = [];
        for (let x = 0; x < size / 10; x++) {
          noisePattern.push((Math.random() - 0.5) * lineIntensity);
        }
        
        for (let x = 0; x < size; x++) {
          const idx = (y * size + x) * 4;
          // Use interpolated noise for smoother brushed effect
          const noiseIdx = Math.floor(x / 10);
          const noiseValue = noisePattern[noiseIdx % noisePattern.length];
          
          data[idx] = Math.min(255, Math.max(0, data[idx] * (1 + noiseValue)));
          data[idx+1] = Math.min(255, Math.max(0, data[idx+1] * (1 + noiseValue)));
          data[idx+2] = Math.min(255, Math.max(0, data[idx+2] * (1 + noiseValue)));
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Add subtle scratches
      this.addScratchesOverlay(canvas, ctx);
    } catch (e) {
      console.warn('Error in addBrushedMetalTexture:', e);
    }
  }
  
  addScratchesOverlay(canvas, ctx) {
    try {
      const size = canvas.width;
      
      // Draw some subtle scratches
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 20; i++) {
        const x1 = Math.random() * size;
        const y1 = Math.random() * size;
        const length = 50 + Math.random() * 100;
        const angle = Math.random() * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
        ctx.stroke();
      }
      
      // Add a few deeper scratches
      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      for (let i = 0; i < 5; i++) {
        const x1 = Math.random() * size;
        const y1 = Math.random() * size;
        const length = 20 + Math.random() * 80;
        const angle = Math.random() * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
        ctx.stroke();
      }
    } catch (e) {
      console.warn('Error in addScratchesOverlay:', e);
    }
  }

  createEnvironmentMap() {
    // We're using the HDR environment map loaded in main.js
    // No local fallback environment map needed anymore
  }
  
  setupLightProbe() {
    // Create a light probe to enhance reflections with realistic light
    if (THREE.LightProbe) {
      this.lightProbe = new THREE.LightProbe();
      this.lightProbe.intensity = 1.0;
      this.scene.add(this.lightProbe);
    }
    
    // Add ambient and direct lights regardless
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    const directLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directLight.position.set(1, 1, 1);
    
    this.scene.add(ambientLight);
    this.scene.add(directLight);
  }
  */

  createMesh() {
    // Determine chip size based on config
    const chipWidth = config.chipWidth * (1 - config.chipSpacing);
    const chipHeight = config.chipHeight * (1 - config.chipSpacing);
    const chipDepth = config.chipDepth;
    const cornerRadius = config.roundedCorners ? 0.1 : 0;
    
    // Use appropriate geometry based on config
    let geometry;
    
    try {
      if (config.roundedCorners && RoundedBoxGeometry) {
        geometry = new RoundedBoxGeometry(chipWidth, chipHeight, chipDepth, 8, cornerRadius);
      } else if (config.beveledCorners && MeshBeveledBoxGeometry) {
        geometry = new MeshBeveledBoxGeometry(chipWidth, chipHeight, chipDepth, 3, 0.05);
      } else {
        geometry = new THREE.BoxGeometry(chipWidth, chipHeight, chipDepth);
      }
    } catch (e) {
      // Fallback to basic geometry
      geometry = new THREE.BoxGeometry(chipWidth, chipHeight, chipDepth);
    }
    
    // Create material with improved reflectivity and transparency
    // Using settings closer to silver-3d-rectangle for guaranteed visibility
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(config.baseColor),
      metalness: 0.9,          // Higher metalness for better visibility (closer to silver-3d-rectangle's 1.0)
      roughness: 0.1,          // Low for more reflection
      reflectivity: 1.0,       // Maximum reflectivity
      envMapIntensity: 1.5,    // Higher intensity for more visible reflections
      transmission: 0.2,       // Reduced from 0.8 for better visibility
      thickness: 0.5,          // For glass refraction
      transparent: true,       // Enable transparency
      opacity: 0.9,            // Higher opacity for better visibility
      premultipliedAlpha: true // Match silver-3d-rectangle's approach
    });
    
    // Create the mesh
    this.mesh = new THREE.Mesh(geometry, material);
    
    // Add slight rotation for more reflection angles
    this.mesh.rotation.set(
      Math.random() * 0.05 - 0.025,
      Math.random() * 0.05 - 0.025,
      Math.random() * 0.05 - 0.025
    );
  }
  
  updatePosition() {
    // Get uniform grid layout
    const gridSize = config.gridSize;
    const spacing = config.gridSpacing;
    
    // Calculate position in the grid (centered)
    const x = (this.col - (gridSize - 1) / 2) * spacing;
    const y = ((gridSize - 1) / 2 - this.row) * spacing;
    const z = 0;
    
    // Update initial position
    this.initialPosition.set(x, y, z);
    this.mesh.position.copy(this.initialPosition);
    
    // Update hover position
    this.hoverPosition.set(x, y, z + config.hoverLift);
  }
  
  update(time) {
    if (!this.mesh) return;
    
    // Subtle floating animation
    if (!this.isHovered) {
      // Offset the time based on position to create a wave-like effect
      const timeOffset = this.row * 0.2 + this.col * 0.3;
      const floatHeight = Math.sin((time + timeOffset) * config.floatSpeed) * config.floatAmplitude;
      
      this.mesh.position.z = this.initialPosition.z + floatHeight;
      
      // Subtle rotation for more dynamism
      this.mesh.rotation.x = Math.sin(time * 0.2 + this.row * 0.5) * 0.03;
      this.mesh.rotation.y = Math.cos(time * 0.3 + this.col * 0.5) * 0.03;
    }
  }
  
  onHover(isHovered) {
    if (this.isHovered === isHovered) return;
    
    this.isHovered = isHovered;
    
    // Skip animations if gsap is not available
    if (typeof gsap === 'undefined') return;
    
    // Handle hover animation
    if (isHovered) {
      // Move up on hover
      gsap.to(this.mesh.position, {
        x: this.hoverPosition.x,
        y: this.hoverPosition.y,
        z: this.hoverPosition.z,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // Scale up slightly on hover
      gsap.to(this.mesh.scale, {
        x: this.hoverScale.x,
        y: this.hoverScale.y,
        z: this.hoverScale.z,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // Make material more reflective
      gsap.to(this.mesh.material, {
        envMapIntensity: 2.0,
        emissiveIntensity: 0.5,
        duration: 0.3
      });
      
      // Add soft emissive glow when hovered
      if (!this.mesh.material.emissive) this.mesh.material.emissive = new THREE.Color(0x333333);
      gsap.to(this.mesh.material, {
        emissiveIntensity: 0.5,
        duration: 0.3
      });
    } else {
      // Return to original position
      gsap.to(this.mesh.position, {
        x: this.initialPosition.x,
        y: this.initialPosition.y,
        z: this.initialPosition.z,
        duration: 0.5,
        ease: 'power2.out'
      });
      
      // Return to original scale
      gsap.to(this.mesh.scale, {
        x: this.originalScale.x,
        y: this.originalScale.y,
        z: this.originalScale.z,
        duration: 0.5,
        ease: 'power2.out'
      });
      
      // Reset material to normal properties
      gsap.to(this.mesh.material, {
        envMapIntensity: 1.0,
        emissiveIntensity: 0,
        duration: 0.5
      });
    }
  }
  
  onClick() {
    this.isAccented = !this.isAccented;
    
    // Skip animations if gsap is not available
    if (typeof gsap === 'undefined') {
      this.mesh.material.color.set(this.isAccented ? config.accentColor : config.baseColor);
      return;
    }
    
    if (this.isAccented) {
      // Change to accent color
      gsap.to(this.mesh.material.color, {
        r: config.accentColor.r,
        g: config.accentColor.g,
        b: config.accentColor.b,
        duration: 0.3
      });
    } else {
      // Change back to base color
      gsap.to(this.mesh.material.color, {
        r: config.baseColor.r,
        g: config.baseColor.g,
        b: config.baseColor.b,
        duration: 0.3
      });
    }
  }
  
  dispose() {
    if (this.mesh) {
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }
      
      if (this.mesh.material) {
        this.mesh.material.dispose();
      }
      
      this.scene.remove(this.mesh);
      this.mesh = null;
    }
  }
}

export default Chip;