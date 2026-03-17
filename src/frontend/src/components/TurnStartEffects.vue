<!-- ============================================
     回合开始效果提示 v1.1
     FE-103: 显示回合开始时的各种效果
     ============================================ -->
<template>
  <Transition name="slide-fade">
    <div class="turn-start-effects" v-if="visible && effects.length > 0">
      <div class="effects-container">
        <div class="effects-header">
          <span class="phase-icon">🌅</span>
          <h3>回合开始</h3>
        </div>
        
        <div class="effects-list">
          <div 
            v-for="(effect, index) in effects" 
            :key="index"
            class="effect-item"
            :class="effect.type"
          >
            <span class="effect-icon">{{ getEffectIcon(effect.type) }}</span>
            <div class="effect-content">
              <span class="effect-title">{{ effect.title }}</span>
              <span class="effect-desc">{{ effect.description }}</span>
            </div>
            <span 
              class="effect-value" 
              :class="{ positive: effect.value > 0, negative: effect.value < 0 }"
              v-if="effect.value !== undefined"
            >
              {{ effect.value > 0 ? '+' : '' }}{{ effect.value }}金
            </span>
          </div>
        </div>
        
        <div class="effects-footer">
          <button class="btn-confirm" @click="handleConfirm">
            确认
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface TurnStartEffect {
  type: 'income' | 'skill' | 'status' | 'jail' | 'checkpoint'
  title: string
  description: string
  value?: number
}

const props = defineProps<{
  visible: boolean
  effects: TurnStartEffect[]
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

const getEffectIcon = (type: string): string => {
  const icons: Record<string, string> = {
    income: '💰',
    skill: '⚔️',
    status: '✨',
    jail: '⛓️',
    checkpoint: '🚧'
  }
  return icons[type] || '📢'
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style scoped>
.turn-start-effects {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
}

.effects-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 24px;
  min-width: 360px;
  max-width: 480px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.effects-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.phase-icon {
  font-size: 28px;
}

.effects-header h3 {
  margin: 0;
  font-size: 20px;
  color: white;
}

.effects-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.effect-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 3px solid;
}

.effect-item.income { border-color: #fbbf24; }
.effect-item.skill { border-color: #a855f7; }
.effect-item.status { border-color: #4ecdc4; }
.effect-item.jail { border-color: #f59e0b; }
.effect-item.checkpoint { border-color: #6b7280; }

.effect-icon {
  font-size: 24px;
}

.effect-content {
  flex: 1;
}

.effect-title {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: white;
  margin-bottom: 2px;
}

.effect-desc {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.effect-value {
  font-size: 16px;
  font-weight: bold;
}

.effect-value.positive { color: #4ecdc4; }
.effect-value.negative { color: #ef4444; }

.effects-footer {
  display: flex;
  justify-content: center;
}

.btn-confirm {
  padding: 12px 40px;
  background: linear-gradient(135deg, #4ecdc4 0%, #45b7aa 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover {
  transform: scale(1.05);
}

/* 动画 */
.slide-fade-enter-active {
  animation: slideIn 0.3s ease-out;
}

.slide-fade-leave-active {
  animation: slideOut 0.2s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
}
</style>
