<!-- ============================================
     B类卡响应面板 v1.1
     FE-108: 空城计/借刀杀人 同时可用时弹出选择
     ============================================ -->
<template>
  <div class="card-response-modal" v-if="visible">
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>🎴 是否使用锦囊卡？</h3>
          <p class="subtitle">过路费 {{ currentToll }} 金</p>
        </div>
        
        <div class="modal-body">
          <div class="available-cards" v-if="availableCards.length > 0">
            <div
              v-for="card in availableCards"
              :key="card.id"
              class="response-card"
              :class="{ selected: selectedCardId === card.id }"
              @click="handleSelectCard(card)"
            >
              <span class="card-icon">🎴</span>
              <div class="card-info">
                <p class="card-name">{{ card.name }}</p>
                <p class="card-effect">{{ getCardEffect(card) }}</p>
              </div>
              <div class="card-select-indicator" v-if="selectedCardId === card.id">✓</div>
            </div>
          </div>
          <div class="no-cards" v-else>
            没有可用的锦囊卡
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="timeout-info">
            <div class="timeout-bar">
              <div class="timeout-progress" :style="{ width: progressWidth + '%' }"></div>
            </div>
            <span class="timeout-text">{{ Math.ceil(remainingTime / 1000) }}秒后自动跳过</span>
          </div>
          
          <div class="action-buttons">
            <button class="btn-skip" @click="handleSkip">直接支付</button>
            <button 
              class="btn-use" 
              :disabled="!selectedCardId"
              @click="handleUse"
            >
              使用卡牌
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import type { Card, Player } from '../types'
import { getCardById } from '../data/cards'

const props = defineProps<{
  visible: boolean
  availableCards: Card[]
  currentToll: number
  players: Player[]
  currentUserId: string
  timeout?: number // 毫秒
}>()

const emit = defineEmits<{
  (e: 'useCard', cardId: string): void
  (e: 'skip'): void
}>()

const selectedCardId = ref<string | null>(null)
const remainingTime = ref(0)
const totalDuration = computed(() => props.timeout || 10000)
let timer: ReturnType<typeof setInterval> | null = null

// 计算进度条宽度
const progressWidth = computed(() => {
  if (remainingTime.value <= 0) return 0
  return Math.max(0, (remainingTime.value / totalDuration.value) * 100)
})

// 获取卡牌效果描述
const getCardEffect = (card: Card): string => {
  const cardIdBase = card.id.split('_')[0]
  switch (cardIdBase) {
    case 'kongchengji':
      return '完全免除此过路费'
    case 'jiedaosharen':
      return '让其他玩家代付过路费'
    default:
      return card.description || ''
  }
}

// 选择卡牌
const handleSelectCard = (card: Card) => {
  if (selectedCardId.value === card.id) {
    selectedCardId.value = null
  } else {
    selectedCardId.value = card.id
  }
}

// 使用卡牌
const handleUse = () => {
  if (selectedCardId.value) {
    emit('useCard', selectedCardId.value)
  }
}

// 跳过
const handleSkip = () => {
  emit('skip')
}

// 倒计时
watch(() => props.visible, (visible) => {
  if (visible && props.timeout) {
    remainingTime.value = props.timeout
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      remainingTime.value = Math.max(0, remainingTime.value - 100)
      if (remainingTime.value <= 0) {
        handleSkip()
      }
    }, 100)
  } else {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.card-response-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(1, 1, 15, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.modal-header {
  text-align: center;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: white;
}

.subtitle {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.modal-body {
  margin-bottom: 16px;
  min-height: 100px;
}

.available-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.response-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.response-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #a855f7;
}

.response-card.selected {
  border-color: #4ecdc4;
  background: rgba(78, 205, 196, 0.1);
}

.card-icon {
  font-size: 32px;
}

.card-info {
  flex: 1;
}

.card-info .card-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: bold;
  color: white;
}

.card-info .card-effect {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 202, 123, 0.8);
}

.card-select-indicator {
  width: 24px;
  height: 24px;
  background: #4ecdc4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a2e;
  font-weight: bold;
}

.no-cards {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.5);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.timeout-info {
  flex: 1;
}

.timeout-bar {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.timeout-progress {
  height: 100%;
  background: #f59e0b;
  transition: width 0.1s linear;
}

.timeout-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-use {
  background: linear-gradient(135deg, #4ecdc4 0%, #45b7aa 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-use:hover:not(:disabled) {
  transform: scale(1.05);
}

.btn-use:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-skip {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-skip:hover {
  border-color: rgba(255, 255, 255, 0.5);
}
</style>
