// ============================================
// 游戏状态管理 v1.1
// 集成回合状态机
// ============================================

import { io, Socket } from 'socket.io-client'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Room, GameState, Player, Card, Hero, TurnPhase, PlayerStatus } from '../types'
import { GAME_CONSTANTS } from '../types'
import { initialCells, playerColors } from '../data/gameData'
import { heroes, getHeroById, defaultUnlockedHeroes } from '../data/heroes'
import { getCardById, initJinnangDeck, initTianmingDeck } from '../data/cards'
import { TurnStateMachine } from '../utils/turnStateMachine'
import { 
  calculateToll, 
  calculateGanningToll, 
  calculateStartBonus,
  calculateUpgradeCost,
  calculateSellPrice,
  getAvailableResponseCards
} from '../utils/tollCalculator'

export const useGameStore = defineStore('game', () => {
  // ============================================
  // 状态
  // ============================================
  const room = ref<Room | null>(null)
  const gameState = ref<GameState | null>(null)
  const lastEvent = ref<string>('')
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const myPlayerId = ref<string>('')
  
  // 回合状态机实例
  let turnMachine: TurnStateMachine | null = null

  // ============================================
  // 计算属性
  // ============================================
  
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

  // 当前回合阶段
  const currentPhase = computed((): TurnPhase | null => {
    return gameState.value?.turnPhase || null
  })

  // 是否在加速模式
  const isSpeedMode = computed(() => {
    return gameState.value?.isSpeedMode || false
  })

  // 剩余超时时间（毫秒）
  const remainingTimeout = computed(() => {
    if (!gameState.value?.phaseStartTime || !gameState.value?.phaseTimeout) return null
    const elapsed = Date.now() - gameState.value.phaseStartTime
    return Math.max(0, gameState.value.phaseTimeout - elapsed)
  })

  // ============================================
  // 网络连接
  // ============================================
  
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
      // 重新创建状态机
      if (turnMachine) turnMachine.destroy()
      turnMachine = new TurnStateMachine(gameState.value!)
    })

    socket.value.on('error', (message: string) => {
      lastEvent.value = `错误: ${message}`
    })

    socket.value.on('joined', (playerId: string) => {
      myPlayerId.value = playerId
    })
  }

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

  // ============================================
  // 回合操作（通过状态机）
  // ============================================
  
  const rollDice = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('rollDice')
  }

  const buyCity = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('buyCity')
  }

  const upgradeCity = (cellId?: number) => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('upgradeCity', { cellId })
  }

  const useCard = (cardId: string, targetId?: string) => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('useCard', { cardId, targetId })
  }

  const endTurn = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('endTurn')
  }

  // v1.1 新增：缴纳保释金
  const payBail = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('payBail')
  }

  // v1.1 新增：使用关羽/司马懿技能出狱
  const useHeroEscapeSkill = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('useHeroEscapeSkill')
  }

  // v1.1 新增：弃牌
  const discardCard = (cardId: string) => {
    if (!socket.value) return
    socket.value.emit('discardCard', { cardId })
  }

  // v1.1 新增：响应B类卡
  const respondToCard = (cardId: string, use: boolean) => {
    if (!socket.value) return
    socket.value.emit('respondToCard', { cardId, use })
  }

  // ============================================
  // 本地测试模式
  // ============================================
  
  const initGame = (roomId: string) => {
    const playerCount = 2
    
    // 初始化玩家
    const testPlayers: Player[] = [
      createPlayer('p1', '玩家1', 0, 'caocao'),
      createPlayer('p2', '玩家2', 1, 'liubei'),
    ]

    // 初始化游戏状态
    gameState.value = {
      roomId,
      cells: JSON.parse(JSON.stringify(initialCells)),
      players: testPlayers,
      currentPlayerIndex: 0,
      turnPhase: 'TURN_START',
      globalTurn: 1,
      phase: 'roll',
      dice: [],
      jinnangDeck: initJinnangDeck(),
      tianmingDeck: initTianmingDeck(),
      jinnangDiscard: [],
      tianmingDiscard: [],
      alliances: [],
      isSpeedMode: false,
      speedModeTurn: 0,
    }

    room.value = {
      id: roomId,
      name: '测试房间',
      code: '123456',
      hostId: 'p1',
      players: testPlayers,
      maxPlayers: 8,
      status: 'PLAYING',
      createdAt: new Date().toISOString(),
      currentTurn: 1,
      alliances: [],
    }

    myPlayerId.value = 'p1'
    lastEvent.value = '游戏开始！玩家1 先手'

    // 创建状态机
    if (turnMachine) turnMachine.destroy()
    turnMachine = new TurnStateMachine(gameState.value)
  }

  // 创建玩家
  const createPlayer = (id: string, name: string, colorIndex: number, heroId?: string): Player => {
    const hero = heroId ? getHeroById(heroId) : undefined
    const playerCount = 2 // 测试模式固定2人
    let initialMoney = GAME_CONSTANTS.INITIAL_MONEY[playerCount] || 12000
    
    // 许褚技能：初始资金+2000
    if (hero?.id === 'xuchu') {
      initialMoney += 2000
    }

    return {
      id,
      name,
      color: playerColors[colorIndex % playerColors.length],
      money: initialMoney,
      position: 0, // 起点位置
      hero,
      cities: [],
      cards: [],
      status: 'ACTIVE',
      statusEffects: [],
      heroAbilityUsed: {},
      stats: {
        totalTollPaid: 0,
        totalTollReceived: 0,
        cardsUsed: 0,
        lapCount: 0,
      },
      inPrison: false,
      prisonTurns: 0,
      isOnline: true,
      isBankrupt: false,
      isAI: false,
    }
  }

  // ============================================
  // 本地测试操作
  // ============================================

  const localRollDice = () => {
    if (!gameState.value || gameState.value.turnPhase !== 'ROLL_DICE') return
    if (!turnMachine) return

    const dice = turnMachine.rollDice()
    gameState.value.dice = dice
    
    // 处理骰子结果
    turnMachine.processDiceResult(dice)
    
    lastEvent.value = `掷出 ${dice.join(',')}，移动 ${dice.reduce((a, b) => a + b, 0)} 格`
  }

  const localBuyCity = () => {
    if (!gameState.value || !currentPlayer.value) return
    
    const cell = gameState.value.cells[currentPlayer.value.position]
    if (cell.type !== 'city' || cell.ownerId || !cell.price) return
    
    if (currentPlayer.value.money < cell.price) {
      lastEvent.value = '资金不足，无法购买'
      return
    }
    
    currentPlayer.value.money -= cell.price
    cell.ownerId = currentPlayer.value.id
    cell.level = 1
    currentPlayer.value.cities.push(cell.id)
    
    lastEvent.value = `${currentPlayer.value.name} 购买了 ${cell.name}！`
  }

  const localUpgradeCity = () => {
    if (!gameState.value || !currentPlayer.value) return
    
    const cell = gameState.value.cells[currentPlayer.value.position]
    if (!cell.price || !cell.level || cell.ownerId !== currentPlayer.value.id) {
      lastEvent.value = '无法升级此城池'
      return
    }
    
    const upgradeCost = calculateUpgradeCost(cell)
    if (currentPlayer.value.money < upgradeCost) {
      lastEvent.value = '资金不足，无法升级'
      return
    }
    
    currentPlayer.value.money -= upgradeCost
    cell.level++
    
    lastEvent.value = `${currentPlayer.value.name} 将 ${cell.name} 升级到 ${cell.level} 级！`
  }

  const localUseCard = (cardId: string) => {
    if (!gameState.value || !currentPlayer.value) return
    
    const cardIndex = currentPlayer.value.cards.findIndex((c: Card) => c.id === cardId)
    if (cardIndex === -1) return
    
    const card = currentPlayer.value.cards.splice(cardIndex, 1)[0]
    gameState.value.jinnangDiscard.push(cardId)
    currentPlayer.value.stats.cardsUsed++
    
    lastEvent.value = `${currentPlayer.value.name} 使用了 ${card.name}！`
  }

  const localEndTurn = () => {
    if (!gameState.value || !turnMachine) return
    turnMachine.transitionTo('TURN_END')
    // 状态机的 executeTurnEnd 会自动切换玩家
  }

  const localPayBail = () => {
    if (!turnMachine) return
    const success = turnMachine.payBail()
    if (success) {
      lastEvent.value = '缴纳500金保释金，成功出狱！'
    } else {
      lastEvent.value = '资金不足，无法缴纳保释金'
    }
  }

  const localUseHeroEscapeSkill = () => {
    if (!turnMachine) return
    const success = turnMachine.useHeroEscapeSkill()
    if (success) {
      lastEvent.value = '使用武将技能，成功出狱！'
    }
  }

  // ============================================
  // 过路费计算（本地）
  // ============================================
  
  const calculateMyToll = (cell: any): { visitorPays: number; ownerReceives: number } => {
    if (!myPlayer.value || !cell.ownerId) {
      return { visitorPays: 0, ownerReceives: 0 }
    }

    const owner = gameState.value?.players.find(p => p.id === cell.ownerId)
    if (!owner) return { visitorPays: 0, ownerReceives: 0 }

    // 检查是否结盟
    const isAlliance = gameState.value?.alliances.some(a => 
      (a.player1Id === myPlayer.value!.id && a.player2Id === cell.ownerId) ||
      (a.player2Id === myPlayer.value!.id && a.player1Id === cell.ownerId)
    ) || false

    if (isAlliance) {
      return { visitorPays: 0, ownerReceives: 0 }
    }

    // 甘宁特殊处理
    if (myPlayer.value.hero?.id === 'ganning') {
      return calculateGanningToll(cell, myPlayer.value, owner)
    }

    // 普通过路费
    const result = calculateToll(cell, myPlayer.value, owner)
    return { visitorPays: result.finalToll, ownerReceives: result.finalToll }
  }

  // ============================================
  // B类卡响应
  // ============================================
  
  const getMyResponseCards = (): Card[] => {
    if (!myPlayer.value || !gameState.value) return []
    const otherPlayers = gameState.value.players.filter(p => p.id !== myPlayer.value!.id)
    const cardIds = getAvailableResponseCards(myPlayer.value, otherPlayers)
    return cardIds.map(id => getCardById(id)).filter(Boolean) as Card[]
  }

  // ============================================
  // 连接并加入
  // ============================================
  
  const connectAndJoin = (serverUrl: string, roomCode: string, playerName: string) => {
    connect(serverUrl)
    
    setTimeout(() => {
      if (roomCode) {
        joinRoom(roomCode, playerName)
      } else {
        createRoom(playerName)
      }
    }, 500)
  }

  // ============================================
  // 清理
  // ============================================
  
  const cleanup = () => {
    if (turnMachine) {
      turnMachine.destroy()
      turnMachine = null
    }
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
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
    isSpeedMode,
    remainingTimeout,

    // 网络操作
    connect,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    connectAndJoin,
    
    // 回合操作
    rollDice,
    buyCity,
    upgradeCity,
    useCard,
    endTurn,
    payBail,
    useHeroEscapeSkill,
    discardCard,
    respondToCard,

    // 本地测试模式
    initGame,
    localRollDice,
    localBuyCity,
    localUpgradeCity,
    localUseCard,
    localEndTurn,
    localPayBail,
    localUseHeroEscapeSkill,

    // 计算工具
    calculateMyToll,
    getMyResponseCards,

    // 清理
    cleanup,
  }
})
