# 银河系西游记关系图谱设计方案

## 核心设计理念

基于你的想法："银河系旋臂效果，中心向外扩散，点击进入局部视图，九重天八圈分布"

### 1. 双层视图系统

#### 主视图：银河系全景模式
```javascript
// 银河系主场景 - 对应你的 GalaxyScene.tsx
class GalaxyMainScene {
    constructor() {
        this.viewMode = 'galaxy_overview';
        this.celestialLayers = 8; // 水金地火木土天海
        this.centerSun = null;    // 太阳中心
        this.spiralArms = 4;      // 四条旋臂
    }
    
    // 八圈天体分布（对应你的九重天概念）
    initializeCelestialLayers() {
        const layers = [
            { name: '太阳', radius: 0, entities: ['c0008'], color: '#FFD700' },      // 玉皇大帝
            { name: '水星', radius: 8, entities: ['c0006'], color: '#87CEEB' },      // 如来佛祖
            { name: '金星', radius: 12, entities: ['c0007'], color: '#FFD700' },     // 观音菩萨
            { name: '地球', radius: 16, entities: ['c0001','c0002','c0003','c0004','c0005'], color: '#228B22' }, // 取经团队
            { name: '火星', radius: 20, entities: ['c0010','c0021','c0022'], color: '#DC143C' }, // 牛魔王家族
            { name: '木星', radius: 24, entities: ['妖王们'], color: '#8B4513' },
            { name: '土星', radius: 28, entities: ['天庭众神'], color: '#4169E1' },
            { name: '天王星', radius: 32, entities: ['地府众神'], color: '#2F4F4F' },
            { name: '海王星', radius: 36, entities: ['散仙妖怪'], color: '#000080' }
        ];
        
        layers.forEach((layer, index) => {
            this.createCelestialRing(layer, index);
        });
    }
    
    // 创建天体环带
    createCelestialRing(layer, layerIndex) {
        const entitiesInLayer = this.getEntitiesByLayer(layer.entities);
        const angleStep = (Math.PI * 2) / entitiesInLayer.length;
        
        entitiesInLayer.forEach((entity, entityIndex) => {
            // 螺旋分布算法
            const baseAngle = entityIndex * angleStep;
            const spiralOffset = (layerIndex / this.celestialLayers) * Math.PI * 2 * this.spiralArms;
            const finalAngle = baseAngle + spiralOffset;
            
            const position = new THREE.Vector3(
                Math.cos(finalAngle) * layer.radius,
                Math.sin(layerIndex * 0.5) * 3, // 轻微的垂直分层
                Math.sin(finalAngle) * layer.radius
            );
            
            this.createCelestialBody(entity, position, layer);
        });
    }
}
```

#### 局部视图：角色关系详细模式
```javascript
// 角色关系场景 - 对应你的 CharacterScene.tsx
class CharacterDetailScene {
    constructor(focusEntity) {
        this.focusEntity = focusEntity;
        this.viewMode = 'character_detail';
        this.relatedEntities = [];
        this.relationshipLines = [];
    }
    
    // 点击进入局部视图的核心逻辑
    enterDetailView(clickedEntity) {
        // 1. 相机动画过渡
        this.animateCameraTransition(clickedEntity);
        
        // 2. 重新布局相关实体
        this.layoutRelatedEntities(clickedEntity);
        
        // 3. 显示详细关系连线
        this.showDetailedRelationships(clickedEntity);
        
        // 4. 更新UI面板
        this.updateInfoPanel(clickedEntity);
    }
    
    layoutRelatedEntities(centerEntity) {
        const related = this.getRelatedEntities(centerEntity);
        const relationshipTypes = this.groupByRelationshipType(related);
        
        // 按关系类型分圈布局
        Object.entries(relationshipTypes).forEach(([relType, entities], ringIndex) => {
            const radius = 5 + ringIndex * 4;
            const angleStep = (Math.PI * 2) / entities.length;
            
            entities.forEach((entity, index) => {
                const angle = index * angleStep;
                entity.position.set(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                );
            });
        });
    }
}
```

### 2. 场景切换系统

```javascript
// 场景管理器 - 对应你的架构中的场景切换逻辑
class SceneManager {
    constructor() {
        this.currentScene = 'galaxy';
        this.scenes = {
            galaxy: new GalaxyMainScene(),
            character: new CharacterDetailScene(),
            celestial: new CelestialScene() // 你提到的九重天场景
        };
        this.transitionDuration = 2000; // 2秒过渡动画
    }
    
    // 场景切换核心方法
    switchScene(targetScene, focusEntity = null) {
        const currentSceneObj = this.scenes[this.currentScene];
        const targetSceneObj = this.scenes[targetScene];
        
        // 1. 开始过渡动画
        this.startTransition();
        
        // 2. 相机动画
        this.animateCamera(currentSceneObj, targetSceneObj, focusEntity);
        
        // 3. 实体重新布局
        this.animateEntityLayout(targetSceneObj, focusEntity);
        
        // 4. 更新当前场景
        this.currentScene = targetScene;
        
        // 5. 完成过渡
        setTimeout(() => this.completeTransition(), this.transitionDuration);
    }
    
    // 相机动画 - 实现你想要的"进入局部视图"效果
    animateCamera(fromScene, toScene, focusEntity) {
        const camera = this.camera;
        const controls = this.controls;
        
        if (toScene instanceof CharacterDetailScene && focusEntity) {
            // 聚焦到特定角色
            const targetPosition = focusEntity.position.clone();
            targetPosition.y += 10; // 稍微抬高视角
            targetPosition.z += 15; // 后退一些距离
            
            // 使用 Tween.js 或类似库实现平滑过渡
            new TWEEN.Tween(camera.position)
                .to(targetPosition, this.transitionDuration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
                
            new TWEEN.Tween(controls.target)
                .to(focusEntity.position, this.transitionDuration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
        } else if (toScene instanceof GalaxyMainScene) {
            // 返回银河系全景
            const overviewPosition = new THREE.Vector3(0, 20, 50);
            const overviewTarget = new THREE.Vector3(0, 0, 0);
            
            new TWEEN.Tween(camera.position)
                .to(overviewPosition, this.transitionDuration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
                
            new TWEEN.Tween(controls.target)
                .to(overviewTarget, this.transitionDuration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .start();
        }
    }
}
```

### 3. 数据映射到银河系结构

```javascript
// 数据映射器 - 将你的JSONC数据映射到银河系结构
class XiyoujiDataMapper {
    constructor(allunidData, relationshipsData) {
        this.entities = allunidData;
        this.relationships = relationshipsData;
        this.celestialMapping = this.createCelestialMapping();
    }
    
    // 创建天体映射 - 实现你的"八圈分布"概念
    createCelestialMapping() {
        return {
            sun: {
                name: '太阳中心',
                entities: ['c0008'], // 玉皇大帝
                description: '天庭至尊，万神之主',
                color: '#FFD700',
                size: 2.0
            },
            mercury: {
                name: '水星 - 佛界',
                entities: ['c0006', 'c0015', 'c0016', 'c0017'], // 如来、文殊、普贤、弥勒
                description: '佛教圣地，慈悲智慧',
                color: '#87CEEB',
                size: 1.5
            },
            venus: {
                name: '金星 - 观音净土',
                entities: ['c0007'], // 观音菩萨
                description: '大慈大悲，救苦救难',
                color: '#FFD700',
                size: 1.8
            },
            earth: {
                name: '地球 - 取经团队',
                entities: ['c0001', 'c0002', 'c0003', 'c0004', 'c0005'], // 取经五人组
                description: '西天取经，修成正果',
                color: '#228B22',
                size: 1.6
            },
            mars: {
                name: '火星 - 妖魔世界',
                entities: ['c0010', 'c0021', 'c0022', 'c0023'], // 牛魔王、铁扇公主、红孩儿、白骨精
                description: '妖魔聚集，争斗不休',
                color: '#DC143C',
                size: 1.4
            },
            jupiter: {
                name: '木星 - 妖王联盟',
                entities: ['c0024', 'c0025', 'c0027', 'c0028'], // 金角银角、黄袍怪、蜘蛛精等
                description: '各路妖王，各据一方',
                color: '#8B4513',
                size: 1.3
            },
            saturn: {
                name: '土星 - 天庭众神',
                entities: ['c0011', 'c0012', 'c0013', 'c0014'], // 二郎神、哪吒、李天王、太白金星
                description: '天庭神将，护法天兵',
                color: '#4169E1',
                size: 1.2
            },
            uranus: {
                name: '天王星 - 地府冥界',
                entities: ['c0018', 'c0083', 'c0084', 'c0085'], // 地藏王、十殿阎王等
                description: '幽冥地府，轮回审判',
                color: '#2F4F4F',
                size: 1.1
            },
            neptune: {
                name: '海王星 - 散仙边缘',
                entities: ['其他角色'], // 其余角色
                description: '散仙妖怪，边缘存在',
                color: '#000080',
                size: 1.0
            }
        };
    }
    
    // 获取实体的天体归属
    getEntityCelestialBody(entityId) {
        for (const [bodyName, bodyData] of Object.entries(this.celestialMapping)) {
            if (bodyData.entities.includes(entityId)) {
                return {
                    body: bodyName,
                    ...bodyData
                };
            }
        }
        return this.celestialMapping.neptune; // 默认归属海王星
    }
}
```

### 4. 交互逻辑改造

```javascript
// 交互控制器 - 实现你想要的点击进入局部视图效果
class InteractionController {
    constructor(sceneManager, dataMapper) {
        this.sceneManager = sceneManager;
        this.dataMapper = dataMapper;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 点击实体事件
        this.canvas.addEventListener('click', (event) => {
            const clickedEntity = this.getClickedEntity(event);
            if (clickedEntity) {
                this.handleEntityClick(clickedEntity);
            }
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'Escape':
                    this.returnToGalaxyView();
                    break;
                case 'Space':
                    this.toggleAutoRotation();
                    break;
            }
        });
    }
    
    // 处理实体点击 - 核心交互逻辑
    handleEntityClick(entity) {
        if (this.sceneManager.currentScene === 'galaxy') {
            // 从银河系视图进入角色详细视图
            this.enterCharacterDetail(entity);
        } else if (this.sceneManager.currentScene === 'character') {
            // 在角色详细视图中，切换焦点角色
            this.switchCharacterFocus(entity);
        }
        
        // 更新信息面板
        this.updateInfoPanel(entity);
        
        // 播放点击效果（保留星图的脉冲效果）
        this.playClickEffect(entity);
    }
    
    enterCharacterDetail(entity) {
        // 切换到角色详细场景
        this.sceneManager.switchScene('character', entity);
        
        // 更新UI状态
        this.updateUIForDetailView(entity);
        
        // 显示返回按钮
        this.showBackButton();
    }
    
    returnToGalaxyView() {
        // 返回银河系全景
        this.sceneManager.switchScene('galaxy');
        
        // 更新UI状态
        this.updateUIForGalaxyView();
        
        // 隐藏返回按钮
        this.hideBackButton();
    }
}
```

## 🎨 **视觉效果增强**

### 1. 银河系旋臂效果
```javascript
// 增强星图的螺旋效果，更符合银河系外观
function createGalaxyArms(entities) {
    const arms = 4;
    const armWidth = 2;
    const armLength = 40;
    
    entities.forEach((entity, index) => {
        const armIndex = index % arms;
        const positionInArm = (index / entities.length) * armLength;
        
        // 螺旋公式
        const angle = (armIndex * Math.PI * 2 / arms) + (positionInArm * 0.3);
        const radius = 5 + positionInArm;
        
        // 添加随机偏移，模拟真实银河系的不规则性
        const randomOffset = new THREE.Vector3(
            (Math.random() - 0.5) * armWidth,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * armWidth
        );
        
        entity.position.set(
            Math.cos(angle) * radius + randomOffset.x,
            randomOffset.y,
            Math.sin(angle) * radius + randomOffset.z
        );
    });
}
```

### 2. 九重天视觉层次
```javascript
// 实现你的九重天概念的视觉层次
function createCelestialLayers() {
    const layers = [
        { name: '九重天', height: 18, color: '#FFD700', entities: ['最高神'] },
        { name: '八重天', height: 16, color: '#FFA500', entities: ['高级神仙'] },
        { name: '七重天', height: 14, color: '#FF8C00', entities: ['中级神仙'] },
        { name: '六重天', height: 12, color: '#FF7F50', entities: ['初级神仙'] },
        { name: '五重天', height: 10, color: '#FF6347', entities: ['天兵天将'] },
        { name: '四重天', height: 8, color: '#FF4500', entities: ['护法神'] },
        { name: '三重天', height: 6, color: '#FF0000', entities: ['山神土地'] },
        { name: '二重天', height: 4, color: '#DC143C', entities: ['城隍判官'] },
        { name: '一重天', height: 2, color: '#B22222', entities: ['鬼差小神'] }
    ];
    
    // 为每层创建发光环效果
    layers.forEach(layer => {
        const ring = createGlowingRing(layer.height * 5, layer.color);
        scene.add(ring);
    });
}
```

这个改造方案完美结合了你的想法和星图的技术优势，既保留了震撼的视觉效果，又实现了你想要的银河系旋臂、九重天分层、点击进入局部视图等核心功能！
