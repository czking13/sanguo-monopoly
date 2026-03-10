# 三国大富翁 - API设计文档

**版本**：v1.0  
**更新日期**：2026-03-10  
**设计者**：虾仁

---

## 一、API概述

### 1.1 基础信息
- **Base URL**: `/api/v1`
- **协议**: HTTP + WebSocket
- **数据格式**: JSON
- **认证**: JWT Token（可选）

### 1.2 响应格式

**成功响应**：
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

---

## 二、HTTP API

### 2.1 房间相关

#### 创建房间
```
POST /rooms
```

**请求体**：
```json
{
  "name": "三国大乱斗",
  "maxPlayers": 4,
  "password": "123456"  // 可选
}
```

**响应**：
```json
{
  "success": true,
  "data": {
    "roomId": "abc123",
    "inviteCode": "XYZ789",
    "name": "三国大乱斗",
    "hostId": "player1",
    "maxPlayers": 4,
    "currentPlayers": 1,
    "status": "waiting",
    "createdAt": 1707552000000
  }
}
```

#### 获取房间列表
```
GET /rooms?page=1&limit=20&status=waiting
```

**响应**：
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "roomId": "abc123",
        "name": "三国大乱斗",
        "hostName": "玩家1",
        "currentPlayers": 2,
        "maxPlayers": 4,
        "status": "waiting",
        "hasPassword": true
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

#### 获取房间详情
```
GET /rooms/:roomId
```

**响应**：
```json
{
  "success": true,
  "data": {
    "roomId": "abc123",
    "name": "三国大乱斗",
    "hostId": "player1",
    "maxPlayers": 4,
    "status": "waiting",
    "players": [
      {
        "playerId": "player1",
        "name": "玩家1",
        "avatar": "avatar1.png",
        "hero": null,
        "isReady": false,
        "isHost": true
      },
      {
        "playerId": "player2",
        "name": "玩家2",
        "avatar": "avatar2.png",
        "hero": "liubei",
        "isReady": true,
        "isHost": false
      }
    ],
    "settings": {
      "initialFunds": 15000,
      "diceCount": 2,
      "checkpointEnabled": true
    }
  }
}
```

---

### 2.2 玩家相关

#### 获取玩家信息
```
GET /players/:playerId
```

**响应**：
```json
{
  "success": true,
  "data": {
    "playerId": "player1",
    "name": "玩家1",
    "avatar": "avatar1.png",
    "stats": {
      "wins": 10,
      "games": 25,
      "winRate": 0.4
    },
    "achievements": [
      {
        "type": "first_win",
        "unlockedAt": 1707552000000
      }
    ]
  }
}
```

#### 获取武将列表
```
GET /heroes
```

**响应**：
```json
{
  "success": true,
  "data": {
    "heroes": [
      {
        "id": "caocao",
        "name": "曹操",
        "faction": "wei",
        "rarity": "legendary",
        "skill": {
          "name": "挟天子以令诸侯",
          "description": "每次经过起点额外获得15%资金",
          "type": "passive"
        },
        "unlocked": true
      }
    ]
  }
}
```

---

### 2.3 游戏记录

#### 获取游戏历史
```
GET /games/history?playerId=player1&page=1&limit=10
```

**响应**：
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "gameId": "game1",
        "roomId": "abc123",
        "winnerId": "player1",
        "players": ["player1", "player2", "player3", "player4"],
        "duration": 3600,
        "endedAt": 1707555600000
      }
    ],
    "total": 5
  }
}
```

---

## 三、WebSocket API

### 3.1 连接
```javascript
const socket = io('ws://localhost:4000', {
  auth: {
    playerId: 'player1',
    token: 'jwt_token'
  }
});
```

### 3.2 房间事件

#### 创建房间
```typescript
// 发送
socket.emit('room:create', {
  name: '三国大乱斗',
  maxPlayers: 4,
  password: '123456'  // 可选
});

// 接收
socket.on('room:created', (data) => {
  // data: RoomData
});

socket.on('error', (error) => {
  // error: { message: string }
});
```

#### 加入房间
```typescript
// 发送
socket.emit('room:join', {
  roomId: 'abc123',
  password: '123456'  // 可选
});

// 接收
socket.on('room:joined', (data) => {
  // data: RoomData
});

// 其他人收到
socket.on('room:player-joined', (data) => {
  // data: PlayerData
});
```

#### 离开房间
```typescript
// 发送
socket.emit('room:leave');

// 接收
socket.on('room:left', (data) => {
  // data: { playerId: string }
});

// 其他人收到
socket.on('room:player-left', (data) => {
  // data: { playerId: string, newHostId?: string }
});
```

#### 准备/取消准备
```typescript
// 发送
socket.emit('room:ready', {
  ready: true
});

// 所有人收到
socket.on('room:player-ready', (data) => {
  // data: { playerId: string, ready: boolean }
});
```

#### 选择武将
```typescript
// 发送
socket.emit('room:select-hero', {
  heroId: 'caocao'
});

// 所有人收到
socket.on('room:hero-selected', (data) => {
  // data: { playerId: string, heroId: string }
});
```

#### 开始游戏
```typescript
// 发送（仅房主）
socket.emit('room:start');

// 所有人收到
socket.on('room:started', (data) => {
  // data: { gameState: GameState }
});
```

---

### 3.3 游戏事件

#### 掷骰子
```typescript
// 发送
socket.emit('game:roll-dice');

// 接收
socket.on('game:dice-rolled', (data) => {
  // data: {
  //   playerId: string,
  //   dice: number[],
  //   total: number,
  //   animation: { duration: number }
  // }
});
```

#### 移动完成
```typescript
// 客户端通知移动动画完成
socket.emit('game:move-complete');

// 服务端触发格子效果
socket.on('game:cell-trigger', (data) => {
  // data: {
  //   cellId: number,
  //   cellType: 'city' | 'chance' | 'destiny' | ...,
  //   effect: { ... }
  // }
});
```

#### 购买城池
```typescript
// 发送
socket.emit('game:buy-city', {
  cityId: 1
});

// 接收
socket.on('game:city-bought', (data) => {
  // data: {
  //   cityId: number,
  //   ownerId: string,
  //   price: number,
  //   newFunds: number
  // }
});
```

#### 升级城池
```typescript
// 发送
socket.emit('game:upgrade-city', {
  cityId: 1
});

// 接收
socket.on('game:city-upgraded', (data) => {
  // data: {
  //   cityId: number,
  //   newLevel: number,
  //   upgradeCost: number,
  //   newFunds: number
  // }
});
```

#### 出售城池
```typescript
// 发送
socket.emit('game:sell-city', {
  cityId: 1
});

// 接收
socket.on('game:city-sold', (data) => {
  // data: {
  //   cityId: number,
  //   sellPrice: number,
  //   newFunds: number
  // }
});
```

#### 支付过路费
```typescript
// 接收（自动触发）
socket.on('game:rent-due', (data) => {
  // data: {
  //   cityId: number,
  //   cityName: string,
  //   ownerId: string,
  //   ownerName: string,
  //   rent: number,
  //   canUseCard: boolean  // 是否有空城计
  // }
});

// 发送（选择是否使用空城计）
socket.emit('game:pay-rent', {
  useCard: false  // 是否使用空城计
});

// 接收
socket.on('game:rent-paid', (data) => {
  // data: {
  //   payerId: string,
  //   receiverId: string,
  //   amount: number,
  //   payerFunds: number,
  //   receiverFunds: number
  // }
});
```

#### 抽取锦囊卡
```typescript
// 接收（踩到锦囊格自动触发）
socket.on('game:card-drawn', (data) => {
  // data: {
  //   card: {
  //     id: string,
  //     name: string,
  //     description: string,
  //     type: 'chance'
  //   },
  //   handCount: number
  // }
});
```

#### 使用锦囊卡
```typescript
// 发送
socket.emit('game:use-card', {
  cardId: 'huogong',
  targetId: 'player2'  // 可选，部分卡牌需要
});

// 接收
socket.on('game:card-used', (data) => {
  // data: {
  //   playerId: string,
  //   cardId: string,
  //   cardName: string,
  //   effect: { ... },
  //   targets: string[]
  // }
});
```

#### 触发天命卡
```typescript
// 接收（踩到天命格自动触发）
socket.on('game:destiny-triggered', (data) => {
  // data: {
  //   card: {
  //     id: string,
  //     name: string,
  //     description: string,
  //     type: 'destiny'
  //   },
  //   effect: { ... },
  //   requireChoice: boolean,  // 是否需要选择
  //   choices?: string[]       // 可选项（如桃园结义选择结盟对象）
  // }
});

// 发送（如果需要选择）
socket.emit('game:destiny-choice', {
  choice: 'player2'
});
```

#### 结束回合
```typescript
// 发送
socket.emit('game:end-turn');

// 所有人接收
socket.on('game:turn-ended', (data) => {
  // data: {
  //   previousPlayerId: string,
  //   nextPlayerId: string,
  //   turnNumber: number
  // }
});
```

---

### 3.4 游戏状态更新

#### 完整状态推送
```typescript
// 游戏开始、重连时推送
socket.on('game:state-update', (data) => {
  // data: GameState
});
```

#### 增量状态更新
```typescript
// 每次操作后推送
socket.on('game:state-patch', (data) => {
  // data: {
  //   players: {
  //     [playerId]: {
  //       funds: 12000,
  //       position: 5
  //     }
  //   },
  //   cities: {
  //     [cityId]: {
  //       ownerId: 'player1',
  //       level: 2
  //     }
  //   }
  // }
});
```

---

### 3.5 特殊事件

#### 玩家破产
```typescript
socket.on('game:player-bankrupt', (data) => {
  // data: {
  //   playerId: string,
  //   reason: 'insufficient_funds' | 'manual_quit',
  //   ranking: number
  // }
});
```

#### 游戏结束
```typescript
socket.on('game:ended', (data) => {
  // data: {
  //   winnerId: string,
  //   winnerName: string,
  //   duration: number,  // 秒
  //   rankings: [
  //     { playerId: string, rank: number, funds: number, cities: number }
  //   ],
  //   stats: {
  //     totalTurns: number,
  //     totalCitiesBought: number,
  //     totalRentPaid: number
  //   }
  // }
});
```

#### 断线重连
```typescript
// 客户端重连后自动触发
socket.on('game:reconnected', (data) => {
  // data: {
  //   gameState: GameState,
  //   missedEvents: Event[]
  // }
});
```

---

## 四、数据类型定义

### 4.1 基础类型

```typescript
// 玩家状态
interface PlayerState {
  playerId: string;
  name: string;
  avatar: string;
  hero: Hero | null;
  funds: number;
  position: number;
  cards: Card[];
  cities: number[];
  status: 'active' | 'bankrupt' | 'disconnected';
  isReady: boolean;
}

// 武将
interface Hero {
  id: string;
  name: string;
  faction: 'wei' | 'shu' | 'wu';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  skill: {
    name: string;
    description: string;
    type: 'passive' | 'active';
    cooldown?: number;
  };
}

// 卡牌
interface Card {
  id: string;
  name: string;
  description: string;
  type: 'chance' | 'destiny';
  category: 'attack' | 'defense' | 'control' | 'mobility' | 'economy';
  effect: CardEffect;
}

// 城池
interface CityState {
  id: number;
  name: string;
  faction: 'wei' | 'shu' | 'wu' | 'neutral';
  ownerId: string | null;
  level: number;
  purchasePrice: number;
  rent: number[];
}

// 游戏状态
interface GameState {
  roomId: string;
  status: 'waiting' | 'playing' | 'finished';
  currentTurn: number;
  currentPlayerId: string;
  players: PlayerState[];
  cities: CityState[];
  deck: {
    chance: string[];
    destiny: string[];
  };
  logs: GameLog[];
  startedAt: number;
  settings: GameSettings;
}

// 游戏日志
interface GameLog {
  turn: number;
  playerId: string;
  action: string;
  data: any;
  timestamp: number;
}

// 游戏设置
interface GameSettings {
  maxPlayers: number;
  initialFunds: number;
  diceCount: number;
  checkpointEnabled: boolean;
  fastMode: boolean;
}
```

---

## 五、错误码

| 错误码 | 描述 |
|--------|------|
| ROOM_NOT_FOUND | 房间不存在 |
| ROOM_FULL | 房间已满 |
| ROOM_PASSWORD_WRONG | 房间密码错误 |
| ROOM_ALREADY_STARTED | 游戏已开始 |
| NOT_ROOM_HOST | 不是房主 |
| PLAYER_NOT_FOUND | 玩家不存在 |
| HERO_NOT_UNLOCKED | 武将未解锁 |
| HERO_ALREADY_SELECTED | 武将已被选择 |
| NOT_YOUR_TURN | 不是你的回合 |
| INSUFFICIENT_FUNDS | 资金不足 |
| CITY_ALREADY_OWNED | 城池已有主人 |
| CITY_NOT_OWNED | 城池不属于你 |
| CARD_NOT_IN_HAND | 手牌中没有此卡 |
| CARD_CANNOT_USE_NOW | 现在不能使用此卡 |
| INVALID_TARGET | 无效目标 |
| MAX_CARDS_REACHED | 手牌已满 |

---

## 六、API版本控制

- 当前版本：v1
- 版本前缀：`/api/v1`
- 后续版本：`/api/v2`

---

💚 虾仁 @ VOID.X
