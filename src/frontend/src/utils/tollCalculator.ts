// ============================================
// 三国大富翁 v1.1 过路费计算器
// 公式: floor(base × levelMultiplier × regionBonus × ownerBonus × visitorReduction)
// ============================================

import type { 
  Player, 
  MapCell, 
  TollCalculation,
  Faction 
} from '../types'
import { GAME_CONSTANTS } from '../types'
import { getHeroById } from '../data/heroes'

// ========== 过路费计算 ==========

/**
 * 计算过路费（完整公式）
 * @param cell 城池格子
 * @param owner 城池所有者
 * @param visitor 访问者（支付过路费的人）
 * @param visitorAllianceIds 访问者的盟友ID列表
 * @returns 过路费计算结果
 */
export function calculateToll(
  cell: MapCell,
  owner: Player,
  visitor: Player,
  visitorAllianceIds: string[] = []
): TollCalculation {
  const breakdown: string[] = []
  
  // 1. 基础过路费 = 城池价格 × 10%
  const baseToll = Math.floor((cell.price || 0) * GAME_CONSTANTS.TOLL_BASE_RATE)
  breakdown.push(`基础: ${cell.price}金 × 10% = ${baseToll}金`)
  
  // 2. 等级倍率
  const level = cell.level || 1
  const levelMultiplier = GAME_CONSTANTS.LEVEL_MULTIPLIER[level - 1] || 1
  breakdown.push(`等级倍率: ${level}级 × ${levelMultiplier}`)
  
  // 3. 区域加成（荆州+20%）
  let regionBonus = 1.0
  if (cell.region === '荆州') {
    regionBonus = GAME_CONSTANTS.JINGZHOU_BONUS
    breakdown.push(`区域加成: 荆州 × ${regionBonus}`)
  }
  
  // 4. 城主加成
  let ownerBonus = 1.0
  // 张飞：自己城池过路费+50%
  if (owner.hero?.skill.effect === 'tollIncrease') {
    const increaseRate = owner.hero.skill.params?.increaseRate as number || 0.5
    ownerBonus = 1 + increaseRate
    breakdown.push(`城主加成: 张飞「据水断桥」× ${ownerBonus}`)
  }
  
  // 5. 访问者减免
  let visitorReduction = 1.0
  const reductionDetails: string[] = []
  
  // 结盟检查
  if (visitorAllianceIds.includes(owner.id)) {
    visitorReduction = 0
    reductionDetails.push('结盟免过路费')
  }
  
  // 刘备：过路费减半
  if (visitor.hero?.skill.effect === 'tollDiscount') {
    const discountRate = visitor.hero.skill.params?.discountRate as number || 0.5
    visitorReduction = Math.min(visitorReduction, discountRate)
    reductionDetails.push(`刘备「携民渡江」减免50%`)
  }
  
  // 夏侯惇：过路费减免30%
  if (visitor.hero?.skill.effect === 'tollReduction') {
    const reductionRate = visitor.hero.skill.params?.reductionRate as number || 0.3
    visitorReduction = Math.min(visitorReduction, 1 - reductionRate)
    reductionDetails.push(`夏侯惇「拔矢啖睛」减免30%`)
  }
  
  // 空城计：免疫过路费
  const kongchengEffect = visitor.statusEffects.find(e => e.type === 'KONGCHENG')
  if (kongchengEffect) {
    visitorReduction = 0
    reductionDetails.push('空城计免疫')
  }
  
  if (reductionDetails.length > 0) {
    breakdown.push(`访问者减免: ${reductionDetails.join(', ')} → × ${visitorReduction}`)
  }
  
  // 6. 计算最终过路费
  let finalToll = Math.floor(
    baseToll * levelMultiplier * regionBonus * ownerBonus * visitorReduction
  )
  
  // 7. 2人局过路费+30%
  // (这个在外部处理，因为需要知道玩家总数)
  
  breakdown.push(`最终过路费: ${finalToll}金`)
  
  return {
    baseToll,
    levelMultiplier,
    regionBonus,
    ownerBonus,
    visitorReduction,
    finalToll,
    breakdown
  }
}

/**
 * 计算购买价格（含势力折扣）
 */
export function calculatePurchasePrice(
  cell: MapCell,
  buyer: Player
): { price: number; discount: number; breakdown: string[] } {
  const breakdown: string[] = []
  let price = cell.price || 0
  let discount = 0
  
  // 势力折扣
  if (buyer.hero && cell.faction) {
    const buyerFaction = buyer.hero.faction
    const cellFaction = cell.faction
    
    // 魏将买魏地9折
    if (buyerFaction === '魏' && cellFaction === '魏') {
      discount = 0.1
      price = Math.floor(price * 0.9)
      breakdown.push('魏将买魏地: 9折')
    }
    // 蜀将买蜀地8折
    else if (buyerFaction === '蜀' && cellFaction === '蜀') {
      discount = 0.2
      price = Math.floor(price * 0.8)
      breakdown.push('蜀将买蜀地: 8折')
    }
  }
  
  breakdown.unshift(`原价: ${cell.price}金`)
  breakdown.push(`实付: ${price}金`)
  
  return { price, discount, breakdown }
}

/**
 * 计算升级费用
 */
export function calculateUpgradeCost(cell: MapCell): number {
  const level = cell.level || 1
  if (level >= 5) return 0 // 满级无法升级
  
  const basePrice = cell.price || 0
  const costRate = GAME_CONSTANTS.UPGRADE_COST_RATE[level - 1] || 0.5
  
  return Math.floor(basePrice * costRate)
}

/**
 * 获取城池升级信息
 */
export function getCellUpgradeInfo(cell: MapCell): {
  level: number
  upgradeCost: number
  sellPrice: number
  tollMultiplier: number
} {
  const level = cell.level || 1
  const basePrice = cell.price || 0
  
  // 升级费用
  const upgradeCost = calculateUpgradeCost(cell)
  
  // 出售价格 = (购买价 + 累计升级费用) × 50%
  const totalInvested = calculateTotalInvested(cell)
  const sellPrice = Math.floor(totalInvested * 0.5)
  
  // 过路费倍率
  const tollMultiplier = GAME_CONSTANTS.LEVEL_MULTIPLIER[level - 1] || 1
  
  return {
    level,
    upgradeCost,
    sellPrice,
    tollMultiplier
  }
}

/**
 * 计算累计投入（购买价 + 升级费用）
 */
export function calculateTotalInvested(cell: MapCell): number {
  const basePrice = cell.price || 0
  const level = cell.level || 1
  
  let totalInvested = basePrice
  
  // 累计升级费用
  for (let i = 1; i < level; i++) {
    const costRate = GAME_CONSTANTS.UPGRADE_COST_RATE[i - 1] || 0.5
    totalInvested += Math.floor(basePrice * costRate)
  }
  
  return totalInvested
}

// ========== 甘宁劫营 ==========

/**
 * 计算甘宁劫营效果
 * 抢夺该城池本次过路费的50%
 */
export function calculateGanningRaid(
  cell: MapCell,
  owner: Player,
  ganningPlayer: Player
): {
  ownerReceives: number
  ganningReceives: number
  total: number
} {
  // 计算基础过路费
  const tollResult = calculateToll(cell, owner, ganningPlayer, [])
  const total = tollResult.finalToll
  
  // 甘宁抢夺50%
  const ganningReceives = Math.floor(total * 0.5)
  const ownerReceives = total - ganningReceives
  
  return {
    ownerReceives,
    ganningReceives,
    total
  }
}

// ========== 陆逊连营 ==========

/**
 * 检查陆逊连营免疫
 * 连续经过敌方城池时，第3座免过路费
 */
export function checkLuxunChainImmunity(
  luxunPlayer: Player,
  consecutiveEnemyCities: number
): boolean {
  if (!luxunPlayer.hero || luxunPlayer.hero.skill.effect !== 'chainTollImmunity') {
    return false
  }
  
  const chainCount = luxunPlayer.hero.skill.params?.chainCount as number || 3
  return consecutiveEnemyCities >= chainCount
}

// ========== 2人局调整 ==========

/**
 * 应用2人局过路费加成
 */
export function apply2PlayerTollBonus(toll: number, playerCount: number): number {
  if (playerCount === 2) {
    return Math.floor(toll * 1.3) // +30%
  }
  return toll
}

// ========== 7-8人局锦囊效果加成 ==========

/**
 * 应用7-8人局锦囊效果加成
 */
export function applyHighPlayerCardBonus(effectValue: number, playerCount: number): number {
  if (playerCount >= 7) {
    return Math.floor(effectValue * 1.5) // +50%
  }
  return effectValue
}

// ========== 导出所有函数 ==========

export const TollCalculator = {
  calculateToll,
  calculatePurchasePrice,
  calculateUpgradeCost,
  getCellUpgradeInfo,
  calculateTotalInvested,
  calculateGanningRaid,
  checkLuxunChainImmunity,
  apply2PlayerTollBonus,
  applyHighPlayerCardBonus
}
