import React, { Suspense, useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import BackButton from '../../components/BackButton';

// Custom Globe with clouds, bump, emissive night map and thin atmosphere
function Globe() {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const atmosphereRef = useRef();

  const [colorMap, nightMap, cloudsMap] = useLoader(
    THREE.TextureLoader,
    [
      '/textures/earth-blue-marble.jpg',
      '/textures/earth-night.jpg',
      '/textures/earth-clouds.png'
    ]
  );

  // Get environment map from scene
  const { scene } = useThree();
  const [envMap, setEnvMap] = useState();
  useEffect(() => {
    if (scene.environment) setEnvMap(scene.environment);
  }, [scene.environment]);

  // Make sure color textures are in correct color space for vivid colors
  [colorMap, nightMap, cloudsMap].forEach(tex => {
    if (tex) tex.colorSpace = THREE.SRGBColorSpace;
  });

  // Axial tilt in radians
  const axialTilt = 23.5 * Math.PI / 180;

  // Sun direction for shader (from camera for now)
  const sunDirection = new THREE.Vector3(1, 1, 1);

  // Custom shader for day/night blend, Fresnel rim, ocean specular, aurora
  const earthShader = {
    uniforms: {
      dayMap: { value: colorMap },
      nightMap: { value: nightMap },
      sunDirection: { value: sunDirection },
      time: { value: 0 },
      roughness: { value: 0.0},
      envMap: { value: envMap || null },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D dayMap;
      uniform sampler2D nightMap;
      uniform vec3 sunDirection;
      uniform float time;
      uniform float roughness;
      uniform samplerCube envMap;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      void main() {
        float dotSun = dot(normalize(vWorldNormal), normalize(sunDirection));
        float dayFactor = clamp(dotSun, 0.0, 1.0);
        float nightFactor = 1.0 - dayFactor;
        vec3 dayColor = texture2D(dayMap, vUv).rgb;
        vec3 nightColor = texture2D(nightMap, vUv).rgb;
        // 1. Boost blue vibrancy
        dayColor = mix(dayColor, vec3(0.2,0.45,5.0), 0.18);
        // 2. Extreme, large, and colorful specular highlight for sun glint
        vec3 viewDir = normalize(vec3(0,0,3));
        vec3 halfDir = normalize(normalize(sunDirection) + viewDir);
        float spec = pow(max(dot(normalize(vWorldNormal), halfDir), 0.0), 40.0); // lower power = larger highlight
        float oceanMask = smoothstep(0.35, 0.7, dayColor.b - max(dayColor.r, dayColor.g));
        vec3 sunColor = vec3(1.2, 1.1, 0.85); // yellow-white
        vec3 specular = sunColor * spec * oceanMask * dayFactor * 7.0;
        // 3. Fresnel rim for atmosphere
        float fresnel = pow(1.0 - abs(dot(normalize(vWorldNormal), vec3(0,0,1))), 3.5);
        vec3 rim = vec3(0.5,0.9,1.0) * fresnel * 0.55;
        // 4. Aurora at poles (simple animated green glow)
        float lat = abs(vWorldNormal.y);
        float aurora = smoothstep(0.7, 1.0, lat) * (0.5 + 0.5*sin(time*0.5 + vWorldPos.x*8.0));
        vec3 auroraColor = vec3(0.2, 1.0, 0.5) * aurora * 0.25;
        // Blend day/night, boost day exposure even more
        vec3 color = mix(nightColor, dayColor * 1.7, dayFactor);
        color += specular;
        color += rim;
        color += auroraColor;

        // Environment reflection (option 1)
        vec3 reflectDir = reflect(-normalize(vec3(0,0,3)), normalize(vWorldNormal));
        vec3 envColor = textureCube(envMap, reflectDir).rgb;
        float reflectivity = 1.0 - roughness;
        color = mix(color, envColor, reflectivity * 0.6); // 40% reflection

        gl_FragColor = vec4(color, .8 - roughness);
      }
    `
  };

  useFrame((state, delta) => {
    const rotSpeed = delta * 0.03;
    if (earthRef.current) {
      earthRef.current.rotation.y += rotSpeed;
      earthRef.current.rotation.z = axialTilt;
      if (earthRef.current.material?.uniforms?.time) {
        earthRef.current.material.uniforms.time.value += delta;
      }
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += rotSpeed * 1.35;
      cloudsRef.current.rotation.z = axialTilt;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += rotSpeed * 0.95;
    }
  });

  return (
    <group name="Universe">
      <group name="World">
        <group name="Earth Control">
          {/* Earth sphere with custom shader */}
          <mesh ref={earthRef} name="Earth">
            <sphereGeometry args={[1.08, 64, 64]} />
            <shaderMaterial attach="material" args={[earthShader]} />
          </mesh>

          {/* Cloud layer */}
          <mesh ref={cloudsRef} name="Clouds" castShadow receiveShadow>
            <sphereGeometry args={[1.08, 64, 64]} />
            <meshPhongMaterial
              map={cloudsMap}
              transparent
              depthWrite={false}
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Atmosphere layer */}
          <mesh ref={atmosphereRef} name="Atmosphere">
            <sphereGeometry args={[1.2, 64, 64]} />
            <meshPhongMaterial
              color={0x0066ff}
              transparent
              opacity={0.1}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Enhanced atmosphere glow */}
          <mesh name="AtmosphereGlow">
            <sphereGeometry args={[1.25, 64, 64]} />
            <meshBasicMaterial
              color={0x0044ff}
              transparent
              opacity={0.05}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>

        {/* Sun directional light */}
        <group name="Sun" rotation={[0, Math.PI / 2, 0]}>
          <directionalLight
            name="Directional Light"
            castShadow
            intensity={1}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={-10000}
            shadow-camera-far={100000}
            shadow-camera-left={-1000}
            shadow-camera-right={1000}
            shadow-camera-top={1000}
            shadow-camera-bottom={-1000}
            position={[100, 100, 100]}
          />
        </group>
      </group>
    </group>
  );
}

function Earth2WidgetApp({ onBack }) {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <Canvas shadows>
        <color attach="background" args={['#000000']} />
        
        <OrthographicCamera
          makeDefault
          position={[0, 0, 50]}
          zoom={20}
          far={10000}
          near={-50000}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={2} />
        </EffectComposer>

        {/* Ambient light */}
        <hemisphereLight intensity={0.75} color="#eaeaea" />
        
        <Suspense fallback={null}>
          <Globe />
          <CityMarkers />
          <Stars radius={300} depth={100} count={5000} factor={6} fade />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom
          zoomSpeed={0.6}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>

      <BackButton onClick={onBack} />
    </div>
  );
}

// --- Helpers ---------------------------------------------------------------
// Convert lat/lon (deg) to XYZ on unit sphere
function latLonToVector3(lat, lon, radius = 1.02) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Simple sprite marker that always faces the camera
function CityMarker({ position, label, size = 0.15 }) {
  const markerRef = useRef();
  const ringRef = useRef();
  const { camera } = useThree();

  // Create digital marker geometry
  const markerGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(size * 0.2, size * 0.6, size * 0.1, 6);
    return geometry;
  }, [size]);

  // Create ring geometry for the pulsing effect
  const ringGeometry = useMemo(() => {
    const geometry = new THREE.TorusGeometry(size * 1.2, size * 0.05, 2, 16);
    return geometry;
  }, [size]);

  // Create emissive materials
  const markerMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.9
    });
  }, []);

  const ringMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5
    });
  }, []);

  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
  }, []);

  useFrame((state) => {
    if (markerRef.current && ringRef.current) {
      // Rotate marker to face up from surface
      const up = position.clone().normalize();
      const axis = new THREE.Vector3(1, 0, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, up);
      markerRef.current.quaternion.copy(quaternion);
      ringRef.current.quaternion.copy(quaternion);
      
      // Digital pulse effect
      const t = state.clock.getElapsedTime();
      const pulse = Math.max(0, Math.sin(t * 2 + position.x));
      const scale = 1 + pulse * 0.3;
      
      // Vertical hover
      const hover = Math.sin(t * 3 + position.z) * 0.02;
      markerRef.current.position.copy(position).add(up.multiplyScalar(hover));
      ringRef.current.position.copy(position).add(up.multiplyScalar(hover));
      
      // Scale ring for pulse effect
      ringRef.current.scale.set(scale, scale, scale);
      
      // Opacity pulse for digital effect
      ringMaterial.opacity = 0.5 * pulse;
      markerMaterial.opacity = 0.7 + 0.3 * pulse;
    }
  });

  return (
    <group>
      {/* Main marker */}
      <group ref={markerRef} position={position}>
        <mesh geometry={markerGeometry} material={markerMaterial} rotation={[Math.PI/2, 0, 0]}>
          {/* Inner glow */}
          <mesh scale={[1.2, 1.2, 1.2]}>
            <cylinderGeometry args={[size * 0.24, size * 0.72, size * 0.12, 6]} />
            <meshBasicMaterial color={0x00ff88} transparent opacity={0.3} />
          </mesh>
        </mesh>
      </group>

      {/* Pulsing ring */}
      <group ref={ringRef} position={position}>
        <mesh geometry={ringGeometry} material={ringMaterial} rotation={[Math.PI/2, 0, 0]} />
      </group>

      {/* City label with digital style */}
      <Html
        position={[position.x, position.y + size * 2, position.z]}
        center
        distanceFactor={15}
        style={{
          color: '#00ff88',
          fontSize: '0.7rem',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          textShadow: '0 0 10px #00ff88',
          background: 'rgba(0, 255, 136, 0.1)',
          padding: '3px 8px',
          borderRadius: '4px',
          border: '1px solid rgba(0, 255, 136, 0.3)',
          pointerEvents: 'none',
          userSelect: 'none'
        }}
      >
        {label}
      </Html>
    </group>
  );
}

// --------------------- CityMarkers container ------------------------------
function CityMarkers() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    const cities = [
      { name: 'NEW YORK', lat: 40.7128, lon: -74.0060, pop: 8400000 },
      { name: 'TOKYO', lat: 35.6762, lon: 139.6503, pop: 9300000 },
      { name: 'LONDON', lat: 51.5074, lon: -0.1278, pop: 8900000 },
      { name: 'PARIS', lat: 48.8566, lon: 2.3522, pop: 2100000 },
      { name: 'SYDNEY', lat: -33.8688, lon: 151.2093, pop: 5300000 },
      { name: 'DUBAI', lat: 25.2048, lon: 55.2708, pop: 3300000 },
      { name: 'SINGAPORE', lat: 1.3521, lon: 103.8198, pop: 5700000 },
      { name: 'HONG KONG', lat: 22.3193, lon: 114.1694, pop: 7400000 },
      { name: 'MOSCOW', lat: 55.7558, lon: 37.6173, pop: 12500000 },
      { name: 'SAO PAULO', lat: -23.5505, lon: -46.6333, pop: 12300000 }
    ];

    const markers = cities.map(city => ({
      position: latLonToVector3(city.lat, city.lon, 1.12),
      label: city.name,
      size: 0.04 + (city.pop / 15000000) * 0.04 // Increased base size for better visibility
    }));

    setPoints(markers);
  }, []);

  return (
    <group>
      {points.map((point, idx) => (
        <CityMarker
          key={idx}
          position={point.position}
          label={point.label}
          size={point.size}
        />
      ))}
    </group>
  );
}

export default Earth2WidgetApp;