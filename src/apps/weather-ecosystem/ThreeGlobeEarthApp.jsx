import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './styles/WeatherEcosystem.css';

// Minimal WebGL compatibility debug version
const ThreeGlobeEarthApp = () => {
  const containerRef = useRef(null);
  const [debugMessages, setDebugMessages] = useState([]);
  const [webglSupported, setWebglSupported] = useState(null);
  
  const addDebugMessage = (message) => {
    console.log(message);
    setDebugMessages(prev => [...prev, message]);
  };
  
  // Check if WebGL is available
  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || 
                canvas.getContext('experimental-webgl');
      
      if (!gl) {
        addDebugMessage("❌ WebGL not supported");
        return false;
      }
      
      // Check for required extensions and capabilities
      addDebugMessage(`✅ WebGL supported: ${gl.getParameter(gl.VERSION)}`);
      addDebugMessage(`Vendor: ${gl.getParameter(gl.VENDOR)}`);
      addDebugMessage(`Renderer: ${gl.getParameter(gl.RENDERER)}`);
      addDebugMessage(`Max texture size: ${gl.getParameter(gl.MAX_TEXTURE_SIZE)}`);
      
      return true;
    } catch (e) {
      addDebugMessage(`❌ WebGL check failed: ${e.message}`);
      return false;
    }
  };
  
  useEffect(() => {
    addDebugMessage("Component mounted");
    
    // First check WebGL compatibility
    const webglAvailable = checkWebGLSupport();
    setWebglSupported(webglAvailable);
    
    if (!webglAvailable) {
      addDebugMessage("Cannot proceed without WebGL support");
      return;
    }
    
    if (!containerRef.current) {
      addDebugMessage("Container ref not available");
      return;
    }
    
    addDebugMessage("Setting up basic render test");
    
    try {
      // Remove all children from container
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      // Create a very simple scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x004466);
      
      // Camera
      const camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
      );
      camera.position.z = 5;
      
      // Create renderer with explicit debug settings 
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        stencil: false,
        depth: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false
      });
      
      // Get renderer information
      const info = renderer.info;
      addDebugMessage(`Renderer created: memory=${JSON.stringify(info.memory)}`);
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(1); // Use a stable pixel ratio of 1
      
      // Add renderer directly to DOM
      containerRef.current.appendChild(renderer.domElement);
      addDebugMessage("Renderer DOM element added");
      
      // Create a simple colored cube
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff3366,
        wireframe: true
      });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      addDebugMessage("Test cube added to scene");
      
      // Add a colored axis helper
      const axesHelper = new THREE.AxesHelper(3);
      scene.add(axesHelper);
      
      // Force a single render to see if it works
      renderer.render(scene, camera);
      addDebugMessage("Initial render completed");
      
      // Create a simple animation function
      const animate = () => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        
        renderer.render(scene, camera);
        
        window.requestAnimationFrame(animate);
      };
      
      // Start animation
      animate();
      addDebugMessage("Animation started");
      
      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        scene.remove(cube);
        geometry.dispose();
        material.dispose();
        
        addDebugMessage("Component cleanup");
      };
    } catch (err) {
      addDebugMessage(`❌ Error: ${err.message}`);
      console.error(err);
    }
  }, []);
  
  return (
    <div className="webgl-test-container" ref={containerRef} style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: '#000020',
      zIndex: 100
    }}>
      <div className="debug-panel" style={{
        position: 'absolute',
        top: 10,
        left: 10,
        padding: '10px 15px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxWidth: '80%',
        maxHeight: '50%',
        overflow: 'auto',
        zIndex: 1000,
        border: '1px solid #444'
      }}>
        <h3 style={{margin: '0 0 5px 0', color: '#4fc3f7'}}>
          WebGL Compatibility Test
        </h3>
        <div style={{color: webglSupported === true ? '#81c784' : 
                    webglSupported === false ? '#ff5252' : '#ffffff'}}>
          WebGL: {webglSupported === true ? 'Supported' : 
                webglSupported === false ? 'Not Supported' : 'Checking...'}
        </div>
        <div style={{margin: '10px 0', maxHeight: '200px', overflow: 'auto'}}>
          {debugMessages.slice(-10).map((msg, idx) => (
            <div key={idx} style={{
              borderBottom: '1px solid #333',
              padding: '3px 0',
              fontSize: '11px'
            }}>
              {msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreeGlobeEarthApp; 