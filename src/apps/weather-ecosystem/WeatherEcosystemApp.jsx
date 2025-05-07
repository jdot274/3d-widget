import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import Globe from 'three-globe';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import './styles/WeatherEcosystem.css';

// Sample flight data
const FLIGHT_DATA = [
  { from: { lat: 40.7128, lng: -74.0060, name: 'New York' }, 
    to: { lat: 51.5074, lng: -0.1278, name: 'London' } },
  { from: { lat: 35.6762, lng: 139.6503, name: 'Tokyo' }, 
    to: { lat: 22.3193, lng: 114.1694, name: 'Hong Kong' } },
  { from: { lat: -33.8688, lng: 151.2093, name: 'Sydney' }, 
    to: { lat: 1.3521, lng: 103.8198, name: 'Singapore' } },
  { from: { lat: 37.7749, lng: -122.4194, name: 'San Francisco' }, 
    to: { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' } },
];

// Sample temperature hotspots
const TEMP_HOTSPOTS = [
  { lat: 27.9881, lng: 86.9250, temp: 38, name: 'Mount Everest Region' },
  { lat: 36.1699, lng: -115.1398, temp: 45, name: 'Las Vegas' },
  { lat: 25.2048, lng: 55.2708, temp: 42, name: 'Dubai' },
  { lat: -23.5558, lng: -46.6396, temp: 35, name: 'São Paulo' },
  { lat: 19.4326, lng: -99.1332, temp: 32, name: 'Mexico City' },
];

// Population density data - used to generate lights
// Format: Country/Region, lat, lng, intensity (0-1 scale)
const POPULATION_DENSITY = [
  { region: 'Eastern China', lat: 35.8617, lng: 104.1954, intensity: 0.95 },
  { region: 'Northern India', lat: 20.5937, lng: 78.9629, intensity: 0.9 },
  { region: 'Western Europe', lat: 48.8566, lng: 2.3522, intensity: 0.85 },
  { region: 'Northeastern US', lat: 40.7128, lng: -74.0060, intensity: 0.8 },
  { region: 'Japan', lat: 35.6762, lng: 139.6503, intensity: 0.85 },
  { region: 'Indonesia', lat: -6.2088, lng: 106.8456, intensity: 0.75 },
  { region: 'Nigeria', lat: 9.0820, lng: 8.6753, intensity: 0.7 },
  { region: 'Brazil', lat: -15.7801, lng: -47.9292, intensity: 0.7 },
  { region: 'Bangladesh', lat: 23.8103, lng: 90.4125, intensity: 0.85 },
  { region: 'Mexico', lat: 19.4326, lng: -99.1332, intensity: 0.65 },
  { region: 'Russia', lat: 55.7558, lng: 37.6173, intensity: 0.6 },
  { region: 'Philippines', lat: 14.5995, lng: 120.9842, intensity: 0.75 },
  { region: 'Pakistan', lat: 33.6844, lng: 73.0479, intensity: 0.7 },
  { region: 'South Korea', lat: 37.5665, lng: 126.9780, intensity: 0.8 },
  { region: 'Egypt', lat: 30.0444, lng: 31.2357, intensity: 0.65 },
  { region: 'Vietnam', lat: 21.0285, lng: 105.8542, intensity: 0.7 },
  { region: 'Turkey', lat: 38.9637, lng: 35.2433, intensity: 0.65 },
  { region: 'Italy', lat: 41.9028, lng: 12.4964, intensity: 0.7 },
  { region: 'United Kingdom', lat: 51.5074, lng: -0.1278, intensity: 0.75 },
  { region: 'France', lat: 46.2276, lng: 2.2137, intensity: 0.7 },
  { region: 'Germany', lat: 51.1657, lng: 10.4515, intensity: 0.75 },
  { region: 'Thailand', lat: 15.8700, lng: 100.9925, intensity: 0.65 },
  { region: 'South Africa', lat: -30.5595, lng: 22.9375, intensity: 0.5 },
  { region: 'Spain', lat: 40.4168, lng: -3.7038, intensity: 0.65 },
  { region: 'Argentina', lat: -38.4161, lng: -63.6167, intensity: 0.5 },
  { region: 'Colombia', lat: 4.5709, lng: -74.2973, intensity: 0.55 },
  { region: 'Poland', lat: 51.9194, lng: 19.1451, intensity: 0.6 },
  { region: 'Canada', lat: 56.1304, lng: -106.3468, intensity: 0.4 },
  { region: 'Saudi Arabia', lat: 23.8859, lng: 45.0792, intensity: 0.6 },
  { region: 'Malaysia', lat: 4.2105, lng: 101.9758, intensity: 0.6 },
  { region: 'Australia', lat: -25.2744, lng: 133.7751, intensity: 0.45 },
  { region: 'Morocco', lat: 31.7917, lng: -7.0926, intensity: 0.55 },
  { region: 'Peru', lat: -9.1900, lng: -75.0152, intensity: 0.5 },
  { region: 'Uzbekistan', lat: 41.3775, lng: 64.5853, intensity: 0.5 },
  { region: 'Chile', lat: -35.6751, lng: -71.5430, intensity: 0.45 },
  { region: 'Ethiopia', lat: 9.1450, lng: 40.4897, intensity: 0.55 },
  { region: 'Sweden', lat: 60.1282, lng: 18.6435, intensity: 0.5 },
  { region: 'Kazakhstan', lat: 48.0196, lng: 66.9237, intensity: 0.4 },
  { region: 'Portugal', lat: 39.3999, lng: -8.2245, intensity: 0.55 }
];

// Modified Earth shader for day/night effect and procedural lights
const fragmentShader = `
  uniform sampler2D dayTexture;
  uniform sampler2D cloudsTexture;
  uniform vec3 sunDirection;
  uniform float nightSide;
  uniform vec3 nightColor;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Sample textures
    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
    float cloudsValue = texture2D(cloudsTexture, vUv).r;
    
    // Compute cosine angle between normal and sun direction
    float cosineAngleSunToNormal = dot(normalize(vNormal), sunDirection);
    
    // Sharpen the edge between day and night
    float sharpCosine = clamp(cosineAngleSunToNormal * 10.0, -1.0, 1.0);
    
    // Convert to 0 to 1 for mixing day/night
    float mixAmount = sharpCosine * 0.5 + 0.5;
    
    // Dark blue base for night side
    vec3 darkNight = vec3(0.03, 0.05, 0.1);
    
    // Mix between night and day colors
    vec3 color = mix(darkNight, dayColor, mixAmount);
    
    // Apply cloud shadows to day side
    if (mixAmount > 0.5) {
      color = mix(color, color * 0.8, cloudsValue * 0.8);
    }
    
    // Add clouds as a bright overlay, stronger on day side
    color = mix(color, vec3(1.0), cloudsValue * mixAmount * 0.4);
    
    // Add atmospheric rim lighting (fake fresnel)
    float intensity = 1.4 - dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
    vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 2.0) * 0.5;
    
    // Only add atmosphere to the day side
    color += atmosphere * max(0.0, cosineAngleSunToNormal);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Atmosphere shader
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 eyeVector;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    eyeVector = normalize(worldPos.xyz - cameraPosition);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  varying vec3 eyeVector;
  
  void main() {
    float intensity = pow(0.7 - dot(vNormal, eyeVector), 2.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, 0.5) * intensity;
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

const WeatherEcosystemApp = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [isRotating, setIsRotating] = useState(true);
  const [tooltipData, setTooltipData] = useState(null);
  const [earthTextures, setEarthTextures] = useState({
    day: null,
    clouds: null,
    loaded: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Log to debug
  useEffect(() => {
    console.log("WeatherEcosystemApp component mounted");
  }, []);

  // Load Earth textures
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    const loadTextures = async () => {
      try {
        console.log("Loading textures...");
        const basePath = '/textures/';
        
        const dayTexture = await new Promise((resolve, reject) => 
          textureLoader.load(
            `${basePath}earth-blue-marble.jpg`, 
            resolve,
            undefined,
            (error) => {
              console.error(`Failed to load day texture: ${error.message}`);
              reject(error);
            }
          )
        );
        
        const cloudsTexture = await new Promise((resolve, reject) => 
          textureLoader.load(
            `${basePath}earth-clouds.png`, 
            resolve,
            undefined,
            (error) => {
              console.error(`Failed to load clouds texture: ${error.message}`);
              reject(error);
            }
          )
        );
        
        console.log("Textures loaded successfully");
        setEarthTextures({
          day: dayTexture,
          clouds: cloudsTexture,
          loaded: true
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load textures:", error);
        setIsLoading(false);
      }
    };
    
    loadTextures();
  }, []);

  useEffect(() => {
    // Set the canvas dimensions to match the container
    const updateCanvasDimensions = () => {
      if (canvasRef.current && containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    // Initial update and add resize listener
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    
    return () => {
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !earthTextures.loaded) {
      console.log("Canvas ref or textures not ready yet");
      return;
    }

    console.log("Setting up 3D scene");
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40, 
      canvasRef.current.width / canvasRef.current.height, 
      0.1, 
      1000
    );
    camera.position.set(0, 0, 200);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      canvas: canvasRef.current
    });
    renderer.setSize(canvasRef.current.width, canvasRef.current.height);
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    // Set up high quality rendering
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 120;
    controls.maxDistance = 500;

    // Create custom Earth with day/night cycle using shader material
    const earthGeometry = new THREE.SphereGeometry(100, 128, 64);
    const earthCustomMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: earthTextures.day },
        cloudsTexture: { value: earthTextures.clouds },
        sunDirection: { value: new THREE.Vector3(-1, 0.4, 0.5).normalize() },
        nightSide: { value: 0.0 },
        nightColor: { value: new THREE.Color(0x103070) }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
    
    const earthMesh = new THREE.Mesh(earthGeometry, earthCustomMaterial);
    
    // Create atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(105, 128, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    earthMesh.add(atmosphere);
    
    // Create separate cloud layer
    const cloudGeometry = new THREE.SphereGeometry(101, 128, 64);
    const cloudMaterial = new THREE.MeshStandardMaterial({
      map: earthTextures.clouds,
      transparent: true,
      opacity: 0.6,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor
    });
    
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    earthMesh.add(cloudMesh);
    
    // Create night-time lights using particle system
    const createLightParticles = () => {
      // Group for population lights
      const populationLights = new THREE.Group();
      
      // Add main population centers with clusters of particles
      POPULATION_DENSITY.forEach(location => {
        // Calculate how many light particles to create based on intensity
        const particleCount = Math.floor(location.intensity * 50) + 10;
        
        // Create particles for this location
        const particleGeometry = new THREE.BufferGeometry();
        const particlesCentered = [];
        
        // Get the center position of this region
        const centerPosition = latLongToVector3(location.lat, location.lng, 101);
        
        // Create a cluster of particles around this center
        for (let i = 0; i < particleCount; i++) {
          // Random offset around the center
          const spread = location.intensity * 5; // Higher intensity = more spread
          const offset = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
          );
          
          // Add randomized position
          const position = centerPosition.clone().add(offset);
          // Normalize to keep on the surface
          position.normalize().multiplyScalar(101);
          
          particlesCentered.push(position.x, position.y, position.z);
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesCentered, 3));
        
        // Use additive blending for the light effect
        const particleMaterial = new THREE.PointsMaterial({
          size: 0.8,
          color: new THREE.Color(0xffffcc),
          transparent: true,
          opacity: 0.8 * location.intensity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        populationLights.add(particles);
      });
      
      // Add smaller random lights throughout for a more natural look
      const randomLightsGeometry = new THREE.BufferGeometry();
      const randomPositions = [];
      
      // Add some smaller, random lights all over the globe
      for (let i = 0; i < 2000; i++) {
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        
        const x = 101 * Math.sin(theta) * Math.cos(phi);
        const y = 101 * Math.sin(theta) * Math.sin(phi);
        const z = 101 * Math.cos(theta);
        
        randomPositions.push(x, y, z);
      }
      
      randomLightsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(randomPositions, 3));
      
      const randomLightsMaterial = new THREE.PointsMaterial({
        size: 0.4,
        color: new THREE.Color(0xffcc77),
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      
      const randomLights = new THREE.Points(randomLightsGeometry, randomLightsMaterial);
      populationLights.add(randomLights);
      
      return populationLights;
    };
    
    const nightLights = createLightParticles();
    earthMesh.add(nightLights);
    
    scene.add(earthMesh);

    // Create globe instance for data visualization layers
    const globe = new Globe({ 
      waitForGlobeReady: false, // We already have our custom Earth
      animateIn: false, // We'll handle our own animation
    })
      .width(canvasRef.current.width)
      .height(canvasRef.current.height)
      .globeImageUrl(null) // No globe image needed since we have custom Earth
      .showGlobe(false) // Hide the default globe
      .showAtmosphere(false) // Hide the default atmosphere
      .arcColor(() => '#00ff88')
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(2000)
      .arcsData(FLIGHT_DATA.map(flight => ({
        startLat: flight.from.lat,
        startLng: flight.from.lng,
        endLat: flight.to.lat,
        endLng: flight.to.lng,
        color: '#00ff88',
        name: `${flight.from.name} to ${flight.to.name}`
      })))
      .arcAltitude(0.2)
      .arcStroke(0.5)
      .pointsData(TEMP_HOTSPOTS.map(spot => ({
        lat: spot.lat,
        lng: spot.lng,
        size: spot.temp / 10,
        color: spot.temp > 40 ? '#ff6600' : '#ffcc00',
        name: spot.name,
        temp: spot.temp
      })))
      .pointAltitude(0.02)
      .pointColor('color')
      .pointLabel('name')
      .pointRadius(0.5)
      .pointsMerge(true)
      .pointsTransitionDuration(1000);

    scene.add(globe);

    // Align the globe with custom Earth
    globe.scale.set(1, 1, 1);
    globe.rotation.set(0, 0, 0);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.copy(earthCustomMaterial.uniforms.sunDirection.value.clone().multiplyScalar(500));
    scene.add(dirLight);

    // Add optional point light for better highlights
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 500);
    pointLight.position.set(100, 50, 50);
    scene.add(pointLight);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvasRef.current.width, canvasRef.current.height),
      0.3, // Bloom strength
      0.4, // Radius
      0.85 // Threshold
    );
    composer.addPass(bloomPass);

    // Event handlers
    const handleResize = () => {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
      composer.setSize(width, height);
      
      globe.width(width).height(height);
    };

    window.addEventListener('resize', handleResize);

    const handleTooltip = (event) => {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Raycasting for mouse interactions with globe
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(
        (mouseX / rect.width) * 2 - 1,
        -(mouseY / rect.height) * 2 + 1
      );
      
      raycaster.setFromCamera(mouse, camera);
      
      // Check for intersection with points
      const pointObjects = globe.children.find(c => c.name === 'points')?.children || [];
      const intersects = raycaster.intersectObjects(pointObjects);
      
      if (intersects.length > 0) {
        const data = globe.__dataPointsData?.[intersects[0].object?.userData?.index];
        if (data) {
          setTooltipData({
            x: mouseX,
            y: mouseY,
            data
          });
          return;
        }
      }
      
      // Check for intersection with arcs
      const arcObjects = globe.children.find(c => c.name === 'arcs')?.children || [];
      const arcIntersects = raycaster.intersectObjects(arcObjects);
      
      if (arcIntersects.length > 0) {
        const data = globe.__arcData?.[arcIntersects[0].object?.userData?.index];
        if (data) {
          setTooltipData({
            x: mouseX,
            y: mouseY,
            data
          });
          return;
        }
      }
      
      setTooltipData(null);
    };
    
    canvasRef.current.addEventListener('mousemove', handleTooltip);

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Update controls
      controls.update();
      
      // Rotate Earth and clouds if rotation is enabled
      if (isRotating) {
        earthMesh.rotation.y += 0.0005;
        cloudMesh.rotation.y += 0.0007; // Clouds rotate slightly faster
        
        // Calculate day/night regions based on rotation
        earthCustomMaterial.uniforms.nightSide.value = (earthMesh.rotation.y % (Math.PI * 2)) / (Math.PI * 2);
      }
      
      // Render scene with post-processing
      composer.render();
    };
    
    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      canvasRef.current?.removeEventListener('mousemove', handleTooltip);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      
      // Dispose geometries, materials, textures
      earthGeometry.dispose();
      earthCustomMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      
      // Dispose post-processing
      composer.dispose();
    };
  }, [earthTextures.loaded]);

  return (
    <div className="weather-ecosystem-app" ref={containerRef}>
      {isLoading ? (
        <div className="loading" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
          Loading Earth Visualization...
          <p style={{ fontSize: '16px', marginTop: '10px' }}>Please wait while textures load</p>
        </div>
      ) : (
        <>
          <canvas ref={canvasRef} className="globe-canvas" />
          
          {/* Controls UI */}
          <div className="controls">
            <button onClick={() => setIsRotating(!isRotating)}>
              {isRotating ? 'Pause Rotation' : 'Resume Rotation'}
            </button>
          </div>
          
          {/* Tooltip */}
          {tooltipData && (
            <div 
              className="tooltip"
              style={{
                left: tooltipData.x + 10,
                top: tooltipData.y + 10
              }}
            >
              {tooltipData.data.name && <h3>{tooltipData.data.name}</h3>}
              {tooltipData.data.temp && <p>Temperature: {tooltipData.data.temp}°C</p>}
            </div>
          )}
          
          {/* Debug info - remove for production */}
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
            Weather Ecosystem App Active
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherEcosystemApp; 