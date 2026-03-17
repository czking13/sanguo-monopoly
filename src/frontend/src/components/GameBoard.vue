<!-- ============================================
     游戏主界面 v1.1
     FE-120: 整合所有组件的游戏主界面
     ============================================ -->
<template>
  <div class="game-board">
    <!-- 顶部信息栏 -->
    <header class="game-header">
      <div class="game-info">
        <span class="room-code">房间: {{ roomCode }}</span>
        <span class="turn-info">第 {{ turnNumber }} 回合</span>
        <span class="phase-info">{{ phaseDescription }}</span>
      </div>
      <div class="game-actions">
        <button class="btn-icon" @click="toggleSettings">⚙️</button>
        <button class="btn-icon" @click="toggleHelp">❓</button>
      </div>
    </header>
    
    <!-- 主游戏区域 -->
    <main class="game-main">
      <!-- 左侧：玩家列表 -->
      <aside class="players-sidebar">
        <PlayerCard
          v-for="player in players"
          :key="player.id"
          :player="player"
          :isCurrent="player.id === currentPlayerId"
        />
      </aside>
      
      <!-- 中间：地图 + 骰子 -->
      <section class="game-center">
        <div class="map-container">
          <GameMap
            :cells="cells"
            :players="players"
            :currentPlayerId="currentPlayerId"
          />
        </div>
        
        <div class="dice-area">
          <DicePanel
            :dice="dice"
            :isRolling="isDiceRolling"
            :canRoll="canRollDice"
            :currentPlayer="currentPlayer"
            @roll="handleRollDice"
            @reroll="handleRerollDice"
          />
        </div>
      </section>
      
      <!-- 右侧：当前玩家信息 + 手牌 -->
      <aside class="current-player-sidebar">
        <div class="player-details" v-if="currentPlayer">
          <h3>{{ currentPlayer.name }}</h3>
          <div class="hero-info" v-if="currentPlayer.hero">
            <img :src="`/heroes/${currentPlayer.hero.id}.jpg`" :alt="currentPlayer.hero.name" />
            <div class="hero-details">
              <span class="hero-name">{{ currentPlayer.hero.name }}</span>
              <span class="hero-skill">{{ currentPlayer.hero.skill.name }}</span>
            </div>
          </div>
        </div>
        
        <HandCards
          :cards="myPlayer?.cards || []"
          :isMyTurn="isMyTurn"
          :currentPhase="currentPhase"
          @useCard="handleUseCard"
        />
        
        <!-- 联盟状态 -->
        <AllianceDisplay :players="players" />
      </aside>
    </main>
    
    <!-- 底部：回合状态指示器 -->
    <footer class="game-footer">
      <TurnIndicator
        :currentPhase="currentPhase"
        :isMyTurn="isMyTurn"
        :timeout="turnTimeout"
        @timeout="handleTimeout"
      />
    </footer>
    
    <!-- 弹窗层 -->
    <Transition name="fade">
      <TollPanel
        v-if="showTollPanel"
        :cell="tollCell"
        :owner="tollOwner"
        :visitor="currentPlayer"
        :tollResult="tollResult"
        @pay="handlePayToll"
        @useCard="handleUseCardForToll"
      />
    </Transition>
    
    <Transition name="fade">
      <CardResponseModal
        v-if="showCardResponse"
        :visible="showCardResponse"
        :availableCards="availableResponseCards"
        :currentToll="currentToll"
        :players="players"
        :currentUserId="myPlayerId"
        @useCard="handleUseResponseCard"
        @skip="handleSkipResponseCard"
      />
    </Transition>
    
    <Transition name="fade">
      <PrisonPanel
        v-if="showPrisonPanel"
        :visible="showPrisonPanel"
        :player="currentPlayer"
        :isCurrentPlayer="isMyTurn"
        :playerCount="players.length"
        @useHeroSkill="handlePrisonSkill"
        @payBail="handlePayBail"
        @rollForRelease="handleRollForRelease"
        @wait="handlePrisonWait"
      />
    </Transition>
    
    <Transition name="fade">
      <TurnStartEffects
        v-if="showTurnStartEffects"
        :visible="showTurnStartEffects"
        :effects="turnStartEffects"
        @confirm="handleConfirmEffects"
      />
    </Transition>
    
    <Transition name="fade">
      <FateCardModal
        v-if="showFateCard"
        :visible="showFateCard"
        :card="currentFateCard"
        @confirm="handleConfirmFateCard"
      />
    </Transition>
    
    <Transition name="fade">
      <GameOverPanel
        v-if="showGameOver"
        :visible="showGameOver"
        :gameState="gameState"
        @rematch="handleRematch"
        @backToLobby="handleBackToLobby"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../stores/game'
import type { MapCell, Player, Card, TurnStartEffect } from '../types'

// 组件导入
import PlayerCard from './PlayerCard.vue'
import GameMap from './GameMap.vue'
import DicePanel from './DicePanel.vue'
import HandCards from './HandCards.vue'
import AllianceDisplay from './AllianceDisplay.vue'
import TurnIndicator from './TurnIndicator.vue'
import TollPanel from './TollPanel.vue'
import CardResponseModal from './CardResponseModal.vue'
import PrisonPanel from './PrisonPanel.vue'
import TurnStartEffects from './TurnStartEffects.vue'
import FateCardModal from './FateCardModal.vue'
import GameOverPanel from './GameOverPanel.vue'

const gameStore = useGameStore()

// ========== 响应式状态 ==========

const showTollPanel = ref(false)
const showCardResponse = ref(false)
const showPrisonPanel = ref(false)
const showTurnStartEffects = ref(false)
const showFateCard = ref(false)
const showGameOver = ref(false)

const tollCell = ref<MapCell | null>(null)
const tollOwner = ref<Player | null>(null)
const tollResult = ref<any>(null)
const currentToll = ref(0)
const availableResponseCards = ref<Card[]>([])
const currentFateCard = ref<Card | null>(null)
const turnStartEffects = ref<TurnStartEffect[]>([])

// ========== 计算属性 ==========

const roomCode = computed(() => gameStore.room?.code || '------')
const turnNumber = computed(() => gameStore.gameState?.turnNumber || 1)
const currentPhase = computed(() => gameStore.currentPhase)
const phaseDescription = computed(() => gameStore.getPhaseDescription)
const players = computed(() => gameStore.gameState?.players || [])
const cells = computed(() => gameStore.gameState?.cells || [])
const currentPlayerId = computed(() => gameStore.currentPlayer?.id || '')
const currentPlayer = computed(() => gameStore.currentPlayer)
const myPlayer = computed(() => gameStore.myPlayer)
const myPlayerId = computed(() => gameStore.myPlayerId)
const isMyTurn = computed(() => gameStore.isMyTurn)
const dice = computed(() => gameStore.gameState?.dice || [])
const isDiceRolling = computed(() => gameStore.gameState?.diceRolling || false)
const canRollDice = computed(() => gameStore.canPerformAction('roll'))
const turnTimeout = computed(() => 15000) // 15秒
const gameState = computed(() => gameStore.gameState)

// ========== 事件处理 ==========

const handleRollDice = () => {
  gameStore.localRollDice()
}

const handleRerollDice = () => {
  // 赵云重掷骰子
  gameStore.localRollDice()
}

const handleUseCard = (cardId: string) => {
  gameStore.localUseCard(cardId)
}

const handlePayToll = () => {
  gameStore.localPayToll()
  showTollPanel.value = false
}

const handleUseCardForToll = (cardId: string) => {
  gameStore.localUseCard(cardId)
  showTollPanel.value = false
}

const handleUseResponseCard = (cardId: string) => {
  gameStore.localUseCard(cardId)
  showCardResponse.value = false
}

const handleSkipResponseCard = () => {
  showCardResponse.value = false
  handlePayToll()
}

const handlePrisonSkill = () => {
  gameStore.useEscapeSkill()
  showPrisonPanel.value = false
}

const handlePayBail = () => {
  gameStore.payBail()
  showPrisonPanel.value = false
}

const handleRollForRelease = () => {
  gameStore.rollForRelease()
  showPrisonPanel.value = false
}

const handlePrisonWait = () => {
  gameStore.stayInPrison()
  showPrisonPanel.value = false
}

const handleConfirmEffects = () => {
  showTurnStartEffects.value = false
}

const handleConfirmFateCard = () => {
  showFateCard.value = false
}

const handleTimeout = () => {
  // 超时自动结束回合
  gameStore.localEndTurn()
}

const handleRematch = () => {
  showGameOver.value = false
  // 重新初始化游戏
  gameStore.initGame('new-game')
}

const handleBackToLobby = () => {
  showGameOver.value = false
  // 返回大厅逻辑
}

const toggleSettings = () => {
  // 打开设置面板
}

const toggleHelp = () => {
  // 打开帮助面板
}
</script>

<style scoped>
.game-board {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  flex-direction: column;
}

/* 顶部信息栏 */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.game-info {
  display: flex;
  gap: 20px;
}

.game-info span {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.room-code {
  font-weight: bold;
  color: #4ecdc4 !important;
}

.phase-info {
  color: #fbbf24 !important;
}

.game-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 主游戏区域 */
.game-main {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
}

/* 左侧玩家列表 */
.players-sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

/* 中间地图区 */
.game-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.map-container {
  flex: 1;
  min-height: 0;
}

.dice-area {
  display: flex;
  justify-content: center;
}

/* 右侧当前玩家信息 */
.current-player-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.player-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.player-details h3 {
  margin: 0 0 12px;
  font-size: 18px;
  color: white;
}

.hero-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.hero-info img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #4ecdc4;
}

.hero-details {
  display: flex;
  flex-direction: column;
}

.hero-name {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.hero-skill {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* 底部状态栏 */
.game-footer {
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 1200px) {
  .players-sidebar {
    width: 160px;
  }
  
  .current-player-sidebar {
    width: 240px;
  }
}

@media (max-width: 992px) {
  .game-main {
    flex-direction: column;
  }
  
  .players-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .current-player-sidebar {
    width: 100%;
  }
}
</style>
