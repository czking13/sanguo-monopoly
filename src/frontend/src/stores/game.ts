import { io, Socket } from 'socket.io-client'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Room, GameState, Player, Card, Hero } from '../types'
import { initialCells, playerColors } from '../data/gameData'
import { heroes } from '../data/heroes'
import { drawCard } from '../data/cards'

export const useGameStore = defineStore('game', () => {
  const room = ref<Room | null>(null)
  const gameState = ref<GameState | null>(null)
  const lastEvent = ref<string>('')
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)
  const myPlayerId = ref<string>('')

  const currentPlayer = computed(() => {
    if (!gameState.value) return null
    return gameState.value.players[gameState.value.currentPlayerIndex]
  })

  const myPlayer = computed(() => {
    if (!gameState.value || !myPlayerId.value) return null
    return gameState.value.players.find(p => p.id === myPlayerId.value)
  })

  // 连接服务器
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
    })

    socket.value.on('error', (message: string) => {
      lastEvent.value = `错误: ${message}`
    })

    socket.value.on('joined', (playerId: string) => {
      myPlayerId.value = playerId
    })
  }

  // 创建房间
  const createRoom = (playerName: string) => {
    if (!socket.value) return
    socket.value.emit('createRoom', { playerName })
  }

  // 加入房间
  const joinRoom = (code: string, playerName: string) => {
    if (!socket.value) return
    socket.value.emit('joinRoom', { code, playerName })
  }

  // 离开房间
  const leaveRoom = () => {
    if (!socket.value) return
    socket.value.emit('leaveRoom')
  }

  // 开始游戏
  const startGame = () => {
    if (!socket.value) return
    socket.value.emit('startGame')
  }

  // 掷骰子
  const rollDice = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('rollDice')
  }

  // 购买城池
  const buyCity = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('buyCity')
  }

  // 升级城池
  const upgradeCity = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('upgradeCity')
  }

  // 使用卡牌
  const useCard = (cardId: string, targetId?: string) => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('useCard', { cardId, targetId })
  }

  // 结束回合
  const endTurn = () => {
    if (!socket.value || !isMyTurn.value) return
    socket.value.emit('endTurn')
  }

  // 是否轮到我
  const isMyTurn = computed(() => {
    if (!gameState.value || !myPlayerId.value) return false
    return gameState.value.players[gameState.value.currentPlayerIndex]?.id === myPlayerId.value
  })

  // 初始化游戏（本地测试模式）
  const initGame = (roomId: string) => {
    const testPlayers: Player[] = [
      {
        id: 'p1',
        name: '玩家1',
        color: playerColors[0],
        money: 10000,
        position: 0,
        cities: [],
        cards: [],
        inPrison: false,
        prisonTurns: 0,
        isOnline: true,
        isBankrupt: false
      },
      {
        id: 'p2',
        name: '玩家2',
        color: playerColors[1],
        money: 10000,
        position: 0,
        cities: [],
        cards: [],
        inPrison: false,
        prisonTurns: 0,
        isOnline: true,
        isBankrupt: false
      }
    ]

    gameState.value = {
      roomId,
      cells: JSON.parse(JSON.stringify(initialCells)),
      players: testPlayers,
      currentPlayerIndex: 0,
      phase: 'roll',
      dice: []
    }

    room.value = {
      id: roomId,
      name: '测试房间',
      code: '123456',
      hostId: 'p1',
      players: testPlayers,
      maxPlayers: 8,
      status: 'playing',
      createdAt: new Date().toISOString()
    }

    myPlayerId.value = 'p1'
    lastEvent.value = '游戏开始！玩家1 先手'
  }

  // 连接到服务器并加入房间
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

  // 本地掷骰子（测试模式）
  const localRollDice = () => {
    if (!gameState.value || gameState.value.phase !== 'roll') return
    
    const dice = Math.floor(Math.random() * 6) + 1
    gameState.value.dice = [dice]
    gameState.value.phase = 'move'
    
    const player = currentPlayer.value
    if (!player) return
    
    const oldPosition = player.position
    player.position = (player.position + dice) % 56
    
    if (player.position < oldPosition) {
      player.money += 2000
      lastEvent.value = `${player.name} 经过起点，获得 2000 金！`
    }
    
    setTimeout(() => {
      if (gameState.value) {
        gameState.value.phase = 'action'
        const cell = gameState.value.cells[player.position]
        
        if (cell.type === 'chance') {
          lastEvent.value = `${player.name} 抽到了锦囊卡！`
        } else if (cell.type === 'destiny') {
          lastEvent.value = `${player.name} 遇到了天命事件！`
        } else if (cell.type === 'prison') {
          player.inPrison = true
          player.prisonTurns = 3
          lastEvent.value = `${player.name} 被关进了监狱！`
        }
      }
    }, 500)
  }

  // 本地购买城池
  const localBuyCity = () => {
    if (!gameState.value || !currentPlayer.value) return
    
    const cell = gameState.value.cells[currentPlayer.value.position]
    if (cell.type !== 'city' || cell.ownerId || !cell.price) return
    
    if (currentPlayer.value.money < cell.price) return
    
    currentPlayer.value.money -= cell.price
    cell.ownerId = currentPlayer.value.id
    cell.level = 1
    currentPlayer.value.cities.push(cell.id)
    
    lastEvent.value = `${currentPlayer.value.name} 购买了 ${cell.name}！`
  }

  // 本地升级城池
  const localUpgradeCity = () => {
    if (!gameState.value || !currentPlayer.value) return
    
    const cell = gameState.value.cells[currentPlayer.value.position]
    if (!cell.price || !cell.level) return
    
    const upgradeCost = Math.floor(cell.price * 0.5)
    if (currentPlayer.value.money < upgradeCost) return
    
    currentPlayer.value.money -= upgradeCost
    cell.level = Math.min(cell.level + 1, 4)
    
    lastEvent.value = `${currentPlayer.value.name} 将 ${cell.name} 升级到 ${cell.level} 级！`
  }

  // 本地使用卡牌
  const localUseCard = (cardId: string) => {
    if (!gameState.value || !currentPlayer.value) return
    
    const cardIndex = currentPlayer.value.cards.findIndex((c: Card) => c.id === cardId)
    if (cardIndex === -1) return
    
    const card = currentPlayer.value.cards.splice(cardIndex, 1)[0]
    lastEvent.value = `${currentPlayer.value.name} 使用了 ${card.name}！`
  }

  // 本地结束回合
  const localEndTurn = () => {
    if (!gameState.value) return
    
    // 检查当前玩家是否破产
    const currentPlayer = gameState.value.players[gameState.value.currentPlayerIndex]
    if (currentPlayer.money < 0) {
      currentPlayer.isBankrupt = true
      gameState.value.lastEvent = `${currentPlayer.name} 破产了！`
    }
    
    // 检查游戏是否结束
    const activePlayers = gameState.value.players.filter(p => !p.isBankrupt)
    if (activePlayers.length === 1) {
      gameState.value.winner = activePlayers[0].id
      gameState.value.phase = 'end'
      gameState.value.lastEvent = `游戏结束！${activePlayers[0].name} 获胜！`
      return
    }
    
    // 切换到下一个玩家
    gameState.value.currentPlayerIndex = 
      (gameState.value.currentPlayerIndex + 1) % gameState.value.players.length
    
    // 跳过破产玩家
    let attempts = 0
    while (gameState.value.players[gameState.value.currentPlayerIndex].isBankrupt && attempts < gameState.value.players.length) {
      gameState.value.currentPlayerIndex = 
        (gameState.value.currentPlayerIndex + 1) % gameState.value.players.length
      attempts++
    }
    
    const nextPlayer = gameState.value.players[gameState.value.currentPlayerIndex]
    gameState.value.phase = 'roll'
    gameState.value.dice = []
    
    // 处理监狱回合
    if (nextPlayer.inPrison) {
      nextPlayer.prisonTurns--
      if (nextPlayer.prisonTurns <= 0) {
        nextPlayer.inPrison = false
        gameState.value.lastEvent = `${nextPlayer.name} 刑满释放！`
      } else {
        gameState.value.lastEvent = `${nextPlayer.name} 还需在狱中 ${nextPlayer.prisonTurns} 回合`
      }
    } else {
      gameState.value.lastEvent = `${nextPlayer.name} 的回合`
    }
  }

  return {
    room,
    gameState,
    currentPlayer,
    myPlayer,
    lastEvent,
    socket,
    isConnected,
    isMyTurn,
    connect,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    rollDice,
    buyCity,
    upgradeCity,
    useCard,
    endTurn,
    // 本地测试模式
    initGame,
    localRollDice,
    localBuyCity,
    localUpgradeCity,
    localUseCard,
    localEndTurn
  }
})
