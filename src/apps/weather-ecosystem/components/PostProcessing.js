/**
 * PostProcessing.js - Utility for Three.js post-processing effects
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

/**
 * Creates and configures an EffectComposer with post-processing effects
 */
export const createPostProcessing = (renderer, scene, camera, config = {}) => {
  // Create the effect composer
  const composer = new EffectComposer(renderer);
  
  // Add render pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  
  // Add bloom effect
  const bloomConfig = config.bloom || {};
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    bloomConfig.strength !== undefined ? bloomConfig.strength : 0.2,
    bloomConfig.radius !== undefined ? bloomConfig.radius : 0.4,
    bloomConfig.threshold !== undefined ? bloomConfig.threshold : 0.85
  );
  composer.addPass(bloomPass);
  
  // Add gamma correction for accurate colors
  const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
  composer.addPass(gammaCorrectionPass);
  
  // Handle window resize
  const handleResize = () => {
    composer.setSize(window.innerWidth, window.innerHeight);
  };
  
  window.addEventListener('resize', handleResize);
  
  // Add a cleanup method to the composer
  composer.dispose = () => {
    window.removeEventListener('resize', handleResize);
    composer.renderTarget1.dispose();
    composer.renderTarget2.dispose();
    bloomPass.dispose();
    renderPass.dispose();
    gammaCorrectionPass.dispose();
  };
  
  return composer;
};

/**
 * Updates bloom effect parameters
 */
export const updateBloomEffect = (bloomPass, params = {}) => {
  if (params.strength !== undefined) bloomPass.strength = params.strength;
  if (params.radius !== undefined) bloomPass.radius = params.radius;
  if (params.threshold !== undefined) bloomPass.threshold = params.threshold;
};

/**
 * Creates a subtle glow material for objects
 */
export const createGlowMaterial = (intensity = 0.5, color = '#ffffff') => {
  const glowColor = new THREE.Color(color);
  
  return new THREE.ShaderMaterial({
    uniforms: {
      'c': { value: intensity },
      'p': { value: 4.5 },
      glowColor: { value: glowColor },
      viewVector: { value: new THREE.Vector3(0, 0, 1) }
    },
    vertexShader: `
      uniform vec3 viewVector;
      uniform float c;
      uniform float p;
      varying float intensity;
      void main() {
        vec3 vNormal = normalize(normal);
        vec3 vNormel = normalize(viewVector);
        intensity = pow(c - dot(vNormal, vNormel), p);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying float intensity;
      void main() {
        vec3 glow = glowColor * intensity;
        gl_FragColor = vec4(glow, 1.0);
      }
    `,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  });
};

export default {
  createPostProcessing,
  updateBloomEffect,
  createGlowMaterial
}; 