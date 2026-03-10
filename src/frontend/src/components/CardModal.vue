<template>
  <div class="card-modal" v-if="visible" @click.self="close">
    <div class="card-content">
      <div class="card-header" :class="card?.type">
        <span class="card-type">{{ card?.type }}</span>
        <h3>{{ card?.name }}</h3>
      </div>
      
      <div class="card-body">
        <p class="card-desc">{{ card?.description }}</p>
        
        <!-- 选择目标玩家 -->
        <div v-if="needTarget" class="target-select">
          <h4>选择目标：</h4>
          <div class="player-list">
            <button 
              v-for="player in targets" 
              :key="player.id"
              :class="['player-btn', { selected: selectedTarget === player.id }]"
              @click="selectedTarget = player.id"
            >
              {{ player.name }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="card-actions">
        <button class="btn-use" @click="useCard" :disabled="needTarget && !selectedTarget">
          使用
        </button>
        <button class="btn-cancel" @click="close">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Card, Player } from '../types'

const props = defineProps<{
  visible: boolean
  card: Card | null
  players: Player[]
  myId: string
}>()

const emit = defineEmits<{
  use: [cardId: string, targetId?: string]
  close: []
}>()

const selectedTarget = ref<string | null>(null)

// 需要选择目标的卡牌效果
const targetEffects = ['damage', 'skip_turn', 'steal_card', 'spy', 'steal_city', 'alliance']

const needTarget = computed(() => 
  props.card && targetEffects.includes(props.card.effect)
)

const targets = computed(() => 
  props.players.filter(p => p.id !== props.myId && !p.isBankrupt)
)

const useCard = () => {
  if (props.card) {
    emit('use', props.card.id, selectedTarget.value || undefined)
    selectedTarget.value = null
  }
}

const close = () => {
  selectedTarget.value = null
  emit('close')
}
</script>

<style scoped>
.card-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.card-content {
  background: var(--void-bg-card);
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  border: 2px solid var(--void-border);
}

.card-header {
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--void-border);
  margin-bottom: 16px;
}

.card-header.锦囊 {
  border-color: #f39c12;
}

.card-header.天命 {
  border-color: #9b59b6;
}

.card-type {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
}

.锦囊 .card-type {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}

.天命 .card-type {
  background: rgba(155, 89, 182, 0.2);
  color: #9b59b6;
}

.card-header h3 {
  margin: 0;
  font-size: 24px;
  color: var(--text-primary);
}

.card-desc {
  font-size: 16px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
}

.target-select {
  margin-top: 20px;
}

.target-select h4 {
  margin: 0 0 10px;
  color: var(--text-muted);
}

.player-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.player-btn {
  padding: 10px 20px;
  border-radius: 8px;
  background: var(--void-bg);
  border: 2px solid var(--void-border);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
}

.player-btn:hover {
  border-color: var(--neon-green);
}

.player-btn.selected {
  background: var(--neon-green);
  color: var(--void-bg);
  border-color: var(--neon-green);
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-use, .btn-cancel {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-use {
  background: linear-gradient(135deg, var(--neon-green), var(--neon-blue));
  color: var(--void-bg);
  border: none;
}

.btn-use:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--void-border);
  color: var(--text-secondary);
}
</style>
