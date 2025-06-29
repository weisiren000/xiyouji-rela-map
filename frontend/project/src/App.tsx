import React, { useState } from 'react';
import { ArrowRight, BookOpen, Users, Map } from 'lucide-react';

function App() {
  const [isHovered, setIsHovered] = useState(false);
  const [phase1Trigger, setPhase1Trigger] = useState(0);
  const [phase2Trigger, setPhase2Trigger] = useState(0);
  const [phase3Trigger, setPhase3Trigger] = useState(0);

  const handlePhaseHover = (phase: number, isEntering: boolean) => {
    if (isEntering) {
      if (phase === 1) setPhase1Trigger(prev => prev + 1);
      if (phase === 2) setPhase2Trigger(prev => prev + 1);
      if (phase === 3) setPhase3Trigger(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background - smooth transitions */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 animate-gradient-shift"></div>
      
      {/* Secondary gradient layer - smooth transitions */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/70 via-transparent to-blue-950/70 animate-gradient-shift-reverse"></div>
      
      {/* Third gradient layer for depth - smooth transitions */}
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-pink-950/40 to-cyan-950/40 animate-gradient-pulse"></div>

      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'grid-move 25s linear infinite'
        }}></div>
      </div>

      {/* Floating orbs for ambient effect */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-900/15 to-pink-900/15 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-900/15 to-cyan-900/15 rounded-full blur-3xl animate-float-slow-reverse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-indigo-900/10 to-purple-900/10 rounded-full blur-3xl animate-float-medium"></div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <div className="bg-white/5 backdrop-blur-md rounded-full px-8 py-3 border border-white/10 shadow-lg">
              <div className="flex items-center space-x-8 text-white/80">
                <span className="text-sm font-medium hover:text-white transition-colors cursor-pointer">关于</span>
                <span className="text-sm font-medium hover:text-white transition-colors cursor-pointer">项目</span>
                <span className="text-sm font-medium hover:text-white transition-colors cursor-pointer">特色</span>
                <span className="text-sm font-medium hover:text-white transition-colors cursor-pointer">联系</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Platform description */}
          <div className="mb-8">
            <p className="text-purple-300/60 text-base font-medium tracking-wide animate-fade-in">
              中国神话体系数字化探索平台
            </p>
          </div>

          {/* Main title */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in-up">
              <span className="text-white">探索 </span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">西游记</span>
              <span className="text-white"> 的</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">神话世界</span>
            </h1>
          </div>

          {/* Description */}
          <div className="mb-8">
            <p className="text-white/60 text-lg leading-relaxed max-w-3xl mx-auto animate-fade-in-up delay-200">
              你好！探索者！欢迎来到这里！通过构建关系图谱，深入挖掘西游记中的人物关系和<br />
              故事脉络，探索这个充满智慧与奇幻的神话世界。
            </p>
          </div>

          {/* English subtitle */}
          <div className="mb-12">
            <p className="text-purple-300/40 text-base font-light tracking-wide animate-fade-in-up delay-300">
              Journey Through the Chinese Mythology of Journey to the West
            </p>
          </div>

          {/* Glass CTA Button */}
          <div className="mb-16 animate-fade-in-up delay-400">
            <button
              className="group relative inline-flex items-center px-10 py-5 text-lg font-medium text-white rounded-2xl transition-all duration-500 transform hover:scale-105 glass-button"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Glass background layers */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl backdrop-blur-xl border border-white/20"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20 rounded-2xl opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/10 via-transparent to-cyan-500/10 rounded-2xl opacity-40"></div>
              
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-2xl blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-60' : 'opacity-0'}`}></div>
              
              {/* Inner highlight */}
              <div className="absolute inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-2xl"></div>
              
              {/* Content */}
              <span className="relative z-10 mr-3 font-semibold tracking-wide">开始探索神话世界</span>
              <ArrowRight 
                className={`relative z-10 w-5 h-5 transition-all duration-300 ${
                  isHovered ? 'translate-x-1 text-purple-200' : 'text-white/90'
                }`} 
              />
              
              {/* Shimmer effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl transform -skew-x-12 transition-transform duration-1000 ${isHovered ? 'translate-x-full' : '-translate-x-full'}`}></div>
            </button>
          </div>

          {/* Stats */}
          <div className="flex justify-center items-center space-x-12 text-sm animate-fade-in-up delay-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-white/40">200+ 人物关系</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-300"></div>
              <span className="text-white/40">九九八十一难</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-700"></div>
              <span className="text-white/40">可视化图谱</span>
            </div>
          </div>
        </div>
      </main>

      {/* My Approach Section */}
      <section className="relative z-10 py-32 px-6">
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

          {/* Three Phases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-px bg-gradient-to-r from-purple-500/50 to-pink-500/50 transform -translate-y-1/2"></div>
            <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-px bg-gradient-to-r from-pink-500/50 to-cyan-500/50 transform -translate-y-1/2"></div>
            
            {/* Phase 1 */}
            <div 
              className="group relative"
              onMouseEnter={() => handlePhaseHover(1, true)}
              onMouseLeave={() => handlePhaseHover(1, false)}
            >
              <div className="glass-card p-8 h-96 flex flex-col items-center justify-center text-center transition-all duration-500 hover:scale-105 overflow-hidden">
                {/* Background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/2 rounded-2xl backdrop-blur-xl border border-white/10"></div>
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

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              </div>
            </div>

            {/* Phase 2 */}
            <div 
              className="group relative"
              onMouseEnter={() => handlePhaseHover(2, true)}
              onMouseLeave={() => handlePhaseHover(2, false)}
            >
              <div className="glass-card p-8 h-96 flex flex-col items-center justify-center text-center transition-all duration-500 hover:scale-105 overflow-hidden">
                {/* Background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/2 rounded-2xl backdrop-blur-xl border border-white/10"></div>
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

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-pink-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              </div>
            </div>

            {/* Phase 3 */}
            <div 
              className="group relative"
              onMouseEnter={() => handlePhaseHover(3, true)}
              onMouseLeave={() => handlePhaseHover(3, false)}
            >
              <div className="glass-card p-8 h-96 flex flex-col items-center justify-center text-center transition-all duration-500 hover:scale-105 overflow-hidden">
                {/* Background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/2 rounded-2xl backdrop-blur-xl border border-white/10"></div>
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

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom styles */}
      <style jsx>{`
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