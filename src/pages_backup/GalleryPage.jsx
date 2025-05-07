// src/pages/GalleryPage.jsx
// 3D gallery to display user-created 3D objects

import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Text, PresentationControls, ContactShadows } from '@react-three/drei';
import { TransparentScene, StandardLighting } from '../../core/renderer.jsx';
import GlassGrid from '../components/grid/GlassGrid';
import GlowingSphere from '../components/sphere/GlowingSphere';
import './GalleryPage.css';

// Sample models - in a real app, these would come from a database or API
const models = [
  {
    id: 'sphere',
    name: 'Glowing Sphere',
    component: (props) => <GlowingSphere {...props} />,
    props: { size: 1.2, color: '#4A90E2', position: [0, 0, 0] }
  },
  {
    id: 'grid',
    name: 'Glass Grid',
    component: (props) => <GlassGrid {...props} />,
    props: { rows: 4, columns: 4, cellSize: 0.3, gap: 0.05, position: [0, 0, 0] }
  }
];

/**
 * Preview platform for displaying a 3D model
 */
const ModelPlatform = ({ children, title, isSelected, onClick }) => {
  const groupRef = useRef();
  
  // Gentle floating animation
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.05;
  });
  
  return (
    <group 
      ref={groupRef}
      onClick={onClick}
      scale={isSelected ? 1.1 : 1}
    >
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
      
      {/* Model title */}
      <Text
        position={[0, -1.3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
      >
        {title}
      </Text>
      
      {/* The 3D model */}
      <group position={[0, 0, 0]}>
        {children}
      </group>
    </group>
  );
};

/**
 * Main gallery page with 3D model display
 */
const GalleryPage = () => {
  const [selectedModel, setSelectedModel] = useState(0);
  
  // Handler for clicking on a model
  const handleModelClick = (index) => {
    setSelectedModel(index);
  };
  
  // Calculate positions in a circle
  const getModelPosition = (index, total) => {
    const radius = 6;
    const angle = (index / total) * Math.PI * 2;
    return [
      Math.sin(angle) * radius,
      0,
      Math.cos(angle) * radius
    ];
  };
  
  return (
    <div className="gallery-container">
      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        <color attach="background" args={[0, 0, 0, 0]} />
        <fog attach="fog" args={['#16213e', 15, 25]} />
        <TransparentScene />
        
        <Suspense fallback={null}>
          <StandardLighting intensity={1.5} />
          
          {/* Main selected model in center with controls */}
          <PresentationControls
            global
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
            config={{ mass: 2, tension: 400 }}
            snap={{ mass: 4, tension: 300 }}
          >
            <group position={[0, 0, 0]}>
              {models[selectedModel].component(models[selectedModel].props)}
            </group>
          </PresentationControls>
          
          {/* Gallery of models around the edge */}
          {models.map((model, index) => (
            <group 
              key={model.id}
              position={getModelPosition(index, models.length)}
              scale={0.5}
            >
              <ModelPlatform
                title={model.name}
                isSelected={selectedModel === index}
                onClick={() => handleModelClick(index)}
              >
                {model.component(model.props)}
              </ModelPlatform>
            </group>
          ))}
          
          {/* Environment and shadows */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={10}
            blur={1.5}
            far={1.5}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
      
      <div className="gallery-controls">
        <h2>{models[selectedModel].name}</h2>
        <p>Click models to view, drag to rotate</p>
      </div>
    </div>
  );
};

export default GalleryPage; 