import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useState, useCallback, useRef, useMemo } from 'react';
import * as THREE from 'three';
import './styles/global.css';

// 精确复刻的银河系组件
function Galaxy({ isAnimating }: { isAnimating: boolean }) {
  const galaxyGroupRef = useRef<THREE.Group>(null);
  const spiralCubesRef = useRef<Array<{
    mesh: THREE.Mesh;
    originalY: number;
    timeOffset: number;
  }>>([]);

  // 银河系中心组件
  const centerCubes = useMemo(() => {
    const cubes = [];
    const cubeCount = 2000;
    const cubeSize = 0.6;

    for (let i = 0; i < cubeCount; i++) {
      // 球坐标系分布 - 完全按照原始代码
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = Math.random() * 6 + 4; // 4-10距离

      // 转换为笛卡尔坐标
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.cos(theta);
      const z = radius * Math.sin(theta) * Math.sin(phi);

      // 随机旋转
      const rotation = [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ] as [number, number, number];

      cubes.push({
        key: `center-${i}`,
        position: [x, y, z] as [number, number, number],
        rotation,
        size: cubeSize
      });
    }
    return cubes;
  }, []);

  // 螺旋臂组件
  const spiralArms = useMemo(() => {
    const cubes = [];
    const armCount = 4; // 四条旋臂
    const cubesPerArm = 1500; // 每条臂1500个立方体
    const cubeSize = 0.5;

    for (let arm = 0; arm < armCount; arm++) {
      const armAngle = (arm / armCount) * Math.PI * 2;

      for (let i = 0; i < cubesPerArm; i++) {
        // 使用对数螺旋线方程：r = a * e^(bθ) - 完全按照原始代码
        const angle = armAngle + (i / 100);
        const distance = 10 + (i / cubesPerArm) * 70; // 10-80的距离

        // 添加随机偏移使旋臂更自然
        const offset = (Math.random() - 0.5) * 5;
        const x = Math.cos(angle) * (distance + offset);
        const z = Math.sin(angle) * (distance + offset);
        const y = (Math.random() - 0.5) * 4;

        // 蓝色到紫色
        const hue = 0.7 + Math.random() * 0.2;

        // 随机旋转
        const rotation = [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ] as [number, number, number];

        cubes.push({
          key: `spiral-${arm}-${i}`,
          position: [x, y, z] as [number, number, number],
          rotation,
          size: cubeSize,
          hue,
          originalY: y,
          timeOffset: Math.random() * Math.PI * 2
        });
      }
    }
    return cubes;
  }, []);

  // 星系晕组件
  const haloStars = useMemo(() => {
    const stars = [];
    const starCount = 1000;

    for (let i = 0; i < starCount; i++) {
      // 球坐标系分布 - 完全按照原始代码
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 80 + Math.random() * 40; // 80-120距离

      // 转换为笛卡尔坐标
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.cos(theta);
      const z = radius * Math.sin(theta) * Math.sin(phi);

      stars.push({
        key: `halo-${i}`,
        position: [x, y, z] as [number, number, number]
      });
    }
    return stars;
  }, []);

  // 动画循环 - 完全按照原始代码
  useFrame(() => {
    if (!isAnimating) return;

    // 旋转整个银河系
    if (galaxyGroupRef.current) {
      galaxyGroupRef.current.rotation.y += 0.002;
    }

    // 更新旋臂动画
    const time = Date.now() * 0.001;
    spiralCubesRef.current.forEach((cubeData) => {
      const { mesh, originalY, timeOffset } = cubeData;

      // 上下浮动效果
      mesh.position.y = originalY + Math.sin(time * 0.5 + timeOffset) * 0.5;

      // 轻微旋转效果
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.004;
    });
  });

  return (
    <group ref={galaxyGroupRef}>
      {/* 星系核心 */}
      <mesh>
        <sphereGeometry args={[8, 32, 32]} />
        <meshPhongMaterial
          color={0xffcc00}
          emissive={0xffaa00}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* 中心周围的立方体像素 */}
      {centerCubes.map((cube) => (
        <mesh
          key={cube.key}
          position={cube.position}
          rotation={cube.rotation}
        >
          <boxGeometry args={[cube.size, cube.size, cube.size]} />
          <meshPhongMaterial
            color={new THREE.Color().setHSL(0.12, 0.9, 0.6)}
            emissive={new THREE.Color().setHSL(0.12, 0.8, 0.2)}
            shininess={30}
          />
        </mesh>
      ))}

      {/* 螺旋臂立方体 */}
      {spiralArms.map((cube) => (
        <mesh
          key={cube.key}
          position={cube.position}
          rotation={cube.rotation}
          ref={(mesh) => {
            if (mesh && !spiralCubesRef.current.find(item => item.mesh === mesh)) {
              spiralCubesRef.current.push({
                mesh,
                originalY: cube.originalY,
                timeOffset: cube.timeOffset
              });
            }
          }}
        >
          <boxGeometry args={[cube.size, cube.size, cube.size]} />
          <meshPhongMaterial
            color={new THREE.Color().setHSL(cube.hue, 0.8, 0.6)}
            emissive={new THREE.Color().setHSL(cube.hue, 0.8, 0.2)}
            shininess={30}
          />
        </mesh>
      ))}

      {/* 星系晕（外围稀疏恒星） */}
      {haloStars.map((star) => (
        <mesh key={star.key} position={star.position}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshPhongMaterial
            color={0xffffff}
            emissive={0xaaaaaa}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function App() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const toggleAnimation = useCallback(() => {
    setIsAnimating(!isAnimating);
  }, [isAnimating]);

  // 模拟加载进度
  useState(() => {
    const timer = setTimeout(() => {
      setProgress(30);
      setTimeout(() => {
        setProgress(70);
        setTimeout(() => {
          setProgress(100);
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
    return () => clearTimeout(timer);
  });

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 头部 - 完全按照原始样式 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '20px',
        zIndex: 10,
        textAlign: 'center',
        background: 'rgba(0, 0, 20, 0.5)',
        backdropFilter: 'blur(5px)',
        borderBottom: '1px solid rgba(100, 100, 255, 0.3)',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          marginBottom: '10px',
          textShadow: '0 0 10px #4d79ff',
          background: 'linear-gradient(to right, #4facfe, #00f2fe)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          三维银河系像素方块可视化
        </h1>
        <p style={{
          fontSize: '1.1rem',
          opacity: 0.8,
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          使用立方体像素展示银河系结构，包含中心密集区域和四条旋臂
        </p>
      </div>

      {/* 3D场景 - 完全按照原始配置 */}
      <Canvas
        camera={{ position: [0, 40, 80], fov: 60, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
        dpr={window.devicePixelRatio}
        style={{ width: '100%', height: '100vh' }}
      >
        <color attach="background" args={['#000022']} />
        <fog attach="fog" args={['#000022', 100, 300]} />

        {/* 完全按照原始光源配置 */}
        <ambientLight color="#333366" intensity={1} />
        <directionalLight
          color="#ffffff"
          intensity={1}
          position={[5, 10, 7]}
        />
        <pointLight
          color="#ffcc00"
          intensity={2}
          distance={50}
          position={[0, 0, 0]}
        />

        <Galaxy isAnimating={isAnimating} />

        <OrbitControls
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* 控制说明 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 5, 30, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid rgba(100, 100, 255, 0.3)',
        zIndex: 10,
        color: '#a0b0ff'
      }}>
        <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>鼠标拖拽 = 旋转视角</p>
        <p style={{ marginBottom: '10px', fontSize: '0.9rem' }}>鼠标滚轮 = 缩放</p>
        <p style={{ marginBottom: '0', fontSize: '0.9rem' }}>右键拖拽 = 平移</p>
      </div>

      {/* 信息面板 */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '20px',
        background: 'rgba(0, 5, 30, 0.7)',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid rgba(100, 100, 255, 0.3)',
        zIndex: 10,
        maxWidth: '300px',
        color: '#a0b0ff'
      }}>
        <h3 style={{ marginBottom: '10px', color: '#4facfe' }}>银河系结构</h3>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '8px' }}>• 中央核球：密集的黄色恒星群</p>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '8px' }}>• 四条旋臂：蓝紫色立方体代表恒星系统</p>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0' }}>• 星系晕：外围的稀疏恒星</p>
      </div>

      {/* 统计信息 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 5, 30, 0.7)',
        padding: '10px 15px',
        borderRadius: '10px',
        fontSize: '0.9rem',
        border: '1px solid rgba(100, 100, 255, 0.3)',
        zIndex: 10,
        color: '#a0b0ff'
      }}>
        <p style={{ marginBottom: '5px' }}>立方体数量: <span style={{ color: '#4facfe', fontWeight: 'bold' }}>8,000</span></p>
        <p style={{ marginBottom: '0' }}>星系半径: <span style={{ color: '#4facfe', fontWeight: 'bold' }}>80,000 光年</span></p>
      </div>

      {/* 动画切换按钮 */}
      <button
        onClick={toggleAnimation}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 5, 30, 0.7)',
          padding: '10px 15px',
          borderRadius: '10px',
          border: '1px solid rgba(100, 100, 255, 0.3)',
          zIndex: 10,
          cursor: 'pointer',
          color: '#a0b0ff',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(20, 30, 80, 0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 5, 30, 0.7)';
        }}
      >
        {isAnimating ? '暂停运动' : '开始运动'}
      </button>

      {/* 加载界面 */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 20,
          color: '#4facfe'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>正在生成银河系...</div>
          <div style={{
            width: '300px',
            height: '10px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00f2fe, #4facfe)',
              borderRadius: '5px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
