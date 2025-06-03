# API项目规划文档

**核心原则：**

1.  **用户中心：** 想象你的使用者是谁（其他开发者、设计师、未来的你）。他们需要什么信息？他们可能有哪些 3D 基础？文档要易于理解和使用。
2.  **清晰一致：** 术语、结构、风格保持一致。避免歧义。
3.  **完整性：** 覆盖所有公开的功能、类、方法、属性、事件、参数、返回值、错误。
4.  **实用性：** 提供丰富的、可运行的代码示例是 **关键**。解释常见的 3D 任务如何完成。
5.  **可发现性：** 良好的导航、搜索和索引至关重要。
6.  **准确性：** API 代码和文档必须严格同步！过时的文档比没有文档更糟糕。

**Web 3D API 文档的核心结构：**

1.  **概览 (Overview / Introduction):**
    *   **项目目标：** 这个 3D 库/引擎/应用是做什么的？解决什么问题？（例如：简化 WebGL 开发、特定领域的可视化、游戏引擎）
    *   **核心概念：** **极其重要！** 解释项目采用的核心范式：
        *   场景图结构（Scene, Object3D, Group, Mesh 等）？
        *   坐标系（右手系？左手系？单位？米？像素？）
        *   渲染循环（requestAnimationFrame）？
        *   资源加载流程（纹理、模型、音频）？
        *   关键抽象（几何体 Geometry, 材质 Material, 光源 Light, 相机 Camera, 渲染器 Renderer, 控制器 Controls）？
        *   数学库（Vector3, Matrix4, Quaternion, Euler）的使用约定？
    *   **主要特性：** 列出亮点（如：PBR 材质、骨骼动画、物理引擎集成、后期处理效果）。
    *   **快速开始 (Getting Started):** 一个最简的“Hello 3D World”示例，展示如何引入库、创建场景、添加一个立方体、设置相机和渲染器。让用户立即看到效果。

2.  **安装与设置 (Installation & Setup):**
    *   如何获取库（CDN 链接、npm 包名、直接下载）。
    *   如何引入（`<script>` 标签, `import`, `require`）。
    *   基本依赖（例如需要 WebGL 支持，或特定的 polyfill）。
    *   初始化步骤（创建 Renderer, Scene 等）。

3.  **核心模块/类参考 (Core Modules / Class Reference):** **文档的主体部分**
    *   **组织结构：** 按功能模块或核心类分组。
        *   **场景图 (Scene Graph):** `Scene`, `Object3D`, `Group`, `Mesh`, `Points`, `Line` 等。
        *   **几何 (Geometry):** `BoxGeometry`, `SphereGeometry`, `BufferGeometry`, 以及如何加载外部模型 (`GLTFLoader`, `OBJLoader`)。
        *   **材质 (Materials):** `MeshBasicMaterial`, `MeshStandardMaterial`, `ShaderMaterial` 等。详细说明每个材质的属性 (`color`, `map`, `metalness`, `roughness`, `opacity`, `transparent`, `side` 等) 及其效果。
        *   **光源 (Lights):** `AmbientLight`, `DirectionalLight`, `PointLight`, `SpotLight` 等。解释强度、颜色、衰减、阴影设置。
        *   **相机 (Cameras):** `PerspectiveCamera`, `OrthographicCamera`。详细说明参数（FOV、宽高比、近/远裁剪面、位置、朝向、如何控制）。
        *   **渲染器 (Renderer):** `WebGLRenderer` (或其它)。说明创建参数（`canvas`, `antialias`, `alpha`）、方法（`render(scene, camera)`, `setSize`, `setClearColor`）、属性（`domElement`）。
        *   **控制器 (Controls):** `OrbitControls`, `FlyControls`, `PointerLockControls` 等。说明如何启用、配置参数（旋转速度、平移限制、阻尼）。
        *   **加载器 (Loaders):** 各种格式的加载器。说明加载过程（异步）、回调、错误处理、管理器 (`LoadingManager`)。
        *   **动画 (Animation):** 关键帧轨道 (`KeyframeTrack`), 动画剪辑 (`AnimationClip`), 混合器 (`AnimationMixer`), 动作 (`AnimationAction`)。解释动画系统的工作原理和 API。
        *   **辅助对象 (Helpers):** `AxesHelper`, `GridHelper`, `CameraHelper` 等。
        *   **数学库 (Math):** `Vector2/3`, `Matrix3/4`, `Quaternion`, `Euler`, `Raycaster`。解释常用操作和方法。
        *   **后期处理 (Post-Processing):** `EffectComposer`, `Pass` (如 `RenderPass`, `BloomPass`)。说明合成流程。
        *   **工具 (Utilities):** 其他辅助函数或类。

    *   **每个类/模块的文档结构：**
        *   **名称和描述：** 这个类是做什么的？
        *   **构造函数：** 参数列表、类型、默认值、含义。
        *   **属性：**
            *   名称
            *   类型 (`Number`, `Color`, `Texture`, `Vector3`, `Boolean` 等)
            *   描述（这个属性代表什么？改变它有什么效果？）
            *   默认值
            *   是否可被动画？
            *   **注意：** 对于 3D 对象的位置 (`position`)、旋转 (`rotation` 或 `quaternion`)、缩放 (`scale`) 属性要特别清晰！
        *   **方法：**
            *   方法签名：`methodName(param1: Type, param2: Type = defaultValue): ReturnType`
            *   每个参数的详细说明（名称、类型、是否可选、默认值、含义）
            *   返回值说明（类型、含义）
            *   方法的作用和行为描述（这个方法具体做什么？）
            *   可能抛出的错误/异常
        *   **事件 (Events):** （如果适用）
            *   事件名称
            *   何时触发？
            *   事件对象中包含哪些数据？
        *   **继承关系：** 它继承自哪个父类？（例如 `Mesh` 继承自 `Object3D`）
        *   **示例代码片段：** **极其重要！** 展示如何创建、配置和使用这个类/对象来完成一个具体的、常见的小任务。例如：
            *   如何创建一个带纹理的立方体？
            *   如何给物体添加旋转动画？
            *   如何设置点光源并启用阴影？
            *   如何用 `Raycaster` 实现物体拾取？

4.  **示例与教程 (Examples & Tutorials):** **这是让用户上手的核心动力！**
    *   **小示例库：** 建立一个独立的页面或目录，包含大量可运行的、聚焦特定功能的小例子（如“基础材质”、“加载 GLTF 模型”、“应用法线贴图”、“使用后期处理”、“骨骼动画播放”、“物理碰撞”）。每个示例应该有：
        *   清晰的标题描述功能点。
        *   可查看和运行的代码（使用 CodePen, JSFiddle 或内置的代码运行环境）。
        *   (可选) 简短的文字解释。
    *   **综合教程：** 提供更长的、循序渐进的指南，引导用户完成一个相对完整的项目（如“创建一个简单的 3D 展厅”、“制作一个行星系统动画”、“实现第一人称漫游”）。教程应涵盖规划、实现、调试等过程。

5.  **指南与最佳实践 (Guides & Best Practices):**
    *   **性能优化：** Web 3D 极易遇到性能瓶颈。提供指南：
        *   减少绘制调用（合并几何体、Instancing）。
        *   优化材质和着色器。
        *   高效加载和管理资源。
        *   合理使用 LOD (Level of Detail)。
        *   管理内存（释放 Geometry, Texture, Material）。
        *   使用 WebGL 状态检查工具。
    *   **常见问题解答 (FAQ)：** 收集用户常见问题并解答（如“为什么我的模型是黑色的？” - 缺光源/法线错误；“为什么旋转不流畅？” - 性能问题/未使用 requestAnimationFrame）。
    *   **调试技巧：** 如何调试 WebGL 错误、检查场景图、使用辅助线框等。
    *   **与其他库集成：** 如何与流行的 UI 库 (React, Vue) 或状态管理库结合使用。

**Web 3D API 文档的特别注意事项：**

1.  **可视化辅助：** 文字描述 3D 概念往往不够直观。
    *   **大量使用图片和动图 (GIF/视频)：** 展示不同材质属性的效果、不同光源类型的差异、控制器的操作方式、动画效果等。
    *   **交互式示例是王道：** 允许用户直接在文档中修改参数（如颜色、位置、强度）并实时看到 3D 场景的变化。这比静态文档强大无数倍。
    *   **示意图：** 用清晰的图示说明坐标系、相机视锥体（Frustum）、光源范围、场景图结构等。

2.  **强调性能影响：** 明确标注哪些操作（如开启阴影、使用高精度复杂材质、实时更新顶点数据）是性能敏感的，并提供替代方案或优化建议。

3.  **详细说明坐标和变换：** 位置 (`position`)、旋转 (`rotation` / `quaternion`)、缩放 (`scale`) 是 3D 的核心。清晰说明：
    *   本地坐标系 vs 世界坐标系。
    *   旋转顺序（`rotation.order`，例如 'XYZ'）。
    *   四元数 (`quaternion`) 和欧拉角 (`rotation`) 的区别与联系，以及何时使用哪种。
    *   如何更新变换（直接修改属性 vs 使用 `lookAt()` 等方法）。

4.  **资源生命周期管理：** 明确说明如何创建、使用和销毁几何体、材质、纹理等资源，避免内存泄漏。解释加载器的异步特性。

5.  **事件和交互：** 详细说明如何进行 3D 对象拾取 (`Raycaster`)、处理鼠标/触摸事件在 3D 空间中的坐标转换。

6.  **跨浏览器/设备兼容性：** 注明 API 对 WebGL 版本的要求、移动端支持的注意事项（性能、触摸事件）、已知的浏览器兼容性问题及解决方法。

**如何开始（第一步）：**

1.  **确定范围和核心用户：** 你的 API 主要暴露哪些功能？给谁用？
2.  **选择文档工具链：** 根据你的技术栈（JS/TS?）选择 JSDoc/TypeDoc + 一个 SSG (如 VuePress/Docusaurus)。
3.  **编写概览和快速开始：** 让用户最快速度跑起来一个简单 3D 场景。
4.  **定义核心概念：** 清晰阐述你的场景图、坐标系、单位、渲染循环。
5.  **从核心类开始注释：** 用 JSDoc/TSDoc 规范开始注释最重要的类（如 `Renderer`, `Scene`, `PerspectiveCamera`, `Mesh`, `BoxGeometry`, `MeshBasicMaterial`）。重点写好构造函数、关键属性和方法。
6.  **创建第一个可运行的示例：** 把“快速开始”做成一个可以实际运行的、嵌入在文档中的例子。
7.  **逐步扩展：** 按模块或功能点，逐步完善其他类、方法、属性的文档，并添加更多示例和图片。
8.  **建立流程：** 确保代码变更后，文档能自动或半自动地更新。