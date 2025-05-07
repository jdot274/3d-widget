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

  const [colorMap, nightMap, cloudsMap] = useLoader(
    THREE.TextureLoader,
    [
      '/textures/earth-blue-marble.jpg',
      '/textures/earth-night.jpg',
      '/textures/earth-clouds.png'
    ]
  );

  // Get environment map from scene
  const { scene, gl } = useThree();
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
      // Animate shader time for aurora
      if (earthRef.current.material && earthRef.current.material.uniforms && earthRef.current.material.uniforms.time) {
        earthRef.current.material.uniforms.time.value += delta;
      }
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += rotSpeed * 1.35;
      cloudsRef.current.rotation.z = axialTilt;
    }
  });

  return (
    <group>
      {/* Earth sphere with custom shader for dynamic city lights (option 1) */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1.08, 64, 64]} />
        <shaderMaterial attach="material" args={[earthShader]} />
      </mesh>

      {/* Cloud layer (animated, casts shadow) */}
      <mesh ref={cloudsRef} castShadow receiveShadow>
        <sphereGeometry args={[1.08, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          depthWrite={false}
          opacity={0.6}
        />
      </mesh>

      {/* Day/Night Terminator: semi-transparent ring */}
      <mesh>
        <torusGeometry args={[.9, 0.025, 16, 100]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.18} />
      </mesh>

      {/* Simple atmosphere glow using sprite */}
      <mesh>
        <sphereGeometry args={[1.08, 32, 32]} />
        <meshBasicMaterial
          color={0x3a96ff}
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Highly reflective physical layer (option 2, studio look) */}
      <mesh>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.5}
          metalness={0.4}
          roughness={0.0}
          clearcoat={1}
          clearcoatRoughness={0.0}
          reflectivity={1.0}
          envMapIntensity={1.0}
          color={0x99ccff}
          transmission={1}
          ior={2.5}
          thickness={.8}
        />
      </mesh>
    </group>
  );
}

function EarthWidgetApp({ onBack }) {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'rgba(0,0,0,0)' }}>
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }} shadows>
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={5.2} />
        </EffectComposer>
        <ambientLight intensity={0.8} />
        {/* Sunlight */}
        <directionalLight position={[5, 3, 5]} intensity={2.5} color={0xffffff} castShadow={true} />

        <Suspense fallback={null}>
          <Globe />
          {/* Dynamic city markers */}
          <CityMarkers />
          {/* star background */}
          <Stars radius={100} depth={50} count={5000} factor={6} fade />
          {/* HDR environment for reflections */}
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls enablePan={false} enableZoom zoomSpeed={0.6} />
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
function CityMarker({ position, label }) {
  const sprite = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (sprite.current) sprite.current.quaternion.copy(camera.quaternion);
  });

  return (
    <group position={position}>
      <sprite ref={sprite} scale={[0.08, 0.08, 0.08]}>
        <spriteMaterial attach="material" color={0xffe066} />
      </sprite>
      {/* optional label using Drei Html */}
      <Html distanceFactor={10} style={{ color: 'white', fontSize: '0.5rem' }}>
        {label}
      </Html>
    </group>
  );
}

// --------------------- CityMarkers container ------------------------------
function CityMarkers() {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    async function fetchWeather() {
      // demo set of cities with lat/lon
      const cities = [
        { name: 'New York', lat: 40.7128, lon: -74.006 },
        { name: 'London', lat: 51.5072, lon: -0.1276 },
        { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
        { name: 'Sydney', lat: -33.8688, lon: 151.2093 }
      ];

      // Query Open-Meteo API for current temperatures
      const results = await Promise.all(
        cities.map(async city => {
          try {
            const resp = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`
            );
            const data = await resp.json();
            const temp = data?.current_weather?.temperature;
            return { ...city, temp };
          } catch {
            return { ...city };
          }
        })
      );
      setPoints(results);
    }
    fetchWeather();
  }, []);

  return (
    <>
      {points.map(p => (
        <CityMarker
          key={p.name}
          position={latLonToVector3(p.lat, p.lon, 1.05)}
          label={`${p.name}${p.temp ? ` ${p.temp}°C` : ''}`}
        />
      ))}
    </>
  );
}

export default EarthWidgetApp; 