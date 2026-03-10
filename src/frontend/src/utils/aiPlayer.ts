// AI 玩家逻辑
import type { GameState, Player, Card } from '../types'
import { drawCard } from '../data/cards'

// AI 决策：是否购买城池
export function aiShouldBuyCity(
  player: Player,
  cellPrice: number,
  currentMoney: number
): boolean {
  // 资金充足且价格合理
  if (currentMoney < cellPrice * 1.5) return false
  
  // 根据性格随机决策
  const threshold = player.hero?.id === 'caocao' ? 0.6 : 0.7
  return Math.random() < threshold
}

// AI 决策：是否升级城池
export function aiShouldUpgradeCity(
  player: Player,
  cellPrice: number,
  currentMoney: number,
  currentLevel: number
): boolean {
  if (currentLevel >= 4) return false
  if (currentMoney < cellPrice) return false
  
  // 等级越低越倾向升级
  const probability = (4 - currentLevel) * 0.3
  return Math.random() < probability
}

// AI 决策：是否使用卡牌
export function aiShouldUseCard(
  player: Player,
  card: Card
): { use: boolean; targetId?: string } {
  if (player.cards.length === 0) return { use: false }
  
  // 攻击型卡牌优先使用
  const attackCards = ['damage', 'stealCard', 'stealCity']
  if (attackCards.includes(card.effect)) {
    return { use: Math.random() > 0.3, targetId: undefined }
  }
  
  // 防御型卡牌谨慎使用
  return { use: Math.random() > 0.6 }
}

// AI 自动回合
export function aiTakeTurn(
  gameState: GameState,
  playerId: string
): void {
  const player = gameState.players.find(p => p.id === playerId)
  if (!player || player.isBankrupt) return
  
  // 掷骰子
  const dice = Math.floor(Math.random() * 6) + 1
  gameState.dice = [dice]
  gameState.phase = 'move'
  
  const oldPosition = player.position
  player.position = (player.position + dice) % 56
  
  // 经过起点
  if (player.position < oldPosition) {
    player.money += 2000
  }
  
  // 移动后的处理
  setTimeout(() => {
    gameState.phase = 'action'
    const cell = gameState.cells[player.position]
    
    // 城池：购买或升级
    if (cell.type === 'city') {
      if (!cell.ownerId && cell.price) {
        if (aiShouldBuyCity(player, cell.price, player.money)) {
          player.money -= cell.price
          cell.ownerId = player.id
          cell.level = 1
          player.cities.push(cell.id)
          gameState.lastEvent = `${player.name} 购买了 ${cell.name}！`
        }
      } else if (cell.ownerId === player.id && cell.level && cell.price) {
        if (aiShouldUpgradeCity(player, cell.price, player.money, cell.level)) {
          const cost = Math.floor(cell.price * 0.5)
          player.money -= cost
          cell.level++
          gameState.lastEvent = `${player.name} 升级了 ${cell.name}！`
        }
      }
    }
    
    // 机会卡：抽卡
    if (cell.type === 'chance') {
      const card = drawCard('锦囊')
      player.cards.push(card)
      gameState.lastEvent = `${player.name} 抽到了 ${card.name}！`
      
      // AI 决定是否立即使用
      const decision = aiShouldUseCard(player, card)
      if (decision.use) {
        player.cards.pop()
        gameState.lastEvent = `${player.name} 使用了 ${card.name}！`
      }
    }
    
    // 天命卡
    if (cell.type === 'destiny') {
      const card = drawCard('天命')
      gameState.lastEvent = `${player.name} 遇到了 ${card.name}！`
      
      // 处理天命效果
      if (card.effect === 'gain_money' && card.value) {
        player.money += card.value
      } else if (card.effect === 'lose_money' && card.value) {
        player.money += card.value // value 已经是负数
      } else if (card.effect === 'go_prison') {
        player.inPrison = true
        player.prisonTurns = 3
      }
    }
    
    // 监狱
    if (cell.type === 'prison') {
      player.inPrison = true
      player.prisonTurns = 3
      gameState.lastEvent = `${player.name} 被关进了监狱！`
    }
    
    // 结束回合
    setTimeout(() => {
      // 检查破产
      if (player.money < 0) {
        player.isBankrupt = true
        gameState.lastEvent = `${player.name} 破产了！`
      }
      
      // 检查游戏结束
      const activePlayers = gameState.players.filter(p => !p.isBankrupt)
      if (activePlayers.length === 1) {
        gameState.winner = activePlayers[0].id
        gameState.phase = 'end'
        gameState.lastEvent = `游戏结束！${activePlayers[0].name} 获胜！`
        return
      }
      
      // 切换玩家
      gameState.currentPlayerIndex = 
        (gameState.currentPlayerIndex + 1) % gameState.players.length
      
      while (gameState.players[gameState.currentPlayerIndex].isBankrupt) {
        gameState.currentPlayerIndex = 
          (gameState.currentPlayerIndex + 1) % gameState.players.length
      }
      
      const nextPlayer = gameState.players[gameState.currentPlayerIndex]
      gameState.phase = 'roll'
      gameState.dice = []
      
      // 处理监狱
      if (nextPlayer.inPrison) {
        nextPlayer.prisonTurns--
        if (nextPlayer.prisonTurns <= 0) {
          nextPlayer.inPrison = false
          gameState.lastEvent = `${nextPlayer.name} 刑满释放！`
        } else {
          gameState.lastEvent = `${nextPlayer.name} 还需在狱中 ${nextPlayer.prisonTurns} 回合`
        }
      } else {
        gameState.lastEvent = `${nextPlayer.name} 的回合`
      }
    }, 1000)
  }, 500)
}
