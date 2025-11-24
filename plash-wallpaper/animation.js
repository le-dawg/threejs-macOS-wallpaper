// Luma-Inspired Gradient Mesh Animation for Plash Wallpaper
import * as THREE from 'three';

// Disable pointer events so desktop icons remain clickable
document.body.style.pointerEvents = "none";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  -1, 1, 1, -1, 0.1, 10
);
camera.position.z = 1;

// Renderer setup
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: false
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Shared Simplex noise function for GLSL
const simplexNoiseGLSL = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

// Luma-style gradient mesh shader
const vertexShader = `
  varying vec2 vUv;
  uniform float time;
  
  ${simplexNoiseGLSL}
  
  void main() {
    vUv = uv;
    
    // Create organic mesh warping using noise
    vec3 pos = position;
    float noiseFreq = 1.5;
    float noiseAmp = 0.15;
    vec3 noisePos = vec3(pos.x * noiseFreq + time * 0.1, pos.y * noiseFreq, time * 0.2);
    pos.z += snoise(noisePos.xy) * noiseAmp;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Gradient color stops for multi-stop gradient
const color1 = [0.05, 0.05, 0.15];  // Deep blue-black
const color2 = [0.15, 0.08, 0.25];  // Deep purple
const color3 = [0.3, 0.15, 0.4];    // Purple
const color4 = [0.5, 0.25, 0.35];   // Purple-pink
const color5 = [0.8, 0.5, 0.3];     // Orange-gold

const fragmentShader = `
  uniform float time;
  uniform vec2 resolution;
  varying vec2 vUv;
  
  ${simplexNoiseGLSL}
  
  void main() {
    vec2 uv = vUv;
    
    // Create flowing noise-based distortion
    float noise1 = snoise(uv * 2.0 + time * 0.1);
    float noise2 = snoise(uv * 3.0 - time * 0.15);
    
    // Distort UV coordinates
    vec2 distortedUv = uv + vec2(noise1, noise2) * 0.03;
    
    // Create radial gradient from center
    vec2 center = vec2(0.5, 0.5);
    float dist = length(distortedUv - center);
    
    // Add time-based animation to gradient
    float gradient = dist + sin(time * 0.3) * 0.1;
    gradient += noise1 * 0.1;
    
    // Luma-inspired color palette: deep blue to purple to orange
    vec3 color1 = vec3(${color1[0]}, ${color1[1]}, ${color1[2]});
    vec3 color2 = vec3(${color2[0]}, ${color2[1]}, ${color2[2]});
    vec3 color3 = vec3(${color3[0]}, ${color3[1]}, ${color3[2]});
    vec3 color4 = vec3(${color4[0]}, ${color4[1]}, ${color4[2]});
    vec3 color5 = vec3(${color5[0]}, ${color5[1]}, ${color5[2]});
    
    // Multi-stop gradient mixing
    vec3 color;
    float t = smoothstep(0.0, 1.5, gradient);
    
    if (t < 0.25) {
      color = mix(color1, color2, t * 4.0);
    } else if (t < 0.5) {
      color = mix(color2, color3, (t - 0.25) * 4.0);
    } else if (t < 0.75) {
      color = mix(color3, color4, (t - 0.5) * 4.0);
    } else {
      color = mix(color4, color5, (t - 0.75) * 4.0);
    }
    
    // Add subtle noise variation for texture
    color += vec3(noise2 * 0.02);
    
    // Subtle vignette effect
    float vignette = smoothstep(0.8, 0.2, dist);
    color *= 0.7 + 0.3 * vignette;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Adaptive mesh subdivision based on device performance
const getOptimalSubdivisions = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  
  if (isMobile || isLowEnd) {
    return 64; // Lower subdivision for mobile/low-end devices
  }
  return 96; // Balanced subdivision for most devices
};

// Create plane geometry with adaptive subdivision
const subdivisions = getOptimalSubdivisions();
const geometry = new THREE.PlaneGeometry(2, 2, subdivisions, subdivisions);

// Create shader material
const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  },
  side: THREE.DoubleSide
});

// Create mesh and add to scene
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// Handle window resize
window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = -aspect;
  camera.right = aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
});

// Set initial aspect ratio
const aspect = window.innerWidth / window.innerHeight;
camera.left = -aspect;
camera.right = aspect;
camera.updateProjectionMatrix();

// Animation loop
let startTime = Date.now();
function animate() {
  requestAnimationFrame(animate);
  
  // Update time uniform for smooth animation
  const elapsedTime = (Date.now() - startTime) * 0.001;
  material.uniforms.time.value = elapsedTime;
  
  // Render scene
  renderer.render(scene, camera);
}

// Start animation
animate();
