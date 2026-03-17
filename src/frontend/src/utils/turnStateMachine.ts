// ============================================
// 回合状态机 v1.1
// 根据 game-design-v1.1.md 的8步精确流转
// ============================================

import type { 
  GameState, 
  Player, 
  TurnPhase, 
  PlayerStatus,
  StatusEffect,
  Card 
} from '../types'
import { GAME_CONSTANTS } from '../types'

const { TIMEOUT } = GAME_CONSTANTS

/**
 * 回合状态机
 * 
 * 流转顺序：
 * TURN_START → LOCKED → (IN_JAIL ? JAIL_ACTION : ROLL_DICE) → MOVING → LANDING → 
 * CARD_ACTION → UPGRADE_ACTION → TURN_END → [下一玩家] → TURN_START
 */
export class TurnStateMachine {
  private state: GameState
  private timeouts: Map<string, NodeJS.Timeout> = new Map()

  constructor(gameState: GameState) {
    this.state = gameState
  }

  /**
   * 获取当前回合阶段
   */
  getCurrentPhase(): TurnPhase {
    return this.state.turnPhase
  }

  /**
   * 获取当前玩家
   */
  getCurrentPlayer(): Player | null {
    return this.state.players[this.state.currentPlayerIndex] || null
  }

  /**
   * 转换到下一阶段
   */
  transitionTo(phase: TurnPhase): void {
    const previousPhase = this.state.turnPhase
    this.state.turnPhase = phase
    this.state.phaseStartTime = Date.now()
    
    // 清除之前的超时
    this.clearTimeout('phase')
    
    // 设置新阶段的超时
    this.setupPhaseTimeout(phase)
    
    console.log(`[TurnStateMachine] ${previousPhase} → ${phase}`)
  }

  /**
   * 设置阶段超时
   */
  private setupPhaseTimeout(phase: TurnPhase): void {
    let timeoutMs: number | undefined
    
    switch (phase) {
      case 'ROLL_DICE':
        timeoutMs = TIMEOUT.ROLL_DICE
        break
      case 'CARD_ACTION':
        timeoutMs = TIMEOUT.USE_CARD
        break
      case 'UPGRADE_ACTION':
        timeoutMs = TIMEOUT.UPGRADE
        break
      case 'JAIL_ACTION':
        timeoutMs = TIMEOUT.JAIL_ACTION
        break
      default:
        timeoutMs = undefined
    }
    
    if (timeoutMs) {
      this.state.phaseTimeout = timeoutMs
      this.setTimeout('phase', () => this.handlePhaseTimeout(phase), timeoutMs)
    }
  }

  /**
   * 处理阶段超时
   */
  private handlePhaseTimeout(phase: TurnPhase): void {
    console.log(`[TurnStateMachine] Phase ${phase} timeout`)
    
    switch (phase) {
      case 'ROLL_DICE':
        // 自动掷骰
        this.autoRollDice()
        break
      case 'CARD_ACTION':
        // 跳过使用卡牌
        this.transitionTo('UPGRADE_ACTION')
        break
      case 'UPGRADE_ACTION':
        // 跳过升级
        this.transitionTo('TURN_END')
        this.executeTurnEnd()
        break
      case 'JAIL_ACTION':
        // 继续蹲狱
        this.handleJailWait()
        break
    }
  }

  /**
   * ============================================
   * ① TURN_START - 回合开始阶段
   * ============================================
   */
  executeTurnStart(): void {
    this.transitionTo('TURN_START')
    const player = this.getCurrentPlayer()
    if (!player) return

    // 1. 扣除/更新持续性负面效果
    this.updateStatusEffects(player)

    // 2. 触发「回合开始」被动技能
    this.triggerTurnStartSkills(player)

    // 进入下一阶段
    this.transitionTo('LOCKED')
    this.executeLocked()
  }

  /**
   * 更新持续效果
   */
  private updateStatusEffects(player: Player): void {
    player.statusEffects = player.statusEffects.filter(effect => {
      effect.remainingTurns--
      
      if (effect.remainingTurns <= 0) {
        // 效果结束
        console.log(`[Effect] ${player.name} 的 ${effect.type} 效果结束`)
        return false
      }
      return true
    })
  }

  /**
   * 触发回合开始技能
   */
  private triggerTurnStartSkills(player: Player): void {
    const heroId = player.hero?.id
    
    // 荀彧：每回合+100金
    if (heroId === 'xunyu') {
      player.money += 100
      console.log(`[Skill] 荀彧「筹谋」：${player.name} +100金`)
    }
    
    // 鲁肃：每回合+50金（v1.1 新增）
    if (heroId === 'lusu') {
      player.money += 50
      console.log(`[Skill] 鲁肃「慷慨」：${player.name} +50金`)
    }
  }

  /**
   * ============================================
   * ② LOCKED - 入狱状态检查
   * ============================================
   */
  executeLocked(): void {
    const player = this.getCurrentPlayer()
    if (!player) return

    // 检查是否被美人计跳过
    if (player.status === 'BLOCKED') {
      console.log(`[Turn] ${player.name} 被美人计跳过`)
      // 注意：根据 rules-v1.1.md，被跳过的回合：
      // - 荀彧/鲁肃技能正常触发（步骤①正常）
      // - 入狱等待仍计数（在 executeTurnEnd 中推进）
      // - 但步骤②-⑦跳过
      this.transitionTo('TURN_END')
      this.executeTurnEnd()
      return
    }

    // 检查是否在关卡停留
    if (player.status === 'CHECKPOINT_WAIT') {
      console.log(`[Turn] ${player.name} 关卡停留结束`)
      player.status = 'ACTIVE'
    }

    // 检查入狱状态
    if (this.isInJail(player)) {
      this.transitionTo('JAIL_ACTION')
      this.executeJailAction()
      return
    }

    // 正常流程
    this.transitionTo('ROLL_DICE')
  }

  /**
   * 检查玩家是否在监狱
   */
  private isInJail(player: Player): boolean {
    return ['IN_JAIL', 'JAILED_WAIT_1', 'JAILED_WAIT_2', 'JAILED_WAIT_3'].includes(player.status)
  }

  /**
   * ============================================
   * JAIL_ACTION - 入狱操作
   * ============================================
   * 
   * 监狱回合计数规则（rules-v1.1.md §6.2）：
   * - 进入监狱的回合不计入监狱等待次数（入狱当回合直接结束）
   * - 第 1 回合：JAILED_WAIT_1
   * - 第 2 回合：JAILED_WAIT_2
   * - 第 3 回合：JAILED_WAIT_3（必须缴费500出狱）
   * 
   * 关羽、司马懿技能：可在任意等待回合使用，免费出狱
   */
  executeJailAction(): void {
    const player = this.getCurrentPlayer()
    if (!player) return

    const jailStatus = player.status as PlayerStatus
    
    // 第3回合必须缴费
    if (jailStatus === 'JAILED_WAIT_3') {
      if (player.money >= GAME_CONSTANTS.BAIL_AMOUNT) {
        player.money -= GAME_CONSTANTS.BAIL_AMOUNT
        this.releaseFromJail(player)
        console.log(`[Jail] ${player.name} 强制缴费出狱`)
        this.transitionTo('ROLL_DICE')
      } else {
        // 资金不足，触发强制出售流程
        console.log(`[Jail] ${player.name} 资金不足，无法缴费`)
        this.transitionTo('TURN_END')
        this.executeTurnEnd()
      }
      return
    }

    // 检查关羽/司马懿技能（每局限1次）
    if (player.hero?.id === 'guanyu' || player.hero?.id === 'simayi') {
      const abilityKey = player.hero.id === 'guanyu' ? 'guanyu_escape' : 'simayi_yinren'
      if (!player.heroAbilityUsed[abilityKey]) {
        // 前端弹窗询问是否使用技能
        console.log(`[Skill] ${player.hero.id === 'guanyu' ? '关羽「过五关斩六将」' : '司马懿「隐忍」'}：可免费出狱`)
        // 等待前端响应
        return
      }
    }

    // 等待玩家操作：缴费/掷骰（双骰局）/等待
    // 由前端触发相应操作
  }

  /**
   * 处理监狱等待（超时自动等待）
   * 
   * 根据需求：选择等待后，本回合结束，下回合开始时推进等待状态
   */
  private handleJailWait(): void {
    const player = this.getCurrentPlayer()
    if (!player) return

    console.log(`[Jail] ${player.name} 选择继续蹲狱`)

    // 直接到回合结束，状态推进在 executeTurnEnd 中处理
    this.transitionTo('TURN_END')
    this.executeTurnEnd()
  }

  /**
   * 出狱
   */
  releaseFromJail(player: Player): void {
    player.status = 'ACTIVE'
    player.inPrison = false
    player.prisonTurns = 0
    console.log(`[Jail] ${player.name} 出狱`)
  }

  /**
   * 缴纳保释金
   */
  payBail(): boolean {
    const player = this.getCurrentPlayer()
    if (!player || player.money < GAME_CONSTANTS.BAIL_AMOUNT) return false

    player.money -= GAME_CONSTANTS.BAIL_AMOUNT
    this.releaseFromJail(player)
    this.transitionTo('ROLL_DICE')
    return true
  }

  /**
   * 使用关羽/司马懿技能出狱（每局限1次）
   */
  useHeroEscapeSkill(): boolean {
    const player = this.getCurrentPlayer()
    if (!player) return false

    const heroId = player.hero?.id
    if (heroId !== 'guanyu' && heroId !== 'simayi') return false

    const abilityKey = heroId === 'guanyu' ? 'guanyu_escape' : 'simayi_yinren'
    if (player.heroAbilityUsed[abilityKey]) return false

    // 标记技能已使用
    player.heroAbilityUsed[abilityKey] = true
    this.releaseFromJail(player)
    
    console.log(`[Skill] ${heroId === 'guanyu' ? '关羽「过五关斩六将」' : '司马懿「隐忍」'}：免费出狱`)
    
    this.transitionTo('ROLL_DICE')
    return true
  }

  /**
   * 尝试掷骰出狱（仅双骰规则）
   */
  tryRollForRelease(dice: number[]): boolean {
    const player = this.getCurrentPlayer()
    if (!player) return false

    // 双骰规则：掷出相同点数可出狱
    if (dice.length === 2 && dice[0] === dice[1]) {
      this.releaseFromJail(player)
      this.transitionTo('ROLL_DICE')
      return true
    }

    // 失败，继续蹲狱
    this.handleJailWait()
    return false
  }

  /**
   * ============================================
   * ③ ROLL_DICE - 掷骰子
   * ============================================
   */
  executeRollDice(): void {
    this.transitionTo('ROLL_DICE')
    // 等待玩家点击掷骰或超时自动掷
  }

  /**
   * 自动掷骰（超时）
   */
  private autoRollDice(): void {
    const playerCount = this.state.players.length
    const dice = playerCount <= 4 
      ? [this.rollDie(), this.rollDie()]  // 双骰
      : [this.rollDie()]                   // 单骰

    this.processDiceResult(dice)
  }

  /**
   * 掷骰子
   */
  rollDice(): number[] {
    const playerCount = this.state.players.length
    const player = this.getCurrentPlayer()
    
    let dice = playerCount <= 4 
      ? [this.rollDie(), this.rollDie()]  // 双骰 2-12
      : [this.rollDie()]                   // 单骰 1-6

    // 张辽技能：点数+1（上限不变）
    if (player?.hero?.id === 'zhangliao') {
      const max = playerCount <= 4 ? 12 : 6
      const sum = dice.reduce((a, b) => a + b, 0)
      const newSum = Math.min(sum + 1, max)
      if (dice.length === 2) {
        // 双骰：调整总和
        const diff = newSum - sum
        dice[0] = Math.min(dice[0] + diff, 6)
      } else {
        // 单骰
        dice[0] = Math.min(dice[0] + 1, max)
      }
      console.log(`[Skill] 张辽「突袭」：点数+1`)
    }

    // 太史慈技能：单骰范围2-7（v1.1）
    if (player?.hero?.id === 'taishici' && dice.length === 1) {
      dice[0] = Math.max(2, Math.min(dice[0] + 1, 7))
      console.log(`[Skill] 太史慈「神射」：范围2-7`)
    }

    // 加速模式：点数+2
    if (this.state.isSpeedMode) {
      const max = playerCount <= 4 ? 12 : 6
      const sum = dice.reduce((a, b) => a + b, 0)
      const newSum = Math.min(sum + 2, max)
      const diff = newSum - sum
      if (dice.length === 2) {
        dice[0] = Math.min(dice[0] + diff, 6)
      } else {
        dice[0] = Math.min(dice[0] + 2, max)
      }
      console.log(`[SpeedMode] 加速模式：点数+2`)
    }

    this.state.dice = dice
    return dice
  }

  private rollDie(): number {
    return Math.floor(Math.random() * 6) + 1
  }

  /**
   * 处理骰子结果
   */
  processDiceResult(dice: number[]): void {
    this.state.dice = dice
    this.transitionTo('MOVING')
    this.executeMoving(dice)
  }

  /**
   * 赵云重掷技能
   */
  canReroll(): boolean {
    const player = this.getCurrentPlayer()
    if (!player || player.hero?.id !== 'zhaoyun') return false
    
    // 检查本回合是否已使用
    const abilityKey = 'zhaoyun_reroll'
    if (player.heroAbilityUsed[abilityKey]) return false
    
    return true
  }

  executeReroll(): number[] | null {
    if (!this.canReroll()) return null
    
    const player = this.getCurrentPlayer()
    if (!player) return null

    // 标记已使用
    player.heroAbilityUsed['zhaoyun_reroll'] = true
    
    // 重新掷骰
    const newDice = this.rollDice()
    console.log(`[Skill] 赵云「七进七出」：重掷 ${this.state.dice} → ${newDice}`)
    
    return newDice
  }

  /**
   * ============================================
   * ④ MOVING - 移动阶段
   * ============================================
   */
  executeMoving(dice: number[]): void {
    const player = this.getCurrentPlayer()
    if (!player) return

    const steps = dice.reduce((a, b) => a + b, 0)
    const oldPosition = player.position
    const newPosition = (player.position + steps) % 56

    // 检查是否经过起点
    const passedStart = newPosition < oldPosition || (oldPosition + steps >= 56)
    
    if (passedStart) {
      // 触发起点奖励
      const startBonus = this.calculateStartBonus(player)
      player.money += startBonus
      player.stats.lapCount++
      console.log(`[Start] ${player.name} 经过起点，获得 ${startBonus} 金`)
    }

    player.position = newPosition

    // 移动完成后进入落地结算
    setTimeout(() => {
      this.transitionTo('LANDING')
      this.executeLanding()
    }, steps * 150) // 0.15s/格 动画时间
  }

  /**
   * 计算起点奖励
   */
  private calculateStartBonus(player: Player): number {
    const playerCount = this.state.players.length
    let bonus = GAME_CONSTANTS.START_BONUS[playerCount] || 2000

    // 加速模式额外+1000
    if (this.state.isSpeedMode) {
      bonus += 1000
    }

    // 曹操加成15%
    if (player.hero?.id === 'caocao') {
      const caoCaoBonus = Math.floor(bonus * GAME_CONSTANTS.HERO_BONUS.CAOCAO_START)
      bonus += caoCaoBonus
      console.log(`[Skill] 曹操「挟天子」：额外+${caoCaoBonus}金`)
    }

    return bonus
  }

  /**
   * ============================================
   * ⑤ LANDING - 格子效果结算
   * ============================================
   */
  executeLanding(): void {
    const player = this.getCurrentPlayer()
    if (!player) return

    const cell = this.state.cells[player.position]
    
    switch (cell.type) {
      case 'city':
        this.handleCityLanding(player, cell)
        break
      case 'chance':
        this.handleChanceLanding(player)
        break
      case 'destiny':
        this.handleDestinyLanding(player)
        break
      case 'checkpoint':
        this.handleCheckpointLanding(player, cell)
        break
      case 'prison':
        // 传送到监狱不入狱，只有天命卡「败走华容」才入狱
        console.log(`[Landing] ${player.name} 落在监狱格（无效果）`)
        break
      default:
        console.log(`[Landing] ${player.name} 落在 ${cell.name}（无效果）`)
    }

    // 进入卡牌使用阶段
    this.transitionTo('CARD_ACTION')
  }

  /**
   * 处理城池落地
   */
  private handleCityLanding(player: Player, cell: any): void {
    // 由前端处理购买/过路费逻辑
    // 这里只记录日志
    if (!cell.ownerId) {
      console.log(`[City] ${player.name} 落在无主城池 ${cell.name}`)
    } else if (cell.ownerId === player.id) {
      console.log(`[City] ${player.name} 落在己方城池 ${cell.name}`)
    } else {
      const owner = this.state.players.find(p => p.id === cell.ownerId)
      console.log(`[City] ${player.name} 落在 ${owner?.name} 的城池 ${cell.name}`)
    }
  }

  /**
   * 处理锦囊格落地
   */
  private handleChanceLanding(player: Player): void {
    // 诸葛亮：预览锦囊卡
    if (player.hero?.id === 'zhugeliang') {
      // 前端显示预览，玩家可选择是否抽取
      console.log(`[Skill] 诸葛亮「神机妙算」：预览锦囊卡`)
    } else {
      // 普通抽卡
      this.drawJinnangCard(player)
    }
  }

  /**
   * 抽取锦囊卡
   */
  drawJinnangCard(player: Player): Card | null {
    if (this.state.jinnangDeck.length === 0) {
      // 牌堆耗尽，洗弃牌堆
      this.state.jinnangDeck = [...this.state.jinnangDiscard]
      this.state.jinnangDiscard = []
      this.shuffleArray(this.state.jinnangDeck)
      console.log(`[Deck] 锦囊牌堆重新洗牌`)
    }

    if (this.state.jinnangDeck.length === 0) return null

    const cardId = this.state.jinnangDeck.pop()!
    // 由 cards.ts 解析卡牌详情
    console.log(`[Card] ${player.name} 抽到锦囊卡 ${cardId}`)

    // 检查手牌上限
    if (player.cards.length >= GAME_CONSTANTS.MAX_CARDS) {
      // 触发弃牌流程
      console.log(`[Card] ${player.name} 手牌已满，需弃牌`)
      // 前端处理弃牌UI
    }

    return { id: cardId } as Card
  }

  /**
   * 处理天命格落地
   */
  private handleDestinyLanding(player: Player): void {
    if (this.state.tianmingDeck.length === 0) {
      // 牌堆耗尽，洗弃牌堆
      this.state.tianmingDeck = [...this.state.tianmingDiscard]
      this.state.tianmingDiscard = []
      this.shuffleArray(this.state.tianmingDeck)
      console.log(`[Deck] 天命牌堆重新洗牌`)
    }

    if (this.state.tianmingDeck.length === 0) return

    const cardId = this.state.tianmingDeck.pop()!
    console.log(`[Fate] ${player.name} 触发天命卡 ${cardId}`)
    // 由前端显示天命卡效果
  }

  /**
   * 处理关卡落地
   */
  private handleCheckpointLanding(player: Player, cell: any): void {
    const playerCount = this.state.players.length
    
    // 5人以上局直接通过
    if (playerCount >= 5) {
      console.log(`[Checkpoint] ${player.name} 通过关卡（5人以上局）`)
      return
    }

    // 检查势力免停
    const playerFaction = player.hero?.faction
    const cellFaction = cell.faction
    if (playerFaction && playerFaction === cellFaction) {
      console.log(`[Checkpoint] ${player.name} 通过关卡（势力免停）`)
      return
    }

    // 停留1回合
    player.status = 'CHECKPOINT_WAIT'
    console.log(`[Checkpoint] ${player.name} 在关卡停留1回合`)
  }

  /**
   * ============================================
   * ⑥ CARD_ACTION - 使用锦囊卡
   * ============================================
   */
  executeCardAction(): void {
    this.transitionTo('CARD_ACTION')
    // 等待玩家选择使用卡牌或跳过
  }

  /**
   * 使用锦囊卡
   */
  useCard(cardId: string, targetId?: string): boolean {
    const player = this.getCurrentPlayer()
    if (!player) return false

    const cardIndex = player.cards.findIndex(c => c.id === cardId)
    if (cardIndex === -1) return false

    const card = player.cards[cardIndex]
    
    // 移除卡牌
    player.cards.splice(cardIndex, 1)
    player.stats.cardsUsed++

    // 加入弃牌堆
    this.state.jinnangDiscard.push(cardId)

    console.log(`[Card] ${player.name} 使用 ${card.name}（目标：${targetId || '无'}）`)

    // 进入升级阶段
    this.transitionTo('UPGRADE_ACTION')
    return true
  }

  /**
   * ============================================
   * ⑦ UPGRADE_ACTION - 升级城池
   * ============================================
   */
  executeUpgradeAction(): void {
    this.transitionTo('UPGRADE_ACTION')
    // 等待玩家选择升级或跳过
  }

  /**
   * 升级城池
   */
  upgradeCity(cellId: number): boolean {
    const player = this.getCurrentPlayer()
    if (!player) return false

    const cell = this.state.cells.find(c => c.id === cellId)
    if (!cell || cell.ownerId !== player.id) return false
    if (!cell.level || cell.level >= 5) return false

    // 计算升级费用
    const upgradeRate = GAME_CONSTANTS.UPGRADE_RATE[cell.level]
    const cost = Math.floor(cell.price! * upgradeRate)

    if (player.money < cost) return false

    player.money -= cost
    cell.level++

    console.log(`[Upgrade] ${player.name} 将 ${cell.name} 升级到 ${cell.level} 级，花费 ${cost} 金`)

    // 可以继续升级，不自动进入下一阶段
    return true
  }

  /**
   * ============================================
   * ⑧ TURN_END - 回合结束
   * ============================================
   */
  executeTurnEnd(): void {
    this.transitionTo('TURN_END')
    const player = this.getCurrentPlayer()
    if (!player) return

    // 0. 监狱等待状态推进（在回合结束时推进，为下回合准备）
    if (this.isInJail(player)) {
      const statusProgression: Record<string, PlayerStatus> = {
        'IN_JAIL': 'JAILED_WAIT_1',
        'JAILED_WAIT_1': 'JAILED_WAIT_2',
        'JAILED_WAIT_2': 'JAILED_WAIT_3'
      }
      const oldStatus = player.status
      player.status = statusProgression[player.status] || 'JAILED_WAIT_1'
      console.log(`[Jail] ${player.name} 监狱等待推进：${oldStatus} → ${player.status}`)
    }

    // 1. 触发「回合结束」被动技能
    this.triggerTurnEndSkills(player)

    // 2. 手牌上限检查
    if (player.cards.length > GAME_CONSTANTS.MAX_CARDS) {
      // 触发弃牌流程
      console.log(`[Discard] ${player.name} 手牌超限，需弃牌`)
      // 前端处理弃牌UI
    }

    // 3. 破产检查
    if (player.money < 0 && player.cities.length === 0) {
      player.status = 'BANKRUPT'
      console.log(`[Bankrupt] ${player.name} 破产！`)
    }

    // 4. 胜负检查
    const activePlayers = this.state.players.filter(p => p.status !== 'BANKRUPT')
    if (activePlayers.length === 1) {
      this.state.winner = activePlayers[0].id
      console.log(`[Game] 游戏结束！${activePlayers[0].name} 获胜！`)
      return
    }

    // 5. 切换到下一个玩家
    this.nextTurn()
  }

  /**
   * 触发回合结束技能
   */
  private triggerTurnEndSkills(player: Player): void {
    // 孙权：每回合可换1张锦囊卡
    if (player.hero?.id === 'sunquan') {
      // 前端显示换牌UI
      console.log(`[Skill] 孙权「制衡」：可换1张锦囊卡`)
    }
  }

  /**
   * 切换到下一个玩家
   */
  private nextTurn(): void {
    // 增加全局回合数
    this.state.globalTurn++

    // 切换玩家
    let nextIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length
    let attempts = 0

    // 跳过破产玩家
    while (this.state.players[nextIndex].status === 'BANKRUPT' && attempts < this.state.players.length) {
      nextIndex = (nextIndex + 1) % this.state.players.length
      attempts++
    }

    this.state.currentPlayerIndex = nextIndex
    this.state.dice = []

    const nextPlayer = this.getCurrentPlayer()
    if (!nextPlayer) return

    // 重置赵云重掷状态（每回合重置）
    if (nextPlayer.hero?.id === 'zhaoyun') {
      nextPlayer.heroAbilityUsed['zhaoyun_reroll'] = false
    }

    console.log(`[Turn] 全局回合 ${this.state.globalTurn}：${nextPlayer.name} 的回合`)

    // 检查加速模式触发
    this.checkSpeedMode()

    // 开始新回合
    this.executeTurnStart()
  }

  /**
   * 检查加速模式触发
   */
  private checkSpeedMode(): void {
    if (this.state.isSpeedMode) return

    const playerCount = this.state.players.length

    // 条件1：7-8人局且全局回合数 ≥ 20
    if (playerCount >= 7 && this.state.globalTurn >= 20) {
      this.activateSpeedMode()
      return
    }

    // 条件2：全局回合数 ≥ 50
    if (this.state.globalTurn >= 50) {
      this.activateSpeedMode()
      return
    }

    // 条件3：僵局检测（连续10回合无人破产）- 需要额外状态追踪
  }

  /**
   * 激活加速模式
   */
  private activateSpeedMode(): void {
    this.state.isSpeedMode = true
    this.state.speedModeTurn = this.state.globalTurn
    console.log(`[SpeedMode] 加速模式激活！回合 ${this.state.globalTurn}`)
  }

  /**
   * 工具方法
   */
  private setTimeout(key: string, callback: () => void, ms: number): void {
    this.clearTimeout(key)
    this.timeouts.set(key, setTimeout(callback, ms))
  }

  private clearTimeout(key: string): void {
    const timer = this.timeouts.get(key)
    if (timer) {
      clearTimeout(timer)
      this.timeouts.delete(key)
    }
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }

  /**
   * 清理所有超时
   */
  destroy(): void {
    this.timeouts.forEach((timer, key) => {
      clearTimeout(timer)
    })
    this.timeouts.clear()
  }
}

export default TurnStateMachine
