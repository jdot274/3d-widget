// src/pages/HomePage.jsx
// 3D transparent home page with direct access to editor and gallery

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Text, useTexture } from '@react-three/drei';
import './HomePage.css';
import { TransparentScene, StandardLighting } from '../../core/renderer.jsx';
import GlowingSphere from '../components/sphere/GlowingSphere';

// Apps that can be launched from the home screen
const APPS = [
  {
    id: 'editor',
    name: '3D Editor',
    description: 'Create and customize 3D glass objects',
    position: [-2, 0, 0],
    color: '#4A90E2'
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Browse your 3D creations',
    position: [2, 0, 0],
    color: '#5E5AEC'
  }
];

/**
 * 3D App Card that can be interacted with in 3D space
 */
const App3DCard = ({ name, description, position, color, onClick }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
      scale={hovered ? 1.1 : 1}
    >
      {/* Card base */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshPhysicalMaterial 
          color={color} 
          transparent={true}
          transmission={0.6}
          roughness={0.2}
          metalness={0.1}
          clearcoat={0.8}
          opacity={0.8}
        />
      </mesh>
      
      {/* Card text */}
      <Text 
        position={[0, 0.2, 0.06]} 
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        {name}
      </Text>
      
      <Text 
        position={[0, -0.2, 0.06]} 
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Regular.woff"
        maxWidth={1.8}
      >
        {description}
      </Text>
    </group>
  );
};

/**
 * Floating header with glass effect
 */
const GlassHeader = () => {
  return (
    <group position={[0, 2, 0]}>
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
        font="/fonts/Inter-Bold.woff"
      >
        Glass Grid Studio
      </Text>
    </group>
  );
};

/**
 * Home page as a 3D transparent widget with access to editor and gallery
 */
const HomePage = () => {
  const [currentApp, setCurrentApp] = useState(null);
  
  const launchApp = (appId) => {
    setCurrentApp(appId);
    // In a real app, you would use routing to navigate to the app
    console.log(`Launching app: ${appId}`);
    window.location.href = `/apps/${appId}`;
  };
  
  return (
    <div className="home-container">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <color attach="background" args={[0, 0, 0, 0]} />
        <fog attach="fog" args={['#16213e', 10, 20]} />
        <TransparentScene />
        
        <Suspense fallback={null}>
          <StandardLighting />
          
          {/* Decorative elements */}
          <GlowingSphere position={[-4, -1, -2]} size={0.8} color="#5E5AEC" intensity={0.6} />
          <GlowingSphere position={[4, -2, -3]} size={1.2} color="#4A90E2" intensity={0.7} />
          <GlowingSphere position={[0, 3, -4]} size={1.5} color="#6A5AFF" intensity={0.5} />
          
          {/* Header */}
          <GlassHeader />
          
          {/* App cards */}
          {APPS.map((app) => (
            <App3DCard 
              key={app.id}
              name={app.name}
              description={app.description}
              position={app.position}
              color={app.color}
              onClick={() => launchApp(app.id)}
            />
          ))}
          
          {/* Environment for lighting and reflections */}
          <Environment preset="city" />
        </Suspense>
      </Canvas>
      
      <div className="home-overlay">
        <p>Click on an app to launch it</p>
      </div>
    </div>
  );
};

export default HomePage; 