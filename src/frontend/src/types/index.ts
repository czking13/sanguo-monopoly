// ============================================
// 三国大富翁 - 类型定义 v1.1
// ============================================

// 地图格子类型
export type CellType = 'city' | 'chance' | 'destiny' | 'prison' | 'start' | 'rest' | 'checkpoint'

// 势力
export type Faction = '魏' | '蜀' | '吴' | '中立'

// 区域（用于荆州加成等）
export type Region = '北方' | '荆州' | '蜀地' | '江东'

// ============================================
// 房间生命周期状态（v1.1 新增）
// ============================================
export type RoomStatus = 'LOBBY' | 'PREPARATION' | 'PLAYING' | 'SETTLEMENT' | 'DISSOLVED'

// ============================================
// 回合状态机（v1.1 新增 - 8步精确流转）
// ============================================
export type TurnPhase = 
  | 'TURN_START'      // ① 回合开始（结算持续效果）
  | 'LOCKED'          // ② 入狱状态检查
  | 'JAIL_ACTION'     // 入狱操作（缴费/掷骰/等待）
  | 'ROLL_DICE'       // ③ 掷骰子
  | 'MOVING'          // ④ 移动中
  | 'LANDING'         // ⑤ 格子效果结算
  | 'CARD_ACTION'     // ⑥ 可选：使用锦囊卡
  | 'UPGRADE_ACTION'  // ⑦ 可选：升级城池
  | 'TURN_END'        // ⑧ 回合结束

// ============================================
// 玩家状态（v1.1 扩展）
// ============================================
export type PlayerStatus = 
  | 'ACTIVE'              // 正常
  | 'IN_JAIL'             // 入狱
  | 'JAILED_WAIT_1'       // 入狱等待第1回合
  | 'JAILED_WAIT_2'       // 入狱等待第2回合
  | 'JAILED_WAIT_3'       // 入狱等待第3回合（强制缴费）
  | 'BLOCKED'             // 被美人计跳过
  | 'CHECKPOINT_WAIT'     // 关卡停留
  | 'BANKRUPT'            // 已破产

// ============================================
// 持续效果类型（v1.1 新增）
// ============================================
export type StatusEffectType = 
  | 'LE_BU_SI_SHU'        // 乐不思蜀
  | 'ALLIANCE'            // 结盟
  | 'MEIREN_COOLDOWN'     // 美人计冷却
  | 'FIRE_BURN'           // 火烧连营

// 持续效果
export interface StatusEffect {
  type: StatusEffectType
  remainingTurns: number
  sourcePlayerId: string
  metadata?: {
    allyId?: string           // 联盟时的盟友ID
    cooldownTargetId?: string // 美人计冷却目标
  }
}

// ============================================
// 锦囊卡分类（v1.1 新增）
// ============================================
export type CardUseType = 'A' | 'B' // A类：主动阶段，B类：响应型

// ============================================
// 地图格子（v1.1 扩展）
// ============================================
export interface MapCell {
  id: number
  name: string
  type: CellType
  faction?: Faction
  region?: Region           // v1.1 新增：区域（荆州+20%）
  price?: number            // 购买价格
  toll?: number             // 基础过路费 = price × 10%
  ownerId?: string | null   // 拥有者ID，null = 无主
  level?: number            // 等级 1-5（v1.1 从1-4改为1-5）
  connectedTo?: number[]    // 关卡格：连接的区域
  position?: {              // 地图渲染坐标
    x: number
    y: number
  }
}

// ============================================
// 卡牌（v1.1 扩展）
// ============================================
export interface Card {
  id: string
  name: string
  type: '锦囊' | '天命'
  useType?: CardUseType     // v1.1 新增：A/B类
  description: string
  effect: string
  rarity?: 'common' | 'rare' | 'legendary'
  isPositive?: boolean      // v1.1 新增：正面/负面（天命卡）
  acquiredAt?: number       // v1.1 新增：获取时间戳（用于弃牌排序）
}

// ============================================
// 武将（v1.1 扩展）
// ============================================
export interface Hero {
  id: string
  name: string
  faction: Faction
  rarity?: 'common' | 'rare' | 'legendary'
  unlocked?: boolean        // v1.1 新增：是否解锁
  skill: {
    name: string
    description: string
    effect: string
    type: 'passive' | 'active' | 'limited'  // v1.1 新增：技能类型
    maxUses?: number        // v1.1 新增：每局最大使用次数
  }
}

// ============================================
// 玩家统计（v1.1 新增）
// ============================================
export interface PlayerStats {
  totalTollPaid: number      // 总过路费支出
  totalTollReceived: number  // 总过路费收入
  cardsUsed: number          // 使用卡牌数
  lapCount: number           // 经过起点次数
}

// ============================================
// 玩家（v1.1 大幅扩展）
// ============================================
export interface Player {
  id: string
  name: string
  avatar?: string           // v1.1 新增：头像URL
  color: string
  money: number
  position: number
  hero?: Hero
  cities: number[]
  cards: Card[]
  
  // v1.1 新增状态
  status: PlayerStatus                    // 玩家状态
  statusEffects: StatusEffect[]           // 持续效果列表
  heroAbilityUsed: Record<string, boolean> // 每局限用技能使用状态
  stats: PlayerStats                      // 统计数据
  
  // 保留旧字段（向后兼容）
  inPrison: boolean          // @deprecated 使用 status 替代
  prisonTurns: number        // @deprecated 使用 statusEffects 替代
  isOnline: boolean
  isBankrupt: boolean        // @deprecated 使用 status === 'BANKRUPT' 替代
  isAI?: boolean             // v1.1 新增：是否为AI托管
}

// ============================================
// 联盟数据（v1.1 新增）
// ============================================
export interface Alliance {
  player1Id: string
  player2Id: string
  startTurn: number          // 开始的全局回合数
  remainingTurns: number     // 剩余回合数
}

// ============================================
// 房间（v1.1 扩展）
// ============================================
export interface Room {
  id: string
  name: string
  code: string
  hostId: string
  players: Player[]
  maxPlayers: number
  status: RoomStatus         // v1.1 扩展：5种状态
  createdAt: string
  
  // v1.1 新增
  currentTurn: number        // 当前全局回合数
  turnTimeLimit?: number     // 回合时间限制（秒）
  alliances: Alliance[]      // 联盟列表
  isSpeedMode?: boolean      // 是否进入加速模式
}

// ============================================
// 游戏状态（v1.1 大幅扩展）
// ============================================
export interface GameState {
  roomId: string
  cells: MapCell[]
  players: Player[]
  currentPlayerIndex: number
  
  // v1.1 回合状态机
  turnPhase: TurnPhase       // 当前回合阶段
  globalTurn: number         // 全局回合数
  
  // 旧字段（向后兼容）
  phase: 'roll' | 'move' | 'action' | 'end'  // @deprecated 使用 turnPhase 替代
  dice: number[]
  emergency?: EmergencyEvent
  lastEvent?: string
  winner?: string
  
  // v1.1 新增
  jinnangDeck: string[]      // 锦囊牌堆（卡牌ID）
  tianmingDeck: string[]     // 天命牌堆（卡牌ID）
  jinnangDiscard: string[]   // 锦囊弃牌堆
  tianmingDiscard: string[]  // 天命弃牌堆
  alliances: Alliance[]      // 联盟列表
  isSpeedMode: boolean       // 加速模式
  speedModeTurn: number      // 加速模式开始的回合数
  
  // 超时控制
  phaseStartTime?: number    // 当前阶段开始时间戳
  phaseTimeout?: number      // 当前阶段超时时间（毫秒）
}

// ============================================
// 紧急事件（保留）
// ============================================
export interface EmergencyEvent {
  type: 'earthquake' | 'flood' | 'plague'
  name: string
  description: string
}

// ============================================
// Socket 事件（v1.1 扩展）
// ============================================
export interface SocketEvents {
  // 客户端 -> 服务端
  joinRoom: (data: { code: string; playerName: string }) => void
  leaveRoom: () => void
  startGame: () => void
  selectHero: (heroId: string) => void  // v1.1 新增
  confirmHero: () => void               // v1.1 新增
  rollDice: () => void
  buyCity: () => void
  upgradeCity: (cellId?: number) => void  // v1.1 修改：可指定城池
  useCard: (cardId: string, targetId?: string) => void
  respondToCard: (cardId: string, use: boolean) => void  // v1.1 新增：B类卡响应
  endTurn: () => void
  discardCard: (cardId: string) => void  // v1.1 新增：弃牌
  payBail: () => void                     // v1.1 新增：缴纳保释金
  requestLoan: (data: { targetId: string; amount: number; rate: number; turns: number }) => void  // v1.1 新增：鲁肃借贷
  respondToLoan: (accept: boolean) => void  // v1.1 新增：响应借贷
  
  // 服务端 -> 客户端
  roomUpdate: (room: Room) => void
  gameUpdate: (state: GameState) => void
  playerJoined: (player: Player) => void
  playerLeft: (playerId: string) => void
  heroSelected: (playerId: string, heroId: string) => void  // v1.1 新增
  diceRolled: (playerId: string, dice: number[]) => void   // v1.1 新增
  playerMoved: (playerId: string, from: number, to: number) => void  // v1.1 新增
  cellPurchased: (playerId: string, cellId: number) => void  // v1.1 新增
  tollPaid: (fromId: string, toId: string, amount: number) => void  // v1.1 新增
  cardDrawn: (playerId: string, card: Card) => void  // v1.1 新增
  cardUsed: (playerId: string, cardId: string, targetId?: string) => void  // v1.1 新增
  fateTriggered: (playerId: string, cardId: string) => void  // v1.1 新增
  playerBankrupt: (playerId: string) => void  // v1.1 新增
  gameEnded: (winnerId: string, rankings: string[]) => void  // v1.1 新增
  error: (message: string) => void
  
  // v1.1 新增：B类卡响应请求
  cardResponseRequired: (data: {
    playerId: string
    cardOptions: Card[]  // 可用的B类卡列表
    timeout: number      // 超时时间
    context: 'toll' | 'move' | 'other'  // 触发上下文
  }) => void
  
  // v1.1 新增：借贷请求
  loanRequest: (data: {
    fromId: string
    amount: number
    rate: number
    turns: number
  }) => void
}

// ============================================
// 过路费计算参数（v1.1 新增）
// ============================================
export interface TollCalculation {
  baseToll: number           // 基础过路费
  level: number              // 城池等级
  levelMultiplier: number    // 等级倍率
  regionBonus: number        // 区域加成（荆州1.2）
  ownerBonus: number         // 城主技能加成（张飞1.5）
  visitorReduction: number   // 访客减免（刘备0.5/夏侯惇0.7）
  finalToll: number          // 最终过路费
}

// ============================================
// 城池升级数据（v1.1 新增）
// ============================================
export interface CellUpgradeInfo {
  currentLevel: number
  maxLevel: number           // 5
  upgradeCost: number        // 升级费用 = price × 升级费率[level]
  totalInvested: number      // 累计投入
  sellPrice: number          // 出售价 = 累计投入 × 50%
}

// ============================================
// 游戏常量（v1.1 新增）
// ============================================
export const GAME_CONSTANTS = {
  // 初始资金
  INITIAL_MONEY: {
    2: 12000,
    3: 15000,
    4: 15000,
    5: 18000,
    6: 18000,
    7: 20000,
    8: 20000
  } as Record<number, number>,
  
  // 起点奖励
  START_BONUS: {
    2: 2000,
    3: 2000,
    4: 2000,
    5: 2500,
    6: 2500,
    7: 3000,
    8: 3000
  } as Record<number, number>,
  
  // 升级倍率
  LEVEL_MULTIPLIER: {
    1: 1.0,
    2: 1.5,
    3: 2.0,
    4: 3.0,
    5: 4.0
  } as Record<number, number>,
  
  // 升级费率
  UPGRADE_RATE: {
    1: 0.5,   // 1→2级
    2: 1.0,   // 2→3级
    3: 1.5,   // 3→4级
    4: 2.0    // 4→5级
  } as Record<number, number>,
  
  // 累计系数
  TOTAL_INVEST_RATE: {
    1: 1.0,
    2: 1.5,
    3: 2.5,
    4: 4.0,
    5: 6.0
  } as Record<number, number>,
  
  // 手牌上限
  MAX_CARDS: 5,
  
  // 保释金
  BAIL_AMOUNT: 500,
  
  // 监狱最大等待回合
  MAX_PRISON_WAIT: 3,
  
  // 荆州区域加成
  JINGZHOU_BONUS: 1.2,
  
  // 武将技能加成/减免
  HERO_BONUS: {
    CAOCAO_START: 0.15,      // 曹操起点+15%
    LIUBEI_REDUCTION: 0.5,   // 刘备减免50%
    XIAHOUDUN_REDUCTION: 0.7, // 夏侯惇减免30%
    ZHANGFEI_BONUS: 1.5,     // 张飞加成50%
    ZHOUYU_FIRE: 2,          // 周瑜火攻翻倍
  },
  
  // 超时时间（毫秒）
  TIMEOUT: {
    ROLL_DICE: 15000,
    BUY_CITY: 20000,
    USE_CARD: 20000,
    UPGRADE: 15000,
    DISCARD: 30000,
    JAIL_ACTION: 20000,
    HERO_SELECT: 60000,
    CARD_RESPONSE: 10000,    // B类卡响应
  },
  
  // 加速模式触发条件
  SPEED_MODE: {
    PLAYERS_7_8_TURNS: 20,
    GLOBAL_MAX_TURNS: 50,
    STALEMATE_TURNS: 10,
  }
}
