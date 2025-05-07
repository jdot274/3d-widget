// src/apps/spherical-designer/SphericalDesignerApp.jsx
// A dedicated app for designing glass spheres, bridging 2D and 3D design

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Sphere, useCursor } from '@react-three/drei';
import { glassMaterials } from '../../materials/glass';
import * as THREE from 'three';

// Custom scene component to set scene background to transparent
function TransparentScene() {
  const { scene } = useThree();
  scene.background = null;
  return null;
}

/**
 * Material selector panel for the spherical designer app
 */
const MaterialPanel = ({ onSelectMaterial, selectedMaterial, position = [-4, 0, 0] }) => {
  const [hoveredMaterial, setHoveredMaterial] = useState(null);
  
  const materials = [
    { id: 'silverGlass', name: 'Silver Glass', material: glassMaterials.silverGlass, position: [0, 2, 0] },
    { id: 'macOSGlass', name: 'macOS Glass', material: glassMaterials.macOSGlass, position: [0, 1, 0] },
    { id: 'frostedBlue', name: 'Frosted Blue', material: glassMaterials.frostedBlue, position: [0, 0, 0] },
    { id: 'tintedGlass', name: 'Gold Tint', material: glassMaterials.tintedGlass, position: [0, -1, 0] },
    { id: 'glowingBlue', name: 'Glowing Blue', material: glassMaterials.glowingBlue, position: [0, -2, 0] },
  ];
  
  return (
    <group position={position}>
      {/* Panel background */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[2, 5.5]} />
        <meshPhysicalMaterial 
          color="#1a1a2e"
          transparent={true}
          transmission={0.2}
          roughness={0.1}
          metalness={0.3}
          clearcoat={1}
          opacity={0.8}
        />
      </mesh>
      
      {/* Panel header */}
      <Text 
        position={[0, 3, 0]} 
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="center"
      >
        Materials
      </Text>
      
      {/* Material options */}
      {materials.map((mat) => (
        <group 
          key={mat.id} 
          position={mat.position}
          onPointerOver={() => setHoveredMaterial(mat.id)}
          onPointerOut={() => setHoveredMaterial(null)}
          onClick={() => onSelectMaterial(mat.id, mat.material)}
          scale={hoveredMaterial === mat.id ? 1.1 : 1}
        >
          {/* Material preview sphere */}
          <Sphere args={[0.3, 32, 32]} position={[-0.6, 0, 0]}>
            <primitive object={mat.material.clone()} attach="material" />
          </Sphere>
          
          {/* Material name */}
          <Text 
            position={[0.5, 0, 0]} 
            fontSize={0.18}
            color={selectedMaterial === mat.id ? "#88ccff" : "white"}
            anchorX="center"
            anchorY="center"
          >
            {mat.name}
          </Text>
        </group>
      ))}
    </group>
  );
};

/**
 * 2D Pattern Designer panel
 */
const PatternDesignerPanel = ({ onUpdatePattern, position = [0, -2.5, 0] }) => {
  const [activePattern, setActivePattern] = useState('gradient');
  const [hoveredButton, setHoveredButton] = useState(null);
  
  const patternButtons = [
    { id: 'gradient', name: 'Gradient', position: [-2.5, 0, 0] },
    { id: 'dots', name: 'Dots', position: [-1.5, 0, 0] },
    { id: 'stripes', name: 'Stripes', position: [-0.5, 0, 0] },
    { id: 'waves', name: 'Waves', position: [0.5, 0, 0] },
    { id: 'noise', name: 'Noise', position: [1.5, 0, 0] },
    { id: 'solid', name: 'Solid', position: [2.5, 0, 0] },
  ];
  
  return (
    <group position={position}>
      {/* Panel background */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[6, 1]} />
        <meshPhysicalMaterial 
          color="#1a1a2e"
          transparent={true}
          transmission={0.2}
          roughness={0.1}
          metalness={0.3}
          clearcoat={1}
          opacity={0.8}
        />
      </mesh>
      
      {/* Panel header */}
      <Text 
        position={[0, 0.5, 0]} 
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="center"
      >
        2D Pattern
      </Text>
      
      {/* Pattern buttons */}
      {patternButtons.map((btn) => (
        <group 
          key={btn.id} 
          position={btn.position}
          onPointerOver={() => setHoveredButton(btn.id)}
          onPointerOut={() => setHoveredButton(null)}
          onClick={() => {
            setActivePattern(btn.id);
            onUpdatePattern(btn.id);
          }}
          scale={hoveredButton === btn.id ? 1.1 : 1}
        >
          <mesh>
            <boxGeometry args={[0.8, 0.5, 0.05]} />
            <meshPhysicalMaterial 
              color={activePattern === btn.id ? "#4A90E2" : "#2A2A2A"}
              transparent={true}
              transmission={0.7}
              roughness={0.2}
              metalness={0.1}
              clearcoat={0.8}
              opacity={0.9}
            />
          </mesh>
          
          <Text 
            position={[0, 0, 0.06]} 
            fontSize={0.12}
            color="white"
            anchorX="center"
            anchorY="center"
          >
            {btn.name}
          </Text>
        </group>
      ))}
    </group>
  );
};

/**
 * Controls panel for the spherical designer app
 */
const ControlsPanel = ({ onBack, onUpdateSize, sphereSize, position = [4, 0, 0] }) => {
  const [hovered, setHovered] = useState(null);
  
  const sizeOptions = [
    { id: 'small', name: 'Small', value: 0.6, position: [0, 1.5, 0] },
    { id: 'medium', name: 'Medium', value: 1.0, position: [0, 0.5, 0] },
    { id: 'large', name: 'Large', value: 1.4, position: [0, -0.5, 0] },
  ];
  
  return (
    <group position={position}>
      {/* Panel background */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[2, 5.5]} />
        <meshPhysicalMaterial 
          color="#1a1a2e"
          transparent={true}
          transmission={0.2}
          roughness={0.1}
          metalness={0.3}
          clearcoat={1}
          opacity={0.8}
        />
      </mesh>
      
      {/* Panel header */}
      <Text 
        position={[0, 3, 0]} 
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="center"
      >
        Controls
      </Text>
      
      {/* Size controls */}
      <Text 
        position={[0, 2.5, 0]} 
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="center"
      >
        Size
      </Text>
      
      {sizeOptions.map((option) => (
        <group 
          key={option.id} 
          position={option.position}
          onPointerOver={() => setHovered(option.id)}
          onPointerOut={() => setHovered(null)}
          onClick={() => onUpdateSize(option.value)}
          scale={hovered === option.id ? 1.1 : 1}
        >
          <mesh>
            <planeGeometry args={[1.5, 0.4]} />
            <meshPhysicalMaterial 
              color={Math.abs(sphereSize - option.value) < 0.1 ? "#4A90E2" : "#2A2A2A"}
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
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="center"
          >
            {option.name}
          </Text>
        </group>
      ))}
      
      {/* Back button */}
      <group 
        position={[0, -2.5, 0]}
        onClick={onBack}
        onPointerOver={() => setHovered('back')}
        onPointerOut={() => setHovered(null)}
        scale={hovered === 'back' ? 1.1 : 1}
      >
        <mesh>
          <planeGeometry args={[1.5, 0.5]} />
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
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="center"
        >
          Back to Home
        </Text>
      </group>
    </group>
  );
};

/**
 * Interactive Sphere Preview that responds to design changes
 */
const DesignedSphere = ({ material, size, pattern, position = [0, 0, 0] }) => {
  const sphereRef = useRef();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  
  // Apply continuous rotation
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  // Create texture based on pattern
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply different patterns
    switch (pattern) {
      case 'gradient':
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#4A90E2');
        gradient.addColorStop(1, '#ffffff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;
        
      case 'dots':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4A90E2';
        for (let x = 0; x < canvas.width; x += 40) {
          for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.arc(x + 20, y + 20, 10, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
        
      case 'stripes':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4A90E2';
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.fillRect(0, y, canvas.width, 20);
        }
        break;
        
      case 'waves':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#4A90E2';
        ctx.lineWidth = 15;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 5) {
          const y = Math.sin(x * 0.02) * 50 + canvas.height / 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        break;
        
      case 'noise':
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const noise = Math.floor(Math.random() * 100);
          data[i] = noise < 50 ? 74 : 255; // R
          data[i + 1] = noise < 50 ? 144 : 255; // G
          data[i + 2] = noise < 50 ? 226 : 255; // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        break;
        
      case 'solid':
      default:
        // Default is just white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        break;
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, [pattern]);
  
  // Clone the material and apply the pattern texture
  const modifiedMaterial = useMemo(() => {
    if (!material) return null;
    
    const newMaterial = material.clone();
    if (pattern !== 'solid') {
      newMaterial.map = texture;
    }
    return newMaterial;
  }, [material, texture, pattern]);
  
  if (!modifiedMaterial) return null;
  
  return (
    <Sphere
      ref={sphereRef}
      args={[size, 64, 64]}
      position={position}
      scale={hovered ? 1.05 : 1}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={modifiedMaterial} attach="material" />
    </Sphere>
  );
};

/**
 * Main app component for the Spherical Designer
 */
const SphericalDesignerApp = ({ onBack }) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState('silverGlass');
  const [selectedMaterial, setSelectedMaterial] = useState(glassMaterials.silverGlass);
  const [sphereSize, setSphereSize] = useState(1.0);
  const [pattern, setPattern] = useState('gradient');
  
  // Apply selected material to the designer when changed
  const handleSelectMaterial = (id, material) => {
    setSelectedMaterialId(id);
    setSelectedMaterial(material);
  };
  
  // Update sphere size
  const handleUpdateSize = (size) => {
    setSphereSize(size);
  };
  
  // Update pattern
  const handleUpdatePattern = (patternId) => {
    setPattern(patternId);
  };
  
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
            Spherical Designer
          </Text>
        </group>
        
        {/* 3D Preview of designed sphere */}
        <DesignedSphere 
          material={selectedMaterial}
          size={sphereSize}
          pattern={pattern}
          position={[0, 0, 0]}
        />
        
        {/* 2D Pattern Design Panel */}
        <PatternDesignerPanel
          onUpdatePattern={handleUpdatePattern}
          position={[0, -2.5, 0]}
        />
        
        {/* Side panels */}
        <MaterialPanel 
          onSelectMaterial={handleSelectMaterial} 
          selectedMaterial={selectedMaterialId}
          position={[-4, 0, 0]} 
        />
        <ControlsPanel 
          onBack={onBack} 
          onUpdateSize={handleUpdateSize}
          sphereSize={sphereSize}
          position={[4, 0, 0]} 
        />
        
        {/* Environment for lighting and reflections */}
        <Environment preset="city" background={false} />
        
        {/* Controls for interacting with the spheres */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={4}
          maxDistance={10}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default SphericalDesignerApp; 