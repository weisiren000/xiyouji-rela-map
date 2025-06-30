# 数据库架构与关系建模

## SQLite数据库结构

```mermaid
erDiagram
    characters {
        string unid PK "唯一标识符"
        string name "角色名称"
        string pinyin "拼音"
        string type "角色类型"
        string category "分类"
        integer rank "重要性排名"
        integer power "能力值"
        integer influence "影响力"
        string morality "道德属性"
        integer first_appearance "首次出场"
        boolean is_alias "是否为别名"
        string alias_of "别名指向"
        datetime created_at "创建时间"
        datetime updated_at "更新时间"
    }
    
    character_metadata {
        string unid PK "角色ID"
        string aliases "别名列表"
        string tags "标签"
        string source_chapters "出现章节"
        string attributes "属性描述"
        string description "角色描述"
    }
    
    event {
        integer id PK "事件ID"
        integer nanci "难次编号"
        string nanming "难名"
        string zhuyaorenwu "主要人物"
        string didian "地点"
        string shijianmiaoshu "事件描述"
        string xiangzhengyi "象征意义"
        string wenhuaneihan "文化内涵"
    }
    
    characters ||--|| character_metadata : "unid"
    characters ||--o{ event : "参与事件"
    
    characters {
        string category
    }
    
    characters ||--o{ characters : "alias_of"
```

## 角色关系建模

```mermaid
classDiagram
    class Character {
        +string id
        +string name
        +string pinyin
        +CharacterType type
        +string faction
        +int rank
        +int power
        +int influence
        +Vector3 position
        +Relationship[] relationships
        +getRelatedCharacters()
        +calculateCentrality()
        +getVisualizationData()
    }
    
    class Relationship {
        +string id
        +string from
        +string to
        +RelationshipType type
        +float strength
        +boolean bidirectional
        +string description
        +calculateStrength()
        +getVisualization()
    }
    
    class Event {
        +int id
        +string name
        +string[] mainCharacters
        +string location
        +string description
        +getCharacterConnections()
        +analyzeRelationshipChanges()
    }
    
    class Faction {
        +string name
        +Character[] members
        +Relationship[] internalRelations
        +Relationship[] externalRelations
        +calculateCohesion()
        +analyzePowerStructure()
    }
    
    Character "1" --> "*" Relationship : has
    Relationship "*" --> "2" Character : connects
    Event "*" --> "*" Character : involves
    Faction "1" --> "*" Character : contains
    
    <<enumeration>> CharacterType
    CharacterType : PROTAGONIST
    CharacterType : DEITY
    CharacterType : DEMON
    CharacterType : HUMAN
    CharacterType : DRAGON
    CharacterType : CELESTIAL
    CharacterType : BUDDHIST
    CharacterType : UNDERWORLD
    
    <<enumeration>> RelationshipType
    RelationshipType : MASTER_DISCIPLE
    RelationshipType : FAMILY
    RelationshipType : FRIEND
    RelationshipType : ENEMY
    RelationshipType : COLLEAGUE
    RelationshipType : SUPERIOR
    RelationshipType : ALLIANCE
```

## 数据处理流程

```mermaid
flowchart TD
    subgraph "数据源 Data Sources"
        A[(原始文本数据)]
        B[(历史资料)]
        C[(学术研究)]
    end
    
    subgraph "数据清洗 Data Cleaning"
        D[角色名称标准化]
        E[关系类型分类]
        F[重复数据去除]
        G[别名处理]
    end
    
    subgraph "关系抽取 Relationship Extraction"
        H[文本分析]
        I[事件解析]
        J[关系识别]
        K[强度计算]
    end
    
    subgraph "数据验证 Data Validation"
        L[逻辑一致性检查]
        M[关系合理性验证]
        N[数据完整性检查]
        O[专家审核]
    end
    
    subgraph "数据存储 Data Storage"
        P[(SQLite Database)]
        Q[索引优化]
        R[查询优化]
        S[备份策略]
    end
    
    A --> D
    B --> E
    C --> F
    D --> H
    E --> I
    F --> J
    G --> K
    H --> L
    I --> M
    J --> N
    K --> O
    L --> P
    M --> Q
    N --> R
    O --> S
    
    style A fill:#e8f5e8
    style D fill:#fff3e0
    style H fill:#e1f5fe
    style L fill:#fce4ec
    style P fill:#f3e5f5
```

## 关系强度计算算法

```mermaid
graph TD
    subgraph "基础强度 Base Strength"
        A[关系类型权重]
        B[出现频次]
        C[互动密度]
        D[情感倾向]
    end
    
    subgraph "调整因子 Adjustment Factors"
        E[时间衰减]
        F[距离影响]
        G[第三方影响]
        H[事件冲击]
    end
    
    subgraph "权重计算 Weight Calculation"
        I[师徒关系: 0.9]
        J[血缘关系: 0.8]
        K[敌对关系: 0.7]
        L[友好关系: 0.6]
        M[同事关系: 0.5]
    end
    
    subgraph "最终强度 Final Strength"
        N[加权平均]
        O[归一化处理]
        P[阈值过滤]
        Q[强度分级]
    end
    
    A --> N
    B --> N
    C --> N
    D --> N
    E --> O
    F --> O
    G --> O
    H --> O
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N
    N --> O
    O --> P
    P --> Q
    
    style A fill:#ffebee
    style E fill:#e8f5e8
    style I fill:#e1f5fe
    style N fill:#fff3e0
```

## 3D可视化数据映射

```mermaid
graph LR
    subgraph "数据属性 Data Attributes"
        A[角色重要性<br/>rank: 1-482]
        B[能力值<br/>power: 0-100]
        C[影响力<br/>influence: 0-100]
        D[角色类型<br/>category]
        E[关系强度<br/>strength: 0-1]
    end
    
    subgraph "视觉映射 Visual Mapping"
        F[球体大小<br/>size = f_rank]
        G[发光强度<br/>emissive = f_power]
        H[颜色<br/>color = f_category]
        I[透明度<br/>opacity = f_influence]
        J[连线粗细<br/>width = f_strength]
    end
    
    subgraph "空间布局 Spatial Layout"
        K[径向分布<br/>radius = f_type]
        L[高度层次<br/>y = f_hierarchy]
        M[角度分散<br/>angle = f_faction]
        N[随机扰动<br/>noise = f_variation]
    end
    
    A --> F
    B --> G
    C --> I
    D --> H
    E --> J
    D --> K
    A --> L
    D --> M
    F --> N
    
    style A fill:#e8f5e8
    style F fill:#fff3e0
    style K fill:#e1f5fe
```
