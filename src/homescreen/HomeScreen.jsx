// src/homescreen/HomeScreen.jsx
// 3D transparent home page with access to editor and gallery apps

import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './HomeScreen.css';
import { addEventDebugging, checkPointerEvents } from './EventDebug';

/**
 * 3D App Card that can be interacted with in 3D space
 */
const App3DCard = ({ name, description, position, color, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  
  // Use useFrame to animate the hover effect more smoothly
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, hovered ? 1.1 : 1, 0.1);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, hovered ? 1.1 : 1, 0.1);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, hovered ? 1.1 : 1, 0.1);
    }
  });
  
  // Create a direct click handler for this specific card
  const handleClick = (e) => {
    e.stopPropagation();
    console.log(`Card clicked: ${name}`);
    
    // Add delay to ensure event is processed
    setTimeout(() => {
      onClick();
    }, 10);
  };
  
  return (
    <group 
      ref={meshRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={handleClick}
    >
      {/* Card base */}
      <mesh 
        castShadow 
        receiveShadow 
        position={[0, 0, 0]}
        onClick={handleClick} // Add click handler directly to mesh as well
      >
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
        onClick={handleClick} // Add click handler to text
      >
        {name}
      </Text>
      
      <Text 
        position={[0, -0.2, 0.06]} 
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
        onClick={handleClick} // Add click handler to text
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
    <group position={[0, 2.5, 0]}>
      {/* Header background */}
      <mesh receiveShadow>
        <boxGeometry args={[8, 1, 0.05]} />
        <meshPhysicalMaterial
          color="#1a1a2e"
          transparent={true}
          transmission={0.4}
          roughness={0.1}
          metalness={0.2}
          clearcoat={0.8}
          opacity={0.7}
        />
      </mesh>
      
      {/* Header text */}
      <Text
        position={[0, 0, 0.04]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        GLASS GRID
      </Text>
    </group>
  );
};

/**
 * Scene component to make the background transparent and fix event handling
 */
const SceneSetup = () => {
  const { gl, scene, camera } = useThree();
  
  useEffect(() => {
    // Set transparent background
    gl.setClearColor(0x000000, 0);
    scene.background = null;
    
    // Set up camera and renderer
    gl.setPixelRatio(window.devicePixelRatio);
    camera.updateProjectionMatrix();
  }, [gl, scene, camera]);
  
  return null;
};

const HomeScreen = ({ onLaunchApp }) => {
  const canvasRef = useRef();
  const controlsRef = useRef();
  const containerRef = useRef();
  
  // Fix event handling when component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (canvas) {
      // Make sure the canvas has the correct event handling properties
      canvas.style.touchAction = 'none';
      canvas.style.pointerEvents = 'auto';
      
      // Add event listeners for mobile touch events
      const preventDefault = (e) => e.preventDefault();
      canvas.addEventListener('touchstart', preventDefault, { passive: false });
      
      // Add debug listeners for development
      addEventDebugging(canvas);
      
      return () => {
        canvas.removeEventListener('touchstart', preventDefault);
      };
    }
    
    if (container) {
      addEventDebugging(container);
    }
    
    // Run a pointer events check
    setTimeout(checkPointerEvents, 1000);
  }, []);
  
  // Apps that can be launched from the home screen
  const APPS = [
    {
      id: 'editor',
      name: '3D Editor',
      description: 'Create and customize 3D glass objects',
      position: [-4, 0.5, 0],
      color: '#4A90E2'
    },
    {
      id: 'gallery',
      name: 'Gallery',
      description: 'Browse your 3D creations',
      position: [-1.5, 0.5, 0],
      color: '#5E5AEC'
    },
    {
      id: 'spherical_designer',
      name: 'Spherical Designer',
      description: 'Create custom spheres with 2D patterns',
      position: [1.5, 0.5, 0],
      color: '#5DADE2'
    },
    {
      id: 'weather-ecosystem',
      name: 'Weather Ecosystem',
      description: 'Interactive 3D globe with weather and flight data',
      position: [4, 0.5, 0],
      color: '#00AA88'
    },
    {
      id: 'three-globe-earth',
      name: 'Earth Globe',
      description: 'Interactive 3D Earth visualization',
      position: [0, -1.5, 0],
      color: '#2ECC71'
    },
    {
      id: 'three-globe-earth2',
      name: 'Earth Globe 2',
      description: 'Alternative Earth visualization',
      position: [4, -1.5, 0],
      color: '#3498DB'
    },
    {
      id: 'atmospheric-globe',
      name: 'Atmospheric Globe',
      description: 'Basic interactive Earth globe with clouds',
      position: [-4, -1.0, 0], // Positioned below 3D Editor
      color: '#4CAF50' // A green color
    },
    {
      id: 'earth-widget',
      name: 'Earth Widget',
      description: 'Advanced Earth visualization with shader effects',
      position: [-1.5, -1.0, 0], // Positioned below Gallery
      color: '#E67E22' // Orange color
    },
    {
      id: 'spline-widget',
      name: 'Floating Glass Widget',
      description: 'Modern floating glass sphere with dynamic effects',
      position: [1.5, -1.0, 0], // Positioned next to Earth Widget
      color: '#4a9eff' // Matching the widget's glow color
    },
    {
      id: 'gallery2',
      name: '3D Widget Gallery',
      description: 'Browse all floating 3D widget scenes',
      position: [0, -3, 0],
      color: '#00bcd4'
    }
  ];
  
  // Handle card click with explicit function
  const handleCardClick = (appId) => {
    console.log(`Launching app: ${appId}`);
    onLaunchApp(appId);
  };
  
  return (
    <div className="home-container" ref={containerRef}>
      <Canvas 
        ref={canvasRef}
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ 
          background: 'rgba(0, 0, 0, 0)',
          touchAction: 'none',
          pointerEvents: 'auto'
        }}
        gl={{ 
          alpha: true, 
          antialias: true,
          clearColor: [0,0,0,0],
          clearAlpha: 0,
          preserveDrawingBuffer: true
        }}
        // Use the correct event source
        eventSource={document.getElementById('app-controller') || document.body}
        eventPrefix="client"
      >
        <color attach="background" args={[0, 0, 0, 0]} />
        <SceneSetup />
        
        <Suspense fallback={null}>
          {/* Standard lighting setup */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
          <spotLight position={[-5, 5, 5]} intensity={1.0} angle={0.3} penumbra={0.5} />
          
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
              onClick={() => handleCardClick(app.id)}
            />
          ))}
          
          {/* Environment for lighting and reflections */}
          <Environment preset="city" background={false} />
          
          {/* Add orbit controls for interacting with the scene */}
          <OrbitControls 
            ref={controlsRef}
            makeDefault
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={4}
            maxDistance={10}
            zoomSpeed={1.5}
            rotateSpeed={0.8}
            autoRotate={false}
            autoRotateSpeed={0.5}
            // Ensure controls don't interfere with card clicks
            enabled={true}
          />
        </Suspense>
      </Canvas>
      
      <div className="home-overlay">
        <p>Click on an app to launch it</p>
      </div>
    </div>
  );
};

export default HomeScreen; 