<!-- ============================================
     过路费减免显示 v1.1
     FE-106: 显示刘备/夏侯惇的减免效果
     ============================================ -->
<template>
  <div class="toll-reduction-display" v-if="hasReduction">
    <div class="reduction-badge" :class="reductionType">
      <span class="reduction-icon">{{ reductionIcon }}</span>
      <div class="reduction-info">
        <span class="reduction-name">{{ reductionName }}</span>
        <span class="reduction-effect">{{ reductionEffect }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '../types'

const props = defineProps<{
  player: Player | null
  originalToll: number
  finalToll: number
}>()

// 是否有减免
const hasReduction = computed(() => {
  return props.originalToll > props.finalToll
})

// 减免类型
const reductionType = computed(() => {
  if (!props.player?.hero) return 'none'
  
  const effect = props.player.hero.skill.effect
  
  if (effect === 'tollDiscount') return 'liubei'      // 刘备
  if (effect === 'tollReduction') return 'xiahou'    // 夏侯惇
  if (effect === 'chainTollImmunity') return 'luxun' // 陆逊
  
  return 'other'
})

// 减免图标
const reductionIcon = computed(() => {
  switch (reductionType.value) {
    case 'liubei': return '👑'
    case 'xiahou': return '👁️'
    case 'luxun': return '🔥'
    default: return '🛡️'
  }
})

// 减免名称
const reductionName = computed(() => {
  switch (reductionType.value) {
    case 'liubei': return '刘备·仁德'
    case 'xiahou': return '夏侯惇·拔矢啖睛'
    case 'luxun': return '陆逊·火烧连营'
    default: return '减免效果'
  }
})

// 减免效果描述
const reductionEffect = computed(() => {
  const saved = props.originalToll - props.finalToll
  const percent = Math.round((saved / props.originalToll) * 100)
  
  return `减免 ${saved} 金 (${percent}%)`
})
</script>

<style scoped>
.toll-reduction-display {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

.reduction-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 20px;
  border: 2px solid;
  animation: floatIn 0.3s ease-out;
}

.reduction-badge.liubei {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.2);
}

.reduction-badge.xiahou {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.2);
}

.reduction-badge.luxun {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.reduction-badge.other {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.2);
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reduction-icon {
  font-size: 24px;
}

.reduction-info {
  display: flex;
  flex-direction: column;
}

.reduction-name {
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.reduction-effect {
  font-size: 10px;
  color: #4ecdc4;
}

/* 动画效果 */
.reduction-badge::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 24px;
  border: 2px solid currentColor;
  opacity: 0;
  animation: pulse-ring 1.5s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}
</style>
