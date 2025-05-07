uniform float time;
uniform float waveIntensity;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

// Sine wave animation for subtle surface distortion
vec3 applyWave(vec3 position, float intensity) {
  float waveX = sin(position.x * 10.0 + time * 0.5) * 0.015 * intensity;
  float waveY = sin(position.y * 8.0 + time * 0.4) * 0.018 * intensity;
  float waveZ = sin(position.z * 12.0 + time * 0.3) * 0.01 * intensity;
  
  return position + vec3(waveX, waveY, waveZ);
}

void main() {
  vUv = uv;
  vNormal = normalMatrix * normal;
  
  // Apply subtle wave animation to vertices
  vec3 pos = position;
  
  // Only apply waves if intensity > 0
  if (waveIntensity > 0.0) {
    pos = applyWave(pos, waveIntensity);
  }
  
  // Update normals for disturbed surface
  vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
  vec3 bitangent = normalize(cross(normal, tangent));
  
  // Calculate new normal for disturbed surface (simplified)
  if (waveIntensity > 0.0) {
    float waveStrength = waveIntensity * 0.2;
    vNormal += tangent * sin(uv.x * 20.0 + time) * waveStrength;
    vNormal += bitangent * sin(uv.y * 20.0 + time * 1.1) * waveStrength;
    vNormal = normalize(vNormal);
  }
  
  vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
  vec4 mvPosition = viewMatrix * worldPosition;
  
  vPosition = pos;
  vWorldPosition = worldPosition.xyz;
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
} 