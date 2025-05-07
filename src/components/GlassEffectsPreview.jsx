import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import useMaterialStore from '../store/useMaterialStore';

export default function GlassEffectsPreview({ position = [0, 0, 0] }) {
  const groupRef = useRef();
  const getCurrentMaterialValues = useMaterialStore(state => state.getCurrentMaterialValues);
  const values = getCurrentMaterialValues();

  useFrame((state) => {
    if (groupRef.current) {
      // Rotate the preview slowly
      groupRef.current.rotation.y += 0.002;
      
      // Add subtle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  // Create environment objects to demonstrate glass effects
  const renderEnvironmentObjects = () => {
    const objects = [];
    const radius = 1;
    const count = 8;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      objects.push(
        <Box
          key={i}
          position={[x, 0, z]}
          scale={[0.1, 0.5, 0.1]}
        >
          <meshStandardMaterial color="#444" />
        </Box>
      );
    }

    return objects;
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Main glass sphere */}
      <Sphere args={[0.4, 32, 32]}>
        <meshPhysicalMaterial
          color={values.color || '#6EC1FF'}
          metalness={values.metalness || 0}
          roughness={values.roughness || 0.55}
          transmission={values.transmission || 0.85}
          opacity={values.opacity || 0.85}
          transparent={true}
          ior={values.ior || 1.45}
          thickness={values.thickness || 0.35}
          envMapIntensity={values.envMapIntensity || 0.4}
          clearcoat={values.clearcoat || 0.15}
          clearcoatRoughness={values.clearcoatRoughness || 0.25}
          emissive={new THREE.Color(values.emissive || '#ffffff')}
          emissiveIntensity={values.emissiveIntensity || 0}
        />
      </Sphere>

      {/* Environment objects to demonstrate refraction and reflection */}
      {renderEnvironmentObjects()}

      {/* Light source for caustics demonstration */}
      <pointLight
        position={[1, 2, 1]}
        intensity={values.causticsIntensity ? values.causticsIntensity * 2 : 1}
        color="#ffffff"
      />

      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.2} />
    </group>
  );
} 