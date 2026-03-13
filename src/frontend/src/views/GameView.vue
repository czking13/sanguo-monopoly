<template>
  <div class="game-view">
    <!-- 顶部信息栏 -->
    <div class="top-bar glass">
      <div class="room-info">
        <span class="room-name">{{ room?.name || '三国大富翁' }}</span>
        <span class="room-code">房间号: {{ room?.code }}</span>
      </div>
      <div class="turn-info" v-if="gameState">
        <span>第 {{ currentTurn }} 回合</span>
        <span class="current-player" :style="{ color: currentPlayer?.color }">
          {{ currentPlayer?.name }} 的回合
        </span>
      </div>
    </div>

    <!-- 主要游戏区域 -->
    <div class="game-main">
      <!-- 左侧：玩家列表 -->
      <div class="players-panel glass">
        <h3>玩家</h3>
        <div class="player-list">
          <div 
            v-for="player in gameState?.players" 
            :key="player.id"
            class="player-item"
            :class="{ 
              active: gameState?.currentPlayerIndex === gameState.players.indexOf(player),
              bankrupt: player.isBankrupt 
            }"
          >
            <div class="player-avatar" :style="{ backgroundColor: player.color }">
              {{ player.name.charAt(0) }}
            </div>
            <div class="player-info">
              <div class="player-name">
                {{ player.name }}
                <span v-if="player.hero" class="hero-badge">{{ player.hero.name }}</span>
              </div>
              <div class="player-money">{{ player.money }} 金</div>
              <div class="player-cities">{{ player.cities.length }} 座城池</div>
            </div>
            <div class="player-status">
              <span v-if="player.inPrison" class="status-prison">狱</span>
              <span v-if="!player.isOnline" class="status-offline">离线</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：游戏地图 -->
      <div class="map-container">
        <GameMap 
          :players="gameState?.players || []"
          :cells="gameState?.cells || []"
          :currentPlayerId="currentPlayer?.id"
        />
      </div>

      <!-- 右侧：操作面板 -->
      <div class="action-panel glass">
        <!-- 骰子区域 -->
        <div class="dice-area" v-if="isMyTurn && gameState?.phase === 'roll'">
          <h3>掷骰子</h3>
          <div class="dice-display">
            <div class="dice" :class="{ rolling: isRolling }">
              {{ diceValue || '?' }}
            </div>
          </div>
          <button class="btn-primary" @click="rollDice" :disabled="isRolling">
            {{ isRolling ? '掷骰中...' : '掷骰子' }}
          </button>
        </div>

        <!-- 移动提示 -->
        <Transition name="fade" mode="out-in">
          <div class="move-info" v-if="gameState?.phase === 'move'">
            <h3>移动中...</h3>
            <p>{{ currentPlayer?.name }} 移动 {{ diceValue }} 步</p>
            <div class="move-animation">
              <span class="move-dot" v-for="i in diceValue" :key="i" 
                :style="{ animationDelay: (i - 1) * 0.1 + 's' }">
                ●
              </span>
            </div>
          </div>
        </Transition>

        <!-- 行动区域 -->
        <div class="action-area" v-if="isMyTurn && gameState?.phase === 'action'">
          <h3>行动</h3>
          
          <!-- 购买城池 -->
          <div v-if="canBuyCity" class="action-buy">
            <p>是否购买 <strong>{{ currentCell?.name }}</strong>？</p>
            <p>价格: {{ currentCell?.price }} 金</p>
            <div class="action-buttons">
              <button class="btn-primary" @click="buyCity">购买</button>
              <button class="btn-secondary" @click="skipAction">跳过</button>
            </div>
          </div>

          <!-- 升级城池 -->
          <div v-if="canUpgradeCity" class="action-upgrade">
            <p>是否升级 <strong>{{ currentCell?.name }}</strong>？</p>
            <p>升级费用: {{ upgradeCost }} 金</p>
            <div class="action-buttons">
              <button class="btn-primary" @click="upgradeCity">升级</button>
              <button class="btn-secondary" @click="skipAction">跳过</button>
            </div>
          </div>

          <!-- 使用卡牌 -->
          <div v-if="hasCards" class="action-cards">
            <h4>手牌</h4>
            <div class="card-list">
              <div 
                v-for="card in myCards" 
                :key="card.id"
                class="card-item"
                @click="useCard(card.id)"
              >
                <span class="card-type">{{ card.type }}</span>
                <span class="card-name">{{ card.name }}</span>
              </div>
            </div>
          </div>

          <button class="btn-primary" @click="endTurn" style="margin-top: 16px;">
            结束回合
          </button>
        </div>

        <!-- 事件显示 -->
        <div class="event-area" v-if="lastEvent">
          <div class="event-message">
            {{ lastEvent }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import GameMap from '../components/GameMap.vue'
import { useGameStore } from '../stores/game'
import { storeToRefs } from 'pinia'

const route = useRoute()
const gameStore = useGameStore()
const { room, gameState, currentPlayer, lastEvent } = storeToRefs(gameStore)

const diceValue = ref(0)
const isRolling = ref(false)
const currentTurn = ref(1)

// 当前格子
const currentCell = computed(() => {
  if (!gameState.value || !currentPlayer.value) return null
  return gameState.value.cells[currentPlayer.value.position]
})

// 是否轮到我
const isMyTurn = computed(() => {
  // 这里需要与实际的玩家ID对比
  return true // 临时
})

// 是否可以购买城池
const canBuyCity = computed(() => {
  if (!currentCell.value || currentCell.value.type !== 'city') return false
  if (currentCell.value.ownerId) return false
  if (!currentPlayer.value) return false
  return currentPlayer.value.money >= (currentCell.value.price || 0)
})

// 是否可以升级城池
const canUpgradeCity = computed(() => {
  if (!currentCell.value || currentCell.value.type !== 'city') return false
  if (!currentPlayer.value) return false
  if (currentCell.value.ownerId !== currentPlayer.value.id) return false
  if ((currentCell.value.level || 1) >= 4) return false
  return currentPlayer.value.money >= upgradeCost.value
})

const upgradeCost = computed(() => {
  if (!currentCell.value) return 0
  return Math.floor((currentCell.value.price || 0) * 0.5)
})

// 手牌
const myCards = computed(() => currentPlayer.value?.cards || [])
const hasCards = computed(() => myCards.value.length > 0)

// 掷骰子
const rollDice = () => {
  isRolling.value = true
  
  // 模拟掷骰子动画
  let count = 0
  const interval = setInterval(() => {
    diceValue.value = Math.floor(Math.random() * 6) + 1
    count++
    if (count >= 10) {
      clearInterval(interval)
      isRolling.value = false
      // 使用本地测试模式
      gameStore.localRollDice()
      diceValue.value = gameStore.gameState?.dice?.[0] || 1
    }
  }, 100)
}

// 购买城池
const buyCity = () => {
  gameStore.localBuyCity()
}

// 升级城池
const upgradeCity = () => {
  gameStore.localUpgradeCity()
}

// 跳过行动
const skipAction = () => {
  gameStore.localEndTurn()
}

// 使用卡牌
const useCard = (cardId: string) => {
  gameStore.localUseCard(cardId)
}

// 结束回合
const endTurn = () => {
  gameStore.localEndTurn()
}

onMounted(() => {
  // 初始化游戏（本地测试模式）
  gameStore.initGame('test-room')
})
</script>

<style scoped>
.game-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 16px;
}

.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  margin-bottom: 16px;
}

.room-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.room-name {
  font-size: 18px;
  font-weight: bold;
  color: #00ff88;
}

.room-code {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.turn-info {
  display: flex;
  gap: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.current-player {
  font-weight: bold;
}

.game-main {
  display: flex;
  gap: 16px;
  height: calc(100vh - 100px);
}

.players-panel {
  width: 220px;
  padding: 16px;
  overflow-y: auto;
}

.players-panel h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

.player-item.active {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.player-item.bankrupt {
  opacity: 0.5;
}

.player-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  flex-shrink: 0;
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  font-size: 14px;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hero-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.7);
}

.player-money {
  font-size: 12px;
  color: #f39c12;
  margin-top: 2px;
}

.player-cities {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.player-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-prison {
  font-size: 10px;
  padding: 2px 6px;
  background: #e74c3c;
  border-radius: 4px;
  color: white;
}

.status-offline {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.map-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.action-panel {
  width: 280px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.action-panel h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.dice-area {
  text-align: center;
  margin-bottom: 20px;
}

.dice-display {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.dice {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
  border: 3px solid #00ff88;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: #00ff88;
}

.dice.rolling {
  animation: shake 0.1s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  flex: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.action-buttons .btn-primary {
  flex: 1;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.card-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.card-item:hover {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
}

.card-type {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(155, 89, 182, 0.3);
  border-radius: 4px;
  color: #9b59b6;
}

.card-name {
  font-size: 13px;
  color: white;
}

.event-area {
  margin-top: auto;
  padding-top: 16px;
}

.event-message {
  padding: 12px;
  background: rgba(243, 156, 18, 0.1);
  border: 1px solid rgba(243, 156, 18, 0.3);
  border-radius: 8px;
  color: #f39c12;
  font-size: 13px;
}
</style>
