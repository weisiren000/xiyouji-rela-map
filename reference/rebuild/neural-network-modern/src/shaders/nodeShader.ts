import { noiseFunctions } from './noise'

export const nodeShader = {
  vertexShader: `
    ${noiseFunctions}
    
    attribute float nodeSize;
    attribute float nodeType;
    attribute vec3 nodeColor;
    attribute float distanceFromRoot;
    
    uniform float uTime;
    uniform vec3 uPulsePositions[3];
    uniform float uPulseTimes[3];
    uniform float uPulseSpeed;
    uniform float uBaseNodeSize;
    
    varying vec3 vColor;
    varying float vNodeType;
    varying vec3 vPosition;
    varying float vPulseIntensity;
    varying float vDistanceFromRoot;
    
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
        vNodeType = nodeType;
        vColor = nodeColor;
        vDistanceFromRoot = distanceFromRoot;
        vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vPosition = worldPos;
        float totalPulseIntensity = 0.0;
        for (int i = 0; i < 3; i++) {
            totalPulseIntensity += getPulseIntensity(worldPos, uPulsePositions[i], uPulseTimes[i]);
        }
        vPulseIntensity = min(totalPulseIntensity, 1.0);
        float timeScale = 0.5 + 0.5 * sin(uTime * 0.8 + distanceFromRoot * 0.2);
        float baseSize = nodeSize * (0.8 + 0.2 * timeScale);
        float pulseSize = baseSize * (1.0 + vPulseIntensity * 2.0);
        vec3 modifiedPosition = position;
        if (nodeType > 0.5) {
            float noise = fbm(position * 0.1, uTime * 0.1);
            modifiedPosition += normal * noise * 0.2;
        }
        vec4 mvPosition = modelViewMatrix * vec4(modifiedPosition, 1.0);
        gl_PointSize = pulseSize * uBaseNodeSize * (800.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
  `,
  
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uPulseColors[3];
    uniform int uActivePalette;
    varying vec3 vColor;
    varying float vNodeType;
    varying vec3 vPosition;
    varying float vPulseIntensity;
    varying float vDistanceFromRoot;
    
    void main() {
        vec2 center = 2.0 * gl_PointCoord - 1.0;
        float dist = length(center);
        if (dist > 1.0) discard;
        float glowStrength = 1.0 - smoothstep(0.0, 1.0, dist);
        glowStrength = pow(glowStrength, 1.4);
        vec3 baseColor = vColor * (0.8 + 0.2 * sin(uTime * 0.5 + vDistanceFromRoot * 0.3));
        vec3 finalColor = baseColor;
        if (vPulseIntensity > 0.0) {
            vec3 pulseColor = mix(vec3(1.0), uPulseColors[0], 0.3);
            finalColor = mix(baseColor, pulseColor, vPulseIntensity);
            finalColor *= (1.0 + vPulseIntensity * 0.7);
        }
        float alpha = glowStrength * (0.9 - 0.5 * dist);
        float camDistance = length(vPosition - cameraPosition);
        float distanceFade = smoothstep(80.0, 10.0, camDistance);
        if (vNodeType > 0.5) {
            alpha *= 0.85;
        } else {
            finalColor *= 1.2;
        }
        gl_FragColor = vec4(finalColor, alpha * distanceFade);
    }
  `
}