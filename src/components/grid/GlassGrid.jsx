// src/components/grid/GlassGrid.jsx
// A reusable glass grid component with interactive cells

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A 4x4 grid of transparent glass-like rectangles
 * Each cell is interactive and can respond to hover and click events
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.position - Grid position [x, y, z]
 * @param {number} props.cellSize - Size of each cell
 * @param {number} props.gap - Gap between cells
 * @param {Function} props.onCellClick - Callback for cell click
 * @returns {JSX.Element} GlassGrid component
 */
const GlassGrid = ({ 
  position = [0, 0, 0], 
  rows = 4,
  columns = 4,
  cellSize = 0.5, 
  gap = 0.1,
  baseColor = '#ffffff',
  onCellClick = () => {},
}) => {
  const groupRef = useRef();
  const [hoveredCell, setHoveredCell] = useState(null);
  
  // Calculate grid dimensions
  const gridWidth = columns * cellSize + (columns - 1) * gap;
  const gridHeight = rows * cellSize + (rows - 1) * gap;
  
  // Gentle movement of the entire grid
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.03;
    groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.03;
  });
  
  // Create grid cells
  const renderCells = () => {
    const cells = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const id = row * columns + col;
        const x = (col * (cellSize + gap)) - (gridWidth / 2) + (cellSize / 2);
        const y = (row * (cellSize + gap)) - (gridHeight / 2) + (cellSize / 2);
        
        const isHovered = hoveredCell === id;
        
        // Calculate color based on position (gradient effect)
        const colFactor = col / (columns - 1);
        const rowFactor = row / (rows - 1);
        const hue = 210 + colFactor * 60; // Blue to purple
        const saturation = 0.7 + rowFactor * 0.3;
        const lightness = 0.5 + colFactor * 0.2;
        
        const color = new THREE.Color().setHSL(hue/360, saturation, lightness);
        
        cells.push(
          <mesh
            key={id}
            position={[x, y, 0]}
            onPointerOver={() => setHoveredCell(id)}
            onPointerOut={() => setHoveredCell(null)}
            onClick={() => onCellClick(id, row, col)}
            scale={isHovered ? 1.1 : 1}
          >
            <boxGeometry args={[cellSize, cellSize, 0.05]} />
            <meshPhysicalMaterial
              color={isHovered ? '#ffffff' : color}
              transparent={true}
              transmission={0.85}
              roughness={0.05}
              metalness={0.2}
              clearcoat={1}
              clearcoatRoughness={0.1}
              ior={1.5}
              thickness={0.5}
              envMapIntensity={1.2}
              opacity={0.9}
            />
          </mesh>
        );
      }
    }
    
    return cells;
  };
  
  return (
    <group ref={groupRef} position={position}>
      {renderCells()}
    </group>
  );
};

export default GlassGrid; 