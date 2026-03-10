# 三国大富翁 - 技术选型文档

**版本**：v1.0  
**更新日期**：2026-03-10  
**设计者**：虾仁

---

## 一、技术栈总览

| 层级 | 技术选型 | 备选方案 |
|------|----------|----------|
| 前端框架 | Vue 3 + TypeScript | React |
| UI框架 | Tailwind CSS | Element Plus |
| 状态管理 | Pinia | Vuex |
| 动画 | Framer Motion | GSAP |
| 地图渲染 | Canvas + SVG | Konva.js |
| 后端框架 | Node.js + Fastify | Express |
| 实时通信 | Socket.io | WebSocket (原生) |
| 数据库 | Redis + SQLite | PostgreSQL |
| 缓存 | Redis | 内存缓存 |
| 部署 | Docker + 云服务器 | Vercel + Railway |

---

## 二、前端技术栈

### 2.1 框架选择：Vue 3 + TypeScript

**选择理由**：
- Vue 3 Composition API 适合复杂状态管理
- TypeScript 提供类型安全
- 生态成熟，文档完善
- 性能优秀

**项目结构**：
```
frontend/
├── src/
│   ├── assets/          # 静态资源
│   │   ├── images/      # 图片
│   │   ├── audio/       # 音效
│   │   └── fonts/       # 字体
│   ├── components/      # 组件
│   │   ├── game/        # 游戏相关组件
│   │   │   ├── Board.vue        # 地图
│   │   │   ├── Player.vue       # 玩家
│   │   │   ├── Dice.vue         # 骰子
│   │   │   ├── Card.vue         # 卡牌
│   │   │   ├── City.vue         # 城池
│   │   │   └── HeroSelect.vue   # 武将选择
│   │   ├── room/        # 房间相关组件
│   │   │   ├── RoomList.vue     # 房间列表
│   │   │   ├── RoomCreate.vue   # 创建房间
│   │   │   └── RoomLobby.vue    # 房间大厅
│   │   └── common/      # 通用组件
│   │       ├── Button.vue
│   │       ├── Modal.vue
│   │       └── Toast.vue
│   ├── composables/     # 组合式函数
│   │   ├── useGame.ts   # 游戏逻辑
│   │   ├── useSocket.ts # Socket连接
│   │   └── useAudio.ts  # 音效控制
│   ├── stores/          # Pinia状态管理
│   │   ├── game.ts      # 游戏状态
│   │   ├── player.ts    # 玩家状态
│   │   └── room.ts      # 房间状态
│   ├── types/           # TypeScript类型
│   │   ├── game.ts
│   │   ├── player.ts
│   │   └── card.ts
│   ├── utils/           # 工具函数
│   │   ├── gameLogic.ts # 游戏逻辑
│   │   └── helpers.ts   # 辅助函数
│   ├── views/           # 页面
│   │   ├── Home.vue     # 首页
│   │   ├── Lobby.vue    # 大厅
│   │   ├── Room.vue     # 房间
│   │   └── Game.vue     # 游戏页面
│   ├── App.vue
│   └── main.ts
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 2.2 UI框架：Tailwind CSS

**选择理由**：
- 原子化CSS，开发效率高
- 自定义主题方便
- 打包体积小
- 与Vue 3配合良好

**主题配置**：
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        wei: '#3B82F6',    // 魏国蓝
        shu: '#EF4444',    // 蜀国红
        wu: '#10B981',     // 吴国绿
        neutral: '#F59E0B', // 中立黄
        gold: '#FBBF24',   // 金币金
      },
      fontFamily: {
        chinese: ['Ma Shan Zheng', 'cursive'],
      }
    }
  }
}
```

### 2.3 地图渲染：Canvas + SVG

**方案**：
- 底层地图用Canvas渲染（性能好）
- 城池、玩家棋子用SVG（交互方便）
- 动画使用Framer Motion

**地图组件设计**：
```typescript
interface BoardConfig {
  width: number;
  height: number;
  cellSize: number;
  cells: Cell[];
}

interface Cell {
  id: number;
  x: number;
  y: number;
  type: 'city' | 'chance' | 'destiny' | 'checkpoint' | 'special';
  name: string;
  owner?: string;
  level?: number;
}
```

---

## 三、后端技术栈

### 3.1 框架选择：Node.js + Fastify

**选择理由**：
- Fastify性能优于Express
- 内置JSON Schema验证
- 插件系统灵活
- TypeScript支持好

**项目结构**：
```
backend/
├── src/
│   ├── controllers/     # 控制器
│   │   ├── room.ts      # 房间控制器
│   │   ├── game.ts      # 游戏控制器
│   │   └── player.ts    # 玩家控制器
│   ├── services/        # 业务逻辑
│   │   ├── roomService.ts
│   │   ├── gameService.ts
│   │   └── cardService.ts
│   ├── models/          # 数据模型
│   │   ├── Room.ts
│   │   ├── Game.ts
│   │   └── Player.ts
│   ├── routes/          # 路由
│   │   ├── room.ts
│   │   ├── game.ts
│   │   └── player.ts
│   ├── socket/          # Socket处理
│   │   ├── index.ts
│   │   ├── roomHandler.ts
│   │   └── gameHandler.ts
│   ├── utils/           # 工具函数
│   │   ├── gameLogic.ts
│   │   └── validators.ts
│   ├── config/          # 配置
│   │   └── index.ts
│   └── app.ts           # 应用入口
├── prisma/              # 数据库Schema
│   └── schema.prisma
├── tests/               # 测试
├── package.json
└── tsconfig.json
```

### 3.2 实时通信：Socket.io

**选择理由**：
- 封装完善，易于使用
- 自动重连
- 房间管理内置
- 广泛使用，问题少

**Socket事件设计**：
```typescript
// 客户端 -> 服务端
interface ClientEvents {
  // 房间相关
  'room:create': (data: CreateRoomData) => void;
  'room:join': (data: JoinRoomData) => void;
  'room:leave': () => void;
  'room:ready': () => void;
  'room:start': () => void;
  
  // 游戏相关
  'game:roll-dice': () => void;
  'game:use-card': (cardId: string) => void;
  'game:buy-city': (cityId: number) => void;
  'game:upgrade-city': (cityId: number) => void;
  'game:end-turn': () => void;
}

// 服务端 -> 客户端
interface ServerEvents {
  // 房间相关
  'room:created': (data: RoomData) => void;
  'room:joined': (data: RoomData) => void;
  'room:left': (data: { playerId: string }) => void;
  'room:player-joined': (data: PlayerData) => void;
  'room:player-left': (data: { playerId: string }) => void;
  'room:player-ready': (data: { playerId: string }) => void;
  'room:started': (data: GameData) => void;
  
  // 游戏相关
  'game:state-update': (data: GameState) => void;
  'game:turn-start': (data: { playerId: string }) => void;
  'game:dice-rolled': (data: DiceResult) => void;
  'game:player-moved': (data: MoveResult) => void;
  'game:card-drawn': (data: CardData) => void;
  'game:city-bought': (data: CityData) => void;
  'game:city-upgraded': (data: CityData) => void;
  'game:rent-paid': (data: RentData) => void;
  'game:player-bankrupt': (data: { playerId: string }) => void;
  'game:ended': (data: { winnerId: string }) => void;
  
  // 错误
  'error': (data: { message: string }) => void;
}
```

### 3.3 数据库：Redis + SQLite

**Redis用途**：
- 房间状态缓存
- 游戏实时状态
- 在线玩家列表
- Session管理

**SQLite用途**：
- 用户数据（如需要）
- 游戏历史记录
- 成就数据

**数据模型**：
```typescript
// Redis
interface RoomState {
  id: string;
  name: string;
  hostId: string;
  players: PlayerState[];
  maxPlayers: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

interface GameState {
  roomId: string;
  currentTurn: number;
  currentPlayerId: string;
  players: PlayerGameState[];
  cities: CityState[];
  deck: {
    chance: string[];
    destiny: string[];
  };
  discarded: {
    chance: string[];
    destiny: string[];
  };
  logs: GameLog[];
  startedAt: number;
}

// SQLite (Prisma)
model User {
  id        String   @id @default(uuid())
  name      String
  avatar    String?
  wins      Int      @default(0)
  games     Int      @default(0)
  achievements Achievement[]
  createdAt DateTime @default(now())
}

model GameRecord {
  id        String   @id @default(uuid())
  roomId    String
  players   Json
  winnerId  String
  duration  Int
  logs      Json
  createdAt DateTime @default(now())
}

model Achievement {
  id        String   @id @default(uuid())
  userId    String
  type      String
  unlockedAt DateTime @default(now())
  User      User     @relation(fields: [userId], references: [id])
}
```

---

## 四、部署方案

### 4.1 开发环境

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    environment:
      - VITE_API_URL=http://localhost:4000
      
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=file:./dev.db
    depends_on:
      - redis
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### 4.2 生产环境

**前端部署**：
- Cloudflare Pages 或 Vercel
- 静态资源CDN加速

**后端部署**：
- 云服务器（腾讯云/阿里云）
- Docker容器化
- Nginx反向代理
- SSL证书

**数据库**：
- Redis：云服务器自建或云Redis服务
- SQLite：本地文件（小规模）或迁移到PostgreSQL（大规模）

---

## 五、性能优化

### 5.1 前端优化
- 路由懒加载
- 图片懒加载
- Canvas离屏渲染
- 虚拟滚动（房间列表）
- 防抖节流（骰子动画）

### 5.2 后端优化
- Redis缓存热点数据
- Socket.io房间隔离
- 游戏状态增量更新
- 数据库连接池

### 5.3 网络优化
- WebSocket长连接
- 消息压缩
- 断线重连机制
- 心跳检测

---

## 六、安全考虑

### 6.1 前端安全
- XSS防护
- CSRF Token
- 输入验证

### 6.2 后端安全
- 请求频率限制
- 输入验证（JSON Schema）
- 房间权限验证
- 防作弊机制（服务端校验所有操作）

---

## 七、监控与日志

### 7.1 日志
- 结构化日志（JSON格式）
- 错误追踪
- 游戏行为日志

### 7.2 监控
- 服务健康检查
- 性能指标
- 在线人数统计

---

## 八、技术选型总结

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 前端框架 | Vue 3 | 生态成熟，开发效率高 |
| UI框架 | Tailwind CSS | 原子化，自定义方便 |
| 后端框架 | Fastify | 性能好，插件系统灵活 |
| 实时通信 | Socket.io | 封装完善，易于使用 |
| 数据库 | Redis + SQLite | 轻量级，够用 |
| 部署 | Docker + 云服务器 | 灵活可控 |

---

💚 虾仁 @ VOID.X
