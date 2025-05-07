// src/apps/tutorial2/App.jsx
// Tutorial2 app - Exact implementation of the glass effect tutorial from the images

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

// Custom scene component to set scene background to transparent
function TransparentScene() {
  const { scene } = useThree();
  scene.background = null;
  return null;
}

// Step 1: Shape with gradient fill
function Step1Demo({ position = [0, 0, 0], size = 3 }) {
  const textureRef = useRef();
  
  useEffect(() => {
    // Create canvas for the diagonal gradient
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create diagonal gradient from top-left to bottom-right as shown in tutorial
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, 'rgba(59, 146, 255, 0.2)'); // #3B92FF with 20% opacity
    gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');  // #FFFFFF with 100% opacity
    
    // Draw circle with gradient
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();
    
    // Create texture from canvas
    textureRef.current = new THREE.CanvasTexture(canvas);
  }, []);
  
  // Don't render until texture is ready
  if (!textureRef.current) return null;
  
  return (
    <group position={position}>
      <mesh>
        <circleGeometry args={[size, 64]} />
        <meshBasicMaterial
          transparent={true}
          map={textureRef.current}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Labels for the color stops as shown in tutorial */}
      <mesh position={[-size * 0.4, size * 0.4, 0.01]}>
        <circleGeometry args={[size * 0.1, 32]} />
        <meshBasicMaterial color="#3B92FF" />
      </mesh>
      
      <mesh position={[size * 0.4, -size * 0.4, 0.01]}>
        <circleGeometry args={[size * 0.1, 32]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Line showing gradient direction */}
      <line>
        <bufferGeometry attach="geometry">
          <float32BufferAttribute attach="attributes-position" args={[new Float32Array([-size * 0.3, size * 0.3, 0, size * 0.3, -size * 0.3, 0]), 3]} />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#CCCCCC" />
      </line>
      
      {/* Label texts */}
      <Text
        position={[-size * 0.4, size * 0.7, 0]}
        fontSize={size * 0.15}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        backgroundColor="#FFFFFF"
        padding={0.05}
      >
        #3B92FF
      </Text>
      
      <Text
        position={[-size * 0.4, size * 0.55, 0]}
        fontSize={size * 0.12}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        backgroundColor="#FFFFFF"
        padding={0.05}
      >
        Opacity(Alpha): 20
      </Text>
      
      <Text
        position={[size * 0.4, -size * 0.7, 0]}
        fontSize={size * 0.15}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        backgroundColor="#FFFFFF"
        padding={0.05}
      >
        #FFFFFF
      </Text>
      
      <Text
        position={[size * 0.4, -size * 0.55, 0]}
        fontSize={size * 0.12}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        backgroundColor="#FFFFFF"
        padding={0.05}
      >
        Opacity(Alpha): 100
      </Text>
    </group>
  );
}

// Step 2: Inner shadows
function Step2Demo({ position = [0, 0, 0], size = 3 }) {
  const circleRef = useRef();
  const shadow1Ref = useRef();
  const shadow2Ref = useRef();
  const shadow3Ref = useRef();
  
  useEffect(() => {
    // Step 1 gradient (same as above)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create diagonal gradient
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, 'rgba(59, 146, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
    
    // Draw circle with gradient
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(256, 256, 250, 0, Math.PI * 2);
    ctx.fill();
    
    // Create inner shadow 1: Blue from top-right
    const shadow1Canvas = document.createElement('canvas');
    shadow1Canvas.width = 512;
    shadow1Canvas.height = 512;
    const shadow1Ctx = shadow1Canvas.getContext('2d');
    
    shadow1Ctx.shadowColor = '#007AFF';
    shadow1Ctx.shadowBlur = 30;
    shadow1Ctx.shadowOffsetX = 15;
    shadow1Ctx.shadowOffsetY = 15;
    
    shadow1Ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    shadow1Ctx.beginPath();
    shadow1Ctx.arc(256, 256, 250, 0, Math.PI * 2);
    shadow1Ctx.fill();
    
    // Create inner shadow 2: White from bottom
    const shadow2Canvas = document.createElement('canvas');
    shadow2Canvas.width = 512;
    shadow2Canvas.height = 512;
    const shadow2Ctx = shadow2Canvas.getContext('2d');
    
    shadow2Ctx.shadowColor = '#FFFFFF';
    shadow2Ctx.shadowBlur = 10;
    shadow2Ctx.shadowOffsetX = 0;
    shadow2Ctx.shadowOffsetY = -15;
    
    shadow2Ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    shadow2Ctx.beginPath();
    shadow2Ctx.arc(256, 256, 250, 0, Math.PI * 2);
    shadow2Ctx.fill();
    
    // Create inner shadow 3: Light blue from bottom-left
    const shadow3Canvas = document.createElement('canvas');
    shadow3Canvas.width = 512;
    shadow3Canvas.height = 512;
    const shadow3Ctx = shadow3Canvas.getContext('2d');
    
    shadow3Ctx.shadowColor = '#A7CFFF';
    shadow3Ctx.shadowBlur = 30;
    shadow3Ctx.shadowOffsetX = -15;
    shadow3Ctx.shadowOffsetY = -35;
    
    shadow3Ctx.fillStyle = 'rgba(255, 255, 255, 0)';
    shadow3Ctx.beginPath();
    shadow3Ctx.arc(256, 256, 250, 0, Math.PI * 2);
    shadow3Ctx.fill();
    
    // Set textures
    circleRef.current = new THREE.CanvasTexture(canvas);
    shadow1Ref.current = new THREE.CanvasTexture(shadow1Canvas);
    shadow2Ref.current = new THREE.CanvasTexture(shadow2Canvas);
    shadow3Ref.current = new THREE.CanvasTexture(shadow3Canvas);
  }, []);
  
  // Don't render until textures are ready
  if (!circleRef.current || !shadow1Ref.current || !shadow2Ref.current || !shadow3Ref.current) return null;
  
  return (
    <group position={position}>
      {/* Base circle with gradient */}
      <mesh>
        <circleGeometry args={[size, 64]} />
        <meshBasicMaterial
          transparent={true}
          map={circleRef.current}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Shadow layers */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[size, 64]} />
        <meshBasicMaterial
          transparent={true}
          opacity={0.2}
          map={shadow1Ref.current}
          side={THREE.DoubleSide}
          blending={THREE.CustomBlending}
          blendSrc={THREE.SrcAlphaFactor}
          blendDst={THREE.OneMinusSrcAlphaFactor}
        />
      </mesh>
      
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[size, 64]} />
        <meshBasicMaterial
          transparent={true}
          opacity={0.2}
          map={shadow2Ref.current}
          side={THREE.DoubleSide}
          blending={THREE.CustomBlending}
          blendSrc={THREE.SrcAlphaFactor}
          blendDst={THREE.OneMinusSrcAlphaFactor}
        />
      </mesh>
      
      <mesh position={[0, 0, 0.03]}>
        <circleGeometry args={[size, 64]} />
        <meshBasicMaterial
          transparent={true}
          opacity={0.2}
          map={shadow3Ref.current}
          side={THREE.DoubleSide}
          blending={THREE.CustomBlending}
          blendSrc={THREE.SrcAlphaFactor}
          blendDst={THREE.OneMinusSrcAlphaFactor}
        />
      </mesh>
      
      {/* Shadow parameter labels, exactly as shown in the tutorial image */}
      <mesh position={[0, 1.5, 0.05]}>
        <planeGeometry args={[4, 1.2]} />
        <meshBasicMaterial color="#FFFFFF" transparent={true} opacity={0.9} />
      </mesh>
      
      {/* Blue shadow (#007AFF) */}
      <mesh position={[-1.5, 1.8, 0.06]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial color="#007AFF" />
      </mesh>
      
      <Text position={[-1.5, 1.5, 0.06]} fontSize={0.15} color="#000000">
        #007AFF
      </Text>
      
      <Text position={[-1.5, 1.3, 0.06]} fontSize={0.12} color="#000000">
        Opacity: 20%
      </Text>
      
      <Text position={[-0.8, 1.8, 0.06]} fontSize={0.15} color="#000000">
        15
      </Text>
      
      <Text position={[-0.8, 1.6, 0.06]} fontSize={0.12} color="#000000">
        X
      </Text>
      
      <Text position={[-0.5, 1.8, 0.06]} fontSize={0.15} color="#000000">
        15
      </Text>
      
      <Text position={[-0.5, 1.6, 0.06]} fontSize={0.12} color="#000000">
        Y
      </Text>
      
      <Text position={[-0.2, 1.8, 0.06]} fontSize={0.15} color="#000000">
        30
      </Text>
      
      <Text position={[-0.2, 1.6, 0.06]} fontSize={0.12} color="#000000">
        Blur
      </Text>
      
      <Text position={[0.1, 1.8, 0.06]} fontSize={0.15} color="#000000">
        0
      </Text>
      
      <Text position={[0.1, 1.6, 0.06]} fontSize={0.12} color="#000000">
        Spread
      </Text>
      
      {/* White shadow (#FFFFFF) */}
      <mesh position={[1.5, 1.0, 0.06]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      
      <Text position={[1.5, 0.7, 0.06]} fontSize={0.15} color="#000000">
        #FFFFFF
      </Text>
      
      <Text position={[1.5, 0.5, 0.06]} fontSize={0.12} color="#000000">
        Opacity: 100%
      </Text>
      
      {/* Light blue shadow (#A7CFFF) */}
      <mesh position={[1.5, 0.0, 0.06]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshBasicMaterial color="#A7CFFF" />
      </mesh>
      
      <Text position={[1.5, -0.3, 0.06]} fontSize={0.15} color="#000000">
        #A7CFFF
      </Text>
      
      <Text position={[1.5, -0.5, 0.06]} fontSize={0.12} color="#000000">
        Opacity: 100%
      </Text>
    </group>
  );
}

// Step 3: Additional elements 
function Step3Demo({ position = [0, 0, 0], size = 3 }) {
  const [textures, setTextures] = useState({
    base: null,
    grain: null
  });
  
  useEffect(() => {
    // Create textures
    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = 512;
    baseCanvas.height = 512;
    const baseCtx = baseCanvas.getContext('2d');
    
    // Step 1: Base gradient
    const gradient = baseCtx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, 'rgba(59, 146, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');
    
    baseCtx.fillStyle = gradient;
    baseCtx.beginPath();
    baseCtx.arc(256, 256, 250, 0, Math.PI * 2);
    baseCtx.fill();
    
    // Create grain texture
    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = 512;
    grainCanvas.height = 512;
    const grainCtx = grainCanvas.getContext('2d');
    
    // Fill with noise
    const imageData = grainCtx.createImageData(512, 512);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.floor(Math.random() * 255);
      data[i] = value;     // red
      data[i + 1] = value; // green
      data[i + 2] = value; // blue
      data[i + 3] = Math.random() * 50; // alpha (20% opacity)
    }
    
    grainCtx.putImageData(imageData, 0, 0);
    
    // Create textures
    setTextures({
      base: new THREE.CanvasTexture(baseCanvas),
      grain: new THREE.CanvasTexture(grainCanvas)
    });
  }, []);
  
  // Don't render until textures are ready
  if (!textures.base || !textures.grain) return null;
  
  return (
    <group position={position}>
      {/* Step 3: Blue undertone circle */}
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[size, 64]} />
        <meshBasicMaterial color="#85B4E9" transparent={true} opacity={0.7} />
      </mesh>
      
      {/* Base circle with gradient */}
      <mesh>
        <circleGeometry args={[size * 0.95, 64]} />
        <meshBasicMaterial
          transparent={true}
          map={textures.base}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* White circle overlay */}
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[size * 0.6, 64]} />
        <meshBasicMaterial color="#FFFFFF" transparent={true} opacity={0.9} />
      </mesh>
      
      {/* Phone icon in the middle */}
      <mesh position={[0, 0, 0.03]}>
        <circleGeometry args={[size * 0.35, 64]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      
      <mesh position={[0, 0, 0.04]}>
        <torusGeometry args={[size * 0.15, size * 0.03, 8, 32, Math.PI * 1.5]} />
        <meshBasicMaterial color="#007AFF" />
      </mesh>
      
      <mesh position={[0, -size * 0.05, 0.04]}>
        <boxGeometry args={[size * 0.08, size * 0.25, size * 0.01]} />
        <meshBasicMaterial color="#007AFF" />
      </mesh>
      
      {/* Optional grain overlay */}
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[size * 1.05, 64]} />
        <meshBasicMaterial
          transparent={true}
          opacity={0.2}
          map={textures.grain}
          blending={THREE.MultiplyBlending}
        />
      </mesh>
      
      {/* Labels for each element */}
      <mesh position={[-size * 1.2, 0, 0]}>
        <planeGeometry args={[1.5, 1]} />
        <meshBasicMaterial color="#FFFFFF" transparent={true} opacity={0.9} />
      </mesh>
      
      <Text position={[-size * 1.2, 0.3, 0.01]} fontSize={0.15} color="#000000" fontWeight="bold">
        White circle (over)
      </Text>
      <Text position={[-size * 1.2, 0.1, 0.01]} fontSize={0.15} color="#000000">
        #FFFFFF
      </Text>
      <Text position={[-size * 1.2, -0.1, 0.01]} fontSize={0.15} color="#000000" fontWeight="bold">
        Shadow:
      </Text>
      <Text position={[-size * 1.2, -0.3, 0.01]} fontSize={0.15} color="#000000">
        #81B9F8
      </Text>
      <Text position={[-size * 1.2, -0.5, 0.01]} fontSize={0.12} color="#000000">
        X:30, Y:30, Blur:60
      </Text>
      
      <mesh position={[size * 1.2, size * 0.5, 0]}>
        <planeGeometry args={[1.5, 1.2]} />
        <meshBasicMaterial color="#FFFFFF" transparent={true} opacity={0.9} />
      </mesh>
      
      <Text position={[size * 1.2, size * 0.9, 0.01]} fontSize={0.15} color="#000000" fontWeight="bold">
        Grain fill (optional)
      </Text>
      <Text position={[size * 1.2, size * 0.7, 0.01]} fontSize={0.12} color="#000000">
        Draw another circle,
      </Text>
      <Text position={[size * 1.2, size * 0.5, 0.01]} fontSize={0.12} color="#000000">
        fill with image (grain),
      </Text>
      <Text position={[size * 1.2, size * 0.3, 0.01]} fontSize={0.12} color="#000000">
        set blending mode to
      </Text>
      <Text position={[size * 1.2, size * 0.1, 0.01]} fontSize={0.12} color="#000000">
        overlay, opacity 20%
      </Text>
      
      <mesh position={[size * 1.2, -size * 0.5, 0]}>
        <planeGeometry args={[1.5, 0.8]} />
        <meshBasicMaterial color="#FFFFFF" transparent={true} opacity={0.9} />
      </mesh>
      
      <Text position={[size * 1.2, -size * 0.3, 0.01]} fontSize={0.15} color="#000000" fontWeight="bold">
        Blue circle (under)
      </Text>
      <Text position={[size * 1.2, -size * 0.5, 0.01]} fontSize={0.15} color="#000000">
        #85B4E9
      </Text>
      <Text position={[size * 1.2, -size * 0.7, 0.01]} fontSize={0.12} color="#000000">
        Gaussian blur: 40
      </Text>
    </group>
  );
}

// Interactive tutorial that exactly matches the steps from the images
function Tutorial2App() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };
  
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };
  
  return (
    <div className="tutorial2-container">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
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
        <ambientLight intensity={0.8} />
        
        {/* Display current step */}
        {currentStep === 1 && <Step1Demo position={[0, 0, 0]} size={2.5} />}
        {currentStep === 2 && <Step2Demo position={[0, 0, 0]} size={2.5} />}
        {currentStep === 3 && <Step3Demo position={[0, 0, 0]} size={2.5} />}
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={5}
          maxDistance={15}
        />
      </Canvas>
      
      {/* Tutorial header */}
      <div className="tutorial-header">
        <h1>Step {currentStep}: {
          currentStep === 1 ? 'Shape and Filling' :
          currentStep === 2 ? 'Inner Shadows' :
          'Additional Elements'
        }</h1>
        
        <p>{
          currentStep === 1 ? 'Draw a shape (circle) and fill it with a diagonal linear gradient' :
          currentStep === 2 ? 'Add three inner shadows in specific order as shown below' :
          'Add white overlay, blue background, and optional grain texture'
        }</p>
      </div>
      
      {/* Navigation controls */}
      <div className="tutorial-nav">
        <button 
          className="tutorial-button" 
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous Step
        </button>
        
        <div className="step-indicator">
          <div className={`step-dot ${currentStep >= 1 ? 'active' : ''}`}></div>
          <div className={`step-dot ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div className={`step-dot ${currentStep >= 3 ? 'active' : ''}`}></div>
        </div>
        
        <button 
          className="tutorial-button" 
          onClick={nextStep}
          disabled={currentStep === 3}
        >
          Next Step
        </button>
      </div>
      
      <div className="tutorial-tip">
        <p>Tip: This is an exact recreation of the glass effect tutorial, showing each step in isolation</p>
      </div>
    </div>
  );
}

export default Tutorial2App; 