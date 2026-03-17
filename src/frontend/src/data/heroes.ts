// ============================================
// 三国大富翁 v1.1 武将数据
// 18位武将完整定义，严格按照需求文档
// ============================================

import type { Hero, Faction, HeroSkillType } from '../types'

// ========== 魏国武将（6位）==========

export const heroes: Hero[] = [
  // ===== 魏国 =====
  {
    id: 'caocao',
    name: '曹操',
    faction: '魏',
    rarity: 'legendary',
    skill: {
      name: '挟天子以令诸侯',
      description: '每次经过起点额外获得15%资金（即300金，共获得2300金）',
      type: 'PASSIVE',
      effect: 'startBonus',
      params: { bonusRate: 0.15, bonusAmount: 300 }
    },
    attack: 80,
    defense: 70
  },
  {
    id: 'simayi',
    name: '司马懿',
    faction: '魏',
    rarity: 'legendary',
    skill: {
      name: '隐忍',
      description: '入狱后可立即出狱，每局限用1次',
      type: 'TRIGGER',
      effect: 'instantJailEscape',
      maxUses: 1,
      params: { triggerOn: 'enterJail' }
    },
    attack: 60,
    defense: 90
  },
  {
    id: 'xiahou',
    name: '夏侯惇',
    faction: '魏',
    rarity: 'rare',
    skill: {
      name: '拔矢啖睛',
      description: '被收取过路费时减免30%',
      type: 'PASSIVE',
      effect: 'tollReduction',
      params: { reductionRate: 0.3 }
    },
    attack: 85,
    defense: 75
  },
  {
    id: 'zhangliao',
    name: '张辽',
    faction: '魏',
    rarity: 'rare',
    skill: {
      name: '突袭',
      description: '骰子点数永久+1（但不超过最大值）',
      type: 'PASSIVE',
      effect: 'diceBonus',
      params: { bonus: 1 }
    },
    attack: 90,
    defense: 65
  },
  {
    id: 'xuchu',
    name: '许褚',
    faction: '魏',
    rarity: 'common',
    skill: {
      name: '虎卫',
      description: '初始资金+2000金（共17000金）',
      type: 'PASSIVE',
      effect: 'startingMoneyBonus',
      params: { bonusAmount: 2000 }
    },
    attack: 95,
    defense: 60
  },
  {
    id: 'xunyu',
    name: '荀彧',
    faction: '魏',
    rarity: 'common',
    skill: {
      name: '筹谋',
      description: '每回合结束时获得100金',
      type: 'PASSIVE',
      effect: 'turnEndBonus',
      params: { bonusAmount: 100 }
    },
    attack: 50,
    defense: 80
  },

  // ===== 蜀国 =====
  {
    id: 'liubei',
    name: '刘备',
    faction: '蜀',
    rarity: 'legendary',
    skill: {
      name: '携民渡江',
      description: '经过他人城池时，过路费减半',
      type: 'PASSIVE',
      effect: 'tollDiscount',
      params: { discountRate: 0.5 }
    },
    attack: 70,
    defense: 85
  },
  {
    id: 'zhugeliang',
    name: '诸葛亮',
    faction: '蜀',
    rarity: 'legendary',
    skill: {
      name: '神机妙算',
      description: '可查看下一张锦囊卡内容，并选择是否抽取',
      type: 'ACTIVE',
      effect: 'peekJinnangCard',
      params: { canReject: true }
    },
    attack: 55,
    defense: 95
  },
  {
    id: 'guanyu',
    name: '关羽',
    faction: '蜀',
    rarity: 'legendary',
    skill: {
      name: '过五关斩六将',
      description: '免费出狱1次/局，无需掷骰子等待',
      type: 'TRIGGER',
      effect: 'freeJailEscape',
      maxUses: 1,
      params: { triggerOn: 'inJail' }
    },
    attack: 95,
    defense: 70
  },
  {
    id: 'zhangfei',
    name: '张飞',
    faction: '蜀',
    rarity: 'rare',
    skill: {
      name: '据水断桥',
      description: '自己城池的过路费+50%',
      type: 'PASSIVE',
      effect: 'tollIncrease',
      params: { increaseRate: 0.5 }
    },
    attack: 100,
    defense: 55
  },
  {
    id: 'zhaoyun',
    name: '赵云',
    faction: '蜀',
    rarity: 'rare',
    skill: {
      name: '七进七出',
      description: '每回合可重掷骰子1次，取第二次结果',
      type: 'ACTIVE',
      effect: 'rerollDice',
      cooldown: 0,
      params: { maxRerolls: 1 }
    },
    attack: 90,
    defense: 80
  },
  {
    id: 'huangzhong',
    name: '黄忠',
    faction: '蜀',
    rarity: 'common',
    skill: {
      name: '百步穿杨',
      description: '踩到天命卡时，有30%概率强制获得正面效果',
      type: 'PASSIVE',
      effect: 'fateCardBonus',
      params: { positiveChance: 0.3 }
    },
    attack: 85,
    defense: 60
  },

  // ===== 吴国 =====
  {
    id: 'sunquan',
    name: '孙权',
    faction: '吴',
    rarity: 'legendary',
    skill: {
      name: '制衡',
      description: '每回合可将自己1张锦囊卡与牌堆交换',
      type: 'ACTIVE',
      effect: 'swapCard',
      cooldown: 0,
      params: { swapCount: 1 }
    },
    attack: 65,
    defense: 85
  },
  {
    id: 'zhouyu',
    name: '周瑜',
    faction: '吴',
    rarity: 'legendary',
    skill: {
      name: '火攻',
      description: '使用"火攻"锦囊卡时，效果翻倍（300金→600金）',
      type: 'PASSIVE',
      effect: 'fireCardBoost',
      params: { boostRate: 2.0, affectedCard: 'huogong' }
    },
    attack: 75,
    defense: 80
  },
  {
    id: 'luxun',
    name: '陆逊',
    faction: '吴',
    rarity: 'legendary',
    skill: {
      name: '火烧连营',
      description: '连续经过敌方城池时，第3座免过路费',
      type: 'PASSIVE',
      effect: 'chainTollImmunity',
      params: { chainCount: 3 }
    },
    attack: 70,
    defense: 85
  },
  {
    id: 'ganning',
    name: '甘宁',
    faction: '吴',
    rarity: 'rare',
    skill: {
      name: '百骑劫营',
      description: '踩到敌方城池时，可抢夺该城池本次过路费的50%',
      type: 'PASSIVE',
      effect: 'tollSteal',
      params: { stealRate: 0.5 }
    },
    attack: 88,
    defense: 60
  },
  {
    id: 'taishici',
    name: '太史慈',
    faction: '吴',
    rarity: 'rare',
    skill: {
      name: '神射',
      description: '骰子点数范围变为2-7（原1-6）',
      type: 'PASSIVE',
      effect: 'diceRangeChange',
      params: { minRange: 2, maxRange: 7 }
    },
    attack: 92,
    defense: 65
  },
  {
    id: 'lusu',
    name: '鲁肃',
    faction: '吴',
    rarity: 'common',
    skill: {
      name: '慷慨',
      description: '每回合额外获得50金；可借钱给任意玩家，约定利息（10%-30%）',
      type: 'PASSIVE',
      effect: 'incomeAndLend',
      params: { turnBonus: 50, lendEnabled: true }
    },
    attack: 45,
    defense: 90
  }
]

// ========== 工具函数 ==========

// 根据势力筛选武将
export function getHeroesByFaction(faction: Faction): Hero[] {
  return heroes.filter(h => h.faction === faction)
}

// 根据稀有度筛选
export function getHeroesByRarity(rarity: 'common' | 'rare' | 'legendary'): Hero[] {
  return heroes.filter(h => h.rarity === rarity)
}

// 根据ID获取武将
export function getHeroById(id: string): Hero | undefined {
  return heroes.find(h => h.id === id)
}

// 随机获取武将
export function getRandomHeroes(count: number): Hero[] {
  const shuffled = [...heroes].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// 获取默认解锁武将（稀有+普通）
export function getDefaultUnlockedHeroes(): Hero[] {
  return heroes.filter(h => h.rarity !== 'legendary')
}

// 获取需要解锁的传说武将
export function getLegendaryHeroes(): Hero[] {
  return heroes.filter(h => h.rarity === 'legendary')
}

// 武将技能类型统计
export function getHeroesBySkillType(type: HeroSkillType): Hero[] {
  return heroes.filter(h => h.skill.type === type)
}
