// 武将技能实现
import type { Player, Hero } from '../types'

// 技能效果类型
export type SkillEffect = 
  | 'startBonus'      // 经过起点加成
  | 'peekCard'        // 查看下一张卡
  | 'prisonEscape'    // 自动出狱
  | 'attackBoost'     // 攻击加成
  | 'extraCard'       // 多用一张卡
  | 'tollDiscount'    // 过路费减免
  | 'instantEscape'   // 立即出狱
  | 'doubleRoll'      // 双倍掷骰
  | 'dodge'           // 闪避
  | 'sureHit'         // 必中
  | 'reroll'          // 重掷
  | 'fireBoost'       // 火攻加成
  | 'incomeBonus'     // 收入加成
  | 'spyHand'         // 查看手牌
  | 'stealCard'       // 偷牌
  | 'drawOnUse'       // 用牌抽牌

// 计算经过起点的额外收益
export function calculateStartBonus(player: Player, baseBonus: number = 2000): number {
  if (!player.hero) return baseBonus
  
  const skill = player.hero.skill.effect
  if (skill === 'startBonus') {
    // 曹操：额外10%
    return Math.floor(baseBonus * 1.1)
  }
  return baseBonus
}

// 计算过路费
export function calculateToll(player: Player, baseToll: number): number {
  if (!player.hero) return baseToll
  
  const skill = player.hero.skill.effect
  if (skill === 'tollDiscount') {
    // 刘备：过路费减半
    return Math.floor(baseToll * 0.5)
  }
  return baseToll
}

// 检查是否能闪避
export function canDodge(player: Player): boolean {
  if (!player.hero) return false
  return player.hero.skill.effect === 'dodge' && Math.random() < 0.5
}

// 检查攻击是否必中
export function isSureHit(attacker: Player): boolean {
  if (!attacker.hero) return false
  return attacker.hero.skill.effect === 'sureHit'
}

// 计算攻击伤害
export function calculateDamage(attacker: Player, baseDamage: number): number {
  if (!attacker.hero) return baseDamage
  
  const skill = attacker.hero.skill.effect
  if (skill === 'attackBoost') {
    // 典韦：攻击+50%
    return Math.floor(baseDamage * 1.5)
  }
  return baseDamage
}

// 计算火攻伤害
export function calculateFireDamage(player: Player, baseDamage: number): number {
  if (!player.hero) return baseDamage
  
  const skill = player.hero.skill.effect
  if (skill === 'fireBoost') {
    // 周瑜：火攻翻倍
    return baseDamage * 2
  }
  return baseDamage
}

// 检查是否能重掷骰子
export function canReroll(player: Player): boolean {
  if (!player.hero) return false
  return ['reroll', 'doubleRoll'].includes(player.hero.skill.effect)
}

// 检查是否能立即出狱
export function canInstantEscape(player: Player): boolean {
  if (!player.hero) return false
  return player.hero.skill.effect === 'instantEscape'
}

// 检查是否自动出狱
export function shouldAutoEscape(player: Player, prisonTurns: number): boolean {
  if (!player.hero) return false
  return player.hero.skill.effect === 'prisonEscape' && prisonTurns >= 2
}

// 获取每回合额外收入
export function getTurnIncome(player: Player): number {
  if (!player.hero) return 0
  return player.hero.skill.effect === 'incomeBonus' ? 100 : 0
}

// 检查是否可以多用一张卡
export function canUseExtraCard(player: Player): boolean {
  if (!player.hero) return false
  return player.hero.skill.effect === 'extraCard'
}

// 检查使用卡牌后是否能抽牌
export function shouldDrawAfterUse(player: Player): boolean {
  if (!player.hero) return false
  return player.hero.skill.effect === 'drawOnUse' && Math.random() < 0.5
}

// 获取技能描述
export function getSkillDescription(hero: Hero): string {
  return `${hero.skill.name}：${hero.skill.description}`
}

// 检查技能是否触发
export function checkSkillTrigger(
  player: Player, 
  trigger: 'passStart' | 'payToll' | 'attacked' | 'useCard' | 'inPrison' | 'turnStart' | 'rollDice'
): boolean {
  if (!player.hero) return false
  
  const effect = player.hero.skill.effect
  const triggerMap: Record<string, SkillEffect[]> = {
    'passStart': ['startBonus'],
    'payToll': ['tollDiscount'],
    'attacked': ['dodge'],
    'useCard': ['attackBoost', 'fireBoost', 'sureHit', 'drawOnUse', 'stealCard'],
    'inPrison': ['instantEscape', 'prisonEscape'],
    'turnStart': ['incomeBonus', 'extraCard'],
    'rollDice': ['reroll', 'doubleRoll']
  }
  
  return triggerMap[trigger]?.includes(effect) ?? false
}
