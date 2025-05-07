// src/apps/spherical-scene/SphericalSceneApp.jsx
// A showcase app for interactive glass spheres in a 3D environment

import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Sphere } from '@react-three/drei';
import { glassMaterials } from '../../materials/glass';
import * as THREE from 'three';

// Custom scene component to set scene background to transparent
function TransparentScene() {
  const { scene } = useThree();
  scene.background = null;
  return null;
}

/**
 * Interactive floating sphere with physics-like movement
 */
const FloatingSphere = ({ 
  position, 
  size = 0.5, 
  material, 
  speed = 0.001,
  amplitude = 0.5
}) => {
  const sphereRef = useRef();
  const originalPosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const offset = useMemo(() => Math.random() * 1000, []);
  const [hovered, setHovered] = useState(false);
  
  // Physics-like floating animation
  useFrame(({ clock }) => {
    if (sphereRef.current) {
      const time = clock.getElapsedTime();
      
      // Rotation
      sphereRef.current.rotation.x = time * speed * 2;
      sphereRef.current.rotation.y = time * speed * 3;
      
      // Floating movement
      sphereRef.current.position.y = originalPosition.y + 
        Math.sin(time * 0.5 + offset) * amplitude * 0.2;
        
      // Slight horizontal movement
      sphereRef.current.position.x = originalPosition.x + 
        Math.sin(time * 0.3 + offset * 2) * amplitude * 0.1;
      sphereRef.current.position.z = originalPosition.z + 
        Math.cos(time * 0.4 + offset) * amplitude * 0.1;
    }
  });
  
  return (
    <Sphere
      ref={sphereRef}
      args={[size, 32, 32]}
      position={position}
      scale={hovered ? 1.2 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={material.clone()} attach="material" />
    </Sphere>
  );
};

/**
 * Back button component
 */
const BackButton = ({ onBack, position = [0, -3, 0] }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onClick={onBack}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <mesh>
        <planeGeometry args={[2, 0.6]} />
        <meshPhysicalMaterial 
          color="#4A90E2"
          transparent={true}
          transmission={0.6}
          roughness={0.2}
          metalness={0.1}
          clearcoat={0.8}
          opacity={0.9}
        />
      </mesh>
      
      <Text 
        position={[0, 0, 0.1]} 
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="center"
      >
        Back to Home
      </Text>
    </group>
  );
};

/**
 * Main app component for the Spherical Scene showcase
 */
const SphericalSceneApp = ({ onBack }) => {
  // Generate random spheres
  const spheres = useMemo(() => {
    const materials = [
      glassMaterials.silverGlass,
      glassMaterials.macOSGlass,
      glassMaterials.frostedBlue,
      glassMaterials.tintedGlass,
      glassMaterials.glowingBlue
    ];
    
    const result = [];
    const count = 20;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 4;
      
      result.push({
        position: [x, y, z],
        size: 0.2 + Math.random() * 0.8,
        material: materials[Math.floor(Math.random() * materials.length)],
        speed: 0.0005 + Math.random() * 0.001,
        amplitude: 0.3 + Math.random() * 0.7
      });
    }
    
    return result;
  }, []);
  
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0)' }}>
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ background: 'rgba(0, 0, 0, 0)' }}
        gl={{ 
          alpha: true, 
          antialias: true,
          clearColor: [0,0,0,0],
          clearAlpha: 0,
          preserveDrawingBuffer: true
        }}
        shadows
      >
        <TransparentScene />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <spotLight 
          position={[-5, 5, 5]} 
          intensity={1.0} 
          angle={0.3} 
          penumbra={0.5}
        />
        
        {/* Central light */}
        <pointLight position={[0, 0, 0]} intensity={1.0} color="#ffffff" />
        
        {/* App header */}
        <group position={[0, 3, 0]}>
          <mesh>
            <boxGeometry args={[6, 0.8, 0.1]} />
            <meshPhysicalMaterial 
              color="#1a1a2e" 
              transparent={true}
              transmission={0.4}
              roughness={0.1}
              metalness={0.3}
              clearcoat={1}
              opacity={0.9}
            />
          </mesh>
          
          <Text 
            position={[0, 0, 0.06]} 
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Sphere Showcase
          </Text>
        </group>
        
        {/* Generate spheres */}
        {spheres.map((sphere, index) => (
          <FloatingSphere 
            key={index}
            position={sphere.position}
            size={sphere.size}
            material={sphere.material}
            speed={sphere.speed}
            amplitude={sphere.amplitude}
          />
        ))}
        
        {/* Back button */}
        <BackButton onBack={onBack} />
        
        {/* Environment for lighting and reflections */}
        <Environment preset="sunset" background={false} />
        
        {/* Controls for interacting with the scene */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={12}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default SphericalSceneApp; 