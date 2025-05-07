import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import useMaterialStore from '../store/useMaterialStore';
import ShaderEditor from './ShaderEditor';

// Material properties data structure
const MATERIAL_PROPERTIES = [
  { name: 'Color', key: 'color', type: 'color', min: 0, max: 1, default: '#6EC1FF' },
  { name: 'Metalness', key: 'metalness', type: 'slider', min: 0, max: 1, default: 0 },
  { name: 'Roughness', key: 'roughness', type: 'slider', min: 0, max: 1, default: 0.55 },
  { name: 'Transmission', key: 'transmission', type: 'slider', min: 0, max: 1, default: 0.85 },
  { name: 'Opacity', key: 'opacity', type: 'slider', min: 0, max: 1, default: 0.85 },
  { name: 'IOR', key: 'ior', type: 'slider', min: 1, max: 2.5, default: 1.45 },
  { name: 'Thickness', key: 'thickness', type: 'slider', min: 0, max: 1, default: 0.35 },
  { name: 'EnvMap Intensity', key: 'envMapIntensity', type: 'slider', min: 0, max: 2, default: 0.4 },
  { name: 'Clearcoat', key: 'clearcoat', type: 'slider', min: 0, max: 1, default: 0.15 },
  { name: 'Clearcoat Roughness', key: 'clearcoatRoughness', type: 'slider', min: 0, max: 1, default: 0.25 },
  { name: 'Emissive', key: 'emissive', type: 'color', min: 0, max: 1, default: '#ffffff' },
  { name: 'Emissive Intensity', key: 'emissiveIntensity', type: 'slider', min: 0, max: 5, default: 0 },
  // New glass-specific properties
  { name: 'Dispersion', key: 'dispersion', type: 'slider', min: 0, max: 1, default: 0.0 },
  { name: 'Caustics Intensity', key: 'causticsIntensity', type: 'slider', min: 0, max: 1, default: 0.0 },
  { name: 'Surface Noise', key: 'surfaceNoise', type: 'slider', min: 0, max: 1, default: 0.0 },
  { name: 'Aberration', key: 'aberration', type: 'slider', min: 0, max: 1, default: 0.0 },
  { name: 'Fresnel Power', key: 'fresnelPower', type: 'slider', min: 0, max: 5, default: 1.0 }
];

// Material type-specific properties
const MATERIAL_TYPE_PROPERTIES = {
  'glass': [
    'color', 'metalness', 'roughness', 'transmission', 'opacity', 'ior', 
    'thickness', 'envMapIntensity', 'clearcoat', 'clearcoatRoughness', 
    'emissive', 'emissiveIntensity', 'dispersion', 'causticsIntensity', 
    'surfaceNoise', 'aberration', 'fresnelPower'
  ],
  'metal': [
    'color', 'metalness', 'roughness', 'envMapIntensity', 'clearcoat',
    'clearcoatRoughness', 'emissive', 'emissiveIntensity'
  ],
  'plastic': [
    'color', 'metalness', 'roughness', 'transmission', 'opacity',
    'envMapIntensity', 'clearcoat', 'clearcoatRoughness', 'emissive', 'emissiveIntensity'
  ],
  'basic': [
    'color', 'wireframe', 'opacity', 'transparent'
  ],
  'standard': [
    'color', 'metalness', 'roughness', 'envMapIntensity', 'emissive', 'emissiveIntensity'
  ],
  'physical': [
    'color', 'metalness', 'roughness', 'transmission', 'opacity', 'ior',
    'clearcoat', 'clearcoatRoughness', 'envMapIntensity', 'emissive', 'emissiveIntensity'
  ],
  'normal': [
    'opacity', 'transparent', 'flatShading'
  ],
  'matcap': [
    'color', 'opacity', 'transparent'
  ],
  'shader': [
    'transparent', 'wireframe'
  ],
  'glow': [
    'color', 'intensity', 'power', 'transparent'
  ],
  'gradient': [
    'colorTop', 'colorBottom', 'exponent', 'transparent', 'opacity'
  ]
};

// Numeric input overlay for slider values
function NumericInputOverlay({ value, onChange, onBlur, position }) {
  // Use a portal or absolute div overlay for now
  // This is a placeholder for a 3D input field
  return (
    <div style={{
      position: 'fixed',
      left: `calc(50vw + ${position[0] * 40}px)` ,
      top: `calc(50vh + ${position[1] * -40}px)` ,
      zIndex: 1000,
      background: '#222',
      color: '#fff',
      borderRadius: 4,
      padding: 2,
      fontSize: 14,
      width: 50,
      textAlign: 'center',
      border: '1px solid #555'
    }}>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        onBlur={onBlur}
        style={{ width: '40px', background: 'transparent', color: '#fff', border: 'none', outline: 'none' }}
        autoFocus
      />
    </div>
  );
}

// Slider component in 3D
function Slider3D({ property, value, onChange, position, selected, onSelect }) {
  const sliderRef = useRef();
  const handleRef = useRef();
  const textRef = useRef();
  const [editing, setEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const width = 2;
  const handlePosition = THREE.MathUtils.lerp(-width/2, width/2, (value - property.min) / (property.max - property.min));
  
  // Animation for hover/selection effects
  useFrame(() => {
    if (sliderRef.current && textRef.current) {
      sliderRef.current.material.opacity = selected ? 0.9 : 0.7;
      textRef.current.material.color.lerp(new THREE.Color(selected ? '#FFFFFF' : '#AACCFF'), 0.1);
    }
  });

  // Drag logic
  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    onSelect(property.name);
    
    // Don't immediately call handleDrag as it might be causing the issue
    // Instead, calculate the value manually based on click position
    const x = e.point.x;
    const sliderWorldX = position[0];
    const normalizedValue = (x - (sliderWorldX - width/2)) / width;
    const clampedValue = Math.max(0, Math.min(1, normalizedValue));
    const newValue = property.min + clampedValue * (property.max - property.min);
    
    console.log('Pointer down at:', x, 'Slider center:', sliderWorldX, 'Normalized:', normalizedValue, 'Value:', newValue);
    
    // Update the value
    onChange(property.key, newValue);
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    setIsDragging(false);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      e.stopPropagation();
      e.preventDefault();
      handleDrag(e);
    }
  };

  // Calculate value from pointer event
  const handleDrag = (e) => {
    const x = e.point.x;
    // Fix coordinate calculation for correct clicking
    // Convert point from world space to local slider space
    const sliderWorldX = position[0];
    
    // Adjust the calculation to properly map the click position to slider value
    const normalizedValue = (x - (sliderWorldX - width/2)) / width;
    const clampedValue = Math.max(0, Math.min(1, normalizedValue));
    const newValue = property.min + clampedValue * (property.max - property.min);
    
    // Debug output to console
    console.log('Click at:', x, 'Slider center:', sliderWorldX, 'Normalized:', normalizedValue, 'Value:', newValue);
    
    onChange(property.key, newValue);
  };

  // Listen for pointer up globally (in case pointer leaves the mesh)
  React.useEffect(() => {
    if (!isDragging) return;
    const up = () => setIsDragging(false);
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, [isDragging]);

  return (
    <group position={position}>
      {/* Property name */}
      <Text 
        ref={textRef}
        position={[-width/2 - 0.5, 0, 0]} 
        fontSize={0.12}
        color="#AACCFF"
        anchorX="right"
        anchorY="middle"
      >
        {property.name}
      </Text>
      
      {/* Slider track */}
      <RoundedBox 
        ref={sliderRef}
        args={[width, 0.12, 0.05]} 
        radius={0.05}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onClick={(e) => { 
          e.stopPropagation(); 
          onSelect(property.name); 
          if (e.point) {
            handleDrag(e);
          }
        }}
      >
        <meshPhysicalMaterial 
          color="#1A2038"
          roughness={0.7}
          transmission={0.1}
          transparent={true}
          opacity={0.7}
        />
      </RoundedBox>
      
      {/* Slider handle */}
      <Sphere 
        ref={handleRef}
        args={[0.08, 16, 16]} 
        position={[handlePosition, 0, 0.05]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        <meshPhysicalMaterial 
          color={isDragging ? "#00FFFF" : "#00BFFF"}
          roughness={0.3}
          metalness={0.1}
          emissive={isDragging ? "#00FFFF" : "#4499FF"}
          emissiveIntensity={isDragging ? 1.0 : 0.5}
        />
      </Sphere>
      
      {/* Value display (clickable for numeric input) */}
      <Text 
        position={[width/2 + 0.3, 0, 0]} 
        fontSize={0.12}
        color="#AACCFF"
        anchorX="left"
        anchorY="middle"
        onClick={() => setEditing(true)}
        style={{ cursor: 'pointer' }}
      >
        {value.toFixed(2)}
      </Text>
      {editing && (
        <NumericInputOverlay
          value={value}
          onChange={v => onChange(property.key, Math.max(property.min, Math.min(property.max, v)))}
          onBlur={() => setEditing(false)}
          position={position}
        />
      )}
    </group>
  );
}

// Color picker component in 3D
function ColorPicker3D({ property, value, onChange, position, selected, onSelect }) {
  const colorRef = useRef();
  const textRef = useRef();
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  
  // Animation for hover/selection effects
  useFrame(() => {
    if (colorRef.current && textRef.current) {
      colorRef.current.material.emissiveIntensity = selected ? 0.8 : 0.4;
      textRef.current.material.color.lerp(new THREE.Color(selected ? '#FFFFFF' : '#AACCFF'), 0.1);
    }
  });

  // Parse color value to use in material
  const colorObj = new THREE.Color(value);
  
  // Creates a row of color options
  const createColorOptions = () => {
    const colors = ['#FF5555', '#55FF55', '#5555FF', '#FFFF55', '#55FFFF', '#FF55FF', '#FFFFFF'];
    return colors.map((color, index) => (
      <Sphere 
        key={index}
        args={[0.08, 16, 16]} 
        position={[0.2 * index - 0.6, -0.25, 0.05]}
        onClick={() => onChange(property.key, color)}
      >
        <meshPhysicalMaterial 
          color={color}
          roughness={0.3}
          metalness={0.1}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </Sphere>
    ));
  };

  return (
    <group position={position}>
      {/* Property name */}
      <Text 
        ref={textRef}
        position={[-1.5, 0, 0]} 
        fontSize={0.12}
        color="#AACCFF"
        anchorX="right"
        anchorY="middle"
      >
        {property.name}
      </Text>
      
      {/* Color display */}
      <RoundedBox 
        ref={colorRef}
        args={[0.5, 0.2, 0.05]} 
        radius={0.05}
        position={[-0.8, 0, 0]}
        onClick={() => onSelect(property.name)}
      >
        <meshPhysicalMaterial 
          color={colorObj}
          roughness={0.3}
          metalness={0.1}
          emissive={colorObj}
          emissiveIntensity={0.4}
        />
      </RoundedBox>
      
      {/* Color value display (clickable for hex input) */}
      <Text 
        position={[0, 0, 0]} 
        fontSize={0.12}
        color="#AACCFF"
        anchorX="left"
        anchorY="middle"
        onClick={() => setEditing(true)}
        style={{ cursor: 'pointer' }}
      >
        {value}
      </Text>
      {editing && (
        <div style={{
          position: 'fixed',
          left: `calc(50vw + ${position[0] * 40}px)` ,
          top: `calc(50vh + ${position[1] * -40}px)` ,
          zIndex: 1000,
          background: '#222',
          color: '#fff',
          borderRadius: 4,
          padding: 2,
          fontSize: 14,
          width: 70,
          textAlign: 'center',
          border: '1px solid #555'
        }}>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onBlur={() => { setEditing(false); onChange(property.key, inputValue); }}
            onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); onChange(property.key, inputValue); }}}
            style={{ width: '60px', background: 'transparent', color: '#fff', border: 'none', outline: 'none' }}
            autoFocus
          />
        </div>
      )}
      {/* Color options row (only shown when selected) */}
      {selected && createColorOptions()}
    </group>
  );
}

// Dropdown selector for material type
function MaterialTypeSelector({ value, onChange, position }) {
  const materialTypes = [
    'glass', 'metal', 'plastic', 'basic', 'standard', 'physical',
    'normal', 'matcap', 'shader', 'glow', 'gradient'
  ];
  
  return (
    <group position={position}>
      <Text 
        position={[-1.5, 0, 0]} 
        fontSize={0.12}
        color="#AACCFF"
        anchorX="right"
        anchorY="middle"
      >
        Material Type
      </Text>
      
      {/* Current selection display */}
      <RoundedBox 
        args={[1.5, 0.2, 0.05]} 
        radius={0.05}
        position={[-0.5, 0, 0]}
        onClick={() => {
          // Cycle to next material type
          const currentIndex = materialTypes.indexOf(value);
          const nextIndex = (currentIndex + 1) % materialTypes.length;
          onChange('materialType', materialTypes[nextIndex]);
        }}
      >
        <meshPhysicalMaterial 
          color="#2A4058"
          roughness={0.4}
          metalness={0.1}
          transmission={0.1}
          emissive="#4499FF"
          emissiveIntensity={0.2}
        />
      </RoundedBox>
      
      <Text 
        position={[-0.5, 0, 0.05]} 
        fontSize={0.1}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Text>
    </group>
  );
}

export default function MaterialEditor3D({ position = [0, 0, 0] }) {
  const groupRef = useRef();
  const panelRef = useRef();
  const selectedObject = useMaterialStore(state => state.selectedObject);
  const selectedLayer = useMaterialStore(state => state.selectedLayer);
  const getCurrentMaterialValues = useMaterialStore(state => state.getCurrentMaterialValues);
  const updateMaterialProperty = useMaterialStore(state => state.updateMaterialProperty);
  const savedMaterials = useMaterialStore(state => state.savedMaterials);
  
  const values = getCurrentMaterialValues();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [showShaderEditor, setShowShaderEditor] = useState(false);
  
  // Get material type with fallback to 'glass'
  const materialType = values.materialType || 'glass';

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
      if (panelRef.current) {
        const targetRotation = editorOpen ? new THREE.Euler(0, state.camera.rotation.y * 0.2, 0) : new THREE.Euler(0, 0, 0);
        panelRef.current.rotation.y = THREE.MathUtils.lerp(panelRef.current.rotation.y, targetRotation.y, 0.05);
        const targetScale = editorOpen ? 1 : 0.001;
        panelRef.current.scale.x = THREE.MathUtils.lerp(panelRef.current.scale.x, targetScale, 0.1);
        panelRef.current.scale.y = THREE.MathUtils.lerp(panelRef.current.scale.y, targetScale, 0.1);
        panelRef.current.scale.z = THREE.MathUtils.lerp(panelRef.current.scale.z, targetScale, 0.1);
      }
    }
  });

  const getPropertiesForMaterialType = () => {
    const propertyKeys = MATERIAL_TYPE_PROPERTIES[materialType] || MATERIAL_TYPE_PROPERTIES['glass'];
    return MATERIAL_PROPERTIES.filter(prop => propertyKeys.includes(prop.key));
  };

  const renderPropertyControl = (property, index) => {
    const yPos = -index * 0.25;
    const controlPosition = [0, yPos, 0];
    if (property.type === 'slider') {
      return (
        <Slider3D
          key={property.name}
          property={property}
          value={values[property.key] ?? property.default}
          onChange={(key, val) => updateMaterialProperty(key, val)}
          position={controlPosition}
          selected={selectedProperty === property.name}
          onSelect={setSelectedProperty}
        />
      );
    } else if (property.type === 'color') {
      return (
        <ColorPicker3D
          key={property.name}
          property={property}
          value={values[property.key] ?? property.default}
          onChange={(key, val) => updateMaterialProperty(key, val)}
          position={controlPosition}
          selected={selectedProperty === property.name}
          onSelect={setSelectedProperty}
        />
      );
    }
    return null;
  };

  const updateMaterialWithGlassEffects = (values) => {
    if (!values) return values;
    
    // Apply glass-specific effects
    const dispersionEffect = values.dispersion || 0;
    const causticsEffect = values.causticsIntensity || 0;
    const surfaceNoiseEffect = values.surfaceNoise || 0;
    const aberrationEffect = values.aberration || 0;
    const fresnelEffect = values.fresnelPower || 1;

    return {
      ...values,
      envMapIntensity: values.envMapIntensity * (1 + dispersionEffect * 0.5),
      transmission: values.transmission * (1 - surfaceNoiseEffect * 0.3),
      clearcoat: values.clearcoat * (1 + causticsEffect * 0.5),
      ior: values.ior * (1 + aberrationEffect * 0.2),
      metalness: values.metalness * (1 - fresnelEffect * 0.2)
    };
  };
  
  // When material type is shader, show shader editor
  const handleShaderToggle = () => {
    if (materialType === 'shader') {
      // Toggle shader editor visibility
      setShowShaderEditor(!showShaderEditor);
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {/* Toggle Button */}
      <group position={[0, 2, 0]} onClick={() => setEditorOpen(!editorOpen)}>
        <RoundedBox args={[0.5, 0.5, 0.1]} radius={0.1}>
          <meshPhysicalMaterial
            color="#005FFF"
            roughness={0.4}
            metalness={0.1}
            transmission={0.7}
            opacity={0.9}
            transparent={true}
            emissive="#00BFFF"
            emissiveIntensity={editorOpen ? 0.8 : 0.4}
          />
        </RoundedBox>
        <Text 
          position={[0, 0, 0.07]} 
          fontSize={0.2}
          color="#FFFFFF"
        >
          {editorOpen ? 'x' : 'E'}
        </Text>
      </group>
      
      {/* Editor Panel */}
      <group ref={panelRef} position={[-2, 0, 0]} visible={editorOpen}>
        {/* Panel background */}
        <RoundedBox args={[4, 7, 0.2]} radius={0.2} position={[0, 0, -0.1]}>
          <meshPhysicalMaterial
            color="#1A1A2F"
            roughness={0.7}
            transmission={0.3}
            opacity={0.8}
            transparent={true}
            envMapIntensity={0.5}
          />
        </RoundedBox>
        
        {/* Panel header */}
        <group position={[0, 3, 0]}>
          <Text 
            position={[0, 0, 0.1]} 
            fontSize={0.25}
            color="#FFFFFF"
            fontWeight="bold"
          >
            Material Editor
          </Text>
          <Text 
            position={[0, -0.3, 0.1]} 
            fontSize={0.15}
            color="#AACCFF"
          >
            {selectedObject}{selectedLayer ? ` (${selectedLayer})` : ''}
          </Text>
        </group>
        
        {/* Material type selector */}
        <MaterialTypeSelector 
          value={materialType}
          onChange={(key, val) => {
            updateMaterialProperty(key, val);
            // Reset properties when changing material type
            if (val === 'shader') {
              setShowShaderEditor(true);
            }
          }}
          position={[0, 2.3, 0.1]}
        />
        
        {/* Shader Editor Toggle for shader material type */}
        {materialType === 'shader' && (
          <group position={[1.5, 2.3, 0.1]} onClick={handleShaderToggle}>
            <RoundedBox args={[0.8, 0.2, 0.05]} radius={0.05}>
              <meshPhysicalMaterial
                color="#4080FF"
                roughness={0.4}
                metalness={0.1}
                emissive="#00BFFF"
                emissiveIntensity={showShaderEditor ? 0.8 : 0.4}
              />
            </RoundedBox>
            <Text 
              position={[0, 0, 0.05]} 
              fontSize={0.08}
              color="#FFFFFF"
            >
              {showShaderEditor ? "Hide Editor" : "Show Editor"}
            </Text>
          </group>
        )}
        
        {/* Material preview sphere */}
        <Sphere args={[0.5, 32, 32]} position={[0, 2, 0.2]}>
          <meshPhysicalMaterial
            {...updateMaterialWithGlassEffects(values)}
            transparent={true}
          />
        </Sphere>
        
        {/* Properties list - conditionally render based on material type */}
        <group position={[0, 0.5, 0.1]}>
          {getPropertiesForMaterialType().map(renderPropertyControl)}
        </group>
        
        {/* Shader editor container */}
        {showShaderEditor && materialType === 'shader' && (
          <div style={{
            position: 'fixed',
            left: '10vw',
            top: '10vh',
            width: '80vw',
            height: '80vh',
            zIndex: 1000,
            backgroundColor: 'rgba(20, 20, 40, 0.95)',
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <h2 style={{ color: '#FFFFFF', margin: 0 }}>Shader Editor</h2>
              <button 
                onClick={() => setShowShaderEditor(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <ShaderEditor />
            </div>
          </div>
        )}
      </group>
    </group>
  );
} 