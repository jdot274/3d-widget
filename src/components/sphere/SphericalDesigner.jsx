// src/components/sphere/SphericalDesigner.jsx
// Interactive spherical designer that displays floating spheres with different glass materials

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { glassMaterials } from '../../materials/glass';

/**
 * A 3D spherical designer component with interactive glass spheres
 */
const SphericalDesigner = ({ position = [0, 0, 0], scale = 1 }) => {
  const groupRef = useRef();
  const [activeSphere, setActiveSphere] = useState(null);
  const [hovered, setHovered] = useState(null);
  useCursor(!!hovered);
  
  // Store sphere configurations
  const sphereConfigs = [
    { position: [0, 0, 0], size: 0.8, material: glassMaterials.silverGlass, speed: 0.0015 },
    { position: [-1.5, 1, -0.5], size: 0.4, material: glassMaterials.frostedBlue, speed: 0.002 },
    { position: [1.5, 0.8, 0.2], size: 0.5, material: glassMaterials.macOSGlass, speed: 0.001 },
    { position: [-0.8, -1.2, 0.3], size: 0.6, material: glassMaterials.glowingBlue, speed: 0.0025 },
    { position: [1.2, -0.9, -0.4], size: 0.45, material: glassMaterials.tintedGlass, speed: 0.0018 }
  ];

  // Animate the entire group
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.2;
      groupRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.05) * 0.1;
    }
  });

  return (
    <group position={position} scale={scale} ref={groupRef}>
      {/* Central glow effect */}
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#88ccff" />
      
      {/* Individual spheres */}
      {sphereConfigs.map((config, index) => (
        <InteractiveSphere 
          key={index}
          position={config.position}
          size={config.size}
          material={config.material}
          rotationSpeed={config.speed}
          isActive={activeSphere === index}
          setActive={() => setActiveSphere(index)}
          setHovered={(hover) => setHovered(hover ? index : null)}
        />
      ))}
    </group>
  );
};

/**
 * Individual interactive sphere with animation and hover effects
 */
const InteractiveSphere = ({ 
  position, 
  size, 
  material, 
  rotationSpeed, 
  isActive, 
  setActive,
  setHovered 
}) => {
  const sphereRef = useRef();
  
  // Apply continuous rotation to each sphere
  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x += rotationSpeed;
      sphereRef.current.rotation.y += rotationSpeed * 1.5;
    }
  });
  
  return (
    <Sphere
      ref={sphereRef}
      args={[size, 32, 32]}
      position={position}
      onClick={() => setActive()}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={isActive ? 1.1 : 1}
    >
      <primitive object={material.clone()} attach="material" />
    </Sphere>
  );
};

export default SphericalDesigner; 