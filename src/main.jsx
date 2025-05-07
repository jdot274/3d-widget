import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
// Preserving original imports as comments
/* import { 
  Environment, 
  Float, 
  ContactShadows, 
  BakeShadows, 
  Stats, 
  Loader,
  Preload,
  PerspectiveCamera,
  useTexture,
  OrbitControls
} from '@react-three/drei'; */
import GlassGrid from './components/GlassGrid';
import MaterialEditor3D from './components/MaterialEditor3D';
import OrbitControlWidget from './components/OrbitControlWidget';
import MaterialsPanel from './components/MaterialsPanel';
import { MaterialEditorProvider } from './context/MaterialEditorContext';
import * as THREE from 'three';
import './styles/global.css';

// Original ColorManagement setting preserved as comment
// THREE.ColorManagement.enabled = false;

// Create a custom scene component to set scene background to transparent
// This is exactly how it's done in silver-3d-rectangle
function TransparentScene() {
  const { scene } = useThree();
  scene.background = null;
  return null;
}

// Original SubtleBackground component preserved as comment
/* function SubtleBackground() {
  return (
    <mesh position={[0, 0, -2]} scale={[20, 20, 1]}>
      <planeGeometry />
      <meshBasicMaterial color="#111122" transparent opacity={0.05} />
    </mesh>
  );
} */

// Original EnhancedLighting component preserved as comment
/* function EnhancedLighting() {
  // Use stronger, more directional lighting
  return (
    <>
      <ambientLight intensity={0.8} />
      
      <directionalLight 
        position={[5, 5, 10]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      <directionalLight 
        position={[-5, 2, 5]} 
        intensity={0.8} 
        color="#ccddff"
      />
      
      <spotLight 
        position={[0, 0, -10]} 
        angle={0.5} 
        penumbra={0.5} 
        intensity={1.0} 
        color="#ffffff"
      />
      
      <spotLight 
        position={[0, 5, 8]} 
        angle={0.3} 
        penumbra={0.8} 
        intensity={2.0} 
        castShadow
        color="#ffffff"
      />
    </>
  );
} */

// Original App component preserved as comment
/* function OriginalApp() {
  // Force continuous updates for rendering
  const [counter, setCounter] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(prev => prev + 1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      background: 'rgba(0, 0, 0, 0)',
      position: 'absolute',
      top: 0,
      left: 0,
      overflow: 'hidden'
    }}>
      <Canvas 
        frameloop="always"
        dpr={[1, 2]}
        gl={{ 
          alpha: true, 
          antialias: true,
          stencil: false,
          depth: true,
          premultipliedAlpha: false, // CRITICAL FOR TRANSPARENCY
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
          clearColor: [0, 0, 0, 0],
          clearAlpha: 0
        }}
        style={{ background: 'rgba(0, 0, 0, 0)' }}
      >
        <TransparentScene />
        
        <color attach="background" args={[0,0,0,0]} />
        
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 8]}
          fov={45}
          near={0.1}
          far={1000}
        />
        
        <Suspense fallback={null}>
          <EnhancedLighting />
          
          <SubtleBackground />
          
          <Float 
            speed={2}
            rotationIntensity={0.3}
            floatIntensity={0.8}
          >
            <GlassGrid key={`grid-${counter % 10}`} />
          </Float>
          
          <Environment preset="city" background={false} />
          
          <Preload all />
        </Suspense>
        
        <ContactShadows 
          position={[0, -2, 0]}
          opacity={0.7}
          scale={12}
          blur={3}
          far={4}
          color="#000000"
          resolution={512}
        />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          minDistance={4}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        <Stats />
        
        <BakeShadows />
      </Canvas>
      
      <Loader />
    </div>
  );
} */

// Active App using silver-3d-rectangle approach
export default function App() {
  const [useOrbitWidget, setUseOrbitWidget] = React.useState(true);

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
          
          {/* Our glass grid containing multiple chips */}
          <GlassGrid position={[0, 0, 0]} />
          
          {/* Material Editor - positioned to the right of the grid */}
          <MaterialEditor3D position={[5, 0, 0]} />
          
          {/* Materials Panel - positioned to the left of the grid */}
          <MaterialsPanel position={[-5, 1, 0]} />
          
          {/* Custom orbit control widget */}
          <OrbitControlWidget position={[-5, -2, 0]} />
          
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
      </div>
    </MaterialEditorProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />); 