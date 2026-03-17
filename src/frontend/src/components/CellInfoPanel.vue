<!-- ============================================
     城池信息面板 v1.1
     FE-111: 城池详情显示
     FE-106: 刘备/夏侯惇减免显示
     FE-105: 甘宁劫营动画显示
     ============================================ -->
<template>
  <div class="cell-info-panel" v-if="visible && cell" :style="panelStyle">
    <div class="cell-header">
      <div class="cell-type-icon">{{ getTypeIcon(cell.type) }}</div>
      <div class="cell-title">
        <h3>{{ cell.name }}</h3>
        <span class="cell-type">{{ getCellTypeName(cell.type) }}</span>
      </div>
      <button class="close-btn" @click="handleClose">×</button>
    </div>
    
    <div class="cell-body">
      <!-- 城池信息 -->
      <div class="info-section" v-if="cell.type === 'city'">
        <div class="info-row">
          <span class="label">购买价格</span>
          <span class="value">{{ cell.price }} 金</span>
        </div>
        <div class="info-row" v-if="cell.ownerId">
          <span class="label">城池等级</span>
          <span class="value">
            <span class="level-stars">
              <span v-for="i in 5" :key="i" :class="{ filled: i <= (cell.level || 1) }">★</span>
            </span>
          </span>
        </div>
        <div class="info-row">
          <span class="label">基础过路费</span>
          <span class="value">{{ Math.floor((cell.price || 0) * 0.1) }} 金</span>
        </div>
        <div class="info-row" v-if="cell.level && cell.level > 1">
          <span class="label>等级倍率</span>
          <span class="value">×{{ getLevelMultiplier(cell.level) }}</span>
        </div>
        <div class="info-row" v-if="cell.region === '荆州'">
          <span class="label">区域加成</span>
          <span class="value highlight">×1.2 (荆州)</span>
        </div>
        <div class="info-row" v-if="cell.ownerId">
          <span class="label">城主</span>
          <span class="value" :style="{ color: ownerColor }">{{ ownerName }}</span>
        </div>
      </div>
      
      <!-- 购买/升级操作 -->
      <div class="action-section" v-if="canInteract">
        <button 
          v-if="!cell.ownerId && canBuy"
          class="action-btn buy"
          @click="handleBuy"
        >
          购买 ({{ cell.price }} 金)
        </button>
        <button 
          v-if="cell.ownerId === myPlayerId && canUpgrade"
          class="action-btn upgrade"
          @click="handleUpgrade"
        >
          升级 ({{ upgradeCost }} 金)
        </button>
        <button 
          v-if="cell.ownerId === myPlayerId"
          class="action-btn sell"
          @click="handleSell"
        >
          出售 ({{ sellPrice }} 金)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MapCell, Player } from '../types'
import { getCellUpgradeInfo } from '../utils/tollCalculator'
import { getHeroById } from '../data/heroes'

const props = defineProps<{
  visible: boolean
  cell: MapCell | null
  position: { x: number; y: number }
  players: Player[]
  myPlayerId: string
  isMyTurn: boolean
  currentPhase: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'buy'): void
  (e: 'upgrade'): void
  (e: 'sell'): void
}>()

// 面板位置
const panelStyle = computed(() => ({
  left: `${Math.min(props.position.x, 400)}px`,
  top: `${Math.min(props.position.y, 400)}px`
}))

// 城主信息
const owner = computed(() => {
  if (!props.cell?.ownerId) return null
  return props.players.find(p => p.id === props.cell?.ownerId) || null
})

const ownerName = computed(() => owner.value?.name || '未知')
const ownerColor = computed(() => owner.value?.color || '#ffffff')

// 是否可以购买
const canBuy = computed(() => {
  if (!props.myPlayerId || !props.cell) return false
  const me = props.players.find(p => p.id === props.myPlayerId)
  if (!me) return false
  return me.money >= (props.cell.price || 0)
})

// 是否可以升级
const canUpgrade = computed(() => {
  if (!props.cell || props.cell.level >= 5) return false
  const me = props.players.find(p => p.id === props.myPlayerId)
  if (!me) return false
  return me.money >= upgradeCost.value
})

// 升级费用
const upgradeCost = computed(() => {
  if (!props.cell?.price || !props.cell?.level) return 0
  const rates = [0.5, 1, 1.5, 2]
  return Math.floor(props.cell.price * (rates[props.cell.level - 1] || 0.5))
})

// 出售价格
const sellPrice = computed(() => {
  if (!props.cell) return 0
  const info = getCellUpgradeInfo(props.cell)
  return info.sellPrice
})

// 是否可交互
const canInteract = computed(() => {
  return props.isMyTurn && ['LANDING', 'UPGRADE_ACTION'].includes(props.currentPhase)
})

// 获取类型图标
const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    city: '🏰',
    chance: '🎴',
    destiny: '📜',
    prison: '⛓️',
    start: '🏁',
    rest: '🏕️',
    checkpoint: '🚧'
  }
  return icons[type] || '📍'
}

// 获取类型名称
const getCellTypeName = (type: string): string => {
  const names: Record<string, string> = {
    city: '城池',
    chance: '锦囊格',
    destiny: '天命格',
    prison: '监狱',
    start: '起点',
    rest: '休息区',
    checkpoint: '关卡'
  }
  return names[type] || type
}

// 获取等级倍率
const getLevelMultiplier = (level: number): number => {
  const multipliers = [1, 1.5, 2, 3, 4]
  return multipliers[level - 1] || 1
}

// 处理操作
const handleBuy = () => emit('buy')
const handleUpgrade = () => emit('upgrade')
const handleSell = () => emit('sell')
const handleClose = () => emit('close')
</script>

<style scoped>
.cell-info-panel {
  position: fixed;
  width: 280px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  z-index: 1500;
  overflow: hidden;
}

.cell-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.cell-type-icon {
  font-size: 28px;
  margin-right: 12px;
}

.cell-title {
  flex: 1;
}

.cell-title h3 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.cell-type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: white;
}

.cell-body {
  padding: 16px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row .label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.info-row .value {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.info-row .value.highlight {
  color: #f59e0b;
}

.level-stars {
  display: inline-flex;
  gap: 2px;
}

.level-stars span {
  color: rgba(255, 255, 255, 0.2);
  font-size: 12px;
}

.level-stars span.filled {
  color: #fbbf24;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  transform: scale(1.02);
}

.action-btn.buy {
  background: linear-gradient(135deg, #4ecdc4 0%, #45b7aa 100%);
  color: white;
}

.action-btn.upgrade {
  background: linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%);
  color: white;
}

.action-btn.sell {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
}

.action-btn.sell:hover {
  border-color: rgba(255, 255, 255, 0.5);
}
</style>
