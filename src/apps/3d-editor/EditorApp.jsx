import React, { Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import GlassGrid from '../../components/GlassGrid';
import MaterialEditor3D from '../../components/MaterialEditor3D';
import OrbitControlWidget from '../../components/OrbitControlWidget';
import MaterialsPanel from '../../components/MaterialsPanel';
import BackButton from '../../components/BackButton';
import { MaterialEditorProvider } from '../../context/MaterialEditorContext';

// Create a custom scene component to set scene background to transparent
function TransparentScene() {
  const { scene } = useThree();
  scene.background = null;
  return null;
}

// Editor App component
function EditorApp({ onBack }) {
  const [useOrbitWidget, setUseOrbitWidget] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Add error boundaries to catch and display any rendering errors
  React.useEffect(() => {
    console.log("EditorApp mounted");
    return () => console.log("EditorApp unmounted");
  }, []);

  // Error fallback component
  if (error) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white'
      }}>
        <h2>Something went wrong with the 3D Editor</h2>
        <p>{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ padding: '10px 20px', marginTop: '20px' }}
        >
          Reload App
        </button>
      </div>
    );
  }

  return (
    <MaterialEditorProvider>
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
          onCreated={state => {
            console.log("Canvas created:", state);
          }}
          onError={err => {
            console.error("Canvas error:", err);
            setError(err);
          }}
        >
          {/* This is critical for transparency */}
          <TransparentScene />
          
          {/* Refined lighting for PBR quality */}
          <ambientLight intensity={0.8} /> 
          <directionalLight 
            position={[8, 5, 8]}
            intensity={1.5} 
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <spotLight 
            position={[-5, 8, -5]}
            intensity={1.0} 
            angle={0.3}
            penumbra={0.5}
            color="#B0E0E6"
          />
          
          {/* Original spotlight retained, can be adjusted or removed if too much */}
          <spotLight position={[0, 10, 0]} intensity={0.7} /> 
          
          <Suspense fallback={
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial color="#4A90E2" />
            </mesh>
          }>
            {/* Our glass grid containing multiple chips */}
            <GlassGrid position={[0, 0, 0]} />
            
            {/* Material Editor - positioned to the right of the grid */}
            <MaterialEditor3D position={[5, 0, 0]} />
            
            {/* Materials Panel - positioned to the left of the grid */}
            <MaterialsPanel position={[-5, 1, 0]} />
            
            {/* Custom orbit control widget */}
            <OrbitControlWidget position={[-5, -2, 0]} />
          </Suspense>
          
          {/* Optional but helps with visualization - only active when widget is not used */}
          {!useOrbitWidget && (
            <OrbitControls 
              enablePan={false} 
              enableZoom={true} 
              minDistance={3} 
              maxDistance={15}
            />
          )}
          
          {/* Changed Environment preset for richer PBR reflections */}
          <Environment preset="lobby" background={false} />
        </Canvas>
        
        {/* Add a back button to return to home */}
        <BackButton onClick={onBack} />
      </div>
    </MaterialEditorProvider>
  );
}

export default EditorApp; 