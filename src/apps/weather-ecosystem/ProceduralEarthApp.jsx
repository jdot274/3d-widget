import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import './styles/WeatherEcosystem.css';

// Flight data
const FLIGHT_DATA = [
  { from: { lat: 40.7128, lng: -74.0060, name: 'New York' }, 
    to: { lat: 51.5074, lng: -0.1278, name: 'London' } },
  { from: { lat: 35.6762, lng: 139.6503, name: 'Tokyo' }, 
    to: { lat: 22.3193, lng: 114.1694, name: 'Hong Kong' } },
  { from: { lat: -33.8688, lng: 151.2093, name: 'Sydney' }, 
    to: { lat: 1.3521, lng: 103.8198, name: 'Singapore' } }
];

// Procedural Earth shader - creates Earth entirely with code
const proceduralEarthVertexShader = `
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vViewPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const proceduralEarthFragmentShader = `
  uniform float time;
  uniform vec3 sunDirection;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vViewPosition;
  
  // Noise functions from https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
  float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    // Permutations
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            
    // Gradients
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  
  // Fractal Brownian Motion for more detailed noise
  float fbm(vec3 pos, int octaves) {
    float noise = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float total = 0.0;
    
    for (int i = 0; i < octaves; i++) {
      noise += amplitude * snoise(pos * frequency);
      total += amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return noise / total;
  }
  
  // Enhanced continent generator with more detailed terrain
  float continents(vec2 coord, float seed) {
    // Base continent shapes
    float continentShape = fbm(vec3(coord * 1.5, seed), 3) * 0.5 + 0.5;
    
    // Add more detailed terrain features
    float mountains = pow(fbm(vec3(coord * 8.0, seed + 10.0), 5), 1.5) * 0.6;
    float hills = fbm(vec3(coord * 4.0, seed + 20.0), 4) * 0.3;
    
    // Combine different terrain elements
    float combined = continentShape + mountains * continentShape + hills * continentShape * 0.5;
    
    // Threshold to create continents with smooth transitions
    float land = smoothstep(0.52, 0.62, combined);
    
    return land;
  }
  
  // Enhanced terrain height generation (for bumpy terrain and coastlines)
  float terrainHeight(vec2 coord, float landMask, float seed) {
    // Mountain and hill heights
    float mountains = pow(fbm(vec3(coord * 12.0, seed + 30.0), 5), 2.0);
    float hills = fbm(vec3(coord * 6.0, seed + 40.0), 3);
    float noise = fbm(vec3(coord * 20.0, seed + 50.0), 2) * 0.1;
    
    // Create more dramatic terrain near coastlines
    float coastalVariation = fbm(vec3(coord * 10.0, seed + 60.0), 3);
    float coastalInfluence = smoothstep(0.4, 0.6, landMask) * (1.0 - smoothstep(0.6, 0.8, landMask));
    
    // Combine terrain features
    float height = mix(
      hills * 0.3,
      mountains,
      smoothstep(0.3, 0.7, fbm(vec3(coord * 3.0, seed + 70.0), 2))
    );
    
    // Add coastal features and small noise details
    height = height * landMask + coastalVariation * coastalInfluence * 0.3 + noise * landMask;
    
    return height;
  }
  
  // Enhanced cloud generator with multiple layers and weather systems
  float clouds(vec2 coord, float time) {
    // Cloud movement speeds
    float slowSpeed = time * 0.005;
    float mediumSpeed = time * 0.01;
    float fastSpeed = time * 0.02;
    
    // Multiple cloud layers with different scales and movement
    float largeCloud = fbm(vec3(coord * 2.0 + vec2(slowSpeed, 0.0), 123.456), 4) * 0.5;
    float mediumCloud = fbm(vec3(coord * 4.0 + vec2(mediumSpeed, slowSpeed * 0.5), 456.789), 3) * 0.25;
    float smallCloud = fbm(vec3(coord * 8.0 + vec2(fastSpeed, mediumSpeed), 789.123), 2) * 0.125;
    
    // Combine cloud layers
    float baseClouds = largeCloud + mediumCloud + smallCloud;
    
    // Create storm systems
    float stormPattern = fbm(vec3(coord * 1.5 + vec2(slowSpeed * 0.7, slowSpeed * 0.3), 234.567), 4);
    float stormIntensity = smoothstep(0.65, 0.85, stormPattern) * 0.4;
    
    // Add storm clouds to the base clouds
    float combined = baseClouds + stormIntensity;
    
    // Weather front patterns moving across the planet
    float weatherFronts = fbm(vec3(coord * 3.0 + vec2(mediumSpeed * 0.5, slowSpeed * 0.2), 345.678), 3);
    float frontInfluence = smoothstep(0.4, 0.6, weatherFronts) * 0.3;
    
    combined += frontInfluence;
    
    // Final threshold for cloud coverage with variation
    return smoothstep(0.65, 0.85, combined);
  }
  
  // Special noise function for city light distribution
  float cellNoise(vec2 p) {
    vec2 ip = floor(p);
    vec2 fp = fract(p);
    
    float d = 1.0e10;
    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        vec2 offset = vec2(float(i), float(j));
        vec2 r = offset + vec2(
          snoise(vec3(ip + offset, 45.67)),
          snoise(vec3(ip + offset, 78.91))
        ) * 0.5 - fp;
        float dist = dot(r, r);
        d = min(d, dist);
      }
    }
    return sqrt(d);
  }
  
  // Enhanced city lights generator
  float cityLights(vec2 coord, float landMask) {
    // Large population centers
    float urbanCenters = cellNoise(coord * 20.0);
    urbanCenters = 1.0 - smoothstep(0.0, 0.2, urbanCenters);
    
    // Smaller towns and connecting roads
    float towns = cellNoise(coord * 40.0); 
    towns = 1.0 - smoothstep(0.0, 0.1, towns);
    towns *= 0.5;
    
    // Road networks connecting population centers
    float roads = fbm(vec3(coord * 30.0, 789.123), 2);
    roads = smoothstep(0.7, 0.9, roads) * 0.3;
    
    // Coastal cities (tend to be more populated)
    float coastal = smoothstep(0.4, 0.6, landMask) * 0.4;
    
    // Combine all light sources, but only on land
    float lights = (urbanCenters + towns + roads) * landMask + coastal;
    
    // Add some variety and clustering of cities
    float populationDensity = fbm(vec3(coord * 5.0, 234.567), 3);
    populationDensity = smoothstep(0.2, 0.8, populationDensity);
    
    return lights * populationDensity * 1.5;
  }
  
  // Water reflection/fresnel calculation
  float fresnelTerm(vec3 normal, vec3 viewDir, float power) {
    return pow(1.0 - abs(dot(normalize(normal), normalize(viewDir))), power);
  }
  
  // Water detail texture with moving waves
  float waterDetail(vec2 coord, float time) {
    float waves1 = snoise(vec3(coord * 50.0 + vec2(time * 0.04, time * 0.02), 123.456)) * 0.5;
    float waves2 = snoise(vec3(coord * 30.0 + vec2(-time * 0.03, time * 0.01), 456.789)) * 0.3;
    float waves3 = snoise(vec3(coord * 20.0 + vec2(time * 0.02, -time * 0.015), 789.123)) * 0.2;
    
    return waves1 + waves2 + waves3;
  }
  
  void main() {
    // Convert spherical coordinates to lat/lon
    vec2 latLon = vec2(
      atan(vPosition.z, vPosition.x) / (2.0 * 3.14159265359) + 0.5,
      asin(vPosition.y / length(vPosition)) / 3.14159265359 + 0.5
    );
    
    // Generate continents
    float landMask = continents(latLon, 1.0);
    
    // Generate terrain details and heights
    float elevation = terrainHeight(latLon, landMask, 1.0);
    
    // Generate cloud patterns
    float cloudPattern = clouds(latLon, time);
    
    // Generate ocean details with moving waves
    float oceanDetail = waterDetail(latLon, time);
    
    // Create more detailed ocean colors with depth variation
    float oceanDepth = fbm(vec3(latLon * 5.0, 10.0), 3);
    vec3 deepOceanColor = vec3(0.0, 0.05, 0.2);
    vec3 shallowOceanColor = vec3(0.0, 0.3, 0.5);
    vec3 oceanColor = mix(deepOceanColor, shallowOceanColor, oceanDepth);
    
    // Add waves and highlights to ocean
    oceanColor += vec3(0.1, 0.15, 0.2) * oceanDetail * 0.1;
    
    // Create more detailed land colors with biomes and elevation
    float temperature = latLon.y * 2.0 - 1.0; // -1 at south pole, 1 at north pole
    temperature = 1.0 - abs(temperature); // 0 at poles, 1 at equator
    
    float moisture = fbm(vec3(latLon * 4.0, 5.0), 3);
    moisture = mix(moisture, 1.0, smoothstep(0.7, 1.0, abs(latLon.y * 2.0 - 1.0))); // More moisture at poles
    
    // Different terrain types
    vec3 desertColor = mix(
      vec3(0.8, 0.7, 0.4), // Light sand
      vec3(0.7, 0.5, 0.3), // Dark sand
      fbm(vec3(latLon * 10.0, 25.0), 2)
    );
    
    vec3 forestColor = mix(
      vec3(0.0, 0.25, 0.05), // Dark forest
      vec3(0.1, 0.3, 0.1),   // Light forest
      fbm(vec3(latLon * 15.0, 35.0), 2)
    );
    
    vec3 grasslandColor = mix(
      vec3(0.3, 0.5, 0.1),  // Light grass
      vec3(0.25, 0.4, 0.1), // Dark grass
      fbm(vec3(latLon * 20.0, 45.0), 2)
    );
    
    vec3 mountainColor = mix(
      vec3(0.5, 0.5, 0.5), // Light rock
      vec3(0.3, 0.3, 0.3), // Dark rock
      fbm(vec3(latLon * 25.0, 55.0), 2)
    );
    
    // Assign biomes based on temperature and moisture
    vec3 landColor;
    if (temperature > 0.7 && moisture < 0.3) {
      // Hot + dry = desert
      landColor = desertColor;
    } else if (temperature > 0.4 && moisture > 0.6) {
      // Warm + wet = tropical forest
      landColor = forestColor * 1.1;
    } else if (temperature > 0.4) {
      // Warm + moderate moisture = grasslands
      landColor = grasslandColor;
    } else if (temperature < 0.3 && moisture > 0.5) {
      // Cold + wet = coniferous forest
      landColor = forestColor * 0.7;
    } else if (temperature < 0.2) {
      // Very cold = tundra
      landColor = mix(vec3(0.7, 0.7, 0.7), vec3(0.8, 0.8, 0.8), moisture);
    } else {
      // Moderate conditions = mixed terrain
      landColor = mix(grasslandColor, forestColor, moisture);
    }
    
    // Add elevation influence
    landColor = mix(landColor, mountainColor, smoothstep(0.6, 0.9, elevation));
    
    // Add snow at the poles
    float snowAmount = smoothstep(0.75, 0.9, abs(latLon.y * 2.0 - 1.0));
    landColor = mix(landColor, vec3(0.95, 0.95, 1.0), snowAmount);
    
    // Add small terrain details
    landColor += fbm(vec3(latLon * 50.0, 65.0), 2) * 0.05 - 0.025;
    
    // Add beach transitions between land and ocean
    float beach = smoothstep(0.48, 0.52, landMask);
    vec3 beachColor = vec3(0.8, 0.7, 0.5);
    landColor = mix(landColor, beachColor, beach);
    
    // Mix terrain based on land/ocean mask
    vec3 terrainColor = mix(oceanColor, landColor, landMask);
    
    // Calculate advanced water reflections
    float fresnel = fresnelTerm(vNormal, vViewPosition, 4.0);
    
    // Water reflects more at glancing angles (Fresnel effect)
    oceanColor = mix(oceanColor, vec3(0.8, 0.9, 1.0) * 0.5, fresnel * (1.0 - landMask));
    
    // Sun specular reflection on water
    vec3 sunReflection = normalize(reflect(-sunDirection, vNormal));
    float specular = pow(max(dot(normalize(vViewPosition), sunReflection), 0.0), 64.0);
    
    // Only apply specular to ocean
    terrainColor += vec3(1.0, 1.0, 0.9) * specular * (1.0 - landMask) * 0.8;
    
    // Calculate sun position relative to surface for day/night cycle
    float dayMix = dot(vNormal, sunDirection) * 0.5 + 0.5;
    dayMix = smoothstep(0.1, 0.4, dayMix);  // Sharper terminator
    
    // Night side is dark blue with city lights
    vec3 nightColor = vec3(0.03, 0.04, 0.1);
    
    // Enhanced city lights on night side
    float cityLightsMask = cityLights(latLon, landMask);
    vec3 cityLightColors = mix(
      vec3(0.9, 0.8, 0.6), // Warm yellow-orange light
      vec3(0.8, 0.8, 1.0), // Cooler blue-white light
      fbm(vec3(latLon * 10.0, 100.0), 2) // Variation by region
    );
    
    // Apply city lights only on the night side
    nightColor += cityLightColors * cityLightsMask * (1.0 - dayMix) * 2.0;
    
    // Clouds visible on both day and night sides
    vec3 dayCloudColor = vec3(1.0);
    vec3 nightCloudColor = vec3(0.1, 0.1, 0.15);
    vec3 cloudColor = mix(nightCloudColor, dayCloudColor, dayMix);
    
    // Final surface color with clouds
    vec3 dayWithClouds = mix(terrainColor, cloudColor, cloudPattern * 0.8);
    vec3 nightWithClouds = mix(nightColor, nightCloudColor, cloudPattern * 0.5);
    vec3 finalColor = mix(nightWithClouds, dayWithClouds, dayMix);
    
    // Add atmosphere rim effect
    float viewAngle = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition)));
    float atmosphereIntensity = pow(viewAngle, 3.0);
    vec3 atmosphereColor = vec3(0.3, 0.6, 1.0) * atmosphereIntensity * mix(0.3, 1.0, dayMix);
    
    // Add light scattering in atmosphere
    float scattering = pow(max(dot(normalize(vViewPosition), sunDirection), 0.0), 8.0) * viewAngle;
    atmosphereColor += vec3(1.0, 0.9, 0.7) * scattering * dayMix;
    
    finalColor += atmosphereColor;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Helper function to convert latitude/longitude to 3D position
const latLongToVector3 = (lat, lng, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
};

// Create an arc curve between two lat/long points
const createArcBetween = (startLat, startLng, endLat, endLng, height, points = 50) => {
  const start = latLongToVector3(startLat, startLng, 100);
  const end = latLongToVector3(endLat, endLng, 100);
  
  // Calculate the middle point at a higher altitude
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const midLength = mid.length();
  mid.normalize().multiplyScalar(midLength + height * 50);
  
  // Create a quadratic bezier curve
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  
  // Generate the vertices along the curve
  return curve.getPoints(points);
};

const ProceduralEarthApp = () => {
  const containerRef = useRef(null);
  const [flightPaths, setFlightPaths] = useState([]);
  const [isRotating, setIsRotating] = useState(true);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    console.log("Setting up procedural Earth with no textures");
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      40, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 0, 300);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const sunDirection = new THREE.Vector3(-1, 0.4, 0.5).normalize();
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.copy(sunDirection.clone().multiplyScalar(200));
    scene.add(sunLight);
    
    // Create procedural earth
    const earthGeometry = new THREE.SphereGeometry(100, 128, 64);
    const earthMaterial = new THREE.ShaderMaterial({
      vertexShader: proceduralEarthVertexShader,
      fragmentShader: proceduralEarthFragmentShader,
      uniforms: {
        time: { value: 0 },
        sunDirection: { value: sunDirection }
      }
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Create atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(105, 128, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vViewPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 sunDirection;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vViewPosition;
        
        float noise(vec3 pos) {
          vec3 p = floor(pos);
          vec3 f = fract(pos);
          f = f*f*(3.0-2.0*f);
        
          float n = p.x + p.y*157.0 + 113.0*p.z;
          return mix(mix(mix(sin(n*465.77),sin((n+1.0)*465.77),f.x),
                         mix(sin((n+157.0)*465.77),sin((n+158.0)*465.77),f.x),f.y),
                     mix(mix(sin((n+113.0)*465.77),sin((n+114.0)*465.77),f.x),
                         mix(sin((n+270.0)*465.77),sin((n+271.0)*465.77),f.x),f.y),f.z)*0.5+0.5;
        }
        
        void main() {
          float viewAngle = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition)));
          float intensity = pow(viewAngle, 4.0);
          
          // Base atmosphere color - more blue/cyan during day, more purple during night
          float dayMix = dot(vNormal, sunDirection) * 0.5 + 0.5;
          dayMix = smoothstep(0.1, 0.4, dayMix);
          
          vec3 dayAtmosphere = vec3(0.3, 0.6, 1.0);
          vec3 nightAtmosphere = vec3(0.2, 0.2, 0.4);
          vec3 atmosphere = mix(nightAtmosphere, dayAtmosphere, dayMix);
          
          // Add subtle variation to atmosphere
          vec3 noiseCoord = vPosition * 0.02 + vec3(time * 0.005, 0.0, 0.0);
          float variation = noise(noiseCoord) * 0.1;
          atmosphere *= 1.0 + variation;
          
          // Add light scattering/glow effect
          float sunProximity = pow(max(dot(normalize(vViewPosition), sunDirection), 0.0), 16.0);
          vec3 sunGlow = vec3(1.0, 0.8, 0.5) * sunProximity * viewAngle * 2.0;
          
          // Final color with transparency based on viewing angle
          gl_FragColor = vec4(atmosphere * intensity + sunGlow * dayMix, intensity * 0.8);
        }
      `,
      uniforms: {
        sunDirection: { value: sunDirection },
        time: { value: 0 }
      },
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Create animated weather systems 
    const weatherGeometry = new THREE.SphereGeometry(106, 64, 32);
    const weatherMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          // First corner
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          // Other corners
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          // Permutations
          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                  
          // Gradients
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          // Normalise gradients
          vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          // Mix final noise value
          vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
        }
        
        // Weather pattern generation
        float weatherPattern(vec2 coord, float time) {
          // Convert lat/lon to coordinates
          vec2 st = vec2(
            coord.x * 2.0 - 1.0,
            coord.y * 2.0 - 1.0
          );
          
          // Multiple storm systems
          float storms = 0.0;
          
          // Hurricane/cyclone system 1
          vec2 stormCenter1 = vec2(
            sin(time * 0.05) * 0.3,
            cos(time * 0.04) * 0.4
          );
          float distToStorm1 = length(st - stormCenter1);
          float storm1 = 1.0 - smoothstep(0.0, 0.3, distToStorm1);
          
          // Hurricane/cyclone system 2
          vec2 stormCenter2 = vec2(
            sin(time * 0.04 + 2.0) * 0.5,
            cos(time * 0.03 + 1.0) * 0.3
          );
          float distToStorm2 = length(st - stormCenter2);
          float storm2 = 1.0 - smoothstep(0.0, 0.2, distToStorm2);
          
          // Weather front
          float front = snoise(vec3(st * 2.0 + vec2(time * 0.01, 0.0), 10.0)) * 0.5 + 0.5;
          front = smoothstep(0.5, 0.6, front);
          
          // Combine weather systems
          storms = max(storm1, storm2) * 0.5 + front * 0.3;
          
          return storms;
        }
        
        void main() {
          // Get spherical coordinates
          vec2 latLon = vec2(
            atan(vPosition.z, vPosition.x) / (2.0 * 3.14159265359) + 0.5,
            asin(vPosition.y / length(vPosition)) / 3.14159265359 + 0.5
          );
          
          // Generate moving weather patterns
          float weatherIntensity = weatherPattern(latLon, time);
          
          // Noise distortion effect
          vec2 distortedUv = latLon + vec2(
            snoise(vec3(latLon * 10.0, time * 0.1)) * 0.01,
            snoise(vec3(latLon * 10.0, time * 0.1 + 10.0)) * 0.01
          );
          
          // Cloud-like patterns with detail
          float clouds = snoise(vec3(distortedUv * 5.0, time * 0.05)) * 0.5 + 0.5;
          clouds += snoise(vec3(distortedUv * 10.0, time * 0.1)) * 0.25;
          clouds = smoothstep(0.4, 0.6, clouds);
          
          // Storm intensity effect
          float stormEffect = clouds * weatherIntensity;
          
          // Only show strong storm effects
          float alpha = smoothstep(0.3, 0.5, stormEffect);
          
          // Colors based on storm intensity - white for clouds, blue-gray for storms
          vec3 stormColor = mix(
            vec3(0.8, 0.8, 0.8), // Light clouds
            vec3(0.5, 0.5, 0.7), // Storm clouds
            weatherIntensity
          );
          
          gl_FragColor = vec4(stormColor, alpha * 0.3);
        }
      `,
      uniforms: {
        time: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide
    });

    const weatherLayer = new THREE.Mesh(weatherGeometry, weatherMaterial);
    scene.add(weatherLayer);
    
    // Create flight paths
    const flightPathsGroup = new THREE.Group();
    scene.add(flightPathsGroup);
    
    // Generate flight paths
    FLIGHT_DATA.forEach((flight, index) => {
      // Create line geometry for the path
      const points = createArcBetween(
        flight.from.lat, flight.from.lng,
        flight.to.lat, flight.to.lng,
        20 + index * 5  // Vary height for different paths
      );
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      
      // Create a gradient material for the line
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ff88,
        transparent: true,
        opacity: 0.7
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      flightPathsGroup.add(line);
      
      // Add animated point along the path
      const pointGeometry = new THREE.SphereGeometry(1, 16, 16);
      const pointMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x88ffff,
        transparent: true,
        opacity: 0.8
      });
      
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      point.userData = { 
        curve: points,
        speed: 0.001 + Math.random() * 0.002,
        t: Math.random()  // Start at a random position
      };
      
      flightPathsGroup.add(point);
    });
    
    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.2,  // bloom strength
      0.4,  // radius
      0.85  // threshold
    );
    composer.addPass(bloomPass);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 120;
    controls.maxDistance = 500;
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let lastTime = 0;
    const clock = new THREE.Clock();
    
    const animate = (time) => {
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();
      
      // Update earth rotation if enabled
      if (isRotating) {
        earth.rotation.y += 0.05 * delta;
        atmosphere.rotation.y += 0.05 * delta;
        weatherLayer.rotation.y += 0.055 * delta; // Slightly faster for independent movement
      }
      
      // Update shader time uniforms
      earthMaterial.uniforms.time.value = elapsedTime;
      atmosphereMaterial.uniforms.time.value = elapsedTime;
      weatherMaterial.uniforms.time.value = elapsedTime;
      
      // Update flight points
      flightPathsGroup.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.userData.curve) {
          // Update the position along the curve
          child.userData.t = (child.userData.t + child.userData.speed) % 1;
          
          // Get the current point along the curve
          const pathIndex = Math.floor(child.userData.t * (child.userData.curve.length - 1));
          const position = child.userData.curve[pathIndex];
          
          child.position.copy(position);
          
          // Pulse the size
          const pulse = Math.sin(elapsedTime * 5 + child.userData.t * 10) * 0.2 + 0.8;
          child.scale.set(pulse, pulse, pulse);
        }
      });
      
      controls.update();
      composer.render();
      
      requestAnimationFrame(animate);
    };
    
    animate(0);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of resources
      earthGeometry.dispose();
      earthMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      weatherGeometry.dispose();
      weatherMaterial.dispose();
      
      flightPathsGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      
      composer.dispose();
      renderer.dispose();
    };
  }, []);
  
  return (
    <div className="weather-ecosystem-app" ref={containerRef}>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '5px',
        zIndex: '1500'
      }}>
        Procedural Earth (No Textures)
      </div>
      
      <div className="controls">
        <button onClick={() => setIsRotating(!isRotating)}>
          {isRotating ? 'Pause Rotation' : 'Resume Rotation'}
        </button>
      </div>
    </div>
  );
};

export default ProceduralEarthApp; 