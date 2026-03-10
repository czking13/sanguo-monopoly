import { FastifyPluginAsync } from 'fastify'
import { v4 as uuidv4 } from 'uuid'

interface CreateRoomBody {
  name: string
  maxPlayers?: number
  password?: string
}

interface Room {
  id: string
  name: string
  hostId: string
  maxPlayers: number
  password?: string
  players: Player[]
  status: 'waiting' | 'playing' | 'finished'
  createdAt: number
}

interface Player {
  id: string
  name: string
  isReady: boolean
  hero: string | null
}

// 临时存储（后续替换为Redis）
const rooms = new Map<string, Room>()

const roomRoutes: FastifyPluginAsync = async (fastify) => {
  // 创建房间
  fastify.post<{ Body: CreateRoomBody }>('/rooms', async (request, reply) => {
    const { name, maxPlayers = 4, password } = request.body
    
    if (!name || name.trim().length === 0) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_NAME', message: '房间名称不能为空' }
      })
    }
    
    const playerId = request.headers['x-player-id'] as string || uuidv4()
    const playerName = request.headers['x-player-name'] as string || '玩家'
    
    const room: Room = {
      id: uuidv4(),
      name: name.trim(),
      hostId: playerId,
      maxPlayers,
      password,
      players: [{
        id: playerId,
        name: playerName,
        isReady: false,
        hero: null
      }],
      status: 'waiting',
      createdAt: Date.now()
    }
    
    rooms.set(room.id, room)
    
    return {
      success: true,
      data: {
        roomId: room.id,
        name: room.name,
        hostId: room.hostId,
        maxPlayers: room.maxPlayers,
        currentPlayers: room.players.length,
        status: room.status,
        createdAt: room.createdAt
      }
    }
  })
  
  // 获取房间列表
  fastify.get('/rooms', async (request, reply) => {
    const { page = 1, limit = 20, status } = request.query as {
      page?: number
      limit?: number
      status?: string
    }
    
    let roomList = Array.from(rooms.values())
    
    if (status) {
      roomList = roomList.filter(r => r.status === status)
    }
    
    const total = roomList.length
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedRooms = roomList.slice(start, end)
    
    return {
      success: true,
      data: {
        rooms: paginatedRooms.map(r => ({
          roomId: r.id,
          name: r.name,
          hostName: r.players.find(p => p.id === r.hostId)?.name || '未知',
          currentPlayers: r.players.length,
          maxPlayers: r.maxPlayers,
          status: r.status,
          hasPassword: !!r.password
        })),
        total,
        page,
        limit
      }
    }
  })
  
  // 获取房间详情
  fastify.get('/rooms/:roomId', async (request, reply) => {
    const { roomId } = request.params as { roomId: string }
    
    const room = rooms.get(roomId)
    if (!room) {
      return reply.status(404).send({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: '房间不存在' }
      })
    }
    
    return {
      success: true,
      data: {
        roomId: room.id,
        name: room.name,
        hostId: room.hostId,
        maxPlayers: room.maxPlayers,
        status: room.status,
        players: room.players,
        settings: {
          maxPlayers: room.maxPlayers,
          initialFunds: 15000,
          diceCount: 2,
          checkpointEnabled: true
        }
      }
    }
  })
  
  // 删除房间（房主专用）
  fastify.delete('/rooms/:roomId', async (request, reply) => {
    const { roomId } = request.params as { roomId: string }
    const playerId = request.headers['x-player-id'] as string
    
    const room = rooms.get(roomId)
    if (!room) {
      return reply.status(404).send({
        success: false,
        error: { code: 'ROOM_NOT_FOUND', message: '房间不存在' }
      })
    }
    
    if (room.hostId !== playerId) {
      return reply.status(403).send({
        success: false,
        error: { code: 'NOT_ROOM_HOST', message: '只有房主可以删除房间' }
      })
    }
    
    rooms.delete(roomId)
    
    return { success: true, message: '房间已删除' }
  })
}

export default roomRoutes
