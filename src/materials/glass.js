// src/materials/glass.js
// Collection of glass material presets for use across apps

import * as THREE from 'three';
import { MeshPhysicalMaterial } from 'three';

/**
 * Factory function to create customizable glass materials
 * @param {Object} options - Material customization options
 * @returns {MeshPhysicalMaterial} Configured glass material
 */
export const createGlassMaterial = (options = {}) => {
  const defaults = {
    color: '#ffffff',
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    thickness: 0.5,
    ior: 1.5,
    envMapIntensity: 1.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  };

  const config = { ...defaults, ...options };
  
  if (typeof config.color === 'string') {
    config.color = new THREE.Color(config.color);
  }
  
  return new MeshPhysicalMaterial(config);
};

// Predefined material presets
export const glassMaterials = {
  // Silver 3D (Highly Reflective Metallic Glass)
  silver: createGlassMaterial({
    color: '#ffffff',
    metalness: 1.0,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
    envMapIntensity: 1.2,
    opacity: 0.9,
  }),
  
  // Silver glass with subtle blue tint (for sphere designer)
  silverGlass: createGlassMaterial({
    color: '#e8f0ff',
    metalness: 0.8,
    roughness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.95,
    envMapIntensity: 1.2,
    transmission: 0.85,
    opacity: 0.95,
  }),
  
  // macOS Foggy/Dark Glass (Frosted, Subtle, Modern)
  macOS: createGlassMaterial({
    color: '#2A2A2A',
    metalness: 0.1,
    roughness: 0.7,
    transmission: 0.6,
    opacity: 0.85,
    ior: 1.5,
    thickness: 0.3,
    envMapIntensity: 0.5,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
    sheen: 0.8,
    sheenColor: new THREE.Color('#FFFFFF'),
    sheenRoughness: 0.1,
  }),
  
  // macOS Glass optimized for spheres
  macOSGlass: createGlassMaterial({
    color: '#333333',
    metalness: 0.2,
    roughness: 0.5,
    transmission: 0.7,
    opacity: 0.9,
    ior: 1.5,
    thickness: 0.4,
    envMapIntensity: 0.6,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
    sheen: 0.6,
    sheenColor: new THREE.Color('#FFFFFF'),
    sheenRoughness: 0.2,
  }),
  
  // Tinted Glass (Amber/Gold)
  tintedGlass: createGlassMaterial({
    color: '#FFD700',
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.8,
    opacity: 0.9,
    ior: 1.55,
    thickness: 0.4,
    envMapIntensity: 0.7,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
  }),
  
  // Frosted Blue Glass (Soft, Bright, iOS/Home Icon Style)
  frostedBlue: createGlassMaterial({
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
    sheenColor: new THREE.Color('#FFFFFF'),
    sheenRoughness: 0.2,
  }),
  
  // Clear Glass
  clear: createGlassMaterial({
    color: '#ffffff',
    metalness: 0.0,
    roughness: 0.1,
    transmission: 0.95,
    opacity: 0.95,
    ior: 1.5,
    thickness: 0.2,
    envMapIntensity: 0.6,
  }),

  // Glowing Blue Button
  glowingBlue: createGlassMaterial({
    color: '#4A90E2',
    metalness: 0.0,
    roughness: 0.7,
    transmission: 0.92,
    opacity: 0.9,
    ior: 1.35,
    thickness: 0.8,
    envMapIntensity: 0.3,
    emissive: new THREE.Color('#87CEFA'),
    emissiveIntensity: 0.7,
    clearcoat: 0.1,
    clearcoatRoughness: 0.5,
  }),
};

export default glassMaterials; 