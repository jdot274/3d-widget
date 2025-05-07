import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMaterialEditor } from '../context/MaterialEditorContext';

// Group materials by type
function organizeByType(materials) {
  return materials.reduce((acc, material) => {
    if (!acc[material.type]) {
      acc[material.type] = [];
    }
    acc[material.type].push(material);
    return acc;
  }, {});
}

// Material thumbnail preview
function MaterialThumbnail({ material, position, selected, onClick }) {
  const sphereRef = useRef();
  const textRef = useRef();
  
  // Visual effects for selection
  useFrame(() => {
    if (sphereRef.current && textRef.current) {
      sphereRef.current.position.y = position[1] + Math.sin(performance.now() * 0.003) * 0.03;
      sphereRef.current.rotation.y += 0.01;
      
      if (selected) {
        if (textRef.current.material) {
          textRef.current.material.color.lerp(new THREE.Color('#FFFFFF'), 0.1);
        }
        if (sphereRef.current.material) {
          sphereRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
            sphereRef.current.material.emissiveIntensity, 
            0.5, 
            0.1
          );
        }
      } else {
        if (textRef.current.material) {
          textRef.current.material.color.lerp(new THREE.Color('#AACCFF'), 0.1);
        }
        if (sphereRef.current.material) {
          sphereRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
            sphereRef.current.material.emissiveIntensity, 
            0.2, 
            0.1
          );
        }
      }
    }
  });
  
  const handleClick = (e) => {
    e.stopPropagation();
    onClick(material.id);
  };
  
  const properties = material.properties;
  
  // Handle special patterns if needed
  const renderPatternSphere = () => {
    if (material.type === 'pattern' && properties.pattern === 'grid') {
      // For this demo, we're using a simple emissive material for grids
      // In a real implementation, we could use custom geometry or shaders
      return (
        <Sphere ref={sphereRef} args={[0.15, 32, 32]} position={[position[0], position[1], position[2]]} onClick={handleClick}>
          <meshPhysicalMaterial
            color={properties.color}
            metalness={properties.metalness || 0}
            roughness={properties.roughness || 0.5}
            transmission={properties.transmission || 0}
            opacity={properties.opacity || 1}
            transparent={properties.opacity < 1}
            ior={properties.ior || 1.5}
            thickness={properties.thickness || 0.01}
            envMapIntensity={properties.envMapIntensity || 1}
            clearcoat={properties.clearcoat || 0}
            clearcoatRoughness={properties.clearcoatRoughness || 0}
            emissive={properties.emissive || '#000000'}
            emissiveIntensity={0.2}
            wireframe={true}
          />
        </Sphere>
      );
    } else if (material.type === 'pattern' && properties.pattern === 'dots') {
      // Special material for perforated effect
      return (
        <Sphere ref={sphereRef} args={[0.15, 32, 32]} position={[position[0], position[1], position[2]]} onClick={handleClick}>
          <meshPhysicalMaterial
            color={properties.color}
            metalness={properties.metalness || 0}
            roughness={properties.roughness || 0.5}
            transmission={properties.transmission || 0}
            opacity={properties.opacity || 1}
            transparent={properties.opacity < 1}
            ior={properties.ior || 1.5}
            thickness={properties.thickness || 0.01}
            envMapIntensity={properties.envMapIntensity || 1}
            clearcoat={properties.clearcoat || 0}
            clearcoatRoughness={properties.clearcoatRoughness || 0}
            emissive={properties.emissive || '#000000'}
            emissiveIntensity={0.2}
            // Special dotted pattern would use custom shaders in a full implementation
            // For preview, it just shows the material
          />
        </Sphere>
      );
    }
    
    // Default material preview sphere
    return (
      <Sphere ref={sphereRef} args={[0.15, 32, 32]} position={[position[0], position[1], position[2]]} onClick={handleClick}>
        <meshPhysicalMaterial
          color={properties.color}
          metalness={properties.metalness || 0}
          roughness={properties.roughness || 0.5}
          transmission={properties.transmission || 0}
          opacity={properties.opacity || 1}
          transparent={properties.opacity < 1}
          ior={properties.ior || 1.5}
          thickness={properties.thickness || 0.01}
          envMapIntensity={properties.envMapIntensity || 1}
          clearcoat={properties.clearcoat || 0}
          clearcoatRoughness={properties.clearcoatRoughness || 0}
          emissive={properties.emissive || '#000000'}
          emissiveIntensity={0.2}
        />
      </Sphere>
    );
  };
  
  return (
    <group>
      {renderPatternSphere()}
      
      <Text 
        ref={textRef}
        position={[position[0], position[1] - 0.25, position[2]]} 
        fontSize={0.08}
        color="#AACCFF"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.8}
      >
        {material.name}
      </Text>
      
      {selected && (
        <RoundedBox 
          args={[0.4, 0.4, 0.02]} 
          radius={0.05} 
          position={[position[0], position[1], position[2] - 0.05]}
        >
          <meshPhysicalMaterial 
            color="#1A2038"
            roughness={0.7}
            transmission={0.1}
            transparent={true}
            opacity={0.4}
            emissive="#4477FF"
            emissiveIntensity={0.1}
          />
        </RoundedBox>
      )}
      
      {/* Delete button for custom materials */}
      {!material.isPreset && (
        <Text
          position={[position[0] + 0.2, position[1] + 0.2, position[2]]}
          fontSize={0.08}
          color="#FF5555"
          anchorX="center"
          anchorY="middle"
          onClick={(e) => {
            e.stopPropagation();
            onClick(material.id, 'delete');
          }}
        >
          ×
        </Text>
      )}
    </group>
  );
}

// Category header for materials
function CategoryHeader({ title, position }) {
  return (
    <group position={position}>
      <Text 
        position={[0, 0, 0]} 
        fontSize={0.12}
        color="#FFFFFF"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>
      
      <RoundedBox 
        args={[1.2, 0.05, 0.01]} 
        radius={0.01} 
        position={[0, -0.12, 0]}
      >
        <meshPhysicalMaterial 
          color="#FFFFFF"
          roughness={0.7}
          opacity={0.3}
          transparent={true}
        />
      </RoundedBox>
    </group>
  );
}

// Save material modal
function SaveMaterialModal({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('custom');
  
  return (
    <Html>
      <div style={{
        background: 'rgba(10, 20, 40, 0.9)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #4477AA',
        width: '300px',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#88AAFF' }}>Save Material</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              background: 'rgba(30, 40, 60, 0.6)',
              border: '1px solid #4477AA',
              borderRadius: '4px',
              padding: '8px',
              color: 'white',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Type:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              background: 'rgba(30, 40, 60, 0.6)',
              border: '1px solid #4477AA',
              borderRadius: '4px',
              padding: '8px',
              color: 'white',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <option value="glass">Glass</option>
            <option value="metal">Metal</option>
            <option value="plastic">Plastic</option>
            <option value="pattern">Pattern</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={onCancel}
            style={{
              background: 'rgba(100, 100, 120, 0.4)',
              border: '1px solid #555577',
              borderRadius: '4px',
              padding: '8px 15px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(name, type)}
            disabled={!name}
            style={{
              background: !name ? 'rgba(70, 100, 150, 0.3)' : 'rgba(70, 100, 150, 0.8)',
              border: '1px solid #4477AA',
              borderRadius: '4px',
              padding: '8px 15px',
              color: 'white',
              cursor: !name ? 'not-allowed' : 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </div>
    </Html>
  );
}

// Update the PreviewPanel component
function PreviewPanel({ material, onApply, onClose, onDelete, onSave }) {
  // ... existing code ...
  
  // Find the position where the two action buttons are rendered
  
  return (
    <group position={[0, 0, 0.5]}>
      {/* ... existing code ... */}
        
      {/* Actions */}
      <group position={[0, -1.8, 0]}>
        {/* Apply button */}
        <group position={[-0.7, 0, 0]} onClick={onApply}>
          <RoundedBox args={[1.2, 0.4, 0.05]} radius={0.1}>
            <meshPhysicalMaterial
              color="#0066CC"
              roughness={0.4}
              metalness={0.1}
              transmission={0.4}
              opacity={0.9}
              transparent={true}
              emissive="#00AAFF"
              emissiveIntensity={0.3}
            />
          </RoundedBox>
          <Text 
            position={[0, 0, 0.03]} 
            fontSize={0.15}
            color="#FFFFFF"
          >
            Apply
          </Text>
        </group>
        
        {/* Save Material button - highly visible */}
        <group position={[0.7, 0, 0]} onClick={onSave}>
          <RoundedBox args={[1.2, 0.4, 0.05]} radius={0.1}>
            <meshPhysicalMaterial
              color="#00AA00"
              roughness={0.4}
              metalness={0.1}
              transmission={0.4}
              opacity={0.9}
              transparent={true}
              emissive="#00FF00"
              emissiveIntensity={0.3}
            />
          </RoundedBox>
          <Text 
            position={[0, 0, 0.03]} 
            fontSize={0.15}
            color="#FFFFFF"
          >
            Save
          </Text>
        </group>
        
        {/* Close button */}
        <group position={[0, -0.7, 0]} onClick={onClose}>
          <RoundedBox args={[2.5, 0.4, 0.05]} radius={0.1}>
            <meshPhysicalMaterial
              color="#333344"
              roughness={0.4}
              metalness={0.1}
              transmission={0.4}
              opacity={0.9}
              transparent={true}
            />
          </RoundedBox>
          <Text 
            position={[0, 0, 0.03]} 
            fontSize={0.15}
            color="#FFFFFF"
          >
            Close
          </Text>
        </group>
        
        {/* Delete button - only show for saved materials */}
        {material.id && (
          <group position={[0, -1.4, 0]} onClick={onDelete}>
            <RoundedBox args={[2.5, 0.4, 0.05]} radius={0.1}>
              <meshPhysicalMaterial
                color="#AA0000"
                roughness={0.4}
                metalness={0.1}
                transmission={0.4}
                opacity={0.9}
                transparent={true}
                emissive="#FF0000"
                emissiveIntensity={0.2}
              />
            </RoundedBox>
            <Text 
              position={[0, 0, 0.03]} 
              fontSize={0.15}
              color="#FFFFFF"
            >
              Delete Material
            </Text>
          </group>
        )}
      </group>
      
      {/* ... remaining code ... */}
    </group>
  );
}

export default function MaterialsPanel({ position = [-5, 1, 0] }) {
  const groupRef = useRef();
  const panelRef = useRef();
  const {
    savedMaterials,
    applyMaterial,
    saveCurrentMaterial,
    deleteSavedMaterial,
    getCurrentMaterialValues
  } = useMaterialEditor();
  
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [materialsByType, setMaterialsByType] = useState({});
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Organize materials by type when savedMaterials changes
  useEffect(() => {
    setMaterialsByType(organizeByType(savedMaterials));
  }, [savedMaterials]);
  
  // Handle material thumbnail click
  const handleMaterialClick = (materialId, action = 'select') => {
    if (action === 'delete') {
      deleteSavedMaterial(materialId);
      if (selectedMaterial === materialId) {
        setSelectedMaterial(null);
      }
    } else {
      setSelectedMaterial(materialId);
      applyMaterial(materialId);
    }
  };
  
  // Handle save button click
  const handleSaveClick = () => {
    setShowSaveModal(true);
  };
  
  // Handle save material
  const handleSaveMaterial = async (name, type) => {
    try {
      const newId = await saveCurrentMaterial(name, type);
      setSelectedMaterial(newId);
      setShowSaveModal(false);
    } catch (error) {
      console.error('Failed to save material:', error);
      // In a real app, show error message to user
    }
  };
  
  // Animation for panel
  useFrame((state) => {
    if (groupRef.current) {
      // Float effect
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
      
      // Panel animation
      if (panelRef.current) {
        const targetRotation = panelOpen ? new THREE.Euler(0, state.camera.rotation.y * 0.2, 0) : new THREE.Euler(0, 0, 0);
        panelRef.current.rotation.y = THREE.MathUtils.lerp(panelRef.current.rotation.y, targetRotation.y, 0.05);
        
        const targetScale = panelOpen ? 1 : 0.001;
        panelRef.current.scale.x = THREE.MathUtils.lerp(panelRef.current.scale.x, targetScale, 0.1);
        panelRef.current.scale.y = THREE.MathUtils.lerp(panelRef.current.scale.y, targetScale, 0.1);
        panelRef.current.scale.z = THREE.MathUtils.lerp(panelRef.current.scale.z, targetScale, 0.1);
      }
    }
  });
  
  // Handle scrolling
  const handleScroll = (direction) => {
    const maxScroll = Math.max(0, Object.keys(materialsByType).length * 1.5 - 3);
    if (direction === 'up' && scrollPosition > 0) {
      setScrollPosition(Math.max(0, scrollPosition - 0.5));
    } else if (direction === 'down' && scrollPosition < maxScroll) {
      setScrollPosition(Math.min(maxScroll, scrollPosition + 0.5));
    }
  };
  
  // Render materials grid
  const renderMaterialsGrid = () => {
    const grid = [];
    let yOffset = 0;
    
    // Iterate through each material type
    Object.entries(materialsByType).forEach(([type, materials], typeIndex) => {
      const typeYPosition = 2 - (typeIndex * 1.5) + scrollPosition;
      
      // Skip if offscreen (basic culling)
      if (typeYPosition < -4 || typeYPosition > 4) {
        return;
      }
      
      // Add category header
      grid.push(
        <CategoryHeader 
          key={`cat-${type}`} 
          title={type.charAt(0).toUpperCase() + type.slice(1)} 
          position={[0, typeYPosition, 0]} 
        />
      );
      
      // Add materials in a row
      materials.forEach((material, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const xPos = (col - 1) * 0.5;
        const yPos = typeYPosition - 0.4 - (row * 0.5);
        
        // Skip if offscreen
        if (yPos < -4 || yPos > 4) {
          return;
        }
        
        grid.push(
          <MaterialThumbnail
            key={material.id}
            material={material}
            position={[xPos, yPos, 0]}
            selected={selectedMaterial === material.id}
            onClick={handleMaterialClick}
          />
        );
      });
    });
    
    return grid;
  };
  
  // In the handlePreviewClick function
  const handlePreviewClick = (material, action = 'preview') => {
    if (action === 'preview') {
      setPreviewMaterial(material);
      setShowPreview(true);
    } else if (action === 'apply') {
      applyMaterial(material);
    } else if (action === 'delete') {
      deleteSavedMaterial(material.id);
    }
  };
  
  return (
    <group ref={groupRef} position={position}>
      {/* Toggle Button */}
      <group position={[0, 2, 0]} onClick={() => setPanelOpen(!panelOpen)}>
        <RoundedBox args={[0.5, 0.5, 0.1]} radius={0.1}>
          <meshPhysicalMaterial
            color="#005FFF"
            roughness={0.4}
            metalness={0.1}
            transmission={0.7}
            opacity={0.9}
            transparent={true}
            emissive="#00BFFF"
            emissiveIntensity={panelOpen ? 0.8 : 0.4}
          />
        </RoundedBox>
        <Text 
          position={[0, 0, 0.07]} 
          fontSize={0.2}
          color="#FFFFFF"
        >
          {panelOpen ? 'x' : 'M'}
        </Text>
      </group>
      
      {/* Materials Panel */}
      <group ref={panelRef} position={[0, 0, 0]} visible={panelOpen}>
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
            Materials
          </Text>
          <Text 
            position={[0, -0.3, 0.1]} 
            fontSize={0.15}
            color="#AACCFF"
          >
            {savedMaterials.length} Materials Available
          </Text>
        </group>
        
        {/* Materials container */}
        <group position={[0, 0, 0.1]}>
          {renderMaterialsGrid()}
        </group>
        
        {/* Scroll buttons */}
        <group position={[1.5, 0, 0.1]}>
          <RoundedBox 
            args={[0.3, 0.3, 0.05]} 
            radius={0.05} 
            position={[0, 2, 0]}
            onClick={() => handleScroll('up')}
          >
            <meshPhysicalMaterial
              color="#005FFF"
              roughness={0.4}
              opacity={0.9}
              transparent={true}
            />
          </RoundedBox>
          <Text 
            position={[0, 2, 0.03]} 
            fontSize={0.15}
            color="#FFFFFF"
          >
            ▲
          </Text>
          
          <RoundedBox 
            args={[0.3, 0.3, 0.05]} 
            radius={0.05} 
            position={[0, -2, 0]}
            onClick={() => handleScroll('down')}
          >
            <meshPhysicalMaterial
              color="#005FFF"
              roughness={0.4}
              opacity={0.9}
              transparent={true}
            />
          </RoundedBox>
          <Text 
            position={[0, -2, 0.03]} 
            fontSize={0.15}
            color="#FFFFFF"
          >
            ▼
          </Text>
        </group>
        
        {/* Save button */}
        <group position={[0, -3, 0.1]} onClick={handleSaveClick}>
          <RoundedBox args={[1.2, 0.4, 0.05]} radius={0.1}>
            <meshPhysicalMaterial
              color="#0066CC"
              roughness={0.4}
              metalness={0.1}
              transmission={0.4}
              opacity={0.9}
              transparent={true}
              emissive="#00AAFF"
              emissiveIntensity={0.3}
            />
          </RoundedBox>
          <Text 
            position={[0, 0, 0.03]} 
            fontSize={0.15}
            color="#FFFFFF"
          >
            Save Material
          </Text>
        </group>
        
        {/* Save material modal */}
        {showSaveModal && (
          <group position={[0, 0, 0.5]}>
            <SaveMaterialModal 
              onSave={handleSaveMaterial}
              onCancel={() => setShowSaveModal(false)}
            />
          </group>
        )}
      </group>
      
      {/* Material preview */}
      {showPreview && (
        <PreviewPanel 
          material={previewMaterial}
          onApply={() => handlePreviewClick(previewMaterial, 'apply')}
          onClose={() => setShowPreview(false)}
          onDelete={() => handlePreviewClick(previewMaterial, 'delete')}
          onSave={() => setShowSaveModal(true)}
        />
      )}
    </group>
  );
} 