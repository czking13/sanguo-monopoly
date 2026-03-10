import { FastifyPluginAsync } from 'fastify'

// 武将数据
const heroes = [
  {
    id: 'caocao',
    name: '曹操',
    faction: 'wei',
    rarity: 'legendary',
    skill: {
      name: '挟天子以令诸侯',
      description: '每次经过起点额外获得15%资金',
      type: 'passive'
    }
  },
  {
    id: 'liubei',
    name: '刘备',
    faction: 'shu',
    rarity: 'legendary',
    skill: {
      name: '仁德',
      description: '经过敌方城池过路费减半',
      type: 'passive'
    }
  },
  {
    id: 'sunquan',
    name: '孙权',
    faction: 'wu',
    rarity: 'legendary',
    skill: {
      name: '制衡',
      description: '每回合可换1张锦囊卡',
      type: 'active'
    }
  },
  {
    id: 'zhugeliang',
    name: '诸葛亮',
    faction: 'shu',
    rarity: 'epic',
    skill: {
      name: '神机妙算',
      description: '可查看下一张锦囊卡内容',
      type: 'active'
    }
  },
  {
    id: 'guanyu',
    name: '关羽',
    faction: 'shu',
    rarity: 'epic',
    skill: {
      name: '武圣',
      description: '免费出狱1次',
      type: 'passive'
    }
  },
  {
    id: 'zhouyu',
    name: '周瑜',
    faction: 'wu',
    rarity: 'epic',
    skill: {
      name: '火攻',
      description: '火攻卡效果翻倍',
      type: 'passive'
    }
  },
  {
    id: 'simayi',
    name: '司马懿',
    faction: 'wei',
    rarity: 'epic',
    skill: {
      name: '隐忍',
      description: '入狱后可立即出狱1次',
      type: 'active'
    }
  },
  {
    id: 'zhangliao',
    name: '张辽',
    faction: 'wei',
    rarity: 'rare',
    skill: {
      name: '突袭',
      description: '骰子点数+1',
      type: 'passive'
    }
  },
  {
    id: 'zhaoyun',
    name: '赵云',
    faction: 'shu',
    rarity: 'rare',
    skill: {
      name: '七进七出',
      description: '每回合可重掷骰子1次',
      type: 'active'
    }
  },
  {
    id: 'ganning',
    name: '甘宁',
    faction: 'wu',
    rarity: 'rare',
    skill: {
      name: '百骑劫营',
      description: '踩敌方城池时抢夺50%过路费',
      type: 'passive'
    }
  }
]

const playerRoutes: FastifyPluginAsync = async (fastify) => {
  // 获取武将列表
  fastify.get('/heroes', async (request, reply) => {
    // TODO: 根据玩家解锁情况返回
    const playerId = request.headers['x-player-id'] as string
    
    return {
      success: true,
      data: {
        heroes: heroes.map(h => ({
          ...h,
          unlocked: true // 暂时全部解锁
        }))
      }
    }
  })
  
  // 获取玩家信息
  fastify.get('/players/:playerId', async (request, reply) => {
    const { playerId } = request.params as { playerId: string }
    
    // TODO: 从数据库获取玩家信息
    return {
      success: true,
      data: {
        playerId,
        name: '玩家',
        avatar: null,
        stats: {
          wins: 0,
          games: 0,
          winRate: 0
        },
        achievements: []
      }
    }
  })
}

export default playerRoutes
