/**
 * WebGPU计算着色器管理器
 * 提供高性能的GPU计算能力，用于粒子系统、物理模拟等
 */

import '@/types/webgpu' // 导入WebGPU类型定义

export interface ComputeShaderConfig {
  workgroupSize: [number, number, number]
  bufferSize: number
  iterations: number
}

export interface ParticleSystemConfig extends ComputeShaderConfig {
  particleCount: number
  deltaTime: number
  gravity: [number, number, number]
  damping: number
}

export class ComputeShaderManager {
  private static instance: ComputeShaderManager
  private device: GPUDevice | null = null
  private shaderCache = new Map<string, GPUComputePipeline>()
  private bufferCache = new Map<string, GPUBuffer>()

  private constructor() {}

  static getInstance(): ComputeShaderManager {
    if (!ComputeShaderManager.instance) {
      ComputeShaderManager.instance = new ComputeShaderManager()
    }
    return ComputeShaderManager.instance
  }

  /**
   * 初始化计算着色器管理器
   */
  async initialize(device: GPUDevice): Promise<void> {
    this.device = device
    console.log('⚡ 计算着色器管理器初始化完成')
  }

  /**
   * 粒子系统更新计算着色器
   */
  private static PARTICLE_UPDATE_SHADER = `
    struct Particle {
      position: vec3<f32>,
      velocity: vec3<f32>,
      life: f32,
      size: f32,
    }

    struct SimParams {
      deltaTime: f32,
      gravity: vec3<f32>,
      damping: f32,
      particleCount: u32,
    }

    @group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
    @group(0) @binding(1) var<uniform> params: SimParams;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let index = global_id.x;
      if (index >= params.particleCount) {
        return;
      }

      var particle = particles[index];
      
      // 应用重力
      particle.velocity += params.gravity * params.deltaTime;
      
      // 应用阻尼
      particle.velocity *= params.damping;
      
      // 更新位置
      particle.position += particle.velocity * params.deltaTime;
      
      // 更新生命周期
      particle.life -= params.deltaTime;
      
      // 重置死亡的粒子
      if (particle.life <= 0.0) {
        particle.position = vec3<f32>(
          (f32(index) % 100.0 - 50.0) * 0.1,
          10.0,
          (f32(index / 100u) % 100.0 - 50.0) * 0.1
        );
        particle.velocity = vec3<f32>(
          (f32(index * 17u) % 200.0 - 100.0) * 0.01,
          0.0,
          (f32(index * 31u) % 200.0 - 100.0) * 0.01
        );
        particle.life = 5.0 + f32(index % 50u) * 0.1;
        particle.size = 0.5 + f32(index % 10u) * 0.1;
      }
      
      particles[index] = particle;
    }
  `

  /**
   * 星球轨道计算着色器
   */
  private static ORBITAL_MECHANICS_SHADER = `
    struct Planet {
      position: vec3<f32>,
      velocity: vec3<f32>,
      mass: f32,
      radius: f32,
      angle: f32,
      distance: f32,
    }

    struct OrbitParams {
      deltaTime: f32,
      centralMass: f32,
      planetCount: u32,
      gravitationalConstant: f32,
    }

    @group(0) @binding(0) var<storage, read_write> planets: array<Planet>;
    @group(0) @binding(1) var<uniform> params: OrbitParams;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
      let index = global_id.x;
      if (index >= params.planetCount) {
        return;
      }

      var planet = planets[index];
      
      // 计算轨道运动
      let orbitalSpeed = sqrt(params.gravitationalConstant * params.centralMass / planet.distance);
      planet.angle += orbitalSpeed * params.deltaTime / planet.distance;
      
      // 更新位置
      planet.position.x = cos(planet.angle) * planet.distance;
      planet.position.z = sin(planet.angle) * planet.distance;
      planet.position.y = 1.8 * sin(0.4 * planet.distance + planet.angle);
      
      planets[index] = planet;
    }
  `

  /**
   * 创建粒子系统计算管线
   */
  async createParticleSystemPipeline(config: ParticleSystemConfig): Promise<{
    pipeline: GPUComputePipeline,
    bindGroup: GPUBindGroup,
    particleBuffer: GPUBuffer,
    uniformBuffer: GPUBuffer
  }> {
    if (!this.device) {
      throw new Error('ComputeShaderManager not initialized')
    }

    const pipelineKey = `particle_${config.particleCount}_${config.workgroupSize.join('_')}`
    
    // 检查缓存
    let pipeline = this.shaderCache.get(pipelineKey)
    if (!pipeline) {
      // 创建着色器模块
      const shaderModule = this.device.createShaderModule({
        code: ComputeShaderManager.PARTICLE_UPDATE_SHADER
      })

      // 创建计算管线
      pipeline = this.device.createComputePipeline({
        layout: 'auto',
        compute: {
          module: shaderModule,
          entryPoint: 'main'
        }
      })

      this.shaderCache.set(pipelineKey, pipeline)
    }

    // 创建粒子缓冲区
    const particleBufferSize = config.particleCount * 8 * 4 // 8个float32值
    const particleBuffer = this.device.createBuffer({
      size: particleBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
    })

    // 初始化粒子数据
    const particleData = new Float32Array(config.particleCount * 8)
    for (let i = 0; i < config.particleCount; i++) {
      const offset = i * 8
      // position
      particleData[offset + 0] = (Math.random() - 0.5) * 20
      particleData[offset + 1] = Math.random() * 10
      particleData[offset + 2] = (Math.random() - 0.5) * 20
      // velocity
      particleData[offset + 3] = (Math.random() - 0.5) * 2
      particleData[offset + 4] = 0
      particleData[offset + 5] = (Math.random() - 0.5) * 2
      // life
      particleData[offset + 6] = Math.random() * 5 + 1
      // size
      particleData[offset + 7] = Math.random() * 0.5 + 0.5
    }

    this.device.queue.writeBuffer(particleBuffer, 0, particleData)

    // 创建uniform缓冲区
    const uniformBuffer = this.device.createBuffer({
      size: 32, // deltaTime(4) + gravity(12) + damping(4) + particleCount(4) + padding(8)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    // 更新uniform数据
    const uniformData = new Float32Array(8)
    uniformData[0] = config.deltaTime
    uniformData[1] = config.gravity[0]
    uniformData[2] = config.gravity[1]
    uniformData[3] = config.gravity[2]
    uniformData[4] = config.damping
    uniformData[5] = config.particleCount
    this.device.queue.writeBuffer(uniformBuffer, 0, uniformData)

    // 创建绑定组
    const bindGroup = this.device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: particleBuffer
          }
        },
        {
          binding: 1,
          resource: {
            buffer: uniformBuffer
          }
        }
      ]
    })

    return {
      pipeline,
      bindGroup,
      particleBuffer,
      uniformBuffer
    }
  }

  /**
   * 创建轨道力学计算管线
   */
  async createOrbitalMechanicsPipeline(planetCount: number): Promise<{
    pipeline: GPUComputePipeline,
    bindGroup: GPUBindGroup,
    planetBuffer: GPUBuffer,
    uniformBuffer: GPUBuffer
  }> {
    if (!this.device) {
      throw new Error('ComputeShaderManager not initialized')
    }

    const pipelineKey = `orbital_${planetCount}`
    
    let pipeline = this.shaderCache.get(pipelineKey)
    if (!pipeline) {
      const shaderModule = this.device.createShaderModule({
        code: ComputeShaderManager.ORBITAL_MECHANICS_SHADER
      })

      pipeline = this.device.createComputePipeline({
        layout: 'auto',
        compute: {
          module: shaderModule,
          entryPoint: 'main'
        }
      })

      this.shaderCache.set(pipelineKey, pipeline)
    }

    // 创建星球缓冲区
    const planetBufferSize = planetCount * 8 * 4 // 8个float32值
    const planetBuffer = this.device.createBuffer({
      size: planetBufferSize,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
    })

    // 创建uniform缓冲区
    const uniformBuffer = this.device.createBuffer({
      size: 16, // deltaTime(4) + centralMass(4) + planetCount(4) + gravitationalConstant(4)
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })

    // 创建绑定组
    const bindGroup = this.device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: planetBuffer
          }
        },
        {
          binding: 1,
          resource: {
            buffer: uniformBuffer
          }
        }
      ]
    })

    return {
      pipeline,
      bindGroup,
      planetBuffer,
      uniformBuffer
    }
  }

  /**
   * 执行计算着色器
   */
  async dispatch(
    pipeline: GPUComputePipeline,
    bindGroup: GPUBindGroup,
    workgroupCount: [number, number, number]
  ): Promise<void> {
    if (!this.device) {
      throw new Error('ComputeShaderManager not initialized')
    }

    const commandEncoder = this.device.createCommandEncoder()
    const computePass = commandEncoder.beginComputePass()
    
    computePass.setPipeline(pipeline)
    computePass.setBindGroup(0, bindGroup)
    computePass.dispatchWorkgroups(workgroupCount[0], workgroupCount[1], workgroupCount[2])
    computePass.end()

    this.device.queue.submit([commandEncoder.finish()])
  }

  /**
   * 读取缓冲区数据
   */
  async readBuffer(buffer: GPUBuffer, size: number): Promise<ArrayBuffer> {
    if (!this.device) {
      throw new Error('ComputeShaderManager not initialized')
    }

    const readBuffer = this.device.createBuffer({
      size: size,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    })

    const commandEncoder = this.device.createCommandEncoder()
    commandEncoder.copyBufferToBuffer(buffer, 0, readBuffer, 0, size)
    this.device.queue.submit([commandEncoder.finish()])

    await readBuffer.mapAsync(GPUMapMode.READ)
    const data = readBuffer.getMappedRange()
    const result = data.slice(0)
    readBuffer.unmap()
    readBuffer.destroy()

    return result
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.shaderCache.clear()
    this.bufferCache.forEach(buffer => buffer.destroy())
    this.bufferCache.clear()
    this.device = null
  }
}

/**
 * 获取全局计算着色器管理器实例
 */
export const computeShaderManager = ComputeShaderManager.getInstance()
