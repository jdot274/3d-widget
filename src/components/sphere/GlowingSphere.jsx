// src/components/sphere/GlowingSphere.jsx
// A reusable glowing sphere component

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { glassMaterials } from '../../materials/glass';

/**
 * A glowing sphere component that can be used in any app
 * @param {Object} props - Component properties
 * @returns {JSX.Element} Glowing sphere component
 */
const GlowingSphere = ({ 
  position = [0, 0, 0], 
  size = 1, 
  color = '#4A90E2',
  intensity = 0.7,
  rotationSpeed = 0.003,
  ...props 
}) => {
  const sphereRef = useRef();
  
  // Continuous rotation to maintain visibility and reflections
  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x += rotationSpeed;
      sphereRef.current.rotation.y += rotationSpeed * 1.5;
    }
  });
  
  // Create a custom glowing material or use a preset
  const glowingMaterial = glassMaterials.glowingBlue;
  
  return (
    <Sphere
      ref={sphereRef}
      args={[size, 32, 32]} // Radius, width segments, height segments
      position={position}
      {...props}
    >
      <primitive object={glowingMaterial} attach="material" />
    </Sphere>
  );
};

export default GlowingSphere; 