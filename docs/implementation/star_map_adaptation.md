# 星图效果改造为西游记关系图谱

## 核心改造策略

### 1. 数据映射改造
将现有的神经网络节点系统改造为西游记实体系统：

```javascript
// 原始节点类
class Node {
    constructor(position, level = 0, type = 0) {
        this.position = position;
        this.connections = [];
        this.level = level;
        this.type = type;
    }
}

// 改造为西游记节点
class XiyoujiNode {
    constructor(entity, position, importance = 0.5) {
        this.id = entity.id;           // c0001, e0001 等
        this.name = entity.name;       // 孙悟空, 大闹天宫 等
        this.type = entity.type;       // character, event, location 等
        this.category = entity.category; // protagonist, deity, demon 等
        this.position = position;
        this.connections = [];
        this.importance = importance;   // 0-1，影响大小和位置
        this.aliases = entity.aliases || [];
        this.visual = {
            color: this.getTypeColor(),
            size: this.getImportanceSize(),
            shape: this.getTypeShape()
        };
    }
    
    getTypeColor() {
        const colorMap = {
            character: '#ff6b6b',  // 红色系 - 角色
            event: '#4ecdc4',      // 青色系 - 事件  
            location: '#45b7d1',   // 蓝色系 - 地点
            artifact: '#f9ca24',   // 金色系 - 法宝
            item: '#6c5ce7',       // 紫色系 - 物品
            skill: '#a29bfe'       // 淡紫色 - 技能
        };
        return colorMap[this.type] || '#ffffff';
    }
}
```

### 2. 布局算法改造
将4种神经网络布局改造为西游记主题布局：

#### 布局1：九重天布局（改造自量子皮层）
```javascript
function generateNineHeavensLayout(entities, relationships) {
    const layers = 9; // 九重天
    const rootNode = findEntity('c0008'); // 玉皇大帝作为中心
    
    // 按重要性和类型分层
    const layerAssignment = {
        0: ['c0006', 'c0008'],           // 最高层：如来、玉帝
        1: ['c0007', 'c0009'],           // 第二层：观音、老君
        2: ['c0011', 'c0012', 'c0013'],  // 第三层：二郎神、哪吒、李天王
        // ... 其他层级
        8: ['妖怪', '小妖']              // 最底层：小妖怪
    };
    
    // 每层内部使用螺旋分布
    layerAssignment.forEach((entityIds, layer) => {
        const radius = (9 - layer) * 3; // 越重要越靠近中心
        const height = (layer - 4) * 5; // 垂直分层
        
        entityIds.forEach((id, index) => {
            const angle = (index / entityIds.length) * Math.PI * 2;
            const position = new THREE.Vector3(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            // 设置节点位置...
        });
    });
}
```

#### 布局2：取经路线布局（改造自神经漩涡）
```javascript
function generateJourneyPathLayout(entities, relationships) {
    // 以取经路线为主轴的螺旋布局
    const journeyEvents = getJourneyEvents(); // 按时间顺序的取经事件
    const pathLength = 100;
    const spiralRadius = 20;
    
    journeyEvents.forEach((event, index) => {
        const t = index / (journeyEvents.length - 1);
        const angle = t * Math.PI * 6; // 3圈螺旋
        const z = (t - 0.5) * pathLength; // 沿Z轴展开取经路线
        
        const position = new THREE.Vector3(
            Math.cos(angle) * spiralRadius * (1 - t * 0.3),
            Math.sin(angle) * spiralRadius * (1 - t * 0.3),
            z
        );
        
        // 相关角色围绕事件分布
        const relatedCharacters = getEventCharacters(event);
        relatedCharacters.forEach((char, charIndex) => {
            const charAngle = (charIndex / relatedCharacters.length) * Math.PI * 2;
            const charPos = position.clone().add(new THREE.Vector3(
                Math.cos(charAngle) * 3,
                Math.sin(charAngle) * 3,
                0
            ));
            // 设置角色位置...
        });
    });
}
```

#### 布局3：势力阵营布局（改造自超维网格）
```javascript
function generateFactionLayout(entities, relationships) {
    const factions = {
        heavenly_court: { center: new THREE.Vector3(20, 10, 0), color: '#4169e1' },
        buddhist: { center: new THREE.Vector3(-20, 10, 0), color: '#ffd700' },
        taoist: { center: new THREE.Vector3(0, 10, 20), color: '#9370db' },
        demon: { center: new THREE.Vector3(0, -10, 0), color: '#dc143c' },
        mortal: { center: new THREE.Vector3(0, 0, -20), color: '#228b22' }
    };
    
    Object.entries(factions).forEach(([factionName, factionData]) => {
        const factionEntities = entities.filter(e => e.faction === factionName);
        
        // 每个阵营内部使用球形分布
        factionEntities.forEach((entity, index) => {
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = 2 * Math.PI * Math.random();
            const radius = 5 + Math.random() * 10;
            
            const offset = new THREE.Vector3(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
            
            entity.position = factionData.center.clone().add(offset);
        });
    });
}
```

### 3. 关系连线改造
将神经连接改造为西游记关系：

```javascript
const relationshipStyles = {
    master_disciple: {
        color: '#4CAF50',
        width: 0.15,
        style: 'solid',
        pulseColor: '#81C784',
        animation: 'flow_to_disciple'
    },
    family: {
        color: '#E91E63',
        width: 0.12,
        style: 'solid',
        pulseColor: '#F48FB1',
        animation: 'bidirectional_pulse'
    },
    enemy: {
        color: '#F44336',
        width: 0.1,
        style: 'zigzag',
        pulseColor: '#EF5350',
        animation: 'conflict_spark'
    },
    ally: {
        color: '#2196F3',
        width: 0.08,
        style: 'dashed',
        pulseColor: '#64B5F6',
        animation: 'cooperation_flow'
    }
};

// 连线着色器改造
const connectionShader = {
    fragmentShader: `
        uniform float uTime;
        uniform vec3 uRelationshipColor;
        uniform int uRelationshipType;
        varying float vPathPosition;
        varying float vPulseIntensity;
        
        void main() {
            vec3 baseColor = uRelationshipColor;
            
            // 根据关系类型添加特殊效果
            if (uRelationshipType == 0) { // master_disciple
                // 师徒关系：稳定的流动效果
                float flow = sin(vPathPosition * 10.0 - uTime * 2.0) * 0.5 + 0.5;
                baseColor *= (0.8 + 0.2 * flow);
            } else if (uRelationshipType == 2) { // enemy
                // 敌对关系：闪烁冲突效果
                float conflict = sin(uTime * 5.0) * sin(vPathPosition * 20.0);
                baseColor *= (0.7 + 0.3 * abs(conflict));
            }
            
            // 脉冲效果
            if (vPulseIntensity > 0.0) {
                baseColor *= (1.0 + vPulseIntensity * 0.5);
            }
            
            gl_FragColor = vec4(baseColor, 0.8);
        }
    `
};
```

### 4. 交互功能改造

#### 点击效果改造
```javascript
// 原始：点击产生能量脉冲
// 改造：点击角色显示相关信息和关系高亮

function onNodeClick(clickedNode) {
    // 1. 显示角色信息面板
    showCharacterInfo(clickedNode);
    
    // 2. 高亮相关关系
    highlightRelatedNodes(clickedNode);
    
    // 3. 播放特殊动画
    if (clickedNode.type === 'character') {
        playCharacterAnimation(clickedNode);
    }
    
    // 4. 发送关系脉冲（保留原有效果但改为关系传播）
    sendRelationshipPulse(clickedNode);
}

function showCharacterInfo(node) {
    const infoPanel = document.getElementById('character-info');
    infoPanel.innerHTML = `
        <h3>${node.name}</h3>
        <p><strong>类型:</strong> ${getTypeDisplayName(node.type)}</p>
        <p><strong>别名:</strong> ${node.aliases.join(', ')}</p>
        <p><strong>关系数:</strong> ${node.connections.length}</p>
        <div class="relationships">
            ${node.connections.map(conn => 
                `<div class="relationship-item">
                    <span class="relation-type">${conn.type}</span>
                    <span class="target-name">${conn.target.name}</span>
                </div>`
            ).join('')}
        </div>
    `;
    infoPanel.style.display = 'block';
}
```

### 5. 主题配色改造
将4个主题改造为西游记风格：

```javascript
const xiyoujiThemes = [
    {
        name: "天庭金辉",
        colors: [
            new THREE.Color(0xFFD700), // 金色
            new THREE.Color(0xFFA500), // 橙金色
            new THREE.Color(0xFF8C00), // 深橙色
            new THREE.Color(0xB8860B), // 暗金色
            new THREE.Color(0xDAA520)  // 金麒麟色
        ],
        background: 0x000033,
        fog: 0x000066
    },
    {
        name: "佛光普照", 
        colors: [
            new THREE.Color(0xFFE4B5), // 佛光色
            new THREE.Color(0xDEB887), // 浅棕色
            new THREE.Color(0xF4A460), // 沙棕色
            new THREE.Color(0xCD853F), // 秘鲁色
            new THREE.Color(0xD2691E)  // 巧克力色
        ],
        background: 0x1a1a2e,
        fog: 0x16213e
    },
    {
        name: "妖魔鬼怪",
        colors: [
            new THREE.Color(0x8B0000), // 暗红色
            new THREE.Color(0x4B0082), // 靛青色
            new THREE.Color(0x2F4F4F), // 暗灰色
            new THREE.Color(0x800080), // 紫色
            new THREE.Color(0x556B2F)  // 暗橄榄绿
        ],
        background: 0x000000,
        fog: 0x330000
    },
    {
        name: "取经路上",
        colors: [
            new THREE.Color(0x87CEEB), // 天蓝色
            new THREE.Color(0x98FB98), // 淡绿色
            new THREE.Color(0xF0E68C), // 卡其色
            new THREE.Color(0xDDA0DD), // 梅花色
            new THREE.Color(0x20B2AA)  // 浅海绿
        ],
        background: 0x191970,
        fog: 0x483D8B
    }
];
```

## 实施步骤

### 第一步：复制和清理（1天）
1. 复制 `star_map.html` 为 `xiyouji_map.html`
2. 移除神经网络相关的变量名和注释
3. 重命名核心类和函数

### 第二步：数据接口改造（2-3天）
1. 创建数据加载器，读取你的 JSONC 文件
2. 将实体数据转换为节点数据
3. 将关系数据转换为连接数据

### 第三步：布局算法替换（3-4天）
1. 保留一个原始布局作为"自由模式"
2. 实现九重天布局
3. 实现取经路线布局
4. 实现势力阵营布局

### 第四步：视觉效果调整（2-3天）
1. 调整配色方案
2. 修改节点形状和大小
3. 优化连线样式
4. 添加西游记特色的视觉元素

### 第五步：交互功能增强（2-3天）
1. 角色信息面板
2. 关系筛选功能
3. 搜索功能
4. 故事模式（按时间线播放）

## 预期效果

通过这个改造，你将获得：
- ✅ 保留星图的所有视觉特效（辉光、脉冲、动画）
- ✅ 适配西游记数据结构和关系
- ✅ 4种不同的布局模式展示不同视角
- ✅ 丰富的交互功能
- ✅ 高性能的Three.js渲染
- ✅ 响应式设计支持移动端

这个方案既保留了星图的视觉震撼力，又完美适配了你的西游记关系图谱需求！
