import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Configuration
const config = {
    paused: false,
    activePaletteIndex: 1,
    showWireframe: true,
    showPoints: true,
    rotationSpeed: 0.0005
};

// Color palettes
const colorPalettes = [
    [new THREE.Color(0x4F46E5), new THREE.Color(0x7C3AED), new THREE.Color(0xC026D3), new THREE.Color(0xDB2777)],
    [new THREE.Color(0xF59E0B), new THREE.Color(0xF97316), new THREE.Color(0xDC2626), new THREE.Color(0x7F1D1D)],
    [new THREE.Color(0xEC4899), new THREE.Color(0x8B5CF6), new THREE.Color(0x6366F1), new THREE.Color(0x3B82F6)],
    [new THREE.Color(0x10B981), new THREE.Color(0xA3E635), new THREE.Color(0xFACC15), new THREE.Color(0xFB923C)]
];

// Setup scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.001);

// Setup camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 5);

// Setup renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// Create starfield background
function createStarfield() {
    const count = 2000;
    const positions = [];
    for (let i = 0; i < count; i++) {
        const r = THREE.MathUtils.randFloat(40, 80);
        const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
        const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
        positions.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        sizeAttenuation: true,
        depthWrite: false,
        opacity: 0.7,
        transparent: true
    });
    return new THREE.Points(geo, mat);
}
const starField = createStarfield();
scene.add(starField);

// Setup orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 1.0; // 增加旋转速度
controls.zoomSpeed = 1.2; // 增加缩放速度
controls.minDistance = 0.5; // 允许更近距离查看
controls.maxDistance = 100; // 允许更远距离查看
controls.autoRotate = false; // 默认关闭自动旋转
controls.enablePan = true; // 启用平移功能
controls.enableZoom = true; // 确保缩放功能启用
controls.keys = {
    LEFT: 'ArrowLeft', // 左箭头键
    UP: 'ArrowUp', // 上箭头键
    RIGHT: 'ArrowRight', // 右箭头键
    BOTTOM: 'ArrowDown' // 下箭头键
};

// Setup post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.4, 0.85);
composer.addPass(bloomPass);

const filmPass = new FilmPass(0.35, 0.5, 2048, false);
composer.addPass(filmPass);

composer.addPass(new OutputPass());

// Shaders
const noiseFunctions = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        // First corner
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
        
        // Permutations
        i = mod289(i);
        vec4 p = permute( permute( permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                 
        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        float n_ = 0.142857142857; // 1.0/7.0
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
        
        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);
        
        // Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    float fbm(vec3 p, float time) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        int octaves = 3;
        
        for(int i=0; i<octaves; i++) {
            value += amplitude * snoise(p * frequency + time * 0.2 * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
        }
        
        return value;
    }
`;

// Shader for vertices/points
const vertexShader = {
    vertexShader: `${noiseFunctions}
        uniform float uTime;
        uniform vec3 uPulsePositions[3];
        uniform float uPulseTimes[3];
        uniform float uPulseSpeed;
        uniform vec3 uPulseColors[3];
        uniform int uActivePalette;
        uniform float pointSize; // 添加点大小参数
        
        attribute float size;
        attribute vec3 customColor;
        
        varying vec3 vColor;
        varying float vPulseIntensity;
        varying float vDistance;
        
        float getPulseIntensity(vec3 worldPos, vec3 pulsePos, float pulseTime) {
            if (pulseTime < 0.0) return 0.0;
            float timeSinceClick = uTime - pulseTime;
            if (timeSinceClick < 0.0 || timeSinceClick > 3.0) return 0.0;
            
            float pulseRadius = timeSinceClick * uPulseSpeed;
            float distToClick = distance(worldPos, pulsePos);
            float pulseThickness = 1.5;
            float waveProximity = abs(distToClick - pulseRadius);
            
            return smoothstep(pulseThickness, 0.0, waveProximity) * smoothstep(3.0, 0.0, timeSinceClick);
        }
        
        void main() {
            vColor = customColor;
            
            vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
            vDistance = length(worldPos);
            
            float totalPulseIntensity = 0.0;
            for (int i = 0; i < 3; i++) {
                totalPulseIntensity += getPulseIntensity(worldPos, uPulsePositions[i], uPulseTimes[i]);
            }
            vPulseIntensity = min(totalPulseIntensity, 1.0);
            
            float timeScale = 0.5 + 0.5 * sin(uTime * 0.8 + vDistance * 0.05);
            float baseSize = size * (0.8 + 0.2 * timeScale);
            // Reduce pulse size effect
            float pulseSize = baseSize * (1.0 + vPulseIntensity * 0.8);
            
            // Add some noise-based movement
            vec3 modifiedPosition = position;
            float noise = fbm(position * 0.1, uTime * 0.1);
            modifiedPosition += normalize(position) * noise * 0.05;
            
            vec4 mvPosition = modelViewMatrix * vec4(modifiedPosition, 1.0);
            // 使用自定义点大小参数
            gl_PointSize = pulseSize * (400.0 / -mvPosition.z) * pointSize;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uPulseColors[3];
        uniform float uBrightness; // 添加亮度控制
        uniform float uOpacity;    // 添加透明度控制
        
        varying vec3 vColor;
        varying float vPulseIntensity;
        varying float vDistance;
        
        void main() {
            vec2 center = 2.0 * gl_PointCoord - 1.0;
            float dist = length(center);
            if (dist > 1.0) discard;
            
            // Make the glow softer
            float glowStrength = 1.0 - smoothstep(0.0, 1.0, dist);
            glowStrength = pow(glowStrength, 1.6); // Increased power for softer edge
            
            // Reduce color brightness
            vec3 baseColor = vColor * (0.6 + 0.2 * sin(uTime * 0.5 + vDistance * 0.1));
            vec3 finalColor = baseColor;
            
            if (vPulseIntensity > 0.0) {
                vec3 pulseColor = mix(vec3(1.0), uPulseColors[0], 0.3);
                finalColor = mix(baseColor, pulseColor, vPulseIntensity * 0.3); // Reduced mix ratio
                finalColor *= (1.0 + vPulseIntensity * 0.2); // Reduced intensity boost
            }
            
            // 应用亮度参数
            finalColor *= uBrightness;
            
            // Lower alpha overall
            float alpha = glowStrength * (0.7 - 0.5 * dist);
            float camDistance = vDistance;
            float distanceFade = smoothstep(40.0, 5.0, camDistance);
            
            // 应用透明度参数
            gl_FragColor = vec4(finalColor, alpha * distanceFade * 0.8 * uOpacity);
        }
    `
};

// Shader for edges/lines
const edgeShader = {
    vertexShader: `${noiseFunctions}
        uniform float uTime;
        uniform vec3 uPulsePositions[3];
        uniform float uPulseTimes[3];
        uniform float uPulseSpeed;
        
        attribute vec3 customColor;
        attribute float connectionStrength;
        
        varying vec3 vColor;
        varying float vPulseIntensity;
        varying float vPosition;
        varying float vConnectionStrength;
        
        float getPulseIntensity(vec3 worldPos, vec3 pulsePos, float pulseTime) {
            if (pulseTime < 0.0) return 0.0;
            float timeSinceClick = uTime - pulseTime;
            if (timeSinceClick < 0.0 || timeSinceClick > 3.0) return 0.0;
            
            float pulseRadius = timeSinceClick * uPulseSpeed;
            float distToClick = distance(worldPos, pulsePos);
            float pulseThickness = 2.0;
            float waveProximity = abs(distToClick - pulseRadius);
            
            return smoothstep(pulseThickness, 0.0, waveProximity) * smoothstep(3.0, 0.0, timeSinceClick);
        }
        
        void main() {
            vColor = customColor;
            vConnectionStrength = connectionStrength;
            vPosition = position.y; // Use y coordinate for flow effect
            
            vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
            
            float totalPulseIntensity = 0.0;
            for (int i = 0; i < 3; i++) {
                totalPulseIntensity += getPulseIntensity(worldPos, uPulsePositions[i], uPulseTimes[i]);
            }
            vPulseIntensity = min(totalPulseIntensity, 1.0);
            
            // Add some noise-based movement
            vec3 modifiedPosition = position;
            float noise = fbm(position * 0.2, uTime * 0.1);
            modifiedPosition += normalize(position) * noise * 0.02;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(modifiedPosition, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uPulseColors[3];
        uniform float uBrightness; // 添加亮度控制
        uniform float uOpacity;    // 添加透明度控制
        
        varying vec3 vColor;
        varying float vPulseIntensity;
        varying float vPosition;
        varying float vConnectionStrength;
        
        void main() {
            vec3 baseColor = vColor * (0.7 + 0.3 * sin(uTime * 0.5 + vPosition * 10.0));
            
            float flowPattern = sin(vPosition * 20.0 - uTime * 3.0) * 0.5 + 0.5;
            float flowIntensity = 0.3 * flowPattern * vConnectionStrength;
            
            vec3 finalColor = baseColor;
            
            if (vPulseIntensity > 0.0) {
                vec3 pulseColor = mix(vec3(1.0), uPulseColors[0], 0.3);
                finalColor = mix(baseColor, pulseColor, vPulseIntensity * 0.5);
                flowIntensity += vPulseIntensity * 0.3;
            }
            
            finalColor *= (0.6 + flowIntensity + vConnectionStrength * 0.4);
            
            // 应用亮度参数
            finalColor *= uBrightness;
            
            float alpha = 0.8 * vConnectionStrength + 0.2 * flowPattern;
            alpha = mix(alpha, min(1.0, alpha * 2.0), vPulseIntensity);
            
            // 应用透明度参数
            gl_FragColor = vec4(finalColor, alpha * uOpacity);
        }
    `
};

// Shader uniforms
const pulseUniforms = {
    uTime: { value: 0.0 },
    uPulsePositions: { value: [new THREE.Vector3(1e3, 1e3, 1e3), new THREE.Vector3(1e3, 1e3, 1e3), new THREE.Vector3(1e3, 1e3, 1e3)] },
    uPulseTimes: { value: [-1e3, -1e3, -1e3] },
    uPulseColors: { value: [new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1), new THREE.Color(1, 1, 1)] },
         uPulseSpeed: { value: 3.0 },
    uActivePalette: { value: 0 }
};

// Variables to store model components
let glbModel = null;
let pointsObject = null;
let wireframeObject = null;
let lastPulseIndex = 0;
let extractedVertices = [];
let extractedEdges = [];

// Load the GLB model and extract vertices and edges
function loadModel() {
    const loader = new GLTFLoader();
    
    loader.load(
        './model/Untitled2.glb',
        (gltf) => {
            glbModel = gltf.scene;
            
            // Center the model
            const box = new THREE.Box3().setFromObject(glbModel);
            const center = box.getCenter(new THREE.Vector3());
            glbModel.position.sub(center);
            
            // Scale the model to a reasonable size
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 2) {
                const scale = 2 / maxDim;
                glbModel.scale.set(scale, scale, scale);
            }
            
            scene.add(glbModel);
            glbModel.visible = false; // Hide original model
            
            // Extract vertices and edges from the model
            extractGeometryFromModel(glbModel);
            createShaderObjects();
            
            console.log('Model loaded and processed successfully!');
        },
        (xhr) => {
            console.log(`${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
        },
        (error) => {
            console.error('Error loading model:', error);
        }
    );
}

// Extract vertices and edges from the model
function extractGeometryFromModel(model) {
    // Extract vertices and create edges from the model
    extractedVertices = [];
    extractedEdges = [];
    
    model.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const geometry = child.geometry;
            let positionAttribute = geometry.getAttribute('position');
            
            if (!positionAttribute) return;
            
            // Get vertices
            const vertices = [];
            for (let i = 0; i < positionAttribute.count; i++) {
                const vertex = new THREE.Vector3();
                vertex.fromBufferAttribute(positionAttribute, i);
                
                // Transform vertex to world coordinates
                vertex.applyMatrix4(child.matrixWorld);
                
                // Add to extracted vertices
                vertices.push({
                    position: vertex.clone(),
                    size: THREE.MathUtils.randFloat(0.1, 0.3)
                });
            }
            
            // Get edges from faces (if indexed geometry)
            if (geometry.index) {
                const indices = geometry.index.array;
                
                for (let i = 0; i < indices.length; i += 3) {
                    const a = indices[i];
                    const b = indices[i + 1];
                    const c = indices[i + 2];
                    
                    // Create edges for this triangle
                    extractedEdges.push({ 
                        from: vertices[a].position.clone(), 
                        to: vertices[b].position.clone(),
                        strength: THREE.MathUtils.randFloat(0.5, 1.0)
                    });
                    extractedEdges.push({ 
                        from: vertices[b].position.clone(), 
                        to: vertices[c].position.clone(),
                        strength: THREE.MathUtils.randFloat(0.5, 1.0)
                    });
                    extractedEdges.push({ 
                        from: vertices[c].position.clone(), 
                        to: vertices[a].position.clone(),
                        strength: THREE.MathUtils.randFloat(0.5, 1.0)
                    });
                }
            }
            
            // Add all vertices to the global collection
            extractedVertices.push(...vertices);
        }
    });
    
    console.log(`Extracted ${extractedVertices.length} vertices and ${extractedEdges.length} edges`);
}

// Create shader-based objects from extracted geometry
function createShaderObjects() {
    // Clear any existing objects
    if (pointsObject) {
        scene.remove(pointsObject);
        pointsObject.geometry.dispose();
        pointsObject.material.dispose();
    }
    
    if (wireframeObject) {
        scene.remove(wireframeObject);
        wireframeObject.geometry.dispose();
        wireframeObject.material.dispose();
    }
    
    // Create points object
    const pointsGeometry = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];
    const colors = [];
    
    for (const vertex of extractedVertices) {
        positions.push(vertex.position.x, vertex.position.y, vertex.position.z);
        // Reduce point sizes by 40%
        sizes.push(vertex.size * 0.6);
        
        // Get color from palette based on vertex position
        const palette = colorPalettes[config.activePaletteIndex];
        const distanceFromCenter = vertex.position.length();
        const colorIndex = Math.floor(Math.min(distanceFromCenter, palette.length - 1));
        const color = palette[colorIndex % palette.length].clone();
        
        // Add slight variation to color
        color.offsetHSL(
            THREE.MathUtils.randFloatSpread(0.05),
            THREE.MathUtils.randFloatSpread(0.1),
            THREE.MathUtils.randFloatSpread(0.1)
        );
        
        // Reduce brightness by 30%
        color.multiplyScalar(0.7);
        
        colors.push(color.r, color.g, color.b);
    }
    
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    pointsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    pointsGeometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
    
    // 克隆基本统一变量并添加新的参数
    const pointsUniforms = THREE.UniformsUtils.clone(pulseUniforms);
    pointsUniforms.pointSize = { value: 1.0 };
    pointsUniforms.uBrightness = { value: 0.7 };
    pointsUniforms.uOpacity = { value: 0.8 };
    pointsUniforms.pulseIntensity = { value: 0.8 };
    
    const pointsMaterial = new THREE.ShaderMaterial({
        uniforms: pointsUniforms,
        vertexShader: vertexShader.vertexShader,
        fragmentShader: vertexShader.fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    pointsObject = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(pointsObject);
    
    // Create wireframe object
    const edgeGeometry = new THREE.BufferGeometry();
    const edgePositions = [];
    const edgeColors = [];
    const edgeStrengths = [];
    
    for (const edge of extractedEdges) {
        // Create line segment
        edgePositions.push(edge.from.x, edge.from.y, edge.from.z);
        edgePositions.push(edge.to.x, edge.to.y, edge.to.z);
        
        // Get color from palette based on average position
        const palette = colorPalettes[config.activePaletteIndex];
        const avgPos = new THREE.Vector3().addVectors(edge.from, edge.to).multiplyScalar(0.5);
        const distanceFromCenter = avgPos.length();
        const colorIndex = Math.floor(Math.min(distanceFromCenter, palette.length - 1));
        const color = palette[colorIndex % palette.length].clone();
        
        // Add slight variation to color
        color.offsetHSL(
            THREE.MathUtils.randFloatSpread(0.05),
            THREE.MathUtils.randFloatSpread(0.1),
            THREE.MathUtils.randFloatSpread(0.1)
        );
        
        // Use same color for both vertices of line segment
        edgeColors.push(color.r, color.g, color.b);
        edgeColors.push(color.r, color.g, color.b);
        
        // Connection strength
        edgeStrengths.push(edge.strength);
        edgeStrengths.push(edge.strength);
    }
    
    edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
    edgeGeometry.setAttribute('customColor', new THREE.Float32BufferAttribute(edgeColors, 3));
    edgeGeometry.setAttribute('connectionStrength', new THREE.Float32BufferAttribute(edgeStrengths, 1));
    
    // 克隆基本统一变量并添加新的参数
    const edgeUniforms = THREE.UniformsUtils.clone(pulseUniforms);
    edgeUniforms.uBrightness = { value: 0.7 };
    edgeUniforms.uOpacity = { value: 0.8 };
    edgeUniforms.pulseIntensity = { value: 0.8 };
    
    const edgeMaterial = new THREE.ShaderMaterial({
        uniforms: edgeUniforms,
        vertexShader: edgeShader.vertexShader,
        fragmentShader: edgeShader.fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    wireframeObject = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    scene.add(wireframeObject);
}

// Update theme colors
function updateTheme(paletteIndex) {
    config.activePaletteIndex = paletteIndex;
    
    if (pointsObject && wireframeObject) {
        const palette = colorPalettes[paletteIndex];
        
        // Update point colors
        const pointColors = pointsObject.geometry.attributes.customColor;
        for (let i = 0; i < pointColors.count; i++) {
            const vertex = extractedVertices[i];
            if (!vertex) continue;
            
            const distanceFromCenter = vertex.position.length();
            const colorIndex = Math.floor(Math.min(distanceFromCenter, palette.length - 1));
            const color = palette[colorIndex % palette.length].clone();
            
            color.offsetHSL(
                THREE.MathUtils.randFloatSpread(0.05),
                THREE.MathUtils.randFloatSpread(0.1),
                THREE.MathUtils.randFloatSpread(0.1)
            );
            
            pointColors.setXYZ(i, color.r, color.g, color.b);
        }
        pointColors.needsUpdate = true;
        
        // Update edge colors
        const edgeColors = wireframeObject.geometry.attributes.customColor;
        let colorIndex = 0;
        for (let i = 0; i < extractedEdges.length; i++) {
            const edge = extractedEdges[i];
            const avgPos = new THREE.Vector3().addVectors(edge.from, edge.to).multiplyScalar(0.5);
            const distanceFromCenter = avgPos.length();
            const colorIdx = Math.floor(Math.min(distanceFromCenter, palette.length - 1));
            const color = palette[colorIdx % palette.length].clone();
            
            color.offsetHSL(
                THREE.MathUtils.randFloatSpread(0.05),
                THREE.MathUtils.randFloatSpread(0.1),
                THREE.MathUtils.randFloatSpread(0.1)
            );
            
            edgeColors.setXYZ(colorIndex, color.r, color.g, color.b);
            colorIndex++;
            edgeColors.setXYZ(colorIndex, color.r, color.g, color.b);
            colorIndex++;
        }
        edgeColors.needsUpdate = true;
        
        // Update pulse colors
        pointsObject.material.uniforms.uPulseColors.value.forEach((c, i) => c.copy(palette[i % palette.length]));
        wireframeObject.material.uniforms.uPulseColors.value.forEach((c, i) => c.copy(palette[i % palette.length]));
        pointsObject.material.uniforms.uActivePalette.value = paletteIndex;
    }
}

// Handle click events to create pulses
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const interactionPoint = new THREE.Vector3();

function triggerPulse(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(pointer, camera);
    
    // Create an interaction plane that faces the camera
    interactionPlane.normal.copy(camera.position).normalize();
    interactionPlane.constant = -interactionPlane.normal.dot(camera.position) + camera.position.length() * 0.5;
    
    if (raycaster.ray.intersectPlane(interactionPlane, interactionPoint)) {
        const time = clock.getElapsedTime();
        
        if (pointsObject && wireframeObject) {
            lastPulseIndex = (lastPulseIndex + 1) % 3;
            
            if (pointsObject) {
                pointsObject.material.uniforms.uPulsePositions.value[lastPulseIndex].copy(interactionPoint);
                pointsObject.material.uniforms.uPulseTimes.value[lastPulseIndex] = time;
                pointsObject.material.uniforms.uPulseColors.value[lastPulseIndex].copy(
                    colorPalettes[config.activePaletteIndex][Math.floor(Math.random() * colorPalettes[config.activePaletteIndex].length)]
                );
            }
            
            if (wireframeObject) {
                wireframeObject.material.uniforms.uPulsePositions.value[lastPulseIndex].copy(interactionPoint);
                wireframeObject.material.uniforms.uPulseTimes.value[lastPulseIndex] = time;
                wireframeObject.material.uniforms.uPulseColors.value[lastPulseIndex].copy(
                    colorPalettes[config.activePaletteIndex][Math.floor(Math.random() * colorPalettes[config.activePaletteIndex].length)]
                );
            }
        }
    }
}

// Event Listeners
renderer.domElement.addEventListener('click', (e) => {
    if (e.target.closest('.ui-panel, #control-buttons')) return;
    if (!config.paused) triggerPulse(e.clientX, e.clientY);
});

renderer.domElement.addEventListener('touchstart', (e) => {
    if (e.target.closest('.ui-panel, #control-buttons')) return;
    e.preventDefault();
    if (e.touches.length > 0 && !config.paused) {
        triggerPulse(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: false });

// Theme buttons event listeners
const themeButtons = document.querySelectorAll('.theme-button');
themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.theme, 10);
        updateTheme(idx);
        themeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Control buttons event listeners
const toggleWireframeBtn = document.getElementById('toggle-wireframe-btn');
const togglePointsBtn = document.getElementById('toggle-points-btn');
const pausePlayBtn = document.getElementById('pause-play-btn');
const resetCameraBtn = document.getElementById('reset-camera-btn');

// 全局旋转变量
let autoRotationEnabled = false;

toggleWireframeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    config.showWireframe = !config.showWireframe;
    if (wireframeObject) wireframeObject.visible = config.showWireframe;
    toggleWireframeBtn.textContent = config.showWireframe ? 'Wireframe' : 'No Wireframe';
});

togglePointsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    config.showPoints = !config.showPoints;
    if (pointsObject) pointsObject.visible = config.showPoints;
    togglePointsBtn.textContent = config.showPoints ? 'Points' : 'No Points';
});

pausePlayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    autoRotationEnabled = !autoRotationEnabled;
    controls.autoRotate = autoRotationEnabled;
    pausePlayBtn.textContent = autoRotationEnabled ? 'Pause' : 'Auto Rotate';
});

resetCameraBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // 重置相机到初始位置
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
});

// 添加键盘控制说明
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'r':
        case 'R':
            // 按R键切换自动旋转
            autoRotationEnabled = !autoRotationEnabled;
            controls.autoRotate = autoRotationEnabled;
            pausePlayBtn.textContent = autoRotationEnabled ? 'Pause' : 'Auto Rotate';
            break;
        case '+':
        case '=':
            // 放大
            camera.position.multiplyScalar(0.9);
            controls.update();
            break;
        case '-':
        case '_':
            // 缩小
            camera.position.multiplyScalar(1.1);
            controls.update();
            break;
    }
});

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// Animation loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    
    const t = clock.getElapsedTime();
    
    if (!config.paused) {
        if (pointsObject) {
            pointsObject.material.uniforms.uTime.value = t;
        }
        if (wireframeObject) {
            wireframeObject.material.uniforms.uTime.value = t;
        }
        
        if (glbModel) {
            glbModel.rotation.y += config.rotationSpeed;
        }
    }
    
    starField.rotation.y += 0.0003;
    
    controls.update();
    composer.render();
}

// Initialize application
function init() {
    // Set active theme button
    document.querySelector(`.theme-button[data-theme="${config.activePaletteIndex}"]`).classList.add('active');
    
    // Load model
    loadModel();
    
    // Start animation loop
    animate();
    
    // 设置主题按钮事件
    document.querySelectorAll('.theme-button').forEach(button => {
        button.addEventListener('click', function() {
            const idx = parseInt(this.dataset.theme);
            updateTheme(idx);
        });
    });
    
    // 监听参数面板的变化事件
    document.addEventListener('param-change', handleParamChange);
    
    // 初始化参数滑块
    initializeParamSliders();
}

// Start the application
init();

function handleParamChange(e) {
    const { param, value } = e.detail;
    console.log('Parameter changed:', param, value);
    
    // 根据参数ID更新相应的参数值
    switch(param) {
        // 全局设置
        case 'bloom-strength':
            if (composer) {
                const bloomPass = composer.passes.find(pass => pass instanceof UnrealBloomPass);
                if (bloomPass) bloomPass.strength = value;
            }
            break;
        case 'bloom-radius':
            if (composer) {
                const bloomPass = composer.passes.find(pass => pass instanceof UnrealBloomPass);
                if (bloomPass) bloomPass.radius = value;
            }
            break;
        case 'film-intensity':
            if (composer) {
                const filmPass = composer.passes.find(pass => pass instanceof FilmPass);
                if (filmPass) filmPass.uniforms.nIntensity.value = value;
            }
            break;
            
        // 点设置
        case 'point-size':
            if (pointsObject && pointsObject.material && pointsObject.material.uniforms && pointsObject.material.uniforms.pointSize) {
                pointsObject.material.uniforms.pointSize.value = value;
            }
            break;
        case 'point-brightness':
            if (pointsObject && pointsObject.material && pointsObject.material.uniforms && pointsObject.material.uniforms.uBrightness) {
                pointsObject.material.uniforms.uBrightness.value = value;
            }
            break;
        case 'point-opacity':
            if (pointsObject && pointsObject.material && pointsObject.material.uniforms && pointsObject.material.uniforms.uOpacity) {
                pointsObject.material.uniforms.uOpacity.value = value;
            }
            break;
            
        // 线设置
        case 'line-brightness':
            if (wireframeObject && wireframeObject.material && wireframeObject.material.uniforms && wireframeObject.material.uniforms.uBrightness) {
                wireframeObject.material.uniforms.uBrightness.value = value;
            }
            break;
        case 'line-opacity':
            if (wireframeObject && wireframeObject.material && wireframeObject.material.uniforms && wireframeObject.material.uniforms.uOpacity) {
                wireframeObject.material.uniforms.uOpacity.value = value;
            }
            break;
            
        // 脉冲设置
        case 'pulse-speed':
            if (pointsObject && pointsObject.material && pointsObject.material.uniforms && pointsObject.material.uniforms.uPulseSpeed) {
                pointsObject.material.uniforms.uPulseSpeed.value = value;
            }
            if (wireframeObject && wireframeObject.material && wireframeObject.material.uniforms && wireframeObject.material.uniforms.uPulseSpeed) {
                wireframeObject.material.uniforms.uPulseSpeed.value = value;
            }
            break;
        case 'pulse-intensity':
            if (pointsObject && pointsObject.material && pointsObject.material.uniforms && pointsObject.material.uniforms.pulseIntensity) {
                pointsObject.material.uniforms.pulseIntensity.value = value;
            }
            if (wireframeObject && wireframeObject.material && wireframeObject.material.uniforms && wireframeObject.material.uniforms.pulseIntensity) {
                wireframeObject.material.uniforms.pulseIntensity.value = value;
            }
            break;
            
        // 其他设置
        case 'stars-brightness':
            if (starField && starField.material) {
                starField.material.opacity = value;
            }
            break;
        case 'rotation-speed':
            config.rotationSpeed = value;
            break;
    }
}

// 初始化参数滑块
function initializeParamSliders() {
    // 全局设置
    document.getElementById('bloom-strength').value = bloomPass.strength;
    document.getElementById('bloom-strength-value').textContent = bloomPass.strength;
    
    document.getElementById('bloom-radius').value = bloomPass.radius;
    document.getElementById('bloom-radius-value').textContent = bloomPass.radius;
    
    document.getElementById('film-intensity').value = filmPass.uniforms.nIntensity.value;
    document.getElementById('film-intensity-value').textContent = filmPass.uniforms.nIntensity.value;
    
    // 脉冲设置
    document.getElementById('pulse-speed').value = pulseUniforms.uPulseSpeed.value;
    document.getElementById('pulse-speed-value').textContent = pulseUniforms.uPulseSpeed.value;
    
    // 旋转速度
    document.getElementById('rotation-speed').value = config.rotationSpeed;
    document.getElementById('rotation-speed-value').textContent = config.rotationSpeed;
    
    // 获取现有材质属性来初始化其他参数
    if (pointsObject && wireframeObject) {
        // 添加点大小控制到着色器uniforms
        pointsObject.material.uniforms.pointSize = { value: 0.6 };
        document.getElementById('point-size').value = 0.6;
        document.getElementById('point-size-value').textContent = '0.6';
        
        // 添加亮度控制到着色器
        pointsObject.material.uniforms.brightness = { value: 0.7 };
        document.getElementById('point-brightness').value = 0.7;
        document.getElementById('point-brightness-value').textContent = '0.7';
        
        wireframeObject.material.uniforms.brightness = { value: 0.7 };
        document.getElementById('line-brightness').value = 0.7;
        document.getElementById('line-brightness-value').textContent = '0.7';
        
        // 添加透明度控制到着色器
        pointsObject.material.uniforms.opacity = { value: 0.8 };
        document.getElementById('point-opacity').value = 0.8;
        document.getElementById('point-opacity-value').textContent = '0.8';
        
        wireframeObject.material.uniforms.opacity = { value: 0.8 };
        document.getElementById('line-opacity').value = 0.8;
        document.getElementById('line-opacity-value').textContent = '0.8';
        
        // 添加脉冲强度控制
        pointsObject.material.uniforms.pulseIntensity = { value: 0.8 };
        wireframeObject.material.uniforms.pulseIntensity = { value: 0.8 };
        document.getElementById('pulse-intensity').value = 0.8;
        document.getElementById('pulse-intensity-value').textContent = '0.8';
        
        // 为顶点着色器添加点大小控制
        const originalVertexShader = pointsObject.material.vertexShader;
        pointsObject.material.onBeforeCompile = (shader) => {
            shader.uniforms.pointSize = pointsObject.material.uniforms.pointSize;
            shader.vertexShader = shader.vertexShader.replace(
                'gl_PointSize = pulseSize * (400.0 / -mvPosition.z);',
                'gl_PointSize = pulseSize * (400.0 / -mvPosition.z) * uniforms.pointSize.value;'
            );
        };
        pointsObject.material.needsUpdate = true;
        
        // 添加星空亮度控制
        if (starField && starField.material) {
            starField.material.uniforms = starField.material.uniforms || {};
            starField.material.uniforms.brightness = { value: 0.7 };
            document.getElementById('stars-brightness').value = 0.7;
            document.getElementById('stars-brightness-value').textContent = '0.7';
        }
    }
    
    // 修改点和线的着色器，添加亮度和透明度控制
    if (pointsObject) {
        const originalFragmentShader = pointsObject.material.fragmentShader;
        pointsObject.material.fragmentShader = originalFragmentShader.replace(
            'gl_FragColor = vec4(finalColor, alpha * distanceFade * 0.8);',
            'gl_FragColor = vec4(finalColor * uBrightness, alpha * distanceFade * 0.8 * uOpacity);'
        );
        
        // 添加新的uniforms
        pointsObject.material.uniforms.uBrightness = { value: 0.7 };
        pointsObject.material.uniforms.uOpacity = { value: 0.8 };
        pointsObject.material.needsUpdate = true;
    }
    
    if (wireframeObject) {
        const originalFragmentShader = wireframeObject.material.fragmentShader;
        wireframeObject.material.fragmentShader = originalFragmentShader.replace(
            'gl_FragColor = vec4(finalColor, alpha);',
            'gl_FragColor = vec4(finalColor * uBrightness, alpha * uOpacity);'
        );
        
        // 添加新的uniforms
        wireframeObject.material.uniforms.uBrightness = { value: 0.7 };
        wireframeObject.material.uniforms.uOpacity = { value: 0.8 };
        wireframeObject.material.needsUpdate = true;
    }
}

// 重构setupEventListeners，移除重复的参数事件监听器
function setupEventListeners() {
    // 窗口大小调整
    window.addEventListener('resize', onWindowResize, false);
    
    // 点击屏幕创建脉冲
    window.addEventListener('click', (event) => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        triggerPulse(x, y);
    });
    
    // 键盘控制
    window.addEventListener('keydown', (event) => {
        switch(event.key) {
            case 'r':
            case 'R':
                autoRotationEnabled = !autoRotationEnabled;
                controls.autoRotate = autoRotationEnabled;
                pausePlayBtn.textContent = autoRotationEnabled ? "Auto Rotate" : "Rotate Off";
                break;
            case '+':
            case '=':
                camera.position.z = Math.max(controls.minDistance, camera.position.z - 0.5);
                break;
            case '-':
            case '_':
                camera.position.z = Math.min(controls.maxDistance, camera.position.z + 0.5);
                break;
        }
    });
    
    // 按钮事件监听
    document.getElementById('toggle-wireframe-btn').addEventListener('click', function() {
        config.showWireframe = !config.showWireframe;
        if (wireframeObject) wireframeObject.visible = config.showWireframe;
        this.textContent = config.showWireframe ? "Wireframe" : "No Wireframe";
    });
    
    document.getElementById('toggle-points-btn').addEventListener('click', function() {
        config.showPoints = !config.showPoints;
        if (pointsObject) pointsObject.visible = config.showPoints;
        this.textContent = config.showPoints ? "Points" : "No Points";
    });
    
    document.getElementById('pause-play-btn').addEventListener('click', function() {
        autoRotationEnabled = !autoRotationEnabled;
        controls.autoRotate = autoRotationEnabled;
        this.textContent = autoRotationEnabled ? "Auto Rotate" : "Rotate Off";
    });
    
    document.getElementById('reset-camera-btn').addEventListener('click', function() {
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        controls.reset();
    });
} 