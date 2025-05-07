// core/renderer.js
// Core rendering functionality shared across all apps

import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

// Critical transparency settings
THREE.ColorManagement.enabled = false;

/**
 * Creates a properly configured Canvas component with transparency settings
 * This ensures all apps use the same core renderer configuration
 */
export const TransparentCanvas = ({ children, ...props }) => (
  <Canvas
    frameloop="always"
    legacy={true}
    gl={{
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      toneMapping: THREE.NoToneMapping,
      outputColorSpace: 'srgb'
    }}
    {...props}
  >
    <color attach="background" args={[0, 0, 0, 0]} />
    {children}
  </Canvas>
);

/**
 * Utility component to ensure scene background is null
 * Critical for proper transparency
 */
export const TransparentScene = () => {
  const { scene } = useThree();
  
  useEffect(() => {
    if (scene) {
      scene.background = null;
      scene.environment = null;
    }
  }, [scene]);
  
  return null;
};

/**
 * Standard lighting setup for glass/transparent materials
 */
export const StandardLighting = () => (
  <>
    <ambientLight intensity={0.4} />
    <directionalLight position={[5, 5, 5]} intensity={0.7} castShadow />
    <pointLight position={[-5, 5, -5]} intensity={0.5} />
  </>
); 