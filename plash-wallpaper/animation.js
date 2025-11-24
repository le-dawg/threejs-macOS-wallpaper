// Starfield Warp Speed Animation for Plash Wallpaper (Luma-style)
import * as THREE from 'three';

// Disable pointer events so desktop icons remain clickable
document.body.style.pointerEvents = "none";

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.z = 1;

// Renderer setup with dark background
const canvas = document.getElementById('bg');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: false
});
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Starfield parameters
const starCount = 8000;
const starSpeed = 2.5;
const starSpread = 800;

// Create star line geometry for streak effect
class Star {
  constructor() {
    this.reset();
  }
  
  reset() {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const radius = Math.random() * starSpread;
    
    this.x = radius * Math.sin(phi) * Math.cos(theta);
    this.y = radius * Math.sin(phi) * Math.sin(theta);
    this.z = radius * Math.cos(phi) - starSpread;
    this.velocity = Math.random() * 1.5 + 0.5;
    
    // Color variation - mostly blue/white with some orange
    const colorType = Math.random();
    if (colorType < 0.5) {
      // Blue stars
      this.r = 0.4 + Math.random() * 0.3;
      this.g = 0.7 + Math.random() * 0.3;
      this.b = 1.0;
    } else if (colorType < 0.85) {
      // White stars
      const brightness = 0.7 + Math.random() * 0.3;
      this.r = brightness;
      this.g = brightness;
      this.b = brightness;
    } else {
      // Orange/yellow stars (chromatic aberration effect)
      this.r = 1.0;
      this.g = 0.6 + Math.random() * 0.4;
      this.b = 0.2 + Math.random() * 0.3;
    }
  }
  
  update(speed) {
    this.z += speed * this.velocity;
    
    // Reset star when it passes camera
    if (this.z > camera.position.z + 50) {
      this.reset();
    }
  }
}

// Create stars array
const stars = [];
for (let i = 0; i < starCount; i++) {
  stars.push(new Star());
}

// Create line segments for star trails
const lineGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(starCount * 6); // 2 vertices per line
const colors = new Float32Array(starCount * 6); // 2 colors per line

lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
lineGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Material for lines with additive blending for glow effect
const lineMaterial = new THREE.LineBasicMaterial({
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const starLines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(starLines);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animation loop with cached references
const positionsArray = lineGeometry.attributes.position.array;
const colorsArray = lineGeometry.attributes.color.array;

function animate() {
  requestAnimationFrame(animate);
  
  // Update each star
  for (let i = 0; i < starCount; i++) {
    const star = stars[i];
    star.update(starSpeed);
    
    // Calculate streak length based on z position (closer = longer streak)
    const streakLength = Math.max(5, 30 * star.velocity * (1 + star.z / starSpread));
    
    // Front point (current position)
    const i6 = i * 6;
    positionsArray[i6] = star.x;
    positionsArray[i6 + 1] = star.y;
    positionsArray[i6 + 2] = star.z;
    
    // Back point (trail)
    positionsArray[i6 + 3] = star.x;
    positionsArray[i6 + 4] = star.y;
    positionsArray[i6 + 5] = star.z - streakLength;
    
    // Color for front point (bright)
    colorsArray[i6] = star.r;
    colorsArray[i6 + 1] = star.g;
    colorsArray[i6 + 2] = star.b;
    
    // Color for back point (dim/fade out)
    colorsArray[i6 + 3] = star.r * 0.2;
    colorsArray[i6 + 4] = star.g * 0.2;
    colorsArray[i6 + 5] = star.b * 0.2;
  }
  
  lineGeometry.attributes.position.needsUpdate = true;
  lineGeometry.attributes.color.needsUpdate = true;
  
  // Render scene
  renderer.render(scene, camera);
}

// Start animation
animate();
