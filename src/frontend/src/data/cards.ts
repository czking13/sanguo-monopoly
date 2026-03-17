// ============================================
// 三国大富翁 v1.1 卡牌数据
// 严格按照 card-design.md 规范
// 16张锦囊卡 + 20张天命卡 + A/B类分类
// ============================================

import type { Card, CardCategory } from '../types'

// ========== 锦囊卡（16张）==========

export const jinnangCards: Card[] = [
  // ===== 进攻类（5张）=====
  {
    id: 'huogong_1',
    name: '火攻',
    type: '锦囊',
    category: 'A',
    description: '指定一名玩家损失300金',
    effect: 'damage',
    value: 300,
    target: 'enemy',
    rarity: 'common'
  },
  {
    id: 'huogong_2',
    name: '火攻',
    type: '锦囊',
    category: 'A',
    description: '指定一名玩家损失300金',
    effect: 'damage',
    value: 300,
    target: 'enemy',
    rarity: 'common'
  },
  {
    id: 'kurouji',
    name: '苦肉计',
    type: '锦囊',
    category: 'A',
    description: '自己损失200金，指定玩家损失500金',
    effect: 'selfDamageAndEnemyDamage',
    value: 500,
    target: 'enemy',
    rarity: 'common'
  },
  {
    id: 'jiedaosharen',
    name: '借刀杀人',
    type: '锦囊',
    category: 'B',  // 响应型：需支付过路费时使用
    description: '指定一名玩家替你支付下一次过路费',
    effect: 'redirectToll',
    target: 'enemy',
    rarity: 'rare'
  },
  {
    id: 'baiqijieying',
    name: '百骑劫营',
    type: '锦囊',
    category: 'B',  // 响应型：对方获得收益时使用
    description: '抢夺指定玩家当前回合的所有收益',
    effect: 'stealGains',
    target: 'enemy',
    rarity: 'rare'
  },

  // ===== 防守类（4张）=====
  {
    id: 'kongchengji_1',
    name: '空城计',
    type: '锦囊',
    category: 'B',  // 响应型：需支付过路费时使用
    description: '本回合免疫所有过路费',
    effect: 'immuneToll',
    target: 'self',
    rarity: 'legendary'
  },
  {
    id: 'kongchengji_2',
    name: '空城计',
    type: '锦囊',
    category: 'B',
    description: '本回合免疫所有过路费',
    effect: 'immuneToll',
    target: 'self',
    rarity: 'legendary'
  },
  {
    id: 'zouweishangji_1',
    name: '走为上计',
    type: '锦囊',
    category: 'A',
    description: '立即传送到起点（获得起点奖励）',
    effect: 'teleportToStart',
    target: 'self',
    rarity: 'common'
  },
  {
    id: 'zouweishangji_2',
    name: '走为上计',
    type: '锦囊',
    category: 'A',
    description: '立即传送到起点（获得起点奖励）',
    effect: 'teleportToStart',
    target: 'self',
    rarity: 'common'
  },

  // ===== 控场类（4张）=====
  {
    id: 'meirenji',
    name: '美人计',
    type: '锦囊',
    category: 'A',
    description: '指定玩家下回合无法行动（跳过一回合）',
    effect: 'skipTurn',
    target: 'enemy',
    rarity: 'legendary'
  },
  {
    id: 'lianhuanji',
    name: '连环计',
    type: '锦囊',
    category: 'A',
    description: '指定两名玩家，A向B支付当前资金的10%',
    effect: 'transferMoney',
    target: 'any',
    rarity: 'rare'
  },
  {
    id: 'fanjianji',
    name: '反间计',
    type: '锦囊',
    category: 'A',
    description: '偷取指定玩家1张锦囊卡（随机）',
    effect: 'stealCard',
    target: 'enemy',
    rarity: 'common'
  },
  {
    id: 'weiweijiuzhao',
    name: '围魏救赵',
    type: '锦囊',
    category: 'A',
    description: '与任意玩家交换位置',
    effect: 'swapPosition',
    target: 'any',
    rarity: 'common'
  },

  // ===== 机动类（3张）=====
  {
    id: 'mantianguohai',
    name: '瞒天过海',
    type: '锦囊',
    category: 'A',
    description: '传送到地图任意一格',
    effect: 'teleportAny',
    target: 'self',
    rarity: 'rare'
  },
  {
    id: 'shengdongjixi_1',
    name: '声东击西',
    type: '锦囊',
    category: 'A',
    description: '再掷一次骰子',
    effect: 'rerollDice',
    target: 'self',
    rarity: 'common'
  },
  {
    id: 'shengdongjixi_2',
    name: '声东击西',
    type: '锦囊',
    category: 'A',
    description: '再掷一次骰子',
    effect: 'rerollDice',
    target: 'self',
    rarity: 'common'
  },

  // ===== 经济类（2张）=====
  {
    id: 'yiyidailao',
    name: '以逸待劳',
    type: '锦囊',
    category: 'A',
    description: '本回合不移动，获得300金',
    effect: 'skipMoveGainMoney',
    value: 300,
    target: 'self',
    rarity: 'common'
  },
  {
    id: 'caochuanjiejian',
    name: '草船借箭',
    type: '锦囊',
    category: 'A',
    description: '从每位玩家处获得100金',
    effect: 'collectFromAll',
    value: 100,
    target: 'all',
    rarity: 'rare'
  }
]

// ========== 天命卡（20张）==========

export const tianmingCards: Card[] = [
  // ===== 强正面（4张）=====
  {
    id: 'sangumaolu',
    name: '三顾茅庐',
    type: '天命',
    category: 'A',
    description: '免费抽取1张锦囊卡，无需占用回合',
    effect: 'drawFreeCard',
    target: 'self',
    rarity: 'legendary'
  },
  {
    id: 'qiqinmenghuo',
    name: '七擒孟获',
    type: '天命',
    category: 'A',
    description: '选择1座无主城池，免费获得所有权',
    effect: 'freeCity',
    target: 'self',
    rarity: 'legendary'
  },
  {
    id: 'caochuanjiejian_tm',
    name: '草船借箭',
    type: '天命',
    category: 'A',
    description: '从每位玩家处获得100金',
    effect: 'collectFromAll',
    value: 100,
    target: 'all',
    rarity: 'rare'
  },
  {
    id: 'kongchengtuidi_1',
    name: '空城退敌',
    type: '天命',
    category: 'A',
    description: '获得500金',
    effect: 'gainMoney',
    value: 500,
    target: 'self',
    rarity: 'rare'
  },
  {
    id: 'kongchengtuidi_2',
    name: '空城退敌',
    type: '天命',
    category: 'A',
    description: '获得500金',
    effect: 'gainMoney',
    value: 500,
    target: 'self',
    rarity: 'rare'
  },

  // ===== 弱正面（4张）=====
  {
    id: 'taoyuanjieyi',
    name: '桃园结义',
    type: '天命',
    category: 'A',
    description: '与指定玩家结盟3回合，期间互相免过路费',
    effect: 'alliance',
    value: 3,
    target: 'any',
    rarity: 'rare'
  },
  {
    id: 'dandaohui',
    name: '单刀赴会',
    type: '天命',
    category: 'A',
    description: '移动到任意城池，如果无主则强制购买',
    effect: 'moveAndBuyCity',
    target: 'self',
    rarity: 'common'
  },
  {
    id: 'wangmeizhike',
    name: '望梅止渴',
    type: '天命',
    category: 'A',
    description: '移动到最近的锦囊格，立即抽取锦囊卡',
    effect: 'moveToChance',
    target: 'self',
    rarity: 'common'
  },
  {
    id: 'bingqiangmazhuang_1',
    name: '兵强马壮',
    type: '天命',
    category: 'A',
    description: '获得200金',
    effect: 'gainMoney',
    value: 200,
    target: 'self',
    rarity: 'common'
  },
  {
    id: 'bingqiangmazhuang_2',
    name: '兵强马壮',
    type: '天命',
    category: 'A',
    description: '获得200金',
    effect: 'gainMoney',
    value: 200,
    target: 'self',
    rarity: 'common'
  },

  // ===== 中性（4张）=====
  {
    id: 'chibizhizhan',
    name: '赤壁之战',
    type: '天命',
    category: 'A',
    description: '所有玩家（包括自己）随机移动1-6格',
    effect: 'allRandomMove',
    value: 6,
    target: 'all',
    rarity: 'rare'
  },
  {
    id: 'huoshaolianying',
    name: '火烧连营',
    type: '天命',
    category: 'A',
    description: '当前所在区域所有城池过路费翻倍1回合',
    effect: 'regionTollDouble',
    target: 'all',
    rarity: 'rare'
  },
  {
    id: 'guaguliaodu',
    name: '刮骨疗毒',
    type: '天命',
    category: 'A',
    description: '损失500金，移除所有负面状态',
    effect: 'removeDebuffs',
    value: 500,
    target: 'self',
    rarity: 'rare'
  },
  {
    id: 'weizhenhuaxia',
    name: '威震华夏',
    type: '天命',
    category: 'A',
    description: '本回合你拥有的所有城池过路费翻倍',
    effect: 'ownCitiesTollDouble',
    target: 'self',
    rarity: 'rare'
  },

  // ===== 弱负面（4张）=====
  {
    id: 'jugongjinchui_1',
    name: '鞠躬尽瘁',
    type: '天命',
    category: 'A',
    description: '损失300金',
    effect: 'loseMoney',
    value: 300,
    target: 'self',
    rarity: 'common'
  },
  {
    id: 'jugongjinchui_2',
    name: '鞠躬尽瘁',
    type: '天命',
    category: 'A',
    description: '损失300金',
    effect: 'loseMoney',
    value: 300,
    target: 'self',
    rarity: 'common'
  },
  {
    id: 'wangfengertao',
    name: '望风而逃',
    type: '天命',
    category: 'A',
    description: '后退5格',
    effect: 'moveBack',
    value: 5,
    target: 'self',
    rarity: 'common'
  },
  {
    id: 'tianzairenhuo',
    name: '天灾人祸',
    type: '天命',
    category: 'A',
    description: '损失100金',
    effect: 'loseMoney',
    value: 100,
    target: 'self',
    rarity: 'common'
  },

  // ===== 强负面（2张）=====
  {
    id: 'dayishijingzhou',
    name: '大意失荆州',
    type: '天命',
    category: 'A',
    description: '随机失去1座你拥有的城池',
    effect: 'loseRandomCity',
    target: 'self',
    rarity: 'legendary'
  },
  {
    id: 'lebusisu',
    name: '乐不思蜀',
    type: '天命',
    category: 'A',
    description: '原地停留2回合（无法移动）',
    effect: 'skipTurns',
    value: 2,
    target: 'self',
    rarity: 'rare'
  },
  {
    id: 'baizouhuarong',
    name: '败走华容',
    type: '天命',
    category: 'A',
    description: '立即进入监狱',
    effect: 'goToPrison',
    target: 'self',
    rarity: 'rare'
  }
]

// ========== 合并所有卡牌 ==========

export const cards: Card[] = [...jinnangCards, ...tianmingCards]

// ========== 工具函数 ==========

/**
 * 根据ID获取卡牌
 */
export function getCardById(id: string): Card | undefined {
  return cards.find(c => c.id === id)
}

/**
 * 抽取锦囊卡
 */
export function drawJinnangCard(): Card {
  return jinnangCards[Math.floor(Math.random() * jinnangCards.length)]
}

/**
 * 抽取天命卡
 */
export function drawTianmingCard(): Card {
  return tianmingCards[Math.floor(Math.random() * tianmingCards.length)]
}

/**
 * 获取A类卡（主动使用）
 */
export function getACategoryCards(playerCards: Card[]): Card[] {
  return playerCards.filter(c => c.category === 'A')
}

/**
 * 获取B类卡（响应触发）
 */
export function getBCategoryCards(playerCards: Card[]): Card[] {
  return playerCards.filter(c => c.category === 'B')
}

/**
 * 获取特定效果的B类卡（如支付过路费时可用的卡）
 */
export function getUsableBCards(playerCards: Card[], trigger: string): Card[] {
  return playerCards.filter(c => {
    if (c.category !== 'B') return false
    
    // 根据触发条件筛选
    switch (trigger) {
      case 'payToll':
        return ['immuneToll', 'redirectToll'].includes(c.effect)
      case 'enemyGains':
        return c.effect === 'stealGains'
      default:
        return false
    }
  })
}

/**
 * 检查是否可以使用火攻卡（周瑜加成）
 */
export function canUseFireCardBoost(player: { hero?: { skill: { effect: string } } }): boolean {
  return player.hero?.skill.effect === 'fireCardBoost'
}

/**
 * 应用周瑜火攻加成
 */
export function applyFireCardBoost(value: number, player: { hero?: { skill: { effect: string } } }): number {
  if (canUseFireCardBoost(player)) {
    return value * 2
  }
  return value
}
