<!-- ============================================
     游戏结束面板 v1.1
     FE-115: 显示游戏结束、胜负、统计数据
     ============================================ -->
<template>
  <div class="game-over-panel" v-if="visible">
    <div class="panel-overlay">
      <div class="panel-content">
        <!-- 胜利动画 -->
        <div class="victory-animation">
          <div class="crown">👑</div>
          <div class="sparkles">
            <span v-for="i in 8" :key="i" class="sparkle">✨</span>
          </div>
        </div>
        
        <!-- 标题 -->
        <div class="panel-header">
          <h1 class="game-over-title">🎉 游戏结束</h1>
          <p class="winner-announce">
            <span class="winner-name" :style="{ color: winner?.color }">
              {{ winner?.name }}
            </span>
            获得胜利！
          </p>
        </div>
        
        <!-- 胜利者信息 -->
        <div class="winner-info" v-if="winner">
          <div class="winner-avatar" :style="{ borderColor: winner.color }">
            <img 
              v-if="winner.hero" 
              :src="`/heroes/${winner.hero.id}.jpg`" 
              :alt="winner.hero.name"
            />
            <span v-else>{{ winner.name.charAt(0) }}</span>
          </div>
          <div class="winner-details">
            <div class="winner-hero" v-if="winner.hero">
              {{ winner.hero.name }} · {{ winner.hero.faction }}
            </div>
            <div class="winner-stats">
              <span class="stat">
                <span class="stat-icon">💰</span>
                {{ winner.money.toLocaleString() }} 金
              </span>
              <span class="stat">
                <span class="stat-icon">🏰</span>
                {{ winner.cities.length }} 座城池
              </span>
              <span class="stat">
                <span class="stat-icon">🔄</span>
                {{ winner.passCount }} 次起点
              </span>
            </div>
          </div>
        </div>
        
        <!-- 排行榜 -->
        <div class="leaderboard">
          <h3>排行榜</h3>
          <div class="leaderboard-list">
            <div 
              v-for="(player, index) in sortedPlayers" 
              :key="player.id"
              class="leaderboard-item"
              :class="{ winner: index === 0, bankrupt: player.status === 'BANKRUPT' }"
            >
              <span class="rank">{{ index + 1 }}</span>
              <span class="player-name" :style="{ color: player.color }">
                {{ player.name }}
              </span>
              <span class="player-hero" v-if="player.hero">
                {{ player.hero.name }}
              </span>
              <span class="player-money">
                {{ player.money.toLocaleString() }} 金
              </span>
              <span class="player-cities">
                {{ player.cities.length }} 城
              </span>
            </div>
          </div>
        </div>
        
        <!-- 游戏统计 -->
        <div class="game-stats">
          <h3>游戏统计</h3>
          <div class="stats-grid">
            <div class="stat-box">
              <span class="stat-label">总回合数</span>
              <span class="stat-value">{{ totalTurns }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">游戏时长</span>
              <span class="stat-value">{{ formatDuration(gameDuration) }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">破产玩家</span>
              <span class="stat-value">{{ bankruptCount }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">加速模式</span>
              <span class="stat-value">{{ speedModeActive ? '已触发' : '未触发' }}</span>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="panel-actions">
          <button class="btn-rematch" @click="handleRematch">
            🔄 再来一局
          </button>
          <button class="btn-lobby" @click="handleBackToLobby">
            🏠 返回大厅
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player, GameState } from '../types'

const props = defineProps<{
  visible: boolean
  gameState: GameState | null
}>()

const emit = defineEmits<{
  (e: 'rematch'): void
  (e: 'backToLobby'): void
}>()

// 胜利者
const winner = computed(() => {
  if (!props.gameState) return null
  return props.gameState.players.find(p => p.id === props.gameState?.winner)
})

// 排序后的玩家列表（按资产排序）
const sortedPlayers = computed(() => {
  if (!props.gameState) return []
  
  return [...props.gameState.players].sort((a, b) => {
    // 按资金 + 城池价值排序
    const aValue = a.money + a.cities.length * 500
    const bValue = b.money + b.cities.length * 500
    return bValue - aValue
  })
})

// 总回合数
const totalTurns = computed(() => {
  return props.gameState?.turnNumber || 0
})

// 游戏时长（秒）
const gameDuration = computed(() => {
  if (!props.gameState?.createdAt) return 0
  const start = new Date(props.gameState.createdAt).getTime()
  const end = props.gameState.finishedAt 
    ? new Date(props.gameState.finishedAt).getTime() 
    : Date.now()
  return Math.floor((end - start) / 1000)
})

// 破产玩家数
const bankruptCount = computed(() => {
  if (!props.gameState) return 0
  return props.gameState.players.filter(p => p.status === 'BANKRUPT').length
})

// 加速模式
const speedModeActive = computed(() => {
  return props.gameState?.speedModeActive || false
})

// 格式化时长
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}分${secs}秒`
}

// 操作
const handleRematch = () => emit('rematch')
const handleBackToLobby = () => emit('backToLobby')
</script>

<style scoped>
.game-over-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
}

.panel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 1, 15, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  padding: 20px;
}

.panel-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 胜利动画 */
.victory-animation {
  position: relative;
  text-align: center;
  margin-bottom: 24px;
}

.crown {
  font-size: 64px;
  animation: crownBounce 1s ease-in-out infinite;
}

@keyframes crownBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.sparkles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
}

.sparkle {
  position: absolute;
  font-size: 20px;
  animation: sparkle 1.5s ease-in-out infinite;
}

.sparkle:nth-child(1) { top: 0; left: 50%; animation-delay: 0s; }
.sparkle:nth-child(2) { top: 25%; right: 0; animation-delay: 0.2s; }
.sparkle:nth-child(3) { top: 50%; right: 0; animation-delay: 0.4s; }
.sparkle:nth-child(4) { bottom: 25%; right: 0; animation-delay: 0.6s; }
.sparkle:nth-child(5) { bottom: 0; left: 50%; animation-delay: 0.8s; }
.sparkle:nth-child(6) { bottom: 25%; left: 0; animation-delay: 1s; }
.sparkle:nth-child(7) { top: 50%; left: 0; animation-delay: 1.2s; }
.sparkle:nth-child(8) { top: 25%; left: 0; animation-delay: 1.4s; }

@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 标题 */
.panel-header {
  text-align: center;
  margin-bottom: 24px;
}

.game-over-title {
  margin: 0 0 12px;
  font-size: 28px;
  color: white;
}

.winner-announce {
  margin: 0;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
}

.winner-name {
  font-weight: bold;
  font-size: 22px;
}

/* 胜利者信息 */
.winner-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(78, 205, 196, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(78, 205, 196, 0.3);
  margin-bottom: 24px;
}

.winner-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid;
  overflow: hidden;
  background: #2d3a4f;
}

.winner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.winner-details {
  flex: 1;
}

.winner-hero {
  font-size: 16px;
  font-weight: bold;
  color: white;
  margin-bottom: 8px;
}

.winner-stats {
  display: flex;
  gap: 16px;
}

.winner-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* 排行榜 */
.leaderboard {
  margin-bottom: 24px;
}

.leaderboard h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.leaderboard-item.winner {
  background: rgba(78, 205, 196, 0.15);
  border: 1px solid rgba(78, 205, 196, 0.3);
}

.leaderboard-item.bankrupt {
  opacity: 0.5;
}

.rank {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.leaderboard-item.winner .rank {
  background: #fbbf24;
  color: #1a1a2e;
}

.player-name {
  font-weight: bold;
  font-size: 14px;
}

.player-hero {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  flex: 1;
}

.player-money, .player-cities {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* 游戏统计 */
.game-stats {
  margin-bottom: 24px;
}

.game-stats h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-box {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  text-align: center;
}

.stat-box .stat-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.stat-box .stat-value {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: white;
}

/* 操作按钮 */
.panel-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-rematch, .btn-lobby {
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-rematch {
  background: linear-gradient(135deg, #4ecdc4 0%, #45b7aa 100%);
  border: none;
  color: white;
}

.btn-rematch:hover {
  transform: scale(1.05);
}

.btn-lobby {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.btn-lobby:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

/* 移动端适配 */
@media (max-width: 480px) {
  .panel-content {
    padding: 20px;
  }
  
  .game-over-title {
    font-size: 22px;
  }
  
  .crown {
    font-size: 48px;
  }
  
  .winner-stats {
    flex-wrap: wrap;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .panel-actions {
    flex-direction: column;
  }
  
  .btn-rematch, .btn-lobby {
    width: 100%;
  }
}
</style>
