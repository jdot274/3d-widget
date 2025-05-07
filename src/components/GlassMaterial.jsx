import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import fragmentShader from '../shaders/glass.frag';
import vertexShader from '../shaders/glass.vert';

// Create a custom shader material
const GlassShaderMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color('#88CCFF'),
    opacity: 0.95,
    roughness: 0.2,
    transmission: 0.6,
    metalness: 0.4,
    clearcoat: 1.0,
    ior: 1.8,
    waveIntensity: 0.3
  },
  vertexShader,
  fragmentShader,
  (material) => {
    material.transparent = true;
    material.side = THREE.DoubleSide;
    material.needsUpdate = true;
  }
);

// Extend the Three.js library with our custom material
extend({ GlassShaderMaterial });

// React component for the custom glass material
export default function GlassMaterial({ 
  color = '#4488FF',
  opacity = 0.95,
  roughness = 0.2,
  transmission = 0.6,
  metalness = 0.4,
  clearcoat = 1.0,
  ior = 1.8,
  waveIntensity = 0.3,
  isHovered = false,
  isActive = false
}) {
  const materialRef = useRef();
  
  // Update material properties when hover/active states change
  useEffect(() => {
    if (materialRef.current) {
      // Adjust material properties based on interactive states
      const material = materialRef.current;
      
      material.opacity = isHovered ? 0.98 : opacity;
      material.transmission = isHovered ? transmission * 0.8 : transmission;
      material.clearcoat = isHovered ? clearcoat : clearcoat;
      material.roughness = isHovered ? roughness * 0.7 : roughness;
      material.metalness = isHovered ? 0.6 : metalness;
      material.waveIntensity = isActive ? waveIntensity * 2.0 : isHovered ? waveIntensity * 1.5 : waveIntensity;
      
      // Color adjustments for hover/active - much more pronounced
      const baseColor = new THREE.Color(color);
      if (isActive) {
        material.color = new THREE.Color('#FF88BB');
      } else if (isHovered) {
        material.color = new THREE.Color('#88EEFF');
      } else {
        material.color = baseColor;
      }
      
      material.needsUpdate = true;
    }
  }, [
    color, opacity, roughness, transmission, 
    metalness, clearcoat, ior, waveIntensity,
    isHovered, isActive
  ]);
  
  // Animate time uniform for shader effects
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
      materialRef.current.needsUpdate = true;
    }
  });
  
  return (
    <glassShaderMaterial
      ref={materialRef}
      key={THREE.MathUtils.generateUUID()}
      color={new THREE.Color(color)}
      opacity={opacity}
      roughness={roughness}
      transmission={transmission}
      metalness={metalness}
      clearcoat={clearcoat}
      ior={ior}
      waveIntensity={waveIntensity}
      transparent={true}
      side={THREE.DoubleSide}
    />
  );
} 