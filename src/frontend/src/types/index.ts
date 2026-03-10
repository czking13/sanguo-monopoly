// 地图格子类型
export type CellType = 'city' | 'chance' | 'destiny' | 'prison' | 'start' | 'rest' | 'checkpoint'

// 势力
export type Faction = '魏' | '蜀' | '吴' | '中立'

// 地图格子
export interface MapCell {
  id: number
  name: string
  type: CellType
  faction?: Faction
  price?: number
  toll?: number
  ownerId?: string
  level?: number // 勢力等级 1-4
}

// 紧急事件
export interface EmergencyEvent {
  type: 'earthquake' | 'flood' | 'plague'
  name: string
  description: string
}

// 卡牌
export interface Card {
  id: string
  name: string
  type: '锦囊' | '天命'
  description: string
  effect: string
  rarity?: 'common' | 'rare' | 'legendary'
}

// 武将
export interface Hero {
  id: string
  name: string
  faction: Faction
  rarity?: 'common' | 'rare' | 'legendary'
  skill: {
    name: string
    description: string
    effect: string
  }
}

// 玩家
export interface Player {
  id: string
  name: string
  color: string
  money: number
  position: number
  hero?: Hero
  cities: number[]
  cards: Card[]
  inPrison: boolean
  prisonTurns: number
  isOnline: boolean
  isBankrupt: boolean
}

// 房间
export interface Room {
  id: string
  name: string
  code: string
  hostId: string
  players: Player[]
  maxPlayers: number
  status: 'waiting' | 'playing' | 'finished'
  createdAt: string
}

// 游戏状态
export interface GameState {
  roomId: string
  cells: MapCell[]
  players: Player[]
  currentPlayerIndex: number
  phase: 'roll' | 'move' | 'action' | 'end'
  dice: number[]
  emergency?: EmergencyEvent
  lastEvent?: string
  winner?: string
}

// Socket 事件
export interface SocketEvents {
  // 客户端 -> 服务端
  joinRoom: (data: { code: string; playerName: string }) => void
  leaveRoom: () => void
  startGame: () => void
  rollDice: () => void
  buyCity: () => void
  upgradeCity: () => void
  useCard: (cardId: string, targetId?: string) => void
  endTurn: () => void
  
  // 服务端 -> 客户端
  roomUpdate: (room: Room) => void
  gameUpdate: (state: GameState) => void
  playerJoined: (player: Player) => void
  playerLeft: (playerId: string) => void
  error: (message: string) => void
}
