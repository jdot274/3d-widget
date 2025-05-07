import React, { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Orbit control widget component
export default function OrbitControlWidget({ position = [0, 0, 0] }) {
  const groupRef = useRef();
  const rotationSphereRef = useRef();
  const { camera, gl } = useThree();
  const [widgetOpen, setWidgetOpen] = useState(true); // Default to open for visibility
  const [activeControl, setActiveControl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState(new THREE.Vector2());
  const [startCameraPosition] = useState(new THREE.Vector3());
  const [startCameraTarget] = useState(new THREE.Vector3());
  const [startCameraUp] = useState(new THREE.Vector3());
  const [isOrthographic, setIsOrthographic] = useState(false);
  const [initialFov] = useState(camera.fov || 45);
  const [initialPosition] = useState(() => camera.position.clone());
  
  // Original aspect ratio for orthographic camera
  const initialAspect = useRef(gl.domElement.width / gl.domElement.height);

  // Effect for setting up gesture handlers
  useEffect(() => {
    const canvas = gl.domElement;
    
    // Gesture recognizers
    let lastPinchDistance = 0;
    let isOptionDown = false;
    
    // Check for option/alt key
    const handleKeyDown = (e) => {
      if (e.altKey) isOptionDown = true;
    };
    
    const handleKeyUp = (e) => {
      if (!e.altKey) isOptionDown = false;
    };
    
    // Mouse handlers
    const handleWheel = (e) => {
      // Zoom with scroll wheel
      const zoomSpeed = 0.1;
      const delta = e.deltaY * zoomSpeed;
      
      if (isOrthographic) {
        // Adjust orthographic zoom
        camera.zoom = Math.max(0.1, camera.zoom - delta * 0.01);
      } else {
        // Adjust perspective camera distance
        const direction = camera.position.clone().normalize();
        camera.position.addScaledVector(direction, delta);
      }
      
      camera.updateProjectionMatrix();
    };
    
    const handleMouseDown = (e) => {
      // Option + click for rotation
      if (isOptionDown && e.button === 0) {
        e.preventDefault();
        setIsDragging(true);
        setActiveControl('rotate');
        setStartPosition(new THREE.Vector2(e.clientX, e.clientY));
        startCameraPosition.copy(camera.position);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
    };
    
    const handleMouseMove = (e) => {
      if (isDragging && activeControl === 'rotate') {
        const deltaX = (e.clientX - startPosition.x) / gl.domElement.clientWidth * 2;
        const deltaY = (e.clientY - startPosition.y) / gl.domElement.clientHeight * 2;
        
        handleCameraRotation(deltaX, deltaY);
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setActiveControl(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Touch handlers
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        // Two-finger gesture starting
        e.preventDefault();
        setIsDragging(true);
        
        // Determine if pinch or pan based on touch movement
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        lastPinchDistance = getPinchDistance(touch1, touch2);
        
        setStartPosition(new THREE.Vector2(
          (touch1.clientX + touch2.clientX) / 2,
          (touch1.clientY + touch2.clientY) / 2
        ));
        
        startCameraPosition.copy(camera.position);
        setActiveControl('touch');
      }
    };
    
    const handleTouchMove = (e) => {
      if (!isDragging || activeControl !== 'touch') return;
      
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // Calculate current center point
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        // For panning (center movement)
        const deltaX = (centerX - startPosition.x) / gl.domElement.clientWidth * 2;
        const deltaY = (centerY - startPosition.y) / gl.domElement.clientHeight * 2;
        
        // Handle two-finger pan
        handleCameraPan(deltaX, deltaY);
        
        // For pinch zoom (distance change)
        const currentPinchDistance = getPinchDistance(touch1, touch2);
        const pinchDelta = (lastPinchDistance - currentPinchDistance) * 0.05;
        lastPinchDistance = currentPinchDistance;
        
        // Handle pinch zoom
        handleCameraZoom(pinchDelta);
        
        // Update start position for next move
        setStartPosition(new THREE.Vector2(centerX, centerY));
      }
    };
    
    const handleTouchEnd = () => {
      setIsDragging(false);
      setActiveControl(null);
    };
    
    // Utility for calculating pinch distance
    const getPinchDistance = (touch1, touch2) => {
      return Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    };
    
    // Add event listeners
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Cleanup
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [camera, gl, isDragging, activeControl, isOrthographic]);

  // Camera operation handlers
  const handleCameraRotation = (deltaX, deltaY) => {
    const rotSpeed = 2.0;
    camera.position.x = startCameraPosition.x * Math.cos(deltaX * rotSpeed) - startCameraPosition.z * Math.sin(deltaX * rotSpeed);
    camera.position.z = startCameraPosition.z * Math.cos(deltaX * rotSpeed) + startCameraPosition.x * Math.sin(deltaX * rotSpeed);
    camera.position.y += deltaY * rotSpeed;
    camera.lookAt(0, 0, 0);
  };
  
  const handleCameraPan = (deltaX, deltaY) => {
    const panSpeed = 2.0;
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    
    // Get camera's right and up vectors
    right.setFromMatrixColumn(camera.matrix, 0);
    up.setFromMatrixColumn(camera.matrix, 1);
    
    // Move camera based on right and up vectors
    camera.position.addScaledVector(right, -deltaX * panSpeed);
    camera.position.addScaledVector(up, deltaY * panSpeed);
    
    // If using orbit controls, also move the target
    if (camera.controls) {
      camera.controls.target.addScaledVector(right, -deltaX * panSpeed);
      camera.controls.target.addScaledVector(up, deltaY * panSpeed);
    }
  };
  
  const handleCameraZoom = (delta) => {
    const zoomSpeed = 2.0;
    const distance = camera.position.length();
    const direction = camera.position.clone().normalize();
    
    // Scale speed based on distance to avoid too fast/slow zooming
    const scaledDelta = delta * zoomSpeed * Math.max(0.1, distance / 10);
    
    if (isOrthographic) {
      // For orthographic, adjust zoom
      camera.zoom = Math.max(0.1, camera.zoom - scaledDelta * 0.1);
    } else {
      // For perspective, move camera along view direction
      camera.position.addScaledVector(direction, scaledDelta);
    }
  };

  // Switch between orthographic and perspective cameras
  const toggleCameraType = () => {
    if (isOrthographic) {
      // Switch to perspective
      const perspectiveCamera = new THREE.PerspectiveCamera(
        initialFov,
        gl.domElement.width / gl.domElement.height,
        0.1,
        1000
      );
      
      // Copy position and rotation
      perspectiveCamera.position.copy(camera.position);
      perspectiveCamera.rotation.copy(camera.rotation);
      perspectiveCamera.up.copy(camera.up);
      
      // Replace the camera
      Object.assign(camera, perspectiveCamera);
    } else {
      // Switch to orthographic
      const aspect = gl.domElement.width / gl.domElement.height;
      const frustumSize = 5;
      const orthographicCamera = new THREE.OrthographicCamera(
        frustumSize * aspect / -2,
        frustumSize * aspect / 2,
        frustumSize / 2,
        frustumSize / -2,
        0.1,
        1000
      );
      
      // Copy position and rotation
      orthographicCamera.position.copy(camera.position);
      orthographicCamera.rotation.copy(camera.rotation);
      orthographicCamera.up.copy(camera.up);
      orthographicCamera.zoom = 1;
      
      // Replace the camera
      Object.assign(camera, orthographicCamera);
    }
    
    setIsOrthographic(!isOrthographic);
    camera.updateProjectionMatrix();
  };
  
  // Reset camera to initial position
  const resetCamera = () => {
    if (isOrthographic) {
      // Reset orthographic camera
      const aspect = gl.domElement.width / gl.domElement.height;
      const frustumSize = 5;
      camera.left = frustumSize * aspect / -2;
      camera.right = frustumSize * aspect / 2;
      camera.top = frustumSize / 2;
      camera.bottom = frustumSize / -2;
      camera.zoom = 1;
    } else {
      // Reset perspective camera
      camera.fov = initialFov;
    }
    
    // Reset position and orientation
    camera.position.copy(initialPosition);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  
  // Set camera to specific view
  const setCameraView = (view) => {
    const distance = camera.position.length();
    
    switch(view) {
      case 'front':
        camera.position.set(0, 0, distance);
        break;
      case 'back':
        camera.position.set(0, 0, -distance);
        break;
      case 'left':
        camera.position.set(-distance, 0, 0);
        break;
      case 'right':
        camera.position.set(distance, 0, 0);
        break;
      case 'top':
        camera.position.set(0, distance, 0);
        break;
      case 'bottom':
        camera.position.set(0, -distance, 0);
        break;
      default:
        break;
    }
    
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };

  // Animation for hover and widget open/close
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle hover animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.03;
      
      // Handle widget scale animation (open/close)
      const targetScale = widgetOpen ? 1 : 0.7;
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1);
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, 0.1);
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, 0.1);
      
      // Animated rotation of the rotation control sphere
      if (rotationSphereRef.current && !isDragging) {
        rotationSphereRef.current.rotation.y += 0.005;
      }
    }
  });

  const handlePointerDown = (e, control) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setActiveControl(control);
    
    // Store starting positions
    setStartPosition(new THREE.Vector2(e.clientX, e.clientY));
    startCameraPosition.copy(camera.position);
    
    if (camera.target) {
      startCameraTarget.copy(camera.target);
    } else if (camera.controls) {
      startCameraTarget.copy(camera.controls.target);
    }
    
    startCameraUp.copy(camera.up);
    
    // Add global event listeners
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };
  
  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    // Calculate delta from start position
    const deltaX = (e.clientX - startPosition.x) / gl.domElement.clientWidth * 2;
    const deltaY = (e.clientY - startPosition.y) / gl.domElement.clientHeight * 2;
    
    // Handle different control modes
    switch (activeControl) {
      case 'rotate':
        handleCameraRotation(deltaX, deltaY);
        break;
        
      case 'pan':
        handleCameraPan(deltaX, deltaY);
        break;
        
      case 'zoom':
        handleCameraZoom(deltaY);
        break;
        
      default:
        break;
    }
    
    // Force camera update
    camera.updateProjectionMatrix();
    if (camera.controls) camera.controls.update();
  };
  
  const handlePointerUp = () => {
    setIsDragging(false);
    setActiveControl(null);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  };

  // Color and material config
  const buttonColor = "#005FFF";
  const activeColor = "#00BFFF";
  const buttonSize = 0.4; // Increased size for better visibility
  const buttonSpacing = 0.45;

  return (
    <group ref={groupRef} position={position}>
      {/* Widget Panel */}
      <RoundedBox 
        args={[widgetOpen ? 3 : buttonSize*1.5, widgetOpen ? 7 : buttonSize*1.5, 0.05]} 
        radius={0.1}
        position={[widgetOpen ? 1 : 0, widgetOpen ? 1.5 : 0, -0.02]}
      >
        <meshPhysicalMaterial
          color="#14182D"
          roughness={0.7}
          transmission={0.3}
          opacity={0.8}
          transparent={true}
          envMapIntensity={0.5}
        />
      </RoundedBox>
      
      {/* Toggle Button */}
      <group position={[0, 0, 0]} onClick={() => setWidgetOpen(!widgetOpen)}>
        <RoundedBox args={[buttonSize, buttonSize, 0.1]} radius={0.08}>
          <meshPhysicalMaterial
            color={buttonColor}
            roughness={0.4}
            metalness={0.1}
            transmission={0.7}
            opacity={0.9}
            transparent={true}
            emissive={buttonColor}
            emissiveIntensity={widgetOpen ? 0.8 : 0.4}
          />
        </RoundedBox>
        <Text 
          position={[0, 0, 0.07]} 
          fontSize={0.18}
          color="#FFFFFF"
        >
          {widgetOpen ? "×" : "🔄"}
        </Text>
      </group>
      
      {/* Control buttons (only shown when widget is open) */}
      {widgetOpen && (
        <>
          {/* Rotate control */}
          <group 
            position={[0, buttonSpacing, 0]} 
            onPointerDown={(e) => handlePointerDown(e, 'rotate')}
          >
            <Sphere ref={rotationSphereRef} args={[buttonSize/2, 16, 16]}>
              <meshPhysicalMaterial
                color={activeControl === 'rotate' ? activeColor : buttonColor}
                roughness={0.4}
                metalness={0.2}
                transmission={0.6}
                opacity={0.9}
                transparent={true}
                emissive={activeControl === 'rotate' ? activeColor : buttonColor}
                emissiveIntensity={activeControl === 'rotate' ? 1.0 : 0.5}
                wireframe={true}
              />
            </Sphere>
            <RoundedBox args={[buttonSize/2, buttonSize/2, buttonSize/5]} position={[0, 0, 0]} radius={0.05}>
              <meshPhysicalMaterial
                color={activeControl === 'rotate' ? activeColor : buttonColor}
                roughness={0.4}
                metalness={0.2}
                transmission={0.6}
                opacity={0.8}
                transparent={true}
              />
            </RoundedBox>
            <Text 
              position={[buttonSize * 0.8, 0, 0]} 
              fontSize={0.14}
              color="#FFFFFF"
            >
              Rotate
            </Text>
          </group>
          
          {/* Pan control */}
          <group 
            position={[0, buttonSpacing * 2, 0]} 
            onPointerDown={(e) => handlePointerDown(e, 'pan')}
          >
            <RoundedBox args={[buttonSize, buttonSize/2, buttonSize/5]} radius={0.1}>
              <meshPhysicalMaterial
                color={activeControl === 'pan' ? activeColor : buttonColor}
                roughness={0.4}
                metalness={0.1}
                transmission={0.7}
                opacity={0.9}
                transparent={true}
                emissive={activeControl === 'pan' ? activeColor : buttonColor}
                emissiveIntensity={activeControl === 'pan' ? 1.0 : 0.5}
              />
            </RoundedBox>
            <Text 
              position={[buttonSize * 0.8, 0, 0]} 
              fontSize={0.14}
              color="#FFFFFF"
            >
              Pan
            </Text>
            {/* Directional arrows */}
            <Text 
              position={[0, 0, 0.07]} 
              fontSize={0.18}
              color="#FFFFFF"
            >
              ↔
            </Text>
          </group>
          
          {/* Zoom control */}
          <group 
            position={[0, buttonSpacing * 3, 0]} 
            onPointerDown={(e) => handlePointerDown(e, 'zoom')}
          >
            <RoundedBox args={[buttonSize, buttonSize/2, buttonSize/5]} radius={0.1}>
              <meshPhysicalMaterial
                color={activeControl === 'zoom' ? activeColor : buttonColor}
                roughness={0.4}
                metalness={0.1}
                transmission={0.7}
                opacity={0.9}
                transparent={true}
                emissive={activeControl === 'zoom' ? activeColor : buttonColor}
                emissiveIntensity={activeControl === 'zoom' ? 1.0 : 0.5}
              />
            </RoundedBox>
            <Text 
              position={[buttonSize * 0.8, 0, 0]} 
              fontSize={0.14}
              color="#FFFFFF"
            >
              Zoom
            </Text>
            <Text 
              position={[0, 0, 0.07]} 
              fontSize={0.18}
              color="#FFFFFF"
            >
              🔍
            </Text>
          </group>
          
          {/* Orthographic/Perspective toggle */}
          <group 
            position={[1.5, buttonSpacing * 1, 0]} 
            onClick={toggleCameraType}
          >
            <RoundedBox args={[buttonSize * 1.8, buttonSize * 0.6, buttonSize/5]} radius={0.1}>
              <meshPhysicalMaterial
                color={isOrthographic ? activeColor : buttonColor}
                roughness={0.4}
                metalness={0.1}
                transmission={0.7}
                opacity={0.9}
                transparent={true}
                emissive={isOrthographic ? activeColor : buttonColor}
                emissiveIntensity={isOrthographic ? 1.0 : 0.5}
              />
            </RoundedBox>
            <Text 
              position={[0, 0, 0.07]} 
              fontSize={0.13}
              color="#FFFFFF"
            >
              {isOrthographic ? "Orthographic" : "Perspective"}
            </Text>
          </group>
          
          {/* Reset View button */}
          <group 
            position={[1.5, buttonSpacing * 0, 0]} 
            onClick={resetCamera}
          >
            <RoundedBox args={[buttonSize * 1.2, buttonSize * 0.6, buttonSize/5]} radius={0.1}>
              <meshPhysicalMaterial
                color={buttonColor}
                roughness={0.4}
                metalness={0.1}
                transmission={0.7}
                opacity={0.9}
                transparent={true}
                emissive={buttonColor}
                emissiveIntensity={0.5}
              />
            </RoundedBox>
            <Text 
              position={[0, 0, 0.07]} 
              fontSize={0.14}
              color="#FFFFFF"
            >
              Reset View
            </Text>
          </group>
          
          {/* View Presets */}
          <Text 
            position={[1.5, buttonSpacing * 2, 0.07]} 
            fontSize={0.14}
            color="#FFFFFF"
            fontWeight="bold"
          >
            Cameras
          </Text>
          
          {/* Front View */}
          <group 
            position={[1.2, buttonSpacing * 3, 0]} 
            onClick={() => setCameraView('front')}
          >
            <RoundedBox args={[buttonSize * 0.7, buttonSize * 0.6, buttonSize/5]} radius={0.1}>
              <meshPhysicalMaterial
                color={buttonColor}
                roughness={0.4}
                metalness={0.1}
                transmission={0.7}
                opacity={0.9}
                transparent={true}
              />
            </RoundedBox>
            <Text 
              position={[0, 0, 0.07]} 
              fontSize={0.12}
              color="#FFFFFF"
            >
              Front
            </Text>
          </group>
          
          {/* Back View */}
          <group 
            position={[1.2 + buttonSize * 0.85, buttonSpacing * 3, 0]} 
            onClick={() => setCameraView('back')}
          >
            <RoundedBox args={[buttonSize * 0.7, buttonSize * 0.6, buttonSize/5]} radius={0.1}>
              <meshPhysicalMaterial
                color={buttonColor}
                roughness={0.4}
                metalness={0.1}
                transmission={0.7}
                opacity={0.9}
                transparent={true}
              />
            </RoundedBox>
            <Text 
              position={[0, 0, 0.07]} 
              fontSize={0.12}
              color="#FFFFFF"
            >
              Back
            </Text>
          </group>
          
          {/* Top View */}
          <group 
            position={[1.2, buttonSpacing * 4, 0]} 
            onClick={() => setCameraView('top')}
          >
            <RoundedBox args={[buttonSize * 0.7, buttonSize * 0.6, buttonSize/5]} radius={0.1}>
              <meshPhysicalMaterial
                color={buttonColor}
                roughness={0.4}
                metalness={0.1}
                transmission={0.7}
                opacity={0.9}
                transparent={true}
              />
            </RoundedBox>
            <Text 
              position={[0, 0, 0.07]} 
              fontSize={0.12}
              color="#FFFFFF"
            >
              Top
            </Text>
          </group>
          
          {/* Bottom View */}
          <group 
            position={[1.2 + buttonSize * 0.85, buttonSpacing * 4, 0]} 
            onClick={() => setCameraView('bottom')}
          >
            <RoundedBox args={[buttonSize * 0.7, buttonSize * 0.6, buttonSize/5]} radius={0.1}>
              <meshPhysicalMaterial
                color={buttonColor}
                roughness={0.4}
                metalness={0.1}
                transmission={0.7}
                opacity={0.9}
                transparent={true}
              />
            </RoundedBox>
            <Text 
              position={[0, 0, 0.07]} 
              fontSize={0.12}
              color="#FFFFFF"
            >
              Bottom
            </Text>
          </group>
          
          {/* Left View */}
          <group 
            position={[1.2, buttonSpacing * 5, 0]} 
            onClick={() => setCameraView('left')}
          >
            <RoundedBox args={[buttonSize * 0.7, buttonSize * 0.6, buttonSize/5]} radius={0.1}>
              <meshPhysicalMaterial
                color={buttonColor}
                roughness={0.4}
                metalness={0.1}
                transmission={0.7}
                opacity={0.9}
                transparent={true}
              />
            </RoundedBox>
            <Text 
              position={[0, 0, 0.07]} 
              fontSize={0.12}
              color="#FFFFFF"
            >
              Left
            </Text>
          </group>
          
          {/* Right View */}
          <group 
            position={[1.2 + buttonSize * 0.85, buttonSpacing * 5, 0]} 
            onClick={() => setCameraView('right')}
          >
            <RoundedBox args={[buttonSize * 0.7, buttonSize * 0.6, buttonSize/5]} radius={0.1}>
              <meshPhysicalMaterial
                color={buttonColor}
                roughness={0.4}
                metalness={0.1}
                transmission={0.7}
                opacity={0.9}
                transparent={true}
              />
            </RoundedBox>
            <Text 
              position={[0, 0, 0.07]} 
              fontSize={0.12}
              color="#FFFFFF"
            >
              Right
            </Text>
          </group>
          
          {/* Gesture Instructions */}
          <group position={[1.5, buttonSpacing * 6, 0]}>
            <Text 
              position={[0, 0, 0.07]} 
              fontSize={0.12}
              color="#AACCFF"
              fontWeight="bold"
            >
              Gestures:
            </Text>
            <Text 
              position={[0, -0.2, 0.07]} 
              fontSize={0.09}
              color="#AACCFF"
            >
              Option+Click → Rotate
            </Text>
            <Text 
              position={[0, -0.35, 0.07]} 
              fontSize={0.09}
              color="#AACCFF"
            >
              Two-Finger → Pan
            </Text>
            <Text 
              position={[0, -0.5, 0.07]} 
              fontSize={0.09}
              color="#AACCFF"
            >
              Pinch → Zoom
            </Text>
          </group>
        </>
      )}
    </group>
  );
} 