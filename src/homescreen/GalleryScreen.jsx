// src/homescreen/GalleryScreen.jsx
// A simple gallery to showcase 3D objects

import React, { Suspense, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Text, PresentationControls } from '@react-three/drei';
import './GalleryScreen.css';

// Custom scene component to set scene background to transparent
function TransparentScene() {
  const { scene } = useThree();
  scene.background = null;
  return null;
}

/**
 * Simple platform to display a 3D model
 */
const ModelDisplay = ({ children, name }) => {
  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, -1, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2, 0.1, 32]} />
        <meshPhysicalMaterial 
          color="#1a1a2e"
          metalness={0.2}
          roughness={0.1}
          clearcoat={0.5}
        />
      </mesh>
      
      {/* Model name */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      
      {/* The 3D model */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
};

/**
 * Gallery screen component
 */
const GalleryScreen = ({ onBack }) => {
  // Here we would typically load models from a database
  // For now we'll use placeholders
  
  return (
    <div className="gallery-container">
      <Canvas 
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ background: 'rgba(0, 0, 0, 0)' }}
        gl={{ 
          alpha: true, 
          antialias: true,
          clearColor: [0,0,0,0],
          clearAlpha: 0,
          preserveDrawingBuffer: true
        }}
      >
        <color attach="background" args={[0, 0, 0, 0]} />
        <TransparentScene />
        
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
          
          {/* Model display with controls */}
          <PresentationControls
            global
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <ModelDisplay name="Glass Sphere">
              {/* Placeholder sphere - in reality you would import model components */}
              <mesh castShadow>
                <sphereGeometry args={[1, 32, 32]} />
                <meshPhysicalMaterial 
                  color="#4A90E2" 
                  transparent={true}
                  transmission={0.9}
                  roughness={0}
                  clearcoat={1}
                />
              </mesh>
            </ModelDisplay>
          </PresentationControls>
          
          {/* Environment for lighting and reflections */}
          <Environment preset="city" background={false} />
        </Suspense>
      </Canvas>
      
      <button className="back-button" onClick={onBack}>
        Back to Home
      </button>
    </div>
  );
};

export default GalleryScreen; 