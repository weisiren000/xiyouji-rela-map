import { useState, useCallback } from 'react';
import { UIState } from '../types/galaxy';

interface UseGalaxyReturn extends UIState {
  setProgress: (progress: number) => void;
  setLoading: (loading: boolean) => void;
  toggleAnimation: () => void;
  setCubeCount: (count: number) => void;
  setGalaxyRadius: (radius: string) => void;
}

/**
 * 银河系状态管理Hook
 * 管理UI状态、加载进度、动画状态等
 */
export function useGalaxy(): UseGalaxyReturn {
  const [state, setState] = useState<UIState>({
    isLoading: true,
    progress: 0,
    isAnimating: true,
    cubeCount: 8000,
    galaxyRadius: '80,000 光年',
  });

  // 设置加载进度
  const setProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, progress }));
  }, []);

  // 设置加载状态
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  // 切换动画状态
  const toggleAnimation = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: !prev.isAnimating }));
  }, []);

  // 设置立方体数量
  const setCubeCount = useCallback((cubeCount: number) => {
    setState(prev => ({ ...prev, cubeCount }));
  }, []);

  // 设置银河系半径
  const setGalaxyRadius = useCallback((galaxyRadius: string) => {
    setState(prev => ({ ...prev, galaxyRadius }));
  }, []);

  return {
    ...state,
    setProgress,
    setLoading,
    toggleAnimation,
    setCubeCount,
    setGalaxyRadius,
  };
}
