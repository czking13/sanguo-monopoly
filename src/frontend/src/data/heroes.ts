// ============================================
// 武将数据 v1.1
// 根据 hero-design-v1.1.md 完整定义
// ============================================

import type { Hero, Faction } from '../types'

// ============================================
// 武将定义（18位）
// ============================================

export const heroes: Hero[] = [
  // ============================================
  // 魏国武将（6位）
  // ============================================
  {
    id: 'caocao',
    name: '曹操',
    faction: '魏',
    rarity: 'legendary',
    unlocked: true,
    skill: {
      name: '挟天子以令诸侯',
      description: '经过起点时额外获得15%起点奖励',
      effect: 'start_bonus_15',
      type: 'passive',
    }
  },
  {
    id: 'simayi',
    name: '司马懿',
    faction: '魏',
    rarity: 'rare',
    unlocked: true,
    skill: {
      name: '隐忍',
      description: '入狱时可选择免费出狱（每局限1次）',
      effect: 'escape_prison_once',
      type: 'limited',
      maxUses: 1
    }
  },
  {
    id: 'xiaohoudun',
    name: '夏侯惇',
    faction: '魏',
    rarity: 'rare',
    unlocked: true,
    skill: {
      name: '拔矢啖睛',
      description: '支付过路费时减免30%',
      effect: 'toll_reduce_30',
      type: 'passive',
    }
  },
  {
    id: 'zhangliao',
    name: '张辽',
    faction: '魏',
    rarity: 'rare',
    unlocked: true,
    skill: {
      name: '突袭',
      description: '掷骰点数永久+1（不超过上限）',
      effect: 'dice_plus_1',
      type: 'passive',
    }
  },
  {
    id: 'xuchu',
    name: '许褚',
    faction: '魏',
    rarity: 'common',
    unlocked: true,
    skill: {
      name: '虎卫',
      description: '初始资金额外+2000金',
      effect: 'init_plus_2000',
      type: 'passive',
    }
  },
  {
    id: 'xunyu',
    name: '荀彧',
    faction: '魏',
    rarity: 'rare',
    unlocked: false, // 需累计5局解锁
    skill: {
      name: '筹谋',
      description: '每回合开始时获得100金',
      effect: 'turn_start_gain_100',
      type: 'passive',
    }
  },

  // ============================================
  // 蜀国武将（6位）
  // ============================================
  {
    id: 'liubei',
    name: '刘备',
    faction: '蜀',
    rarity: 'legendary',
    unlocked: true,
    skill: {
      name: '携民渡江',
      description: '支付过路费时减免50%',
      effect: 'toll_reduce_50',
      type: 'passive',
    }
  },
  {
    id: 'zhugeliang',
    name: '诸葛亮',
    faction: '蜀',
    rarity: 'legendary',
    unlocked: true,
    skill: {
      name: '神机妙算',
      description: '落地锦囊格时，可预览下一张锦囊卡再决定是否抽取',
      effect: 'peek_jinnang',
      type: 'active',
    }
  },
  {
    id: 'guanyu',
    name: '关羽',
    faction: '蜀',
    rarity: 'legendary',
    unlocked: true,
    skill: {
      name: '过五关斩六将',
      description: '入狱时可选择免费出狱（每局限1次）',
      effect: 'escape_prison_once',
      type: 'limited',
      maxUses: 1
    }
  },
  {
    id: 'zhangfei',
    name: '张飞',
    faction: '蜀',
    rarity: 'rare',
    unlocked: true,
    skill: {
      name: '据水断桥',
      description: '他人踩到你城池时，过路费+50%',
      effect: 'toll_bonus_50',
      type: 'passive',
    }
  },
  {
    id: 'zhaoyun',
    name: '赵云',
    faction: '蜀',
    rarity: 'rare',
    unlocked: true,
    skill: {
      name: '七进七出',
      description: '每回合可重掷1次骰子',
      effect: 'reroll_once',
      type: 'active',
    }
  },
  {
    id: 'huangzhong',
    name: '黄忠',
    faction: '蜀',
    rarity: 'common',
    unlocked: false, // 需累计10局解锁
    skill: {
      name: '百步穿杨',
      description: '触发天命卡时，30%概率将负面卡转为正面效果',
      effect: 'neg_to_pos_30',
      type: 'passive',
    }
  },

  // ============================================
  // 吴国武将（6位）
  // ============================================
  {
    id: 'sunquan',
    name: '孙权',
    faction: '吴',
    rarity: 'legendary',
    unlocked: true,
    skill: {
      name: '制衡',
      description: '回合结束时可将1张锦囊卡换为新卡',
      effect: 'swap_card',
      type: 'active',
    }
  },
  {
    id: 'zhouyu',
    name: '周瑜',
    faction: '吴',
    rarity: 'legendary',
    unlocked: true,
    skill: {
      name: '火攻',
      description: '使用火攻卡时伤害翻倍（300→600）',
      effect: 'fire_double',
      type: 'passive',
    }
  },
  {
    id: 'luxun',
    name: '陆逊',
    faction: '吴',
    rarity: 'rare',
    unlocked: false, // 需累计5局解锁
    skill: {
      name: '火烧连营',
      description: '单次移动经过第3座他人城池时免过路费',
      effect: 'free_3rd_city',
      type: 'passive',
    }
  },
  {
    id: 'ganning',
    name: '甘宁',
    faction: '吴',
    rarity: 'rare',
    unlocked: true,
    skill: {
      name: '百骑劫营',
      description: '支付过路费时，实际支付50%，城主也只收50%',
      effect: 'rob_50_toll',
      type: 'passive',
    }
  },
  {
    id: 'taishici',
    name: '太史慈',
    faction: '吴',
    rarity: 'common',
    unlocked: true,
    skill: {
      name: '神射',
      description: '单骰规则下，点数范围变为2-7',
      effect: 'dice_2_to_7',
      type: 'passive',
    }
  },
  {
    id: 'lusu',
    name: '鲁肃',
    faction: '吴',
    rarity: 'common',
    unlocked: false, // 需首次游戏完成解锁
    skill: {
      name: '慷慨',
      description: '每回合开始时获得50金，且可向其他玩家提供借贷',
      effect: 'turn_start_gain_50',
      type: 'passive',
    }
  },
]

// ============================================
// 武将解锁条件
// ============================================
export const heroUnlockConditions: Record<string, { type: 'games' | 'first_game'; value: number; description: string }> = {
  'xunyu': { type: 'games', value: 5, description: '累计完成5局游戏' },
  'huangzhong': { type: 'games', value: 10, description: '累计完成10局游戏' },
  'luxun': { type: 'games', value: 5, description: '累计完成5局游戏' },
  'lusu': { type: 'first_game', value: 1, description: '首次完成1局游戏' },
}

// ============================================
// 默认解锁武将（9位）
// ============================================
export const defaultUnlockedHeroes = heroes.filter(h => h.unlocked).map(h => h.id)

// ============================================
// 工具函数
// ============================================

// 根据势力筛选武将
export function getHeroesByFaction(faction: Faction): Hero[] {
  return heroes.filter(h => h.faction === faction)
}

// 根据稀有度筛选
export function getHeroesByRarity(rarity: 'common' | 'rare' | 'legendary'): Hero[] {
  return heroes.filter(h => h.rarity === rarity)
}

// 获取已解锁武将
export function getUnlockedHeroes(unlockedIds: string[]): Hero[] {
  return heroes.filter(h => h.unlocked || unlockedIds.includes(h.id))
}

// 随机获取武将
export function getRandomHeroes(count: number, unlockedIds: string[] = defaultUnlockedHeroes): Hero[] {
  const available = getUnlockedHeroes(unlockedIds)
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// 获取武将详情
export function getHeroById(heroId: string): Hero | undefined {
  return heroes.find(h => h.id === heroId)
}

// 检查武将是否解锁
export function isHeroUnlocked(heroId: string, gamesPlayed: number, hasCompletedFirstGame: boolean): boolean {
  const hero = getHeroById(heroId)
  if (!hero) return false
  if (hero.unlocked) return true
  
  const condition = heroUnlockConditions[heroId]
  if (!condition) return false
  
  if (condition.type === 'first_game') {
    return hasCompletedFirstGame
  }
  
  return gamesPlayed >= condition.value
}

// ============================================
// 武将技能类型（用于类型检查）
// ============================================
export type HeroSkillType = 
  | 'start_bonus_15'        // 曹操
  | 'escape_prison_once'    // 司马懿/关羽
  | 'toll_reduce_30'        // 夏侯惇
  | 'toll_reduce_50'        // 刘备
  | 'toll_bonus_50'         // 张飞
  | 'dice_plus_1'           // 张辽
  | 'dice_2_to_7'           // 太史慈
  | 'init_plus_2000'        // 许褚
  | 'turn_start_gain_100'   // 荀彧
  | 'turn_start_gain_50'    // 鲁肃
  | 'peek_jinnang'          // 诸葛亮
  | 'reroll_once'           // 赵云
  | 'swap_card'             // 孙权
  | 'fire_double'           // 周瑜
  | 'free_3rd_city'         // 陆逊
  | 'rob_50_toll'           // 甘宁
  | 'neg_to_pos_30'         // 黄忠
