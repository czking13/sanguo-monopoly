// ============================================
// 三国大富翁 v1.1 游戏状态管理
// 严格按照 rules.md 和 game-design.md 规范
// ============================================

import { io, Socket } from 'socket.io-client'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Room, 
  GameState, 
  Player, 
  Card, 
  Hero,
  TurnPhase,
  PlayerStatus,
  StatusEffect,
  MapCell,
  GameEvent
} from '../types'
import { GAME_CONSTANTS } from '../types'
import { initialCells, playerColors } from '../data/gameData'
import { heroes, getHeroById } from '../data/heroes'
import { drawJinnangCard, drawTianmingCard } from '../data/cards'
import { 
  TurnStateMachine, 
  createInitialGameState 
} from '../utils/turnStateMachine'
import { 
  calculateToll, 
  calculatePurchasePrice, 
  calculateUpgradeCost,
  getCellUpgradeInfo 
} from '../utils/tollCalculator'

export const useGameStore = defineStore('game', () => {
  // ========== 状态 ==========
  
  const room = ref<Room | null>(null)
  const gameState = ref<GameState | null>(null)
  const lastEvent = ref<string>('')
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const myPlayerId = ref<string>('')
  
  // 回合状态机实例
  let turnMachine: TurnStateMachine | null = null

  // ========== 计算属性 ==========

  const currentPlayer = computed(() => {
    if (!gameState.value) return null
    return gameState.value.players[gameState.value.currentPlayerIndex]
  })

  const myPlayer = computed(() => {
    if (!gameState.value || !myPlayerId.value) return null
    return gameState.value.players.find(p => p.id === myPlayerId.value)
  })

  const isMyTurn = computed(() => {
    if (!gameState.value || !myPlayerId.value) return false
    return gameState.value.players[gameState.value.currentPlayerIndex]?.id === myPlayerId.value
  })

  const currentPhase = computed(() => {
    return gameState.value?.currentPhase || 'TURN_START'
  })

  const activePlayers = computed(() => {
    if (!gameState.value) return []
    return gameState.value.players.filter(p => p.status !== 'BANKRUPT')
  })

  const playerCount = computed(() => activePlayers.value.length)

  // ========== Socket 连接 ==========

  const connect = (serverUrl: string = 'http://localhost:3001') => {
    if (socket.value?.connected) return
    
    socket.value = io(serverUrl, {
      transports: ['websocket', 'polling']
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('已连接到服务器')
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('已断开连接')
    })

    socket.value.on('roomUpdate', (data: Room) => {
      room.value = data
    })

    socket.value.on('gameUpdate', (data: GameState) => {
      gameState.value = data
      // 更新回合状态机
      turnMachine = new TurnStateMachine(data)
    })

    socket.value.on('error', (message: string) => {
      lastEvent.value = `错误: ${message}`
    })

    socket.value.on('joined', (playerId: string) => {
      myPlayerId.value = playerId
    })
  }

  // ========== 房间操作 ==========

  const createRoom = (playerName: string) => {
    if (!socket.value) return
    socket.value.emit('createRoom', { playerName })
  }

  const joinRoom = (code: string, playerName: string) => {
    if (!socket.value) return
    socket.value.emit('joinRoom', { code, playerName })
  }

  const leaveRoom = () => {
    if (!socket.value) return
    socket.value.emit('leaveRoom')
  }

  const startGame = () => {
    if (!socket.value) return
    socket.value.emit('startGame')
  }

  // ========== 游戏操作 ==========

  const rollDice = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('rollDice')
  }

  const buyCity = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('buyCity')
  }

  const upgradeCity = (cellId: number) => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('upgradeCity', { cellId })
  }

  const sellCity = (cellId: number) => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('sellCity', { cellId })
  }

  const useCard = (cardId: string, targetId?: string) => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('useCard', { cardId, targetId })
  }

  const endTurn = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('endTurn')
  }

  const selectHero = (heroId: string) => {
    if (!socket.value) return
    socket.value.emit('selectHero', { heroId })
  }

  const confirmHero = () => {
    if (!socket.value) return
    socket.value.emit('confirmHero')
  }

  // ========== 监狱操作 ==========

  const payBail = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('payBail')
  }

  const rollForRelease = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('rollForRelease')
  }

  const useEscapeSkill = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('useEscapeSkill')
  }

  const stayInPrison = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('stayInPrison')
  }

  // ========== 本地测试模式 ==========

  /**
   * 初始化本地测试游戏
   */
  const initGame = (roomId: string, playerNames: string[] = ['玩家1', '玩家2']) => {
    // 根据人数确定初始资金
    const moneyKey = playerNames.length === 2 ? '2' : 
                     playerNames.length <= 4 ? '3-4' : 
                     playerNames.length <= 6 ? '5-6' : '7-8'
    const startingMoney = GAME_CONSTANTS.STARTING_MONEY[moneyKey]

    // 创建测试玩家
    const testPlayers: Player[] = playerNames.map((name, index) => ({
      id: `p${index + 1}`,
      name,
      color: playerColors[index % playerColors.length],
      money: startingMoney,
      position: 0,
      hero: undefined,
      heroAbilityUsed: {},
      heroAbilityCooldown: {},
      cities: [],
      cards: [],
      status: 'NORMAL' as PlayerStatus,
      statusEffects: [],
      prisonTurns: 0,
      checkpointTurns: 0,
      totalEarned: 0,
      totalSpent: 0,
      passCount: 0,
      isOnline: true,
      isAI: false
    }))

    // 创建游戏状态
    gameState.value = createInitialGameState(
      roomId,
      JSON.parse(JSON.stringify(initialCells)),
      testPlayers
    )

    // 初始化回合状态机
    turnMachine = new TurnStateMachine(gameState.value)

    // 创建房间信息
    room.value = {
      id: roomId,
      name: '测试房间',
      code: '123456',
      hostId: 'p1',
      players: testPlayers,
      maxPlayers: 8,
      status: 'hero_select',
      createdAt: new Date().toISOString(),
      settings: {
        speedMode: false,
        aiPlayers: 0,
        turnTimeout: 30
      }
    }

    myPlayerId.value = 'p1'
    lastEvent.value = '游戏开始！请选择武将'
  }

  /**
   * 本地选择武将
   */
  const localSelectHero = (heroId: string) => {
    if (!myPlayer.value) return
    
    const hero = getHeroById(heroId)
    if (!hero) return
    
    myPlayer.value.hero = hero
    myPlayer.value.heroAbilityUsed = {}
    myPlayer.value.heroAbilityCooldown = {}
    
    // 许褚技能：初始资金+2000
    if (hero.skill.effect === 'startingMoneyBonus') {
      const bonus = hero.skill.params?.bonusAmount as number || 2000
      myPlayer.value.money += bonus
    }
    
    lastEvent.value = `${myPlayer.value.name} 选择了 ${hero.name}`
  }

  /**
   * 本地开始游戏（武将选择完成后）
   */
  const localStartGame = () => {
    if (!gameState.value || !room.value) return
    
    room.value.status = 'playing'
    gameState.value.currentPhase = 'TURN_START'
    
    lastEvent.value = `游戏开始！${currentPlayer.value?.name} 的回合`
  }

  /**
   * 本地掷骰子
   */
  const localRollDice = () => {
    if (!gameState.value || !turnMachine) return
    if (gameState.value.currentPhase !== 'ROLL_DICE') return
    
    // 使用状态机处理掷骰子
    const transition = turnMachine.transition('MOVING', '掷骰子')
    if (!transition) return
    
    // 更新状态
    gameState.value = turnMachine.getState()
    
    const dice = gameState.value.dice
    const total = dice.reduce((a, b) => a + b, 0)
    lastEvent.value = `${currentPlayer.value?.name} 掷出了 ${dice.join('+')} = ${total}`
  }

  /**
   * 本地购买城池
   */
  const localBuyCity = () => {
    if (!gameState.value || !currentPlayer.value) return
    
    const cell = gameState.value.cells[currentPlayer.value.position]
    if (cell.type !== 'city' || cell.ownerId) return
    
    // 计算购买价格（含势力折扣）
    const { price, breakdown } = calculatePurchasePrice(cell, currentPlayer.value)
    
    if (currentPlayer.value.money < price) {
      lastEvent.value = `资金不足，无法购买 ${cell.name}`
      return
    }
    
    currentPlayer.value.money -= price
    currentPlayer.value.totalSpent += price
    cell.ownerId = currentPlayer.value.id
    cell.level = 1
    currentPlayer.value.cities.push(cell.id)
    
    lastEvent.value = `${currentPlayer.value.name} 购买了 ${cell.name}！${breakdown.join('，')}`
  }

  /**
   * 本地升级城池
   */
  const localUpgradeCity = (cellId?: number) => {
    if (!gameState.value || !currentPlayer.value) return
    
    const targetCellId = cellId ?? currentPlayer.value.position
    const cell = gameState.value.cells[targetCellId]
    
    if (!cell || cell.ownerId !== currentPlayer.value.id) return
    if (cell.level && cell.level >= 5) {
      lastEvent.value = `${cell.name} 已满级`
      return
    }
    
    const upgradeCost = calculateUpgradeCost(cell)
    
    if (currentPlayer.value.money < upgradeCost) {
      lastEvent.value = `资金不足，无法升级`
      return
    }
    
    currentPlayer.value.money -= upgradeCost
    currentPlayer.value.totalSpent += upgradeCost
    cell.level = (cell.level || 1) + 1
    
    lastEvent.value = `${currentPlayer.value.name} 将 ${cell.name} 升级到 ${cell.level} 级！`
  }

  /**
   * 本地出售城池
   */
  const localSellCity = (cellId: number) => {
    if (!gameState.value || !currentPlayer.value) return
    
    const cell = gameState.value.cells[cellId]
    if (!cell || cell.ownerId !== currentPlayer.value.id) return
    
    const { sellPrice } = getCellUpgradeInfo(cell)
    
    currentPlayer.value.money += sellPrice
    currentPlayer.value.totalEarned += sellPrice
    cell.ownerId = undefined
    cell.level = undefined
    currentPlayer.value.cities = currentPlayer.value.cities.filter(id => id !== cellId)
    
    lastEvent.value = `${currentPlayer.value.name} 出售了 ${cell.name}，获得 ${sellPrice} 金`
  }

  /**
   * 本地使用卡牌
   */
  const localUseCard = (cardId: string, targetId?: string) => {
    if (!gameState.value || !currentPlayer.value) return
    
    const cardIndex = currentPlayer.value.cards.findIndex(c => c.id === cardId)
    if (cardIndex === -1) return
    
    const card = currentPlayer.value.cards.splice(cardIndex, 1)[0]
    
    // TODO: 实现卡牌效果
    lastEvent.value = `${currentPlayer.value.name} 使用了 ${card.name}！`
  }

  /**
   * 本地结束回合
   */
  const localEndTurn = () => {
    if (!gameState.value || !turnMachine) return
    
    // 使用状态机处理回合结束
    const transition = turnMachine.transition('TURN_END', '玩家主动结束')
    if (!transition) return
    
    // 更新状态
    gameState.value = turnMachine.getState()
    
    const nextPlayer = currentPlayer.value
    lastEvent.value = `${nextPlayer?.name} 的回合`
  }

  /**
   * 本地支付过路费
   */
  const localPayToll = () => {
    if (!gameState.value || !currentPlayer.value) return
    
    const cell = gameState.value.cells[currentPlayer.value.position]
    if (cell.type !== 'city' || !cell.ownerId || cell.ownerId === currentPlayer.value.id) return
    
    const owner = gameState.value.players.find(p => p.id === cell.ownerId)
    if (!owner) return
    
    // 计算过路费
    const tollResult = calculateToll(cell, owner, currentPlayer.value, [])
    const toll = tollResult.finalToll
    
    if (currentPlayer.value.money < toll) {
      // 资金不足，需要出售城池或破产
      lastEvent.value = `资金不足支付过路费 ${toll} 金！`
      return
    }
    
    currentPlayer.value.money -= toll
    currentPlayer.value.totalSpent += toll
    owner.money += toll
    owner.totalEarned += toll
    
    lastEvent.value = `${currentPlayer.value.name} 向 ${owner.name} 支付了 ${toll} 金过路费`
  }

  /**
   * 本地抽取锦囊卡
   */
  const localDrawJinnangCard = () => {
    if (!gameState.value || !currentPlayer.value) return
    
    // 检查手牌上限
    if (currentPlayer.value.cards.length >= GAME_CONSTANTS.MAX_HAND_CARDS) {
      lastEvent.value = `手牌已满，无法抽取`
      return
    }
    
    const card = drawJinnangCard()
    currentPlayer.value.cards.push(card)
    
    lastEvent.value = `${currentPlayer.value.name} 抽到了 ${card.name}`
  }

  /**
   * 本地触发天命卡
   */
  const localTriggerFateCard = () => {
    if (!gameState.value || !currentPlayer.value) return
    
    const card = drawTianmingCard()
    
    // TODO: 实现天命卡效果
    lastEvent.value = `${currentPlayer.value.name} 遇到了 ${card.name}：${card.description}`
  }

  // ========== 辅助方法 ==========

  /**
   * 获取当前回合阶段描述
   */
  const getPhaseDescription = computed(() => {
    const phase = currentPhase.value
    const descriptions: Record<TurnPhase, string> = {
      'TURN_START': '回合开始',
      'LOCKED': '状态判定',
      'ROLL_DICE': '掷骰子',
      'MOVING': '移动中',
      'LANDING': '落点触发',
      'CARD_ACTION': '使用卡牌',
      'UPGRADE_ACTION': '升级城池',
      'TURN_END': '回合结束'
    }
    return descriptions[phase] || phase
  })

  /**
   * 获取当前格子的信息
   */
  const currentCell = computed(() => {
    if (!gameState.value || !currentPlayer.value) return null
    return gameState.value.cells[currentPlayer.value.position]
  })

  /**
   * 检查是否可以执行某个操作
   */
  const canPerformAction = (action: string): boolean => {
    if (!isMyTurn.value) return false
    
    const phase = currentPhase.value
    
    switch (action) {
      case 'roll':
        return phase === 'ROLL_DICE'
      case 'buy':
        return phase === 'LANDING' && currentCell.value?.type === 'city' && !currentCell.value?.ownerId
      case 'upgrade':
        return ['LANDING', 'UPGRADE_ACTION'].includes(phase)
      case 'useCard':
        return phase === 'CARD_ACTION'
      case 'endTurn':
        return ['CARD_ACTION', 'UPGRADE_ACTION', 'LANDING'].includes(phase)
      default:
        return false
    }
  }

  return {
    // 状态
    room,
    gameState,
    currentPlayer,
    myPlayer,
    lastEvent,
    socket,
    isConnected,
    isMyTurn,
    currentPhase,
    activePlayers,
    playerCount,
    currentCell,
    getPhaseDescription,
    
    // Socket 操作
    connect,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    
    // 游戏操作
    rollDice,
    buyCity,
    upgradeCity,
    sellCity,
    useCard,
    endTurn,
    selectHero,
    confirmHero,
    
    // 监狱操作
    payBail,
    rollForRelease,
    useEscapeSkill,
    stayInPrison,
    
    // 本地测试模式
    initGame,
    localSelectHero,
    localStartGame,
    localRollDice,
    localBuyCity,
    localUpgradeCity,
    localSellCity,
    localUseCard,
    localEndTurn,
    localPayToll,
    localDrawJinnangCard,
    localTriggerFateCard,
    
    // 辅助方法
    canPerformAction
  }
})
