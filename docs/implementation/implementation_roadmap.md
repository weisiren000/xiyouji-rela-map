# 西游记银河系关系图谱实施路线图

## 🎯 **基于你想法的具体实施计划**

### **核心理念实现**
1. ✅ **银河系旋臂效果** - 改造星图的螺旋布局
2. ✅ **中心向外扩散** - 太阳中心 + 八大行星圈层
3. ✅ **点击进入局部视图** - 双层视图系统
4. ✅ **九重天八圈分布** - 水金地火木土天海 + 太阳
5. ✅ **JSON数据驱动** - 读取你的JSONC文件

## 📋 **MVP实施计划（完全对应你的阶段规划）**

### **阶段一：基础搭建（1周）**
**目标**: 搭建React + Vite + Three.js项目，显示10个核心角色

#### 任务1.1：项目初始化
```bash
# 1. 复制星图文件作为基础
cp refer/star_map.html src/frontend/scenes/GalaxyScene.html

# 2. 创建React项目结构（按你的架构图）
mkdir -p src/frontend/{components/{ui,three},scenes,stores,types,utils,hooks}
mkdir -p src/backend/{data-processor,server}
mkdir -p public/{data,shaders}

# 3. 安装依赖
npm create vite@latest xiyouji-visualization --template react-ts
cd xiyouji-visualization
npm install three @react-three/fiber @react-three/drei zustand
```

#### 任务1.2：核心10角色数据准备
```javascript
// public/data/core-characters.json
{
  "core_characters": [
    {"id": "c0001", "name": "孙悟空", "celestial_body": "earth", "importance": 1.0},
    {"id": "c0002", "name": "唐僧", "celestial_body": "earth", "importance": 0.9},
    {"id": "c0003", "name": "猪八戒", "celestial_body": "earth", "importance": 0.8},
    {"id": "c0004", "name": "沙僧", "celestial_body": "earth", "importance": 0.7},
    {"id": "c0005", "name": "白龙马", "celestial_body": "earth", "importance": 0.6},
    {"id": "c0006", "name": "如来佛祖", "celestial_body": "mercury", "importance": 1.0},
    {"id": "c0007", "name": "观音菩萨", "celestial_body": "venus", "importance": 0.95},
    {"id": "c0008", "name": "玉皇大帝", "celestial_body": "sun", "importance": 1.0},
    {"id": "c0010", "name": "牛魔王", "celestial_body": "mars", "importance": 0.85},
    {"id": "c0021", "name": "铁扇公主", "celestial_body": "mars", "importance": 0.75}
  ]
}
```

#### 任务1.3：基础3D场景实现
```typescript
// src/frontend/scenes/GalaxyScene.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { CelestialBody } from '../components/three/nodes/CelestialBody';

export function GalaxyScene() {
  const [characters, setCharacters] = useState([]);
  
  useEffect(() => {
    // 加载核心角色数据
    fetch('/data/core-characters.json')
      .then(res => res.json())
      .then(data => setCharacters(data.core_characters));
  }, []);

  return (
    <Canvas camera={{ position: [0, 20, 50], fov: 60 }}>
      {/* 星空背景 */}
      <Stars radius={300} depth={60} count={20000} factor={7} />
      
      {/* 环境光 */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={1} color="#FFD700" />
      
      {/* 渲染角色节点 */}
      {characters.map(char => (
        <CelestialBody 
          key={char.id}
          character={char}
          position={calculateCelestialPosition(char)}
        />
      ))}
      
      {/* 相机控制 */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={200}
        minDistance={10}
      />
    </Canvas>
  );
}
```

### **阶段二：关系连线（1周）**
**目标**: 50个角色关系数据，节点连线显示，信息面板

#### 任务2.1：扩展角色数据
```javascript
// 从你的allunid.jsonc提取50个重要角色
// 创建relationships.json定义核心关系
{
  "relationships": [
    {
      "from": "c0002", "to": "c0001", 
      "type": "master_disciple", "strength": 0.9
    },
    {
      "from": "c0001", "to": "c0003", 
      "type": "fellow_disciple", "strength": 0.7
    }
    // ... 更多关系
  ]
}
```

#### 任务2.2：关系连线渲染
```typescript
// src/frontend/components/three/RelationshipLine.tsx
function RelationshipLine({ relationship, nodes }) {
  const lineRef = useRef();
  
  // 创建连线几何体
  const points = [
    nodes[relationship.from].position,
    nodes[relationship.to].position
  ];
  
  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color={getRelationshipColor(relationship.type)}
        opacity={0.6}
        transparent
      />
    </line>
  );
}
```

#### 任务2.3：信息面板
```typescript
// src/frontend/components/ui/InfoCard.tsx
export function InfoCard({ character, onClose }) {
  return (
    <div className="info-panel">
      <h3>{character.name}</h3>
      <p>类型: {character.type}</p>
      <p>重要性: {character.importance}</p>
      <p>所属天体: {character.celestial_body}</p>
      <div className="relationships">
        <h4>关系:</h4>
        {character.relationships.map(rel => (
          <div key={rel.id}>
            {rel.type}: {rel.target.name}
          </div>
        ))}
      </div>
      <button onClick={onClose}>关闭</button>
    </div>
  );
}
```

### **阶段三：视觉增强（1周）**
**目标**: 节点分类着色，关系类型区分，搜索功能

#### 任务3.1：天体系统可视化
```typescript
// 实现你的八大行星 + 太阳系统
const celestialBodies = {
  sun: { position: [0, 0, 0], color: '#FFD700', size: 3 },
  mercury: { position: [8, 0, 0], color: '#87CEEB', size: 1.5 },
  venus: { position: [12, 0, 0], color: '#FFC649', size: 1.8 },
  earth: { position: [16, 0, 0], color: '#6B93D6', size: 2.0 },
  mars: { position: [20, 0, 0], color: '#CD5C5C', size: 1.6 },
  jupiter: { position: [24, 0, 0], color: '#D2691E', size: 2.5 },
  saturn: { position: [28, 0, 0], color: '#FAD5A5', size: 2.2 },
  uranus: { position: [32, 0, 0], color: '#4FD0E7', size: 1.8 },
  neptune: { position: [36, 0, 0], color: '#4169E1', size: 1.7 }
};
```

#### 任务3.2：搜索功能
```typescript
// src/frontend/components/ui/SearchBar.tsx
export function SearchBar({ onSearch, characters }) {
  const [query, setQuery] = useState('');
  
  const handleSearch = (searchTerm) => {
    const results = characters.filter(char => 
      char.name.includes(searchTerm) ||
      char.aliases.some(alias => alias.includes(searchTerm))
    );
    onSearch(results);
  };
  
  return (
    <div className="search-bar">
      <input 
        type="text"
        placeholder="搜索角色..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          handleSearch(e.target.value);
        }}
      />
    </div>
  );
}
```

## 🚀 **关键技术实现**

### **1. 双视图切换系统**
```typescript
// 实现你想要的"点击进入局部视图"
const useSceneTransition = () => {
  const [currentView, setCurrentView] = useState('galaxy');
  const [focusEntity, setFocusEntity] = useState(null);
  
  const enterDetailView = (entity) => {
    setFocusEntity(entity);
    setCurrentView('detail');
    
    // 相机动画过渡
    animateCamera(entity.position);
  };
  
  const returnToGalaxy = () => {
    setCurrentView('galaxy');
    setFocusEntity(null);
    
    // 返回银河系全景
    animateCamera(new THREE.Vector3(0, 20, 50));
  };
  
  return { currentView, focusEntity, enterDetailView, returnToGalaxy };
};
```

### **2. 银河系螺旋布局算法**
```typescript
// 实现你的银河系旋臂效果
function calculateGalaxyPosition(entity, index, totalEntities) {
  const celestialBody = celestialBodies[entity.celestial_body];
  const baseRadius = celestialBody.position[0];
  
  // 螺旋分布
  const armIndex = index % 4; // 4条旋臂
  const spiralAngle = (armIndex * Math.PI * 0.5) + (index / totalEntities) * Math.PI * 6;
  
  // 根据重要性调整距离
  const radiusOffset = (1 - entity.importance) * 3;
  const finalRadius = baseRadius + radiusOffset;
  
  return new THREE.Vector3(
    Math.cos(spiralAngle) * finalRadius,
    Math.sin(index * 0.1) * 2, // 轻微垂直分层
    Math.sin(spiralAngle) * finalRadius
  );
}
```

### **3. 数据加载系统**
```typescript
// 读取你的JSONC文件
class XiyoujiDataLoader {
  async loadAllData() {
    const [entities, relationships] = await Promise.all([
      this.loadJSONC('/data/dict/unid/allunid.jsonc'),
      this.loadJSONC('/data/dict/unid/relationships_demo.jsonc')
    ]);
    
    return this.transformToVisualizationData(entities, relationships);
  }
  
  transformToVisualizationData(entities, relationships) {
    // 转换为银河系结构
    const galaxyData = {
      celestialBodies: this.mapToCelestialBodies(entities),
      relationships: this.processRelationships(relationships),
      layout: this.calculateGalaxyLayout()
    };
    
    return galaxyData;
  }
}
```

## ⏱️ **时间线（完全对应你的MVP计划）**

- **第1周**: 阶段一 - 基础搭建 + 10个核心角色
- **第2周**: 阶段二 - 50个角色关系 + 连线显示 + 信息面板
- **第3周**: 阶段三 - 分类着色 + 关系区分 + 搜索功能
- **第4周**: 优化完善 - 性能优化 + 响应式布局

## 🎯 **预期效果**

通过这个实施方案，你将获得：

1. ✅ **完美的银河系效果** - 太阳中心 + 八大行星圈层
2. ✅ **螺旋旋臂分布** - 四条旋臂，角色按重要性分布
3. ✅ **双层视图系统** - 全景 ↔ 局部无缝切换
4. ✅ **九重天概念** - 垂直分层体现等级关系
5. ✅ **数据驱动** - 完全基于你的JSONC数据文件
6. ✅ **震撼视觉效果** - 保留星图的所有特效

这个方案完全按照你的想法实现，既有技术可行性，又有视觉震撼力！
