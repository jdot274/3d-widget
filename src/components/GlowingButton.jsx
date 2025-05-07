import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { animated, useSpring } from '@react-spring/three';
import * as THREE from 'three';
import { Sphere } from '@react-three/drei';
import { useMaterialEditor } from '../context/MaterialEditorContext';

export default function GlowingButton({ position }) {
  const groupRef = useRef();
  
  // Access material properties from context
  const { materials } = useMaterialEditor();
  const outerShellProps = materials.glowingButton.outerShell;
  const innerCoreProps = materials.glowingButton.innerCore;
  const innermostSparkProps = materials.glowingButton.innermostSpark;

  const [spring, api] = useSpring(() => ({
    'rotation.x': 0,
    'rotation.y': 0,
    config: { mass: 1, tension: 180, friction: 12 },
  }));

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.002;
      groupRef.current.rotation.y += 0.003;
    }
  });

  return (
    <animated.group ref={groupRef} position={position} {...spring}>
      {/* Outer Shell - uses outerShellProps from context */}
      <Sphere args={[0.7, 64, 64]}>
        <meshPhysicalMaterial
          color={new THREE.Color(outerShellProps.color)}
          metalness={outerShellProps.metalness}
          roughness={outerShellProps.roughness}
          transmission={outerShellProps.transmission}
          opacity={outerShellProps.opacity}
          transparent={true}
          ior={outerShellProps.ior}
          thickness={outerShellProps.thickness}
          envMapIntensity={outerShellProps.envMapIntensity}
          clearcoat={outerShellProps.clearcoat}
          clearcoatRoughness={outerShellProps.clearcoatRoughness}
          emissive={new THREE.Color(outerShellProps.emissive || '#000000')}
          emissiveIntensity={outerShellProps.emissiveIntensity || 0}
        />
      </Sphere>

      {/* Inner Core - uses innerCoreProps from context */}
      <Sphere args={[0.4, 48, 48]}>
        <meshPhysicalMaterial
          color={new THREE.Color(innerCoreProps.color)}
          metalness={innerCoreProps.metalness}
          roughness={innerCoreProps.roughness}
          transmission={innerCoreProps.transmission}
          opacity={innerCoreProps.opacity}
          transparent={true}
          ior={innerCoreProps.ior}
          thickness={innerCoreProps.thickness}
          envMapIntensity={innerCoreProps.envMapIntensity}
          emissive={new THREE.Color(innerCoreProps.emissive)}
          emissiveIntensity={innerCoreProps.emissiveIntensity}
        />
      </Sphere>

      {/* Innermost Spark - uses innermostSparkProps from context */}
      <Sphere args={[0.15, 32, 32]}>
        <meshPhysicalMaterial
          color={new THREE.Color(innermostSparkProps.color)}
          metalness={innermostSparkProps.metalness}
          roughness={innermostSparkProps.roughness}
          transmission={innermostSparkProps.transmission}
          opacity={innermostSparkProps.opacity}
          transparent={innermostSparkProps.transmission > 0}
          emissive={new THREE.Color(innermostSparkProps.emissive)}
          emissiveIntensity={innermostSparkProps.emissiveIntensity}
        />
      </Sphere>
    </animated.group>
  );
} 