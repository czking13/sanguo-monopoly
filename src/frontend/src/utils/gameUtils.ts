// 过路费计算
export function calculateToll(
  cell: { price?: number; level?: number; ownerId?: string },
  player: { id: string; hero?: { skill: { effect: string } } },
  allPlayers: { id: string; isBankrupt: boolean }[]
): number {
  if (!cell.price || !cell.level) return 0
  if (!cell.ownerId) return 0
  
  // 基础过路费
  let baseToll = cell.price / 10
  
  // 根据等级倍数
  const levelMultiplier = [1, 1.5, 2, 3]
  let toll = baseToll * (levelMultiplier[cell.level - 1] || 1)
  
  // 检查技能影响
  if (player.hero) {
    // 刘备：过路费减半
    if (player.hero.skill.effect === 'tollDiscount') {
      toll = Math.floor(toll / 2)
    }
  }
  
  // 检查是否有势力加成（同势力城池）
  const owner = allPlayers.find(p => p.id === cell.ownerId)
  if (owner?.hero && cell.faction === owner.hero.faction) {
    toll = Math.floor(toll * 1.2)
  }
  
  return Math.floor(toll)
}

// 检查是否可以购买城池
export function canBuyCity(
  cell: { type: string; price?: number; ownerId?: string },
  player: { money: number }
): boolean {
  return cell.type === 'city' && 
         !cell.ownerId && 
         cell.price !== undefined &&
         player.money >= cell.price
}

// 检查是否可以升级城池
export function canUpgradeCity(
  cell: { type: string; price?: number; level?: number; ownerId?: string },
  player: { id: string; money: number }
): boolean {
  if (cell.type !== 'city' || cell.ownerId !== player.id) return false
  if (!cell.price || !cell.level) return false
  if (cell.level >= 4) return false
  
  const upgradeCost = Math.floor(cell.price * 0.5)
  return player.money >= upgradeCost
}

// 获取升级费用
export function getUpgradeCost(price: number): number {
  return Math.floor(price * 0.5)
}

// 计算玩家总资产
export function calculateTotalAssets(
  player: { money: number; cities: number[] },
  cells: { id: number; price?: number; level?: number }[]
): number {
  let total = player.money
  
  for (const cityId of player.cities) {
    const cell = cells.find(c => c.id === cityId)
    if (cell?.price && cell?.level) {
      total += cell.price * (cell.level / 2)
    }
  }
  
  return Math.floor(total)
}

// 检查是否破产
export function isBankrupt(
  player: { money: number; cities: number[] }
): boolean {
  return player.money < 0 && player.cities.length === 0
}
