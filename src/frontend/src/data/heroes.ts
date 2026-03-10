import type { Hero, Faction } from './types'

// 武将数据
export const heroes: Hero[] = [
  // 魏国武将
  {
    id: 'caocao',
    name: '曹操',
    faction: '魏',
    rarity: 'legendary',
    skill: {
      name: '挟天子',
      description: '每次经过起点额外获得10%资金',
      effect: 'startBonus'
    }
  },
  {
    id: 'simayi',
    name: '司马懿',
    faction: '魏',
    rarity: 'rare',
    skill: {
      name: '鹰视',
      description: '可查看下一张事件卡',
      effect: 'peekCard'
    }
  },
  {
    id: 'xiahou',
    name: '夏侯惇',
    faction: '魏',
    rarity: 'common',
    skill: {
      name: '盲视',
      description: '入狱后2回合自动出狱',
      effect: 'prisonEscape'
    }
  },
  {
    id: 'dianwei',
    name: '典韦',
    faction: '魏',
    rarity: 'common',
    skill: {
      name: '恶来',
      description: '攻击卡效果+50%',
      effect: 'attackBoost'
    }
  },
  {
    id: 'xuchu',
    name: '许褚',
    faction: '魏',
    rarity: 'common',
    skill: {
      name: '裸衣',
      description: '每回合可多使用一张卡',
      effect: 'extraCard'
    }
  },
  {
    id: 'guojia',
    name: '郭嘉',
    faction: '魏',
    rarity: 'rare',
    skill: {
      name: '遗计',
      description: '破产时可转移一半资金给指定玩家',
      effect: 'transferOnBankrupt'
    }
  },
  
  // 蜀国武将
  {
    id: 'liubei',
    name: '刘备',
    faction: '蜀',
    rarity: 'legendary',
    skill: {
      name: '仁德',
      description: '经过对手城池过路费减半',
      effect: 'tollDiscount'
    }
  },
  {
    id: 'guanyu',
    name: '关羽',
    faction: '蜀',
    rarity: 'legendary',
    skill: {
      name: '武圣',
      description: '入狱后可立即出狱',
      effect: 'instantEscape'
    }
  },
  {
    id: 'zhangfei',
    name: '张飞',
    faction: '蜀',
    rarity: 'rare',
    skill: {
      name: '咆哮',
      description: '可连续掷两次骰子',
      effect: 'doubleRoll'
    }
  },
  {
    id: 'zhugeliang',
    name: '诸葛亮',
    faction: '蜀',
    rarity: 'legendary',
    skill: {
      name: '神算',
      description: '可查看下一张事件卡',
      effect: 'peekCard'
    }
  },
  {
    id: 'zhaoyun',
    name: '赵云',
    faction: '蜀',
    rarity: 'rare',
    skill: {
      name: '龙胆',
      description: '被攻击时50%概率闪避',
      effect: 'dodge'
    }
  },
  {
    id: 'huangzhong',
    name: '黄忠',
    faction: '蜀',
    rarity: 'common',
    skill: {
      name: '烈弓',
      description: '攻击卡必中',
      effect: 'sureHit'
    }
  },
  
  // 吴国武将
  {
    id: 'sunquan',
    name: '孙权',
    faction: '吴',
    rarity: 'legendary',
    skill: {
      name: '制衡',
      description: '每回合可重新掷一次骰子',
      effect: 'reroll'
    }
  },
  {
    id: 'zhouyu',
    name: '周瑜',
    faction: '吴',
    rarity: 'legendary',
    skill: {
      name: '火攻',
      description: '火攻卡效果翻倍',
      effect: 'fireBoost'
    }
  },
  {
    id: 'lusu',
    name: '鲁肃',
    faction: '吴',
    rarity: 'common',
    skill: {
      name: '好施',
      description: '每回合获得额外100金币',
      effect: 'incomeBonus'
    }
  },
  {
    id: 'lvmeng',
    name: '吕蒙',
    faction: '吴',
    rarity: 'rare',
    skill: {
      name: '白衣',
      description: '可查看一名玩家的手牌',
      effect: 'spyHand'
    }
  },
  {
    id: 'ganning',
    name: '甘宁',
    faction: '吴',
    rarity: 'common',
    skill: {
      name: '奇袭',
      description: '偷取对手一张卡',
      effect: 'stealCard'
    }
  },
  {
    id: 'luxun',
    name: '陆逊',
    faction: '吴',
    rarity: 'rare',
    skill: {
      name: '连营',
      description: '使用卡牌后50%概率抽一张',
      effect: 'drawOnUse'
    }
  }
]

// 根据势力筛选武将
export function getHeroesByFaction(faction: Faction): Hero[] {
  return heroes.filter(h => h.faction === faction)
}

// 根据稀有度筛选
export function getHeroesByRarity(rarity: 'common' | 'rare' | 'legendary'): Hero[] {
  return heroes.filter(h => h.rarity === rarity)
}

// 随机获取武将
export function getRandomHeroes(count: number): Hero[] {
  const shuffled = [...heroes].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
