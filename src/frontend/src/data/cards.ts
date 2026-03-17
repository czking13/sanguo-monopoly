// ============================================
// 卡牌数据 v1.1
// 根据 card-design-v1.1.md 完整定义
// ============================================

import type { Card, CardUseType } from '../types'

// ============================================
// 锦囊卡（16张）
// ============================================

export const jinnangCards: Card[] = [
  // A类：主动阶段使用（步骤⑥）
  {
    id: 'huogong_1',
    name: '火攻',
    type: '锦囊',
    useType: 'A',
    description: '对指定玩家造成300金损失（周瑜使用时为600金）',
    effect: 'damage',
    rarity: 'common',
    acquiredAt: 0
  },
  {
    id: 'huogong_2',
    name: '火攻',
    type: '锦囊',
    useType: 'A',
    description: '对指定玩家造成300金损失（周瑜使用时为600金）',
    effect: 'damage',
    rarity: 'common',
    acquiredAt: 0
  },
  {
    id: 'lianji',
    name: '连环计',
    type: '锦囊',
    useType: 'A',
    description: '选择2名不同玩家，A向B支付当前资金10%',
    effect: 'chain',
    rarity: 'rare',
    acquiredAt: 0
  },
  {
    id: 'kurenji',
    name: '苦肉计',
    type: '锦囊',
    useType: 'A',
    description: '自损200金，对目标造成500金损失',
    effect: 'self_damage',
    rarity: 'common',
    acquiredAt: 0
  },
  {
    id: 'fanjianji',
    name: '反间计',
    type: '锦囊',
    useType: 'A',
    description: '随机偷取目标1张锦囊卡',
    effect: 'steal_card',
    rarity: 'rare',
    acquiredAt: 0
  },
  {
    id: 'meirenji',
    name: '美人计',
    type: '锦囊',
    useType: 'A',
    description: '跳过目标下1个回合（对同一目标3回合冷却）',
    effect: 'skip_turn',
    rarity: 'rare',
    acquiredAt: 0
  },
  {
    id: 'weiweijiuzhao',
    name: '围魏救赵',
    type: '锦囊',
    useType: 'A',
    description: '与目标玩家交换位置（不触发落地效果，可救盟友出狱）',
    effect: 'swap_position',
    rarity: 'rare',
    acquiredAt: 0
  },
  {
    id: 'yiyidailao',
    name: '以逸待劳',
    type: '锦囊',
    useType: 'A',
    description: '本回合不移动，获得300金',
    effect: 'skip_move_gain',
    rarity: 'common',
    acquiredAt: 0
  },
  {
    id: 'shengdongjixi_1',
    name: '声东击西',
    type: '锦囊',
    useType: 'A',
    description: '再次掷骰并移动',
    effect: 'reroll_move',
    rarity: 'common',
    acquiredAt: 0
  },
  {
    id: 'shengdongjixi_2',
    name: '声东击西',
    type: '锦囊',
    useType: 'A',
    description: '再次掷骰并移动',
    effect: 'reroll_move',
    rarity: 'common',
    acquiredAt: 0
  },
  
  // B类：响应型使用（特定触发时机）
  {
    id: 'kongchengji_1',
    name: '空城计',
    type: '锦囊',
    useType: 'B',
    description: '被要求支付过路费时，完全免疫',
    effect: 'immune_toll',
    rarity: 'rare',
    acquiredAt: 0
  },
  {
    id: 'kongchengji_2',
    name: '空城计',
    type: '锦囊',
    useType: 'B',
    description: '被要求支付过路费时，完全免疫',
    effect: 'immune_toll',
    rarity: 'rare',
    acquiredAt: 0
  },
  {
    id: 'jiedaosharen',
    name: '借刀杀人',
    type: '锦囊',
    useType: 'B',
    description: '被要求支付过路费时，让其他玩家代付',
    effect: 'redirect_toll',
    rarity: 'rare',
    acquiredAt: 0
  },
  {
    id: 'mantianguohai',
    name: '瞒天过海',
    type: '锦囊',
    useType: 'B',
    description: '移动结束后，传送到任意格子（触发落地效果）',
    effect: 'teleport',
    rarity: 'rare',
    acquiredAt: 0
  },
  {
    id: 'zouweishangji_1',
    name: '走为上计',
    type: '锦囊',
    useType: 'B',
    description: '返回起点，触发起点奖励',
    effect: 'return_start',
    rarity: 'common',
    acquiredAt: 0
  },
  {
    id: 'zouweishangji_2',
    name: '走为上计',
    type: '锦囊',
    useType: 'B',
    description: '返回起点，触发起点奖励',
    effect: 'return_start',
    rarity: 'common',
    acquiredAt: 0
  },
]

// ============================================
// 天命卡（20张）
// ============================================

export const tianmingCards: Card[] = [
  // 正面卡
  {
    id: 'chibizhizhan',
    name: '赤壁之战',
    type: '天命',
    description: '所有玩家随机移动1-6格（不给起点奖励，不触发落地效果）',
    effect: 'random_move_all',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'sangumaolu',
    name: '三顾茅庐',
    type: '天命',
    description: '免费抽取1张锦囊卡',
    effect: 'draw_jinnang',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'caochuanjiejian',
    name: '草船借箭',
    type: '天命',
    description: '从每位存活玩家各获得100金',
    effect: 'collect_from_all',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'wangmeizhike',
    name: '望梅止渴',
    type: '天命',
    description: '移动到最近的锦囊格并抽卡',
    effect: 'move_to_jinnang',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'qiqinmenghuo',
    name: '七擒孟获',
    type: '天命',
    description: '免费获得1座无主城池（无无主城池改为+500金）',
    effect: 'free_city',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'taoyuanjieyi',
    name: '桃园结义',
    type: '天命',
    description: '与目标玩家结盟3回合（目标无法拒绝）',
    effect: 'alliance',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'daodaojuhui',
    name: '单刀赴会',
    type: '天命',
    description: '移动到任意城池，若无主且资金充足则强制购买',
    effect: 'move_buy_city',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'guagududao_1',
    name: '刮骨疗毒',
    type: '天命',
    description: '损失500金，移除所有负面状态',
    effect: 'remove_debuff',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'kongchentuidi_1',
    name: '空城退敌',
    type: '天命',
    description: '获得500金',
    effect: 'gain_500',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'kongchentuidi_2',
    name: '空城退敌',
    type: '天命',
    description: '获得500金',
    effect: 'gain_500',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'huoshaolianying',
    name: '火烧连营',
    type: '天命',
    description: '当前区域所有城池过路费翻倍，持续1全局回合',
    effect: 'region_double_toll',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'weizhenhuaxia',
    name: '威震华夏',
    type: '天命',
    description: '本回合你的所有城池过路费翻倍',
    effect: 'double_toll_turn',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'bingqiangmazhuang_1',
    name: '兵强马壮',
    type: '天命',
    description: '获得200金',
    effect: 'gain_200',
    isPositive: true,
    acquiredAt: 0
  },
  {
    id: 'bingqiangmazhuang_2',
    name: '兵强马壮',
    type: '天命',
    description: '获得200金',
    effect: 'gain_200',
    isPositive: true,
    acquiredAt: 0
  },
  
  // 负面卡
  {
    id: 'baizouhuarong',
    name: '败走华容',
    type: '天命',
    description: '进入监狱',
    effect: 'go_prison',
    isPositive: false,
    acquiredAt: 0
  },
  {
    id: 'dayishijingzhou',
    name: '大意失荆州',
    type: '天命',
    description: '随机失去1座城池（无城池改为损失1000金）',
    effect: 'lose_city',
    isPositive: false,
    acquiredAt: 0
  },
  {
    id: 'lebusishu',
    name: '乐不思蜀',
    type: '天命',
    description: '接下来2个回合无法行动',
    effect: 'skip_2_turns',
    isPositive: false,
    acquiredAt: 0
  },
  {
    id: 'jugongjincui_1',
    name: '鞠躬尽瘁',
    type: '天命',
    description: '损失300金',
    effect: 'lose_300',
    isPositive: false,
    acquiredAt: 0
  },
  {
    id: 'jugongjincui_2',
    name: '鞠躬尽瘁',
    type: '天命',
    description: '损失300金',
    effect: 'lose_300',
    isPositive: false,
    acquiredAt: 0
  },
  {
    id: 'wangfengertao',
    name: '望风而逃',
    type: '天命',
    description: '后退5格（不给起点奖励，触发落地效果）',
    effect: 'back_5',
    isPositive: false,
    acquiredAt: 0
  },
  {
    id: 'tianzaihualie_1',
    name: '天灾人祸',
    type: '天命',
    description: '损失100金',
    effect: 'lose_100',
    isPositive: false,
    acquiredAt: 0
  },
  {
    id: 'tianzaihualie_2',
    name: '天灾人祸',
    type: '天命',
    description: '损失100金',
    effect: 'lose_100',
    isPositive: false,
    acquiredAt: 0
  },
]

// ============================================
// 黄忠负面→正面映射表（v1.1）
// ============================================
export const huangzhongMapping: Record<string, { name: string; effect: string; description: string }> = {
  'baizouhuarong': { name: '化险为夷', effect: 'gain_500', description: '获得500金' },
  'dayishijingzhou': { name: '意外收获', effect: 'free_city', description: '获得1座无主城池' },
  'lebusishu': { name: '安享太平', effect: 'gain_300', description: '获得300金' },
  'jugongjincui': { name: '否极泰来', effect: 'gain_300', description: '获得300金' },
  'wangfengertao': { name: '勇往直前', effect: 'forward_5', description: '前进5格' },
  'tianzaihualie': { name: '福星高照', effect: 'gain_100', description: '获得100金' },
}

// ============================================
// 初始化牌堆
// ============================================
export function initJinnangDeck(): string[] {
  return shuffleArray(jinnangCards.map(c => c.id))
}

export function initTianmingDeck(): string[] {
  return shuffleArray(tianmingCards.map(c => c.id))
}

// ============================================
// 获取卡牌详情
// ============================================
export function getCardById(cardId: string): Card | undefined {
  return [...jinnangCards, ...tianmingCards].find(c => c.id === cardId)
}

// ============================================
// 判断卡牌使用时机
// ============================================
export function getCardUseType(cardId: string): CardUseType | undefined {
  const card = getCardById(cardId)
  return card?.useType
}

// ============================================
// B类卡触发上下文
// ============================================
export type BCardContext = 'toll' | 'move' | 'other'

// 获取当前上下文可用的B类卡
export function getAvailableBCards(
  playerCards: Card[], 
  context: BCardContext
): Card[] {
  return playerCards.filter(card => {
    if (card.useType !== 'B') return false
    
    // 过路费上下文：空城计、借刀杀人
    if (context === 'toll') {
      return ['kongchengji_1', 'kongchengji_2', 'jiedaosharen'].includes(card.id)
    }
    
    // 移动后上下文：瞒天过海、走为上计
    if (context === 'move') {
      return ['mantianguohai', 'zouweishangji_1', 'zouweishangji_2'].includes(card.id)
    }
    
    return false
  })
}

// ============================================
// 工具函数
// ============================================
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 随机抽卡（旧接口兼容）
export function drawCard(type: '锦囊' | '天命'): Card | undefined {
  const cards = type === '锦囊' ? jinnangCards : tianmingCards
  return cards[Math.floor(Math.random() * cards.length)]
}

// ============================================
// 旧版技能数据（兼容）
// ============================================
export const chanceCards = [...jinnangCards, ...tianmingCards]

export const heroSkills = {
  // 魏国
  'caocao': { name: '挟天子以令诸侯', trigger: 'pass_start', effect: 'start_bonus_15' },
  'simayi': { name: '隐忍', trigger: 'enter_prison', effect: 'escape_once' },
  'xiaohoudun': { name: '拔矢啖睛', trigger: 'pay_toll', effect: 'reduce_30' },
  'zhangliao': { name: '突袭', trigger: 'roll_dice', effect: 'dice_plus_1' },
  'xuchu': { name: '虎卫', trigger: 'game_start', effect: 'init_plus_2000' },
  'xunyu': { name: '筹谋', trigger: 'turn_start', effect: 'gain_100' },
  
  // 蜀国
  'liubei': { name: '携民渡江', trigger: 'pay_toll', effect: 'reduce_50' },
  'zhugeliang': { name: '神机妙算', trigger: 'land_jinnang', effect: 'peek_card' },
  'guanyu': { name: '过五关斩六将', trigger: 'enter_prison', effect: 'escape_once' },
  'zhangfei': { name: '据水断桥', trigger: 'receive_toll', effect: 'bonus_50' },
  'zhaoyun': { name: '七进七出', trigger: 'roll_dice', effect: 'reroll_once' },
  'huangzhong': { name: '百步穿杨', trigger: 'tianming_card', effect: 'neg_to_pos' },
  
  // 吴国
  'sunquan': { name: '制衡', trigger: 'turn_end', effect: 'swap_card' },
  'zhouyu': { name: '火攻', trigger: 'use_huogong', effect: 'double_damage' },
  'luxun': { name: '火烧连营', trigger: 'pass_3_cities', effect: 'free_3rd' },
  'ganning': { name: '百骑劫营', trigger: 'pay_toll', effect: 'rob_50' },
  'taishici': { name: '神射', trigger: 'roll_dice', effect: 'dice_2_to_7' },
  'lusu': { name: '慷慨', trigger: 'turn_start', effect: 'gain_50' },
}
