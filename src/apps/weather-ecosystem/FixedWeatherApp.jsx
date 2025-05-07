import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './styles/WeatherEcosystem.css';

const FixedWeatherApp = () => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [textures, setTextures] = useState({
    loaded: false,
    error: null
  });

  // Load textures explicitly
  useEffect(() => {
    const loadTextures = async () => {
      try {
        const textureLoader = new THREE.TextureLoader();
        
        console.log("Attempting to load earth texture...");
        
        const earthTexture = await new Promise((resolve, reject) => {
          textureLoader.load(
            '/textures/earth-blue-marble.jpg',
            (texture) => {
              console.log("Earth texture loaded successfully");
              resolve(texture);
            },
            (progress) => {
              console.log(`Earth texture loading: ${Math.round((progress.loaded / progress.total) * 100)}%`);
            },
            (error) => {
              console.error("Error loading earth texture:", error);
              reject(error);
            }
          );
        });
        
        setTextures({
          earth: earthTexture,
          loaded: true,
          error: null
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load textures:", error);
        setTextures({
          loaded: false,
          error: error.message || "Unknown error loading textures"
        });
        setIsLoading(false);
      }
    };
    
    loadTextures();
  }, []);

  // Set up Three.js scene
  useEffect(() => {
    if (!containerRef.current || !textures.loaded) {
      return;
    }

    console.log("Setting up 3D scene with loaded textures");
    
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Create earth with texture
    const earthGeometry = new THREE.SphereGeometry(100, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({ 
      map: textures.earth,
      shininess: 30
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 150;
    controls.maxDistance = 500;
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Rotate earth
      earth.rotation.y += 0.0005;
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      console.log("Cleaning up Three.js resources");
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      earthGeometry.dispose();
      earthMaterial.dispose();
      renderer.dispose();
    };
  }, [textures.loaded]);

  return (
    <div className="weather-ecosystem-app" ref={containerRef}>
      {isLoading && (
        <div className="loading" style={{ fontSize: '24px', color: 'white' }}>
          Loading Earth Textures...
        </div>
      )}
      
      {!isLoading && textures.error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          background: 'rgba(0,0,0,0.7)',
          padding: '20px',
          borderRadius: '5px',
          maxWidth: '80%'
        }}>
          <h2>Error Loading Textures</h2>
          <p>{textures.error}</p>
          <p>Check browser console for details.</p>
        </div>
      )}
      
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
        Fixed Weather App Active
      </div>
    </div>
  );
};

export default FixedWeatherApp; 