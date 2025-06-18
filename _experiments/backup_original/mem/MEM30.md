# MEM30 - 真实JSON数据加载系统实现记忆

## 核心记忆
成功实现了完整的西游记JSON数据加载系统，包含149个角色和97个别名的真实数据，通过Node.js后端服务器读取解析，前端通过API获取并转换为3D可视化数据。

## 技术架构记忆

### 后端系统
- **数据服务器**: `src/server/dataServer.js` (Node.js + Express)
- **数据路径**: `D:\codee\xiyouji-rela-map\docs\data\JSON`
- **API端点**: `/api/characters`, `/api/stats`, `/api/data/complete`
- **缓存机制**: 5分钟数据缓存，避免重复文件读取

### 前端集成
- **API客户端**: `src/services/dataApi.ts` (DataApi, DataTransformer类)
- **Dashboard更新**: DataLoader组件使用真实API调用
- **错误处理**: 服务器连接检查和优雅降级

### 数据格式
- **角色文件**: unid, basic, attributes, metadata标准结构
- **别名文件**: isAlias=true, aliasOf指向主角色
- **可视化配置**: 基于类型、排名、能力的自动生成

## 启动方式记忆

### 开发启动
```bash
# 后端服务器
cd src/server && npm install && npm start

# 前端开发服务器  
npm run dev

# 一键启动
npm run start:all
```

### 批处理脚本
- `scripts/start-with-server.bat` - 完整启动
- `scripts/start-server-only.bat` - 仅启动服务器

## 数据统计记忆
- **总角色**: 149个 (主角5 + 神仙80 + 人类41 + 妖魔23)
- **总别名**: 97个
- **API地址**: http://localhost:3001
- **数据验证**: 所有测试通过，数据完整性良好

## 问题解决记忆

### PowerShell语法
- 使用分号(;)而非&&连接命令
- `cd path; command` 而非 `cd path && command`

### MCP工具使用
- `list_directory_desktop-commander` - 扫描文件夹
- `read_file_desktop-commander` - 读取JSON文件
- `execute_command_desktop-commander` - 运行测试
- `launch-process` - 启动后端服务
- `fetch_fetch` - 测试API接口

## 下一步记忆
1. 实现3D位置映射算法
2. 添加角色关系连线可视化
3. 完善Dashboard的数据编辑功能
4. 优化大数据量的渲染性能
