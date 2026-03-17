// ============================================
// 三国大富翁 v1.1 回合状态机
// 严格按照 rules.md 规范实现8步精确流转
// ============================================

import type { 
  TurnPhase, 
  PlayerStatus, 
  GameState, 
  Player,
  GameEvent,
  TurnTransition
} from '../types'
import { GAME_CONSTANTS } from '../types'

// ========== 状态转换映射 ==========

// 定义合法的状态转换
const VALID_TRANSITIONS: Record<TurnPhase, TurnPhase[]> = {
  'TURN_START': ['LOCKED'],
  'LOCKED': ['ROLL_DICE', 'TURN_END'],  // 被跳过时直接结束
  'ROLL_DICE': ['MOVING'],
  'MOVING': ['LANDING'],
  'LANDING': ['CARD_ACTION', 'UPGRADE_ACTION', 'TURN_END'],  // 根据落点决定
  'CARD_ACTION': ['UPGRADE_ACTION', 'TURN_END'],
  'UPGRADE_ACTION': ['TURN_END'],
  'TURN_END': ['TURN_START']  // 下一位玩家
}

// ========== 回合状态机类 ==========

export class TurnStateMachine {
  private state: GameState
  
  constructor(gameState: GameState) {
    this.state = gameState
  }

  // ========== 状态查询 ==========

  getCurrentPhase(): TurnPhase {
    return this.state.currentPhase
  }

  getCurrentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex]
  }

  canTransitionTo(nextPhase: TurnPhase): boolean {
    const current = this.state.currentPhase
    return VALID_TRANSITIONS[current]?.includes(nextPhase) ?? false
  }

  // ========== 状态转换 ==========

  /**
   * 执行状态转换
   * @param nextPhase 目标阶段
   * @param reason 转换原因
   * @returns 转换是否成功
   */
  transition(nextPhase: TurnPhase, reason: string): TurnTransition | null {
    if (!this.canTransitionTo(nextPhase)) {
      console.warn(`Invalid transition: ${this.state.currentPhase} -> ${nextPhase}`)
      return null
    }

    const from = this.state.currentPhase
    this.state.currentPhase = nextPhase

    const transition: TurnTransition = {
      from,
      to: nextPhase,
      reason,
      actions: []
    }

    // 执行阶段特定的逻辑
    this.executePhaseLogic(nextPhase, transition)

    return transition
  }

  // ========== 阶段逻辑 ==========

  /**
   * 执行各阶段的业务逻辑
   */
  private executePhaseLogic(phase: TurnPhase, transition: TurnTransition): void {
    switch (phase) {
      case 'TURN_START':
        this.handleTurnStart(transition)
        break
      case 'LOCKED':
        this.handleLocked(transition)
        break
      case 'ROLL_DICE':
        this.handleRollDice(transition)
        break
      case 'MOVING':
        this.handleMoving(transition)
        break
      case 'LANDING':
        this.handleLanding(transition)
        break
      case 'CARD_ACTION':
        this.handleCardAction(transition)
        break
      case 'UPGRADE_ACTION':
        this.handleUpgradeAction(transition)
        break
      case 'TURN_END':
        this.handleTurnEnd(transition)
        break
    }
  }

  // ========== 各阶段处理 ==========

  /**
   * 1. 回合开始
   * - 结算持续效果（乐不思蜀等）
   * - 触发回合开始技能（荀彧筹谋等）
   */
  private handleTurnStart(transition: TurnTransition): void {
    const player = this.getCurrentPlayer()
    
    // 结算状态效果
    this.processStatusEffects(player, transition)
    
    // 触发回合开始技能
    this.triggerTurnStartSkills(player, transition)
    
    // 更新监狱状态（在监狱中的玩家，等待回合+1）
    if (this.isInJail(player)) {
      this.updateJailStatus(player)
    }
  }

  /**
   * 2. 判定是否被跳过
   * - 乐不思蜀：跳过本回合
   * - 关卡停留：检查是否需要停留
   */
  private handleLocked(transition: TurnTransition): void {
    const player = this.getCurrentPlayer()
    
    // 检查乐不思蜀
    const lebusisuEffect = player.statusEffects.find(e => e.type === 'LE_BU_SI_SHU')
    if (lebusisuEffect) {
      // 跳过本回合
      transition.actions.push({
        type: 'SKIP_TURN',
        data: { reason: '乐不思蜀' }
      })
      // 减少效果持续回合
      lebusisuEffect.remainingTurns--
      if (lebusisuEffect.remainingTurns <= 0) {
        player.statusEffects = player.statusEffects.filter(e => e !== lebusisuEffect)
      }
      // 直接跳到回合结束
      this.transition('TURN_END', '乐不思蜀跳过')
      return
    }
    
    // 检查关卡停留
    if (player.status === 'CHECKPOINT_WAIT') {
      if (player.checkpointTurns > 0) {
        player.checkpointTurns--
        transition.actions.push({
          type: 'CHECKPOINT_WAIT',
          data: { remainingTurns: player.checkpointTurns }
        })
        if (player.checkpointTurns > 0) {
          this.transition('TURN_END', '关卡停留中')
          return
        }
      }
    }
    
    // 正常进入掷骰子阶段
    this.transition('ROLL_DICE', '正常行动')
  }

  /**
   * 3. 掷骰子
   * - 2-4人局：2颗骰子（2-12点）
   * - 5-8人局：1颗骰子（1-6点）
   * - 武将技能加成（张辽+1、太史慈2-7）
   */
  private handleRollDice(transition: TurnTransition): void {
    const player = this.getCurrentPlayer()
    const playerCount = this.state.players.filter(p => p.status !== 'BANKRUPT').length
    
    // 根据人数决定骰子数量
    const diceCount = playerCount <= 4 ? 2 : 1
    const dice: number[] = []
    
    // 掷骰子
    for (let i = 0; i < diceCount; i++) {
      let roll = Math.floor(Math.random() * 6) + 1
      
      // 武将技能：太史慈（骰子范围2-7）
      if (player.hero?.skill.effect === 'diceRangeChange') {
        roll = Math.floor(Math.random() * 6) + 2 // 2-7
      }
      
      dice.push(roll)
    }
    
    // 武将技能：张辽（骰子+1）
    if (player.hero?.skill.effect === 'diceBonus') {
      const bonus = player.hero.skill.params?.bonus as number || 1
      dice[0] = Math.min(dice[0] + bonus, diceCount === 2 ? 12 : 6)
    }
    
    // 加速模式加成
    if (this.state.speedModeActive) {
      dice[0] = Math.min(dice[0] + 2, diceCount === 2 ? 14 : 8)
    }
    
    this.state.dice = dice
    transition.actions.push({
      type: 'DICE_ROLLED',
      data: { dice, total: dice.reduce((a, b) => a + b, 0) }
    })
  }

  /**
   * 4. 移动中
   * - 按骰子点数逐格移动
   * - 经过起点获得2000金（+武将加成）
   */
  private handleMoving(transition: TurnTransition): void {
    const player = this.getCurrentPlayer()
    const totalSteps = this.state.dice.reduce((a, b) => a + b, 0)
    const mapSize = this.state.cells.length
    
    let currentPos = player.position
    let passedStart = false
    
    for (let i = 0; i < totalSteps; i++) {
      currentPos = (currentPos + 1) % mapSize
      
      // 检查是否经过起点（位置0）
      if (currentPos === 0) {
        passedStart = true
      }
    }
    
    player.position = currentPos
    
    // 经过起点奖励
    if (passedStart) {
      const playerCount = this.state.players.filter(p => p.status !== 'BANKRUPT').length
      let bonus = playerCount <= 4 
        ? GAME_CONSTANTS.PASS_START_BONUS['2-4']
        : playerCount <= 6 
          ? GAME_CONSTANTS.PASS_START_BONUS['5-6']
          : GAME_CONSTANTS.PASS_START_BONUS['7-8']
      
      // 曹操技能：起点加成15%
      if (player.hero?.skill.effect === 'startBonus') {
        const bonusRate = player.hero.skill.params?.bonusRate as number || 0.15
        bonus = Math.floor(bonus * (1 + bonusRate))
      }
      
      player.money += bonus
      player.passCount++
      player.totalEarned += bonus
      
      transition.actions.push({
        type: 'PASS_START',
        data: { bonus, totalPasses: player.passCount }
      })
    }
    
    transition.actions.push({
      type: 'MOVE_COMPLETE',
      data: { newPosition: player.position }
    })
  }

  /**
   * 5. 落点触发
   * - 城池：购买/过路费
   * - 锦囊：抽卡
   * - 天命：触发效果
   * - 关卡：停留判定
   * - 监狱/休息：特殊处理
   */
  private handleLanding(transition: TurnTransition): void {
    const player = this.getCurrentPlayer()
    const cell = this.state.cells[player.position]
    
    transition.actions.push({
      type: 'LAND_ON_CELL',
      data: { cellId: cell.id, cellName: cell.name, cellType: cell.type }
    })
    
    switch (cell.type) {
      case 'city':
        this.handleCityLanding(player, cell, transition)
        break
      case 'chance':
        // 抽取锦囊卡 - 在CARD_ACTION阶段处理
        transition.actions.push({ type: 'DRAW_JINNANG' })
        break
      case 'destiny':
        // 触发天命卡 - 立即生效
        transition.actions.push({ type: 'TRIGGER_FATE' })
        break
      case 'checkpoint':
        this.handleCheckpointLanding(player, cell, transition)
        break
      case 'prison':
        // 踩到监狱格，入狱
        this.handlePrisonLanding(player, transition)
        break
      case 'start':
        // 起点格，已在移动阶段处理
        break
      case 'rest':
        // 休息格，无效果
        break
    }
  }

  /**
   * 处理城池落点
   */
  private handleCityLanding(player: Player, cell: any, transition: TurnTransition): void {
    if (!cell.ownerId) {
      // 无主城池，可购买
      transition.actions.push({
        type: 'CAN_BUY_CITY',
        data: { cellId: cell.id, price: cell.price }
      })
    } else if (cell.ownerId === player.id) {
      // 自己的城池，可升级
      if (cell.level < 5) {
        transition.actions.push({
          type: 'CAN_UPGRADE_CITY',
          data: { cellId: cell.id, currentLevel: cell.level }
        })
      }
    } else {
      // 他人城池，需支付过路费
      transition.actions.push({
        type: 'PAY_TOLL_REQUIRED',
        data: { cellId: cell.id, ownerId: cell.ownerId }
      })
    }
  }

  /**
   * 处理关卡落点
   */
  private handleCheckpointLanding(player: Player, cell: any, transition: TurnTransition): void {
    const playerCount = this.state.players.filter(p => p.status !== 'BANKRUPT').length
    
    // 5人以上直接通过
    if (playerCount >= 5) {
      transition.actions.push({
        type: 'CHECKPOINT_PASS',
        data: { reason: '5人以上局直接通过' }
      })
      return
    }
    
    // 检查武将是否可免
    const hero = player.hero
    const region = cell.region
    
    let exempt = false
    if (hero?.faction === '魏' && region === '北方') exempt = true
    if (hero?.faction === '蜀' && region === '蜀地') exempt = true
    if (hero?.faction === '吴' && region === '江东') exempt = true
    
    if (exempt) {
      transition.actions.push({
        type: 'CHECKPOINT_EXEMPT',
        data: { reason: `${hero.faction}将免关卡` }
      })
    } else {
      // 需要停留
      player.status = 'CHECKPOINT_WAIT'
      player.checkpointTurns = GAME_CONSTANTS.CHECKPOINT_WAIT_TURNS
      transition.actions.push({
        type: 'CHECKPOINT_STOP',
        data: { turns: player.checkpointTurns }
      })
    }
  }

  /**
   * 处理监狱落点
   */
  private handlePrisonLanding(player: Player, transition: TurnTransition): void {
    // 司马懿/关羽技能检查
    if (player.hero?.skill.effect === 'instantJailEscape' || 
        player.hero?.skill.effect === 'freeJailEscape') {
      const usedKey = `${player.hero.id}_escape`
      if (!player.heroAbilityUsed[usedKey]) {
        transition.actions.push({
          type: 'CAN_USE_ESCAPE_SKILL',
          data: { heroId: player.hero.id }
        })
        return
      }
    }
    
    // 入狱
    player.status = 'IN_JAIL'
    player.prisonTurns = 0
    transition.actions.push({
      type: 'ENTER_JAIL',
      data: { playerId: player.id }
    })
  }

  /**
   * 6. 可使用A类锦囊卡
   */
  private handleCardAction(transition: TurnTransition): void {
    const player = this.getCurrentPlayer()
    
    // 检查是否有可用的A类卡
    const usableCards = player.cards.filter(c => c.category === 'A')
    
    if (usableCards.length > 0) {
      transition.actions.push({
        type: 'CAN_USE_CARD',
        data: { cards: usableCards.map(c => c.id) }
      })
    }
  }

  /**
   * 7. 可升级城池
   */
  private handleUpgradeAction(transition: TurnTransition): void {
    const player = this.getCurrentPlayer()
    
    // 获取可升级的城池
    const upgradableCities = player.cities.map(cityId => {
      const cell = this.state.cells[cityId]
      return cell.level < 5 ? cityId : null
    }).filter(Boolean)
    
    if (upgradableCities.length > 0) {
      transition.actions.push({
        type: 'CAN_UPGRADE',
        data: { cities: upgradableCities }
      })
    }
  }

  /**
   * 8. 回合结束
   * - 手牌检查（超过5张需弃牌）
   * - 监狱状态流转
   * - 触发回合结束技能（孙权制衡等）
   */
  private handleTurnEnd(transition: TurnTransition): void {
    const player = this.getCurrentPlayer()
    
    // 手牌检查
    if (player.cards.length > GAME_CONSTANTS.MAX_HAND_CARDS) {
      transition.actions.push({
        type: 'MUST_DISCARD_CARD',
        data: { 
          currentCount: player.cards.length,
          maxCount: GAME_CONSTANTS.MAX_HAND_CARDS,
          discardCount: player.cards.length - GAME_CONSTANTS.MAX_HAND_CARDS
        }
      })
    }
    
    // 触发回合结束技能
    this.triggerTurnEndSkills(player, transition)
    
    // 更新状态效果持续回合
    player.statusEffects.forEach(effect => {
      effect.remainingTurns--
    })
    player.statusEffects = player.statusEffects.filter(e => e.remainingTurns > 0)
    
    // 传递回合给下一位玩家
    this.passTurnToNextPlayer()
  }

  // ========== 辅助方法 ==========

  private isInJail(player: Player): boolean {
    return ['IN_JAIL', 'JAILED_WAIT_1', 'JAILED_WAIT_2', 'JAILED_WAIT_3'].includes(player.status)
  }

  private updateJailStatus(player: Player): void {
    const statusFlow: Record<PlayerStatus, PlayerStatus> = {
      'IN_JAIL': 'JAILED_WAIT_1',
      'JAILED_WAIT_1': 'JAILED_WAIT_2',
      'JAILED_WAIT_2': 'JAILED_WAIT_3',
      'JAILED_WAIT_3': 'JAILED_WAIT_3' // 强制缴费
    }
    player.status = statusFlow[player.status] || player.status
    player.prisonTurns++
  }

  private processStatusEffects(player: Player, transition: TurnTransition): void {
    player.statusEffects.forEach(effect => {
      switch (effect.type) {
        case 'LE_BU_SI_SHU':
          transition.actions.push({
            type: 'STATUS_EFFECT',
            data: { effect: '乐不思蜀', remainingTurns: effect.remainingTurns }
          })
          break
        case 'ALLIANCE':
          transition.actions.push({
            type: 'STATUS_EFFECT',
            data: { effect: '结盟', with: effect.source, remainingTurns: effect.remainingTurns }
          })
          break
      }
    })
  }

  private triggerTurnStartSkills(player: Player, transition: TurnTransition): void {
    if (!player.hero) return
    
    // 荀彧：每回合+100金
    if (player.hero.skill.effect === 'turnEndBonus') {
      const bonus = player.hero.skill.params?.bonusAmount as number || 100
      player.money += bonus
      player.totalEarned += bonus
      transition.actions.push({
        type: 'HERO_SKILL_TRIGGER',
        data: { hero: player.hero.name, skill: player.hero.skill.name, bonus }
      })
    }
    
    // 鲁肃：每回合+50金
    if (player.hero.skill.effect === 'incomeAndLend') {
      const bonus = player.hero.skill.params?.turnBonus as number || 50
      player.money += bonus
      player.totalEarned += bonus
      transition.actions.push({
        type: 'HERO_SKILL_TRIGGER',
        data: { hero: player.hero.name, skill: player.hero.skill.name, bonus }
      })
    }
  }

  private triggerTurnEndSkills(player: Player, transition: TurnTransition): void {
    // 孙权制衡等回合结束技能
    // 在实际游戏中由玩家主动触发
  }

  private passTurnToNextPlayer(): void {
    const activePlayers = this.state.players.filter(p => p.status !== 'BANKRUPT')
    
    // 找到下一位未破产的玩家
    let nextIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length
    let attempts = 0
    
    while (this.state.players[nextIndex].status === 'BANKRUPT' && attempts < this.state.players.length) {
      nextIndex = (nextIndex + 1) % this.state.players.length
      attempts++
    }
    
    this.state.currentPlayerIndex = nextIndex
    this.state.turnNumber++
    
    // 检查是否触发加速模式
    if (this.state.turnNumber >= GAME_CONSTANTS.SPEED_MODE_TURN) {
      this.state.speedModeActive = true
    }
  }

  // ========== 导出状态 ==========

  getState(): GameState {
    return this.state
  }
}

// ========== 工具函数 ==========

/**
 * 创建新的游戏状态
 */
export function createInitialGameState(roomId: string, cells: any[], players: Player[]): GameState {
  return {
    roomId,
    cells,
    players,
    currentPlayerIndex: 0,
    currentPhase: 'TURN_START',
    turnNumber: 1,
    dice: [],
    diceRolling: false,
    speedModeActive: false
  }
}

/**
 * 验证回合阶段是否有效
 */
export function isValidPhase(phase: string): phase is TurnPhase {
  return [
    'TURN_START',
    'LOCKED', 
    'ROLL_DICE',
    'MOVING',
    'LANDING',
    'CARD_ACTION',
    'UPGRADE_ACTION',
    'TURN_END'
  ].includes(phase)
}
