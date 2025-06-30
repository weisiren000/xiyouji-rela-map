import { useState, useEffect, useRef } from 'react';
import { ArrowRight, BookOpen, Users, Map, X } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import MermaidDiagram from './components/MermaidDiagram';
import ProjectCard3D from './components/ProjectCard3D';

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [isBackToTopHovered, setIsBackToTopHovered] = useState(false);
  const [phase1Trigger, setPhase1Trigger] = useState(0);
  const [phase2Trigger, setPhase2Trigger] = useState(0);
  const [phase3Trigger, setPhase3Trigger] = useState(0);
  
  // 弹窗状态
  const [showPhaseModal, setShowPhaseModal] = useState<number | null>(null);

  // GSAP引用
  const heroRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);
  const phaseCardsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  // 页面加载动画
  useEffect(() => {
    const tl = gsap.timeline();

    // 导航栏动画
    if (navRef.current) {
      gsap.set(navRef.current, { y: -100, opacity: 0 });
      tl.to(navRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
      });
    }

    // 主内容区域动画
    if (heroRef.current) {
      const heroElements = heroRef.current.querySelectorAll('.hero-animate');
      
      gsap.set(heroElements, { y: 50, opacity: 0 });
      
      tl.to(heroElements, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out"
      }, "-=0.5");
    }

    // 阶段卡片滚动触发动画
    if (phaseCardsRef.current) {
      const cards = phaseCardsRef.current.querySelectorAll('.phase-card');
      
      gsap.set(cards, { y: 100, opacity: 0, rotationY: 15 });
      
      ScrollTrigger.create({
        trigger: phaseCardsRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(cards, {
            y: 0,
            opacity: 1,
            rotationY: 0,
            duration: 1,
            stagger: 0.3,
            ease: "power3.out"
          });
        }
      });
    }

    // 项目卡片滚动触发动画
    if (projectsRef.current) {
      const projectCards = projectsRef.current.querySelectorAll('.project-card');
      
      gsap.set(projectCards, { y: 80, opacity: 0, scale: 0.9 });
      
      ScrollTrigger.create({
        trigger: projectsRef.current,
        start: "top 85%",
        onEnter: () => {
          gsap.to(projectCards, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            stagger: 0.2,
            ease: "power3.out"
          });
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // CTA按钮动画
  const handleCTAMouseEnter = () => {
    setIsHovered(true);
    if (ctaButtonRef.current) {
      gsap.to(ctaButtonRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out"
      });
      
      // 按钮内部元素动画
      const arrow = ctaButtonRef.current.querySelector('.cta-arrow');
      const shimmer = ctaButtonRef.current.querySelector('.cta-shimmer');
      
      if (arrow) {
        gsap.to(arrow, {
          x: 4,
          duration: 0.3,
          ease: "power2.out"
        });
      }
      
      if (shimmer) {
        gsap.fromTo(shimmer, 
          { x: '-100%' },
          { x: '100%', duration: 0.8, ease: "power2.out" }
        );
      }
    }
  };

  const handleCTAMouseLeave = () => {
    setIsHovered(false);
    if (ctaButtonRef.current) {
      gsap.to(ctaButtonRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
      
      const arrow = ctaButtonRef.current.querySelector('.cta-arrow');
      if (arrow) {
        gsap.to(arrow, {
          x: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  };

  const handlePhaseHover = (phase: number, isEntering: boolean) => {
    if (isEntering) {
      if (phase === 1) setPhase1Trigger(prev => prev + 1);
      if (phase === 2) setPhase2Trigger(prev => prev + 1);
      if (phase === 3) setPhase3Trigger(prev => prev + 1);
    }
  };

  // 处理阶段卡片点击
  const handlePhaseClick = (phase: number) => {
    setShowPhaseModal(phase);
  };

  // 关闭弹窗
  const closeModal = () => {
    setShowPhaseModal(null);
  };

  // 超级丝滑的滚动到指定区域 - 修复滚动位置
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // 调整偏移量，让滚动位置更准确
      const navHeight = 80; // 导航栏高度
      const extraOffset = -160; // 增加额外偏移量，让内容更居中
      
      gsap.to(window, {
        duration: 0.5, // 保持0.5秒的丝滑滚动
        scrollTo: { 
          y: element, 
          offsetY: navHeight + extraOffset 
        },
        ease: "power4.inOut" // 使用最丝滑的缓动函数
      });
    }
  };

  // 项目数据 - 基于真实的西游记可视化项目截图
  const projects = [
    {
      id: 1,
      title: "角色星谱",
      subtitle: "Character Star Map - Journey to the West",
      description: "基于Three.js构建的3D银河系角色分布图，以星空的形式展现西游记中482个角色的空间关系和层级结构。每个角色都是银河中的一颗星，通过颜色和大小区分角色的重要性和类型。",
      image: "/角色星谱.png",
      technologies: ["React 18", "@react-three/fiber", "Three.js 0.160", "TypeScript", "Zustand"],
      category: "3D Visualization",
      liveUrl: "#",
      featured: true
    },
    {
      id: 2,
      title: "八十一难银河星谱",
      subtitle: "81 Trials Galaxy Visualization",
      description: "螺旋银河系可视化展示取经路上的九九八十一难。以对数螺旋的形式将每一难作为银河臂上的节点，用户可以沿着螺旋路径探索整个取经历程，体验从起点到终点的完整旅程。",
      image: "/八十一难银河星图.png",
      technologies: ["@react-three/drei", "密度函数算法", "引力场算法", "WebGL", "Vite"],
      category: "Journey Visualization",
      liveUrl: "#",
      featured: true
    },
    {
      id: 3,
      title: "角色星图",
      subtitle: "Character Constellation Detail View",
      description: "角色详细信息的3D线框模型展示系统。选中角色后进入专属的星空场景，以绿色线框的形式展现角色的3D模型，配合详细的角色信息面板，包括基础信息、能力评估和角色描述等。",
      image: "/角色星图.png",
      technologies: ["@react-three/postprocessing", "three-mesh-bvh", "Shader渲染", "lil-gui", "模型检测"],
      category: "Character Detail",
      liveUrl: "#",
      featured: false
    },
    {
      id: 4,
      title: "角色关系图谱",
      subtitle: "Character Relationship Network",
      description: "交互式角色关系网络图，以节点和连线的形式展现西游记中复杂的人物关系。支持关系筛选、节点交互和动态布局，帮助用户深入理解角色之间的师徒、朋友、敌对等多种关系类型。",
      image: "/角色关系图谱.png",
      technologies: ["SQLite", "better-sqlite3", "Express.js", "Node.js", "数据可视化"],
      category: "Network Analysis",
      liveUrl: "#",
      featured: false
    }
  ];

  // Mermaid 序列图定义
  const mermaidChart = `sequenceDiagram
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
    Note over D: SQLite高性能查询`;

  // 第一阶段的项目数据流图
  const phase1Chart = `graph TD
    subgraph "第一阶段: 分析与规整"
        A["原著文本《西游记》"] --> B{"人工智能分析与研究"};
        B --> C["结构化JSON文件"]
        B --> D["结构化CSV文件"]
    end

    subgraph "第二阶段: 数据迁移"
        C --> E["Node.js 迁移脚本"];
        D --> F["Node.js 迁移脚本"];
        E --> G["人物数据库"];
        F --> H["事件数据库"];
    end

    subgraph "第三阶段: 数据服务化与消费"
        G --> I{"Node.js API 服务器"};
        H --> I;
        I --> J["前端应用程序"];
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style J fill:#ccf,stroke:#333,stroke-width:2px`;

  // 第二阶段图表 - 事件驱动的关系变化时间线
  const phase2Chart = `timeline
    title 主要关系变化时间线
    
    section 取经前
        孙悟空出世    : 菩提祖师收徒
                     : 与牛魔王结拜
        大闹天宫      : 与天庭为敌
                     : 被如来压制
    
    section 取经开始
        观音点化      : 师徒关系建立
                     : 团队组建
        收服八戒      : 团队扩大
        收服沙僧      : 取经团队完整
    
    section 取经路上
        三打白骨精    : 师徒矛盾
                     : 团队分离
        真假美猴王    : 身份危机
                     : 重归于好
        火焰山       : 与牛魔王决裂
                     : 夫妻反目
    
    section 取经结束
        功德圆满      : 师徒情深
                     : 各得正果
        成佛封神      : 等级提升
                     : 关系稳固`;

  // 第三阶段图表 - 整体可视化架构流程图
  const phase3Chart = `graph TB
    subgraph "数据层 Data Layer"
        A1[SQLite Database<br/>482个角色数据]
        A2[Events Database<br/>81难事件数据]
        A3[JSON配置文件<br/>关系网络数据]
    end
    
    subgraph "数据服务层 Data Service Layer"
        B1[DataApi<br/>数据获取接口]
        B2[CharacterService<br/>角色数据处理]
        B3[EventsService<br/>事件数据处理]
    end
    
    subgraph "算法生成层 Algorithm Generation Layer"
        C1[galaxyGenerator.ts<br/>银河系生成算法]
        C2[journeyGenerator.ts<br/>81难路径算法]
        C3[空间分布算法<br/>对数螺旋+密度函数]
    end
    
    subgraph "3D渲染层 3D Rendering Layer"
        D1[GalaxyScene<br/>主银河系场景]
        D2[EmptyGalaxyScene<br/>81难场景]
        D3[CharacterDetailScene<br/>局部视图场景]
    end
    
    subgraph "组件渲染系统 Component Rendering System"
        E1[PlanetCluster<br/>星球集群渲染]
        E2[CharacterSpheres<br/>角色球体渲染]
        E3[JourneyPoints<br/>路径点渲染]
        E4[FogParticles<br/>雾气粒子渲染]
        E5[StarField<br/>背景星空渲染]
        E6[CentralSun<br/>中央恒星渲染]
    end
    
    subgraph "性能优化层 Performance Optimization Layer"
        F1[InstancedMesh<br/>批量实例化渲染]
        F2[BVH优化<br/>空间加速结构]
        F3[LOD系统<br/>细节层次优化]
        F4[对象池<br/>内存优化]
        F5[ShaderManager<br/>自定义着色器]
    end
    
    subgraph "后处理效果层 Post-Processing Layer"
        G1[Bloom辉光效果<br/>UnrealBloomPass]
        G2[自定义Shader<br/>材质特效]
        G3[雾气效果<br/>FogParticles]
        G4[发光材质<br/>EmissiveMaterial]
    end
    
    subgraph "交互系统层 Interaction System Layer"
        H1[射线检测<br/>Raycaster]
        H2[鼠标事件<br/>Mouse Events]
        H3[状态管理<br/>Zustand Store]
        H4[视图切换<br/>Scene Transition]
    end
    
    subgraph "用户界面层 User Interface Layer"
        I1[调试面板<br/>lil-gui Controls]
        I2[信息浮层<br/>Info Overlays]
        I3[数据仪表板<br/>Data Dashboard]
        I4[导航控制<br/>Navigation Controls]
    end
    
    subgraph "最终输出 Final Output"
        J1[3D银河系可视化<br/>Galaxy Visualization]
        J2[角色关系网络<br/>Character Network]
        J3[81难路径图<br/>Journey Path]
        J4[交互式体验<br/>Interactive Experience]
    end
    
    %% 数据流连接
    A1 --> B1
    A2 --> B2
    A3 --> B3
    
    B1 --> C1
    B2 --> C2
    B3 --> C3
    
    C1 --> D1
    C2 --> D2
    C3 --> D3
    
    D1 --> E1
    D1 --> E2
    D2 --> E3
    D2 --> E4
    D3 --> E5
    D3 --> E6
    
    E1 --> F1
    E2 --> F2
    E3 --> F3
    E4 --> F4
    E5 --> F5
    E6 --> F1
    
    F1 --> G1
    F2 --> G2
    F3 --> G3
    F4 --> G4
    F5 --> G1
    
    G1 --> J1
    G2 --> J2
    G3 --> J3
    G4 --> J4
    
    %% 交互流连接
    H1 --> H3
    H2 --> H4
    H3 --> I1
    H4 --> I2
    
    I1 --> D1
    I2 --> D2
    I3 --> D3
    I4 --> D1
    
    %% 样式设置
    classDef dataLayer fill:#e1f5fe
    classDef serviceLayer fill:#f3e5f5
    classDef algorithmLayer fill:#e8f5e8
    classDef renderLayer fill:#fff3e0
    classDef componentLayer fill:#fce4ec
    classDef optimizationLayer fill:#f1f8e9
    classDef postProcessLayer fill:#e0f2f1
    classDef interactionLayer fill:#f9fbe7
    classDef uiLayer fill:#fff8e1
    classDef outputLayer fill:#ffebee
    
    class A1,A2,A3 dataLayer
    class B1,B2,B3 serviceLayer
    class C1,C2,C3 algorithmLayer
    class D1,D2,D3 renderLayer
    class E1,E2,E3,E4,E5,E6 componentLayer
    class F1,F2,F3,F4,F5 optimizationLayer
    class G1,G2,G3,G4 postProcessLayer
    class H1,H2,H3,H4 interactionLayer
    class I1,I2,I3,I4 uiLayer
    class J1,J2,J3,J4 outputLayer`;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 更深的主背景层 - 深蓝紫色基调 */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 animate-gradient-shift"></div>
      
      {/* 第二层渐变 - 深紫色调 */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/80 via-purple-900/60 to-slate-900/80 animate-gradient-shift-reverse"></div>
      
      {/* 第三层渐变 - 增加深度和层次 */}
      <div className="absolute inset-0 bg-gradient-to-bl from-purple-900/50 via-slate-900/70 to-indigo-900/60 animate-gradient-pulse"></div>
      
      {/* 第四层 - 最深的基础色调 */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/60"></div>

      {/* 动态网格背景 - 更深的颜色 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'grid-move 25s linear infinite'
        }}></div>
      </div>

      {/* 浮动光球效果 - 更深的颜色 */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-indigo-900/10 to-purple-900/10 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-900/10 to-slate-900/10 rounded-full blur-3xl animate-float-slow-reverse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-slate-900/8 to-indigo-900/8 rounded-full blur-3xl animate-float-medium"></div>

      {/* Navigation */}
      <nav ref={navRef} className="relative z-10 p-6" id="top">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="bg-slate-900/30 backdrop-blur-md rounded-full px-8 py-3 border border-slate-700/30 shadow-lg">
              <div className="flex items-center space-x-8 text-white/80">
                <button 
                  onClick={() => scrollToSection('top')}
                  className="text-sm font-medium hover:text-white transition-colors cursor-pointer focus:outline-none focus:text-white"
                >
                  关于
                </button>
                <button 
                  onClick={() => scrollToSection('my-approach')}
                  className="text-sm font-medium hover:text-white transition-colors cursor-pointer focus:outline-none focus:text-white"
                >
                  方法
                </button>
                <button 
                  onClick={() => scrollToSection('architecture')}
                  className="text-sm font-medium hover:text-white transition-colors cursor-pointer focus:outline-none focus:text-white"
                >
                  架构
                </button>
                <button 
                  onClick={() => scrollToSection('projects')}
                  className="text-sm font-medium hover:text-white transition-colors cursor-pointer focus:outline-none focus:text-white"
                >
                  项目
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-sm font-medium hover:text-white transition-colors cursor-pointer focus:outline-none focus:text-white"
                >
                  联系
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main ref={heroRef} className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Platform description */}
          <div className="mb-8 hero-animate">
            <p className="text-indigo-300/60 text-base font-medium tracking-wide">
              中国神话体系数字化探索平台
            </p>
          </div>

          {/* Main title */}
          <div className="mb-12 hero-animate">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="text-white">探索 </span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">西游记</span>
              <span className="text-white"> 的</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">神话世界</span>
            </h1>
          </div>

          {/* Description */}
          <div className="mb-8 hero-animate">
            <p className="text-white/60 text-lg leading-relaxed max-w-3xl mx-auto">
              你好！探索者！欢迎来到这里！通过构建关系图谱，深入挖掘西游记中的人物关系和<br />
              故事脉络，探索这个充满智慧与奇幻的神话世界。
            </p>
          </div>

          {/* English subtitle */}
          <div className="mb-12 hero-animate">
            <p className="text-indigo-300/40 text-base font-light tracking-wide">
              Journey Through the Chinese Mythology of Journey to the West
            </p>
          </div>

          {/* Glass CTA Button - 改为按钮并添加点击事件 */}
          <div className="mb-16 hero-animate">
            <button
              ref={ctaButtonRef}
              className="group relative inline-flex items-center px-10 py-5 text-lg font-medium text-white rounded-2xl glass-button focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              onMouseEnter={handleCTAMouseEnter}
              onMouseLeave={handleCTAMouseLeave}
              onClick={() => scrollToSection('my-approach')}
            >
              {/* Glass background layers - 更深的颜色 */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 to-slate-700/10 rounded-2xl backdrop-blur-xl border border-slate-600/30"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 rounded-2xl opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/10 via-transparent to-cyan-500/10 rounded-2xl opacity-40"></div>
              
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-2xl blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-60' : 'opacity-0'}`}></div>
              
              {/* Inner highlight */}
              <div className="absolute inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-2xl"></div>
              
              {/* Content */}
              <span className="relative z-10 mr-3 font-semibold tracking-wide">开始探索神话世界</span>
              <ArrowRight 
                className="cta-arrow relative z-10 w-5 h-5 text-white/90" 
              />
              
              {/* Shimmer effect */}
              <div className="cta-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl transform -skew-x-12"></div>
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center space-x-12 text-sm hero-animate">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-white/40">482个角色</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-300"></div>
              <span className="text-white/40">九九八十一难</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-700"></div>
              <span className="text-white/40">3D可视化图谱</span>
            </div>
          </div>
        </div>
      </main>

      {/* My Approach Section - 添加ID用于滚动定位 */}
      <section className="relative z-10 py-32 px-6" id="my-approach">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              我的 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">探索方法</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              通过三个阶段的系统性方法，深入挖掘西游记的神话体系和人物关系
            </p>
          </div>

          {/* Three Phases Grid - 修复连接线布局 */}
          <div ref={phaseCardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines - 重新设计连接线，避免重叠 */}
            <div className="hidden md:block absolute top-1/2 transform -translate-y-1/2 left-0 right-0 h-px">
              {/* 第一条连接线：第一阶段到第二阶段 */}
              <div className="absolute left-1/3 w-1/3 h-px bg-gradient-to-r from-purple-500/50 to-pink-500/50 transform -translate-x-1/2"></div>
              {/* 第二条连接线：第二阶段到第三阶段 */}
              <div className="absolute right-1/3 w-1/3 h-px bg-gradient-to-r from-pink-500/50 to-cyan-500/50 transform translate-x-1/2"></div>
            </div>
            
            {/* Phase 1 */}
            <div 
              className="phase-card group relative cursor-pointer"
              onMouseEnter={() => handlePhaseHover(1, true)}
              onMouseLeave={() => handlePhaseHover(1, false)}
              onClick={() => handlePhaseClick(1)}
            >
              <div className="glass-card p-8 h-96 flex flex-col items-center justify-center text-center transition-all duration-500 hover:scale-105 overflow-hidden">
                {/* Background layers - 更深的颜色 */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/10 to-slate-900/5 rounded-2xl backdrop-blur-xl border border-slate-600/20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 rounded-2xl opacity-60"></div>
                
                {/* Radial Grid expansion effect */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div 
                    key={phase1Trigger}
                    className="radial-grid-purple opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                </div>
                
                {/* Phase Badge */}
                <div className="relative z-10 mb-8">
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600/20 to-purple-500/20 rounded-full border border-purple-400/30 backdrop-blur-sm">
                    <span className="text-purple-300 font-semibold text-lg">第一阶段</span>
                  </div>
                </div>

                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center border border-purple-400/30">
                    <BookOpen className="w-8 h-8 text-purple-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4">文本解析</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    深度分析原著文本，提取人物信息、关系网络和故事情节，建立基础数据库
                  </p>
                </div>

                {/* Click hint */}
                <div className="relative z-10 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-purple-300/80 text-xs font-medium">点击查看详细流程图</p>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              </div>
            </div>

            {/* Phase 2 */}
            <div 
              className="phase-card group relative cursor-pointer"
              onMouseEnter={() => handlePhaseHover(2, true)}
              onMouseLeave={() => handlePhaseHover(2, false)}
              onClick={() => handlePhaseClick(2)}
            >
              <div className="glass-card p-8 h-96 flex flex-col items-center justify-center text-center transition-all duration-500 hover:scale-105 overflow-hidden">
                {/* Background layers - 更深的颜色 */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/10 to-slate-900/5 rounded-2xl backdrop-blur-xl border border-slate-600/20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-cyan-500/10 rounded-2xl opacity-60"></div>
                
                {/* Radial Grid expansion effect */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div 
                    key={phase2Trigger}
                    className="radial-grid-pink opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                </div>
                
                {/* Phase Badge */}
                <div className="relative z-10 mb-8">
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600/20 to-pink-500/20 rounded-full border border-pink-400/30 backdrop-blur-sm">
                    <span className="text-pink-300 font-semibold text-lg">第二阶段</span>
                  </div>
                </div>

                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-2xl flex items-center justify-center border border-pink-400/30">
                    <Users className="w-8 h-8 text-pink-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4">关系构建</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    构建人物关系图谱，分析师徒关系、敌友关系和社会层级，形成完整的关系网络
                  </p>
                </div>

                {/* Click hint */}
                <div className="relative z-10 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-pink-300/80 text-xs font-medium">点击查看详细流程图</p>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-pink-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              </div>
            </div>

            {/* Phase 3 */}
            <div 
              className="phase-card group relative cursor-pointer"
              onMouseEnter={() => handlePhaseHover(3, true)}
              onMouseLeave={() => handlePhaseHover(3, false)}
              onClick={() => handlePhaseClick(3)}
            >
              <div className="glass-card p-8 h-96 flex flex-col items-center justify-center text-center transition-all duration-500 hover:scale-105 overflow-hidden">
                {/* Background layers - 更深的颜色 */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/10 to-slate-900/5 rounded-2xl backdrop-blur-xl border border-slate-600/20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 rounded-2xl opacity-60"></div>
                
                {/* Radial Grid expansion effect */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div 
                    key={phase3Trigger}
                    className="radial-grid-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></div>
                </div>
                
                {/* Phase Badge */}
                <div className="relative z-10 mb-8">
                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-600/20 to-cyan-500/20 rounded-full border border-cyan-400/30 backdrop-blur-sm">
                    <span className="text-cyan-300 font-semibold text-lg">第三阶段</span>
                  </div>
                </div>

                {/* Icon */}
                <div className="relative z-10 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-2xl flex items-center justify-center border border-cyan-400/30">
                    <Map className="w-8 h-8 text-cyan-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4">可视化呈现</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    创建交互式可视化界面，让用户能够直观地探索人物关系和故事脉络
                  </p>
                </div>

                {/* Click hint */}
                <div className="relative z-10 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-cyan-300/80 text-xs font-medium">点击查看详细流程图</p>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Flow Architecture Section - Mermaid 序列图 */}
      <section className="relative z-10 py-32 px-6" id="architecture">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              数据流 <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">架构图</span>
            </h2>
            <p className="text-white/60 text-lg max-w-3xl mx-auto">
              基于现代Web技术栈构建的高性能数据流架构，实现用户交互到3D可视化的完整数据链路
            </p>
          </div>

          {/* Mermaid Diagram Container */}
          <div className="max-w-6xl mx-auto">
            <div className="glass-card p-8 md:p-12 rounded-3xl overflow-hidden relative">
              {/* Background layers - 更深的颜色 */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/10 to-slate-900/5 rounded-3xl backdrop-blur-xl border border-slate-600/20"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-transparent to-indigo-500/5 rounded-3xl opacity-60"></div>
              
              <div className="relative z-10">
                {/* Mermaid Sequence Diagram */}
                <MermaidDiagram 
                  chart={mermaidChart} 
                  id="architecture-sequence-diagram" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section - 统一容器布局 */}
      <section ref={projectsRef} className="relative z-10 py-24 px-6" id="projects">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              西游记可视化 <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">项目展示</span>
            </h2>
            <p className="text-white/60 text-lg max-w-3xl mx-auto">
              基于Three.js构建的四个核心可视化系统，从不同维度展现西游记的神话世界
            </p>
          </div>

          {/* Projects Grid - 2x2 布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {projects.map((project, index) => (
              <div key={project.id} className="project-card">
                <ProjectCard3D 
                  project={project}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - 添加联系区域 */}
      <section className="relative z-10 py-20 px-6" id="contact">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-slate-900/20 backdrop-blur-md rounded-3xl p-12 border border-slate-700/30">
            <h3 className="text-3xl font-bold text-white mb-6">
              开始你的 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">神话探索之旅</span>
            </h3>
            <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
              准备好深入西游记的神话世界了吗？让我们一起探索这个充满智慧与奇幻的古典文学宝库。
            </p>
            
            {/* 玻璃质感返回顶部按钮 */}
            <button 
              onClick={() => scrollToSection('top')}
              className="group relative inline-flex items-center px-8 py-4 text-lg font-medium text-white rounded-xl transition-all duration-500 transform hover:scale-105 glass-button focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              onMouseEnter={() => setIsBackToTopHovered(true)}
              onMouseLeave={() => setIsBackToTopHovered(false)}
            >
              {/* Glass background layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 to-slate-700/10 rounded-xl backdrop-blur-xl border border-slate-600/30"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 rounded-xl opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/10 via-transparent to-cyan-500/10 rounded-xl opacity-40"></div>
              
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-xl blur-xl transition-opacity duration-500 ${isBackToTopHovered ? 'opacity-60' : 'opacity-0'}`}></div>
              
              {/* Inner highlight */}
              <div className="absolute inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-xl"></div>
              
              {/* Content */}
              <span className="relative z-10 mr-3 font-semibold tracking-wide">返回顶部</span>
              <ArrowRight 
                className={`relative z-10 w-5 h-5 transition-all duration-300 ${
                  isBackToTopHovered ? 'translate-x-1 text-purple-200' : 'text-white/90'
                }`} 
              />
              
              {/* Shimmer effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl transform -skew-x-12 transition-transform duration-1000 ${isBackToTopHovered ? 'translate-x-full' : '-translate-x-full'}`}></div>
            </button>
          </div>
        </div>
      </section>

      {/* Phase Detail Modal - 弹窗显示阶段详情 */}
      {showPhaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={closeModal}
          ></div>
          
          {/* 弹窗内容 */}
          <div className="relative w-full max-w-6xl max-h-[90vh] modal-scrollable">
            <div className="glass-card p-8 md:p-12 rounded-3xl overflow-hidden relative modal-content">
              {/* Background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/10 rounded-3xl backdrop-blur-xl border border-slate-600/30"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 via-transparent to-indigo-500/10 rounded-3xl opacity-60"></div>
              
              {/* 关闭按钮 */}
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 z-20 p-2 bg-slate-800/40 hover:bg-slate-700/60 rounded-full border border-slate-600/40 text-white/80 hover:text-white transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Phase Title */}
              <div className="relative z-10 text-center mb-8">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  第{showPhaseModal}阶段 - 
                  <span className={`ml-2 ${
                    showPhaseModal === 1 ? 'text-purple-300' : 
                    showPhaseModal === 2 ? 'text-pink-300' : 
                    'text-cyan-300'
                  }`}>
                    {showPhaseModal === 1 ? '项目数据流图' : 
                     showPhaseModal === 2 ? '事件驱动的关系变化' : 
                     '整体可视化架构流程图'}
                  </span>
                </h3>
                <p className="text-white/60 text-lg max-w-3xl mx-auto">
                  {showPhaseModal === 1 ? '展示从原始文本分析到最终前端应用消费数据的完整流程' : 
                   showPhaseModal === 2 ? '通过时间线展示西游记中主要人物关系的变化过程' : 
                   '展示完整的3D可视化系统架构，从数据层到最终输出的全栈技术实现'}
                </p>
              </div>
              
              <div className="relative z-10">
                {/* 根据弹窗的阶段显示对应的Mermaid图表 */}
                <MermaidDiagram 
                  chart={
                    showPhaseModal === 1 ? phase1Chart : 
                    showPhaseModal === 2 ? phase2Chart : 
                    phase3Chart
                  } 
                  id={`modal-phase-${showPhaseModal}-diagram`} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles */}
      <style>{`
        .glass-button {
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
        }
        
        .glass-button:hover {
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.4),
            0 0 30px rgba(147, 51, 234, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
        }
        
        .glass-button:active {
          transform: scale(0.98);
        }

        .glass-card {
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .glass-card:hover {
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        /* Modal scrollable container - 隐藏滚动条但保持滚动功能 */
        .modal-scrollable {
          overflow-y: auto;
          overflow-x: hidden;
          /* 隐藏滚动条 - Webkit浏览器 */
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 和 Edge */
        }

        /* 隐藏Webkit浏览器的滚动条 */
        .modal-scrollable::-webkit-scrollbar {
          display: none;
        }

        /* Modal content animation */
        .modal-content {
          animation: modal-appear 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          transform: scale(0.9) translateY(20px);
          opacity: 0;
        }

        @keyframes modal-appear {
          0% {
            transform: scale(0.9) translateY(20px);
            opacity: 0;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        /* Smooth Radial Grid expansion animations with swapped colors */
        .radial-grid-purple {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at center, rgba(147, 51, 234, 0.15) 25%, transparent 30%),
            linear-gradient(transparent 1.5px, rgba(147, 51, 234, 0.4) 1.5px),
            linear-gradient(90deg, transparent 1.5px, rgba(147, 51, 234, 0.4) 1.5px);
          background-size: 100% 100%, 12px 12px, 12px 12px;
          background-position: center, center, center;
          clip-path: circle(0% at center);
          animation: smooth-radial-expand 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .radial-grid-pink {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at center, rgba(236, 72, 153, 0.15) 25%, transparent 30%),
            linear-gradient(transparent 1.5px, rgba(236, 72, 153, 0.4) 1.5px),
            linear-gradient(90deg, transparent 1.5px, rgba(236, 72, 153, 0.4) 1.5px);
          background-size: 100% 100%, 12px 12px, 12px 12px;
          background-position: center, center, center;
          clip-path: circle(0% at center);
          animation: smooth-radial-expand 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .radial-grid-cyan {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at center, rgba(34, 211, 238, 0.15) 25%, transparent 30%),
            linear-gradient(transparent 1.5px, rgba(34, 211, 238, 0.4) 1.5px),
            linear-gradient(90deg, transparent 1.5px, rgba(34, 211, 238, 0.4) 1.5px);
          background-size: 100% 100%, 12px 12px, 12px 12px;
          background-position: center, center, center;
          clip-path: circle(0% at center);
          animation: smooth-radial-expand 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes smooth-radial-expand {
          0% {
            clip-path: circle(0% at center);
            background-size: 100% 100%, 8px 8px, 8px 8px;
          }
          100% {
            clip-path: circle(75% at center);
            background-size: 100% 100%, 18px 18px, 18px 18px;
          }
        }
        
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes gradient-shift-reverse {
          0% {
            background-position: 100% 50%;
          }
          50% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes gradient-pulse {
          0% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 100% 100%;
          }
          50% {
            background-position: 100% 0%;
          }
          75% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
        
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -15px) scale(1.05); }
          66% { transform: translate(-10px, 10px) scale(0.95); }
        }
        
        @keyframes float-slow-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-15px, 20px) scale(0.9); }
          66% { transform: translate(25px, -5px) scale(1.1); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          25% { transform: translate(-50%, -50%) translate(15px, -20px) scale(1.03); }
          50% { transform: translate(-50%, -50%) translate(-20px, 15px) scale(0.97); }
          75% { transform: translate(-50%, -50%) translate(10px, 25px) scale(1.05); }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-gradient-shift {
          background-size: 400% 400%;
          animation: gradient-shift 30s ease-in-out infinite;
        }
        
        .animate-gradient-shift-reverse {
          background-size: 400% 400%;
          animation: gradient-shift-reverse 35s ease-in-out infinite;
        }
        
        .animate-gradient-pulse {
          background-size: 400% 400%;
          animation: gradient-pulse 25s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        
        .animate-float-slow-reverse {
          animation: float-slow-reverse 15s ease-in-out infinite;
        }
        
        .animate-float-medium {
          animation: float-medium 10s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-up.delay-200 {
          animation-delay: 0.2s;
        }
        
        .animate-fade-in-up.delay-300 {
          animation-delay: 0.3s;
        }
        
        .animate-fade-in-up.delay-400 {
          animation-delay: 0.4s;
        }
        
        .animate-fade-in-up.delay-500 {
          animation-delay: 0.5s;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default App;