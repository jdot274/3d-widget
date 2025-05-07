// src/apps/spherical-designer/App.jsx
// Spherical Designer - Bridge between 2D design and 3D visualization

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

// Custom scene component to set scene background to transparent
function TransparentScene() {
  const { scene } = useThree();
  scene.background = null;
  return null;
}

// Analyze edge brightness to detect highlights in texture
function detectEdgeBrightness(imageData, width, height) {
  const data = imageData.data;
  let totalBrightness = 0;
  const sobelX = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
  ];
  const sobelY = [
    -1, -2, -1,
    0, 0, 0,
    1, 2, 1
  ];
  
  // Simple edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;
      
      // Apply convolution
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const v = (r + g + b) / 3;
          
          sumX += v * sobelX[(ky + 1) * 3 + (kx + 1)];
          sumY += v * sobelY[(ky + 1) * 3 + (kx + 1)];
        }
      }
      
      // Magnitude
      const mag = Math.sqrt(sumX * sumX + sumY * sumY);
      totalBrightness += mag;
    }
  }
  
  // Return average edge brightness
  return totalBrightness / ((width - 2) * (height - 2));
}

// Analyze color distribution in texture
function analyzeColorDistribution(imageData) {
  const data = imageData.data;
  let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
  const pixels = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
    totalA += data[i + 3];
  }
  
  return {
    averageR: totalR / pixels,
    averageG: totalG / pixels,
    averageB: totalB / pixels,
    averageAlpha: totalA / pixels
  };
}

// Map value from one range to another
function mapToRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// Translate 2D design intent to 3D material properties
function translateDesignIntent(canvas, material) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Analyze edge brightness to detect highlights
  const edgeBrightness = detectEdgeBrightness(imageData, canvas.width, canvas.height);
  
  // Extract average color and transparency
  const colorAnalysis = analyzeColorDistribution(imageData);
  
  // Map 2D visual properties to 3D material properties
  material.roughness = mapToRange(edgeBrightness, 0, 100, 0.1, 0.7);
  material.clearcoat = mapToRange(edgeBrightness, 0, 100, 0, 1);
  material.transmission = 0.2 + (colorAnalysis.averageAlpha / 255) * 0.6;
  material.envMapIntensity = mapToRange(edgeBrightness, 0, 100, 0.5, 2.0);
  
  // Update texture
  material.map = new THREE.CanvasTexture(canvas);
  material.map.needsUpdate = true;
  
  return {
    edgeBrightness,
    colorAnalysis
  };
}

// 3D Sphere preview component
function SpherePreview({ /* texture, */ materialProps }) {
  const sphereRef = useRef();
  
  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.004;
    }
  });
  
  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[2, 64, 32]} />
      <meshPhysicalMaterial
        // map={texture} // Commented out: texture disabled for procedural lighting only
        transparent={true}
        roughness={materialProps.roughness || 0.1}
        metalness={materialProps.metalness || 0.2}
        transmission={materialProps.transmission || 0.6}
        thickness={0.5}
        ior={1.5}
        envMapIntensity={materialProps.envMapIntensity || 1.0}
        clearcoat={materialProps.clearcoat || 0.5}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

// Main Spherical Designer App component
function SphericalDesigner() {
  // State to track whether we're showing the 2D editor or 3D preview
  const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'
  const [designTexture, setDesignTexture] = useState(null);
  const [materialProps, setMaterialProps] = useState({
    roughness: 0.1,
    metalness: 0.2,
    transmission: 0.6,
    envMapIntensity: 1.0,
    clearcoat: 0.5
  });
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  
  // Canvas refs for 2D editor
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  
  // Current tool state
  const [activeTool, setActiveTool] = useState('gradient');
  const [activeColor, setActiveColor] = useState('#3B92FF');
  const [opacity, setOpacity] = useState(0.8);
  const [brushSize, setBrushSize] = useState(20);
  
  // Material presets
  const materialPresets = [
    {
      name: "Silver Glass",
      preview: "#D6D6D6",
      properties: {
        roughness: 0.1,
        metalness: 0.5,
        transmission: 0.5,
        envMapIntensity: 1.2,
        clearcoat: 0.8
      }
    },
    {
      name: "macOS Blur",
      preview: "#FFFFFF",
      properties: {
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.7,
        envMapIntensity: 0.8,
        clearcoat: 0.6
      }
    },
    {
      name: "Frosted Blue",
      preview: "#A7CFFF",
      properties: {
        roughness: 0.35,
        metalness: 0.0,
        transmission: 0.5,
        envMapIntensity: 0.7,
        clearcoat: 0.3
      }
    },
    {
      name: "Crystal Clear",
      preview: "#F0F8FF",
      properties: {
        roughness: 0.0,
        metalness: 0.0,
        transmission: 0.95,
        envMapIntensity: 1.0,
        clearcoat: 1.0
      }
    },
    {
      name: "Glowing Blue",
      preview: "#007AFF",
      properties: {
        roughness: 0.15,
        metalness: 0.3,
        transmission: 0.4,
        envMapIntensity: 1.5,
        clearcoat: 0.9
      }
    }
  ];

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set initial canvas size
      canvas.width = 1024;
      canvas.height = 512; // 2:1 ratio for equirectangular mapping
      
      // Start with a clean slate
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctxRef.current = ctx;
      
      // Create initial design texture
      updateDesignTexture();
    }
  }, []);
  
  // Update the 3D texture whenever the design changes
  const updateDesignTexture = () => {
    if (canvasRef.current) {
      const texture = new THREE.CanvasTexture(canvasRef.current);
      // Ensure proper wrapping for spherical mapping
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);
      setDesignTexture(texture);
      
      // Update material properties based on design intent
      const updatedProps = translateDesignIntent(canvasRef.current, {
        map: texture,
        ...materialProps
      });
      
      setMaterialProps(prevProps => ({
        ...prevProps,
        roughness: mapToRange(updatedProps.edgeBrightness, 0, 100, 0.1, 0.7),
        clearcoat: mapToRange(updatedProps.edgeBrightness, 0, 100, 0, 1),
        transmission: 0.2 + (updatedProps.colorAnalysis.averageAlpha / 255) * 0.6,
        envMapIntensity: mapToRange(updatedProps.edgeBrightness, 0, 100, 0.5, 2.0)
      }));
    }
  };
  
  // Drawing handlers
  const handlePointerDown = (e) => {
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPosition({ x, y });
    setCurrentPosition({ x, y });
    
    if (activeTool === 'brush') {
      const ctx = ctxRef.current;
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = `${activeColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
      updateDesignTexture();
    }
  };
  
  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPosition({ x, y });
    
    if (activeTool === 'brush') {
      const ctx = ctxRef.current;
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = `${activeColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
      updateDesignTexture();
    }
  };
  
  const handlePointerUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (activeTool === 'gradient') {
      applyGradient(startPosition.x, startPosition.y, currentPosition.x, currentPosition.y);
    } else if (activeTool === 'shadow') {
      const offsetX = currentPosition.x - startPosition.x;
      const offsetY = currentPosition.y - startPosition.y;
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      applyShadow(offsetX, offsetY, distance / 3, activeColor, opacity);
    }
    
    updateDesignTexture();
  };
  
  // Tool handlers
  const applyGradient = (x1, y1, x2, y2) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.9;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, `${activeColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, '#ffffff');
    
    // Apply gradient to circle
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  
  const applyShadow = (x, y, blur, color, alpha) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.9;
    
    // Create temporary canvas for the shadow
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Setup shadow
    tempCtx.shadowColor = color;
    tempCtx.shadowBlur = blur;
    tempCtx.shadowOffsetX = x;
    tempCtx.shadowOffsetY = y;
    
    // Draw shape with shadow
    tempCtx.beginPath();
    tempCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    tempCtx.fillStyle = 'rgba(255,255,255,0)';
    tempCtx.fill();
    
    // Apply to main canvas with transparency
    ctx.globalAlpha = alpha;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.globalAlpha = 1.0;
  };
  
  // Apply a complete glass effect using the tutorial steps
  const applyGlassEffect = () => {
    if (!ctxRef.current) return;
    
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Base color
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    
    // Step 1: Base gradient circle
    const gradient = ctx.createLinearGradient(
      centerX - radius, centerY - radius,
      centerX + radius, centerY + radius
    );
    gradient.addColorStop(0, 'rgba(59, 146, 255, 0.2)'); // #3B92FF with 20% opacity
    gradient.addColorStop(1, 'rgba(255, 255, 255, 1)');  // #FFFFFF with 100% opacity
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Step 2: Inner shadows
    // Shadow 1: Blue from top-right
    applyShadow(15, 15, 30, '#007AFF', 0.2);
    
    // Shadow 2: White from bottom
    applyShadow(0, -15, 10, '#FFFFFF', 0.2);
    
    // Shadow 3: Light blue from bottom-left
    applyShadow(-15, -35, 30, '#A7CFFF', 0.2);
    
    // Step 3: White overlay for center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Optional: Add grain texture
    addGrainTexture(0.05);
    
    updateDesignTexture();
  };
  
  // Create grain texture overlay
  const addGrainTexture = (intensity = 0.1) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() * 2 - 1) * 25 * intensity;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
      data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
    }
    
    ctx.putImageData(imageData, 0, 0);
  };
  
  // Clear the canvas
  const clearCanvas = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updateDesignTexture();
  };
  
  // Export functions
  const exportAsImage = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'spherical-design.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };
  
  const exportDesign = () => {
    if (!canvasRef.current) return;
    
    // Create a JSON representation of the design
    const designData = {
      texture: canvasRef.current.toDataURL('image/png'),
      materialProperties: materialProps,
      timestamp: new Date().toISOString()
    };
    
    // Create a blob and download it
    const blob = new Blob([JSON.stringify(designData)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'spherical-design.json';
    link.href = URL.createObjectURL(blob);
    link.click();
  };
  
  const exportGLTF = () => {
    alert("GLTF export functionality would require additional libraries like 'three/examples/jsm/exporters/GLTFExporter'. This would be implemented in a production version.");
  };
  
  // Load design from JSON
  const loadDesign = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const designData = JSON.parse(e.target.result);
        
        // Load the texture
        const img = new Image();
        img.onload = () => {
          if (ctxRef.current && canvasRef.current) {
            ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctxRef.current.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
            updateDesignTexture();
          }
        };
        img.src = designData.texture;
        
        // Apply material properties
        if (designData.materialProperties) {
          setMaterialProps(designData.materialProperties);
        }
      } catch (error) {
        console.error("Error loading design:", error);
        alert("Failed to load design file. The file may be corrupted.");
      }
    };
    reader.readAsText(file);
  };
  
  // Apply material preset
  const applyPreset = (preset) => {
    setMaterialProps(preset.properties);
    setShowPresets(false);
  };
  
  // Export panel component
  function ExportPanel() {
    return (
      <div className="export-panel">
        <h3>Export Options</h3>
        <div className="export-options">
          <button onClick={exportAsImage}>Export as Image</button>
          <button onClick={exportDesign}>Export Design JSON</button>
          <button onClick={exportGLTF}>Export as 3D Model</button>
          <button onClick={() => setShowExportPanel(false)}>Close</button>
        </div>
        
        <h3>Import Design</h3>
        <input 
          type="file" 
          accept=".json" 
          onChange={loadDesign} 
          style={{ marginBottom: "10px" }}
        />
      </div>
    );
  }
  
  // Presets panel component
  function PresetsPanel() {
    return (
      <div className="export-panel">
        <h3>Material Presets</h3>
        <div className="presets-panel">
          {materialPresets.map((preset, index) => (
            <div 
              key={index} 
              className="preset-item" 
              onClick={() => applyPreset(preset)}
            >
              <div 
                className="preset-preview" 
                style={{ backgroundColor: preset.preview }}
              ></div>
              <div className="preset-name">{preset.name}</div>
            </div>
          ))}
        </div>
        <button 
          onClick={() => setShowPresets(false)} 
          style={{ marginTop: "10px" }}
        >
          Close
        </button>
      </div>
    );
  }
  
  // Render 3D preview component
  function ThreeDPreview() {
    return (
      <div className="preview-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <TransparentScene />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <SpherePreview /* texture={designTexture} */ materialProps={materialProps} />
          <OrbitControls enablePan={false} enableZoom={true} />
          <Environment preset="sunset" background={false} />
          <gridHelper args={[10, 10]} position={[0, -3, 0]} />
        </Canvas>
        
        <div className="material-inspector">
          <h3>Material Properties</h3>
          <div className="material-property">
            <label>Roughness: {materialProps.roughness.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialProps.roughness}
              onChange={(e) => setMaterialProps({
                ...materialProps,
                roughness: parseFloat(e.target.value)
              })}
            />
          </div>
          <div className="material-property">
            <label>Metalness: {materialProps.metalness.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialProps.metalness}
              onChange={(e) => setMaterialProps({
                ...materialProps,
                metalness: parseFloat(e.target.value)
              })}
            />
          </div>
          <div className="material-property">
            <label>Transmission: {materialProps.transmission.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialProps.transmission}
              onChange={(e) => setMaterialProps({
                ...materialProps,
                transmission: parseFloat(e.target.value)
              })}
            />
          </div>
          <div className="material-property">
            <label>Clearcoat: {materialProps.clearcoat.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={materialProps.clearcoat}
              onChange={(e) => setMaterialProps({
                ...materialProps,
                clearcoat: parseFloat(e.target.value)
              })}
            />
          </div>
          <button onClick={() => setShowPresets(true)}>Load Preset</button>
        </div>
        
        <button 
          className="view-toggle" 
          style={{ right: '20px', left: 'auto', bottom: '20px' }}
          onClick={() => setShowExportPanel(!showExportPanel)}
        >
          Export
        </button>
        
        <button className="view-toggle" onClick={() => setViewMode('2D')}>
          Back to Editor
        </button>
        
        {showExportPanel && <ExportPanel />}
        {showPresets && <PresetsPanel />}
      </div>
    );
  }
  
  // Render 2D editor component
  function TwoDEditor() {
    return (
      <div className="editor-container">
        <div className="toolbar">
          <div className="tool-section">
            <h3>Tools</h3>
            <button 
              className={activeTool === 'gradient' ? 'active' : ''} 
              onClick={() => setActiveTool('gradient')}
              title="Click and drag to create a gradient"
            >
              Gradient
            </button>
            <button 
              className={activeTool === 'shadow' ? 'active' : ''} 
              onClick={() => setActiveTool('shadow')}
              title="Click and drag to create an inner shadow"
            >
              Inner Shadow
            </button>
            <button 
              className={activeTool === 'brush' ? 'active' : ''} 
              onClick={() => setActiveTool('brush')}
              title="Paint directly on the canvas"
            >
              Brush
            </button>
          </div>
          
          <div className="tool-section">
            <h3>Options</h3>
            <div className="color-picker">
              <label>Color:</label>
              <input 
                type="color" 
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
              />
            </div>
            <div className="slider">
              <label>Opacity: {Math.round(opacity * 100)}%</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
              />
            </div>
            {activeTool === 'brush' && (
              <div className="slider">
                <label>Brush Size: {brushSize}px</label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                />
              </div>
            )}
          </div>
          
          <div className="tool-section">
            <h3>Actions</h3>
            <button onClick={applyGlassEffect} title="Apply complete glass effect">
              Glass Effect
            </button>
            <button onClick={() => addGrainTexture(0.1)} title="Add grain texture overlay">
              Add Grain
            </button>
            <button onClick={clearCanvas} title="Clear canvas">
              Clear
            </button>
            <button onClick={() => setShowPresets(true)} title="Load material preset">
              Material Presets
            </button>
          </div>
        </div>
        
        <div className="canvas-container">
          <canvas 
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
          
          <div className="spherical-guides">
            <div className="equator"></div>
            <div className="meridian"></div>
            <div className="label top">North Pole</div>
            <div className="label bottom">South Pole</div>
            <div className="label left">-180°</div>
            <div className="label right">+180°</div>
          </div>
        </div>
        
        <div className="editor-footer">
          <button className="preview-button" onClick={() => {
            updateDesignTexture();
            setViewMode('3D');
          }}>
            Preview on 3D Sphere
          </button>
          <div className="info-text">
            Draw with the selected tool and see how your 2D design maps onto a 3D sphere
          </div>
          {showPresets && <PresetsPanel />}
        </div>
      </div>
    );
  }
  
  return (
    <div className="spherical-designer">
      {viewMode === '2D' ? <TwoDEditor /> : <ThreeDPreview />}
    </div>
  );
}

export default SphericalDesigner; 