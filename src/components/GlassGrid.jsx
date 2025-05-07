import React, { useRef } from 'react';
import GlassChip from './GlassChip';
import GlowingButton from './GlowingButton';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import GlassEffectsPreview from './GlassEffectsPreview';
// Preserving original imports as comments
// import { useFrame } from '@react-three/fiber';
// import { useSpring, animated } from '@react-spring/three';

// Configuration for grid
const GRID_SIZE = 4; // 4x4 grid
const GRID_SPACING = 1.6; // Spacing between chips

// Simplified GlassGrid based on silver-3d-rectangle
export default function GlassGrid(props) {
  const groupRef = useRef();
  
  // Get THREE scene to set background to null - CRITICAL for transparency
  const { scene } = useThree();
  
  // Make sure scene background is null - CRITICAL for transparency
  React.useEffect(() => {
    if (scene) {
      scene.background = null;
    }
  }, [scene]);
  
  /* Original more complex implementation preserved as comment
  // Original enhanced grid with silver-3d-rectangle techniques
  function OriginalGlassGrid() {
    const groupRef = useRef();
    
    // Get THREE scene and renderer to configure transparency properly
    const { scene, gl, camera } = useThree();
    
    // Add spring animation for the entire grid
    const [spring, api] = useSpring(() => ({
      'rotation.x': 0,
      'rotation.y': 0,
      config: { mass: 2, tension: 150, friction: 15 }
    }));
    
    // Critical renderer settings - these must be set for transparency to work
    useEffect(() => {
      if (scene) {
        // CRITICAL FOR TRANSPARENCY - must set background to null
        scene.background = null;
        
        // CRITICAL: Set background alpha to zero
        scene.backgroundBlurriness = 0;
        scene.backgroundIntensity = 0;
        scene.environment = null; // We'll use a dedicated Environment component
        
        console.log('Configured scene for transparency');
      }
      
      if (gl) {
        // CRITICAL FOR TRANSPARENCY - must set clear color with zero alpha
        gl.setClearColor(0, 0, 0, 0);
        gl.clearColor(0, 0, 0, 0);
        gl.clear();
        
        // CRITICAL FOR TRANSPARENCY - must set flags correctly
        gl.autoClear = true;
        gl.autoClearColor = true;
        gl.autoClearDepth = true;
        gl.premultipliedAlpha = false;
        gl.alpha = true;
        gl.localClippingEnabled = true;
        
        // CRITICAL: Set render parameters
        gl.info.autoReset = true;
        gl.physicallyCorrectLights = true;
        gl.outputEncoding = THREE.sRGBEncoding;
        gl.toneMapping = THREE.NoToneMapping; // No tone mapping for transparency
        
        console.log('Configured renderer for transparency');
      }
      
      // Create a dedicated high-priority render loop for transparency
      let frameId;
      const renderLoop = () => {
        if (gl && scene && camera) {
          gl.clear();
          gl.render(scene, camera);
        }
        frameId = requestAnimationFrame(renderLoop);
      };
      
      renderLoop();
      
      return () => {
        if (frameId) cancelAnimationFrame(frameId);
      };
    }, [scene, gl, camera]);
    
    // Force continuous rendering - CRITICAL FOR TRANSPARENCY
    useFrame((state) => {
      // Enhanced group movement for better visibility
      if (groupRef.current) {
        const time = state.clock.elapsedTime;
        
        // More dynamic movement
        groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.15;
        groupRef.current.rotation.x = Math.sin(time * 0.15) * 0.08;
        
        // Add subtle "breathing" scaling effect
        const scale = 1 + Math.sin(time * 0.4) * 0.05;
        groupRef.current.scale.set(scale, scale, scale);
        
        // HACK: Apply tiny position changes to force constant rendering
        groupRef.current.position.y = Math.sin(time * 0.2) * 0.001;
        
        // Silver-3d-rectangle style continuous motion
        groupRef.current.rotation.y += 0.001;
        groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.05;
      }
      
      // CRITICAL FOR TRANSPARENCY: Force rendering each frame
      if (gl && scene && camera) {
        gl.clear();
      }
    });
    
    return (
      <animated.group ref={groupRef} renderOrder={1000} {...spring}>
        {renderChips()}
      </animated.group>
    );
  }
  */
  
  // Create chips with grid layout
  const renderChips = () => {
    const chips = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        // Calculate position
        const x = (col - (GRID_SIZE - 1) / 2) * GRID_SPACING;
        const y = ((GRID_SIZE - 1) / 2 - row) * GRID_SPACING;
        
        // Stagger z positions slightly for better visibility
        const z = ((row + col) % 2 === 0) ? 0 : -0.2;
        
        /* Original complex position calculation preserved as comment
        // Stagger z positions for more visual interest
        // Create a 3D formation instead of flat grid
        const isOdd = (row + col) % 2 === 1;
        const z = isOdd ? 0.3 : -0.3; // More pronounced z-variation
        
        // Randomize initial rotation slightly for more natural look
        const rotationOffset = (Math.random() * 0.3 - 0.15) + (row * 0.05) + (col * 0.05);
        */
        
        chips.push(
          <GlassChip 
            key={`${row}-${col}`}
            position={[x, y, z]} 
            row={row}
            col={col}
          />
        );
      }
    }
    
    return chips;
  };
  
  return (
    <group ref={groupRef} {...props}>
      {renderChips()}
      <GlowingButton position={[0, -(GRID_SIZE / 2 * GRID_SPACING) + 1.5, 0]} />
      <GlassEffectsPreview position={[2, 0, 0]} />
    </group>
  );
} 