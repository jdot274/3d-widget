import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// Keep this for future reference but don't rely on it for now
// import ThreeGlobe from 'three-globe';

// Remove the problematic imports
// import { feature } from 'topojson-client';
// import countries from '../../../node_modules/three-globe/example/datasets/ne_110m_admin_0_countries.json';

const AtmosphericGlobeApp = ({ onBack }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45, // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near clipping plane
      1000 // Far clipping plane
    );
    camera.position.set(0, 0, 2.5); // Slightly closer view

    // Renderer with console logging for debugging
    console.log("Setting up WebGL renderer...");
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true // Allow transparency
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000020, 0.1); // Very dark blue background with slight opacity
    containerRef.current.appendChild(renderer.domElement);
    console.log("Renderer attached to DOM");

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 1.5;  // Don't allow zooming too close
    controls.maxDistance = 10;   // Don't allow zooming too far away
    controls.autoRotate = true;  // Auto-rotate for a nicer demo effect
    controls.autoRotateSpeed = 0.5; // Slow rotation

    // DIRECT approach: Create a basic Earth sphere instead of using ThreeGlobe
    console.log("Creating basic Earth sphere...");
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create an enhanced Earth with physical properties
    const earthMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1056c0,           // Deep ocean blue
      metalness: 0.1,            // Slight metallic look for water
      roughness: 0.5,            // Semi-smooth surface
      clearcoat: 0.5,            // Add reflective clearcoat
      clearcoatRoughness: 0.1,   // Make the clearcoat fairly smooth
      reflectivity: 0.7,         // More reflective than default
      envMapIntensity: 0.8       // Make environment reflections more visible
    });
    
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);
    console.log("Earth mesh added to scene");

    // Add environment cube for reflections
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    cubeRenderTarget.texture.type = THREE.HalfFloatType;
    const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
    scene.add(cubeCamera);
    earthMaterial.envMap = cubeRenderTarget.texture;

    // Add a few simplified "continent" shapes to the sphere
    // Note: This is just for visual effect, not geographically accurate
    const continents = [
      // North America - simplified shape
      {
        points: [[-0.2, 0.3], [-0.5, 0.5], [-0.4, 0.7], [-0.1, 0.6], [0.1, 0.4]],
        color: 0x228B22, // Forest green
        height: 0.02
      },
      // South America - simplified shape
      {
        points: [[-0.1, -0.1], [-0.3, -0.2], [-0.2, -0.5], [0.0, -0.4], [0.1, -0.2]],
        color: 0x228B22, // Forest green
        height: 0.02
      },
      // Europe/Africa - simplified shape
      {
        points: [[0.2, 0.5], [0.0, 0.3], [0.1, 0.0], [0.3, -0.3], [0.5, -0.1], [0.4, 0.3]],
        color: 0xDAA520, // Goldenrod
        height: 0.02
      }
    ];

    // Map these to be on the sphere surface
    continents.forEach(continent => {
      const mesh = addContinentShape(continent.points, continent.height, continent.color);
      // Adjust scale for sphere
      mesh.scale.set(0.5, 0.5, 0.05);
      earthMesh.add(mesh);
    });
    
    // Add atmospheric glow effect
    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x3a70ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Enhanced continent materials
    const addEnhancedContinent = (positions, color) => {
      // Create the geometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      
      // Calculate normals
      geometry.computeVertexNormals();
      
      // Create a sophisticated material
      const material = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.2,
        roughness: 0.6,
        clearcoat: 0.2,
        clearcoatRoughness: 0.3,
        flatShading: false,
        envMap: cubeRenderTarget.texture,
        envMapIntensity: 0.5
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      return mesh;
    };

    // Create more realistic continent shapes using actual 3D geometry
    // Convert lat/lng coordinates to 3D positions on sphere
    const latLongToVector3 = (lat, lng, radius) => {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;
      
      const x = -radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      return new THREE.Vector3(x, y, z);
    };
    
    // Create continent geometry with slight extrusion
    const createContinentGeometry = (coordinatePairs, radius, height) => {
      const positions = [];
      
      // Convert all coordinates to 3D positions
      for (let i = 0; i < coordinatePairs.length; i++) {
        const [lat, lng] = coordinatePairs[i];
        const basePos = latLongToVector3(lat, lng, radius);
        const raisedPos = latLongToVector3(lat, lng, radius + height);
        
        // Add both points to create extrusion
        positions.push(basePos.x, basePos.y, basePos.z);
        positions.push(raisedPos.x, raisedPos.y, raisedPos.z);
        
        // Create triangles between points
        if (i > 0) {
          const prevBaseIndex = (i - 1) * 2;
          const currBaseIndex = i * 2;
          
          // Add two triangles to connect current and previous points
          // First triangle
          positions.push(
            positions[prevBaseIndex * 3], positions[prevBaseIndex * 3 + 1], positions[prevBaseIndex * 3 + 2],
            positions[currBaseIndex * 3], positions[currBaseIndex * 3 + 1], positions[currBaseIndex * 3 + 2],
            positions[(prevBaseIndex + 1) * 3], positions[(prevBaseIndex + 1) * 3 + 1], positions[(prevBaseIndex + 1) * 3 + 2]
          );
          
          // Second triangle
          positions.push(
            positions[(prevBaseIndex + 1) * 3], positions[(prevBaseIndex + 1) * 3 + 1], positions[(prevBaseIndex + 1) * 3 + 2],
            positions[currBaseIndex * 3], positions[currBaseIndex * 3 + 1], positions[currBaseIndex * 3 + 2],
            positions[(currBaseIndex + 1) * 3], positions[(currBaseIndex + 1) * 3 + 1], positions[(currBaseIndex + 1) * 3 + 2]
          );
        }
      }
      
      return positions;
    };
    
    // Simplified continent data (lat,lng coordinates)
    const northAmerica = [
      [40, -100], [60, -140], [70, -90], [50, -60], [30, -80]
    ];
    
    const southAmerica = [
      [0, -60], [-20, -70], [-40, -70], [-55, -70], [-40, -40], [-20, -40], [0, -50]
    ];
    
    const eurasia = [
      [60, 0], [70, 80], [50, 140], [30, 110], [20, 80], [30, 40], [40, 20]
    ];
    
    const africa = [
      [30, 20], [10, 40], [-30, 30], [-30, 10], [0, -10], [20, 0]
    ];
    
    const australia = [
      [-20, 120], [-30, 140], [-40, 140], [-30, 120]
    ];
    
    // Add the continents
    // Use a higher radius (1.01) to place them slightly above the ocean surface
    const northAmericaMesh = addEnhancedContinent(
      createContinentGeometry(northAmerica, 1.01, 0.01),
      0x2d8d33 // Darker green
    );
    scene.add(northAmericaMesh);
    
    const southAmericaMesh = addEnhancedContinent(
      createContinentGeometry(southAmerica, 1.01, 0.01),
      0x3a9d45 // Green
    );
    scene.add(southAmericaMesh);
    
    const eurasiaMesh = addEnhancedContinent(
      createContinentGeometry(eurasia, 1.01, 0.01),
      0x339966 // Bluish green
    );
    scene.add(eurasiaMesh);
    
    const africaMesh = addEnhancedContinent(
      createContinentGeometry(africa, 1.01, 0.01),
      0xdaa520 // Goldenrod
    );
    scene.add(africaMesh);
    
    const australiaMesh = addEnhancedContinent(
      createContinentGeometry(australia, 1.01, 0.01),
      0xcd853f // Peru/sandy brown
    );
    scene.add(australiaMesh);
    
    // Enhanced multi-layer atmospheric glow effect
    // Inner atmosphere (blue)
    const innerAtmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const innerAtmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x4169e1, // Royal blue
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      shininess: 100,
      emissive: 0x0033ff,
      emissiveIntensity: 0.1
    });
    const innerAtmosphere = new THREE.Mesh(innerAtmosphereGeometry, innerAtmosphereMaterial);
    scene.add(innerAtmosphere);
    
    // Outer atmosphere (lighter blue)
    const outerAtmosphereGeometry = new THREE.SphereGeometry(1.08, 64, 64);
    const outerAtmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x87ceeb, // Sky blue
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      emissive: 0x6495ed,
      emissiveIntensity: 0.05
    });
    const outerAtmosphere = new THREE.Mesh(outerAtmosphereGeometry, outerAtmosphereMaterial);
    scene.add(outerAtmosphere);

    // Cloud layer
    const cloudsGeometry = new THREE.SphereGeometry(1.02, 64, 64); // Slightly larger than the globe

    // Procedural Cloud Shaders
    const cloudVertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const cloudFragmentShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      uniform float uTime;

      // --- Simplex Noise (Stefan Gustavson, adapted for GLSL) Start ---
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute( permute( permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
      }
      // --- Simplex Noise End ---

      // FBM using Simplex Noise
      float fbm_snoise(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0; // Start with a base frequency
        int octaves = 4;
        for (int i = 0; i < octaves; i++) {
            value += amplitude * snoise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        // Sample 3D Simplex noise using world position and time for animation
        // Scale vWorldPosition to control the size/frequency of noise features
        // Animate one component of the sample position (e.g., z) with uTime
        vec3 samplePos = vWorldPosition * 0.3 + vec3(vUv * 0.1, uTime * 0.02); // Scale and animate
        
        // Generate noise value. Simplex noise is ~[-1, 1]. FBM sums these up.
        // The fbm_snoise with 4 octaves, starting amp 0.5, will be roughly in [-1, 1] range.
        float noiseVal = fbm_snoise(samplePos);

        // Remap noise from [-1, 1] to [0, 1] for alpha and other effects
        float remappedNoise = (noiseVal + 1.0) * 0.5;

        // Use remapped noise to determine cloud opacity
        // Adjust smoothstep thresholds for desired cloud coverage and softness
        float cloudAlpha = smoothstep(0.55, 0.75, remappedNoise);

        // Simple rim lighting effect using Fresnel-like term
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float fresnel = 1.0 - dot(viewDirection, vNormal);
        fresnel = pow(fresnel, 3.0); // Adjust power for rim intensity (increased power for sharper rim)
        vec3 rimColor = vec3(0.7, 0.85, 1.0) * fresnel * cloudAlpha * 0.7; // Softer blue/white rim, slightly more intense

        // Base cloud color (white)
        vec3 cloudColor = vec3(1.0, 1.0, 1.0);
        
        gl_FragColor = vec4(cloudColor + rimColor, cloudAlpha * 0.9); // Modulate alpha, add rim. Increased base alpha.
      }
    `;

    const cloudsMaterial = new THREE.ShaderMaterial({
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      uniforms: {
        uTime: { value: 0.0 }
      },
      transparent: true,
      depthWrite: false, // Important for transparency
      blending: THREE.NormalBlending, // Or AdditiveBlending for brighter clouds
      side: THREE.DoubleSide // Render both sides if needed, or FrontSide
    });

    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    scene.add(cloudsMesh);

    // Add city point lights
    const addCityLight = (lat, lng, size, intensity) => {
      // Convert from lat/lng to 3D coordinates on sphere
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;
      
      const x = -Math.sin(phi) * Math.cos(theta) * 1.02; // Slightly larger than Earth radius
      const y = Math.cos(phi) * 1.02;
      const z = Math.sin(phi) * Math.sin(theta) * 1.02;
      
      // Create a small sphere for the city
      const cityGeometry = new THREE.SphereGeometry(size, 16, 16);
      const cityMaterial = new THREE.MeshBasicMaterial({
        color: 0xffdd44,
        emissive: 0xffdd44,
        emissiveIntensity: 0.5
      });
      
      const cityMesh = new THREE.Mesh(cityGeometry, cityMaterial);
      cityMesh.position.set(x, y, z);
      
      // Add a small point light
      const light = new THREE.PointLight(0xffdd44, intensity, 0.3);
      light.position.copy(cityMesh.position);
      
      scene.add(cityMesh);
      scene.add(light);
    };
    
    // Add major cities
    addCityLight(40.7128, -74.006, 0.01, 0.5);  // New York
    addCityLight(51.5074, -0.1278, 0.01, 0.5);  // London
    addCityLight(35.6762, 139.6503, 0.01, 0.5); // Tokyo
    addCityLight(-33.8688, 151.2093, 0.01, 0.5); // Sydney
    addCityLight(55.7558, 37.6173, 0.01, 0.5);  // Moscow
    
    // Enhanced Lighting Setup
    // Main ambient light (softer)
    scene.remove(ambientLight); // Remove previous light
    scene.remove(directionalLight); // Remove previous light
    
    // Create new enhanced lights
    const enhancedAmbientLight = new THREE.AmbientLight(0xccddff, 0.4);
    scene.add(enhancedAmbientLight);

    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffee, 1.2);
    sunLight.position.set(5, 3, 5);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Secondary fill light (opposite side to add depth)
    const fillLight = new THREE.DirectionalLight(0x334455, 0.3);
    fillLight.position.set(-5, 2, -3);
    scene.add(fillLight);

    // Subtle blue rim light for atmosphere effect
    const rimLight = new THREE.DirectionalLight(0x3388ff, 0.8);
    rimLight.position.set(0, -5, 0);
    scene.add(rimLight);
    
    // Add subtle environment lighting from an HDRI
    // Creating a simulated environment map
    const createEnvMap = () => {
      const envScene = new THREE.Scene();
      
      // Add a gradient background
      const gradientShader = {
        uniforms: {
          topColor: { value: new THREE.Color(0x0077ff) },
          bottomColor: { value: new THREE.Color(0x000000) }
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition).y;
            float t = max(0.0, min(1.0, (h * 0.5 + 0.5)));
            gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
          }
        `
      };
      
      // Create a large sphere with the gradient shader
      const skyGeometry = new THREE.SphereGeometry(50, 32, 32);
      const skyMaterial = new THREE.ShaderMaterial({
        uniforms: gradientShader.uniforms,
        vertexShader: gradientShader.vertexShader,
        fragmentShader: gradientShader.fragmentShader,
        side: THREE.BackSide
      });
      
      const sky = new THREE.Mesh(skyGeometry, skyMaterial);
      envScene.add(sky);
      
      // Add some distant "stars" for reflection
      const starGeometry = new THREE.BufferGeometry();
      const starVertices = [];
      const starColors = [];
      
      for (let i = 0; i < 500; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 40 + Math.random() * 10;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        starVertices.push(x, y, z);
        
        // Random star colors
        const r = 0.8 + Math.random() * 0.2;
        const g = 0.8 + Math.random() * 0.2;
        const b = 0.8 + Math.random() * 0.2;
        
        starColors.push(r, g, b);
      }
      
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
      
      const starMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      });
      
      const stars = new THREE.Points(starGeometry, starMaterial);
      envScene.add(stars);
      
      // Render the environment to a cube texture
      cubeCamera.update(renderer, envScene);
      
      // Apply the environment map to materials
      earthMaterial.envMap = cubeRenderTarget.texture;
      earthMaterial.needsUpdate = true;
    };
    
    // Create the environment
    createEnvMap();
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Add a slight Earth rotation
    earthMesh.rotation.x = Math.PI * 0.05; // Slight tilt

    // Set loading to false once everything is set up
    setLoading(false);

    // Advanced Animation loop with coordinated movements
    let time = 0;
    const enhancedAnimate = () => {
      requestAnimationFrame(enhancedAnimate);
      time += 0.001;
      
      // Update controls
      controls.update();
      
      // Coordinate movement of Earth, atmosphere, and clouds
      const earthRotationSpeed = 0.0005;
      const cloudRotationSpeed = earthRotationSpeed * 1.2; // Clouds move faster
      
      // Only animate if auto-rotate is disabled
      if (!controls.autoRotate) {
        // Earth rotation
        earthMesh.rotation.y += earthRotationSpeed;
        
        // Atmosphere subtle wobble
        innerAtmosphere.rotation.y = earthMesh.rotation.y + Math.sin(time * 0.5) * 0.01;
        outerAtmosphere.rotation.y = earthMesh.rotation.y - Math.sin(time * 0.3) * 0.01;
        
        // Continent movement with Earth
        northAmericaMesh.rotation.y += earthRotationSpeed;
        southAmericaMesh.rotation.y += earthRotationSpeed;
        eurasiaMesh.rotation.y += earthRotationSpeed;
        africaMesh.rotation.y += earthRotationSpeed;
        australiaMesh.rotation.y += earthRotationSpeed;
      }
      
      // Cloud layer animation
      cloudsMesh.rotation.y += cloudRotationSpeed;
      
      // Update cloud shader time for internal animation
      if (cloudsMaterial.uniforms.uTime) {
        cloudsMaterial.uniforms.uTime.value += 0.01;
      }
      
      // Subtle pulsing glow for atmosphere
      innerAtmosphereMaterial.opacity = 0.12 + Math.sin(time * 3) * 0.02;
      outerAtmosphereMaterial.opacity = 0.07 + Math.sin(time * 2) * 0.01;
      
      // Update city lights - make them twinkle slightly
      scene.traverse((object) => {
        if (object.type === 'PointLight' && object !== sunLight && 
            object !== fillLight && object !== rimLight) {
          object.intensity = 0.5 + Math.random() * 0.1;
        }
      });
      
      // Render the scene
      renderer.render(scene, camera);
    };

    console.log("Starting animation loop");
    enhancedAnimate();

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up scene");
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      cloudsGeometry.dispose();
      cloudsMaterial.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          fontSize: '24px',
          zIndex: 1000,
        }}>
          Loading Earth...
        </div>
      )}
      
      {/* Optional UI overlay */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '10px',
        borderRadius: '4px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px'
      }}>
        Atmospheric Globe
      </div>
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          zIndex: 1000
        }}
      >
        ← Back
      </button>
    </div>
  );
};

export default AtmosphericGlobeApp; 