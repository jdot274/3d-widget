import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import useMaterialStore from '../store/useMaterialStore';

// Default shaders
const DEFAULT_VERTEX_SHADER = `
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

const DEFAULT_FRAGMENT_SHADER = `
uniform vec3 color;
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Simple color with normal shading
  vec3 light = normalize(vec3(1.0, 1.0, 1.0));
  float intensity = dot(vNormal, light) * 0.5 + 0.5;
  vec3 finalColor = color * intensity;
  
  // Add time-based effects
  float pulse = sin(time * 2.0) * 0.5 + 0.5;
  finalColor += color * pulse * 0.2 * (1.0 - vUv.y);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// Preset shaders
const SHADER_PRESETS = {
  'Glass': {
    name: 'Glass',
    vertex: DEFAULT_VERTEX_SHADER,
    fragment: `
uniform vec3 color;
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Fresnel effect for glass
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnelTerm = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
  
  // Base glass color
  vec3 baseColor = color;
  
  // Add refraction-like distortion based on normals
  float distortion = sin(vUv.x * 10.0 + time) * 0.05;
  
  // Combine for final glass effect
  vec3 finalColor = mix(baseColor, vec3(1.0), fresnelTerm * 0.7);
  finalColor += vec3(0.1, 0.2, 0.3) * distortion;
  
  gl_FragColor = vec4(finalColor, 0.85);
}
    `
  },
  'Metal': {
    name: 'Metal',
    vertex: DEFAULT_VERTEX_SHADER,
    fragment: `
uniform vec3 color;
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  // Metallic reflection approximation
  vec3 light = normalize(vec3(cos(time * 0.5), 1.0, sin(time * 0.5)));
  float specular = pow(max(0.0, dot(reflect(-light, vNormal), vec3(0.0, 0.0, 1.0))), 30.0);
  
  vec3 baseColor = color * 0.8;
  vec3 finalColor = baseColor + specular * vec3(1.0);
  
  // Add subtle noise pattern
  float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
  finalColor *= 0.9 + noise * 0.1;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
    `
  },
  'Glow': {
    name: 'Glow',
    vertex: DEFAULT_VERTEX_SHADER,
    fragment: `
uniform vec3 color;
uniform float time;
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  // Pulsating glow effect
  float pulse = sin(time * 3.0) * 0.5 + 0.5;
  
  // Edge glow (brighter at edges)
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);
  
  vec3 glowColor = color * (0.8 + pulse * 0.5);
  glowColor += color * fresnel * 0.7;
  
  gl_FragColor = vec4(glowColor, 0.9);
}
    `
  },
  'Gradient': {
    name: 'Gradient',
    vertex: DEFAULT_VERTEX_SHADER,
    fragment: `
uniform vec3 color;
uniform float time;
varying vec2 vUv;

void main() {
  // Animated gradient
  vec3 color1 = color;
  vec3 color2 = vec3(color.b, color.r, color.g); // Color shift
  
  float t = (sin(time * 0.5) * 0.5 + 0.5) * 0.3 + vUv.y;
  vec3 gradientColor = mix(color1, color2, t);
  
  gl_FragColor = vec4(gradientColor, 1.0);
}
    `
  }
};

export default function ShaderEditor() {
  const getCurrentMaterialValues = useMaterialStore(state => state.getCurrentMaterialValues);
  const updateMaterialProperty = useMaterialStore(state => state.updateMaterialProperty);
  
  const materialValues = getCurrentMaterialValues();

  const [vertexShader, setVertexShader] = useState(DEFAULT_VERTEX_SHADER);
  const [fragmentShader, setFragmentShader] = useState(DEFAULT_FRAGMENT_SHADER);
  const [activeTab, setActiveTab] = useState('vertex');
  const [currentPreset, setCurrentPreset] = useState('custom');

  useEffect(() => {
    if (materialValues.vertexShader) {
      setVertexShader(materialValues.vertexShader);
    }
    if (materialValues.fragmentShader) {
      setFragmentShader(materialValues.fragmentShader);
    }
  }, [materialValues]);

  const handleShaderChange = (newCode) => {
    if (activeTab === 'vertex') {
      setVertexShader(newCode);
      updateMaterialProperty('vertexShader', newCode);
    } else {
      setFragmentShader(newCode);
      updateMaterialProperty('fragmentShader', newCode);
    }
  };

  const applyPreset = (presetName) => {
    if (SHADER_PRESETS[presetName]) {
      const preset = SHADER_PRESETS[presetName];
      setVertexShader(preset.vertex);
      setFragmentShader(preset.fragment);
      updateMaterialProperty('vertexShader', preset.vertex);
      updateMaterialProperty('fragmentShader', preset.fragment);
      setCurrentPreset(presetName);
    }
  };

  return (
    <Box w="100%" h="400px" borderRadius="md" overflow="hidden" boxShadow="md">
      {/* Editor Tabs */}
      <Flex bg={'gray.100'} p={2}>
        <Button 
          variant={activeTab === 'vertex' ? 'solid' : 'ghost'} 
          size="sm" 
          mr={2}
          onClick={() => setActiveTab('vertex')}
        >
          Vertex Shader
        </Button>
        <Button 
          variant={activeTab === 'fragment' ? 'solid' : 'ghost'} 
          size="sm" 
          mr={2}
          onClick={() => setActiveTab('fragment')}
        >
          Fragment Shader
        </Button>
        
        {/* Preset selector */}
        <Box ml="auto">
          <Text fontSize="sm" display="inline-block" mr={2}>Presets:</Text>
          {Object.keys(SHADER_PRESETS).map(preset => (
            <Button
              key={preset}
              size="xs"
              variant={currentPreset === preset ? 'solid' : 'outline'}
              ml={1}
              onClick={() => applyPreset(preset)}
            >
              {SHADER_PRESETS[preset].name}
            </Button>
          ))}
        </Box>
      </Flex>
      
      {/* Code Editor */}
      <Editor
        height="350px"
        language="glsl"
        theme={'light'}
        value={activeTab === 'vertex' ? vertexShader : fragmentShader}
        onChange={handleShaderChange}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </Box>
  );
} 