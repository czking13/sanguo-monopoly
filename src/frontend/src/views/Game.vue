<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import GameMap from '@/components/GameMap.vue'
import type { Hero } from '@/types'
import { heroes } from '@/data/heroes'

const route = useRoute()
const router = useRouter()
const gameStore = useGameStore()

const roomId = computed(() => route.params.roomId as string)

// 游戏模式
const gameMode = ref<'local' | 'online'>('local')

// 当前选中的玩家信息
const selectedPlayerId = ref<string | null>(null)

// 显示卡牌详情
const showCardModal = ref(false)
const selectedCard = ref<any>(null)

// 势力颜色映射
const factionColors: Record<string, string> = {
  '魏': 'text-blue-400 border-blue-500',
  '蜀': 'text-green-400 border-green-500',
  '吴': 'text-red-400 border-red-500',
  '中立': 'text-gray-400 border-gray-500'
}

const factionBgColors: Record<string, string> = {
  '魏': 'bg-blue-900/30',
  '蜀': 'bg-green-900/30',
  '吴': 'bg-red-900/30',
  '中立': 'bg-gray-900/30'
}

// 初始化游戏
onMounted(() => {
  const savedRoomData = localStorage.getItem('roomData')
  
  if (savedRoomData) {
    try {
      const roomData = JSON.parse(savedRoomData)
      // 有房间数据，使用在线模式
      gameMode.value = 'online'
      // TODO: 连接服务器
      // gameStore.connectAndJoin('http://localhost:3001', roomId.value, playerName)
    } catch (e) {
      console.error('解析房间数据失败', e)
    }
  }
  
  // 默认使用本地测试模式
  if (gameMode.value === 'local') {
    gameStore.initGame(roomId.value)
  }
})

onUnmounted(() => {
  gameStore.gameState = null
})

// 计算属性
const gameState = computed(() => gameStore.gameState)
const currentPlayer = computed(() => gameStore.currentPlayer)
const myPlayer = computed(() => gameStore.myPlayer)
const isMyTurn = computed(() => gameStore.isMyTurn)
const lastEvent = computed(() => gameStore.lastEvent)

// 当前格子的信息
const currentCell = computed(() => {
  if (!gameState.value || !currentPlayer.value) return null
  return gameState.value.cells[currentPlayer.value.position]
})

// 是否可以购买当前格子
const canBuy = computed(() => {
  if (!currentCell.value || !currentPlayer.value) return false
  const cell = currentCell.value
  const player = currentPlayer.value
  
  return cell.type === 'city' && 
         !cell.ownerId && 
         cell.price && 
         player.money >= cell.price &&
         gameState.value?.phase === 'action'
})

// 是否可以升级当前格子
const canUpgrade = computed(() => {
  if (!currentCell.value || !currentPlayer.value) return false
  const cell = currentCell.value
  const player = currentPlayer.value
  
  if (cell.type !== 'city' || !cell.ownerId || cell.ownerId !== player.id) return false
  if (!cell.price || !cell.level || cell.level >= 4) return false
  
  const upgradeCost = Math.floor(cell.price * 0.5)
  return player.money >= upgradeCost && gameState.value?.phase === 'action'
})

// 游戏操作
function rollDice() {
  if (gameMode.value === 'local') {
    gameStore.localRollDice()
  } else {
    gameStore.rollDice()
  }
}

function buyCity() {
  if (gameMode.value === 'local') {
    gameStore.localBuyCity()
  } else {
    gameStore.buyCity()
  }
}

function upgradeCity() {
  if (gameMode.value === 'local') {
    gameStore.localUpgradeCity()
  } else {
    gameStore.upgradeCity()
  }
}

function endTurn() {
  if (gameMode.value === 'local') {
    gameStore.localEndTurn()
  } else {
    gameStore.endTurn()
  }
}

function useCard(cardId: string) {
  if (gameMode.value === 'local') {
    gameStore.localUseCard(cardId)
  } else {
    gameStore.useCard(cardId)
  }
  showCardModal.value = false
}

function exitGame() {
  if (confirm('确定要退出游戏吗？')) {
    router.push('/lobby')
  }
}

// 获取武将信息
function getHero(heroId: string): Hero | undefined {
  return heroes.find(h => h.id === heroId)
}

// 格式化金额
function formatMoney(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)}万`
  }
  return amount.toString()
}

// 获取格子类型中文名
function getCellTypeName(type: string): string {
  const names: Record<string, string> = {
    city: '城池',
    chance: '锦囊',
    destiny: '天命',
    prison: '监狱',
    start: '起点',
    rest: '休整',
    checkpoint: '驿站'
  }
  return names[type] || type
}

// 显示卡牌详情
function showCardDetail(card: any) {
  selectedCard.value = card
  showCardModal.value = true
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <!-- 顶部状态栏 -->
    <div class="bg-slate-900/80 backdrop-blur border-b border-slate-700 px-4 py-3">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-chinese text-gold">三国大富翁</h1>
          <span class="text-gray-500">|</span>
          <span class="text-gray-400">房间：{{ roomId }}</span>
          <span class="text-gray-500">|</span>
          <span class="text-gray-400">模式：{{ gameMode === 'local' ? '本地测试' : '在线对战' }}</span>
        </div>
        <button
          @click="exitGame"
          class="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition-colors"
        >
          退出游戏
        </button>
      </div>
    </div>

    <div v-if="gameState" class="max-w-7xl mx-auto p-4">
      <div class="grid lg:grid-cols-4 gap-4">
        
        <!-- 左侧：玩家列表 -->
        <div class="lg:col-span-1 space-y-3">
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <h2 class="text-lg text-white mb-3 flex items-center gap-2">
              <span>👥</span> 玩家列表
            </h2>
            
            <div class="space-y-2">
              <div
                v-for="(player, index) in gameState.players"
                :key="player.id"
                :class="[
                  'p-3 rounded-lg border transition-all cursor-pointer',
                  gameState.currentPlayerIndex === index 
                    ? 'border-gold bg-gold/10 ring-1 ring-gold' 
                    : 'border-slate-600 bg-slate-900/50 hover:border-slate-500',
                  player.isBankrupt ? 'opacity-50' : ''
                ]"
                @click="selectedPlayerId = player.id"
              >
                <div class="flex items-center gap-3">
                  <!-- 头像 -->
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    :style="{ backgroundColor: player.color }"
                  >
                    {{ player.name.charAt(0) }}
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-white font-medium">{{ player.name }}</span>
                      <span v-if="gameState.currentPlayerIndex === index" class="text-xs text-gold">★ 回合中</span>
                      <span v-if="player.isBankrupt" class="text-xs text-red-400">破产</span>
                    </div>
                    <div class="text-sm text-gray-400">
                      💰 {{ formatMoney(player.money) }}
                      <span v-if="player.cities.length" class="ml-2">🏰 {{ player.cities.length }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- 武将信息 -->
                <div v-if="player.hero" class="mt-2 pt-2 border-t border-slate-600/50">
                  <div class="flex items-center gap-2 text-sm">
                    <span :class="factionColors[player.hero.faction]">
                      {{ player.hero.name }}
                    </span>
                    <span class="text-gold text-xs">{{ player.hero.skill.name }}</span>
                  </div>
                </div>
                
                <!-- 状态标签 -->
                <div class="mt-2 flex flex-wrap gap-1">
                  <span v-if="player.inPrison" class="text-xs px-2 py-0.5 bg-red-900/50 text-red-400 rounded">
                    🚨 监狱 ({{ player.prisonTurns }}回合)
                  </span>
                  <span v-if="player.cards.length" class="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded">
                    🃏 {{ player.cards.length }}张卡
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 事件日志 -->
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <h2 class="text-lg text-white mb-3 flex items-center gap-2">
              <span>📜</span> 事件日志
            </h2>
            <div class="text-sm text-gray-400 p-3 bg-slate-900/50 rounded-lg min-h-[60px]">
              {{ lastEvent || '游戏进行中...' }}
            </div>
          </div>
        </div>
        
        <!-- 中间：游戏地图 -->
        <div class="lg:col-span-2">
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <GameMap
              :players="gameState.players"
              :cells="gameState.cells"
              :current-player-id="currentPlayer?.id"
            />
          </div>
        </div>
        
        <!-- 右侧：操作面板 -->
        <div class="lg:col-span-1 space-y-3">
          <!-- 当前回合信息 -->
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <h2 class="text-lg text-white mb-3 flex items-center gap-2">
              <span>🎯</span> 当前回合
            </h2>
            
            <div v-if="currentPlayer" class="space-y-3">
              <div class="flex items-center gap-3">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  :style="{ backgroundColor: currentPlayer.color }"
                >
                  {{ currentPlayer.name.charAt(0) }}
                </div>
                <div>
                  <div class="text-white font-medium">{{ currentPlayer.name }}</div>
                  <div class="text-sm text-gray-400">
                    阶段：{{ 
                      gameState.phase === 'roll' ? '掷骰子' : 
                      gameState.phase === 'move' ? '移动中' : 
                      gameState.phase === 'action' ? '行动' : '结束'
                    }}
                  </div>
                </div>
              </div>
              
              <!-- 骰子显示 -->
              <div v-if="gameState.dice.length" class="flex justify-center gap-4 py-3">
                <div
                  v-for="(dice, index) in gameState.dice"
                  :key="index"
                  class="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-2xl font-bold text-slate-900 shadow-lg"
                >
                  {{ dice }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 当前格子信息 -->
          <div v-if="currentCell" class="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <h2 class="text-lg text-white mb-3 flex items-center gap-2">
              <span>📍</span> 当前位置
            </h2>
            
            <div :class="['p-3 rounded-lg border', factionBgColors[currentCell.faction || '中立'], 'border-slate-600']">
              <div class="flex items-center justify-between mb-2">
                <span class="text-white font-medium">{{ currentCell.name }}</span>
                <span class="text-xs text-gray-400">{{ getCellTypeName(currentCell.type) }}</span>
              </div>
              
              <!-- 城池信息 -->
              <div v-if="currentCell.type === 'city'" class="space-y-2 text-sm">
                <div v-if="currentCell.faction" class="text-gray-400">
                  势力：<span :class="factionColors[currentCell.faction]">{{ currentCell.faction }}</span>
                </div>
                <div v-if="currentCell.price" class="text-gray-400">
                  价格：<span class="text-gold">{{ currentCell.price }}</span> 金
                </div>
                <div v-if="currentCell.toll" class="text-gray-400">
                  过路费：<span class="text-red-400">{{ currentCell.toll }}</span> 金
                </div>
                <div v-if="currentCell.ownerId" class="text-gray-400">
                  城主：<span class="text-green-400">{{ gameState.players.find(p => p.id === currentCell.ownerId)?.name }}</span>
                  <span v-if="currentCell.level" class="ml-2 text-gold">★{{ currentCell.level }}</span>
                </div>
              </div>
              
              <!-- 特殊格子信息 -->
              <div v-else class="text-sm text-gray-400">
                <template v-if="currentCell.type === 'chance'">
                  🎴 停在此处可抽取锦囊卡
                </template>
                <template v-else-if="currentCell.type === 'destiny'">
                  🌟 停在此处触发天命事件
                </template>
                <template v-else-if="currentCell.type === 'prison'">
                  🚨 停在此处将被关进监狱
                </template>
                <template v-else-if="currentCell.type === 'start'">
                  🎉 经过此处获得 2000 金
                </template>
                <template v-else-if="currentCell.type === 'rest'">
                  💤 休息一回合
                </template>
                <template v-else-if="currentCell.type === 'checkpoint'">
                  🏇 驿站，可传送到其他驿站
                </template>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <h2 class="text-lg text-white mb-3 flex items-center gap-2">
              <span>🎮</span> 操作
            </h2>
            
            <div class="space-y-2">
              <!-- 掷骰子 -->
              <button
                v-if="gameState.phase === 'roll'"
                @click="rollDice"
                :disabled="gameMode === 'local' ? false : !isMyTurn"
                class="w-full py-3 bg-gold text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎲 掷骰子
              </button>
              
              <!-- 购买城池 -->
              <button
                v-if="canBuy"
                @click="buyCity"
                class="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors"
              >
                🏰 购买城池 ({{ currentCell?.price }} 金)
              </button>
              
              <!-- 升级城池 -->
              <button
                v-if="canUpgrade"
                @click="upgradeCity"
                class="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors"
              >
                ⬆️ 升级城池 ({{ Math.floor((currentCell?.price || 0) * 0.5) }} 金)
              </button>
              
              <!-- 结束回合 -->
              <button
                v-if="gameState.phase === 'action'"
                @click="endTurn"
                class="w-full py-3 bg-slate-600 text-white font-bold rounded-lg hover:bg-slate-500 transition-colors"
              >
                ✅ 结束回合
              </button>
            </div>
          </div>
          
          <!-- 手牌 -->
          <div v-if="currentPlayer?.cards.length" class="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <h2 class="text-lg text-white mb-3 flex items-center gap-2">
              <span>🃏</span> 手牌 ({{ currentPlayer.cards.length }})
            </h2>
            
            <div class="space-y-2">
              <div
                v-for="card in currentPlayer.cards"
                :key="card.id"
                @click="showCardDetail(card)"
                class="p-3 bg-slate-900/50 rounded-lg border border-slate-600 hover:border-gold cursor-pointer transition-colors"
              >
                <div class="flex items-center justify-between">
                  <span :class="card.type === '锦囊' ? 'text-orange-400' : 'text-purple-400'">
                    {{ card.type }}
                  </span>
                  <span class="text-white">{{ card.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 游戏结束弹窗 -->
    <div
      v-if="gameState?.winner"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    >
      <div class="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-gold text-center">
        <div class="text-6xl mb-4">🏆</div>
        <h2 class="text-3xl text-gold font-chinese mb-4">游戏结束</h2>
        <p class="text-xl text-white mb-6">
          {{ gameState.players.find(p => p.id === gameState.winner)?.name }} 获胜！
        </p>
        <button
          @click="router.push('/lobby')"
          class="px-8 py-3 bg-gold text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          返回大厅
        </button>
      </div>
    </div>
    
    <!-- 卡牌详情弹窗 -->
    <div
      v-if="showCardModal && selectedCard"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showCardModal = false"
    >
      <div class="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700">
        <div class="text-center mb-4">
          <span :class="selectedCard.type === '锦囊' ? 'text-orange-400' : 'text-purple-400'" class="text-sm">
            {{ selectedCard.type }}
          </span>
          <h3 class="text-2xl text-white font-chinese mt-1">{{ selectedCard.name }}</h3>
        </div>
        
        <p class="text-gray-400 text-center mb-6">{{ selectedCard.description }}</p>
        
        <div class="flex gap-3">
          <button
            @click="showCardModal = false"
            class="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            取消
          </button>
          <button
            @click="useCard(selectedCard.id)"
            class="flex-1 py-2 bg-gold text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            使用
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-gold {
  color: #fbbf24;
}
.bg-gold {
  background-color: #fbbf24;
}
.border-gold {
  border-color: #fbbf24;
}
.ring-gold {
  --tw-ring-color: #fbbf24;
}
</style>
