import { noiseFunctions } from './noise'

export const connectionShader = {
  vertexShader: `
    ${noiseFunctions}
    
    attribute vec3 startPoint;
    attribute vec3 endPoint;
    attribute float connectionStrength;
    attribute float pathIndex;
    attribute vec3 connectionColor;
    
    uniform float uTime;
    uniform vec3 uPulsePositions[3];
    uniform float uPulseTimes[3];
    uniform float uPulseSpeed;
    
    varying vec3 vColor;
    varying float vConnectionStrength;
    varying float vPulseIntensity;
    varying float vPathPosition;
    
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
        float t = position.x;
        vPathPosition = t;
        vec3 midPoint = mix(startPoint, endPoint, 0.5);
        float pathOffset = sin(t * 3.14159) * 0.1;
        vec3 direction = normalize(endPoint - startPoint);
        vec3 perpendicular = normalize(cross(direction, vec3(0.0, 1.0, 0.0)));
        if (length(perpendicular) < 0.1) {
            perpendicular = vec3(1.0, 0.0, 0.0);
        }
        midPoint += perpendicular * pathOffset;
        vec3 p0 = mix(startPoint, midPoint, t);
        vec3 p1 = mix(midPoint, endPoint, t);
        vec3 finalPos = mix(p0, p1, t);
        float noiseTime = uTime * 0.2;
        float noise = fbm(vec3(pathIndex * 0.1, t * 0.5, noiseTime), noiseTime);
        finalPos += perpendicular * noise * 0.1;
        vec3 worldPos = (modelMatrix * vec4(finalPos, 1.0)).xyz;
        float totalPulseIntensity = 0.0;
        for (int i = 0; i < 3; i++) {
            totalPulseIntensity += getPulseIntensity(worldPos, uPulsePositions[i], uPulseTimes[i]);
        }
        vPulseIntensity = min(totalPulseIntensity, 1.0);
        vColor = connectionColor;
        vConnectionStrength = connectionStrength;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uPulseColors[3];
    varying vec3 vColor;
    varying float vConnectionStrength;
    varying float vPulseIntensity;
    varying float vPathPosition;
    
    void main() {
        vec3 baseColor = vColor * (0.7 + 0.3 * sin(uTime * 0.5 + vPathPosition * 10.0));
        float flowPattern = sin(vPathPosition * 20.0 - uTime * 3.0) * 0.5 + 0.5;
        float flowIntensity = 0.3 * flowPattern * vConnectionStrength;
        vec3 finalColor = baseColor;
        if (vPulseIntensity > 0.0) {
            vec3 pulseColor = mix(vec3(1.0), uPulseColors[0], 0.3);
            finalColor = mix(baseColor, pulseColor, vPulseIntensity);
            flowIntensity += vPulseIntensity * 0.5;
        }
        finalColor *= (0.6 + flowIntensity + vConnectionStrength * 0.4);
        float alpha = 0.8 * vConnectionStrength + 0.2 * flowPattern;
        alpha = mix(alpha, min(1.0, alpha * 2.0), vPulseIntensity);
        gl_FragColor = vec4(finalColor, alpha);
    }
  `
}