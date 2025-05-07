import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import BackButton from '../../components/BackButton';
import './styles/WeatherEcosystem.css';

// ThreeGlobe Earth App - Reliable implementation
const ThreeGlobeEarthApp = ({ onBack }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!containerRef.current) {
      setError("Container reference not available");
      return;
    }
    
    console.log("Setting up Earth scene");
    let scene, camera, renderer, controls;
    let earthMesh, cloudsMesh, atmosphereMesh, starField;
    
    try {
      // Create scene
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 4);
      
      // Create renderer
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      containerRef.current.appendChild(renderer.domElement);
      
      // Camera controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;
      controls.minDistance = 2;
      controls.maxDistance = 10;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      
      // Create procedural Earth textures
      const createEarthTextures = () => {
        // Day texture
        const dayCanvas = document.createElement('canvas');
        dayCanvas.width = 1024;
        dayCanvas.height = 512;
        const dayCtx = dayCanvas.getContext('2d');
        
        // Ocean background
        const gradient = dayCtx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#0077be');
        gradient.addColorStop(0.5, '#0099cc');
        gradient.addColorStop(1, '#0077be');
        dayCtx.fillStyle = gradient;
        dayCtx.fillRect(0, 0, 1024, 512);
        
        // Land continents
        dayCtx.fillStyle = '#41924B';
        
        // North America
        dayCtx.beginPath();
        dayCtx.moveTo(200, 150);
        dayCtx.lineTo(280, 100);
        dayCtx.lineTo(320, 150);
        dayCtx.lineTo(290, 250);
        dayCtx.lineTo(250, 250);
        dayCtx.closePath();
        dayCtx.fill();
        
        // South America
        dayCtx.beginPath();
        dayCtx.moveTo(280, 280);
        dayCtx.lineTo(320, 320);
        dayCtx.lineTo(300, 400);
        dayCtx.lineTo(250, 350);
        dayCtx.closePath();
        dayCtx.fill();
        
        // Europe/Africa
        dayCtx.beginPath();
        dayCtx.moveTo(500, 150);
        dayCtx.lineTo(550, 120);
        dayCtx.lineTo(580, 300);
        dayCtx.lineTo(520, 350);
        dayCtx.lineTo(480, 250);
        dayCtx.closePath();
        dayCtx.fill();
        
        // Asia
        dayCtx.beginPath();
        dayCtx.moveTo(600, 150);
        dayCtx.lineTo(750, 150);
        dayCtx.lineTo(750, 250);
        dayCtx.lineTo(650, 300);
        dayCtx.lineTo(600, 200);
        dayCtx.closePath();
        dayCtx.fill();
        
        // Australia
        dayCtx.beginPath();
        dayCtx.moveTo(750, 350);
        dayCtx.lineTo(800, 330);
        dayCtx.lineTo(820, 380);
        dayCtx.lineTo(770, 400);
        dayCtx.closePath();
        dayCtx.fill();
        
        // Night texture - dark with city lights
        const nightCanvas = document.createElement('canvas');
        nightCanvas.width = 1024;
        nightCanvas.height = 512;
        const nightCtx = nightCanvas.getContext('2d');
        
        // Dark background
        nightCtx.fillStyle = '#000033';
        nightCtx.fillRect(0, 0, 1024, 512);
        
        // City lights (small bright dots)
        nightCtx.fillStyle = 'rgba(255, 240, 150, 0.8)';
        
        // North America
        for (let i = 0; i < 50; i++) {
          const x = 200 + Math.random() * 100;
          const y = 150 + Math.random() * 100;
          const size = Math.random() * 2 + 1;
          nightCtx.beginPath();
          nightCtx.arc(x, y, size, 0, Math.PI * 2);
          nightCtx.fill();
        }
        
        // Europe
        for (let i = 0; i < 40; i++) {
          const x = 500 + Math.random() * 80;
          const y = 180 + Math.random() * 70;
          const size = Math.random() * 2 + 1;
          nightCtx.beginPath();
          nightCtx.arc(x, y, size, 0, Math.PI * 2);
          nightCtx.fill();
        }
        
        // Asia
        for (let i = 0; i < 60; i++) {
          const x = 650 + Math.random() * 100;
          const y = 200 + Math.random() * 100;
          const size = Math.random() * 2 + 1;
          nightCtx.beginPath();
          nightCtx.arc(x, y, size, 0, Math.PI * 2);
          nightCtx.fill();
        }
        
        // Clouds texture
        const cloudCanvas = document.createElement('canvas');
        cloudCanvas.width = 1024;
        cloudCanvas.height = 512;
        const cloudCtx = cloudCanvas.getContext('2d');
        
        // Transparent background
        cloudCtx.fillStyle = 'rgba(0, 0, 0, 0)';
        cloudCtx.fillRect(0, 0, 1024, 512);
        
        // Cloud patterns (semi-transparent white)
        cloudCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // Add some cloud formations
        for (let y = 0; y < 512; y += 8) {
          for (let x = 0; x < 1024; x += 8) {
            const value = Math.random();
            if (value > 0.7) {
              cloudCtx.globalAlpha = (value - 0.7) * 3; // Makes some clouds more solid than others
              const size = Math.random() * 15 + 5;
              cloudCtx.beginPath();
              cloudCtx.arc(x, y, size, 0, Math.PI * 2);
              cloudCtx.fill();
            }
          }
        }
        
        // Convert to textures
        const dayTexture = new THREE.CanvasTexture(dayCanvas);
        const nightTexture = new THREE.CanvasTexture(nightCanvas);
        const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
        
        [dayTexture, nightTexture, cloudTexture].forEach(tex => {
          tex.colorSpace = THREE.SRGBColorSpace;
        });
        
        return { dayTexture, nightTexture, cloudTexture };
      };
      
      // Create Earth textures
      const { dayTexture, nightTexture, cloudTexture } = createEarthTextures();
      
      // Earth
      const earthGeometry = new THREE.SphereGeometry(1, 64, 32);
      const earthMaterial = new THREE.MeshPhongMaterial({
        map: dayTexture,
        bumpScale: 0.05,
        specular: new THREE.Color('#111133'),
        shininess: 5
      });
      
      earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
      scene.add(earthMesh);
      
      // Clouds
      const cloudsGeometry = new THREE.SphereGeometry(1.02, 64, 32);
      const cloudsMaterial = new THREE.MeshPhongMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      
      cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
      scene.add(cloudsMesh);
      
      // Atmosphere
      const atmosphereGeometry = new THREE.SphereGeometry(1.1, 64, 32);
      const atmosphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x0066ff,
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
        side: THREE.BackSide
      });
      
      atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      scene.add(atmosphereMesh);
      
      // Star field background
      const starGeometry = new THREE.BufferGeometry();
      const starVertices = [];
      
      for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        
        // Keep stars away from the center
        if (Math.sqrt(x*x + y*y + z*z) > 100) {
          starVertices.push(x, y, z);
        }
      }
      
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: false
      });
      
      starField = new THREE.Points(starGeometry, starMaterial);
      scene.add(starField);
      
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      
      const sunLight = new THREE.DirectionalLight(0xffffff, 1);
      sunLight.position.set(5, 3, 5);
      scene.add(sunLight);
      
      // Resize handler
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Animation loop
      let animationFrame;
      const animate = () => {
        animationFrame = requestAnimationFrame(animate);
        
        controls.update();
        
        // Earth rotation
        if (!controls.autoRotate) {
          earthMesh.rotation.y += 0.001;
        }
        
        // Clouds rotate slightly faster
        cloudsMesh.rotation.y += 0.0015;
        
        renderer.render(scene, camera);
      };
      
      animate();
      
      // Loading complete
      setLoading(false);
      console.log("Earth setup complete");
      
      // Cleanup function
      return () => {
        console.log("Cleaning up Earth scene");
        cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', handleResize);
        
        // Remove renderer from DOM
        if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement);
        }
        
        // Dispose geometries and materials
        [earthGeometry, cloudsGeometry, atmosphereGeometry, starGeometry].forEach(geo => geo.dispose());
        [earthMaterial, cloudsMaterial, atmosphereMaterial, starMaterial].forEach(mat => mat.dispose());
        
        // Dispose textures
        [dayTexture, nightTexture, cloudTexture].forEach(tex => tex.dispose());
        
        // Dispose renderer
        renderer.dispose();
        
        // Clean up references
        scene = null;
        camera = null;
        renderer = null;
        controls = null;
        earthMesh = null;
        cloudsMesh = null;
        atmosphereMesh = null;
        starField = null;
      };
    } catch (err) {
      console.error("Error setting up Earth scene:", err);
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  }, []);
  
  return (
    <div className="threejs-container" style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)'
    }}>
      {/* Main container for WebGL */}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%' 
        }}
      />
      
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          zIndex: 1000
        }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>
            Loading Earth...
          </div>
          <div style={{ 
            width: '50px',
            height: '50px',
            border: '5px solid rgba(255, 255, 255, 0.3)',
            borderTop: '5px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(200, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '80%',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <h3>Error Loading Earth</h3>
          <p>{error}</p>
          <p>Try refreshing the page or checking your WebGL support.</p>
        </div>
      )}
      
      {/* Back button */}
      <BackButton onClick={onBack} />
      
      {/* Info panel */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        zIndex: 10
      }}>
        ThreeGlobe Earth - Click and drag to rotate
      </div>
    </div>
  );
};

export default ThreeGlobeEarthApp; 