<!-- ============================================
     骰子面板 v1.1
     FE-119: 掷骰子交互和结果显示
     ============================================ -->
<template>
  <div class="dice-panel">
    <div class="dice-container">
      <div 
        v-for="(die, index) in dice" 
        :key="index"
        class="die"
        :class="{ rolling: isRolling }"
      >
        <div class="die-face">
          <span class="die-value">{{ isRolling ? '?' : die }}</span>
        </div>
      </div>
    </div>
    
    <div class="dice-total" v-if="!isRolling && dice.length > 0">
      <span class="total-label">总计</span>
      <span class="total-value">{{ diceTotal }}</span>
    </div>
    
    <button 
      class="btn-roll"
      :disabled="!canRoll"
      @click="handleRoll"
    >
      <span class="roll-icon">🎲</span>
      <span class="roll-text">{{ rollButtonText }}</span>
    </button>
    
    <!-- 武将技能提示 -->
    <div class="skill-hints" v-if="hasRerollSkill">
      <span class="hint" @click="handleReroll">
        🔄 赵云·七进七出：重掷骰子
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '../types'

const props = defineProps<{
  dice: number[]
  isRolling: boolean
  canRoll: boolean
  currentPlayer: Player | null
}>()

const emit = defineEmits<{
  (e: 'roll'): void
  (e: 'reroll'): void
}>()

// 骰子总和
const diceTotal = computed(() => {
  return props.dice.reduce((a, b) => a + b, 0)
})

// 掷骰子按钮文字
const rollButtonText = computed(() => {
  if (props.isRolling) return '掷骰中...'
  if (props.dice.length > 0) return '已掷出'
  return '掷骰子'
})

// 是否有重掷技能
const hasRerollSkill = computed(() => {
  return props.currentPlayer?.hero?.skill.effect === 'rerollDice'
})

const handleRoll = () => {
  if (props.canRoll && !props.isRolling) {
    emit('roll')
  }
}

const handleReroll = () => {
  emit('reroll')
}
</script>

<style scoped>
.dice-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  min-width: 200px;
}

.dice-container {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.die {
  width: 64px;
  height: 64px;
  perspective: 300px;
}

.die-face {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.die.rolling .die-face {
  animation: diceRoll 0.1s linear infinite;
}

@keyframes diceRoll {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  25% { transform: rotateX(90deg) rotateY(90deg); }
  50% { transform: rotateX(180deg) rotateY(180deg); }
  75% { transform: rotateX(270deg) rotateY(270deg); }
  100% { transform: rotateX(360deg) rotateY(360deg); }
}

.die-value {
  font-size: 32px;
  font-weight: bold;
  color: #1a1a2e;
}

.dice-total {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.total-value {
  font-size: 24px;
  font-weight: bold;
  color: #fbbf24;
}

.btn-roll {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #4ecdc4 0%, #45b7aa 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-roll:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(78, 205, 196, 0.4);
}

.btn-roll:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.roll-icon {
  font-size: 24px;
}

.roll-text {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.skill-hints {
  margin-top: 8px;
}

.hint {
  display: inline-block;
  padding: 8px 16px;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 20px;
  font-size: 12px;
  color: #a855f7;
  cursor: pointer;
  transition: all 0.2s;
}

.hint:hover {
  background: rgba(168, 85, 247, 0.3);
  transform: scale(1.05);
}
</style>
