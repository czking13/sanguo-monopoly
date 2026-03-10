import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { Server } from 'socket.io'
import { generateRoomCode } from './utils.js'

const fastify = Fastify({ logger: true })

await fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST']
})

const io = new Server(fastify.server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// 房间数据
interface Player {
  id: string
  name: string
  color: string
  money: number
  position: number
  hero?: any
  cities: number[]
  cards: any[]
  inPrison: boolean
  prisonTurns: number
  isOnline: boolean
  isBankrupt: boolean
}

interface Room {
  id: string
  name: string
  code: string
  hostId: string
  players: Player[]
  maxPlayers: number
  status: 'waiting' | 'playing' | 'finished'
  createdAt: string
}

interface Cell {
  id: number
  name: string
  type: string
  faction?: string
  price?: number
  toll?: number
  ownerId?: string
  level?: number
}

interface GameState {
  roomId: string
  cells: Cell[]
  players: Player[]
  currentPlayerIndex: number
  phase: 'roll' | 'move' | 'action' | 'end'
  dice: number[]
  lastEvent?: string
}

// 内存存储
const rooms = new Map<string, Room>()
const gameStates = new Map<string, GameState>()
const playerRooms = new Map<string, string>()

// 玩家颜色
const playerColors = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
  '#9b59b6', '#1abc9c', '#e91e63', '#00bcd4'
]

// 初始地图数据
const initialCells: Cell[] = [
  { id: 1, name: '邺城', type: 'city', faction: '魏', price: 1200, toll: 120 },
  { id: 2, name: '锦囊', type: 'chance' },
  { id: 3, name: '徐州', type: 'city', faction: '魏', price: 1000, toll: 100 },
  { id: 4, name: '天命', type: 'destiny' },
  { id: 5, name: '许昌', type: 'city', faction: '魏', price: 1400, toll: 140 },
  { id: 6, name: '监狱', type: 'prison' },
  { id: 7, name: '虎牢关', type: 'city', faction: '魏', price: 1600, toll: 160 },
  { id: 8, name: '锦囊', type: 'chance' },
  { id: 9, name: '洛阳', type: 'start', faction: '魏', price: 2000, toll: 200 },
  // ... 继续添加其他格子
]

// Socket 事件处理
io.on('connection', (socket) => {
  console.log('玩家连接:', socket.id)

  // 创建房间
  socket.on('createRoom', (data: { playerName: string }) => {
    const roomId = generateRoomCode()
    const playerId = socket.id
    
    const player: Player = {
      id: playerId,
      name: data.playerName,
      color: playerColors[0],
      money: 10000,
      position: 0,
      cities: [],
      cards: [],
      inPrison: false,
      prisonTurns: 0,
      isOnline: true,
      isBankrupt: false
    }

    const room: Room = {
      id: roomId,
      name: `${data.playerName}的房间`,
      code: roomId,
      hostId: playerId,
      players: [player],
      maxPlayers: 8,
      status: 'waiting',
      createdAt: new Date().toISOString()
    }

    rooms.set(roomId, room)
    playerRooms.set(playerId, roomId)
    socket.join(roomId)
    
    socket.emit('roomUpdate', room)
    socket.emit('joined', playerId)
  })

  // 加入房间
  socket.on('joinRoom', (data: { code: string; playerName: string }) => {
    const room = rooms.get(data.code)
    if (!room) {
      socket.emit('error', '房间不存在')
      return
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', '房间已满')
      return
    }

    const playerId = socket.id
    const player: Player = {
      id: playerId,
      name: data.playerName,
      color: playerColors[room.players.length],
      money: 10000,
      position: 0,
      cities: [],
      cards: [],
      inPrison: false,
      prisonTurns: 0,
      isOnline: true,
      isBankrupt: false
    }

    room.players.push(player)
    playerRooms.set(playerId, data.code)
    socket.join(data.code)
    
    io.to(data.code).emit('roomUpdate', room)
    socket.emit('joined', playerId)
  })

  // 离开房间
  socket.on('leaveRoom', () => {
    const roomId = playerRooms.get(socket.id)
    if (!roomId) return

    const room = rooms.get(roomId)
    if (!room) return

    room.players = room.players.filter(p => p.id !== socket.id)
    playerRooms.delete(socket.id)
    socket.leave(roomId)

    if (room.players.length === 0) {
      rooms.delete(roomId)
      gameStates.delete(roomId)
    } else {
      // 如果房主离开，转移房主
      if (room.hostId === socket.id) {
        room.hostId = room.players[0].id
      }
      io.to(roomId).emit('roomUpdate', room)
    }
  })

  // 开始游戏
  socket.on('startGame', () => {
    const roomId = playerRooms.get(socket.id)
    if (!roomId) return

    const room = rooms.get(roomId)
    if (!room || room.hostId !== socket.id) return

    room.status = 'playing'
    
    const gameState: GameState = {
      roomId,
      cells: JSON.parse(JSON.stringify(initialCells)),
      players: room.players,
      currentPlayerIndex: 0,
      phase: 'roll',
      dice: [],
      lastEvent: '游戏开始！'
    }

    gameStates.set(roomId, gameState)
    io.to(roomId).emit('gameUpdate', gameState)
    io.to(roomId).emit('roomUpdate', room)
  })

  // 掷骰子
  socket.on('rollDice', () => {
    const roomId = playerRooms.get(socket.id)
    if (!roomId) return

    const gameState = gameStates.get(roomId)
    if (!gameState) return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (currentPlayer.id !== socket.id) return

    const dice = Math.floor(Math.random() * 6) + 1
    gameState.dice = [dice]
    gameState.phase = 'move'

    const oldPosition = currentPlayer.position
    currentPlayer.position = (currentPlayer.position + dice) % 56

    if (currentPlayer.position < oldPosition) {
      currentPlayer.money += 2000
      gameState.lastEvent = `${currentPlayer.name} 经过起点，获得 2000 金！`
    }

    setTimeout(() => {
      gameState.phase = 'action'
      const cell = gameState.cells[currentPlayer.position]
      
      if (cell.type === 'chance') {
        gameState.lastEvent = `${currentPlayer.name} 抽到了锦囊卡！`
      } else if (cell.type === 'destiny') {
        gameState.lastEvent = `${currentPlayer.name} 遇到了天命事件！`
      } else if (cell.type === 'prison') {
        currentPlayer.inPrison = true
        currentPlayer.prisonTurns = 3
        gameState.lastEvent = `${currentPlayer.name} 被关进了监狱！`
      }

      io.to(roomId).emit('gameUpdate', gameState)
    }, 500)

    io.to(roomId).emit('gameUpdate', gameState)
  })

  // 购买城池
  socket.on('buyCity', () => {
    const roomId = playerRooms.get(socket.id)
    if (!roomId) return

    const gameState = gameStates.get(roomId)
    if (!gameState) return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (currentPlayer.id !== socket.id) return

    const cell = gameState.cells[currentPlayer.position]
    if (cell.type !== 'city' || cell.ownerId || !cell.price) return
    if (currentPlayer.money < cell.price) return

    currentPlayer.money -= cell.price
    cell.ownerId = currentPlayer.id
    cell.level = 1
    currentPlayer.cities.push(cell.id)

    gameState.lastEvent = `${currentPlayer.name} 购买了 ${cell.name}！`
    io.to(roomId).emit('gameUpdate', gameState)
  })

  // 升级城池
  socket.on('upgradeCity', () => {
    const roomId = playerRooms.get(socket.id)
    if (!roomId) return

    const gameState = gameStates.get(roomId)
    if (!gameState) return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (currentPlayer.id !== socket.id) return

    const cell = gameState.cells[currentPlayer.position]
    if (!cell.price || !cell.level || cell.ownerId !== currentPlayer.id) return
    if (cell.level >= 4) return

    const upgradeCost = Math.floor(cell.price * 0.5)
    if (currentPlayer.money < upgradeCost) return

    currentPlayer.money -= upgradeCost
    cell.level++

    gameState.lastEvent = `${currentPlayer.name} 将 ${cell.name} 升级到 ${cell.level} 级！`
    io.to(roomId).emit('gameUpdate', gameState)
  })

  // 结束回合
  socket.on('endTurn', () => {
    const roomId = playerRooms.get(socket.id)
    if (!roomId) return

    const gameState = gameStates.get(roomId)
    if (!gameState) return

    const currentPlayer = gameState.players[gameState.currentPlayerIndex]
    if (currentPlayer.id !== socket.id) return

    // 切换到下一个玩家
    gameState.currentPlayerIndex = 
      (gameState.currentPlayerIndex + 1) % gameState.players.length

    // 跳过破产玩家
    while (gameState.players[gameState.currentPlayerIndex].isBankrupt) {
      gameState.currentPlayerIndex = 
        (gameState.currentPlayerIndex + 1) % gameState.players.length
    }

    gameState.phase = 'roll'
    gameState.dice = []
    gameState.lastEvent = `${gameState.players[gameState.currentPlayerIndex].name} 的回合`

    io.to(roomId).emit('gameUpdate', gameState)
  })

  // 断开连接
  socket.on('disconnect', () => {
    console.log('玩家断开:', socket.id)
    
    const roomId = playerRooms.get(socket.id)
    if (roomId) {
      const gameState = gameStates.get(roomId)
      if (gameState) {
        const player = gameState.players.find(p => p.id === socket.id)
        if (player) {
          player.isOnline = false
          io.to(roomId).emit('gameUpdate', gameState)
        }
      }
    }
  })
})

// 启动服务器
const start = async () => {
  try {
    await fastify.listen({ port: 3002, host: '0.0.0.0' })
    console.log('服务器运行在 http://0.0.0.0:3002')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
