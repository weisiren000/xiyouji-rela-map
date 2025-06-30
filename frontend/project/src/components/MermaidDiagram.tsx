import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  id: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, id }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMermaid = async () => {
      // Early return if component is unmounted or ref is null
      if (!isMounted || !mermaidRef.current) {
        return;
      }

      try {
        // 检查是否是第三阶段的复杂流程图
        const isPhase3Chart = id.includes('modal-phase-3') || chart.includes('Data Layer') || chart.includes('数据层');
        
        console.log('Chart ID:', id);
        console.log('Is Phase 3 Chart:', isPhase3Chart);

        // 强制重新初始化 - 清除所有缓存
        if (typeof mermaid.mermaidAPI !== 'undefined') {
          mermaid.mermaidAPI.reset();
        }

        // 根据图表类型使用不同的主题配置
        const themeConfig = isPhase3Chart ? {
          // 第三阶段专用配置 - 深色字体配合白色背景
          primaryColor: '#8b5cf6',
          primaryTextColor: '#1f2937', // 深灰色字体
          primaryBorderColor: '#8b5cf6',
          lineColor: '#6366f1',
          secondaryColor: '#f3f4f6',
          tertiaryColor: '#e5e7eb',
          background: 'transparent',
          
          // 主要背景色 - 保持白色
          mainBkg: '#ffffff',
          secondBkg: '#f9fafb',
          tertiaryBkg: '#f3f4f6',
          
          // 流程图节点配置 - 白色背景深色字体
          nodeBkg: '#ffffff',
          nodeTextColor: '#1f2937', // 深灰色字体
          nodeBorder: '#8b5cf6',
          
          // 子图配置 - 浅色背景深色字体
          clusterBkg: '#f9fafb',
          clusterBorder: '#8b5cf6',
          subgraphBkg: '#f9fafb',
          subgraphBorder: '#8b5cf6',
          subgraphTextColor: '#1f2937', // 深灰色字体
          
          // 边线配置
          defaultLinkColor: '#6366f1',
          edgeLabelBackground: '#ffffff',
          
          // 标题和文本 - 深色
          titleColor: '#1f2937',
          
          // 颜色序列 - 浅色背景
          c0: '#f3f4f6',
          c1: '#e5e7eb',
          c2: '#d1d5db',
          c3: '#f9fafb',
          c4: '#f3f4f6',
          c5: '#e5e7eb',
          c6: '#d1d5db',
          c7: '#f9fafb'
        } : {
          // 其他阶段的正常配置 - 保持白色字体
          primaryColor: '#8b5cf6',
          primaryTextColor: '#ffffff',
          primaryBorderColor: '#a855f7',
          lineColor: '#6366f1',
          secondaryColor: '#1e1b4b',
          tertiaryColor: '#312e81',
          background: 'transparent',
          
          // 主要背景色
          mainBkg: 'rgba(139, 92, 246, 0.15)',
          secondBkg: 'rgba(168, 85, 247, 0.15)',
          tertiaryBkg: 'rgba(99, 102, 241, 0.15)',
          
          // 序列图配置
          actorBkg: 'rgba(139, 92, 246, 0.2)',
          actorBorder: '#8b5cf6',
          actorTextColor: '#ffffff',
          actorLineColor: '#6366f1',
          signalColor: '#ffffff',
          signalTextColor: '#ffffff',
          
          // 流程图节点配置
          nodeBkg: 'rgba(139, 92, 246, 0.2)',
          nodeTextColor: '#ffffff',
          nodeBorder: '#8b5cf6',
          
          // 子图配置
          clusterBkg: 'rgba(139, 92, 246, 0.1)',
          clusterBorder: '#8b5cf6',
          subgraphBkg: 'rgba(139, 92, 246, 0.1)',
          subgraphBorder: '#8b5cf6',
          subgraphTextColor: '#ffffff',
          
          // 边线配置
          defaultLinkColor: '#6366f1',
          edgeLabelBackground: 'rgba(139, 92, 246, 0.2)',
          
          // 标题和文本
          titleColor: '#ffffff',
          
          // 颜色序列
          c0: 'rgba(139, 92, 246, 0.2)',
          c1: 'rgba(168, 85, 247, 0.2)',
          c2: 'rgba(99, 102, 241, 0.2)',
          c3: 'rgba(236, 72, 153, 0.2)',
          c4: 'rgba(34, 211, 238, 0.2)',
          c5: 'rgba(34, 197, 94, 0.2)',
          c6: 'rgba(251, 191, 36, 0.2)',
          c7: 'rgba(239, 68, 68, 0.2)',
          
          // 注释配置
          noteBkgColor: 'rgba(251, 191, 36, 0.2)',
          noteTextColor: '#ffffff',
          noteBorderColor: '#f59e0b',
          
          // 激活状态
          activationBkgColor: 'rgba(139, 92, 246, 0.3)',
          activationBorderColor: '#8b5cf6',
          
          // 区域配置
          sectionBkgColor: 'rgba(139, 92, 246, 0.1)',
          altSectionBkgColor: 'rgba(168, 85, 247, 0.1)',
          gridColor: 'rgba(255, 255, 255, 0.1)',
          
          // 循环和标签
          loopTextColor: '#ffffff',
          labelBoxBkgColor: 'rgba(139, 92, 246, 0.2)',
          labelBoxBorderColor: '#8b5cf6',
          labelTextColor: '#ffffff',
          sequenceNumberColor: '#ffffff',
          
          // 时间线特定配置
          timelineCScale: '#8b5cf6',
          timeline0: 'rgba(139, 92, 246, 0.2)',
          timeline1: 'rgba(168, 85, 247, 0.2)',
          timeline2: 'rgba(236, 72, 153, 0.2)',
          timeline3: 'rgba(34, 211, 238, 0.2)',
          timeline4: 'rgba(34, 197, 94, 0.2)',
          timeline5: 'rgba(251, 191, 36, 0.2)',
          timelineTextColor: '#ffffff',
          
          // Git图配置
          git0: 'rgba(139, 92, 246, 0.2)',
          git1: 'rgba(168, 85, 247, 0.2)',
          git2: 'rgba(236, 72, 153, 0.2)',
          git3: 'rgba(34, 211, 238, 0.2)',
          git4: 'rgba(34, 197, 94, 0.2)',
          git5: 'rgba(251, 191, 36, 0.2)',
          git6: 'rgba(239, 68, 68, 0.2)',
          git7: 'rgba(168, 162, 158, 0.2)',
          gitBranchLabel0: '#ffffff',
          gitBranchLabel1: '#ffffff',
          gitBranchLabel2: '#ffffff',
          gitBranchLabel3: '#ffffff',
          gitBranchLabel4: '#ffffff',
          gitBranchLabel5: '#ffffff',
          gitBranchLabel6: '#ffffff',
          gitBranchLabel7: '#ffffff'
        };

        // 强制重新初始化 Mermaid 配置
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: themeConfig,
          sequence: {
            diagramMarginX: 50,
            diagramMarginY: 30,
            actorMargin: 50,
            width: 150,
            height: 65,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: 35,
            mirrorActors: true,
            bottomMarginAdj: 1,
            useMaxWidth: true,
            rightAngles: false,
            showSequenceNumbers: false,
            actorFontSize: 14,
            actorFontFamily: 'ui-sans-serif, system-ui, sans-serif',
            actorFontWeight: 600,
            noteFontSize: 12,
            noteFontFamily: 'ui-sans-serif, system-ui, sans-serif',
            noteFontWeight: 400,
            noteAlign: 'center',
            messageFontSize: 12,
            messageFontFamily: 'ui-sans-serif, system-ui, sans-serif',
            messageFontWeight: 400,
            wrap: true,
            wrapPadding: 10,
            labelBoxWidth: 50,
            labelBoxHeight: 20
          },
          flowchart: {
            diagramPadding: 20,
            htmlLabels: true,
            nodeSpacing: 50,
            rankSpacing: 50,
            curve: 'basis',
            useMaxWidth: true,
            defaultRenderer: 'dagre-wrapper'
          },
          timeline: {
            diagramMarginX: 50,
            diagramMarginY: 30,
            leftMargin: 150,
            width: 150,
            height: 50,
            boxMargin: 10,
            boxTextMargin: 5,
            noteMargin: 10,
            messageMargin: 35,
            mirrorActors: false,
            bottomMarginAdj: 1,
            useMaxWidth: true,
            rightAngles: false
          }
        });

        // Check again before proceeding with rendering
        if (!isMounted || !mermaidRef.current) {
          return;
        }

        // 清空容器
        mermaidRef.current.innerHTML = '';
        
        // 使用唯一ID避免缓存
        const uniqueId = `${id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // 使用 mermaid.render 方法渲染图表
        const { svg } = await mermaid.render(uniqueId, chart);
        
        // Final check before setting innerHTML
        if (!isMounted || !mermaidRef.current) {
          return;
        }

        // 将渲染的 SVG 插入到容器中
        mermaidRef.current.innerHTML = svg;

        // 应用强制样式修复
        const svgElement = mermaidRef.current.querySelector('svg');
        if (svgElement) {
          // 设置SVG样式
          svgElement.style.maxWidth = '100%';
          svgElement.style.height = 'auto';
          
          // 如果是第三阶段，强制修改文字颜色为深色
          if (isPhase3Chart) {
            console.log('Applying Phase 3 dark text fixes...');
            
            // 强制修改所有text元素为深色
            const allTexts = svgElement.querySelectorAll('text');
            allTexts.forEach((text, index) => {
              console.log(`Text ${index}:`, text.getAttribute('fill'));
              text.setAttribute('fill', '#1f2937'); // 深灰色
              text.style.fill = '#1f2937 !important';
              text.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
              text.style.fontWeight = '600';
            });
          }
          
          // 添加统一的自定义样式
          const style = document.createElement('style');
          style.textContent = `
            /* === 通用样式 === */
            .mermaid {
              background: transparent !important;
            }
            
            /* === 序列图样式 === */
            .actor-line {
              stroke-dasharray: 5,5 !important;
              stroke-opacity: 0.6 !important;
            }
            .actor {
              filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
            }
            .messageText {
              fill: #ffffff !important;
              font-weight: 500 !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            .labelText {
              fill: #ffffff !important;
              font-weight: 600 !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            .loopText {
              fill: #ffffff !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            .noteText {
              fill: #ffffff !important;
              font-weight: 500 !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            g.actor-line line {
              stroke-dasharray: 3,3 !important;
              stroke-opacity: 0.5 !important;
              stroke-width: 1.5 !important;
            }
            .actor {
              z-index: 10;
            }
            .messageLine0, .messageLine1 {
              stroke-width: 2 !important;
              stroke-opacity: 0.9 !important;
            }
            .messageLine1 {
              stroke-dasharray: 4,4 !important;
            }
            
            /* === 流程图样式 === */
            .node rect, .node circle, .node ellipse, .node polygon, .node path {
              ${isPhase3Chart ? `
                fill: #ffffff !important;
                stroke: #8b5cf6 !important;
                stroke-width: 2px !important;
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
              ` : `
                fill: rgba(139, 92, 246, 0.2) !important;
                stroke: #8b5cf6 !important;
                stroke-width: 2px !important;
                filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
              `}
            }
            .nodeLabel, .node text {
              ${isPhase3Chart ? `
                fill: #1f2937 !important;
              ` : `
                fill: #ffffff !important;
              `}
              font-weight: 600 !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            .edgePath path {
              stroke: #6366f1 !important;
              stroke-width: 2px !important;
              fill: none !important;
            }
            .arrowheadPath {
              fill: #6366f1 !important;
              stroke: #6366f1 !important;
            }
            
            /* === 子图样式 === */
            .cluster rect {
              ${isPhase3Chart ? `
                fill: #f9fafb !important;
                stroke: #8b5cf6 !important;
                stroke-width: 2px !important;
                stroke-dasharray: 5,5 !important;
                rx: 8px !important;
                ry: 8px !important;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
              ` : `
                fill: rgba(139, 92, 246, 0.1) !important;
                stroke: #8b5cf6 !important;
                stroke-width: 2px !important;
                stroke-dasharray: 5,5 !important;
                rx: 8px !important;
                ry: 8px !important;
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
              `}
            }
            .cluster text, .cluster .nodeLabel {
              ${isPhase3Chart ? `
                fill: #1f2937 !important;
              ` : `
                fill: #ffffff !important;
              `}
              font-weight: 600 !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            
            /* === 第三阶段专用深色文字样式 === */
            ${isPhase3Chart ? `
              /* 强制所有文字为深色 */
              text {
                fill: #1f2937 !important;
                font-weight: 600 !important;
              }
              
              /* 子图标题 */
              .cluster text {
                fill: #1f2937 !important;
                font-weight: 700 !important;
              }
              
              /* 节点文字 */
              .nodeLabel {
                fill: #1f2937 !important;
                font-weight: 600 !important;
              }
              
              /* 边标签 */
              .edgeLabel {
                background-color: #ffffff !important;
                color: #1f2937 !important;
                font-weight: 600 !important;
                padding: 4px 8px !important;
                border-radius: 4px !important;
                border: 1px solid #8b5cf6 !important;
              }
            ` : `
              /* 其他阶段保持白色文字 */
              .edgeLabel {
                background-color: rgba(139, 92, 246, 0.2) !important;
                color: #ffffff !important;
                font-weight: 500 !important;
                padding: 4px 8px !important;
                border-radius: 4px !important;
                font-family: ui-sans-serif, system-ui, sans-serif !important;
              }
            `}
            
            /* === 时间线样式 === */
            .timeline .section rect {
              fill: rgba(139, 92, 246, 0.2) !important;
              stroke: #8b5cf6 !important;
              stroke-width: 2px !important;
              filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
              rx: 6px !important;
              ry: 6px !important;
            }
            .timeline .section0 rect {
              fill: rgba(139, 92, 246, 0.25) !important;
              stroke: #8b5cf6 !important;
            }
            .timeline .section1 rect {
              fill: rgba(168, 85, 247, 0.25) !important;
              stroke: #a855f7 !important;
            }
            .timeline .section2 rect {
              fill: rgba(236, 72, 153, 0.25) !important;
              stroke: #ec4899 !important;
            }
            .timeline .section3 rect {
              fill: rgba(34, 211, 238, 0.25) !important;
              stroke: #22d3ee !important;
            }
            .timeline text {
              fill: #ffffff !important;
              font-weight: 500 !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            .timeline .section-title {
              fill: #ffffff !important;
              font-weight: 600 !important;
              font-size: 16px !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            .timeline-title {
              fill: #ffffff !important;
              font-weight: 700 !important;
              font-size: 20px !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            
            /* === 时间线事件样式 === */
            .timeline .event rect {
              fill: rgba(168, 85, 247, 0.2) !important;
              stroke: #a855f7 !important;
              stroke-width: 1.5px !important;
              rx: 4px !important;
              ry: 4px !important;
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
            }
            
            /* === 时间线连接线样式 === */
            .timeline line {
              stroke: #6366f1 !important;
              stroke-width: 2px !important;
              stroke-opacity: 0.8 !important;
            }
            
            /* === 通用文本样式 === */
            text {
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            
            /* === 标题样式 === */
            .titleText {
              ${isPhase3Chart ? `
                fill: #1f2937 !important;
              ` : `
                fill: #ffffff !important;
              `}
              font-weight: 700 !important;
              font-size: 18px !important;
              font-family: ui-sans-serif, system-ui, sans-serif !important;
            }
            
            /* === 特殊节点样式 === */
            .node.start rect, .node.end rect {
              fill: rgba(34, 197, 94, 0.2) !important;
              stroke: #22c55e !important;
            }
            .node.decision polygon {
              fill: rgba(251, 191, 36, 0.2) !important;
              stroke: #f59e0b !important;
            }
            .node.process rect {
              fill: rgba(99, 102, 241, 0.2) !important;
              stroke: #6366f1 !important;
            }
          `;
          svgElement.appendChild(style);

          // 查找并修改垂直线元素（仅对序列图）
          if (chart.includes('sequenceDiagram')) {
            const lines = svgElement.querySelectorAll('line');
            lines.forEach(line => {
              const x1 = line.getAttribute('x1');
              const x2 = line.getAttribute('x2');
              const y1 = parseFloat(line.getAttribute('y1') || '0');
              const y2 = parseFloat(line.getAttribute('y2') || '0');
              
              // 如果是垂直线（x1 === x2 且线很长）
              if (x1 === x2 && Math.abs(y2 - y1) > 100) {
                line.setAttribute('stroke-dasharray', '3,3');
                line.setAttribute('stroke-opacity', '0.5');
                line.setAttribute('stroke-width', '1.5');
                line.classList.add('actor-line');
              }
            });
          }
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        // 如果渲染失败，显示错误信息
        if (isMounted && mermaidRef.current) {
          mermaidRef.current.innerHTML = `
            <div class="text-white/60 text-center p-8">
              <p>图表渲染失败，请刷新页面重试</p>
              <p class="text-sm mt-2 text-white/40">错误: ${error.message}</p>
            </div>
          `;
        }
      }
    };

    // 延迟初始化以确保DOM完全加载
    const timer = setTimeout(() => {
      initializeMermaid();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [chart, id]);

  return (
    <div 
      ref={mermaidRef} 
      className="mermaid-container w-full flex justify-center items-center bg-transparent"
      style={{ minHeight: '400px' }}
    />
  );
};

export default MermaidDiagram;