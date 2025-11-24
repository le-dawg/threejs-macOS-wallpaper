// Luma-inspired Starburst Warp Animation for Plash Wallpaper
// Based on the actual Luma.com THREE.js implementation
import * as THREE from 'three';

// Disable pointer events so desktop icons remain clickable
document.body.style.pointerEvents = "none";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2;

// Renderer setup
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: false
});
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Starburst configuration (from Luma)
const config = {
  count: 350,
  boundingBox: new THREE.Vector3(10, 10, 80),
  geometryMinSize: 0.025,
  geometryMaxSize: 0.05,
  geometryMinDepth: 2,
  geometryMaxDepth: 5,
  globalSpeed: 5,
  trail: 1,
  glowIntensity: 2,
  brightness: 1,
  color: 0xff6b35, // Orange-red
  useGradient: true,
  colorGradient: 0x4169e1 // Royal blue
};

// Create shader material (based on Luma's implementation)
const vertexShader = `
attribute vec4 randomScale;
attribute vec4 randomVertex;
attribute vec4 randomSimulation;
attribute vec4 randomFragment;

uniform float uTime;
uniform vec3 uBoundingBox;
uniform vec3 uGeometryMinScale;
uniform vec3 uGeometryMaxScale;

varying vec2 vUv;
varying vec4 vRandom;
varying float vLife;
varying vec3 vColor;
varying float vScaleGrad;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float cmap(float value, float min1, float max1, float min2, float max2) {
  return clamp(map(value, min1, max1, min2, max2), min2, max2);
}

float easeInOutQuad(float x) {
  float inValue = 2.0 * x * x;
  float outValue = 1.0 - pow(-2.0 * x + 2.0, 2.0) / 2.0;
  return x < 0.5 ? inValue : outValue;
}

void main() {
  vec3 localPos = position * mix(uGeometryMinScale, uGeometryMaxScale, randomScale.xxz);
  vec3 pos = randomVertex.xyz * uBoundingBox;
  
  vScaleGrad = position.z + 0.5;
  
  // Time with variation per particle
  float time = uTime * 0.1 * (randomSimulation.x + 0.5);
  time += randomVertex.z;
  
  float life = easeInOutQuad(mod(time, 1.0));
  vLife = life;
  
  // Move from back to front
  pos.z = cmap(life, 0.0, 1.0, -uBoundingBox.z, 20.0);
  pos += localPos;
  
  vUv = uv;
  vRandom = randomFragment;
  
  vec4 worldPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * worldPosition;
}
`;

const fragmentShader = `
uniform vec3 uColor;
uniform vec3 uColorGradient;
uniform float uGlobalAlpha;
uniform float uTrail;
uniform float uGlowIntensity;
uniform float uBrightness;

varying vec2 vUv;
varying vec4 vRandom;
varying float vLife;
varying vec3 vColor;
varying float vScaleGrad;

void main() {
  // Create elongated shape for trail effect
  vec2 uv = vUv * 2.0 - 1.0;
  float dist = length(uv * vec2(1.0, uTrail));
  
  // Glow effect
  float alpha = smoothstep(1.0, 0.0, dist);
  alpha = pow(alpha, uGlowIntensity);
  
  // Life-based alpha (fade in/out)
  float lifeAlpha = smoothstep(0.0, 0.1, vLife) * smoothstep(1.0, 0.9, vLife);
  alpha *= lifeAlpha * uGlobalAlpha;
  
  // Color gradient based on life
  vec3 color = mix(uColor, uColorGradient, vScaleGrad);
  color *= uBrightness;
  
  // Add chromatic aberration hint
  color += vec3(vRandom.x * 0.2, vRandom.y * 0.1, vRandom.z * 0.2);
  
  gl_FragColor = vec4(color, alpha);
}
`;

// Create instanced geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Add random attributes for each instance
const randomScale = [];
const randomVertex = [];
const randomSimulation = [];
const randomFragment = [];

for (let i = 0; i < config.count; i++) {
  // Random scale factors
  randomScale.push(Math.random(), Math.random(), Math.random(), Math.random());
  
  // Random position in sphere
  randomVertex.push(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random()
  );
  
  // Random simulation params
  randomSimulation.push(Math.random(), Math.random(), Math.random(), Math.random());
  
  // Random fragment colors
  randomFragment.push(Math.random(), Math.random(), Math.random(), Math.random());
}

geometry.setAttribute('randomScale', new THREE.InstancedBufferAttribute(new Float32Array(randomScale), 4));
geometry.setAttribute('randomVertex', new THREE.InstancedBufferAttribute(new Float32Array(randomVertex), 4));
geometry.setAttribute('randomSimulation', new THREE.InstancedBufferAttribute(new Float32Array(randomSimulation), 4));
geometry.setAttribute('randomFragment', new THREE.InstancedBufferAttribute(new Float32Array(randomFragment), 4));

// Create shader material
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uColor: { value: new THREE.Color(config.color) },
    uColorGradient: { value: new THREE.Color(config.colorGradient) },
    uGlobalAlpha: { value: 1.0 },
    uTime: { value: 0 },
    uBoundingBox: { value: config.boundingBox },
    uTrail: { value: config.trail },
    uGlowIntensity: { value: config.glowIntensity },
    uBrightness: { value: config.brightness },
    uGeometryMinScale: { value: new THREE.Vector3(config.geometryMinSize, config.geometryMinSize, config.geometryMinDepth) },
    uGeometryMaxScale: { value: new THREE.Vector3(config.geometryMaxSize, config.geometryMaxSize, config.geometryMaxDepth) }
  },
  transparent: true,
  depthTest: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

// Create instanced mesh
const mesh = new THREE.InstancedMesh(geometry, material, config.count);
scene.add(mesh);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animation loop
let time = 0;
function animate() {
  requestAnimationFrame(animate);
  
  // Update time uniform
  time += 0.01 * config.globalSpeed;
  material.uniforms.uTime.value = time;
  
  // Render scene
  renderer.render(scene, camera);
}

// Start animation
animate();
