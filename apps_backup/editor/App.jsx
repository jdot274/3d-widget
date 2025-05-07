// apps/editor/App.jsx
// 3D Editor application 

import React, { Suspense } from 'react';
import { Environment } from '@react-three/drei';
import { TransparentCanvas, TransparentScene, StandardLighting } from '../../core/renderer.jsx';
import GlowingSphere from '../../src/components/sphere/GlowingSphere';
import GlassGrid from '../../src/components/GlassGrid';
import { MaterialEditorProvider } from '../../src/context/MaterialEditorContext';
import MaterialEditor3D from '../../src/components/MaterialEditor3D';
import MaterialsPanel from '../../src/components/MaterialsPanel';
import OrbitControlWidget from '../../src/components/OrbitControlWidget';

/**
 * Main 3D Editor Application
 * This uses our core components to create a specific app
 */
const EditorApp = () => {
  return (
    <MaterialEditorProvider>
      <div className="editor-container" style={{ width: '100%', height: '100vh' }}>
        <TransparentCanvas camera={{ position: [0, 0, 8], fov: 45 }}>
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
          
          <spotLight position={[0, 10, 0]} intensity={0.7} /> 
          
          {/* Our glass grid containing multiple chips */}
          <GlassGrid position={[0, 0, 0]} />
          
          {/* Material Editor - positioned to the right of the grid */}
          <MaterialEditor3D position={[5, 0, 0]} />
          
          {/* Materials Panel - positioned to the left of the grid */}
          <MaterialsPanel position={[-5, 1, 0]} />
          
          {/* Custom orbit control widget */}
          <OrbitControlWidget position={[-5, -2, 0]} />
          
          {/* Environment for reflections */}
          <Environment preset="lobby" background={false} />
        </TransparentCanvas>
      </div>
    </MaterialEditorProvider>
  );
};

export default EditorApp; 