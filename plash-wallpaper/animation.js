// Warped Gradient Animation for Plash Wallpaper
// Disable pointer events so desktop icons remain clickable
document.body.style.pointerEvents = "none";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Renderer setup
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Shader material for warped gradient
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float time;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    // Add warping to vertices
    vec3 pos = position;
    pos.x += sin(position.y * 2.0 + time * 0.5) * 0.3;
    pos.y += cos(position.x * 2.0 + time * 0.3) * 0.3;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform vec2 resolution;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Smooth color interpolation
  vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);
    
    return a + b * cos(6.28318 * (c * t + d));
  }
  
  void main() {
    // Create animated UV coordinates
    vec2 uv = vUv;
    
    // Add multiple layers of warping
    float warp1 = sin(uv.x * 3.0 + time * 0.2) * cos(uv.y * 3.0 + time * 0.3);
    float warp2 = sin(uv.x * 5.0 - time * 0.15) * cos(uv.y * 5.0 - time * 0.25);
    float warp3 = sin(uv.x * 7.0 + time * 0.1) * cos(uv.y * 7.0 + time * 0.2);
    
    // Combine warps
    vec2 warpedUV = uv + vec2(warp1 * 0.1, warp2 * 0.1) + vec2(warp3 * 0.05);
    
    // Create gradient based on warped UV
    float gradient = length(warpedUV - 0.5);
    gradient += sin(time * 0.5) * 0.2;
    
    // Apply color palette
    vec3 color = palette(gradient + time * 0.1);
    
    // Add some depth variation
    color *= 0.7 + 0.3 * sin(vPosition.x * 2.0 + time);
    
    // Mix with dark blue/purple base color for Luma-like aesthetic
    vec3 baseColor = vec3(0.09, 0.09, 0.22); // Dark blue-purple
    color = mix(baseColor, color, 0.6);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Create plane geometry that covers the viewport
const geometry = new THREE.PlaneGeometry(10, 10, 32, 32);

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
  // Update camera
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  // Update renderer
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Update shader resolution
  material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
});

// Animation loop
let startTime = Date.now();
function animate() {
  requestAnimationFrame(animate);
  
  // Update time uniform
  const elapsedTime = (Date.now() - startTime) * 0.001;
  material.uniforms.time.value = elapsedTime;
  
  // Slowly rotate plane for extra effect
  plane.rotation.z = Math.sin(elapsedTime * 0.1) * 0.05;
  
  // Render
  renderer.render(scene, camera);
}

// Start animation
animate();
