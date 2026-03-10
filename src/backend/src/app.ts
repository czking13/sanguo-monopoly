import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import roomRoutes from './routes/room.js'
import playerRoutes from './routes/player.js'
import { setupSocket } from './socket/index.js'

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV !== 'production' ? {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    } : undefined
  }
})

// 注册CORS
await fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
})

// 注册路由
await fastify.register(roomRoutes, { prefix: '/api/v1' })
await fastify.register(playerRoutes, { prefix: '/api/v1' })

// 健康检查
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: Date.now() }
})

// 启动服务器
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '4000')
    const host = process.env.HOST || '0.0.0.0'
    
    await fastify.listen({ port, host })
    
    // 设置Socket.io
    const httpServer = fastify.server as HttpServer
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    })
    
    setupSocket(io)
    
    fastify.log.info(`服务器启动成功: http://${host}:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

export { fastify }
