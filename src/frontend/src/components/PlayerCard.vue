<!-- ============================================
     玩家状态卡片 v1.1
     FE-113: 显示玩家信息、武将、资金、状态效果
     ============================================ -->
<template>
  <div 
    class="player-card"
    :class="{ 
      current: isCurrent, 
      bankrupt: player.status === 'BANKRUPT',
      inJail: isInJail
    }"
    :style="{ borderColor: player.color }"
  >
    <!-- 头部：玩家信息 -->
    <div class="card-header">
      <div class="player-avatar" :style="{ borderColor: player.color }">
        <img 
          v-if="player.hero" 
          :src="`/heroes/${player.hero.id}.jpg`" 
          :alt="player.hero.name"
        />
        <span v-else class="avatar-fallback">{{ player.name.charAt(0) }}</span>
        <div class="faction-badge" v-if="player.hero" :class="getFactionClass(player.hero.faction)"></div>
      </div>
      <div class="player-info">
        <span class="player-name" :style="{ color: player.color }">{{ player.name }}</span>
        <span class="player-hero" v-if="player.hero">{{ player.hero.name }}</span>
      </div>
      <div class="player-indicators">
        <span class="indicator current-turn" v-if="isCurrent">▶</span>
        <span class="indicator online" v-if="player.isOnline">●</span>
        <span class="indicator ai" v-if="player.isAI">🤖</span>
      </div>
    </div>
    
    <!-- 资金显示 -->
    <div class="card-body">
      <div class="money-display">
        <span class="money-icon">💰</span>
        <span class="money-value">{{ player.money.toLocaleString() }}</span>
        <span class="money-unit">金</span>
      </div>
      
      <!-- 资产统计 -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-icon">🏰</span>
          <span class="stat-value">{{ player.cities.length }}</span>
          <span class="stat-label">城池</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🎴</span>
          <span class="stat-value">{{ player.cards.length }}</span>
          <span class="stat-label">卡牌</span>
        </div>
      </div>
      
      <!-- 状态效果 -->
      <div class="status-effects" v-if="player.statusEffects.length > 0">
        <span 
          v-for="effect in player.statusEffects" 
          :key="effect.type"
          class="effect-badge"
          :class="getEffectClass(effect.type)"
        >
          {{ getEffectIcon(effect.type) }}
          <span class="effect-turns">{{ effect.remainingTurns }}</span>
        </span>
      </div>
      
      <!-- 特殊状态显示 -->
      <div class="special-status" v-if="specialStatusText">
        <span class="status-icon">{{ specialStatusIcon }}</span>
        <span class="status-text">{{ specialStatusText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '../types'

const props = defineProps<{
  player: Player
  isCurrent: boolean
}>()

// 是否在监狱
const isInJail = computed(() => {
  return ['IN_JAIL', 'JAILED_WAIT_1', 'JAILED_WAIT_2', 'JAILED_WAIT_3'].includes(props.player.status)
})

// 获取势力类名
const getFactionClass = (faction: string): string => {
  const classes: Record<string, string> = {
    '魏': 'faction-wei',
    '蜀': 'faction-shu',
    '吴': 'faction-wu',
    '中立': 'faction-neutral'
  }
  return classes[faction] || 'faction-neutral'
}

// 获取状态效果类名
const getEffectClass = (type: string): string => {
  const classes: Record<string, string> = {
    'LE_BU_SI_SHU': 'effect-negative',
    'ALLIANCE': 'effect-positive',
    'MEIREN_COOLDOWN': 'effect-neutral',
    'FIRE_BURN': 'effect-negative'
  }
  return classes[type] || 'effect-neutral'
}

// 获取状态效果图标
const getEffectIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'LE_BU_SI_SHU': '😴',
    'ALLIANCE': '🤝',
    'MEIREN_COOLDOWN': '❤️',
    'FIRE_BURN': '🔥'
  }
  return icons[type] || '❓'
}

// 特殊状态文本
const specialStatusText = computed(() => {
  const status = props.player.status
  
  if (status === 'BANKRUPT') return '已破产'
  if (status === 'BLOCKED') return '被跳过'
  if (status === 'CHECKPOINT_WAIT') return '关卡停留'
  
  if (isInJail.value) {
    switch (status) {
      case 'IN_JAIL': return '刚入狱'
      case 'JAILED_WAIT_1': return '监狱第1回合'
      case 'JAILED_WAIT_2': return '监狱第2回合'
      case 'JAILED_WAIT_3': return '强制缴费'
    }
  }
  
  return ''
})

// 特殊状态图标
const specialStatusIcon = computed(() => {
  const status = props.player.status
  
  if (status === 'BANKRUPT') return '💀'
  if (status === 'BLOCKED') return '🚫'
  if (status === 'CHECKPOINT_WAIT') return '🚧'
  if (isInJail.value) return '⛓️'
  
  return ''
})
</script>

<style scoped>
.player-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  border: 2px solid transparent;
  padding: 12px;
  transition: all 0.2s;
}

.player-card.current {
  border-color: #4ecdc4;
  box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
}

.player-card.bankrupt {
  opacity: 0.5;
  filter: grayscale(50%);
}

.player-card.inJail {
  border-color: #f59e0b;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.player-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid;
  overflow: hidden;
  background: #2d3a4f;
}

.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.faction-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #1a1a2e;
}

.faction-wei { background: #3b82f6; }
.faction-shu { background: #22c55e; }
.faction-wu { background: #ef4444; }
.faction-neutral { background: #6b7280; }

.player-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  display: block;
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-hero {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.player-indicators {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.indicator {
  font-size: 10px;
}

.indicator.current-turn {
  color: #4ecdc4;
  animation: pulse 1s infinite;
}

.indicator.online {
  color: #22c55e;
}

.indicator.ai {
  font-size: 14px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.money-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.money-icon {
  font-size: 16px;
}

.money-value {
  font-size: 18px;
  font-weight: bold;
  color: #fbbf24;
}

.money-unit {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.stats-row {
  display: flex;
  gap: 8px;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.stat-icon {
  font-size: 14px;
}

.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.status-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.effect-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.effect-badge.effect-negative {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.effect-badge.effect-positive {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.effect-badge.effect-neutral {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.effect-turns {
  font-size: 10px;
  font-weight: bold;
}

.special-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.special-status .status-icon {
  font-size: 16px;
}

.special-status .status-text {
  font-size: 12px;
  color: #f59e0b;
}
</style>
