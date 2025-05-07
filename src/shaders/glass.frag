uniform vec3 color;
uniform float opacity;
uniform float time;
uniform float roughness;
uniform float transmission;
uniform float metalness;
uniform float clearcoat;
uniform float ior;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;

#define PI 3.14159265359
#define saturate(a) clamp(a, 0.0, 1.0)

// Enhanced Fresnel effect for stronger edge highlighting
float fresnel(vec3 normal, vec3 viewDir, float power) {
  float fresnelTerm = pow(1.0 - saturate(dot(normal, viewDir)), power);
  // Boost the fresnel effect to make edges more visible
  return fresnelTerm * 1.5;
}

// More pronounced surface imperfections
float surfaceNoise(vec2 p) {
  float n = sin(p.x * 10.0) * sin(p.y * 10.0);
  n += 0.5 * sin(p.x * 20.0) * sin(p.y * 20.0 + time * 0.1);
  n += 0.25 * sin(p.x * 40.0) * sin(p.y * 40.0 + time * 0.2);
  // Amplify the noise
  return n * 0.7 + 0.5;
}

// Stronger caustics effect
vec3 caustics(vec2 uv) {
  vec2 p = uv * 10.0;
  float t = time * 0.2;
  
  // Generate complex wave patterns
  float noise = 0.0;
  noise += 1.0 * sin(p.x * 0.5 + t) * sin(p.y * 0.5 + t * 0.7);
  noise += 0.5 * sin(p.x * 1.0 + t * 1.3) * sin(p.y * 1.2 + t * 0.9);
  noise += 0.25 * sin(p.x * 2.0 + t * 0.8) * sin(p.y * 2.5 + t * 1.2);
  noise = saturate(noise * 0.5 + 0.5);
  
  // Create more vibrant caustics color
  vec3 causticColor = mix(
    vec3(0.6, 0.9, 1.0), // Bright blue
    vec3(1.0, 1.0, 1.0), // White
    pow(noise, 2.0)
  );
  
  // Increase caustics intensity
  return causticColor * pow(noise, 4.0) * 0.8;
}

// Add a pulsing glow effect
float pulseGlow(float time) {
  return 0.5 + 0.5 * sin(time * 0.5);
}

void main() {
  // Normalized values
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(-vViewPosition);
  
  // Calculate enhanced fresnel factor for edges
  float fresnelFactor = fresnel(normal, viewDir, 3.0);
  
  // Surface imperfections affect roughness
  float imperfection = surfaceNoise(vUv);
  float adjustedRoughness = roughness + (imperfection - 0.5) * 0.05;
  
  // Glass color with stronger fresnel-based edge highlighting
  vec3 glassColor = mix(color, vec3(1.0), fresnelFactor * 0.7);
  
  // Add pulsing effect to the base color
  float pulse = pulseGlow(time);
  glassColor = mix(glassColor, glassColor * 1.2, pulse * 0.2);
  
  // Add stronger caustics effect
  vec3 causticEffect = caustics(vUv) * (1.0 - metalness) * transmission * 1.5;
  vec3 finalColor = glassColor + causticEffect;
  
  // Enhanced IOR-based reflections
  float reflectionStrength = mix(0.2, 0.5, metalness) + (ior - 1.0) * 0.15;
  finalColor = mix(finalColor, vec3(1.0) * fresnelFactor, reflectionStrength);
  
  // Boost overall colors for more visibility
  finalColor *= 1.2;
  
  // Adjust opacity based on transmission and fresnel - boost the opacity
  float finalOpacity = mix(opacity, 1.0, fresnelFactor * 0.7);
  finalOpacity = min(finalOpacity, 1.0);
  
  // Output color with enhanced glass effects
  gl_FragColor = vec4(finalColor, finalOpacity);
} 