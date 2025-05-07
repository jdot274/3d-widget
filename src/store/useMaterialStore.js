import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import * as THREE from 'three';

// Material Types definition - same as in the MaterialEditorContext
export const MaterialTypes = {
  GLASS: 'glass',
  METAL: 'metal',
  PLASTIC: 'plastic',
  PATTERN: 'pattern',
  BASIC: 'basic',
  STANDARD: 'standard',
  PHYSICAL: 'physical',
  NORMAL: 'normal',
  MATCAP: 'matcap',
  SHADER: 'shader',
  GLOW: 'glow',
  GRADIENT: 'gradient'
};

// Default material values
const defaultMaterials = {
  glassChip: {
    materialType: MaterialTypes.GLASS,
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
    emissiveIntensity: 0,
    dispersion: 0.0,
    causticsIntensity: 0.0, 
    surfaceNoise: 0.0,
    aberration: 0.0,
    fresnelPower: 1.0
  },
  glowingButton: {
    // Outer shell properties
    outerShell: {
      materialType: MaterialTypes.GLASS,
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
      materialType: MaterialTypes.GLOW,
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
      materialType: MaterialTypes.GLOW,
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

// Define preset materials - same as in the MaterialEditorContext
const presetMaterials = {
  // Glass presets
  'frosted-blue-glass': {
    name: 'Frosted Blue Glass',
    type: MaterialTypes.GLASS,
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
  // Add all other presets from MaterialEditorContext...
};

// Create the store with Zustand
const useMaterialStore = create(
  // Add persist middleware to save state to localStorage
  persist(
    // Add immer middleware for easier state updates
    immer((set, get) => ({
      // State
      materials: defaultMaterials,
      savedMaterials: Object.entries(presetMaterials).map(([id, material]) => ({
        id,
        name: material.name,
        type: material.type,
        properties: material.properties,
        isPreset: true
      })),
      selectedObject: 'glassChip',
      selectedLayer: null,
      
      // Actions
      setSelectedObject: (objectId) => 
        set(state => { state.selectedObject = objectId }),
        
      setSelectedLayer: (layerId) => 
        set(state => { state.selectedLayer = layerId }),
      
      // Get current material values based on selected object and layer
      getCurrentMaterialValues: () => {
        const state = get();
        if (state.selectedObject === 'glassChip') {
          return state.materials.glassChip;
        } else if (state.selectedObject === 'glowingButton' && state.selectedLayer) {
          return state.materials.glowingButton[state.selectedLayer];
        }
        return {};
      },
      
      // Update a single material property
      updateMaterialProperty: (property, value) => 
        set(state => {
          if (state.selectedObject === 'glassChip') {
            state.materials.glassChip[property] = value;
          } else if (state.selectedObject === 'glowingButton' && state.selectedLayer) {
            state.materials.glowingButton[state.selectedLayer][property] = value;
          }
        }),
      
      // Update multiple material properties at once
      updateMaterialProperties: (properties) => 
        set(state => {
          if (state.selectedObject === 'glassChip') {
            Object.assign(state.materials.glassChip, properties);
          } else if (state.selectedObject === 'glowingButton' && state.selectedLayer) {
            Object.assign(state.materials.glowingButton[state.selectedLayer], properties);
          }
        }),
      
      // Reset material to default values
      resetMaterial: () => 
        set(state => {
          if (state.selectedObject === 'glassChip') {
            state.materials.glassChip = { ...defaultMaterials.glassChip };
          } else if (state.selectedObject === 'glowingButton' && state.selectedLayer) {
            state.materials.glowingButton[state.selectedLayer] = { 
              ...defaultMaterials.glowingButton[state.selectedLayer] 
            };
          }
        }),
      
      // Apply a preset material
      applyMaterial: (materialId) => {
        const material = get().savedMaterials.find(m => m.id === materialId);
        if (!material) return;
        
        get().updateMaterialProperties(material.properties);
      },
      
      // Save current material as a new preset
      saveCurrentMaterial: (name, type = 'custom') => {
        const currentValues = get().getCurrentMaterialValues();
        const newMaterial = {
          id: `custom-${Date.now()}`,
          name,
          type,
          properties: { ...currentValues },
          isPreset: false,
          timestamp: Date.now()
        };
        
        set(state => {
          state.savedMaterials.push(newMaterial);
        });
        
        return newMaterial.id;
      },
      
      // Delete a saved material
      deleteSavedMaterial: (materialId) => {
        const material = get().savedMaterials.find(m => m.id === materialId);
        if (material && material.isPreset) {
          throw new Error('Cannot delete preset materials');
        }
        
        set(state => {
          state.savedMaterials = state.savedMaterials.filter(m => m.id !== materialId);
        });
      }
    })),
    {
      name: 'glass-editor-materials',
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys
      partialize: (state) => ({ 
        materials: state.materials,
        savedMaterials: state.savedMaterials.filter(m => !m.isPreset)
      }),
    }
  )
);

export default useMaterialStore; 