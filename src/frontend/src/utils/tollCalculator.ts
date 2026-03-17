// ============================================
// 过路费计算器 v1.1
// 供 TollPanel 组件使用
// ============================================

import type { MapCell, Player } from '../types'
import { GAME_CONSTANTS } from '../types'

const { LEVEL_MULTIPLIER, JINGZHOU_BONUS, HERO_BONUS } = GAME_CONSTANTS

/**
 * 过路费计算结果
 */
export interface TollCalcResult {
  baseToll: number           // 基础过路费（购买价×10%）
  level: number              // 城池等级
  levelMultiplier: number    // 等级倍率
  regionBonus: number        // 区域加成（荆州1.2）
  ownerBonus: number         // 城主技能加成（张飞1.5）
  visitorReduction: number   // 访客减免（刘备0.5/夏侯惇0.7）
  finalToll: number          // 最终过路费
}

/**
 * 计算完整过路费
 * 
 * 根据 rules-v1.1.md 公式：
 * 应付过路费 = floor(
 *   城池基础过路费
 *   × 升级倍率[level]
 *   × 区域加成系数
 *   × 城主进攻技能系数
 *   × 访客防御技能系数
 * )
 */
export function calculateToll(
  cell: MapCell,
  visitor: Player,
  owner: Player,
  isAlliance: boolean
): TollCalcResult {
  // 基础过路费 = 购买价 × 10%
  const baseToll = cell.price ? Math.floor(cell.price * 0.1) : 0
  const level = cell.level || 1
  
  // 1. 等级倍率
  const levelMultiplier = LEVEL_MULTIPLIER[level] || 1.0
  
  // 2. 区域加成（荆州+20%）
  const regionBonus = cell.region === '荆州' ? JINGZHOU_BONUS : 1.0
  
  // 3. 城主进攻技能加成（张飞+50%）
  let ownerBonus = 1.0
  if (owner.hero?.id === 'zhangfei') {
    ownerBonus = HERO_BONUS.ZHANGFEI_BONUS
  }
  
  // 计算基础金额（加成部分）
  const baseAmount = baseToll * levelMultiplier * regionBonus * ownerBonus
  
  // 4. 访客防御技能减免
  let visitorReduction = 1.0
  const visitorHeroId = visitor.hero?.id
  
  if (visitorHeroId === 'liubei') {
    visitorReduction = HERO_BONUS.LIUBEI_REDUCTION
  } else if (visitorHeroId === 'xiaohoudun') {
    visitorReduction = HERO_BONUS.XIAHOUDUN_REDUCTION
  }
  
  // 5. 计算最终过路费
  let finalToll = Math.floor(baseAmount * visitorReduction)
  
  // 结盟期间免过路费
  if (isAlliance) {
    finalToll = 0
  }
  
  return {
    baseToll,
    level,
    levelMultiplier,
    regionBonus,
    ownerBonus,
    visitorReduction,
    finalToll
  }
}

/**
 * 甘宁劫营计算
 * 访客支付50%，城主实收50%
 */
export function calculateGanningToll(
  cell: MapCell,
  visitor: Player,
  owner: Player
): { visitorPays: number; ownerReceives: number } {
  const result = calculateToll(cell, visitor, owner, false)
  
  // 甘宁技能：支付50%，城主收50%
  return {
    visitorPays: Math.floor(result.finalToll * 0.5),
    ownerReceives: Math.floor(result.finalToll * 0.5)
  }
}

/**
 * 空城计免疫检查
 */
export function canUseKongcheng(player: Player): boolean {
  return player.cards.some(card => 
    card.id === 'kongchengji_1' || card.id === 'kongchengji_2'
  )
}

/**
 * 借刀杀人检查
 */
export function canUseJiedao(player: Player, otherPlayers: Player[]): boolean {
  const hasCard = player.cards.some(card => card.id === 'jiedaosharen')
  const hasTarget = otherPlayers.some(p => 
    p.id !== player.id && 
    p.status !== 'BANKRUPT'
  )
  return hasCard && hasTarget
}

/**
 * 获取可用的B类响应卡ID列表
 */
export function getAvailableResponseCards(
  player: Player, 
  otherPlayers: Player[]
): string[] {
  const cards: string[] = []
  
  // 空城计：完全免疫
  if (canUseKongcheng(player)) {
    if (!cards.includes('kongchengji')) cards.push('kongchengji')
  }
  
  // 借刀杀人：让他人代付
  if (canUseJiedao(player, otherPlayers)) {
    if (!cards.includes('jiedaosharen')) cards.push('jiedaosharen')
  }
  
  return cards
}

/**
 * 计算城池升级费用
 */
export function calculateUpgradeCost(cell: MapCell): number {
  if (!cell.price || !cell.level) return 0
  if (cell.level >= 5) return 0
  
  const upgradeRate = GAME_CONSTANTS.UPGRADE_RATE[cell.level]
  return Math.floor(cell.price * upgradeRate)
}

/**
 * 计算城池累计投入
 */
export function calculateTotalInvested(cell: MapCell): number {
  if (!cell.price) return 0
  const level = cell.level || 1
  const investRate = GAME_CONSTANTS.TOTAL_INVEST_RATE[level]
  return Math.floor(cell.price * investRate)
}

/**
 * 计算城池出售价格
 */
export function calculateSellPrice(cell: MapCell): number {
  const totalInvested = calculateTotalInvested(cell)
  return Math.floor(totalInvested * 0.5)
}

/**
 * 获取城池升级信息
 */
export function getCellUpgradeInfo(cell: MapCell) {
  return {
    currentLevel: cell.level || 1,
    maxLevel: 5,
    upgradeCost: calculateUpgradeCost(cell),
    totalInvested: calculateTotalInvested(cell),
    sellPrice: calculateSellPrice(cell)
  }
}

/**
 * 计算起点奖励
 */
export function calculateStartBonus(
  playerCount: number,
  heroId?: string,
  isSpeedMode: boolean = false
): number {
  const baseBonus = GAME_CONSTANTS.START_BONUS[playerCount] || 2000
  const speedBonus = isSpeedMode ? 1000 : 0
  const caoCaoBonus = heroId === 'caocao' 
    ? Math.floor((baseBonus + speedBonus) * GAME_CONSTANTS.HERO_BONUS.CAOCAO_START)
    : 0
  
  return baseBonus + speedBonus + caoCaoBonus
}

/**
 * 计算周瑜火攻伤害
 */
export function calculateFireDamage(heroId?: string): number {
  const baseDamage = 300
  if (heroId === 'zhouyu') {
    return baseDamage * GAME_CONSTANTS.HERO_BONUS.ZHOUYU_FIRE
  }
  return baseDamage
}

/**
 * 检查是否在荆州区域
 */
export function isInJingzhou(cell: MapCell): boolean {
  return cell.region === '荆州'
}

/**
 * 获取城池当前过路费（简单版，用于地图显示）
 */
export function getCurrentToll(cell: MapCell): number {
  if (!cell.price) return 0
  const baseToll = Math.floor(cell.price * 0.1)
  const level = cell.level || 1
  const multiplier = LEVEL_MULTIPLIER[level] || 1.0
  return Math.floor(baseToll * multiplier)
}
