import { Server, Socket } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'

// 类型定义
interface Player {
  id: string
  name: string
  hero: string | null
  isReady: boolean
  funds: number
  position: number
  cards: string[]
  cities: number[]
  status: 'active' | 'bankrupt' | 'disconnected'
}

interface Room {
  id: string
  name: string
  hostId: string
  maxPlayers: number
  password?: string
  players: Player[]
  status: 'waiting' | 'playing' | 'finished'
  gameState?: GameState
}

interface GameState {
  currentTurn: number
  currentPlayerId: string
  cities: CityState[]
  deck: { chance: string[]; destiny: string[] }
  logs: GameLog[]
  startedAt: number
}

interface CityState {
  id: number
  name: string
  faction: 'wei' | 'shu' | 'wu' | 'neutral'
  ownerId: string | null
  level: number
}

interface GameLog {
  turn: number
  playerId: string
  action: string
  data: Record<string, unknown>
  timestamp: number
}

// 临时存储
const rooms = new Map<string, Room>()
const playerRooms = new Map<string, string>() // playerId -> roomId

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`用户连接: ${socket.id}`)
    
    // 获取玩家信息
    const playerId = socket.handshake.auth.playerId || uuidv4()
    const playerName = socket.handshake.auth.playerName || '玩家'
    
    socket.data.playerId = playerId
    socket.data.playerName = playerName
    
    // 发送连接成功
    socket.emit('connected', { playerId, playerName })
    
    // ========== 房间事件 ==========
    
    // 创建房间
    socket.on('room:create', (data: { name: string; maxPlayers?: number; password?: string }) => {
      const roomId = uuidv4()
      const room: Room = {
        id: roomId,
        name: data.name,
        hostId: playerId,
        maxPlayers: data.maxPlayers || 4,
        password: data.password,
        players: [{
          id: playerId,
          name: playerName,
          hero: null,
          isReady: false,
          funds: 15000,
          position: 0,
          cards: [],
          cities: [],
          status: 'active'
        }],
        status: 'waiting'
      }
      
      rooms.set(roomId, room)
      playerRooms.set(playerId, roomId)
      socket.join(roomId)
      
      socket.emit('room:created', {
        roomId: room.id,
        name: room.name,
        hostId: room.hostId,
        maxPlayers: room.maxPlayers,
        players: room.players,
        status: room.status
      })
    })
    
    // 加入房间
    socket.on('room:join', (data: { roomId: string; password?: string }) => {
      const room = rooms.get(data.roomId)
      
      if (!room) {
        socket.emit('error', { message: '房间不存在' })
        return
      }
      
      if (room.status !== 'waiting') {
        socket.emit('error', { message: '游戏已开始' })
        return
      }
      
      if (room.players.length >= room.maxPlayers) {
        socket.emit('error', { message: '房间已满' })
        return
      }
      
      if (room.password && room.password !== data.password) {
        socket.emit('error', { message: '密码错误' })
        return
      }
      
      // 添加玩家
      const player: Player = {
        id: playerId,
        name: playerName,
        hero: null,
        isReady: false,
        funds: 15000,
        position: 0,
        cards: [],
        cities: [],
        status: 'active'
      }
      
      room.players.push(player)
      playerRooms.set(playerId, data.roomId)
      socket.join(data.roomId)
      
      // 通知加入者
      socket.emit('room:joined', {
        roomId: room.id,
        name: room.name,
        hostId: room.hostId,
        maxPlayers: room.maxPlayers,
        players: room.players,
        status: room.status
      })
      
      // 通知其他人
      socket.to(data.roomId).emit('room:player-joined', player)
    })
    
    // 离开房间
    socket.on('room:leave', () => {
      const roomId = playerRooms.get(playerId)
      if (!roomId) return
      
      const room = rooms.get(roomId)
      if (!room) return
      
      // 移除玩家
      room.players = room.players.filter(p => p.id !== playerId)
      playerRooms.delete(playerId)
      socket.leave(roomId)
      
      // 如果房间空了，删除房间
      if (room.players.length === 0) {
        rooms.delete(roomId)
      } else {
        // 转移房主
        if (room.hostId === playerId) {
          room.hostId = room.players[0].id
        }
        
        // 通知其他人
        socket.to(roomId).emit('room:player-left', {
          playerId,
          newHostId: room.hostId
        })
      }
      
      socket.emit('room:left', { playerId })
    })
    
    // 准备/取消准备
    socket.on('room:ready', (data: { ready: boolean }) => {
      const roomId = playerRooms.get(playerId)
      if (!roomId) return
      
      const room = rooms.get(roomId)
      if (!room) return
      
      const player = room.players.find(p => p.id === playerId)
      if (player) {
        player.isReady = data.ready
        io.to(roomId).emit('room:player-ready', { playerId, ready: data.ready })
      }
    })
    
    // 选择武将
    socket.on('room:select-hero', (data: { heroId: string }) => {
      const roomId = playerRooms.get(playerId)
      if (!roomId) return
      
      const room = rooms.get(roomId)
      if (!room) return
      
      // 检查武将是否已被选择
      if (room.players.some(p => p.hero === data.heroId)) {
        socket.emit('error', { message: '武将已被选择' })
        return
      }
      
      const player = room.players.find(p => p.id === playerId)
      if (player) {
        player.hero = data.heroId
        io.to(roomId).emit('room:hero-selected', { playerId, heroId: data.heroId })
      }
    })
    
    // 开始游戏
    socket.on('room:start', () => {
      const roomId = playerRooms.get(playerId)
      if (!roomId) return
      
      const room = rooms.get(roomId)
      if (!room) return
      
      if (room.hostId !== playerId) {
        socket.emit('error', { message: '只有房主可以开始游戏' })
        return
      }
      
      // 检查是否都准备好了
      if (!room.players.every(p => p.isReady && p.hero)) {
        socket.emit('error', { message: '有玩家未准备或未选择武将' })
        return
      }
      
      // 初始化游戏状态
      room.status = 'playing'
      room.gameState = {
        currentTurn: 1,
        currentPlayerId: room.players[0].id,
        cities: initCities(),
        deck: { chance: [], destiny: [] },
        logs: [],
        startedAt: Date.now()
      }
      
      io.to(roomId).emit('room:started', {
        gameState: room.gameState,
        players: room.players
      })
    })
    
    // ========== 游戏事件 ==========
    
    // 掷骰子
    socket.on('game:roll-dice', () => {
      const roomId = playerRooms.get(playerId)
      if (!roomId) return
      
      const room = rooms.get(roomId)
      if (!room || !room.gameState) return
      
      if (room.gameState.currentPlayerId !== playerId) {
        socket.emit('error', { message: '不是你的回合' })
        return
      }
      
      // 掷骰子
      const dice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]
      const total = dice[0] + dice[1]
      
      // 通知所有人
      io.to(roomId).emit('game:dice-rolled', {
        playerId,
        dice,
        total,
        animation: { duration: 500 }
      })
      
      // 移动玩家
      const player = room.players.find(p => p.id === playerId)
      if (player) {
        player.position = (player.position + total) % 56
        
        // 检查是否经过起点
        const passedStart = player.position + total >= 56
        
        io.to(roomId).emit('game:player-moved', {
          playerId,
          from: (player.position - total + 56) % 56,
          to: player.position,
          passedStart,
          startReward: passedStart ? 2000 : undefined
        })
      }
    })
    
    // 结束回合
    socket.on('game:end-turn', () => {
      const roomId = playerRooms.get(playerId)
      if (!roomId) return
      
      const room = rooms.get(roomId)
      if (!room || !room.gameState) return
      
      if (room.gameState.currentPlayerId !== playerId) {
        socket.emit('error', { message: '不是你的回合' })
        return
      }
      
      // 找下一个玩家
      const currentIndex = room.players.findIndex(p => p.id === playerId)
      const activePlayers = room.players.filter(p => p.status === 'active')
      const nextIndex = (currentIndex + 1) % activePlayers.length
      const nextPlayerId = activePlayers[nextIndex].id
      
      room.gameState.currentTurn++
      room.gameState.currentPlayerId = nextPlayerId
      
      io.to(roomId).emit('game:turn-ended', {
        previousPlayerId: playerId,
        nextPlayerId,
        turnNumber: room.gameState.currentTurn
      })
    })
    
    // 断开连接
    socket.on('disconnect', () => {
      console.log(`用户断开连接: ${socket.id}`)
      
      const roomId = playerRooms.get(playerId)
      if (roomId) {
        const room = rooms.get(roomId)
        if (room) {
          const player = room.players.find(p => p.id === playerId)
          if (player) {
            player.status = 'disconnected'
            socket.to(roomId).emit('room:player-disconnected', { playerId })
          }
        }
      }
    })
  })
}

// 初始化城池
function initCities(): CityState[] {
  const cityNames = [
    { id: 1, name: '邺城', faction: 'wei' as const },
    { id: 3, name: '徐州', faction: 'wei' as const },
    { id: 5, name: '许昌', faction: 'wei' as const },
    { id: 7, name: '虎牢关', faction: 'wei' as const },
    { id: 9, name: '洛阳', faction: 'wei' as const },
    { id: 16, name: '新野', faction: 'neutral' as const },
    { id: 18, name: '襄阳', faction: 'neutral' as const },
    { id: 30, name: '汉中', faction: 'shu' as const },
    { id: 32, name: '成都', faction: 'shu' as const },
    { id: 44, name: '建业', faction: 'wu' as const },
    { id: 46, name: '吴郡', faction: 'wu' as const },
  ]
  
  return cityNames.map(c => ({
    ...c,
    ownerId: null,
    level: 1
  }))
}
