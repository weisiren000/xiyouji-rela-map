import * as THREE from 'three'

/**
 * 着色器管理器
 * 提供优化的自定义着色器，减少GPU计算复杂度
 */
export class ShaderManager {
  private static instance: ShaderManager
  private shaderCache = new Map<string, THREE.ShaderMaterial>()

  private constructor() {}

  static getInstance(): ShaderManager {
    if (!ShaderManager.instance) {
      ShaderManager.instance = new ShaderManager()
    }
    return ShaderManager.instance
  }

  /**
   * 优化的实例化球体顶点着色器
   */
  private static INSTANCED_SPHERE_VERTEX_SHADER = `
    attribute vec3 instancePosition;
    attribute vec3 instanceColor;
    attribute float instanceScale;
    
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vColor = instanceColor;
      vNormal = normalize(normalMatrix * normal);
      
      // 应用实例变换
      vec3 transformed = position * instanceScale + instancePosition;
      vPosition = transformed;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }
  `

  /**
   * 优化的实例化球体片段着色器
   */
  private static INSTANCED_SPHERE_FRAGMENT_SHADER = `
    uniform float time;
    uniform float emissiveIntensity;
    uniform vec3 emissiveColor;
    
    varying vec3 vColor;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      // 简化的光照计算
      vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
      float lightIntensity = max(dot(vNormal, lightDirection), 0.2);
      
      // 基础颜色
      vec3 baseColor = vColor * lightIntensity;
      
      // 发光效果
      vec3 emissive = emissiveColor * emissiveIntensity;
      
      // 最终颜色
      vec3 finalColor = baseColor + emissive;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `

  /**
   * 优化的粒子系统顶点着色器
   */
  private static PARTICLE_VERTEX_SHADER = `
    attribute float size;
    attribute vec3 color;
    
    varying vec3 vColor;
    
    void main() {
      vColor = color;
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `

  /**
   * 优化的粒子系统片段着色器
   */
  private static PARTICLE_FRAGMENT_SHADER = `
    varying vec3 vColor;
    
    void main() {
      // 创建圆形粒子
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      if (dist > 0.5) discard;
      
      // 软边缘
      float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
      
      gl_FragColor = vec4(vColor, alpha);
    }
  `

  /**
   * 创建优化的实例化球体材质
   */
  createInstancedSphereMaterial(params: {
    emissiveColor?: THREE.Vector3
    emissiveIntensity?: number
    transparent?: boolean
    opacity?: number
  } = {}): THREE.ShaderMaterial {
    const key = `instanced_sphere_${JSON.stringify(params)}`
    
    if (this.shaderCache.has(key)) {
      return this.shaderCache.get(key)!
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: ShaderManager.INSTANCED_SPHERE_VERTEX_SHADER,
      fragmentShader: ShaderManager.INSTANCED_SPHERE_FRAGMENT_SHADER,
      uniforms: {
        time: { value: 0 },
        emissiveColor: { value: params.emissiveColor || new THREE.Vector3(1, 1, 1) },
        emissiveIntensity: { value: params.emissiveIntensity || 0.3 }
      },
      transparent: params.transparent || false,
      opacity: params.opacity || 1.0
    })

    this.shaderCache.set(key, material)
    return material
  }

  /**
   * 创建优化的粒子材质
   */
  createParticleMaterial(params: {
    transparent?: boolean
    blending?: THREE.Blending
    depthWrite?: boolean
  } = {}): THREE.ShaderMaterial {
    const key = `particle_${JSON.stringify(params)}`
    
    if (this.shaderCache.has(key)) {
      return this.shaderCache.get(key)!
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: ShaderManager.PARTICLE_VERTEX_SHADER,
      fragmentShader: ShaderManager.PARTICLE_FRAGMENT_SHADER,
      transparent: params.transparent !== false,
      blending: params.blending || THREE.AdditiveBlending,
      depthWrite: params.depthWrite || false
    })

    this.shaderCache.set(key, material)
    return material
  }

  /**
   * 创建简化的标准材质替代品
   */
  createSimplifiedStandardMaterial(params: {
    color?: THREE.Color
    emissive?: THREE.Color
    emissiveIntensity?: number
    metalness?: number
    roughness?: number
  } = {}): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform vec3 color;
      uniform vec3 emissive;
      uniform float emissiveIntensity;
      uniform float metalness;
      uniform float roughness;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        // 简化的PBR光照
        vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
        float NdotL = max(dot(vNormal, lightDirection), 0.0);
        
        // 基础漫反射
        vec3 diffuse = color * NdotL;
        
        // 简化的镜面反射
        vec3 viewDirection = normalize(-vPosition);
        vec3 reflectDirection = reflect(-lightDirection, vNormal);
        float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), 32.0);
        
        // 金属度和粗糙度影响
        vec3 finalColor = mix(diffuse, diffuse + specular * metalness, 1.0 - roughness);
        
        // 发光
        finalColor += emissive * emissiveIntensity;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    const key = `simplified_standard_${JSON.stringify(params)}`
    
    if (this.shaderCache.has(key)) {
      return this.shaderCache.get(key)!
    }

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        color: { value: params.color || new THREE.Color(0xffffff) },
        emissive: { value: params.emissive || new THREE.Color(0x000000) },
        emissiveIntensity: { value: params.emissiveIntensity || 0.0 },
        metalness: { value: params.metalness || 0.0 },
        roughness: { value: params.roughness || 1.0 }
      }
    })

    this.shaderCache.set(key, material)
    return material
  }

  /**
   * 更新着色器时间uniform
   */
  updateTime(time: number): void {
    this.shaderCache.forEach(material => {
      if (material.uniforms.time) {
        material.uniforms.time.value = time
      }
    })
  }

  /**
   * 清理着色器缓存
   */
  dispose(): void {
    this.shaderCache.forEach(material => material.dispose())
    this.shaderCache.clear()
  }
}

/**
 * 获取全局着色器管理器实例
 */
export const shaderManager = ShaderManager.getInstance()
