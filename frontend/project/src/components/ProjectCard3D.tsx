import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Code, Globe, Bot, Zap, Palette } from 'lucide-react';
import { gsap } from 'gsap';

interface Project {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  technologies: string[];
  category: string;
  liveUrl: string;
  featured: boolean;
}

interface ProjectCard3DProps {
  project: Project;
  index: number;
}

const ProjectCard3D: React.FC<ProjectCard3DProps> = ({ project, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipData, setTooltipData] = useState<{ text: string; x: number; y: number; visible: boolean }>({
    text: '',
    x: 0,
    y: 0,
    visible: false
  });

  // GSAP动画时间线引用
  const hoverTl = useRef<gsap.core.Timeline | null>(null);
  const leaveTl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // 创建悬停动画时间线
    hoverTl.current = gsap.timeline({ paused: true });
    leaveTl.current = gsap.timeline({ paused: true });

    // 基于索引的入场动画延迟
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: index * 0.1, // 使用index参数创建错落的动画效果
          ease: "power3.out"
        }
      );
    }

    return () => {
      // 清理时间线
      hoverTl.current?.kill();
      leaveTl.current?.kill();
    };
  }, [index]); // 添加index到依赖数组

  const handleMouseEnter = () => {
    setIsHovered(true);
    
    if (hoverTl.current && cardRef.current && imageRef.current && shadowRef.current) {
      // 停止离开动画
      leaveTl.current?.pause();
      
      // 重置并播放悬停动画
      hoverTl.current.clear()
        .to(cardRef.current, {
          scale: 1.02,
          duration: 0.6,
          ease: "power3.out"
        }, 0)
        .to(imageRef.current, {
          scale: 1.1,
          filter: "brightness(1.1) saturate(1.2)",
          duration: 0.8,
          ease: "power3.out"
        }, 0)
        .to(shadowRef.current, {
          scale: 1.1,
          opacity: 0.8,
          duration: 0.6,
          ease: "power3.out"
        }, 0);
      
      hoverTl.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    
    if (leaveTl.current && cardRef.current && imageRef.current && shadowRef.current) {
      // 停止悬停动画
      hoverTl.current?.pause();
      
      // 重置并播放离开动画
      leaveTl.current.clear()
        .to(cardRef.current, {
          scale: 1,
          rotationX: 0,
          rotationY: 0,
          z: 0,
          duration: 0.8,
          ease: "power3.out"
        }, 0)
        .to(imageRef.current, {
          scale: 1,
          filter: "brightness(1) saturate(1)",
          duration: 0.8,
          ease: "power3.out"
        }, 0)
        .to(shadowRef.current, {
          scale: 1,
          opacity: 0.5,
          x: 0,
          y: 15,
          duration: 0.8,
          ease: "power3.out"
        }, 0);
      
      leaveTl.current.play();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovered) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 计算3D倾斜效果
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const mouseX = (x - centerX) / centerX;
    const mouseY = (y - centerY) / centerY;
    
    const rotateY = mouseX * 15;
    const rotateX = -mouseY * 10;
    
    // 使用GSAP实现平滑的3D倾斜
    gsap.to(cardRef.current, {
      rotationX: rotateX,
      rotationY: rotateY,
      z: 50,
      duration: 0.3,
      ease: "power2.out"
    });

    // 动态阴影跟随
    if (shadowRef.current) {
      gsap.to(shadowRef.current, {
        x: mouseX * 15,
        y: mouseY * 15 + 25,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  // 按钮悬停动画
  const handleButtonMouseEnter = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out"
      });
      
      // 闪烁效果
      const shimmer = buttonRef.current.querySelector('.btn-shimmer');
      if (shimmer) {
        gsap.fromTo(shimmer, 
          { x: '-100%' },
          { x: '100%', duration: 0.8, ease: "power2.out" }
        );
      }
    }
  };

  const handleButtonMouseLeave = () => {
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  // Tooltip事件处理
  const handleTechMouseEnter = (event: React.MouseEvent, tech: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipData({
      text: tech,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      visible: true
    });
  };

  const handleTechMouseLeave = () => {
    setTooltipData(prev => ({ ...prev, visible: false }));
  };

  const getTechIcon = (tech: string) => {
    switch (tech) {
      case 'React': case 'React 18': return <Code className="w-4 h-4 text-blue-400" />;
      case 'Three.js': case 'Three.js 0.160': return <Globe className="w-4 h-4 text-green-400" />;
      case 'TypeScript': return <Code className="w-4 h-4 text-blue-500" />;
      case 'Node.js': return <Code className="w-4 h-4 text-green-500" />;
      case '@react-three/fiber': return <Globe className="w-4 h-4 text-cyan-400" />;
      case '@react-three/drei': return <Globe className="w-4 h-4 text-emerald-400" />;
      case '@react-three/postprocessing': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'Zustand': return <Code className="w-4 h-4 text-orange-400" />;
      case 'Vite': return <Zap className="w-4 h-4 text-yellow-400" />;
      case '密度函数算法': return <Bot className="w-4 h-4 text-purple-500" />;
      case '引力场算法': return <Bot className="w-4 h-4 text-indigo-500" />;
      case 'WebGL': return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'three-mesh-bvh': return <Zap className="w-4 h-4 text-green-500" />;
      case 'Shader渲染': return <Palette className="w-4 h-4 text-pink-500" />;
      case 'lil-gui': return <Code className="w-4 h-4 text-gray-400" />;
      case '模型检测': return <Bot className="w-4 h-4 text-blue-500" />;
      case 'SQLite': return <Code className="w-4 h-4 text-slate-500" />;
      case 'better-sqlite3': return <Code className="w-4 h-4 text-slate-600" />;
      case 'Express.js': return <Code className="w-4 h-4 text-green-600" />;
      case '数据可视化': return <Palette className="w-4 h-4 text-blue-500" />;
      // 保留原有的技术栈图标
      case 'OpenAI': case 'AI': return <Bot className="w-4 h-4 text-purple-400" />;
      case 'GSAP': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'D3.js': return <Palette className="w-4 h-4 text-orange-400" />;
      case 'CSS3': return <Palette className="w-4 h-4 text-blue-600" />;
      case 'JavaScript': return <Code className="w-4 h-4 text-yellow-500" />;
      case 'Python': return <Code className="w-4 h-4 text-blue-600" />;
      case 'FastAPI': return <Zap className="w-4 h-4 text-green-600" />;
      case 'WebSocket': return <Code className="w-4 h-4 text-green-600" />;
      case '算法可视化': return <Zap className="w-4 h-4 text-purple-500" />;
      case '3D建模': return <Globe className="w-4 h-4 text-cyan-500" />;
      case '线框渲染': return <Code className="w-4 h-4 text-green-500" />;
      case 'UI设计': return <Palette className="w-4 h-4 text-pink-500" />;
      case '图论算法': return <Code className="w-4 h-4 text-orange-500" />;
      case '网络分析': return <Globe className="w-4 h-4 text-blue-500" />;
      case '交互设计': return <Palette className="w-4 h-4 text-purple-500" />;
      default: return <Code className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div 
      className={`group relative cursor-pointer transition-all duration-300 ${
        isHovered ? 'z-50' : 'z-10'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* 动态阴影 - 跟随倾斜方向，移除黑色边框 */}
      <div 
        ref={shadowRef}
        className="absolute inset-0 bg-black/40 rounded-3xl blur-2xl -z-10"
        style={{
          transform: 'translateX(0px) translateY(15px) scale(1)',
          opacity: 0.5
        }}
      ></div>

      {/* 3D 卡片容器 - 移除黑色边框，使用更柔和的边框 */}
      <div
        ref={cardRef}
        className="glass-card rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-600/30"
        style={{
          overflow: 'visible',
          transformStyle: 'preserve-3d',
          willChange: 'transform'
        }}
      >
        {/* 内容区域 - 统一的内边距 */}
        <div className="p-6 space-y-6">
          {/* Project Image Container - 移除黑色边框 */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-800/50 border border-slate-600/30">
            <div className="aspect-video relative">
              <img 
                ref={imageRef}
                src={project.image} 
                alt={project.title}
                className="w-full h-full object-cover"
                style={{
                  willChange: 'transform, filter'
                }}
              />
              
              {/* Image Overlay - 更柔和的遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              
              {/* Category Badge - 左上角，更柔和的背景 */}
              <div className="absolute top-4 left-4">
                <div className="inline-flex items-center px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/20">
                  <span className="text-white text-xs font-semibold">{project.category}</span>
                </div>
              </div>

              {/* Featured Badge - 右上角 */}
              {project.featured && (
                <div className="absolute top-4 right-4">
                  <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-500/70 to-teal-500/70 backdrop-blur-md rounded-full border border-emerald-400/40">
                    <Zap className="w-3 h-3 text-white mr-1" />
                    <span className="text-white text-xs font-semibold">精选</span>
                  </div>
                </div>
              )}

              {/* URL显示 - 左下角，更柔和的背景 */}
              <div className="absolute bottom-4 left-4">
                <div className="inline-flex items-center px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/20">
                  <span className="text-white/80 text-xs font-mono">/{project.title.toLowerCase().replace(/\s+/g, '')}-1.web.app</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Info Section */}
          <div className="space-y-4">
            {/* Project Title */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-all duration-500">
                {project.title}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Technologies Row */}
            <div className="flex items-center justify-between">
              {/* Tech Icons - 更柔和的背景，移除黑色边框 */}
              <div className="flex items-center space-x-3">
                {project.technologies.slice(0, 5).map((tech, techIndex) => (
                  <div
                    key={techIndex}
                    className="flex items-center justify-center w-10 h-10 bg-slate-800/60 rounded-xl border border-slate-600/40 transition-all duration-300 hover:scale-110 hover:bg-slate-700/60 cursor-pointer"
                    onMouseEnter={(e) => handleTechMouseEnter(e, tech)}
                    onMouseLeave={handleTechMouseLeave}
                  >
                    {getTechIcon(tech)}
                  </div>
                ))}
                {project.technologies.length > 5 && (
                  <div
                    className="flex items-center justify-center w-10 h-10 bg-slate-800/40 rounded-xl border border-slate-600/30 transition-all duration-300 hover:scale-110 hover:bg-slate-700/60 cursor-pointer"
                    onMouseEnter={(e) => handleTechMouseEnter(e, project.technologies.slice(5).join(', '))}
                    onMouseLeave={handleTechMouseLeave}
                  >
                    <span className="text-white/60 text-xs font-semibold">+{project.technologies.length - 5}</span>
                  </div>
                )}
              </div>

              {/* Check Live Site Button - 更柔和的背景，移除黑色边框 */}
              <button 
                ref={buttonRef}
                className="group/btn relative inline-flex items-center px-6 py-3 text-sm font-semibold text-white rounded-xl glass-button focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                onClick={() => window.open(project.liveUrl, '_blank')}
                onMouseEnter={handleButtonMouseEnter}
                onMouseLeave={handleButtonMouseLeave}
              >
                {/* Glass background layers - 更柔和的颜色 */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800/20 to-slate-700/15 rounded-xl backdrop-blur-xl border border-slate-600/30"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20 rounded-xl opacity-80"></div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 rounded-xl blur-xl opacity-0 group-hover/btn:opacity-80 transition-opacity duration-500"></div>
                
                {/* Inner highlight */}
                <div className="absolute inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-xl"></div>
                
                {/* Content */}
                <span className="relative z-10 mr-2 tracking-wide">Check Live Site</span>
                <ExternalLink 
                  className="relative z-10 w-4 h-4 transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:text-emerald-200" 
                />
                
                {/* Shimmer effect */}
                <div className="btn-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl transform -skew-x-12"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-2xl -z-10"></div>
      </div>

      {/* Portal渲染的Tooltip - 不会被任何容器遮挡 */}
      {tooltipData.visible && createPortal(
        <div
          className="fixed px-3 py-2 bg-slate-900/95 backdrop-blur-sm text-white text-sm rounded-lg shadow-2xl border border-slate-600/50 pointer-events-none whitespace-nowrap max-w-64 text-center"
          style={{
            left: tooltipData.x,
            top: tooltipData.y,
            transform: 'translateX(-50%) translateY(-100%)',
            zIndex: 99999
          }}
        >
          {tooltipData.text}
          {/* 小箭头 */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/95"></div>
        </div>,
        document.body
      )}


    </div>
  );
};

export default ProjectCard3D;