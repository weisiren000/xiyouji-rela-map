# 西游记关系图谱 3D 可视化项目 - 技术架构图

##  整体技术架构图

```mermaid
graph TB
    subgraph Frontend["前端层 Frontend Layer"]
        A[React 18.2.0]
        B[TypeScript 5.2.2]
        C[Vite 5.0.8]
        
        subgraph Engine["3D渲染引擎"]
            D[Three.js 0.160.0]
            E[react-three-fiber 8.15.0]
            F[react-three-drei 9.92.0]
            G[react-three-postprocessing 2.15.0]
            H[three-mesh-bvh 0.9.1]
        end
        
        subgraph State["状态管理"]
            I[Zustand 4.4.7]
            J[useGalaxyStore]
            K[useDataStore]
            L[useCharacterInfoStore]
            M[useEventInfoStore]
            N[useModelEffectStore]
        end
        
        subgraph UI["UI工具"]
            CC[lil-gui 0.19.1]
            DD[CSS3]
        end
    end
    
    subgraph Backend["后端层 Backend Layer"]
        O[Node.js Runtime]
        P[Express.js 4.18.2]
        Q[CORS 2.8.5]
    end
    
    subgraph Database["数据层 Data Layer"]
        S[SQLite Database]
        T[better-sqlite3 11.10.0]
        U[characters.db]
        V[482条记录]
    end
    
    subgraph Performance["性能优化层"]
        W[BVH空间优化]
        X[BatchRenderer]
        Y[ShaderManager]
        Z[PerformanceProfiler]
        AA[BVHProfiler]
    end
    
    subgraph Tools["开发工具层"]
        BB[ESLint 8.55.0]
        EE[热重载开发]
    end
    
    A --> B
    A --> I
    A --> E
    E --> D
    F --> E
    G --> E
    H --> D
    I --> J
    I --> K
    I --> L
    I --> M
    I --> N
    O --> P
    P --> Q
    T --> S
    S --> U
    U --> V
    W --> H
    X --> D
    Y --> D
    Z --> A
    AA --> W
    BB --> B
    EE --> C
    CC --> A
    A -.-> O
    P --> T
    K --> S
    D --> W
    
    style A fill:#61dafb
    style D fill:#049ef4
    style I fill:#ff6b6b
    style S fill:#003b57
    style W fill:#4ecdc4
```

##  核心功能模块架构图

```mermaid
graph TB
    subgraph "3D渲染系统 3D Rendering System"
        A[GalaxyScene.tsx]
        B[PlanetCluster]
        C[FogParticles]
        D[CharacterSpheresSimple]
        E[JourneyPoints]
        
        A --> B
        A --> C
        A --> D
        A --> E
    end
    
    subgraph "模型系统 Model System"
        F[ModelLoader]
        G[ModelEffectRenderer]
        H[智能模型检测]
        I[GLB文件支持]
        
        F --> G
        F --> H
        F --> I
    end
    
    subgraph "交互系统 Interaction System"
        J[射线投射检测]
        K[鼠标悬浮高亮]
        L[点击详情视图]
        M[拖拽交互]
        
        J --> K
        J --> L
        J --> M
    end
    
    subgraph "用户界面 User Interface"
        N[ControlPanel]
        O[DataDashboard]
        P[CharacterInfoOverlay]
        Q[CharacterDetailView]
        R[ModelQuickAccess]
        
        N --> O
        P --> Q
        O --> R
    end
    
    subgraph "数据可视化 Data Visualization"
        S[482个角色球体]
        T[9种角色类型]
        U[81难事件点]
        V[关系网络]
        
        S --> T
        U --> V
    end
    
    A --> F
    A --> J
    J --> N
    D --> S
    E --> U
    
    style A fill:#ff9999
    style F fill:#99ccff
    style J fill:#99ff99
    style N fill:#ffcc99
    style S fill:#cc99ff
```

##  Hooks架构依赖图

```mermaid
graph TB
    subgraph "数据管理 Data Management"
        A[useAutoLoader]
        B[useLoadingStatus]
        C[useServerConnection]
        
        A --> B
        A --> C
    end
    
    subgraph "交互系统 Interaction System"
        D[useCharacterInteraction]
        E[useEventCharacterInteraction]
        F[useGalaxyCharacterDrag]
        
        D --> E
        D --> F
    end
    
    subgraph "性能监控 Performance Monitoring"
        G[usePerformanceMonitor]
        H[useBatchModelDetection]
        I[useSmartModelDetection]
        
        G --> H
        H --> I
    end
    
    subgraph "配置管理 Configuration Management"
        J[useModelEffectConfig]
    end
    
    A --> D
    G --> D
    J --> H
    
    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style G fill:#e8f5e8
    style J fill:#fff3e0
```

##  数据流架构图

```mermaid
sequenceDiagram
    participant U as 用户 User
    participant F as 前端 Frontend
    participant S as 状态管理 State
    participant B as 后端 Backend
    participant D as 数据库 Database
    participant R as 3D渲染 Renderer
    
    U->>F: 用户交互
    F->>S: 更新状态
    S->>B: API请求
    B->>D: SQL查询
    D-->>B: 返回数据
    B-->>S: JSON响应
    S-->>F: 状态更新
    F->>R: 渲染指令
    R-->>F: 3D场景
    F-->>U: 视觉反馈
    
    Note over F,R: BVH优化加速射线检测
    Note over S: Zustand状态管理
    Note over D: SQLite高性能查询
```

##  性能优化架构图

```mermaid
graph TB
    subgraph "BVH空间优化 BVH Spatial Optimization"
        A[three-mesh-bvh 0.9.1]
        B[射线投射优化 5-10x]
        C[GLB模型优化 10-50x]
        D[firstHitOnly模式 +50%]
        
        A --> B
        A --> C
        A --> D
    end
    
    subgraph "渲染优化 Rendering Optimization"
        E[BatchRenderer]
        F[ShaderManager]
        G[PerformanceProfiler]
        H[BVHProfiler]
        
        E --> F
        G --> H
    end
    
    subgraph "缓存系统 Cache System"
        I[enableGeometryCache]
        J[enableMaterialCache]
        K[enableBatchRendering]
        L[enableInstancedRendering]
        
        I --> J
        K --> L
    end
    
    subgraph "性能监控 Performance Monitoring"
        M[实时FPS监控]
        N[内存使用跟踪]
        O[射线检测性能]
        P[渲染耗时分析]
        
        M --> N
        O --> P
    end
    
    A --> E
    E --> I
    G --> M
    
    style A fill:#4ecdc4
    style E fill:#45b7d1
    style I fill:#96ceb4
    style M fill:#ffeaa7
```

##  依赖关系图

```mermaid
graph TB
    subgraph Frontend["前端核心依赖"]
        A[React 18.2.0]
        B[TypeScript 5.2.2]
        C[Vite 5.0.8]
    end
    
    subgraph ThreeJS["Three.js生态系统"]
        D[three 0.160.0]
        E[react-three-fiber 8.15.0]
        F[react-three-drei 9.92.0]
        G[react-three-postprocessing 2.15.0]
        H[postprocessing 6.34.0]
        I[three-mesh-bvh 0.9.1]
    end
    
    subgraph StateManagement["状态管理"]
        J[zustand 4.4.7]
    end
    
    subgraph DevTools["开发工具"]
        K[lil-gui 0.19.1]
        L[ESLint 8.55.0]
        M[typescript-eslint]
        N[vitejs-plugin-react 4.2.1]
    end
    
    subgraph Backend["后端服务"]
        O[Node.js]
        P[express 4.18.2]
        Q[better-sqlite3 11.10.0]
        R[cors 2.8.5]
        S[nodemon 3.0.2]
    end
    
    A --> E
    A --> J
    A --> K
    B --> L
    B --> M
    C --> N
    C --> A
    E --> D
    E --> F
    E --> G
    G --> H
    D --> I
    O --> P
    P --> Q
    P --> R
    P --> S
    
    style A fill:#61dafb
    style D fill:#049ef4
    style J fill:#ff6b6b
    style O fill:#68a063
    style C fill:#646cff
```

##  部署架构图

```mermaid
graph TB
    subgraph "开发环境 Development"
        A[pnpm dev]
        B[热重载开发]
        C[本地端口3000]
        D[外部访问支持]
        
        A --> B
        A --> C
        A --> D
    end
    
    subgraph "构建过程 Build Process"
        E[TypeScript编译]
        F[Vite构建]
        G[代码分割]
        H[Tree Shaking]
        
        E --> F
        F --> G
        F --> H
    end
    
    subgraph "生产部署 Production"
        I[pnpm build]
        J[静态资源]
        K[Chunk分割]
        L[压缩优化]
        
        I --> J
        I --> K
        I --> L
    end
    
    subgraph "服务器运行 Server Runtime"
        M[Node.js后端]
        N[Express服务器]
        O[SQLite数据库]
        P[端口3003]
        
        M --> N
        N --> O
        N --> P
    end
    
    A --> E
    E --> I
    I --> M
    
    style A fill:#e8f5e8
    style E fill:#fff3e0
    style I fill:#fce4ec
    style M fill:#e3f2fd
```

##  项目规模可视化

```mermaid
pie title 项目代码分布
    "TypeScript代码" : 15000
    "React组件" : 50
    "自定义Hooks" : 15
    "工具函数" : 30
    "配置文件" : 20
```

```mermaid
pie title 数据规模分布
    "角色数据" : 150
    "别名数据" : 332
    "事件数据" : 81
    "3D模型" : 11
```

##  技术特色雷达图

```mermaid
graph LR
    subgraph TechRadar["技术特色分析"]
        A[React生态系统<br/>成熟稳定]
        B[Three.js 3D渲染<br/>专业强大]
        C[BVH空间优化<br/>性能突破]
        D[银河系可视化<br/>创新设计]
        E[SQLite数据库<br/>轻量高效]
        F[TypeScript<br/>类型安全]
        G[Zustand状态管理<br/>简洁现代]
        H[智能模型检测<br/>AI增强]
    end
    
    subgraph Innovation["创新特色"]
        C
        D
        H
    end
    
    subgraph Mature["成熟技术"]
        A
        E
        F
    end
    
    subgraph Advanced["先进工具"]
        B
        G
    end
    
    style Innovation fill:#ff9999
    style Mature fill:#99ccff
    style Advanced fill:#99ff99
```

##  技术演进时间线

```mermaid
timeline
    title 西游记3D可视化项目技术演进
    
    section 基础阶段
        v1.0 : 基础Three.js搭建
             : 原生JavaScript开发
             : 基本3D场景渲染
    
    section 重构升级
        v1.1 : React框架重构
             : TypeScript类型化
             : 现代化开发流程
    
    section 性能优化
        v1.2 : BVH空间优化集成
             : BatchRenderer批量渲染
             : 性能监控系统
    
    section 数据架构
        v1.2.5 : SQLite数据库迁移
               : 高级搜索功能
               : 数据查询优化14倍
    
    section 未来规划
        v2.0+ : WebGPU下一代渲染
              : AI角色关系分析
              : VR/AR沉浸式体验
```

##  技术栈演进图表

```mermaid
graph TD
    A[v1.0 基础版本] --> B[v1.1 React重构]
    B --> C[v1.2 性能优化]
    C --> D[v1.2.5 数据升级]
    D --> E[v2.0 未来版本]
    
    A1[Three.js原生] --> A
    A2[JavaScript] --> A
    
    B1[React 18] --> B
    B2[TypeScript] --> B
    B3[Vite构建] --> B
    
    C1[BVH优化] --> C
    C2[批量渲染] --> C
    C3[性能监控] --> C
    
    D1[SQLite数据库] --> D
    D2[高级搜索] --> D
    D3[查询优化] --> D
    
    E1[WebGPU] --> E
    E2[AI分析] --> E
    E3[VR/AR] --> E
    
    style A fill:#ffcccc
    style B fill:#ccffcc
    style C fill:#ccccff
    style D fill:#ffffcc
    style E fill:#ffccff
```

---

*架构图生成时间: 2025年6月30日*  
*基于项目版本: v1.2.5*  
*技术栈架构: 完整可视化版本*
