import React, { createContext, useContext, useState, useEffect } from 'react';
import * as THREE from 'three';

// Create the context
const MaterialEditorContext = createContext();

// Default material values
const defaultMaterials = {
  glassChip: {
    color: '#6EC1FF',
    metalness: 0.0,
    roughness: 0.55,
    transmission: 0.85,
    opacity: 0.85,
    ior: 1.45,
    thickness: 0.35,
    envMapIntensity: 0.4,
    clearcoat: 0.15,
    clearcoatRoughness: 0.25,
    sheen: 0.5,
    sheenColor: '#FFFFFF',
    sheenRoughness: 0.2,
    emissive: '#000000',
    emissiveIntensity: 0
  },
  glowingButton: {
    // Outer shell properties
    outerShell: {
      color: '#005FFF',
      metalness: 0.0,
      roughness: 0.6,
      transmission: 0.95,
      opacity: 0.65,
      ior: 1.5,
      thickness: 0.8,
      envMapIntensity: 0.8,
      clearcoat: 0.4,
      clearcoatRoughness: 0.3,
      emissive: '#000000',
      emissiveIntensity: 0
    },
    // Inner core properties
    innerCore: {
      color: '#00FFFF',
      metalness: 0.0,
      roughness: 0.8,
      transmission: 0.5,
      opacity: 1.0,
      ior: 1.5,
      thickness: 0.3,
      envMapIntensity: 0.1,
      emissive: '#00BFFF',
      emissiveIntensity: 3.0
    },
    // Innermost spark properties
    innermostSpark: {
      color: '#FFFFFF',
      metalness: 0.0,
      roughness: 0.3,
      transmission: 0.0,
      opacity: 1.0,
      emissive: '#FFFFFF',
      emissiveIntensity: 4.5
    }
  }
};

// Preset materials
const presetMaterials = {
  // Glass presets
  'frosted-blue-glass': {
    name: 'Frosted Blue Glass',
    type: 'glass',
    properties: {
      color: '#6EC1FF',
      metalness: 0.0,
      roughness: 0.55,
      transmission: 0.85,
      opacity: 0.85,
      ior: 1.45,
      thickness: 0.35,
      envMapIntensity: 0.4,
      clearcoat: 0.15,
      clearcoatRoughness: 0.25,
      emissive: '#000000',
      emissiveIntensity: 0
    }
  },
  'clear-glass': {
    name: 'Clear Glass',
    type: 'glass',
    properties: {
      color: '#FFFFFF',
      metalness: 0.0,
      roughness: 0.15,
      transmission: 0.95,
      opacity: 0.9,
      ior: 1.5,
      thickness: 0.2,
      envMapIntensity: 0.5,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      emissive: '#000000',
      emissiveIntensity: 0
    }
  },
  'macos-dark-glass': {
    name: 'macOS Dark Glass',
    type: 'glass',
    properties: {
      color: '#1A1A1A',
      metalness: 0.0,
      roughness: 0.3,
      transmission: 0.7,
      opacity: 0.8,
      ior: 1.4,
      thickness: 0.3,
      envMapIntensity: 0.6,
      clearcoat: 0.2,
      clearcoatRoughness: 0.2,
      emissive: '#000000',
      emissiveIntensity: 0
    }
  },
  // Metal presets
  'silver-metal': {
    name: 'Silver Metal',
    type: 'metal',
    properties: {
      color: '#E8E8E8',
      metalness: 0.9,
      roughness: 0.15,
      transmission: 0,
      opacity: 1.0,
      envMapIntensity: 1.0,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      emissive: '#000000',
      emissiveIntensity: 0
    }
  },
  'gold-metal': {
    name: 'Gold Metal',
    type: 'metal',
    properties: {
      color: '#FFD700',
      metalness: 1.0,
      roughness: 0.15,
      transmission: 0,
      opacity: 1.0,
      envMapIntensity: 1.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      emissive: '#000000',
      emissiveIntensity: 0
    }
  },
  'brushed-aluminum': {
    name: 'Brushed Aluminum',
    type: 'metal',
    properties: {
      color: '#B8B8B8',
      metalness: 0.8,
      roughness: 0.5,
      transmission: 0,
      opacity: 1.0,
      envMapIntensity: 0.8,
      clearcoat: 0.2,
      clearcoatRoughness: 0.2,
      emissive: '#000000',
      emissiveIntensity: 0
    }
  },
  // Plastic presets
  'glossy-plastic': {
    name: 'Glossy Plastic',
    type: 'plastic',
    properties: {
      color: '#4287f5',
      metalness: 0.0,
      roughness: 0.2,
      transmission: 0.1,
      opacity: 1.0,
      envMapIntensity: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      emissive: '#000000',
      emissiveIntensity: 0
    }
  },
  'matte-plastic': {
    name: 'Matte Plastic',
    type: 'plastic',
    properties: {
      color: '#4287f5',
      metalness: 0.0,
      roughness: 0.9,
      transmission: 0,
      opacity: 1.0,
      envMapIntensity: 0.2,
      clearcoat: 0.0,
      clearcoatRoughness: 0.0,
      emissive: '#000000',
      emissiveIntensity: 0
    }
  },
  // Special pattern presets
  'metal-grid': {
    name: 'Metal Grid',
    type: 'pattern',
    properties: {
      color: '#B8B8B8',
      metalness: 0.9,
      roughness: 0.3,
      transmission: 0,
      opacity: 1.0,
      envMapIntensity: 1.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      emissive: '#3366FF',
      emissiveIntensity: 0.2,
      // Additional pattern properties could be used by specialized components
      pattern: 'grid',
      gridSize: 0.05,
      gridWidth: 0.01
    }
  },
  'perforated': {
    name: 'Perforated Metal',
    type: 'pattern',
    properties: {
      color: '#DEDEDE',
      metalness: 0.8,
      roughness: 0.2,
      transmission: 0.3,
      opacity: 0.9,
      envMapIntensity: 0.9,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      emissive: '#000000',
      emissiveIntensity: 0,
      // Additional pattern properties
      pattern: 'dots',
      dotSize: 0.03,
      dotSpacing: 0.07
    }
  }
};

// Initialize IndexedDB
const initializeDB = () => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('MaterialsDB', 1);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create an object store for materials if it doesn't exist
      if (!db.objectStoreNames.contains('materials')) {
        const store = db.createObjectStore('materials', { keyPath: 'id' });
        store.createIndex('by_type', 'type', { unique: false });
        store.createIndex('by_name', 'name', { unique: false });
        
        // Populate with preset materials
        Object.entries(presetMaterials).forEach(([id, material]) => {
          store.add({
            id,
            name: material.name,
            type: material.type,
            properties: material.properties,
            isPreset: true
          });
        });
      }
    };
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
  });
};

// Get all materials from IndexedDB
const getAllMaterials = async () => {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['materials'], 'readonly');
      const store = transaction.objectStore('materials');
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Error getting materials:', error);
    // Return preset materials as fallback
    return Object.entries(presetMaterials).map(([id, material]) => ({
      id,
      name: material.name,
      type: material.type,
      properties: material.properties,
      isPreset: true
    }));
  }
};

// Save a new material to IndexedDB
const saveMaterial = async (material) => {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['materials'], 'readwrite');
      const store = transaction.objectStore('materials');
      const request = store.put(material);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Error saving material:', error);
    throw error;
  }
};

// Delete a material from IndexedDB
const deleteMaterial = async (id) => {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['materials'], 'readwrite');
      const store = transaction.objectStore('materials');
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

export const MaterialEditorProvider = ({ children }) => {
  // State for storing material properties
  const [materials, setMaterials] = useState(defaultMaterials);
  // State for storing saved/preset materials
  const [savedMaterials, setSavedMaterials] = useState([]);
  // Currently selected object for editing
  const [selectedObject, setSelectedObject] = useState('glassChip');
  // Currently selected layer for the object (e.g., outerShell, innerCore for glowingButton)
  const [selectedLayer, setSelectedLayer] = useState(null);
  
  // Load saved materials from IndexedDB on mount
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const materials = await getAllMaterials();
        setSavedMaterials(materials);
      } catch (error) {
        console.error('Failed to load materials:', error);
      }
    };
    
    loadMaterials();
  }, []);
  
  // Initialize the selected layer based on the selected object
  useEffect(() => {
    if (selectedObject === 'glassChip') {
      setSelectedLayer(null); // GlassChip has no layers, so set to null
    } else if (selectedObject === 'glowingButton' && !selectedLayer) {
      setSelectedLayer('outerShell'); // Default to outerShell for glowingButton
    }
  }, [selectedObject, selectedLayer]);
  
  // Get the current material values for the selected object and layer
  const getCurrentMaterialValues = () => {
    if (selectedObject === 'glassChip') {
      return materials.glassChip;
    } else if (selectedObject === 'glowingButton' && selectedLayer) {
      return materials.glowingButton[selectedLayer];
    }
    return {};
  };
  
  // Update a specific material property
  const updateMaterialProperty = (property, value) => {
    if (selectedObject === 'glassChip') {
      setMaterials(prev => ({
        ...prev,
        glassChip: {
          ...prev.glassChip,
          [property]: value
        }
      }));
    } else if (selectedObject === 'glowingButton' && selectedLayer) {
      setMaterials(prev => ({
        ...prev,
        glowingButton: {
          ...prev.glowingButton,
          [selectedLayer]: {
            ...prev.glowingButton[selectedLayer],
            [property]: value
          }
        }
      }));
    }
  };
  
  // Update multiple material properties at once
  const updateMaterialProperties = (properties) => {
    if (selectedObject === 'glassChip') {
      setMaterials(prev => ({
        ...prev,
        glassChip: {
          ...prev.glassChip,
          ...properties
        }
      }));
    } else if (selectedObject === 'glowingButton' && selectedLayer) {
      setMaterials(prev => ({
        ...prev,
        glowingButton: {
          ...prev.glowingButton,
          [selectedLayer]: {
            ...prev.glowingButton[selectedLayer],
            ...properties
          }
        }
      }));
    }
  };
  
  // Reset material to default values
  const resetMaterial = () => {
    if (selectedObject === 'glassChip') {
      setMaterials(prev => ({
        ...prev,
        glassChip: { ...defaultMaterials.glassChip }
      }));
    } else if (selectedObject === 'glowingButton' && selectedLayer) {
      setMaterials(prev => ({
        ...prev,
        glowingButton: {
          ...prev.glowingButton,
          [selectedLayer]: { ...defaultMaterials.glowingButton[selectedLayer] }
        }
      }));
    }
  };
  
  // Apply a preset or saved material
  const applyMaterial = (materialId) => {
    const material = savedMaterials.find(m => m.id === materialId);
    if (!material) return;
    
    updateMaterialProperties(material.properties);
  };
  
  // Save current material as a new preset
  const saveCurrentMaterial = async (name, type = 'custom') => {
    const currentValues = getCurrentMaterialValues();
    const newMaterial = {
      id: `custom-${Date.now()}`,
      name,
      type,
      properties: { ...currentValues },
      isPreset: false,
      timestamp: Date.now()
    };
    
    try {
      await saveMaterial(newMaterial);
      setSavedMaterials(prev => [...prev, newMaterial]);
      return newMaterial.id;
    } catch (error) {
      console.error('Failed to save material:', error);
      throw error;
    }
  };
  
  // Delete a saved material
  const deleteSavedMaterial = async (materialId) => {
    try {
      // Check if it's a preset (cannot delete presets)
      const material = savedMaterials.find(m => m.id === materialId);
      if (material && material.isPreset) {
        throw new Error('Cannot delete preset materials');
      }
      
      await deleteMaterial(materialId);
      setSavedMaterials(prev => prev.filter(m => m.id !== materialId));
    } catch (error) {
      console.error('Failed to delete material:', error);
      throw error;
    }
  };
  
  // Context value
  const value = {
    materials,
    savedMaterials,
    selectedObject,
    selectedLayer,
    setSelectedObject,
    setSelectedLayer,
    getCurrentMaterialValues,
    updateMaterialProperty,
    updateMaterialProperties,
    resetMaterial,
    applyMaterial,
    saveCurrentMaterial,
    deleteSavedMaterial
  };
  
  return (
    <MaterialEditorContext.Provider value={value}>
      {children}
    </MaterialEditorContext.Provider>
  );
};

// Custom hook for accessing the context
export const useMaterialEditor = () => {
  const context = useContext(MaterialEditorContext);
  if (context === undefined) {
    throw new Error('useMaterialEditor must be used within a MaterialEditorProvider');
  }
  return context;
}; 