<!-- ============================================
     手牌组件 v1.1
     FE-107: 锦囊卡 A/B 类分类显示
     FE-109: 手牌5张限制UI
     ============================================ -->
<template>
  <div class="hand-cards">
    <div class="hand-header">
      <h4>🎴 手牌</h4>
      <span class="card-count">{{ cards.length }}/{{ maxCards }}</span>
    </div>
    
    <div class="cards-container">
      <!-- 空位显示 -->
      <div
        v-for="i in maxCards"
        :key="'slot-' + i"
        class="card-slot"
        :class="{ empty: i > cards.length }"
      >
        <div
          v-if="cards[i - 1]"
          class="card"
          :class="{
            'type-a': cards[i - 1].useType === 'A',
            'type-b': cards[i - 1].useType === 'B',
            'tianming': cards[i - 1].type === '天命',
            'usable': canUseCard(cards[i - 1]),
            'disabled': !canUseCard(cards[i - 1])
          }"
          @click="handleCardClick(cards[i - 1])"
        >
          <div class="card-header">
            <span class="card-type-badge" :class="cards[i - 1].useType || 'tianming'">
              {{ cards[i - 1].useType === 'A' ? '主动' : cards[i - 1].useType === 'B' ? '响应' : '天命' }}
            </span>
            <span class="card-name">{{ cards[i - 1].name }}</span>
          </div>
          <div class="card-body">
            <p class="card-desc">{{ cards[i - 1].description }}</p>
          </div>
          <div class="card-footer" v-if="cards[i - 1].rarity">
            <span class="rarity" :class="cards[i - 1].rarity">
              {{ getRarityIcon(cards[i - 1].rarity) }}
            </span>
          </div>
        </div>
        <div v-else class="empty-slot">
          <span class="plus-icon">+</span>
        </div>
      </div>
    </div>
    
    <!-- 使用提示 -->
    <div class="hand-hint" v-if="selectedCard">
      <p>点击「使用卡牌」按钮使用 {{ selectedCard.name }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Card, TurnPhase } from '../types'

const props = defineProps<{
  cards: Card[]
  currentPhase: TurnPhase
  isMyTurn: boolean
  maxCards?: number
}>()

const emit = defineEmits<{
  (e: 'useCard', cardId: string): void
  (e: 'selectCard', card: Card | null): void
}>()

const maxCards = computed(() => props.maxCards || 5)
const selectedCard = ref<Card | null>(null)

// 判断卡牌是否可以使用
const canUseCard = (card: Card): boolean => {
  if (!props.isMyTurn) return false
  
  // 天命卡不能主动使用
  if (card.type === '天命') return false
  
  // A类卡：只能在 CARD_ACTION 阶段使用
  if (card.useType === 'A') {
    return props.currentPhase === 'CARD_ACTION'
  }
  
  // B类卡：不能主动使用，需要响应触发
  if (card.useType === 'B') {
    return false // B类卡通过弹窗触发，不在这里显示为可用
  }
  
  return false
}

// 获取稀有度图标
const getRarityIcon = (rarity: string): string => {
  const icons: Record<string, string> = {
    common: '⭐',
    rare: '💎',
    legendary: '👑'
  }
  return icons[rarity] || ''
}

// 点击卡牌
const handleCardClick = (card: Card) => {
  if (!canUseCard(card)) {
    // 显示不可用提示
    return
  }
  
  if (selectedCard.value?.id === card.id) {
    // 取消选择
    selectedCard.value = null
    emit('selectCard', null)
  } else {
    // 选择卡牌
    selectedCard.value = card
    emit('selectCard', card)
  }
}
</script>

<style scoped>
.hand-cards {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 12px;
}

.hand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.hand-header h4 {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.card-count {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.cards-container {
  display: flex;
  gap: 8px;
}

.card-slot {
  flex: 1;
  min-width: 0;
}

.empty-slot {
  height: 120px;
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.2);
}

.plus-icon {
  font-size: 24px;
}

.card {
  height: 120px;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card.type-a {
  background: linear-gradient(135deg, #2d3a4f 0%, #1a2332 100%);
  border: 1px solid #4ecdc4;
}

.card.type-b {
  background: linear-gradient(135deg, #3a2d4f 0%, #231a32 100%);
  border: 1px solid #a855f7;
}

.card.tianming {
  background: linear-gradient(135deg, #4f3a2d 0%, #322a1a 100%);
  border: 1px solid #f59e0b;
}

.card.usable:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.card-type-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}

.card-type-badge.A {
  background: #4ecdc4;
  color: #1a1a2e;
}

.card-type-badge.B {
  background: #a855f7;
  color: white;
}

.card-type-badge.tianming {
  background: #f59e0b;
  color: #1a1a2e;
}

.card-name {
  font-size: 12px;
  font-weight: bold;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-body {
  flex: 1;
  overflow: hidden;
}

.card-desc {
  margin: 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.rarity {
  font-size: 12px;
}

.rarity.common {
  color: #9ca3af;
}

.rarity.rare {
  color: #60a5fa;
}

.rarity.legendary {
  color: #fbbf24;
}

.hand-hint {
  margin-top: 8px;
  padding: 8px;
  background: rgba(78, 205, 196, 0.1);
  border-radius: 6px;
  text-align: center;
}

.hand-hint p {
  margin: 0;
  font-size: 12px;
  color: #4ecdc4;
}
</style>
