// apps/editor/App.jsx
// 3D Editor application 

import React, { Suspense } from 'react';
import { Environment } from '@react-three/drei';
import { TransparentCanvas, TransparentScene, StandardLighting } from '../../core/renderer';
import GlowingSphere from '../../src/components/sphere/GlowingSphere';

/**
 * Main 3D Editor Application
 * This uses our core components to create a specific app
 */
const EditorApp = () => {
  return (
    <div className="editor-container" style={{ width: '100%', height: '100vh' }}>
      <TransparentCanvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <TransparentScene />
        
        <StandardLighting />
        
        <Suspense fallback={null}>
          {/* Your editor-specific 3D content goes here */}
          <GlowingSphere position={[0, 0, 0]} size={1.5} />
          
          {/* Environment for reflections */}
          <Environment preset="city" background={false} />
        </Suspense>
      </TransparentCanvas>
    </div>
  );
};

export default EditorApp; 