/**
 * WebGPU类型定义
 * 为WebGPU API提供TypeScript类型支持
 */

// 扩展Navigator接口以包含gpu属性
declare global {
  interface Navigator {
    gpu?: GPU
  }

  interface GPU {
    requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>
  }

  interface GPURequestAdapterOptions {
    powerPreference?: 'low-power' | 'high-performance'
    forceFallbackAdapter?: boolean
  }

  interface GPUAdapter {
    features: GPUSupportedFeatures
    limits: GPUSupportedLimits
    info: GPUAdapterInfo
    requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>
  }

  interface GPUSupportedFeatures extends Set<string> {}

  interface GPUSupportedLimits {
    maxTextureDimension1D: number
    maxTextureDimension2D: number
    maxTextureDimension3D: number
    maxTextureArrayLayers: number
    maxBindGroups: number
    maxBindingsPerBindGroup: number
    maxDynamicUniformBuffersPerPipelineLayout: number
    maxDynamicStorageBuffersPerPipelineLayout: number
    maxSampledTexturesPerShaderStage: number
    maxSamplersPerShaderStage: number
    maxStorageBuffersPerShaderStage: number
    maxStorageTexturesPerShaderStage: number
    maxUniformBuffersPerShaderStage: number
    maxUniformBufferBindingSize: number
    maxStorageBufferBindingSize: number
    minUniformBufferOffsetAlignment: number
    minStorageBufferOffsetAlignment: number
    maxVertexBuffers: number
    maxBufferSize: number
    maxVertexAttributes: number
    maxVertexBufferArrayStride: number
    maxInterStageShaderComponents: number
    maxComputeWorkgroupStorageSize: number
    maxComputeInvocationsPerWorkgroup: number
    maxComputeWorkgroupSizeX: number
    maxComputeWorkgroupSizeY: number
    maxComputeWorkgroupSizeZ: number
    maxComputeWorkgroupsPerDimension: number
  }

  interface GPUAdapterInfo {
    vendor: string
    architecture: string
    device: string
    description: string
  }

  interface GPUDeviceDescriptor {
    label?: string
    requiredFeatures?: Iterable<string>
    requiredLimits?: Record<string, number>
  }

  interface GPUDevice extends EventTarget {
    features: GPUSupportedFeatures
    limits: GPUSupportedLimits
    queue: GPUQueue
    lost: Promise<GPUDeviceLostInfo>
    label: string

    destroy(): void
    createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer
    createTexture(descriptor: GPUTextureDescriptor): GPUTexture
    createSampler(descriptor?: GPUSamplerDescriptor): GPUSampler
    createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout
    createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout
    createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup
    createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule
    createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline
    createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline
    createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor): GPUCommandEncoder
    createRenderBundleEncoder(descriptor: GPURenderBundleEncoderDescriptor): GPURenderBundleEncoder
    createQuerySet(descriptor: GPUQuerySetDescriptor): GPUQuerySet
    pushErrorScope(filter: GPUErrorFilter): void
    popErrorScope(): Promise<GPUError | null>
  }

  interface GPUQueue {
    label: string
    submit(commandBuffers: Iterable<GPUCommandBuffer>): void
    onSubmittedWorkDone(): Promise<void>
    writeBuffer(buffer: GPUBuffer, bufferOffset: number, data: BufferSource, dataOffset?: number, size?: number): void
    writeTexture(destination: GPUImageCopyTexture, data: BufferSource, dataLayout: GPUImageDataLayout, size: GPUExtent3D): void
    copyExternalImageToTexture(source: GPUImageCopyExternalImage, destination: GPUImageCopyTexture, copySize: GPUExtent3D): void
  }

  interface GPUBuffer {
    label: string
    size: number
    usage: number
    mapState: GPUBufferMapState
    destroy(): void
    unmap(): void
    mapAsync(mode: number, offset?: number, size?: number): Promise<void>
    getMappedRange(offset?: number, size?: number): ArrayBuffer
  }

  interface GPUBufferDescriptor {
    label?: string
    size: number
    usage: number
    mappedAtCreation?: boolean
  }

  interface GPUTexture {
    label: string
    width: number
    height: number
    depthOrArrayLayers: number
    mipLevelCount: number
    sampleCount: number
    dimension: GPUTextureDimension
    format: GPUTextureFormat
    usage: number
    destroy(): void
    createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView
  }

  interface GPUTextureDescriptor {
    label?: string
    size: GPUExtent3D
    mipLevelCount?: number
    sampleCount?: number
    dimension?: GPUTextureDimension
    format: GPUTextureFormat
    usage: number
    viewFormats?: Iterable<GPUTextureFormat>
  }

  interface GPUTextureView {
    label: string
  }

  interface GPUTextureViewDescriptor {
    label?: string
    format?: GPUTextureFormat
    dimension?: GPUTextureViewDimension
    aspect?: GPUTextureAspect
    baseMipLevel?: number
    mipLevelCount?: number
    baseArrayLayer?: number
    arrayLayerCount?: number
  }

  interface GPUSampler {
    label: string
  }

  interface GPUSamplerDescriptor {
    label?: string
    addressModeU?: GPUAddressMode
    addressModeV?: GPUAddressMode
    addressModeW?: GPUAddressMode
    magFilter?: GPUFilterMode
    minFilter?: GPUFilterMode
    mipmapFilter?: GPUMipmapFilterMode
    lodMinClamp?: number
    lodMaxClamp?: number
    compare?: GPUCompareFunction
    maxAnisotropy?: number
  }

  interface GPUBindGroupLayout {
    label: string
  }

  interface GPUBindGroupLayoutDescriptor {
    label?: string
    entries: Iterable<GPUBindGroupLayoutEntry>
  }

  interface GPUBindGroupLayoutEntry {
    binding: number
    visibility: number
    buffer?: GPUBufferBindingLayout
    sampler?: GPUSamplerBindingLayout
    texture?: GPUTextureBindingLayout
    storageTexture?: GPUStorageTextureBindingLayout
  }

  interface GPUBufferBindingLayout {
    type?: GPUBufferBindingType
    hasDynamicOffset?: boolean
    minBindingSize?: number
  }

  interface GPUSamplerBindingLayout {
    type?: GPUSamplerBindingType
  }

  interface GPUTextureBindingLayout {
    sampleType?: GPUTextureSampleType
    viewDimension?: GPUTextureViewDimension
    multisampled?: boolean
  }

  interface GPUStorageTextureBindingLayout {
    access: GPUStorageTextureAccess
    format: GPUTextureFormat
    viewDimension?: GPUTextureViewDimension
  }

  interface GPUPipelineLayout {
    label: string
  }

  interface GPUPipelineLayoutDescriptor {
    label?: string
    bindGroupLayouts: Iterable<GPUBindGroupLayout>
  }

  interface GPUBindGroup {
    label: string
  }

  interface GPUBindGroupDescriptor {
    label?: string
    layout: GPUBindGroupLayout
    entries: Iterable<GPUBindGroupEntry>
  }

  interface GPUBindGroupEntry {
    binding: number
    resource: GPUBindingResource
  }

  interface GPUShaderModule {
    label: string
    getCompilationInfo(): Promise<GPUCompilationInfo>
  }

  interface GPUShaderModuleDescriptor {
    label?: string
    code: string
    sourceMap?: object
  }

  interface GPUCompilationInfo {
    messages: Iterable<GPUCompilationMessage>
  }

  interface GPUCompilationMessage {
    message: string
    type: GPUCompilationMessageType
    lineNum: number
    linePos: number
    offset: number
    length: number
  }

  interface GPUComputePipeline {
    label: string
    getBindGroupLayout(index: number): GPUBindGroupLayout
  }

  interface GPUComputePipelineDescriptor {
    label?: string
    layout: GPUPipelineLayout | 'auto'
    compute: GPUProgrammableStage
  }

  interface GPUProgrammableStage {
    module: GPUShaderModule
    entryPoint: string
    constants?: Record<string, number>
  }

  interface GPURenderPipeline {
    label: string
    getBindGroupLayout(index: number): GPUBindGroupLayout
  }

  interface GPURenderPipelineDescriptor {
    label?: string
    layout: GPUPipelineLayout | 'auto'
    vertex: GPUVertexState
    primitive?: GPUPrimitiveState
    depthStencil?: GPUDepthStencilState
    multisample?: GPUMultisampleState
    fragment?: GPUFragmentState
  }

  interface GPUVertexState extends GPUProgrammableStage {
    buffers?: Iterable<GPUVertexBufferLayout | null>
  }

  interface GPUVertexBufferLayout {
    arrayStride: number
    stepMode?: GPUVertexStepMode
    attributes: Iterable<GPUVertexAttribute>
  }

  interface GPUVertexAttribute {
    format: GPUVertexFormat
    offset: number
    shaderLocation: number
  }

  interface GPUPrimitiveState {
    topology?: GPUPrimitiveTopology
    stripIndexFormat?: GPUIndexFormat
    frontFace?: GPUFrontFace
    cullMode?: GPUCullMode
    unclippedDepth?: boolean
  }

  interface GPUDepthStencilState {
    format: GPUTextureFormat
    depthWriteEnabled?: boolean
    depthCompare?: GPUCompareFunction
    stencilFront?: GPUStencilFaceState
    stencilBack?: GPUStencilFaceState
    stencilReadMask?: number
    stencilWriteMask?: number
    depthBias?: number
    depthBiasSlopeScale?: number
    depthBiasClamp?: number
  }

  interface GPUStencilFaceState {
    compare?: GPUCompareFunction
    failOp?: GPUStencilOperation
    depthFailOp?: GPUStencilOperation
    passOp?: GPUStencilOperation
  }

  interface GPUMultisampleState {
    count?: number
    mask?: number
    alphaToCoverageEnabled?: boolean
  }

  interface GPUFragmentState extends GPUProgrammableStage {
    targets: Iterable<GPUColorTargetState | null>
  }

  interface GPUColorTargetState {
    format: GPUTextureFormat
    blend?: GPUBlendState
    writeMask?: number
  }

  interface GPUBlendState {
    color: GPUBlendComponent
    alpha: GPUBlendComponent
  }

  interface GPUBlendComponent {
    operation?: GPUBlendOperation
    srcFactor?: GPUBlendFactor
    dstFactor?: GPUBlendFactor
  }

  // 枚举类型
  type GPUBufferMapState = 'unmapped' | 'pending' | 'mapped'
  type GPUTextureDimension = '1d' | '2d' | '3d'
  type GPUTextureFormat = string
  type GPUTextureViewDimension = '1d' | '2d' | '2d-array' | 'cube' | 'cube-array' | '3d'
  type GPUTextureAspect = 'all' | 'stencil-only' | 'depth-only'
  type GPUAddressMode = 'clamp-to-edge' | 'repeat' | 'mirror-repeat'
  type GPUFilterMode = 'nearest' | 'linear'
  type GPUMipmapFilterMode = 'nearest' | 'linear'
  type GPUCompareFunction = 'never' | 'less' | 'equal' | 'less-equal' | 'greater' | 'not-equal' | 'greater-equal' | 'always'
  type GPUBufferBindingType = 'uniform' | 'storage' | 'read-only-storage'
  type GPUSamplerBindingType = 'filtering' | 'non-filtering' | 'comparison'
  type GPUTextureSampleType = 'float' | 'unfilterable-float' | 'depth' | 'sint' | 'uint'
  type GPUStorageTextureAccess = 'write-only'
  type GPUCompilationMessageType = 'error' | 'warning' | 'info'
  type GPUVertexStepMode = 'vertex' | 'instance'
  type GPUVertexFormat = string
  type GPUPrimitiveTopology = 'point-list' | 'line-list' | 'line-strip' | 'triangle-list' | 'triangle-strip'
  type GPUIndexFormat = 'uint16' | 'uint32'
  type GPUFrontFace = 'ccw' | 'cw'
  type GPUCullMode = 'none' | 'front' | 'back'
  type GPUStencilOperation = 'keep' | 'zero' | 'replace' | 'invert' | 'increment-clamp' | 'decrement-clamp' | 'increment-wrap' | 'decrement-wrap'
  type GPUBlendOperation = 'add' | 'subtract' | 'reverse-subtract' | 'min' | 'max'
  type GPUBlendFactor = 'zero' | 'one' | 'src' | 'one-minus-src' | 'src-alpha' | 'one-minus-src-alpha' | 'dst' | 'one-minus-dst' | 'dst-alpha' | 'one-minus-dst-alpha' | 'src-alpha-saturated' | 'constant' | 'one-minus-constant'

  // 常量
  const GPUBufferUsage: {
    MAP_READ: number
    MAP_WRITE: number
    COPY_SRC: number
    COPY_DST: number
    INDEX: number
    VERTEX: number
    UNIFORM: number
    STORAGE: number
    INDIRECT: number
    QUERY_RESOLVE: number
  }

  const GPUMapMode: {
    READ: number
    WRITE: number
  }

  const GPUShaderStage: {
    VERTEX: number
    FRAGMENT: number
    COMPUTE: number
  }

  // 其他接口
  interface GPUCommandBuffer {
    label: string
  }

  interface GPUCommandEncoder {
    label: string
    beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder
    beginComputePass(descriptor?: GPUComputePassDescriptor): GPUComputePassEncoder
    copyBufferToBuffer(source: GPUBuffer, sourceOffset: number, destination: GPUBuffer, destinationOffset: number, size: number): void
    copyBufferToTexture(source: GPUImageCopyBuffer, destination: GPUImageCopyTexture, copySize: GPUExtent3D): void
    copyTextureToBuffer(source: GPUImageCopyTexture, destination: GPUImageCopyBuffer, copySize: GPUExtent3D): void
    copyTextureToTexture(source: GPUImageCopyTexture, destination: GPUImageCopyTexture, copySize: GPUExtent3D): void
    clearBuffer(buffer: GPUBuffer, offset?: number, size?: number): void
    insertDebugMarker(markerLabel: string): void
    popDebugGroup(): void
    pushDebugGroup(groupLabel: string): void
    resolveQuerySet(querySet: GPUQuerySet, firstQuery: number, queryCount: number, destination: GPUBuffer, destinationOffset: number): void
    finish(descriptor?: GPUCommandBufferDescriptor): GPUCommandBuffer
  }

  interface GPUCommandEncoderDescriptor {
    label?: string
  }

  interface GPUCommandBufferDescriptor {
    label?: string
  }

  interface GPURenderPassEncoder {
    label: string
    setViewport(x: number, y: number, width: number, height: number, minDepth: number, maxDepth: number): void
    setScissorRect(x: number, y: number, width: number, height: number): void
    setPipeline(pipeline: GPURenderPipeline): void
    setBindGroup(index: number, bindGroup: GPUBindGroup | null, dynamicOffsets?: Iterable<number>): void
    setIndexBuffer(buffer: GPUBuffer, format: GPUIndexFormat, offset?: number, size?: number): void
    setVertexBuffer(slot: number, buffer: GPUBuffer | null, offset?: number, size?: number): void
    draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void
    drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void
    drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: number): void
    drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: number): void
    insertDebugMarker(markerLabel: string): void
    popDebugGroup(): void
    pushDebugGroup(groupLabel: string): void
    end(): void
  }

  interface GPUComputePassEncoder {
    label: string
    setPipeline(pipeline: GPUComputePipeline): void
    setBindGroup(index: number, bindGroup: GPUBindGroup | null, dynamicOffsets?: Iterable<number>): void
    dispatchWorkgroups(workgroupCountX: number, workgroupCountY?: number, workgroupCountZ?: number): void
    dispatchWorkgroupsIndirect(indirectBuffer: GPUBuffer, indirectOffset: number): void
    insertDebugMarker(markerLabel: string): void
    popDebugGroup(): void
    pushDebugGroup(groupLabel: string): void
    end(): void
  }

  interface GPURenderPassDescriptor {
    label?: string
    colorAttachments: Iterable<GPURenderPassColorAttachment | null>
    depthStencilAttachment?: GPURenderPassDepthStencilAttachment
    occlusionQuerySet?: GPUQuerySet
    timestampWrites?: GPURenderPassTimestampWrites
  }

  interface GPURenderPassColorAttachment {
    view: GPUTextureView
    resolveTarget?: GPUTextureView
    clearValue?: GPUColor
    loadOp: GPULoadOp
    storeOp: GPUStoreOp
  }

  interface GPURenderPassDepthStencilAttachment {
    view: GPUTextureView
    depthClearValue?: number
    depthLoadOp?: GPULoadOp
    depthStoreOp?: GPUStoreOp
    depthReadOnly?: boolean
    stencilClearValue?: number
    stencilLoadOp?: GPULoadOp
    stencilStoreOp?: GPUStoreOp
    stencilReadOnly?: boolean
  }

  interface GPUComputePassDescriptor {
    label?: string
    timestampWrites?: GPUComputePassTimestampWrites
  }

  interface GPUQuerySet {
    label: string
    type: GPUQueryType
    count: number
    destroy(): void
  }

  interface GPUQuerySetDescriptor {
    label?: string
    type: GPUQueryType
    count: number
  }

  interface GPURenderBundleEncoder {
    label: string
    finish(descriptor?: GPURenderBundleDescriptor): GPURenderBundle
  }

  interface GPURenderBundleEncoderDescriptor {
    label?: string
    colorFormats: Iterable<GPUTextureFormat | null>
    depthStencilFormat?: GPUTextureFormat
    sampleCount?: number
    depthReadOnly?: boolean
    stencilReadOnly?: boolean
  }

  interface GPURenderBundle {
    label: string
  }

  interface GPURenderBundleDescriptor {
    label?: string
  }

  interface GPUDeviceLostInfo {
    reason: GPUDeviceLostReason
    message: string
  }

  interface GPUError {
    readonly message: string
  }

  // 更多类型定义
  type GPUBindingResource = GPUSampler | GPUTextureView | GPUBufferBinding
  type GPUColor = [number, number, number, number] | { r: number; g: number; b: number; a: number }
  type GPUExtent3D = [number, number?, number?] | { width: number; height?: number; depthOrArrayLayers?: number }
  type GPULoadOp = 'load' | 'clear'
  type GPUStoreOp = 'store' | 'discard'
  type GPUQueryType = 'occlusion' | 'timestamp'
  type GPUDeviceLostReason = 'destroyed'
  type GPUErrorFilter = 'validation' | 'out-of-memory' | 'internal'

  interface GPUBufferBinding {
    buffer: GPUBuffer
    offset?: number
    size?: number
  }

  interface GPUImageCopyBuffer {
    buffer: GPUBuffer
    offset?: number
    bytesPerRow?: number
    rowsPerImage?: number
  }

  interface GPUImageCopyTexture {
    texture: GPUTexture
    mipLevel?: number
    origin?: GPUOrigin3D
    aspect?: GPUTextureAspect
  }

  interface GPUImageCopyExternalImage {
    source: ImageBitmap | HTMLImageElement | HTMLVideoElement | VideoFrame | HTMLCanvasElement | OffscreenCanvas
    origin?: GPUOrigin2D
    flipY?: boolean
  }

  interface GPUImageDataLayout {
    offset?: number
    bytesPerRow?: number
    rowsPerImage?: number
  }

  interface GPURenderPassTimestampWrites {
    querySet: GPUQuerySet
    beginningOfPassWriteIndex?: number
    endOfPassWriteIndex?: number
  }

  interface GPUComputePassTimestampWrites {
    querySet: GPUQuerySet
    beginningOfPassWriteIndex?: number
    endOfPassWriteIndex?: number
  }

  type GPUOrigin2D = [number, number] | { x: number; y: number }
  type GPUOrigin3D = [number, number?, number?] | { x: number; y?: number; z?: number }
}

export {}
