// ============================================
// 三国大富翁 v1.1 完整类型定义
// ============================================

// ========== 基础类型 ==========

// 地图格子类型
export type CellType = 'city' | 'chance' | 'destiny' | 'prison' | 'start' | 'rest' | 'checkpoint'

// 势力
export type Faction = '魏' | '蜀' | '吴' | '中立'

// 武将稀有度
export type HeroRarity = 'common' | 'rare' | 'legendary'

// 卡牌稀有度
export type CardRarity = 'common' | 'rare' | 'legendary'

// 武将技能类型
export type HeroSkillType = 'ACTIVE' | 'PASSIVE' | 'TRIGGER'

// 卡牌类型（A/B类）
export type CardCategory = 'A' | 'B' // A=主动使用, B=响应触发

// ========== 回合状态机 ==========

// 回合阶段（8步精确流转）
export type TurnPhase =
  | 'TURN_START'      // 1. 回合开始（触发回合开始效果）
  | 'LOCKED'          // 2. 判定是否被跳过（乐不思蜀/关卡）
  | 'ROLL_DICE'       // 3. 掷骰子
  | 'MOVING'          // 4. 移动中（逐格动画）
  | 'LANDING'         // 5. 落点触发（购买/过路费/卡牌）
  | 'CARD_ACTION'     // 6. 可使用A类卡
  | 'UPGRADE_ACTION'  // 7. 可升级城池
  | 'TURN_END'        // 8. 回合结束（监狱状态流转）

// ========== 玩家状态 ==========

// 玩家详细状态
export type PlayerStatus =
  | 'NORMAL'           // 正常
  | 'BLOCKED'          // 被跳过（乐不思蜀）
  | 'IN_JAIL'          // 刚入狱（本回合不计入）
  | 'JAILED_WAIT_1'    // 监狱第1回合
  | 'JAILED_WAIT_2'    // 监狱第2回合
  | 'JAILED_WAIT_3'    // 监狱第3回合（强制缴费）
  | 'CHECKPOINT_WAIT'  // 关卡停留
  | 'BANKRUPT'         // 破产

// 状态效果
export interface StatusEffect {
  type: StatusEffectType
  source: string        // 来源玩家ID
  remainingTurns: number
}

export type StatusEffectType =
  | 'LE_BU_SI_SHU'      // 乐不思蜀（无法行动）
  | 'ALLIANCE'          // 结盟（免过路费）
  | 'MEIREN_COOLDOWN'   // 美人计冷却
  | 'FIRE_BURN'         // 火攻灼烧

// ========== 游戏常量 ==========

export const GAME_CONSTANTS = {
  // 初始资金
  STARTING_MONEY: {
    '2': 12000,
    '3-4': 15000,
    '5-6': 18000,
    '7-8': 20000
  },
  
  // 起点奖励
  PASS_START_BONUS: {
    '2-4': 2000,
    '5-6': 2500,
    '7-8': 3000
  },
  
  // 监狱相关
  BAIL_AMOUNT: 500,
  MAX_JAIL_TURNS: 3,
  
  // 过路费基础比例
  TOLL_BASE_RATE: 0.1, // 城池价格的10%
  
  // 城池升级倍率
  LEVEL_MULTIPLIER: [1, 1.5, 2, 3, 4],
  
  // 升级费用比例
  UPGRADE_COST_RATE: [0.5, 1, 1.5, 2],
  
  // 荆州区域加成
  JINGZHOU_BONUS: 1.2,
  
  // 手牌上限
  MAX_HAND_CARDS: 5,
  
  // 势力折扣
  FACTION_DISCOUNT: {
    '魏': 0.9, // 魏将买魏地9折
    '蜀': 0.8, // 蜀将买蜀地8折
    '吴': 1.0  // 吴将无折扣
  },
  
  // 关卡停留回合
  CHECKPOINT_WAIT_TURNS: 1,
  
  // 加速模式触发回合
  SPEED_MODE_TURN: 20,
  
  // AI决策超时
  AI_DECISION_TIMEOUT: 3000,
  
  // 玩家操作超时
  PLAYER_ACTION_TIMEOUT: 15000
} as const

// ========== 武将定义 ==========

export interface HeroSkill {
  name: string
  description: string
  type: HeroSkillType
  effect: string           // 效果标识
  cooldown?: number        // 冷却回合（可选）
  maxUses?: number         // 最大使用次数（可选）
  params?: Record<string, number | string> // 额外参数
}

export interface Hero {
  id: string
  name: string
  faction: Faction
  rarity: HeroRarity
  skill: HeroSkill
  attack?: number          // 攻击属性（用于显示）
  defense?: number         // 防御属性（用于显示）
}

// ========== 卡牌定义 ==========

export interface Card {
  id: string
  name: string
  type: '锦囊' | '天命'
  category: CardCategory   // A=主动, B=响应
  description: string
  effect: string
  rarity?: CardRarity
  value?: number           // 效果数值
  target?: 'self' | 'enemy' | 'all' | 'any'
}

// ========== 地图格子 ==========

export interface MapCell {
  id: number
  name: string
  type: CellType
  faction?: Faction
  region?: string          // 区域（北方/荆州/蜀地/江东）
  price?: number
  baseToll?: number        // 基础过路费
  ownerId?: string
  level?: number           // 城池等级 1-5
}

// ========== 玩家 ==========

export interface Player {
  id: string
  name: string
  color: string
  money: number
  position: number
  
  // 武将
  hero?: Hero
  heroAbilityUsed: Record<string, boolean> // 技能使用记录
  heroAbilityCooldown: Record<string, number> // 技能冷却
  
  // 资产
  cities: number[]         // 拥有的城池ID列表
  cards: Card[]            // 手牌
  
  // 状态
  status: PlayerStatus
  statusEffects: StatusEffect[]
  prisonTurns: number      // 已在监狱的回合数
  checkpointTurns: number  // 关卡停留剩余回合
  
  // 统计
  totalEarned: number      // 累计获得
  totalSpent: number       // 累计支出
  passCount: number        // 经过起点次数
  
  // 连接状态
  isOnline: boolean
  isAI: boolean
}

// ========== 房间 ==========

export interface Room {
  id: string
  name: string
  code: string
  hostId: string
  players: Player[]
  maxPlayers: number
  status: 'waiting' | 'hero_select' | 'playing' | 'finished'
  createdAt: string
  settings: RoomSettings
}

export interface RoomSettings {
  speedMode: boolean       // 快速模式
  aiPlayers: number        // AI玩家数量
  turnTimeout: number      // 回合超时（秒）
}

// ========== 游戏状态 ==========

export interface GameState {
  roomId: string
  cells: MapCell[]
  players: Player[]
  
  // 回合控制
  currentPlayerIndex: number
  currentPhase: TurnPhase
  turnNumber: number
  
  // 骰子
  dice: number[]
  diceRolling: boolean
  
  // 加速模式
  speedModeActive: boolean
  
  // 事件
  lastEvent?: GameEvent
  
  // 胜负
  winner?: string
  finishedAt?: string
}

// ========== 游戏事件 ==========

export interface GameEvent {
  type: GameEventType
  playerId?: string
  targetId?: string
  data?: Record<string, unknown>
  timestamp: number
}

export type GameEventType =
  | 'ROLL_DICE'
  | 'MOVE'
  | 'PASS_START'
  | 'LAND_CITY'
  | 'BUY_CITY'
  | 'UPGRADE_CITY'
  | 'PAY_TOLL'
  | 'RECEIVE_TOLL'
  | 'DRAW_CARD'
  | 'USE_CARD'
  | 'ENTER_JAIL'
  | 'EXIT_JAIL'
  | 'CHECKPOINT_STOP'
  | 'ALLIANCE_FORMED'
  | 'BANKRUPT'
  | 'GAME_END'
  | 'HERO_SKILL_USED'

// ========== Socket 事件 ==========

export interface SocketEvents {
  // 客户端 -> 服务端
  joinRoom: (data: { code: string; playerName: string }) => void
  leaveRoom: () => void
  selectHero: (heroId: string) => void
  confirmHero: () => void
  startGame: () => void
  rollDice: () => void
  buyCity: () => void
  upgradeCity: (cellId: number) => void
  sellCity: (cellId: number) => void
  useCard: (cardId: string, targetId?: string) => void
  endTurn: () => void
  prisonAction: (action: 'skill' | 'bail' | 'roll' | 'wait') => void
  
  // 服务端 -> 客户端
  roomUpdate: (room: Room) => void
  gameUpdate: (state: GameState) => void
  heroSelectStart: (availableHeroes: Hero[]) => void
  heroSelected: (playerId: string, heroId: string) => void
  playerJoined: (player: Player) => void
  playerLeft: (playerId: string) => void
  gameEvent: (event: GameEvent) => void
  error: (message: string) => void
}

// ========== 工具类型 ==========

// 过路费计算结果
export interface TollCalculation {
  baseToll: number
  levelMultiplier: number
  regionBonus: number
  ownerBonus: number
  visitorReduction: number
  finalToll: number
  breakdown: string[]
}

// 回合状态转换
export interface TurnTransition {
  from: TurnPhase
  to: TurnPhase
  reason: string
  actions: TurnAction[]
}

export interface TurnAction {
  type: string
  data?: Record<string, unknown>
}
