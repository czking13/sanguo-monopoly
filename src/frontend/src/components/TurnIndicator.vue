<!-- ============================================
     回合状态指示器 v1.1
     FE-101: 显示当前回合步骤（8步）
     ============================================ -->
<template>
  <div class="turn-indicator">
    <div class="turn-header">
      <span class="turn-number">回合 {{ globalTurn }}</span>
      <span class="player-name" :style="{ color: currentPlayer?.color }">
        {{ currentPlayer?.name }} 的回合
      </span>
    </div>
    
    <!-- 8步状态条 -->
    <div class="phase-steps">
      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="step"
        :class="{
          active: currentPhase === step.id,
          completed: isCompleted(step.id),
          upcoming: isUpcoming(step.id)
        }"
      >
        <div class="step-dot">{{ index + 1 }}</div>
        <span class="step-label">{{ step.label }}</span>
      </div>
    </div>
    
    <!-- 当前阶段说明 -->
    <div class="phase-description" v-if="currentPhaseDescription">
      <span class="phase-icon">{{ currentPhaseIcon }}</span>
      <span>{{ currentPhaseDescription }}</span>
    </div>
    
    <!-- 倒计时 -->
    <div class="timeout-bar" v-if="remainingTime !== null && remainingTime > 0">
      <div 
        class="timeout-progress" 
        :style="{ 
          width: `${(remainingTime / maxTimeout) * 100}%`,
          backgroundColor: timeoutColor
        }"
      ></div>
      <span class="timeout-text">{{ Math.ceil(remainingTime / 1000) }}s</span>
    </div>
    
    <!-- 加速模式标识 -->
    <div class="speed-mode" v-if="isSpeedMode">
      <span class="speed-icon">⚡</span>
      <span>加速模式</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TurnPhase, Player } from '../types'

const props = defineProps<{
  currentPhase: TurnPhase
  globalTurn: number
  currentPlayer: Player | null
  remainingTime: number | null
  maxTimeout: number
  isSpeedMode: boolean
}>()

// 8步定义
const steps = [
  { id: 'TURN_START', label: '开始' },
  { id: 'LOCKED', label: '检查' },
  { id: 'ROLL_DICE', label: '掷骰' },
  { id: 'MOVING', label: '移动' },
  { id: 'LANDING', label: '落地' },
  { id: 'CARD_ACTION', label: '用卡' },
  { id: 'UPGRADE_ACTION', label: '升级' },
  { id: 'TURN_END', label: '结束' },
]

// 阶段顺序
const phaseOrder: TurnPhase[] = [
  'TURN_START',
  'LOCKED',
  'JAIL_ACTION',
  'ROLL_DICE',
  'MOVING',
  'LANDING',
  'CARD_ACTION',
  'UPGRADE_ACTION',
  'TURN_END'
]

// 判断阶段是否已完成
const isCompleted = (phaseId: TurnPhase): boolean => {
  const currentIndex = phaseOrder.indexOf(props.currentPhase)
  const targetIndex = phaseOrder.indexOf(phaseId)
  return targetIndex < currentIndex
}

// 判断阶段是否未开始
const isUpcoming = (phaseId: TurnPhase): boolean => {
  const currentIndex = phaseOrder.indexOf(props.currentPhase)
  const targetIndex = phaseOrder.indexOf(phaseId)
  return targetIndex > currentIndex && targetIndex !== -1
}

// 当前阶段说明
const currentPhaseDescription = computed(() => {
  const descriptions: Record<TurnPhase, string> = {
    'TURN_START': '正在结算持续效果...',
    'LOCKED': '检查玩家状态',
    'JAIL_ACTION': '请选择出狱方式',
    'ROLL_DICE': '请掷骰子',
    'MOVING': '棋子移动中...',
    'LANDING': '结算格子效果',
    'CARD_ACTION': '是否使用锦囊卡？',
    'UPGRADE_ACTION': '是否升级城池？',
    'TURN_END': '回合即将结束'
  }
  return descriptions[props.currentPhase] || ''
})

// 当前阶段图标
const currentPhaseIcon = computed(() => {
  const icons: Record<TurnPhase, string> = {
    'TURN_START': '🔄',
    'LOCKED': '🔍',
    'JAIL_ACTION': '🔓',
    'ROLL_DICE': '🎲',
    'MOVING': '🏃',
    'LANDING': '📍',
    'CARD_ACTION': '🎴',
    'UPGRADE_ACTION': '⬆️',
    'TURN_END': '✅'
  }
  return icons[props.currentPhase] || ''
})

// 倒计时颜色
const timeoutColor = computed(() => {
  if (!props.remainingTime) return '#4ecdc4'
  const ratio = props.remainingTime / props.maxTimeout
  if (ratio > 0.5) return '#4ecdc4'
  if (ratio > 0.25) return '#ffd93d'
  return '#ff6b6b'
})
</script>

<style scoped>
.turn-indicator {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.turn-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.turn-number {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.player-name {
  font-size: 16px;
  font-weight: bold;
}

.phase-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.3s;
}

.step.completed .step-dot {
  background: #4ecdc4;
  color: white;
}

.step.active .step-dot {
  background: #e94560;
  color: white;
  transform: scale(1.2);
  box-shadow: 0 0 12px rgba(233, 69, 96, 0.5);
}

.step-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.step.active .step-label {
  color: #e94560;
  font-weight: bold;
}

.phase-description {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(233, 69, 96, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
}

.phase-icon {
  font-size: 20px;
}

.timeout-bar {
  position: relative;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-top: 12px;
  overflow: hidden;
}

.timeout-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.1s linear;
  border-radius: 12px;
}

.timeout-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.speed-mode {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #ffd93d 0%, #ff9500 100%);
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: bold;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.speed-icon {
  font-size: 18px;
}
</style>
