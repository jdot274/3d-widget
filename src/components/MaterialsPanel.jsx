import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMaterialEditor } from '../context/MaterialEditorContext';
import useMaterialStore from '../store/useMaterialStore';

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

// Material swatch component for displaying saved materials
function MaterialSwatch({ material, position, onSelect, isSelected }) {
  const swatchRef = useRef();
  
  // Animate on hover/selection
  useFrame(() => {
    if (swatchRef.current) {
      swatchRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        swatchRef.current.material.emissiveIntensity,
        isSelected ? 0.6 : 0.2,
        0.1
      );
    }
  });
  
  // Get preview color from material properties
  const previewColor = material.properties?.color || '#FFFFFF';
  
  return (
    <group position={position} onClick={() => onSelect(material.id)}>
      {/* Material swatch */}
      <RoundedBox args={[0.5, 0.5, 0.05]} radius={0.05} ref={swatchRef}>
        <meshPhysicalMaterial
          color={previewColor}
          roughness={material.properties?.roughness || 0.5}
          metalness={material.properties?.metalness || 0}
          transmission={material.properties?.transmission || 0}
          emissive="#FFFFFF"
          emissiveIntensity={0.2}
        />
      </RoundedBox>
      
      {/* Material name */}
      <Text
        position={[0, -0.35, 0]}
        fontSize={0.1}
        color={isSelected ? '#FFFFFF' : '#AAAAAA'}
        anchorX="center"
        anchorY="middle"
      >
        {material.name}
      </Text>
    </group>
  );
}

export default function MaterialsPanel({ position = [-5, 1, 0] }) {
  const groupRef = useRef();
  const panelRef = useRef();
  
  // Get saved materials and apply material function from Zustand store
  const savedMaterials = useMaterialStore(state => state.savedMaterials);
  const applyMaterial = useMaterialStore(state => state.applyMaterial);
  const saveCurrentMaterial = useMaterialStore(state => state.saveCurrentMaterial);
  const deleteSavedMaterial = useMaterialStore(state => state.deleteSavedMaterial);
  
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [materialsByType, setMaterialsByType] = useState({});
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Organize materials by type when savedMaterials changes
  useEffect(() => {
    setMaterialsByType(organizeByType(savedMaterials));
  }, [savedMaterials]);
  
  // Handle material selection
  const handleSelectMaterial = (materialId) => {
    setSelectedMaterial(materialId);
    applyMaterial(materialId);
  };
  
  // Handle saving a new material
  const handleSaveMaterial = () => {
    if (newMaterialName.trim() !== '') {
      saveCurrentMaterial(newMaterialName, 'custom');
      setNewMaterialName('');
      setShowSaveDialog(false);
    }
  };
  
  // Handle deleting a material
  const handleDeleteMaterial = () => {
    if (selectedMaterial) {
      try {
        deleteSavedMaterial(selectedMaterial);
        setSelectedMaterial(null);
      } catch (error) {
        console.error('Error deleting material:', error);
      }
    }
  };
  
  // Small animation for floating effect
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
      
      // Animate panel opening/closing
      if (panelRef.current) {
        const targetScale = panelOpen ? 1 : 0.001;
        panelRef.current.scale.x = THREE.MathUtils.lerp(panelRef.current.scale.x, targetScale, 0.1);
        panelRef.current.scale.y = THREE.MathUtils.lerp(panelRef.current.scale.y, targetScale, 0.1);
        panelRef.current.scale.z = THREE.MathUtils.lerp(panelRef.current.scale.z, targetScale, 0.1);
      }
    }
  });
  
  // Render material swatches in a grid
  const renderMaterialSwatches = () => {
    const swatches = [];
    const itemsPerRow = 4;
    const spacing = 0.6;
    
    savedMaterials.forEach((material, index) => {
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;
      
      const x = (col - (itemsPerRow - 1) / 2) * spacing;
      const y = -row * spacing;
      
      swatches.push(
        <MaterialSwatch
          key={material.id}
          material={material}
          position={[x, y, 0]}
          onSelect={handleSelectMaterial}
          isSelected={selectedMaterial === material.id}
        />
      );
    });
    
    return swatches;
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
        
        {/* Save and Delete buttons */}
        <group position={[0, 2, 0.1]}>
          <RoundedBox args={[1, 0.3, 0.05]} radius={0.05} position={[-0.7, 0, 0]} onClick={() => setShowSaveDialog(true)}>
            <meshPhysicalMaterial
              color="#005FFF"
              roughness={0.4}
              metalness={0.1}
              emissive="#00BFFF"
              emissiveIntensity={0.6}
            />
          </RoundedBox>
          <Text 
            position={[-0.7, 0, 0.05]} 
            fontSize={0.15}
            color="#FFFFFF"
          >
            Save
          </Text>
          
          <RoundedBox args={[1, 0.3, 0.05]} radius={0.05} position={[0.7, 0, 0]} onClick={handleDeleteMaterial}>
            <meshPhysicalMaterial
              color="#FF3050"
              roughness={0.4}
              metalness={0.1}
              emissive="#FF5050"
              emissiveIntensity={0.6}
            />
          </RoundedBox>
          <Text 
            position={[0.7, 0, 0.05]} 
            fontSize={0.15}
            color="#FFFFFF"
          >
            Delete
          </Text>
        </group>
        
        {/* Material swatches */}
        <group position={[0, 1, 0.1]}>
          {renderMaterialSwatches()}
        </group>
        
        {/* Save dialog */}
        {showSaveDialog && (
          <group position={[0, 0, 0.2]}>
            <RoundedBox args={[3, 2, 0.1]} radius={0.1}>
              <meshPhysicalMaterial
                color="#1A2038"
                roughness={0.7}
                transmission={0.3}
                opacity={0.95}
                transparent={true}
              />
            </RoundedBox>
            
            <Text 
              position={[0, 0.6, 0.1]} 
              fontSize={0.2}
              color="#FFFFFF"
            >
              Save Material
            </Text>
            
            {/* Input field (simplified for 3D) */}
            <RoundedBox args={[2.5, 0.4, 0.05]} radius={0.05} position={[0, 0, 0.1]}>
              <meshPhysicalMaterial
                color="#000020"
                roughness={0.4}
                metalness={0.1}
              />
            </RoundedBox>
            
            <Text 
              position={[0, 0, 0.15]} 
              fontSize={0.15}
              color="#AACCFF"
            >
              {newMaterialName || "Enter name..."}
            </Text>
            
            {/* Save and Cancel buttons */}
            <group position={[0, -0.6, 0.1]}>
              <RoundedBox args={[1, 0.3, 0.05]} radius={0.05} position={[-0.7, 0, 0]} onClick={handleSaveMaterial}>
                <meshPhysicalMaterial
                  color="#005FFF"
                  roughness={0.4}
                  metalness={0.1}
                  emissive="#00BFFF"
                  emissiveIntensity={0.6}
                />
              </RoundedBox>
              <Text 
                position={[-0.7, 0, 0.05]} 
                fontSize={0.15}
                color="#FFFFFF"
              >
                Save
              </Text>
              
              <RoundedBox args={[1, 0.3, 0.05]} radius={0.05} position={[0.7, 0, 0]} onClick={() => setShowSaveDialog(false)}>
                <meshPhysicalMaterial
                  color="#444444"
                  roughness={0.4}
                  metalness={0.1}
                  emissive="#888888"
                  emissiveIntensity={0.6}
                />
              </RoundedBox>
              <Text 
                position={[0.7, 0, 0.05]} 
                fontSize={0.15}
                color="#FFFFFF"
              >
                Cancel
              </Text>
            </group>
            
            {/* Note: In a real 3D UI, you'd need to implement keyboard input */}
            {/* For this demo, we'd use HTML inputs layered on top or add listeners */}
            {/* Here we're just showing the 3D representation of the input field */}
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
          onSave={() => setShowSaveDialog(true)}
        />
      )}
    </group>
  );
} 