import * as THREE from "https://esm.sh/three";
import { EffectComposer } from "https://esm.sh/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://esm.sh/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://esm.sh/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "https://esm.sh/three/examples/jsm/postprocessing/ShaderPass.js";

const colors = {
  deepColor: new THREE.Color(0x01071f),
  baseColor: new THREE.Color(0x0a2550),
  mainColor: new THREE.Color(0x1a65ff),
  accentColor: new THREE.Color(0x66ccff),
  highlightColor: new THREE.Color(0xaaddff)
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000810);
document.getElementById('container').appendChild(renderer.domElement);

const settings = {
  electricIntensity: 0.7,
  arcFrequency: 0.65,
  glowStrength: 0.6,
  enableLightning: true,
  enableChainLightning: true
};

function updateSliderValues() {
  document.getElementById('electric-value').textContent = `${Math.round(settings.electricIntensity * 100)}%`;
  document.getElementById('arc-value').textContent = `${Math.round(settings.arcFrequency * 100)}%`;
  document.getElementById('glow-value').textContent = `${Math.round(settings.glowStrength * 100)}%`;
}

document.getElementById('electricIntensity').addEventListener('input', function() {
  settings.electricIntensity = this.value / 100;
  updateSliderValues();
});

document.getElementById('arcFrequency').addEventListener('input', function() {
  settings.arcFrequency = this.value / 100;
  updateSliderValues();
});

document.getElementById('glowStrength').addEventListener('input', function() {
  settings.glowStrength = this.value / 100;
  updateSliderValues();
  bloomPass.strength = 0.7 + settings.glowStrength * 0.8;
});

const mouse = new THREE.Vector2();
const targetRotation = new THREE.Vector2();
const currentRotation = new THREE.Vector2();
let mouseSpeed = new THREE.Vector2();
let lastMousePosition = new THREE.Vector2();
let mouseInfluence = 0;

const noiseHelperFunctions = `
  float hash(float n) {
    return fract(sin(n) * 43758.5453);
  }
  
  float hash3D(vec3 p) {
    p  = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  
  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = p.x + p.y * 57.0 + p.z * 113.0;
    float res = mix(mix(mix(hash(n), hash(n + 1.0), f.x),
                        mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                    mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                        mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
    return res;
  }
  
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    
    return value;
  }
  
  float fbm_improved(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    vec3 warp = vec3(
        fbm(p + vec3(0.0, 23.4, 12.7)),
        fbm(p + vec3(41.2, 0.0, 89.3)),
        fbm(p + vec3(16.8, 33.5, 0.0))
    ) * 0.3;
    
    p += warp;
    
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.1;
      amplitude *= 0.5;
      
      p = vec3(
        p.y + p.z, 
        p.z - p.x, 
        p.x + p.y
      ) * 0.7;
    }
    
    return value;
  }
  
  float voronoi(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    float minDist = 1.0;
    
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        for (int z = -1; z <= 1; z++) {
          vec3 neighbor = vec3(float(x), float(y), float(z));
          vec3 point = neighbor + hash3D(i + neighbor) - f;
          float dist = length(point);
          minDist = min(minDist, dist);
        }
      }
    }
    
    return minDist;
  }
`;

const electricVertexShader = `
  uniform float time;
  uniform vec2 mouse;
  uniform float mouseInfluence;
  uniform float electricIntensity;
  uniform float arcFrequency;
  uniform vec3 themeColors[5]; 
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vIntensity;
  varying float vDistFromMouse;
  varying vec2 vUv;
  
  ${noiseHelperFunctions}
  
  void main() {
    vec3 pos = position;
    vNormal = normal;
    vUv = uv;
    
    float wave = sin(position.x * 2.0 + time * 1.5) * cos(position.y * 2.0 + time * 1.2) * sin(position.z * 2.0 + time) * 0.4 +
                 sin(position.x * 3.0 - time * 1.6) * cos(position.y * 3.0 - time * 1.3) * sin(position.z * 3.0 - time * 0.9) * 0.3;
    
    wave += sin(position.x * 8.0 + time * 3.0) * cos(position.y * 7.0 + time * 2.5) * sin(position.z * 9.0 + time * 3.5) * 0.1;
    
    wave += fbm_improved(vec3(
      position.x * 2.5 + time * 0.7,
      position.y * 2.5 - time * 0.8, 
      position.z * 2.5 + time * 0.6
    )) * 0.15;
    
    float arcNoise = fbm(vec3(
      position.x * 5.0 + time * 3.0, 
      position.y * 5.0 + time * 2.0, 
      position.z * 5.0 + time * 4.0
    ));
    
    float voronoiPattern = voronoi(vec3(
      position.x * 4.0 + time * 1.0,
      position.y * 4.0 - time * 1.2,
      position.z * 4.0 + time * 0.9
    ));
    
    arcNoise = mix(arcNoise, 1.0 - voronoiPattern, 0.4);
    
    float electricDistortion = fbm_improved(vec3(
      position.x * 3.0 - time * 2.0,
      position.y * 4.0 + time * 1.5, 
      position.z * 3.0 - time * 1.8
    ));
    
    float arcEffect = 0.0;
    float arcThreshold = mix(0.65, 0.55, arcFrequency * 0.5); 
    
    if (arcNoise > arcThreshold) {
      float arcStrength = smoothstep(arcThreshold, arcThreshold + 0.2, arcNoise);
      arcEffect = arcStrength * arcFrequency * 2.0;
    }
    
    float jumpThreshold = 0.97 - arcFrequency * 0.3;
    float jumpChance = hash(floor(time * 10.0) + length(position) * 20.0); 
    
    if (jumpChance > jumpThreshold) {
      float jumpStrength = (jumpChance - jumpThreshold) / (1.0 - jumpThreshold);
      arcEffect += jumpStrength * arcFrequency * 2.0;
    }
    
    vec3 mousePos = vec3(mouse.x, mouse.y, 0.0) * 5.0;
    float dist = length(pos - mousePos);
    vDistFromMouse = dist;
    
    float rippleSpeed = 15.0;
    float ripple1 = sin(dist * 3.0 - time * rippleSpeed) * mouseInfluence;
    float ripple2 = sin(dist * 6.0 - time * (rippleSpeed * 1.2)) * mouseInfluence * 0.6;
    float ripple3 = sin(dist * 9.0 - time * (rippleSpeed * 0.8)) * mouseInfluence * 0.3;
    
    float falloff = smoothstep(5.0, 0.2, dist);
    float combinedRipple = (ripple1 + ripple2 + ripple3) * falloff;
    
    vec3 pullDir = normalize(mousePos - pos);
    float pullStrength = mouseInfluence * smoothstep(4.0, 0.0, dist) * 0.7;
    
    if (mouseInfluence > 0.5 && dist < 1.5) {
      float snap = (sin(time * 30.0 + position.x * 20.0) * 0.5 + 0.5) * 0.08 * mouseInfluence;
      pullStrength += snap * (1.0 - dist / 1.5); 
    }
    
    pos += normal * (wave * 0.2 * electricIntensity);
    pos += normal * (arcEffect * 0.5 * electricIntensity); 
    pos += normal * (electricDistortion * 0.15 * electricIntensity);
    
    float additionalNoise = fbm(vec3(
      position.x * 6.0 + time * 2.5,
      position.y * 6.0 - time * 3.0, 
      position.z * 6.0 + time * 2.0
    )) * 0.08 * electricIntensity;
    
    pos += normal * additionalNoise;
    pos += normal * (combinedRipple * 0.8);
    pos += pullDir * pullStrength;
    
    vIntensity = wave * 0.5 + 0.5 + arcEffect * 2.5 + abs(combinedRipple) + electricDistortion * 0.5;
    
    vIntensity += sin(time * 2.0) * 0.1 * electricIntensity;
    
    vPosition = pos;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const electricFragmentShader = `
  uniform float time;
  uniform float mouseInfluence;
  uniform float electricIntensity;
  uniform float glowStrength;
  uniform float arcFrequency;
  uniform vec3 themeColors[5]; 
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vIntensity;
  varying float vDistFromMouse;
  varying vec2 vUv;
  
  ${noiseHelperFunctions}
  
  void main() {
    vec3 deepColor = themeColors[0];
    vec3 baseColor = themeColors[1];
    vec3 mainColor = themeColors[2];
    vec3 accentColor = themeColors[3];
    vec3 highlightColor = themeColors[4];
    
    float t1 = sin(time * 0.7) * 0.5 + 0.5;
    float t2 = sin(time * 0.5 + 1.5) * 0.5 + 0.5;
    float t3 = sin(time * 1.3 + 0.7) * 0.5 + 0.5;
    
    float noisePattern = fbm_improved(vec3(
      vPosition.x * 3.0 + time * 1.0,
      vPosition.y * 3.0 - time * 0.7, 
      vPosition.z * 3.0 + time * 1.2
    ));
    
    float pulse = sin(time * 3.0 + vPosition.x * 0.5) * 0.5 + 0.5;
    float fastPulse = sin(time * 15.0 + vPosition.y * 0.8) * 0.5 + 0.5;
    
    float arcSpeed1 = 8.0;
    float arcSpeed2 = 12.0;
    float arcTravel1 = sin(vPosition.x * 12.0 + vPosition.y * 12.0 + time * arcSpeed1);
    float arcTravel2 = sin(vPosition.y * 8.0 + vPosition.z * 8.0 + time * (arcSpeed1 * 0.7));
    float arcTravel3 = sin(vPosition.x * 6.0 + vPosition.z * 10.0 + time * arcSpeed2);
    
    float branchPattern = voronoi(vec3(
      vPosition.x * 5.0 + time * 2.0,
      vPosition.y * 5.0 - time * 1.5,
      vPosition.z * 5.0 + time * 2.5
    ));
    
    float arc1 = smoothstep(0.7, 0.9, arcTravel1) * smoothstep(0.9, 0.7, arcTravel1);
    float arc2 = smoothstep(0.6, 0.8, arcTravel2) * smoothstep(0.8, 0.6, arcTravel2);
    float arc3 = smoothstep(0.75, 0.85, arcTravel3) * smoothstep(0.85, 0.75, arcTravel3);
    
    float arcMix = max(max(arc1, arc2), arc3);
    float arc = mix(arcMix, 1.0 - branchPattern, 0.3) * electricIntensity * arcFrequency * 2.0;
    
    float nodeEffect = 0.0;
    vec3 normPos = normalize(vPosition);
    float xFactor = abs(normPos.x);
    float yFactor = abs(normPos.y);
    float zFactor = abs(normPos.z);
    
    float nodeFactor = voronoi(vPosition * 5.0 + time * 0.5);
    
    if ((xFactor > 0.95 || yFactor > 0.95 || zFactor > 0.95) && 
        nodeFactor < 0.3 && hash3D(floor(vPosition * 12.0)) > 0.5) {
      float nodePulse = sin(time * 5.0 + hash(length(vPosition)) * 10.0) * 0.5 + 0.5;
      nodeEffect = nodePulse * arcFrequency * 0.8;
    }
    
    float spark = 0.0;
    float sparkThreshold = 0.98 - arcFrequency * 0.25;
    
    if (hash(floor(time * 20.0) + vPosition.x * 17.0 + vPosition.y * 9.0) > sparkThreshold) {
      spark = (0.7 + hash(vPosition.z + time) * 0.3) * electricIntensity;
      
      float sparkShape = hash(vPosition.y * 32.0 + time * 5.0); 
      spark *= smoothstep(0.0, 0.3, sparkShape);
    }
    
    vec3 baseColorMix = mix(deepColor, baseColor, noisePattern * 0.7 + 0.3);
    baseColorMix = mix(baseColorMix, mainColor, t1 * 0.5 * electricIntensity);
    
    float energyFlow = fbm_improved(vec3(
      vPosition.x * 2.0 - time * 2.0,
      vPosition.y * 2.0 + time * 1.0, 
      vPosition.z * 2.0 - time * 1.5
    ));
    
    baseColorMix = mix(baseColorMix, mainColor, energyFlow * 0.4 * electricIntensity);
    
    float arcWidth = (0.7 + sin(time * 3.0 + vPosition.x * 5.0) * 0.3);
    vec3 arcColor = mix(mainColor, accentColor, arcWidth * t2);
    arcColor = mix(arcColor, highlightColor, arc * t3 * 0.7);
    
    float arcVariation = fbm(vec3(
      vPosition.x * 4.0 + time * 1.5,
      vPosition.y * 4.0 - time * 2.0,
      vPosition.z * 4.0 + time * 1.0
    ));
    
    arcColor = mix(arcColor, accentColor, arcVariation * 0.4);
    
    vec3 finalColor = mix(baseColorMix, arcColor, arc * arcWidth * 0.9);
    
    vec3 nodeColor = mix(accentColor, highlightColor, fastPulse);
    finalColor = mix(finalColor, nodeColor, nodeEffect);
    finalColor = mix(finalColor, highlightColor, nodeEffect * fastPulse * 0.7);
    
    vec3 sparkColor = mix(accentColor, highlightColor, hash(vPosition.y + time) * 0.7 + 0.3);
    finalColor = mix(finalColor, sparkColor, spark);
    
    float highlight = smoothstep(0.5, 1.2, vIntensity);
    finalColor = mix(finalColor, mainColor, highlight * 0.5 * (1.0 - arc));
    finalColor = mix(finalColor, accentColor, highlight * 0.4 * arc);
    
    float mouseEffect = smoothstep(5.0, 0.5, vDistFromMouse) * mouseInfluence;
    
    if (mouseEffect > 0.3) {
      float discharge = hash(vPosition.x * 10.0 + vPosition.y * 10.0 + floor(time * 25.0));
      
      if (discharge > 0.7) {
        float dischargeBranch = fbm(vec3(
          vPosition.x * 20.0 + time * 5.0,
          vPosition.y * 20.0 - time * 6.0,
          vPosition.z * 20.0 + time * 4.0
        ));
        
        vec3 dischargeColor = mix(accentColor, highlightColor, (discharge - 0.7) * 3.0);
        dischargeColor = mix(dischargeColor, mainColor, dischargeBranch * 0.5);
        
        finalColor = mix(finalColor, dischargeColor, (discharge - 0.7) * 3.0 * mouseEffect);
      }
    }
    
    float edgeFactor = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    
    vec3 edgeColor = mix(mainColor, accentColor, t2);
    edgeColor = mix(edgeColor, highlightColor, edgeFactor * 0.5);
    
    float edgeNoise = fbm(vec3(
      vPosition.x * 8.0 + time * 2.0,
      vPosition.y * 8.0 - time * 1.5,
      vPosition.z * 8.0 + time * 2.5
    )) * 0.5 + 0.5;
    
    edgeColor = mix(edgeColor, accentColor, edgeNoise * 0.6);
    finalColor += edgeColor * edgeFactor * electricIntensity * 0.8;
    
    float flickerSpeed = 25.0 + hash(vPosition.y * 10.0) * 20.0; 
    float flicker = 0.92 + 0.08 * hash(vPosition.x * 15.0 + floor(time * flickerSpeed));
    flicker *= 0.96 + 0.04 * sin(time * (50.0 + hash(vPosition.z) * 40.0) + vPosition.y * 30.0);
    finalColor *= flicker;
    
    float glow = pow(vIntensity * (mouseEffect * 0.5 + 0.5), 2.0) * glowStrength;
    
    vec3 glowColor = mix(mainColor, accentColor, t3 * 0.7 + noisePattern * 0.3);
    
    finalColor += glowColor * glow * 0.7;
    finalColor += highlightColor * glow * 0.4 * pulse;
    
    float brightnessFactor = 0.6 + electricIntensity * 0.6;
    brightnessFactor *= (0.95 + 0.05 * sin(time * 2.0)); 
    
    finalColor *= brightnessFactor;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function createElectricWireframeSphere(radius, segments) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  
  for (let y = 0; y <= segments; y++) {
    const v = y / segments;
    const phi = v * Math.PI;
    
    for (let x = 0; x <= segments; x++) {
      const u = x / segments;
      const theta = u * Math.PI * 2;
      
      const noiseFactor = Math.sin(theta * 6) * Math.cos(phi * 5) * 0.04 +
                          Math.sin(theta * 8) * Math.sin(phi * 7) * 0.03;
      
      const distortion = 1.0 + noiseFactor;
      
      const px = -radius * Math.cos(theta) * Math.sin(phi) * distortion;
      const py = radius * Math.cos(phi) * distortion;
      const pz = radius * Math.sin(theta) * Math.sin(phi) * distortion;
      
      positions.push(px, py, pz);
      
      const normal = new THREE.Vector3(px, py, pz).normalize();
      normals.push(normal.x, normal.y, normal.z);
      
      uvs.push(u, v);
    }
  }
  
  for (let y = 0; y < segments; y++) {
    for (let x = 0; x < segments; x++) {
      const a = (segments + 1) * y + x;
      const b = (segments + 1) * y + x + 1;
      const c = (segments + 1) * (y + 1) + x;
      const d = (segments + 1) * (y + 1) + x + 1;
      
      indices.push(a, b);
      indices.push(a, c);
      
      if ((x % 3 == 0 && y % 2 == 0) || (x % 2 == 0 && y % 3 == 0)) {
        indices.push(a, d);
      }
      
      if ((x + y) % 4 == 0) {
        indices.push(b, c);
      }
      
      if (y === segments - 1) indices.push(c, d);
      if (x === segments - 1) indices.push(b, d);
    }
  }
  
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  
  return geometry;
}

const electricMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    mouse: { value: new THREE.Vector2() },
    mouseInfluence: { value: 0.0 },
    electricIntensity: { value: settings.electricIntensity },
    arcFrequency: { value: settings.arcFrequency },
    glowStrength: { value: settings.glowStrength },
    themeColors: { value: [
      colors.deepColor, 
      colors.baseColor, 
      colors.mainColor,
      colors.accentColor,
      colors.highlightColor
    ]}
  },
  vertexShader: electricVertexShader,
  fragmentShader: electricFragmentShader,
  transparent: true,
  wireframe: true,
  wireframeLinewidth: 1
});

const sphereGeometry = createElectricWireframeSphere(2, 40);
const electricSphere = new THREE.LineSegments(sphereGeometry, electricMaterial);
scene.add(electricSphere);

function createLightningBolts() {
  const boltCount = 30; 
  const bolts = new THREE.Group();
  
  const boltMaterial = new THREE.LineBasicMaterial({
    color: colors.accentColor,
    transparent: true,
    opacity: 0.8
  });
  
  const branchMaterial = new THREE.LineBasicMaterial({
    color: colors.highlightColor,
    transparent: true,
    opacity: 0.6
  });
  
  const subBranchMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color().lerpColors(colors.accentColor, colors.highlightColor, 0.5),
    transparent: true,
    opacity: 0.5
  });
  
  for (let i = 0; i < boltCount; i++) {
    const boltGroup = new THREE.Group();
    
    const points = [];
    const segments = 8 + Math.floor(Math.random() * 10); 
    
    const startTheta = Math.random() * Math.PI * 2;
    const startPhi = Math.acos(2 * Math.random() - 1); 
    const startX = 2 * Math.sin(startPhi) * Math.cos(startTheta);
    const startY = 2 * Math.cos(startPhi);
    const startZ = 2 * Math.sin(startPhi) * Math.sin(startTheta);
    
    const length = 0.6 + Math.random() * 1.4;
    const endX = startX * (1 + length);
    const endY = startY * (1 + length);
    const endZ = startZ * (1 + length);
    
    points.push(new THREE.Vector3(startX, startY, startZ));
    
    for (let j = 1; j < segments; j++) {
      const t = j / segments;
      
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      const z = startZ + (endZ - startZ) * t;
      
      const dirX = endX - startX;
      const dirY = endY - startY;
      const dirZ = endZ - startZ;
      
      const dirLength = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
      
      let perpX, perpY, perpZ;
      
      if (Math.abs(dirX) < Math.abs(dirY) && Math.abs(dirX) < Math.abs(dirZ)) {
        perpX = 0;
        perpY = dirZ / dirLength;
        perpZ = -dirY / dirLength;
      } else if (Math.abs(dirY) < Math.abs(dirZ)) {
        perpX = -dirZ / dirLength;
        perpY = 0;
        perpZ = dirX / dirLength;
      } else {
        perpX = dirY / dirLength;
        perpY = -dirX / dirLength;
        perpZ = 0;
      }
      
      const perpLength = Math.sqrt(perpX * perpX + perpY * perpY + perpZ * perpZ);
      perpX /= perpLength;
      perpY /= perpLength;
      perpZ /= perpLength;
      
      const jDistance = Math.min(t, 1 - t) * 2; 
      const jaggedness = (Math.random() - 0.5) * 0.8 * jDistance;
      
      const finalX = x + perpX * jaggedness;
      const finalY = y + perpY * jaggedness;
      const finalZ = z + perpZ * jaggedness;
      
      const point = new THREE.Vector3(finalX, finalY, finalZ);
      points.push(point);
      
      if (j > 1 && j < segments - 1 && Math.random() > (0.7 - jDistance * 0.3)) {
        const branchCount = Math.floor(Math.random() * 3) + 1;
        
        for (let b = 0; b < branchCount; b++) {
          const branchPoints = [];
          branchPoints.push(point.clone());
          
          const branchDirX = perpX + (Math.random() - 0.5);
          const branchDirY = perpY + (Math.random() - 0.5);
          const branchDirZ = perpZ + (Math.random() - 0.5);
          
          const branchLength = Math.sqrt(branchDirX * branchDirX + branchDirY * branchDirY + branchDirZ * branchDirZ);
          const branchDir = new THREE.Vector3(
            branchDirX / branchLength,
            branchDirY / branchLength,
            branchDirZ / branchLength
          );
          
          const branchDistance = 0.4 + Math.random() * 0.8;
          const branchSegments = 3 + Math.floor(Math.random() * 5);
          
          let lastPoint = point.clone();
          
          for (let k = 1; k <= branchSegments; k++) {
            const bt = k / branchSegments;
            
            let branchX = point.x + branchDir.x * branchDistance * bt;
            let branchY = point.y + branchDir.y * branchDistance * bt;
            let branchZ = point.z + branchDir.z * branchDistance * bt;
            
            const curve = Math.sin(bt * Math.PI) * 0.2;
            branchX += perpX * curve;
            branchY += perpY * curve;
            branchZ += perpZ * curve;
            
            const branchJagged = (Math.random() - 0.5) * 0.4 * bt;
            const branchFinalX = branchX + perpX * branchJagged;
            const branchFinalY = branchY + perpY * branchJagged;
            const branchFinalZ = branchZ + perpZ * branchJagged;
            
            const branchPoint = new THREE.Vector3(branchFinalX, branchFinalY, branchFinalZ);
            branchPoints.push(branchPoint);
            lastPoint = branchPoint;
            
            if (k > 1 && k < branchSegments && Math.random() > (0.8 - bt * 0.2)) {
              const subBranchPoints = [];
              subBranchPoints.push(lastPoint.clone());
              
              const subDirX = perpX + (Math.random() - 0.5) * 2;
              const subDirY = perpY + (Math.random() - 0.5) * 2;
              const subDirZ = perpZ + (Math.random() - 0.5) * 2;
              
              const subDirLength = Math.sqrt(subDirX * subDirX + subDirY * subDirY + subDirZ * subDirZ);
              const subDir = new THREE.Vector3(
                subDirX / subDirLength,
                subDirY / subDirLength,
                subDirZ / subDirLength
              );
              
              const subLength = 0.2 + Math.random() * 0.4;
              const subSegments = 2 + Math.floor(Math.random() * 3);
              
              for (let s = 1; s <= subSegments; s++) {
                const st = s / subSegments;
                
                let subX = lastPoint.x + subDir.x * subLength * st;
                let subY = lastPoint.y + subDir.y * subLength * st;
                let subZ = lastPoint.z + subDir.z * subLength * st;
                
                const subJagged = (Math.random() - 0.5) * 0.2 * st;
                const subFinalX = subX + perpX * subJagged;
                const subFinalY = subY + perpY * subJagged;
                const subFinalZ = subZ + perpZ * subJagged;
                
                subBranchPoints.push(new THREE.Vector3(subFinalX, subFinalY, subFinalZ));
              }
              
              const subGeometry = new THREE.BufferGeometry().setFromPoints(subBranchPoints);
              const subBranch = new THREE.Line(subGeometry, subBranchMaterial.clone());
              subBranch.userData = {
                lifetime: 0.05 + Math.random() * 0.1,
                age: 0,
                active: false
              };
              subBranch.visible = false;
              boltGroup.add(subBranch);
            }
          }
          
          const branchGeometry = new THREE.BufferGeometry().setFromPoints(branchPoints);
          const branch = new THREE.Line(branchGeometry, branchMaterial.clone());
          branch.userData = {
            lifetime: 0.1 + Math.random() * 0.2,
            age: 0,
            active: false
          };
          branch.visible = false;
          boltGroup.add(branch);
        }
      }
    }
    
    points.push(new THREE.Vector3(endX, endY, endZ));
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const bolt = new THREE.Line(geometry, boltMaterial.clone());
    bolt.userData = {
      lifetime: 0.2 + Math.random() * 0.3,
      age: 0,
      active: false
    };
    
    bolt.visible = false;
    boltGroup.add(bolt);
    boltGroup.userData = {
      isMainBolt: true,
      branchCount: boltGroup.children.length - 1
    };
    
    bolts.add(boltGroup);
  }
  
  return bolts;
}

function createChainLightning() {
  const chains = new THREE.Group();
  
  const chainMaterial = new THREE.LineBasicMaterial({
    color: colors.accentColor,
    transparent: true,
    opacity: 0.7
  });
  
  const nodeCount = 30; 
  const nodes = [];
  
  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / nodeCount);
    const theta = Math.sqrt(nodeCount * Math.PI) * phi;
    
    const x = 2 * Math.sin(phi) * Math.cos(theta);
    const y = 2 * Math.cos(phi);
    const z = 2 * Math.sin(phi) * Math.sin(theta);
    
    nodes.push(new THREE.Vector3(x, y, z));
  }
  
  nodes.forEach(node => {
    node.x += (Math.random() - 0.5) * 0.2;
    node.y += (Math.random() - 0.5) * 0.2;
    node.z += (Math.random() - 0.5) * 0.2;
    
    const len = 2 / node.length();
    node.multiplyScalar(len);
  });
  
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const startNode = nodes[i];
      const endNode = nodes[j];
      
      const distance = startNode.distanceTo(endNode);
      if (distance < 2.2) { 
        const chainPoints = [];
        const segments = 5 + Math.floor(Math.random() * 4);
        
        chainPoints.push(startNode.clone());
        
        const dir = new THREE.Vector3().subVectors(endNode, startNode).normalize();
        
        let perpX, perpY, perpZ;
        
        if (Math.abs(dir.x) < Math.abs(dir.y) && Math.abs(dir.x) < Math.abs(dir.z)) {
          perpX = 0;
          perpY = dir.z;
          perpZ = -dir.y;
        } else if (Math.abs(dir.y) < Math.abs(dir.z)) {
          perpX = -dir.z;
          perpY = 0;
          perpZ = dir.x;
        } else {
          perpX = dir.y;
          perpY = -dir.x;
          perpZ = 0;
        }
        
        const perp = new THREE.Vector3(perpX, perpY, perpZ).normalize();
        
        for (let k = 1; k < segments; k++) {
          const t = k / segments;
          
          const x = startNode.x + (endNode.x - startNode.x) * t;
          const y = startNode.y + (endNode.y - startNode.y) * t;
          const z = startNode.z + (endNode.z - startNode.z) * t;
          
          const jDistance = Math.sin(t * Math.PI); 
          const jaggedness = (Math.random() - 0.5) * 0.5 * jDistance;
          
          const curve = Math.sin(t * Math.PI) * 0.15;
          
          const finalX = x + perp.x * (jaggedness + curve);
          const finalY = y + perp.y * (jaggedness + curve);
          const finalZ = z + perp.z * (jaggedness + curve);
          
          chainPoints.push(new THREE.Vector3(finalX, finalY, finalZ));
        }
        
        chainPoints.push(endNode.clone());
        
        const chainGeometry = new THREE.BufferGeometry().setFromPoints(chainPoints);
        const chain = new THREE.Line(chainGeometry, chainMaterial.clone());
        
        chain.userData = {
          lifetime: 0.1 + Math.random() * 0.2,
          age: 0,
          active: false,
          startNodeIndex: i,
          endNodeIndex: j
        };
        
        chain.visible = false;
        chains.add(chain);
      }
    }
  }
  
  chains.userData = {
    nodes: nodes
  };
  
  return chains;
}

function createElectricParticles() {
  const particleCount = 1000; 
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const offsets = new Float32Array(particleCount);
  const speeds = new Float32Array(particleCount);
  const particleTypes = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    let radiusFactor;
    
    if (i < particleCount * 0.7) {
      radiusFactor = 2.0 + (Math.random() - 0.5) * 0.4;
    } else if (i < particleCount * 0.9) {
      radiusFactor = 2.0 + (Math.random() - 0.3) * 0.8;
    } else {
      radiusFactor = 2.0 + (Math.random() * 0.3 + 0.2) * 1.2;
    }
    
    const x = radiusFactor * Math.sin(phi) * Math.cos(theta);
    const y = radiusFactor * Math.sin(phi) * Math.sin(theta);
    const z = radiusFactor * Math.cos(phi);
    
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    
    const randomType = Math.random();
    let particleType;
    
    if (randomType < 0.35) particleType = 0; 
    else if (randomType < 0.6) particleType = 1; 
    else if (randomType < 0.75) particleType = 2; 
    else if (randomType < 0.85) particleType = 3; 
    else if (randomType < 0.95) particleType = 4; 
    else particleType = 5; 
    
    let size;
    switch(particleType) {
      case 0: 
        size = 0.03 + Math.random() * 0.05;
        break;
      case 1: 
        size = 0.02 + Math.random() * 0.04;
        break;
      case 2: 
        size = 0.04 + Math.random() * 0.08;
        break;
      case 3: 
        size = 0.03 + Math.random() * 0.07;
        break;
      case 4: 
        size = 0.02 + Math.random() * 0.03;
        break;
      case 5: 
        size = 0.01 + Math.random() * 0.02;
        break;
    }
    
    let speed;
    switch(particleType) {
      case 0: 
        speed = 0.5 + Math.random() * 1.0;
        break;
      case 1: 
        speed = 1.0 + Math.random() * 2.0;
        break;
      case 2: 
        speed = 0.3 + Math.random() * 0.7;
        break;
      case 3: 
        speed = 0.7 + Math.random() * 1.5;
        break;
      case 4: 
        speed = 0.8 + Math.random() * 1.2;
        break;
      case 5: 
        speed = 0.2 + Math.random() * 0.4;
        break;
    }
    
    sizes[i] = size;
    offsets[i] = Math.random() * 100;
    speeds[i] = speed;
    particleTypes[i] = particleType;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('offset', new THREE.BufferAttribute(offsets, 1));
  geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute('particleType', new THREE.BufferAttribute(particleTypes, 1));
  
  const particleShader = {
    uniforms: {
      time: { value: 0 },
      arcFrequency: { value: settings.arcFrequency },
      electricIntensity: { value: settings.electricIntensity },
      themeColors: { value: [
        colors.deepColor, 
        colors.baseColor, 
        colors.mainColor,
        colors.accentColor,
        colors.highlightColor
      ]}
    },
    vertexShader: `
      uniform float time;
      uniform float arcFrequency;
      uniform float electricIntensity;
      uniform vec3 themeColors[5]; 
      
      attribute float size;
      attribute float offset;
      attribute float speed;
      attribute float particleType;
      
      varying vec3 vColor;
      varying float vAlpha;
      varying float vParticleType;
      varying float vAngle;
      
      ${noiseHelperFunctions}
      
      void main() {
        vec3 pos = position;
        vParticleType = particleType;
        
        float t = time * speed + offset;
        vAngle = t * 10.0; 
        
        vec3 deepColor = themeColors[0];
        vec3 baseColor = themeColors[1];
        vec3 mainColor = themeColors[2];
        vec3 accentColor = themeColors[3];
        vec3 highlightColor = themeColors[4];
        
        if (particleType < 1.0) {
          float flicker = hash(offset * 10.0 + floor(time * 20.0));
          
          if (hash(offset + floor(time * 10.0)) > 0.8) {
            pos += normalize(position) * sin(t * 30.0) * 0.05 * electricIntensity;
          }
          
          float orbitSpeed = speed * 2.0;
          pos += vec3(
            sin(t * orbitSpeed) * 0.03,
            cos(t * orbitSpeed) * 0.03,
            sin(t * orbitSpeed + 1.0) * 0.03
          ) * electricIntensity;
          
          vColor = mix(baseColor, mainColor, hash(offset) * 0.7 + 0.3);
          
        } else if (particleType < 2.0) {
          float noise = noise(vec3(offset * 5.0, time * 3.0, offset * 3.0));
          
          pos += normalize(position) * sin(t * 50.0) * 0.08 * electricIntensity;
          pos += vec3(
            sin(t * 7.0 + offset) * 0.04,
            cos(t * 9.0 + offset * 2.0) * 0.04,
            sin(t * 8.0 + offset * 1.5) * 0.04
          ) * electricIntensity;
          
          vec3 dir = normalize(position);
          pos -= dir * (sin(t * 8.0) * 0.05 * electricIntensity);
          
          vColor = mix(mainColor, accentColor, noise * 0.8 + 0.2);
          
        } else if (particleType < 3.0) {
          float orbitSpeed = speed * 0.5;
          pos += vec3(
            sin(t * orbitSpeed) * 0.01,
            cos(t * orbitSpeed) * 0.01,
            sin(t * orbitSpeed + 1.0) * 0.01
          );
          
          pos += normalize(position) * sin(t * 5.0) * 0.03;
          
          vColor = mix(accentColor, highlightColor, sin(t * 3.0) * 0.5 + 0.5);
          
        } else if (particleType < 4.0) {
          if (hash(offset * 3.0 + floor(time * 5.0)) > 0.9) {
            pos += vec3(
              (hash(offset + time) - 0.5) * 0.2,
              (hash(offset * 2.0 + time) - 0.5) * 0.2,
              (hash(offset * 3.0 + time) - 0.5) * 0.2
            ) * electricIntensity;
          }
          
          pos += vec3(
            sin(t * 20.0) * 0.02,
            cos(t * 25.0) * 0.02,
            sin(t * 22.0) * 0.02
          ) * electricIntensity;
          
          vColor = mix(accentColor, highlightColor, 0.7);
          
        } else if (particleType < 5.0) {
          float trail = fbm(vec3(
            offset * 5.0 + time * 0.5,
            offset * 5.0 - time * 0.7,
            offset * 5.0 + time * 0.6
          ));
          
          vec3 flowDir = vec3(
            sin(position.y * 5.0 + time),
            cos(position.z * 5.0 + time),
            sin(position.x * 5.0 + time)
          );
          
          pos += flowDir * 0.04 * electricIntensity;
          
          float circleSpeed = speed * 3.0;
          pos += vec3(
            sin(t * circleSpeed) * 0.02,
            cos(t * circleSpeed) * 0.02,
            0.0
          );
          
          vColor = mix(mainColor, accentColor, trail);
          
        } else {
          pos += vec3(
            sin(t * 0.7) * 0.03,
            cos(t * 0.5) * 0.03,
            sin(t * 0.6) * 0.03
          );
          
          float angle = t * 0.2;
          float radius = 0.01;
          pos.x += cos(angle) * radius;
          pos.y += sin(angle) * radius;
          
          vColor = mix(deepColor, baseColor, 0.7 + 0.3 * sin(t));
        }
        
        float flickerFreq;
        float visibilityThreshold;
        
        if (particleType < 1.0) {
          flickerFreq = 30.0;
          visibilityThreshold = 0.4;
        } else if (particleType < 2.0) {
          flickerFreq = 50.0;
          visibilityThreshold = 0.3;
        } else if (particleType < 3.0) {
          flickerFreq = 10.0;
          visibilityThreshold = 0.2;
        } else if (particleType < 4.0) {
          flickerFreq = 20.0;
          visibilityThreshold = 0.5;
        } else if (particleType < 5.0) {
          flickerFreq = 15.0;
          visibilityThreshold = 0.3;
        } else {
          flickerFreq = 5.0;
          visibilityThreshold = 0.2;
        }
        
        float visibility = step(visibilityThreshold * (1.0 - arcFrequency * 0.5), 
                                  hash(offset + floor(time * flickerFreq)));
        visibility *= electricIntensity;
        
        float particleSize;
        
        if (particleType < 1.0) {
          particleSize = size * visibility * (0.8 + hash(offset + time * 20.0) * 0.4);
        } else if (particleType < 2.0) {
          particleSize = size * visibility * (0.6 + hash(offset + time * 30.0) * 0.4);
        } else if (particleType < 3.0) {
          particleSize = size * visibility * (1.0 + sin(t * 8.0) * 0.5) * 1.5;
        } else if (particleType < 4.0) {
          particleSize = size * visibility * (0.7 + hash(offset + time * 10.0)) * 1.2;
        } else if (particleType < 5.0) {
          particleSize = size * visibility * (0.6 + sin(t * 5.0) * 0.3) * 0.9;
        } else {
          particleSize = size * visibility * (0.5 + sin(t * 3.0) * 0.2) * 0.7;
        }
        
        if (particleType < 1.0) {
          vAlpha = visibility * (0.3 + 0.7 * hash(offset + time * 40.0));
        } else if (particleType < 2.0) {
          vAlpha = visibility * (0.4 + 0.6 * hash(offset + time * 60.0));
        } else if (particleType < 3.0) {
          vAlpha = visibility * (0.3 + 0.7 * sin(t * 8.0));
        } else if (particleType < 4.0) {
          vAlpha = visibility * (0.5 + 0.5 * hash(offset + time * 30.0));
        } else if (particleType < 5.0) {
          vAlpha = visibility * (0.2 + 0.8 * sin(t * 5.0));
        } else {
          vAlpha = visibility * (0.1 + 0.3 * sin(t * 2.0));
        }
        
        vAlpha *= electricIntensity;
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = particleSize * (300.0 / -mvPosition.z);
      }
    `,
    fragmentShader: `
      uniform vec3 themeColors[5]; 
      
      varying vec3 vColor;
      varying float vAlpha;
      varying float vParticleType;
      varying float vAngle;
      
      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        float strength;
        
        if (vParticleType < 1.0) {
          strength = 1.0 - smoothstep(0.2, 0.5, dist);
        } else if (vParticleType < 2.0) {
          strength = 1.0 - smoothstep(0.1, 0.4, dist);
          float streakDir = abs(center.x - center.y * sign(sin(vAngle)));
          if (streakDir < 0.2) {
            strength = mix(strength, 1.2, (0.2 - streakDir) * 5.0);
          }
        } else if (vParticleType < 3.0) {
          float innerDist = smoothstep(0.0, 0.2, dist);
          float outerGlow = 1.0 - smoothstep(0.3, 0.5, dist);
          strength = mix(innerDist, outerGlow, 0.7);
        } else if (vParticleType < 4.0) {
          strength = 1.0 - smoothstep(0.0, 0.5, dist);
          if (dist < 0.2) {
            strength = mix(strength, 2.0, 1.0 - dist * 5.0);
          }
          float trailDir = dot(normalize(center), vec2(cos(vAngle), sin(vAngle)));
          if (trailDir > 0.3 && dist < 0.4) {
            strength = mix(strength, 1.5, (trailDir - 0.3) * 2.0);
          }
        } else if (vParticleType < 5.0) {
          vec2 stretched = vec2(center.x, center.y * 1.5);
          float stretchDist = length(stretched);
          strength = 1.0 - smoothstep(0.1, 0.4, stretchDist);
          strength *= (0.7 + 0.3 * sin(center.x * 10.0 + vAngle));
        } else {
          strength = 1.0 - smoothstep(0.0, 0.4, dist);
          strength *= 0.7;
        }
        
        float alpha = strength * vAlpha;
        
        if (alpha < 0.01) discard;
        
        gl_FragColor = vec4(vColor, alpha);
      }
    `
  };
  
  const material = new THREE.ShaderMaterial({
    uniforms: particleShader.uniforms,
    vertexShader: particleShader.vertexShader,
    fragmentShader: particleShader.fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  
  return new THREE.Points(geometry, material);
}

const lightningBolts = createLightningBolts();
const chainLightning = createChainLightning();
const electricParticles = createElectricParticles();
scene.add(lightningBolts);
scene.add(chainLightning);
scene.add(electricParticles);

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.2,  
  0.4,  
  0.2   
);
composer.addPass(bloomPass);

const chromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.003 },
    time: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float time;
    
    varying vec2 vUv;
    
    void main() {
      float dynamic = amount * (1.0 + sin(time * 3.0) * 0.2);
      
      vec2 center = vUv - 0.5;
      vec2 direction = normalize(center);
      
      float distFromCenter = length(center);
      float falloff = smoothstep(0.0, 0.6, distFromCenter);
      vec2 offset = direction * dynamic * falloff;
      
      vec4 cr = texture2D(tDiffuse, vUv + offset);
      vec4 cg = texture2D(tDiffuse, vUv);
      vec4 cb = texture2D(tDiffuse, vUv - offset);
      
      gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a);
    }
  `
};

const chromaticAberrationPass = new ShaderPass(chromaticAberrationShader);
composer.addPass(chromaticAberrationPass);

camera.position.z = 5;

function activateLightningBolt(boltGroup) {
  const mainBolt = boltGroup.children[0];
  mainBolt.userData.age = 0;
  mainBolt.userData.active = true;
  mainBolt.visible = true;
  
  mainBolt.material.opacity = 0.6 + Math.random() * 0.4;
  
  for (let i = 1; i < boltGroup.children.length; i++) {
    const branch = boltGroup.children[i];
    
    setTimeout(() => {
      branch.userData.age = 0;
      branch.userData.active = true;
      branch.visible = true;
      branch.material.opacity = 0.4 + Math.random() * 0.4;
    }, Math.random() * 70); 
  }
}

function activateChainLightning(chain) {
  chain.userData.age = 0;
  chain.userData.active = true;
  chain.visible = true;
  chain.material.opacity = 0.5 + Math.random() * 0.3;
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  mouseSpeed.x = mouse.x - lastMousePosition.x;
  mouseSpeed.y = mouse.y - lastMousePosition.y;
  
  lastMousePosition.x = mouse.x;
  lastMousePosition.y = mouse.y;
  
  targetRotation.x = mouse.y * 0.8;
  targetRotation.y = mouse.x * 0.8;
}

function onTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    
    const touch = event.touches[0];
    onMouseMove({
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  }
}

function onMouseDown() {
  mouseInfluence += 2.5;
  
  const flashElement = document.createElement('div');
  flashElement.style.position = 'fixed';
  flashElement.style.top = 0;
  flashElement.style.left = 0;
  flashElement.style.width = '100%';
  flashElement.style.height = '100%';
  flashElement.style.backgroundColor = `rgba(${colors.accentColor.r * 255 * 0.7}, ${colors.accentColor.g * 255 * 0.7}, ${colors.accentColor.b * 255 * 1.2}, 0.15)`;
  flashElement.style.pointerEvents = 'none';
  flashElement.style.zIndex = 1000;
  flashElement.style.transition = 'opacity 200ms cubic-bezier(0.215, 0.61, 0.355, 1)';
  document.body.appendChild(flashElement);
  
  setTimeout(() => {
    flashElement.style.opacity = 0;
    setTimeout(() => {
      document.body.removeChild(flashElement);
    }, 200);
  }, 20);
  
  const originalBloomStrength = bloomPass.strength;
  bloomPass.strength = originalBloomStrength * 2.5;
  
  const bloomStartTime = Date.now();
  const bloomDuration = 400;
  const animateBloom = function() {
    const elapsed = Date.now() - bloomStartTime;
    if (elapsed < bloomDuration) {
      const t = elapsed / bloomDuration;
      const ease = 1 - Math.pow(1 - t, 3); 
      bloomPass.strength = originalBloomStrength * (1 + 1.5 * (1 - ease));
      requestAnimationFrame(animateBloom);
    } else {
      bloomPass.strength = originalBloomStrength;
    }
  };
  requestAnimationFrame(animateBloom);
  
  const originalAberration = chromaticAberrationPass.uniforms.amount.value;
  chromaticAberrationPass.uniforms.amount.value = originalAberration * 4.0;
  
  const aberrationStartTime = Date.now();
  const aberrationDuration = 350;
  const animateAberration = function() {
    const elapsed = Date.now() - aberrationStartTime;
    if (elapsed < aberrationDuration) {
      const t = elapsed / aberrationDuration;
      const ease = 1 - Math.pow(1 - t, 3); 
      chromaticAberrationPass.uniforms.amount.value = originalAberration * (1 + 3.0 * (1 - ease));
      requestAnimationFrame(animateAberration);
    } else {
      chromaticAberrationPass.uniforms.amount.value = originalAberration;
    }
  };
  requestAnimationFrame(animateAberration);
  
  const allBolts = [...lightningBolts.children].sort(() => 0.5 - Math.random());
  const maxBolts = Math.min(25, allBolts.length); 
  
  for (let i = 0; i < maxBolts; i++) {
    setTimeout(() => {
      activateLightningBolt(allBolts[i]);
      
      const mainBolt = allBolts[i].children[0];
      if (mainBolt) {
        mainBolt.material.opacity = 1.0; 
        mainBolt.material.color.set(colors.highlightColor);
        mainBolt.userData.lifetime = 1.0 + Math.random() * 0.5; 
      }
      
      for (let j = 1; j < allBolts[i].children.length; j++) {
        const branch = allBolts[i].children[j];
        if (branch) {
          branch.material.opacity = 0.9 + Math.random() * 0.1;
          branch.userData.lifetime = 0.6 + Math.random() * 0.3; 
          
          if (Math.random() > 0.7) {
            branch.material.color.set(colors.accentColor);
          }
        }
      }
    }, i * 15); 
  }
  
  const allChains = [...chainLightning.children].sort(() => 0.5 - Math.random());
  const maxChains = Math.min(30, allChains.length); 
  
  for (let i = 0; i < maxChains; i++) {
    setTimeout(() => {
      activateChainLightning(allChains[i]);
      
      allChains[i].material.opacity = 1.0; 
      allChains[i].userData.lifetime = 0.7 + Math.random() * 0.3; 
      
      if (Math.random() > 0.7) {
        allChains[i].material.color.set(colors.highlightColor);
      }
    }, i * 20 + 50); 
  }
  
  setTimeout(() => {
    const remainingBolts = [...allBolts].sort(() => 0.5 - Math.random()).slice(0, 15);
    
    for (let i = 0; i < remainingBolts.length; i++) {
      setTimeout(() => {
        activateLightningBolt(remainingBolts[i]);
        
        const mainBolt = remainingBolts[i].children[0];
        if (mainBolt) {
          const mixedColor = new THREE.Color().lerpColors(colors.mainColor, colors.highlightColor, 0.7);
          mainBolt.material.color.set(mixedColor);
          mainBolt.userData.lifetime = 0.5 + Math.random() * 0.3; 
        }
      }, i * 25);
    }
  }, 400);
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('touchmove', onTouchMove, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('touchstart', onMouseDown, false);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

updateSliderValues();

function animate(time) {
  requestAnimationFrame(animate);
  
  const deltaTime = time * 0.001;
  
  electricMaterial.uniforms.time.value = deltaTime;
  electricMaterial.uniforms.mouse.value.copy(mouse);
  electricMaterial.uniforms.mouseInfluence.value = mouseInfluence;
  electricMaterial.uniforms.electricIntensity.value = settings.electricIntensity;
  electricMaterial.uniforms.arcFrequency.value = settings.arcFrequency;
  electricMaterial.uniforms.glowStrength.value = settings.glowStrength;
  
  electricParticles.material.uniforms.time.value = deltaTime;
  electricParticles.material.uniforms.arcFrequency.value = settings.arcFrequency;
  electricParticles.material.uniforms.electricIntensity.value = settings.electricIntensity;
  
  chromaticAberrationPass.uniforms.time.value = deltaTime;
  
  const speed = Math.sqrt(mouseSpeed.x * mouseSpeed.x + mouseSpeed.y * mouseSpeed.y);
  
  mouseInfluence *= 0.95;  
  mouseInfluence += speed * 3.0;  
  mouseInfluence = Math.min(mouseInfluence, 1.0);  
  
  currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
  currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;
  
  electricSphere.rotation.x = currentRotation.x;
  electricSphere.rotation.y = currentRotation.y;
  
  const floatX = Math.sin(deltaTime * 0.5) * 0.08;
  const floatY = Math.sin(deltaTime * 0.7) * 0.1;
  const floatZ = Math.cos(deltaTime * 0.6) * 0.05;
  
  electricSphere.position.y = floatY;
  electricSphere.position.x = floatX;
  
  if (settings.enableLightning) {
    lightningBolts.children.forEach(boltGroup => {
      const mainBolt = boltGroup.children[0];
      
      if (mainBolt.userData.active) {
        mainBolt.userData.age += 0.016; 
        
        const progress = mainBolt.userData.age / mainBolt.userData.lifetime;
        const fade = 1.0 - Math.pow(progress, 1.5); 
        mainBolt.material.opacity = fade;
        
        if (mainBolt.userData.age >= mainBolt.userData.lifetime) {
          mainBolt.userData.active = false;
          mainBolt.visible = false;
        }
      } else if (Math.random() > 0.995 && settings.arcFrequency > 0.4) {
        activateLightningBolt(boltGroup);
      }
      
      for (let i = 1; i < boltGroup.children.length; i++) {
        const branch = boltGroup.children[i];
        
        if (branch.userData.active) {
          branch.userData.age += 0.016;
          
          const progress = branch.userData.age / branch.userData.lifetime;
          const fade = 0.8 - Math.pow(progress, 1.2);
          branch.material.opacity = Math.max(0, fade);
          
          if (branch.userData.age >= branch.userData.lifetime) {
            branch.userData.active = false;
            branch.visible = false;
          }
        }
      }
    });
  }
  
  if (settings.enableChainLightning) {
    chainLightning.children.forEach(chain => {
      if (chain.userData.active) {
        chain.userData.age += 0.016;
        
        const progress = chain.userData.age / chain.userData.lifetime;
        const fade = 0.8 - Math.pow(progress, 1.2);
        
        const flicker = 0.9 + 0.1 * Math.sin(deltaTime * 70.0 + chain.userData.startNodeIndex * 10);
        chain.material.opacity = Math.max(0, fade * flicker);
        
        if (chain.userData.age >= chain.userData.lifetime) {
          chain.userData.active = false;
          chain.visible = false;
        }
      } else if (Math.random() > 0.997 && settings.arcFrequency > 0.5) {
        activateChainLightning(chain);
      }
    });
  }
  
  if (mouseInfluence > 0.7 && Math.random() > 0.85 && settings.enableLightning) {
    const randomBolt = lightningBolts.children[Math.floor(Math.random() * lightningBolts.children.length)];
    activateLightningBolt(randomBolt);
    
    if (settings.enableChainLightning && Math.random() > 0.4) {
      const randomChain = chainLightning.children[Math.floor(Math.random() * chainLightning.children.length)];
      activateChainLightning(randomChain);
    }
  }
  
  mouseSpeed.multiplyScalar(0.95);
  
  composer.render();
}

animate(0);