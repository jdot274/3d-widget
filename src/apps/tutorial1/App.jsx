// src/apps/tutorial1/App.jsx
// Tutorial1 app - Enhanced 3D visualization with glass effects

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, ContactShadows, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

// Custom scene component to set scene background to transparent
function TransparentScene() {
  const { scene } = useThree();
  scene.background = null;
  return null;
}

// Glass cube with customizable properties
function GlassCube({ position, color = '#8ecdff', size = 1, opacity = 0.85, ...props }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Animation using useFrame
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
      
      // Pulse effect when clicked
      if (clicked) {
        const pulse = Math.sin(state.clock.getElapsedTime() * 3) * 0.05 + 1;
        meshRef.current.scale.set(pulse, pulse, pulse);
      }
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(!clicked)}
      {...props}
    >
      <boxGeometry args={[size, size, size]} />
      <meshPhysicalMaterial
        color={hovered ? '#ffffff' : color}
        metalness={0.1}
        roughness={0.05}
        transmission={0.9}
        thickness={0.5}
        ior={1.5}
        envMapIntensity={1.2}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transparent={true}
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Dynamic glass sphere
function GlassSphere({ position, color = '#88aaff', ...props }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(time) * 0.2;
      meshRef.current.material.emissiveIntensity = (Math.sin(time * 2) * 0.2) + 0.5;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position} {...props}>
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        metalness={0.0}
        roughness={0.1}
        transmission={0.95}
        thickness={0.5}
        ior={1.4}
        envMapIntensity={1.0}
        clearcoat={0.5}
        emissive={color}
        emissiveIntensity={0.5}
        transparent={true}
        opacity={0.9}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// Main Tutorial1 App component
function Tutorial1App() {
  const [perfLevel, setPerfLevel] = useState('high');
  
  // Adjust visualization based on performance level
  const getDetailLevel = () => {
    switch (perfLevel) {
      case 'low': return { cubes: 4, segments: 16 };
      case 'medium': return { cubes: 9, segments: 24 };
      case 'high': return { cubes: 16, segments: 32 };
      default: return { cubes: 9, segments: 24 };
    }
  };
  
  const detail = getDetailLevel();
  
  // Generate glass cubes grid
  const generateGlassCubes = () => {
    const cubes = [];
    const gridSize = Math.sqrt(detail.cubes);
    const spacing = 1.5;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i - (gridSize - 1) / 2) * spacing;
        const z = (j - (gridSize - 1) / 2) * spacing;
        
        // Vary colors slightly for visual interest
        const hue = (i * 10 + j * 25) % 360;
        const color = `hsl(${hue}, 70%, 70%)`;
        
        cubes.push(
          <GlassCube
            key={`cube-${i}-${j}`}
            position={[x, 0, z]}
            color={color}
            size={0.8}
            opacity={0.85}
          />
        );
      }
    }
    
    return cubes;
  };
  
  return (
    <div className="tutorial1-container">
      <Canvas
        camera={{ position: [0, 3, 6], fov: 45 }}
        gl={{
          alpha: true,
          antialias: true,
          clearColor: [0, 0, 0, 0],
          clearAlpha: 0,
          premultipliedAlpha: false,
          preserveDrawingBuffer: true
        }}
      >
        <TransparentScene />
        
        {/* Refined lighting setup */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
        <spotLight position={[-5, 5, -5]} intensity={0.8} angle={0.3} penumbra={0.5} />
        <pointLight position={[0, 4, 0]} intensity={0.5} color="#88ccff" />
        
        {/* Header text */}
        <Text 
          position={[0, 3, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          TUTORIAL 1
        </Text>
        
        {/* Generate glass cubes */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <group position={[0, 0, 0]}>
            {generateGlassCubes()}
          </group>
        </Float>
        
        {/* Center sphere */}
        <GlassSphere position={[0, 0.5, 0]} />
        
        {/* Contact shadows for depth */}
        <ContactShadows
          position={[0, -1.8, 0]}
          opacity={0.7}
          scale={15}
          blur={2.5}
          far={2}
          color="#000000"
        />
        
        {/* Environment map for reflections */}
        <Environment preset="city" background={false} />
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={12}
        />
      </Canvas>
      
      {/* Performance selector */}
      <div className="controls-panel">
        <h3>Quality Settings</h3>
        <div className="control-buttons">
          <button 
            className={perfLevel === 'low' ? 'active' : ''} 
            onClick={() => setPerfLevel('low')}
          >
            Low
          </button>
          <button 
            className={perfLevel === 'medium' ? 'active' : ''} 
            onClick={() => setPerfLevel('medium')}
          >
            Medium
          </button>
          <button 
            className={perfLevel === 'high' ? 'active' : ''} 
            onClick={() => setPerfLevel('high')}
          >
            High
          </button>
        </div>
        <p className="tip">Tip: Click objects to interact!</p>
      </div>
    </div>
  );
}

export default Tutorial1App; 