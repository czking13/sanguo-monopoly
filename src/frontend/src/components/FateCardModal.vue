<!-- ============================================
     天命卡展示弹窗 v1.1
     FE-117: 天命卡触发时的全屏展示
     ============================================ -->
<template>
  <Teleport to="body">
    <Transition name="fate-card">
      <div class="fate-card-modal" v-if="visible && card">
        <div class="modal-backdrop" @click="handleClose">
          <div class="card-container" @click.stop>
            <!-- 卡牌主体 -->
            <div class="fate-card" :class="cardRarity">
              <!-- 卡牌头部 -->
              <div class="card-header">
                <span class="card-type">📜 天命</span>
                <span class="card-rarity" :class="cardRarity">
                  {{ rarityLabel }}
                </span>
              </div>
              
              <!-- 卡牌图标 -->
              <div class="card-icon">
                <span class="icon">{{ getCardIcon(card.effect) }}</span>
              </div>
              
              <!-- 卡牌名称 -->
              <h2 class="card-name">{{ card.name }}</h2>
              
              <!-- 卡牌描述 -->
              <p class="card-description">{{ card.description }}</p>
              
              <!-- 效果类型指示 -->
              <div class="effect-indicator" :class="effectType">
                <span class="effect-icon">{{ effectIcon }}</span>
                <span class="effect-text">{{ effectText }}</span>
              </div>
              
              <!-- 历史典故 -->
              <div class="card-lore" v-if="cardLore">
                <p>"{{ cardLore }}"</p>
              </div>
            </div>
            
            <!-- 确认按钮 -->
            <button class="confirm-btn" @click="handleClose">
              {{ isPositive ? '确定' : '接受命运' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '../types'

const props = defineProps<{
  visible: boolean
  card: Card | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 卡牌稀有度
const cardRarity = computed(() => {
  return props.card?.rarity || 'common'
})

// 稀有度标签
const rarityLabel = computed(() => {
  const labels: Record<string, string> = {
    'common': '普通',
    'rare': '稀有',
    'legendary': '传说'
  }
  return labels[cardRarity.value] || '普通'
})

// 效果类型
const effectType = computed(() => {
  if (!props.card) return 'neutral'
  
  const effect = props.card.effect
  
  // 正面效果
  const positiveEffects = ['gainMoney', 'drawFreeCard', 'freeCity', 'collectFromAll', 'alliance', 'moveToChance']
  // 负面效果
  const negativeEffects = ['loseMoney', 'goToPrison', 'skipTurns', 'loseRandomCity', 'moveBack']
  
  if (positiveEffects.includes(effect)) return 'positive'
  if (negativeEffects.includes(effect)) return 'negative'
  return 'neutral'
})

// 是否正面效果
const isPositive = computed(() => effectType.value === 'positive')

// 效果图标
const effectIcon = computed(() => {
  switch (effectType.value) {
    case 'positive': return '✨'
    case 'negative': return '💀'
    default: return '⚖️'
  }
})

// 效果文本
const effectText = computed(() => {
  switch (effectType.value) {
    case 'positive': return '好运降临'
    case 'negative': return '厄运当头'
    default: return '命运无常'
  }
})

// 卡牌图标
const getCardIcon = (effect: string): string => {
  const icons: Record<string, string> = {
    'gainMoney': '💰',
    'loseMoney': '💸',
    'goToPrison': '⛓️',
    'drawFreeCard': '🎴',
    'freeCity': '🏰',
    'collectFromAll': '🤝',
    'alliance': '🤝',
    'allRandomMove': '🎲',
    'regionTollDouble': '🔥',
    'removeDebuffs': '💊',
    'ownCitiesTollDouble': '⚔️',
    'skipTurns': '😴',
    'loseRandomCity': '💥',
    'moveBack': '🔙',
    'moveAndBuyCity': '🏃',
    'moveToChance': '🎯'
  }
  return icons[effect] || '📜'
}

// 历史典故
const cardLore = computed(() => {
  if (!props.card) return ''
  
  const lores: Record<string, string> = {
    'sangumaolu': '刘备三顾茅庐，得卧龙出山',
    'qiqinmenghuo': '七擒七纵，南蛮归心',
    'caochuanjiejian_tm': '大雾垂江，曹军乱箭齐发',
    'kongchengtuidi': '司马懿疑有伏兵，仓皇退去',
    'taoyuanjieyi': '桃园三结义，生死与共',
    'dandaohui': '关云长单刀赴会，英雄盖世',
    'wangmeizhike': '前方有梅林，将士们加油',
    'chibizhizhan': '赤壁一把火，烧尽曹军百万',
    'huoshaolianying': '陆逊火烧连营七百里',
    'guaguliaodu': '华佗刮骨疗毒，关公神威盖世',
    'weizhenhuaxia': '关云长威震华夏，谁敢争锋',
    'jugongjinchui': '鞠躬尽瘁，死而后已',
    'wangfengertao': '敌军势大，且退且走',
    'tianzairenhuo': '天降灾祸，在所难免',
    'dayishijingzhou': '关羽大意失荆州，悔之晚矣',
    'lebusisu': '此间乐，不思蜀',
    'baizouhuarong': '曹孟德败走华容道'
  }
  
  return lores[props.card.id.split('_')[0]] || ''
})

// 关闭处理
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.fate-card-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4000;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.fate-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 32px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  border: 3px solid transparent;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.fate-card.common {
  border-color: rgba(255, 255, 255, 0.2);
}

.fate-card.rare {
  border-color: #a855f7;
  box-shadow: 0 20px 60px rgba(168, 85, 247, 0.3);
}

.fate-card.legendary {
  border-color: #fbbf24;
  box-shadow: 0 20px 60px rgba(251, 191, 36, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-type {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-rarity {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.card-rarity.common {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.card-rarity.rare {
  background: rgba(168, 85, 247, 0.2);
  color: #a855f7;
}

.card-rarity.legendary {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.card-icon {
  margin-bottom: 20px;
}

.card-icon .icon {
  font-size: 64px;
  display: inline-block;
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.card-name {
  margin: 0 0 16px;
  font-size: 28px;
  color: white;
  font-weight: bold;
}

.card-description {
  margin: 0 0 20px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.effect-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 20px;
  margin-bottom: 20px;
}

.effect-indicator.positive {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.effect-indicator.negative {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.effect-indicator.neutral {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.effect-icon {
  font-size: 18px;
}

.effect-text {
  font-size: 14px;
  font-weight: bold;
}

.card-lore {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border-left: 3px solid rgba(255, 255, 255, 0.2);
}

.card-lore p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

.confirm-btn {
  padding: 14px 48px;
  background: linear-gradient(135deg, #4ecdc4 0%, #45b7aa 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-btn:hover {
  transform: scale(1.05);
}

/* 过渡动画 */
.fate-card-enter-active {
  animation: cardIn 0.4s ease-out;
}

.fate-card-leave-active {
  animation: cardOut 0.3s ease-in;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes cardOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}
</style>
