import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { useMaterialEditor } from '../context/MaterialEditorContext';
// Original import preserved as comment
// import GlassMaterial from './GlassMaterial';

// Exactly matches the SilverRectangle implementation
export default function GlassChip({ position, row, col }) {
  const mesh = useRef();
  
  // Access material properties from context
  const { materials } = useMaterialEditor();
  const materialProps = materials.glassChip;
  
  // Same spring configuration as SilverRectangle
  const [spring, api] = useSpring(() => ({
    'rotation.x': 0,
    'rotation.y': 0,
    config: { mass: 1, tension: 180, friction: 12 }
  }));

  // Same exact rotation values as SilverRectangle - CRITICAL for visibility
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.003;
      mesh.current.rotation.y += 0.005;
    }
  });

  /* Original more complex version preserved as comment
  // Original GlassChip with enhanced techniques
  export default function OriginalGlassChip({ position, row, col, rotationOffset = 0 }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);
    const [active, setActive] = useState(false);
    
    // Use brighter colors for better visibility
    const baseColor = '#55AAFF'; // Brighter blue
    
    // Animation spring from silver-3d-rectangle
    const [spring, api] = useSpring(() => ({
      'rotation.x': 0 + rotationOffset,
      'rotation.y': 0 + rotationOffset,
      config: { mass: 1, tension: 180, friction: 12 }
    }));
    
    // Update spring values on hover
    useEffect(() => {
      if (hovered) {
        api.start({
          'rotation.x': rotationOffset + 0.2,
          'rotation.y': rotationOffset + 0.2,
        });
      } else {
        api.start({
          'rotation.x': rotationOffset,
          'rotation.y': rotationOffset,
        });
      }
    }, [hovered, api, rotationOffset]);
    
    // Optimize for better transparency rendering
    useEffect(() => {
      if (meshRef.current) {
        // CRITICAL: Configure mesh for optimized transparency
        meshRef.current.renderOrder = 1000 + row * 10 + col; // Higher render order
        meshRef.current.material = meshRef.current.material || {};
        meshRef.current.frustumCulled = false; // Prevent disappearing
      }
    }, [row, col]);
    
    // Continuous animation that ensures visibility - CRITICAL FOR TRANSPARENCY
    useFrame((state) => {
      if (meshRef.current) {
        const time = state.clock.getElapsedTime();
        
        // Smooth rotation animation from silver-3d-rectangle
        meshRef.current.rotation.x += 0.003;
        meshRef.current.rotation.y += 0.005;
        
        // Enhanced floating motion with staggered timing
        const timeOffset = row * 0.2 + col * 0.3;
        meshRef.current.position.y = position[1] + Math.sin(time * 0.8 + timeOffset) * 0.15;
        
        // Subtle scaling pulse for continuous visual change
        const scale = 1.0 + Math.sin(time * 1.2 + timeOffset) * 0.03;
        meshRef.current.scale.set(scale, scale, scale);
        
        // Force material update - CRITICAL for transparency
        if (meshRef.current.material) {
          meshRef.current.material.needsUpdate = true;
        }
      }
    });
    
    function createBeveledBox(width, height, depth, radius, segments) {
      const shape = new THREE.Shape();
      const w = width / 2 - radius;
      const h = height / 2 - radius;
      
      shape.moveTo(-w, -h - radius);
      shape.lineTo(-w, h);
      shape.quadraticCurveTo(-w, h + radius, -w + radius, h + radius);
      shape.lineTo(w, h + radius);
      shape.quadraticCurveTo(w + radius, h + radius, w + radius, h);
      shape.lineTo(w + radius, -h);
      shape.quadraticCurveTo(w + radius, -h - radius, w, -h - radius);
      shape.lineTo(-w + radius, -h - radius);
      shape.quadraticCurveTo(-w, -h - radius, -w, -h);
      
      const extrudeSettings = {
        depth: depth,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.04,
        bevelOffset: 0,
        bevelSegments: segments,
        curveSegments: segments
      };
      
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }

    return (
      <animated.mesh
        ref={meshRef}
        position={position}
        onClick={() => setActive(!active)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
        {...spring}
      >
        <RoundedBox args={[1.0, 0.6, 0.12]} radius={0.1} smoothness={4}>
          <meshPhysicalMaterial
            color={hovered ? "#88EEFF" : active ? "#FF88BB" : baseColor}
            metalness={hovered ? 0.7 : 0.6}
            roughness={hovered ? 0.05 : 0.1}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            reflectivity={1.0}
            envMapIntensity={1.2}
            transparent={true}
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </RoundedBox>
        
        <primitive object={createBeveledBox(1.0, 0.6, 0.12, 0.12, 8)} />
        <GlassMaterial 
          color={baseColor}
          opacity={0.95}
          roughness={0.12}
          transmission={0.8}
          metalness={0.3}
          clearcoat={1.2}
          ior={2.0}
          waveIntensity={0.4}
          isHovered={hovered}
          isActive={active}
        />
      </animated.mesh>
    );
  }
  */

  return (
    <animated.mesh ref={mesh} position={position} {...spring}>
      <RoundedBox args={[1.0, 0.6, 0.2]} radius={0.1} smoothness={4}>
        {/* Material now uses properties from context */}
        <meshPhysicalMaterial
          color={new THREE.Color(materialProps.color)}
          metalness={materialProps.metalness}
          roughness={materialProps.roughness}
          transmission={materialProps.transmission}
          opacity={materialProps.opacity}
          transparent={true}
          ior={materialProps.ior}
          thickness={materialProps.thickness}
          envMapIntensity={materialProps.envMapIntensity}
          clearcoat={materialProps.clearcoat}
          clearcoatRoughness={materialProps.clearcoatRoughness}
          sheen={materialProps.sheen}
          sheenColor={new THREE.Color(materialProps.sheenColor)}
          sheenRoughness={materialProps.sheenRoughness}
          emissive={new THREE.Color(materialProps.emissive || '#000000')}
          emissiveIntensity={materialProps.emissiveIntensity || 0}
        />
      </RoundedBox>
    </animated.mesh>
  );
} 